// lib/sports.ts
// API-Sports 공통 로직 분리

export async function getTodayMatches(sport: string = 'soccer', providedApiKey?: string) {
  const apiKey = providedApiKey || process.env.APISPORTS_KEY;
  if (!apiKey) throw new Error('APISPORTS_KEY is missing');

  const today = new Date().toISOString().split('T')[0];
  let host = '';
  let endpoint = '';

  switch (sport) {
    case 'soccer':
    case 'all':
      host = 'v3.football.api-sports.io';
      endpoint = `/fixtures?date=${today}&timezone=Asia/Seoul`;
      break;
    case 'baseball':
      host = 'v1.baseball.api-sports.io';
      endpoint = `/games?date=${today}&timezone=Asia/Seoul`;
      break;
    case 'basketball':
      host = 'v1.basketball.api-sports.io';
      endpoint = `/games?date=${today}&timezone=Asia/Seoul`;
      break;
    default:
      host = `v1.${sport}.api-sports.io`;
      endpoint = `/games?date=${today}&timezone=Asia/Seoul`;
  }

  const url = `https://${host}${endpoint}`;
  
  // 1. 경기 정보 가져오기
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'x-apisports-key': apiKey },
    cache: 'no-store'
  });

  if (!res.ok) throw new Error(`API 서버 응답 오류 (${res.status}): ${host}`);
  const data = await res.json();
  
  // API-level error check: 데이터가 있으면 에러를 던지지 않고 로그만 기록
  if (data.errors && Object.keys(data.errors).length > 0) {
    const errorMsg = typeof data.errors === 'string' ? data.errors : JSON.stringify(data.errors);
    console.warn(`API-Sports Warning (${sport}):`, errorMsg);
    // 데이터가 아예 없는 경우에만 에러를 던짐
    if (!data.response || data.response.length === 0) {
      throw new Error(`API 오류: ${errorMsg}`);
    }
  }

  const fixtureData = data.response || [];

  // 2. 배당 정보 가져오기 (캐싱 제거 및 타임존 추가)
  let oddsMap: Record<number, any> = {};
  
  try {
    const oddsUrl = `https://${host}/odds?date=${today}&timezone=Asia/Seoul`;
    const oddsRes = await fetch(oddsUrl, {
      method: 'GET',
      headers: { 'x-apisports-key': apiKey },
      cache: 'no-store'
    });

    if (oddsRes.ok) {
      const oddsData = await oddsRes.json();
      if (oddsData.response) {
        oddsData.response.forEach((item: any) => {
          const bookmakers = item.bookmakers || [];
          const bookmaker = 
            bookmakers.find((b: any) => b.name.toLowerCase().includes('pinnacle')) || 
            bookmakers.find((b: any) => b.name.toLowerCase().includes('bet365')) || 
            bookmakers[0];

          if (bookmaker && bookmaker.bets) {
            const findBet = (names: string[]) => bookmaker.bets.find((b: any) => names.includes(b.name));
            const matchWinner = findBet(['Match Winner', '1X2', 'Home/Away']);
            
            const targetId = item.fixture?.id || item.game?.id;
            if (targetId) {
              oddsMap[targetId] = {
                h: matchWinner?.values.find((v: any) => ['Home', '1'].includes(v.value))?.odd || 0,
                d: matchWinner?.values.find((v: any) => ['Draw', 'X'].includes(v.value))?.odd || 0,
                a: matchWinner?.values.find((v: any) => ['Away', '2'].includes(v.value))?.odd || 0,
              };
            }
          }
        });
      }
    }
  } catch (err) {
    console.error("Odds fetching failed, continuing without odds", err);
  }

  // 3. 데이터 가공
  return fixtureData.map((item: any) => {
    if (!item) return null;
    const fixture = item.fixture || item;
    const teams = item.teams || {};
    const league = item.league || {};
    const status = fixture.status || item.status || {};
    
    // Some sports use fixture.id, others use item.id or gameId
    const fixtureId = fixture.id || item.id || item.gameId;
    const matchOdds = oddsMap[fixtureId] || { h: 0, d: 0, a: 0 };
    
    const scores = item.goals || item.scores || { home: 0, away: 0 };
    const homeScore = scores.home != null ? (typeof scores.home === 'object' ? scores.home?.total ?? 0 : scores.home) : 0;
    const awayScore = scores.away != null ? (typeof scores.away === 'object' ? scores.away?.total ?? 0 : scores.away) : 0;

    return {
      id: fixtureId,
      home: teams?.home?.name || 'Unknown',
      away: teams?.away?.name || 'Unknown',
      league: league?.name || 'Unknown League',
      leagueId: league?.id || 0,
      status: status?.long || status?.short || 'Unknown',
      statusCode: status?.short || 'NS',
      time: new Date(fixture.timestamp * 1000 || fixture.date).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }),
      live: ['1H', '2H', 'HT', 'ET', 'BT', 'P', 'LIVE', 'IN PROGRESS'].includes(status?.short?.toUpperCase()),
      scores: { home: homeScore, away: awayScore },
      odds: matchOdds
    };
  }).filter(Boolean);
}
