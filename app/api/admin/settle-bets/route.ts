import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

// Sport configurations for subdomains
const SPORT_CONFIGS: Record<string, { host: string; endpoint: string }> = {
  soccer: { host: 'v3.football.api-sports.io', endpoint: '/fixtures' },
  baseball: { host: 'v1.baseball.api-sports.io', endpoint: '/games' },
  basketball: { host: 'v1.basketball.api-sports.io', endpoint: '/games' },
  volleyball: { host: 'v1.volleyball.api-sports.io', endpoint: '/games' },
  handball: { host: 'v1.handball.api-sports.io', endpoint: '/games' },
  hockey: { host: 'v1.hockey.api-sports.io', endpoint: '/games' },
};

// Parser to normalize user betting selections
function parseSelection(selection: string) {
  const normalized = selection.trim().toLowerCase();
  
  // 1. Over/Under (예: "Over 2.5", "언더 1.5", "2.5 오버")
  if (normalized.includes('over') || normalized.includes('오버')) {
    const match = normalized.match(/[\d.]+/);
    if (match) return { type: 'over', value: parseFloat(match[0]) };
  }
  if (normalized.includes('under') || normalized.includes('언더')) {
    const match = normalized.match(/[\d.]+/);
    if (match) return { type: 'under', value: parseFloat(match[0]) };
  }

  // 2. Asian Handicap (예: "Home -1.5", "원정 +0.5", "홈 -1")
  if (normalized.includes('home') || normalized.includes('홈')) {
    const match = normalized.match(/[-+]?[\d.]+/);
    if (match) return { type: 'handicap_home', value: parseFloat(match[0]) };
  }
  if (normalized.includes('away') || normalized.includes('원정')) {
    const match = normalized.match(/[-+]?[\d.]+/);
    if (match) return { type: 'handicap_away', value: parseFloat(match[0]) };
  }

  // 3. Match Winner (승무패)
  if (['home', '1', '홈', '홈승'].includes(normalized)) {
    return { type: 'winner', value: 'home' };
  }
  if (['away', '2', '원정', '원정승'].includes(normalized)) {
    return { type: 'winner', value: 'away' };
  }
  if (['draw', 'x', '무', '무승부'].includes(normalized)) {
    return { type: 'winner', value: 'draw' };
  }

  // Fallback
  return { type: 'unknown', value: selection };
}

// Evaluates the result of a bet
function evaluateOutcome(parsed: any, homeScore: number, awayScore: number): 'won' | 'lost' | 'void' {
  const totalGoals = homeScore + awayScore;
  
  switch (parsed.type) {
    case 'winner':
      if (parsed.value === 'home') return homeScore > awayScore ? 'won' : 'lost';
      if (parsed.value === 'away') return awayScore > homeScore ? 'won' : 'lost';
      if (parsed.value === 'draw') return homeScore === awayScore ? 'won' : 'lost';
      break;
      
    case 'over':
      return totalGoals > parsed.value ? 'won' : 'lost';
      
    case 'under':
      return totalGoals < parsed.value ? 'won' : 'lost';
      
    case 'handicap_home':
      return (homeScore + parsed.value) > awayScore ? 'won' : 'lost';
      
    case 'handicap_away':
      return (awayScore + parsed.value) > homeScore ? 'won' : 'lost';
  }
  
  return 'void'; // Fallback to void (stake refund) if parsing is unclear
}

