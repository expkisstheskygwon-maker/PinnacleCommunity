import { getCloudflareContext } from '@opennextjs/cloudflare';

// 메모리 내 캐시 시스템 (TTL: 5분)
const cache: Record<string, { data: any, timestamp: number }> = {};
const CACHE_TTL = 5 * 60 * 1000;

export async function getTodayMatches(sportInput: string = 'soccer', providedApiKey?: string) {
  const sport = sportInput.toLowerCase();
  
  // 캐시 확인
  const cacheKey = `matches-${sport}`;
  if (cache[cacheKey] && (Date.now() - cache[cacheKey].timestamp < CACHE_TTL)) {
    console.log(`[Cache Hit] ${cacheKey}`);
    return cache[cacheKey].data;
  }

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
      // 모든 종목 실패 시 데모 데이터라도 반환
      return getDemoMatches('all');
    }
    
    // 성공한 결과 캐싱
    cache[cacheKey] = { data: allMatches, timestamp: Date.now() };
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
      console.log('Soccer live empty, trying SportDB.dev (Flashscore) fallback...');
      try {
        const flashMatches = await getFlashscoreMatches(apiKey);
        if (flashMatches && flashMatches.length > 0) {
          // Flashscore 데이터를 기존 형식으로 변환하여 반환
          return flashMatches;
        }
      } catch (e) {
        console.error('SportDB.dev Error:', e);
      }

      console.log('All soccer sources empty, trying last 10 fallback...');
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

  // 최종 결과 캐싱
  cache[cacheKey] = { data: matches, timestamp: Date.now() };
  return matches;
}

// SportDB.dev (Flashscore) API 통합
async function getFlashscoreMatches(apiSportsKey: string) {
  const sportdbKey = process.env.SPORTDB_API_KEY;
  if (!sportdbKey) return null;

  try {
    const res = await fetch("https://api.sportdb.dev/api/flashscore/football", {
      headers: { "X-API-Key": sportdbKey }
    });
    const data = await res.json();
    
    // Flashscore API 응답을 우리 시스템 표준 형식으로 변환
    if (data && Array.isArray(data)) {
      return data.map((m: any) => ({
        id: `flash-${m.id}`,
        sport: 'soccer',
        home: m.home_team?.name || m.home_name || 'Unknown',
        away: m.away_team?.name || m.away_name || 'Unknown',
        homeLogo: m.home_team?.logo || '',
        awayLogo: m.away_team?.logo || '',
        league: m.league?.name || 'Flashscore League',
        leagueId: m.league?.id || 0,
        leagueLogo: m.league?.logo || '',
        date: m.start_time || '',
        live: m.status === 'LIVE' || m.status === 'IN_PROGRESS',
        finished: m.status === 'FINISHED',
        score: {
          home: m.home_score ?? 0,
          away: m.away_score ?? 0
        },
        odds: null, // Flashscore 기본 API에는 배당이 없을 수 있음
        statusText: m.status_name || m.status || 'Scheduled',
        statusCode: m.status_code || 'NS'
      }));
    }
  } catch (err) {
    console.error('getFlashscoreMatches Error:', err);
  }
  return null;
}

// TheSportsDB를 이용한 디자인 보강 (로고 및 팀 정보)
async function getTheSportsDBInfo(teamName: string) {
  try {
    const res = await fetch(`https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(teamName)}`);
    const data = await res.json();
    return data.teams ? data.teams[0] : null;
  } catch {
    return null;
  }
}

// API 실패 시 보여줄 고퀄리티 데모 데이터
function getDemoMatches(sport: string) {
  const demo = [
    {
      id: `demo-1`,
      sport: 'soccer',
      home: '맨체스터 시티',
      away: '아스널',
      homeLogo: 'https://www.thesportsdb.com/images/media/team/badge/vwpvqr1421420131.png',
      awayLogo: 'https://www.thesportsdb.com/images/media/team/badge/v5m96v1716301385.png',
      league: 'Premier League',
      leagueId: 4328,
      leagueLogo: 'https://www.thesportsdb.com/images/media/league/badge/79362n1532185584.png',
      date: new Date().toISOString(),
      live: true,
      finished: false,
      score: { home: 1, away: 1 },
      odds: { h: 1.85, d: 3.40, a: 3.60 },
      statusText: '1st Half',
      statusCode: '1H'
    },
    {
      id: `demo-2`,
      sport: 'baseball',
      home: 'LA 다저스',
      away: '뉴욕 양키스',
      homeLogo: 'https://www.thesportsdb.com/images/media/team/badge/v3wyvp1624653733.png',
      awayLogo: 'https://www.thesportsdb.com/images/media/team/badge/x95x821624653715.png',
      league: 'MLB',
      leagueId: 4424,
      leagueLogo: 'https://www.thesportsdb.com/images/media/league/badge/vpxrts1421853005.png',
      date: new Date().toISOString(),
      live: false,
      finished: false,
      score: { home: 0, away: 0 },
      odds: { h: 1.70, d: 0, a: 2.10 },
      statusText: 'Scheduled',
      statusCode: 'NS'
    }
  ];
  return sport === 'all' ? demo : demo.filter(m => m.sport === sport);
}
