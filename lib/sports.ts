import { getCloudflareContext } from '@opennextjs/cloudflare';

export async function getTodayMatches(sportInput: string = 'soccer', providedApiKey?: string) {
  const sport = sportInput.toLowerCase();
  const apiKey = providedApiKey || process.env.APISPORTS_KEY;
  if (!apiKey) throw new Error('APISPORTS_KEY is missing');

  // 'all'인 경우 여러 종목을 재귀적으로 호출하여 병합
  if (sport === 'all') {
    const sportsToFetch = ['soccer', 'baseball', 'basketball', 'tennis', 'esports'];
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
      throw new Error('API 호출 한도 초과 또는 서버 연결 오류입니다. 잠시 후 다시 시도해주세요.');
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
    const liveRes = await fetch(`https://${host}/fixtures?live=all`, {
      method: 'GET',
      headers: { 'x-apisports-key': apiKey },
      cache: 'no-store'
    });
    const liveData = await liveRes.json();
    
    if (liveData.response && liveData.response.length > 0) {
      data = liveData;
    } else {
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

  // 2. 배당 정보 가져오기 (배당 API 호출 실패하더라도 경기 목록은 반환)
  let oddsMap: Record<string, any> = {};
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
          const rawFid = item.fixture?.id || item.id;
          const fid = `${sport}-${rawFid}`;
          const bms = item.bookmakers || [];
          const bm = bms.find((b: any) => b.name.toLowerCase().includes('pinnacle')) || bms[0];
          if (bm && bm.bets) {
            const h2h = bm.bets.find((b: any) => b.name === 'Match Winner' || b.name === 'Full Time Result');
            if (h2h) {
              oddsMap[fid] = {
                h: h2h.values.find((v: any) => v.value === 'Home' || v.value === '1')?.odd,
                d: h2h.values.find((v: any) => v.value === 'Draw' || v.value === 'X')?.odd,
                a: h2h.values.find((v: any) => v.value === 'Away' || v.value === '2')?.odd
              };
            }
          }
        });
      }
    }
  } catch (err) {
    console.error(`Odds fetch error [${sport}]:`, err);
  }

  // 3. 통합 매핑 로직
  return fixtureData.map((item: any) => {
    if (!item) return null;
    const fixture = item.fixture || item;
    const league = item.league || {};
    const teams = item.teams || {};
    const goals = item.goals || item.scores || {};
    const status = fixture.status || item.status || {};
    
    const rawFid = fixture.id || item.id || item.gameId || `${teams.home}-${teams.away}-${league.id}`;
    const fid = `${sport}-${rawFid}`;

    return {
      id: fid,
      sport: sport,
      home: teams.home?.name || teams.home || 'Unknown',
      away: teams.away?.name || teams.away || 'Unknown',
      homeLogo: teams.home?.logo || '',
      awayLogo: teams.away?.logo || '',
      league: league.name || 'Unknown League',
      leagueId: Number(league.id || 0),
      leagueLogo: league.logo || '',
      date: fixture.date || item.date || '',
      live: ['LIVE', '1H', '2H', 'HT', 'ET', 'P', 'BT', 'IN', 'IP'].includes(status.short || status.code || ''),
      finished: ['FT', 'AET', 'PEN', 'AWD', 'CAN', 'ABD', 'POST', 'CANC'].includes(status.short || status.code || ''),
      score: {
        home: goals.home ?? 0,
        away: goals.away ?? 0
      },
      odds: oddsMap[fid] || null,
      statusText: status.long || 'Scheduled',
      statusCode: status.short || 'NS'
    };
  }).filter(Boolean);
}