export async function POST(request: NextRequest) {
  try {
    const { env } = getCloudflareContext();
    const db = env.DB as any;

    const apiKey = (env as any).APISPORTS_KEY || process.env.APISPORTS_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'API-Sports key is missing' }, { status: 500 });
    }

    // 1. Fetch pending virtual bets
    const { results: pendingBets } = await db.prepare(`
      SELECT * FROM betting_records 
      WHERE isVirtual = 1 AND status = 'pending'
    `).all();

    if (!pendingBets || pendingBets.length === 0) {
      return NextResponse.json({ success: true, message: '정산할 대기 중인 가상 배팅이 없습니다.' });
    }

    // Cache for API-Sports fetches to avoid double querying the same match in this run
    const matchCache: Record<string, { finished: boolean; status: string; scores: { home: number; away: number } | null }> = {};

    // Helper to fetch match status
    const getMatchData = async (sport: string, matchId: string) => {
      const cacheKey = `${sport}-${matchId}`;
      if (matchCache[cacheKey]) {
        return matchCache[cacheKey];
      }

      const config = SPORT_CONFIGS[sport.toLowerCase()] || { host: `v1.${sport.toLowerCase()}.api-sports.io`, endpoint: '/games' };
      const url = `https://${config.host}${config.endpoint}?id=${matchId}`;

      try {
        const res = await fetch(url, {
          method: 'GET',
          headers: { 'x-apisports-key': apiKey },
          next: { revalidate: 0 }
        });

        if (!res.ok) return null;
        const data = await res.json();
        
        if (data.errors && Object.keys(data.errors).length > 0) {
          console.warn(`API-Sports fetch error for ${sport} matchId ${matchId}:`, data.errors);
          return null;
        }

        const matchInfo = data.response?.[0];
        if (!matchInfo) return null;

        const fixture = matchInfo.fixture || matchInfo.game || matchInfo;
        const status = fixture.status;
        const goals = matchInfo.goals || matchInfo.scores || { home: 0, away: 0 };

        const finishedCodes = ['FT', 'AET', 'PEN', 'POST', 'CANC', 'ABD', 'AWD', 'WO', 'AOT', 'F', 'END'];
        const isFinished = finishedCodes.includes(status.short?.toUpperCase());

        const homeScore = goals.home != null ? (typeof goals.home === 'object' ? goals.home.total ?? 0 : goals.home) : 0;
        const awayScore = goals.away != null ? (typeof goals.away === 'object' ? goals.away.total ?? 0 : goals.away) : 0;

        const result = {
          finished: isFinished,
          status: status.short,
          scores: { home: homeScore, away: awayScore }
        };

        matchCache[cacheKey] = result;
        return result;
      } catch (err) {
        console.error(`Fetch match data failed for ${sport} ${matchId}:`, err);
        return null;
      }
    };

    let settledCount = 0;
    const batchStatements: any[] = [];

    // 2. Loop and process each bet
    for (const bet of pendingBets) {
      // Use the match column value which is usually "HomeTeam vs AwayTeam" or similar
      const matchName = bet.match || "스포츠 경기";
      
      // If we don't have a valid match id, we cannot auto-settle (default to skip or manually set)
      // Note: We use the `league` or custom index if needed, but in our model, the fixture ID is stored in the `league` or parsed from match column in other tables. Wait, in betting_records:
      // In remote-migration-13.sql:
      // `match TEXT` is stored (which might be "Arsenal vs Chelsea" or matchId, wait! Let's check how the ID is stored).
      // Ah! In `POST /api/betting-records`:
      // `const { sport, league, match, market, selection, odds, stake, betDate } = await request.json();`
      // Wait, is there a match ID? No, the match ID was stored inside `match` or `league`? Or maybe we pass a matchId inside the API?
      // Wait! Let's look at `betting_records` table definition. It doesn't have a dedicated `matchId` column, but in `user_bets` we have `matchId TEXT NOT NULL`.
      // Wait, where is the API-Sports match ID stored in `betting_records`?
      // In `remote-migration-6.sql` we had `user_bets.matchId`.
      // Let's check if the fixture ID was stored in `league` or `match` or somewhere.
      // Wait, in `POST /api/betting-records` line 30:
      // `.bind(userId, sport, league || null, match || null, market, selection, odds, stake, betDate)`
      // Let's search the codebase for `betting-records` submission. We found no results of frontend POSTing to `/api/betting-records` earlier.
      // That means we can define how it is sent!
      // In our virtual betting page, we will submit `match` as `Match Name` (e.g., "Arsenal vs Chelsea"), but we can store the API-Sports match ID in the `match` field or we can alter the table to store `matchId`!
      // Wait! Altering `betting_records` to add `matchId` is incredibly clean!
      // But wait, our `remote-migration-17.sql` was already executed! Can we add a column `matchId` to `betting_records`?
      // Wait, we can add a column using `ALTER TABLE betting_records ADD COLUMN matchId TEXT;` in another migration, or we can just alter it now!
      // Let's see: yes! Let's run a command to add `matchId` to `betting_records` just in case, or we can write a migration.
      // Wait, can we execute a sql statement directly on local database to add it? Yes!
      // `npx wrangler d1 execute pinnacle_db --local --command="ALTER TABLE betting_records ADD COLUMN matchId TEXT;"`
      // This is extremely easy! Let's do that.
      // But first, let's write `/api/admin/settle-bets` to expect `bet.matchId`!
      // Wait, where is `matchId` stored? If `betting_records` has a `matchId` column, it's perfect!
      // Let's make sure our code uses `bet.matchId` to fetch the match from API-Sports.
      
      const matchId = bet.matchId || bet.league; // Fallback to league if matchId is missing (or let's make sure it's matchId)
      if (!matchId) continue;

      const matchData = await getMatchData(bet.sport, matchId);
      if (!matchData) continue;

      // If the match is not finished yet, skip settlement
      if (!matchData.finished) continue;

      const { status: matchStatus, scores } = matchData;

      if (['CANC', 'POST', 'ABD'].includes(matchStatus?.toUpperCase())) {
        // Canceled / Postponed / Abandoned -> Void Bet (Refund Stake)
        const refundAmount = bet.stake;
        
        batchStatements.push(
          db.prepare('UPDATE betting_records SET status = "void", resultAmount = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
            .bind(refundAmount, bet.id)
        );
        batchStatements.push(
          db.prepare('UPDATE users SET betMoney = betMoney + ? WHERE id = ?').bind(refundAmount, bet.userId)
        );
        batchStatements.push(
          db.prepare('INSERT INTO bet_money_logs (userId, amount, reason, referenceId) VALUES (?, ?, "bet_refund_void", ?)')
            .bind(bet.userId, refundAmount, bet.id)
        );
        batchStatements.push(
          db.prepare('INSERT INTO notifications (userId, type, title, body) VALUES (?, "system", ?, ?)')
            .bind(
              bet.userId, 
              `ℹ️ 가상 배팅 적특/취소 (+${refundAmount.toLocaleString()} VP)`,
              `[${matchName}] 경기가 취소 또는 중단되어 배팅액이 원금 환급되었습니다.`
            )
        );
        settledCount++;
      } else if (scores) {
        // Finished match -> Evaluate won/lost
        const parsed = parseSelection(bet.selection);
        const outcome = evaluateOutcome(parsed, scores.home, scores.away);

        if (outcome === 'won') {
          // Calculate winnings
          let winnings = bet.stake * bet.odds;
          let boostText = "";
          
          if (bet.appliedItem === 'odds_booster') {
            winnings = bet.stake * bet.odds * 1.10; // Apply 10% boost
            boostText = " (배당 부스터 +10% 적용)";
          }

          // Net profit to add to activity score (increases Level!)
          const netProfit = Math.max(0, Math.floor(winnings - bet.stake));

          batchStatements.push(
            db.prepare('UPDATE betting_records SET status = "won", resultAmount = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
              .bind(winnings, bet.id)
          );
          batchStatements.push(
            db.prepare('UPDATE users SET betMoney = betMoney + ?, score = score + ? WHERE id = ?')
              .bind(winnings, netProfit, bet.userId)
          );
          batchStatements.push(
            db.prepare('INSERT INTO bet_money_logs (userId, amount, reason, referenceId) VALUES (?, ?, "bet_win", ?)')
              .bind(bet.userId, winnings, bet.id)
          );
          batchStatements.push(
            db.prepare('INSERT INTO notifications (userId, type, title, body) VALUES (?, "system", ?, ?)')
              .bind(
                bet.userId,
                `🎉 가상 배팅 적중! (+${winnings.toLocaleString()} VP)`,
                `[${matchName}] 경기에 배팅하신 [${bet.selection}] 픽이 적중했습니다.${boostText} 축하합니다! (+${netProfit.toLocaleString()} 활동점수)`
              )
          );
          settledCount++;
        } else if (outcome === 'lost') {
          // Lost bet
          let refundAmount = 0;
          let insuranceText = "";

          if (bet.appliedItem === 'bet_insurance') {
            refundAmount = Math.floor(bet.stake * 0.50); // Refund 50%
            insuranceText = " (배팅 보험 적용으로 50% 환급)";
          }

          batchStatements.push(
            db.prepare('UPDATE betting_records SET status = "lost", resultAmount = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
              .bind(refundAmount, bet.id)
          );

          if (refundAmount > 0) {
            batchStatements.push(
              db.prepare('UPDATE users SET betMoney = betMoney + ? WHERE id = ?').bind(refundAmount, bet.userId)
            );
            batchStatements.push(
              db.prepare('INSERT INTO bet_money_logs (userId, amount, reason, referenceId) VALUES (?, ?, "bet_refund_insurance", ?)')
                .bind(bet.userId, refundAmount, bet.id)
            );
            batchStatements.push(
              db.prepare('INSERT INTO notifications (userId, type, title, body) VALUES (?, "system", ?, ?)')
                .bind(
                  bet.userId,
                  `🛡️ 배팅 보험 작동 (+${refundAmount.toLocaleString()} VP)`,
                  `[${matchName}] 경기에 배팅하신 [${bet.selection}] 픽이 미적중했으나, 보험 카드로 50%가 환급되었습니다.`
                )
            );
          } else {
            batchStatements.push(
              db.prepare('INSERT INTO notifications (userId, type, title, body) VALUES (?, "system", ?, ?)')
                .bind(
                  bet.userId,
                  `😢 가상 배팅 미적중`,
                  `[${matchName}] 경기에 배팅하신 [${bet.selection}] 픽이 미적중했습니다. 다음 기회에 도전해 보세요!`
                )
            );
          }
          settledCount++;
        } else {
          // Outcome is void (parsing error fallback) -> Void Bet (Refund Stake)
          const refundAmount = bet.stake;
          
          batchStatements.push(
            db.prepare('UPDATE betting_records SET status = "void", resultAmount = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
              .bind(refundAmount, bet.id)
          );
          batchStatements.push(
            db.prepare('UPDATE users SET betMoney = betMoney + ? WHERE id = ?').bind(refundAmount, bet.userId)
          );
          batchStatements.push(
            db.prepare('INSERT INTO bet_money_logs (userId, amount, reason, referenceId) VALUES (?, ?, "bet_refund_void", ?)')
              .bind(bet.userId, refundAmount, bet.id)
          );
          batchStatements.push(
            db.prepare('INSERT INTO notifications (userId, type, title, body) VALUES (?, "system", ?, ?)')
              .bind(
                bet.userId,
                `ℹ️ 배팅 취소/적특 처리 (+${refundAmount.toLocaleString()} VP)`,
                `[${matchName}] 경기에 대한 배팅 결과 판정이 어려워 베팅액이 원금 환급되었습니다.`
              )
          );
          settledCount++;
        }
      }
    }

    // 3. Execute batch D1 updates
    if (batchStatements.length > 0) {
      await db.batch(batchStatements);
    }

    return NextResponse.json({
      success: true,
      message: `성공적으로 ${settledCount}개의 대기 중인 가상 배팅을 정산 완료했습니다.`,
      settledCount
    });
  } catch (error: any) {
    console.error('Settle bets API error:', error);
    return NextResponse.json({ success: false, error: '배팅 정산 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
