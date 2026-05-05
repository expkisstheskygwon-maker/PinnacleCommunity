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
    next: { revalidate: 60 } // 60초 캐싱
  });

  if (!res.ok) throw new Error(`API 서버 응답 오류 (${res.status}): ${host}`);
  const data = await res.json();
  
  // API-level error check: 상세 에러 메시지를 던져서 UI에서 확인 가능하게 함
  if (data.errors && Object.keys(data.errors).length > 0) {
    const errorMsg = typeof data.errors === 'string' ? data.errors : JSON.stringify(data.errors);
    console.error(`API-Sports Error (${sport}):`, errorMsg);
    throw new Error(`API 오류: ${errorMsg}`);
  }

  const fixtureData = data.response || [];

  // 2. 배당 정보 가져오기 (축구는 데이터가 많으므로 타임아웃 주의)
  let oddsMap: Record<number, any> = {};
  
  // 축구의 경우 경기가 너무 많으면 배당 API 호출이 실패할 수 있으므로 
  // 우선순위가 높은 리그나 라이브 경기 위주로 가져오는 것이 좋으나, 
  // 현재는 전체 요청을 시도하되 실패하더라도 경기 목록은 보여주도록 처리
  try {
    const oddsUrl = `https://${host}/odds?date=${today}`;
    const oddsRes = await fetch(oddsUrl, {
      method: 'GET',
      headers: { 'x-apisports-key': apiKey },
      next: { revalidate: 300 } // 5분 캐싱으로 완화
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
    const fixture = item.fixture || item;
    const teams = item.teams;
    const league = item.league;
    const status = fixture.status || item.status;
    const matchOdds = oddsMap[fixture.id] || { h: 0, d: 0, a: 0 };
    
    const scores = item.goals || item.scores || { home: 0, away: 0 };
    const homeScore = scores.home != null ? (typeof scores.home === 'object' ? scores.home?.total ?? 0 : scores.home) : 0;
    const awayScore = scores.away != null ? (typeof scores.away === 'object' ? scores.away?.total ?? 0 : scores.away) : 0;

    return {
      id: fixture.id,
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
  });
}
