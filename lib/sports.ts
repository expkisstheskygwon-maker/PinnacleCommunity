import { getCloudflareContext } from '@opennextjs/cloudflare';

// 메모리 내 캐시 시스템 (TTL: 3분으로 단축하여 실시간성 강화)
const cache: Record<string, { data: any, timestamp: number }> = {};
const CACHE_TTL = 3 * 60 * 1000;

/**
 * 팀 이름을 정규화하여 비교하기 쉽게 만듦
 */
function normalizeTeamName(name: string): string {
  if (!name) return '';
  return name.toLowerCase()
    .replace(/\s+/g, '')
    .replace(/fc|sc|afc|united|utd|city|town|real|st/g, '');
}

/**
 * 데모 데이터 생성 (API 호출 실패 시 대비)
 */
function getDemoMatches(sport: string) {
  return [
    {
      id: 1001,
      home: "리버풀 (데모)",
      away: "맨시티 (데모)",
      league: "Premier League",
      status: "1H 25'",
      statusCode: "1H",
      time: "20:00",
      live: true,
      scores: { home: 1, away: 0 },
      odds: { h: 2.10, d: 3.40, a: 3.20 },
      sport: "soccer"
    }
  ];
}

export async function getTodayMatches(sportInput: string = 'soccer', providedApiKey?: string) {
  const sport = sportInput.toLowerCase();
  
  // 캐시 확인
  const cacheKey = `matches-${sport}`;
  if (cache[cacheKey] && (Date.now() - cache[cacheKey].timestamp < CACHE_TTL)) {
    console.log(`[Cache Hit] ${cacheKey}`);
    return cache[cacheKey].data;
  }

  const { env } = getCloudflareContext();
  const apiKey = providedApiKey || (env as any).APISPORTS_KEY;
  const sportdbKey = (env as any).SPORTDB_API_KEY;

  if (!apiKey) {
    console.error("API Key missing in getTodayMatches");
    return getDemoMatches(sport);
  }

  if (sport === 'all') {
    const sportsToFetch = ['soccer', 'baseball', 'basketball', 'tennis'];
    const results = await Promise.allSettled(
      sportsToFetch.map(s => getTodayMatches(s, apiKey))
    );
    
    let allMatches: any[] = [];
    results.forEach((res) => {
      if (res.status === 'fulfilled') {
        allMatches = [...allMatches, ...res.value];
      }
    });
    
    if (allMatches.length === 0) return getDemoMatches('all');
    
    cache[cacheKey] = { data: allMatches, timestamp: Date.now() };
    return allMatches;
  }

  // 한국 시간(KST) 기준 오늘 날짜 구하기
  const now = new Date(new Date().getTime() + 9 * 60 * 60 * 1000);
  const today = now.toISOString().split('T')[0];

  let host = '';
  let endpoint = '';

  switch (sport) {
    case 'soccer':
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

  try {
    const res = await fetch(`https://${host}${endpoint}`, {
      method: 'GET',
      headers: { 'x-apisports-key': apiKey },
      next: { revalidate: 60 }
    });

    if (!res.ok) throw new Error(`Failed to fetch from ${host}`);
    const data = await res.json();
    const fixtureData = data.response || [];

    // 2. 배당 정보 가져오기 (필요시 추가 호출 가능)
    // 여기서는 기본 정보를 매핑하여 반환
    const mappedMatches = fixtureData.map((item: any) => {
      const fixture = item.fixture || item.game || item;
      const teams = item.teams;
      const goals = item.goals || item.scores;
      const status = fixture.status;

      return {
        id: fixture.id,
        home: teams.home.name,
        away: teams.away.name,
        league: item.league?.name || "Unknown League",
        status: status.long || status.short,
        statusCode: status.short,
        time: new Date(fixture.timestamp * 1000 || fixture.date).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }),
        live: ['1H', '2H', 'HT', 'ET', 'BT', 'P', 'LIVE', 'IN PROGRESS', 'Q1', 'Q2', 'Q3', 'Q4', 'OT'].includes(status.short?.toUpperCase()),
        scores: { 
          home: goals?.home ?? 0, 
          away: goals?.away ?? 0 
        },
        odds: { h: 0, d: 0, a: 0 }, // 배당은 별도 API 호출이 필요할 수 있음
        sport: sport
      };
    });

    cache[cacheKey] = { data: mappedMatches, timestamp: Date.now() };
    return mappedMatches;

  } catch (error) {
    console.error(`Error fetching matches for ${sport}:`, error);
    return getDemoMatches(sport);
  }
}
