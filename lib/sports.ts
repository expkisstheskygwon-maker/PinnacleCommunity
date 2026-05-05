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
      endpoint = `/fixtures?date=${today}`;
      break;
    case 'baseball':
      host = 'v1.baseball.api-sports.io';
      endpoint = `/games?date=${today}`;
      break;
    case 'basketball':
      host = 'v1.basketball.api-sports.io';
      endpoint = `/games?date=${today}`;
      break;
    default:
      host = `v1.${sport}.api-sports.io`;
      endpoint = `/games?date=${today}`;
  }

  const url = `https://${host}${endpoint}`;
  
  // 1. 경기 정보 가져오기
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'x-apisports-key': apiKey },
    next: { revalidate: 60 } // 60초 캐싱
  });

  if (!res.ok) throw new Error(`Failed to fetch fixtures from ${host}`);
  const data = await res.json();
  const fixtureData = data.response || [];

  // 2. 배당 정보 가져오기 (필요시)
  const oddsUrl = `https://${host}/odds?date=${today}`;
  const oddsRes = await fetch(oddsUrl, {
    method: 'GET',
    headers: { 'x-apisports-key': apiKey },
    next: { revalidate: 60 }
  });

  let oddsMap: Record<number, any> = {};
  if (oddsRes.ok) {
    const oddsData = await oddsRes.json();
    (oddsData.response || []).forEach((item: any) => {
      const bookmakers = item.bookmakers || [];
      const bookmaker = 
        bookmakers.find((b: any) => b.name.toLowerCase().includes('pinnacle')) || 
        bookmakers.find((b: any) => b.name.toLowerCase().includes('bet365')) || 
        bookmakers[0];

      if (bookmaker && bookmaker.bets) {
        const findBet = (names: string[]) => bookmaker.bets.find((b: any) => names.includes(b.name));
        const matchWinner = findBet(['Match Winner', '1X2', 'Home/Away']);
        
        oddsMap[item.fixture?.id || item.game?.id] = {
          h: matchWinner?.values.find((v: any) => ['Home', '1'].includes(v.value))?.odd || 0,
          d: matchWinner?.values.find((v: any) => ['Draw', 'X'].includes(v.value))?.odd || 0,
          a: matchWinner?.values.find((v: any) => ['Away', '2'].includes(v.value))?.odd || 0,
        };
      }
    });
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
