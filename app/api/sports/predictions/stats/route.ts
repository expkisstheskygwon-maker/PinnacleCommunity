import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

const DEFAULT_STATS = {
  "AI 데이터봇 알파": { 
    winRate: 58, 
    recentHit: "4/10",
    bySport: {
      soccer: { winRate: 60, total: 10, hits: 6 },
      baseball: { winRate: 50, total: 10, hits: 5 },
      basketball: { winRate: 60, total: 10, hits: 6 }
    }
  },
  "AI 통계봇 베타": { 
    winRate: 62, 
    recentHit: "6/10",
    bySport: {
      soccer: { winRate: 65, total: 10, hits: 6 },
      baseball: { winRate: 60, total: 10, hits: 6 },
      basketball: { winRate: 60, total: 10, hits: 6 }
    }
  },
  "AI 밸류봇 감마": { 
    winRate: 51, 
    recentHit: "3/10",
    bySport: {
      soccer: { winRate: 50, total: 10, hits: 5 },
      baseball: { winRate: 50, total: 10, hits: 5 },
      basketball: { winRate: 50, total: 10, hits: 5 }
    }
  }
};

// Hit evaluation function matching backend and frontend logic
function isPredictionHit(pick: string, actualHome: number, actualAway: number, sport: string): boolean {
  const actualResult = actualHome > actualAway ? "홈 승" : actualHome < actualAway ? "원정 승" : "무승부";
  const pickLower = pick.toLowerCase();

  // 1. Simple match outcome
  if (pick.includes("홈 승") && actualResult === "홈 승") return true;
  if (pick.includes("원정 승") && actualResult === "원정 승") return true;
  if (pick.includes("무승부") && actualResult === "무승부") return true;

  // 2. Soccer double chance / advice matching
  if (sport === 'soccer') {
    if (actualResult === "홈 승" && (pickLower.includes("home") || pickLower.includes("1x"))) return true;
    if (actualResult === "원정 승" && (pickLower.includes("away") || pickLower.includes("x2"))) return true;
    if (actualResult === "무승부" && (pickLower.includes("draw") || pickLower.includes("1x") || pickLower.includes("x2"))) return true;
  }

  // 3. Over/Under matching (e.g. "언더/오버 2.5 오버")
  if (pick.includes("오버") || pick.includes("언더") || pickLower.includes("over") || pickLower.includes("under")) {
    const matchLine = pick.match(/(\d+(\.\d+)?)/);
    if (matchLine) {
      const line = parseFloat(matchLine[0]);
      const total = actualHome + actualAway;
      if ((pick.includes("오버") || pickLower.includes("over")) && total > line) return true;
      if ((pick.includes("언더") || pickLower.includes("under")) && total < line) return true;
    }
  }

  return false;
}

