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

export async function getTodayMatches(sportInput: string = 'soccer', providedApiKey?: string) {
  const sport = sportInput.toLowerCase();
  
  // 캐시 확인
  const cacheKey = `matches-${sport}`;
  if (cache[cacheKey] && (Date.now() - cache[cacheKey].timestamp < CACHE_TTL)) {
    return cache[cacheKey].data;
  }

  // API Key 우선순위: 1. 인자, 2. process.env, 3. Cloudflare Context
  let apiKey = providedApiKey || process.env.APISPORTS_KEY;
  let tsdbKey = process.env.THESPORTSDB_KEY || '123';

  if (!apiKey) {
    try {
      const { env } = getCloudflareContext();
      apiKey = (env as any).APISPORTS_KEY;
      tsdbKey = (env as any).THESPORTSDB_KEY || tsdbKey;
    } catch (e) {}
  }

  if (!apiKey) {
    console.warn("API Key missing in getTodayMatches");
    return [];
  }

  if (sport === 'all') {
    const sportsToFetch = ['soccer', 'baseball', 'basketball', 'volleyball', 'handball', 'hockey'];
    const results = await Promise.allSettled(
      sportsToFetch.map(s => getTodayMatches(s, apiKey))
    );
    
    let allMatches: any[] = [];
    results.forEach((res) => {
      if (res.status === 'fulfilled') {
        allMatches = [...allMatches, ...res.value];
      }
    });
    return allMatches;
  }

  const today = new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString().split('T')[0];

  // TheSportsDB Fallback Logic
  const fetchTSDB = async () => {
    const leagueMap: Record<string, number[]> = {
      soccer: [4328, 4335, 4332, 4331, 4334],
      basketball: [4387],
      baseball: [4424],
    };
    const leagues = leagueMap[sport] || [];
    if (leagues.length === 0) return [];
    
    try {
      const allEvents = await Promise.all(leagues.map(async (id) => {
        const res = await fetch(`https://www.thesportsdb.com/api/v1/json/${tsdbKey}/eventsnextleague.php?id=${id}`);
        const data = await res.json();
        return data.events || [];
      }));

      return allEvents.flat().map((event: any) => ({
        id: event.idEvent,
        home: event.strHomeTeam,
        away: event.strAwayTeam,
        league: event.strLeague,
        status: "Upcoming",
        statusCode: "NS",
        time: event.strTime ? event.strTime.substring(0, 5) : "00:00",
        live: false,
        scores: { home: 0, away: 0 },
        odds: { h: 0, d: 0, a: 0 },
        sport: sport,
        source: "TheSportsDB"
      }));
    } catch (err) {
      return [];
    }
  };

  const host = sport === 'soccer' ? 'v3.football.api-sports.io' : `v1.${sport}.api-sports.io`;
  const endpoint = sport === 'soccer' ? `/fixtures?date=${today}&timezone=Asia/Seoul` : `/games?date=${today}&timezone=Asia/Seoul`;

  try {
    const res = await fetch(`https://${host}${endpoint}`, {
      method: 'GET',
      headers: { 'x-apisports-key': apiKey },
      next: { revalidate: 180 }
    });

    if (!res.ok) return await fetchTSDB();
    const data = await res.json();
    
    if (data.errors && Object.keys(data.errors).length > 0) {
      return await fetchTSDB();
    }

    const fixtureData = data.response || [];
    if (fixtureData.length === 0) return await fetchTSDB();

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
        live: ['1H', '2H', 'HT', 'ET', 'BT', 'P', 'LIVE', 'IN PROGRESS', 'Q1', 'Q2', 'Q3', 'Q4', 'OT', 'IN1', 'IN2', 'IN3', 'IN4', 'IN5', 'IN6', 'IN7', 'IN8', 'IN9'].includes(status.short?.toUpperCase()),
        scores: { 
          home: goals?.home ?? 0, 
          away: goals?.away ?? 0 
        },
        odds: { h: 0, d: 0, a: 0 },
        sport: sport
      };
    });

    cache[cacheKey] = { data: mappedMatches, timestamp: Date.now() };
    return mappedMatches;

  } catch (error) {
    return await fetchTSDB();
  }
}
