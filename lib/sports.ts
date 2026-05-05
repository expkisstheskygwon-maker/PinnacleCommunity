// lib/sports.ts
// API-Sports 공통 로직 분리

export async function getTodayMatches(sportInput: string = 'soccer', providedApiKey?: string) {
  const sport = sportInput.toLowerCase();
  const apiKey = providedApiKey || process.env.APISPORTS_KEY;
  if (!apiKey) throw new Error('APISPORTS_KEY is missing');

  // 'all'인 경우 여러 종목을 재귀적으로 호출하여 병합
  if (sport === 'all') {
    const sportsToFetch = ['soccer', 'baseball', 'basketball'];
    const results = await Promise.allSettled(
      sportsToFetch.map(s => getTodayMatches(s, apiKey))
    );
    
    let allMatches: any[] = [];
    let successCount = 0;
    results.forEach((res, idx) => {
      if (res.status === 'fulfilled') {
        allMatches = [...allMatches, ...res.value];
        successCount++;
      } else {
        console.error(`Failed to fetch ${sportsToFetch[idx]}:`, res.reason);
      }
    });
    
    if (successCount === 0 && results.length > 0) {
      throw new Error('모든 종목 데이터를 불러오는 데 실패했습니다.');
    }
    
    return allMatches;
  }

  // 한국 시간(KST, UTC+9) 기준으로 오늘 날짜 계산
  const today = new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString().split('T')[0];
  let host = '';
  let endpoint = '';

  switch (sport) {
    case 'soccer':
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
  let res = await fetch(url, {
    method: 'GET',
    headers: { 'x-apisports-key': apiKey },
    cache: 'no-store'
  });

  let data = await res.json();

  // 축구 데이터가 비어있을 경우 강력한 백업 로직 가동
  if ((!data.response || data.response.length === 0) && sport === 'soccer') {
    console.log('Soccer fixtures empty, trying live fallback...');
    // 라이브 경기 시도
    const liveRes = await fetch(`https://${host}/fixtures?live=all`, {
      method: 'GET',
      headers: { 'x-apisports-key': apiKey },
      cache: 'no-store'
    });
    const liveData = await liveRes.json();
    
    if (liveData.response && liveData.response.length > 0) {
      data = liveData;
    } else {
      // 라이브도 없으면 최근 경기 10개 시도 (API 작동 확인용)
      console.log('Soccer live empty, trying last 10 fallback...');
      const lastRes = await fetch(`https://${host}/fixtures?last=10`, {
        method: 'GET',
        headers: { 'x-apisports-key': apiKey },
        cache: 'no-store'
      });
      const lastData = await lastRes.json();
      if (lastData.response && lastData.response.length > 0) {
        data = lastData;
      }
    }
  }

  if (!res.ok && !data.response) throw new Error(`API 서버 응답 오류 (${res.status}) [${sport}]: ${host}`);
  
  // API-level error check
  if (data.errors && Object.keys(data.errors).length > 0) {
    const errorMsg = typeof data.errors === 'string' ? data.errors : JSON.stringify(data.errors);
    console.warn(`API-Sports Warning (${sport}):`, errorMsg);
    if (!data.response || data.response.length === 0) {
      throw new Error(`[${sport}] API 데이터 오류: ${errorMsg}`);
    }
  }

  const fixtureData = data.response || [];

  // 2. 배당 정보 가져오기 (캐싱 제거 및 타임존 추가)
  let oddsMap: Record<number, any> = {};
  
  try {
    const oddsUrl = `https://${host}/odds?date=${today}`;
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
      sport: sport,
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