export async function GET(request: Request) {
  try {
    const { env } = getCloudflareContext();
    const db = env.DB as any;

    // 1. Check database cache first (TTL: 6 hours)
    try {
      const cached = await db.prepare('SELECT value, updatedAt FROM site_settings WHERE key = ?')
        .bind('ai_bot_stats')
        .first();

      if (cached) {
        const updatedAtTime = new Date(cached.updatedAt || Date.now()).getTime();
        if (Date.now() - updatedAtTime < 6 * 60 * 60 * 1000) {
          return NextResponse.json({ success: true, stats: JSON.parse(cached.value) });
        }
      }
    } catch (dbErr) {
      console.error("Cache read error:", dbErr);
    }

    // 2. Cache expired or not found: compute from real matches
    const origin = new URL(request.url).origin;
    const sports = ['soccer', 'baseball', 'basketball'];
    const finishedMatches: any[] = [];
    
    // Collect finished matches from the last 7 days until we have at least 20 matches
    let daysAgo = 1;
    while (finishedMatches.length < 20 && daysAgo <= 7) {
      // Calculate date YYYY-MM-DD
      const targetDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const dayMatchesList = await Promise.all(
        sports.map(async (sport) => {
          try {
            const res = await fetch(`${origin}/api/sports/matches?sport=${sport}&date=${targetDate}`);
            if (!res.ok) return [];
            const data = await res.json();
            return data.matches || [];
          } catch (e) {
            console.error(`Failed to fetch ${sport} matches for ${targetDate}`, e);
            return [];
          }
        })
      );

      const dayFinished = dayMatchesList.flat().filter((m: any) => m.finished);
      finishedMatches.push(...dayFinished);
      daysAgo++;
    }

    if (finishedMatches.length === 0) {
      return NextResponse.json({ success: true, stats: DEFAULT_STATS });
    }

    // Sort by id / date to keep it stable
    finishedMatches.sort((a, b) => b.id - a.id);
    const recentMatches = finishedMatches.slice(0, 20);

    // Fetch predictions for these matches
    const predictionResults = await Promise.all(
      recentMatches.map(async (match) => {
        try {
          const oddsQuery = match.odds 
            ? `&oddsH=${match.odds.h}&oddsD=${match.odds.d}&oddsA=${match.odds.a}` 
            : '';
          const res = await fetch(
            `${origin}/api/sports/predictions?fixtureId=${match.id}&sport=${match.sport}&home=${encodeURIComponent(match.home)}&away=${encodeURIComponent(match.away)}${oddsQuery}`
          );
          if (!res.ok) return { match, predictions: [] };
          const data = await res.json();
          return { match, predictions: data.predictions || [] };
        } catch (e) {
          console.error(`Failed to fetch predictions for match ${match.id}`, e);
          return { match, predictions: [] };
        }
      })
    );

    // Calculate stats per bot
    interface BotRaw {
      total: number;
      hits: number;
      recentHits: number;
      recentTotal: number;
      bySport: Record<string, { total: number; hits: number }>;
    }

    const botStatsRaw: Record<string, BotRaw> = {
      "AI 데이터봇 알파": { 
        total: 0, hits: 0, recentHits: 0, recentTotal: 0,
        bySport: { soccer: { total: 0, hits: 0 }, baseball: { total: 0, hits: 0 }, basketball: { total: 0, hits: 0 } }
      },
      "AI 통계봇 베타": { 
        total: 0, hits: 0, recentHits: 0, recentTotal: 0,
        bySport: { soccer: { total: 0, hits: 0 }, baseball: { total: 0, hits: 0 }, basketball: { total: 0, hits: 0 } }
      },
      "AI 밸류봇 감마": { 
        total: 0, hits: 0, recentHits: 0, recentTotal: 0,
        bySport: { soccer: { total: 0, hits: 0 }, baseball: { total: 0, hits: 0 }, basketball: { total: 0, hits: 0 } }
      }
    };

    predictionResults.forEach(({ match, predictions }) => {
      predictions.forEach((pred: any) => {
        const botName = pred.botName;
        if (botStatsRaw[botName]) {
          const hit = isPredictionHit(pred.pick, match.scores.home, match.scores.away, match.sport);
          
          botStatsRaw[botName].total += 1;
          if (hit) {
            botStatsRaw[botName].hits += 1;
          }

          // Accumulate by sport
          const sport = match.sport;
          if (botStatsRaw[botName].bySport[sport]) {
            botStatsRaw[botName].bySport[sport].total += 1;
            if (hit) {
              botStatsRaw[botName].bySport[sport].hits += 1;
            }
          }

          // Recent hit: out of the first 10 matches (most recent)
          if (botStatsRaw[botName].recentTotal < 10) {
            botStatsRaw[botName].recentTotal += 1;
            if (hit) {
              botStatsRaw[botName].recentHits += 1;
            }
          }
        }
      });
    });

    // Format stats
    const finalStats: Record<string, { winRate: number; recentHit: string; bySport: Record<string, { winRate: number; total: number; hits: number }> }> = {};
    Object.keys(botStatsRaw).forEach((botName) => {
      const raw = botStatsRaw[botName];
      const winRate = raw.total > 0 ? Math.round((raw.hits / raw.total) * 100) : DEFAULT_STATS[botName as keyof typeof DEFAULT_STATS].winRate;
      const recentHit = raw.recentTotal > 0 ? `${raw.recentHits}/${raw.recentTotal}` : DEFAULT_STATS[botName as keyof typeof DEFAULT_STATS].recentHit;
      
      const bySportFormatted: Record<string, { winRate: number; total: number; hits: number }> = {};
      Object.keys(raw.bySport).forEach((sport) => {
        const sportRaw = raw.bySport[sport];
        const defaultSportVal = DEFAULT_STATS[botName as keyof typeof DEFAULT_STATS].bySport[sport as 'soccer' | 'baseball' | 'basketball'];
        
        bySportFormatted[sport] = {
          winRate: sportRaw.total > 0 ? Math.round((sportRaw.hits / sportRaw.total) * 100) : defaultSportVal.winRate,
          total: sportRaw.total > 0 ? sportRaw.total : defaultSportVal.total,
          hits: sportRaw.total > 0 ? sportRaw.hits : defaultSportVal.hits
        };
      });

      finalStats[botName] = { winRate, recentHit, bySport: bySportFormatted };
    });

    // 3. Save to database cache
    try {
      await db.prepare('INSERT INTO site_settings (key, value, updatedAt) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = ?, updatedAt = CURRENT_TIMESTAMP')
        .bind('ai_bot_stats', JSON.stringify(finalStats), JSON.stringify(finalStats))
        .run();
    } catch (dbErr) {
      console.error("Cache write error:", dbErr);
    }

    return NextResponse.json({ success: true, stats: finalStats });
  } catch (error: any) {
    console.error("Failed to generate bot stats:", error);
    return NextResponse.json({ success: false, error: error.message, stats: DEFAULT_STATS });
  }
}
