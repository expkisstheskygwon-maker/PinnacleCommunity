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
    console.log(`[Cache Hit] ${cacheKey}`);
    return cache[cacheKey].data;
  }

  const { env } = getCloudflareContext();
  const apiKey = providedApiKey || (env as any).APISPORTS_KEY;
  const sportdbKey = (env as any).SPORTDB_API_KEY;

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

  // 한국 시간(KST) 기준 오늘/어제/내일 범위 고려 (실시간성 확보)
  const now = new Date(new Date().getTime() + 9 * 60 * 60 * 1000);
  const today = now.toISOString().split('T')[0];

  let matches: any[] = [];
  
  // 1. 기본 API-Sports 데이터 가져오기
  try {
    let host = '';
    let endpoint = '';
    switch (sport) {
      case 'soccer': host = 'v3.football.api-sports.io'; endpoint = `/fixtures?date=${today}`; break;
      case 'baseball': host = 'v1.baseball.api-sports.io'; endpoint = `/games?date=${today}`; break;
      case 'basketball': host = 'v1.basketball.api-sports.io'; endpoint = `/games?date=${today}`; break;
      default: host = `v1.${sport}.api-sports.io`; endpoint = `/games?date=${today}`;
    }

    const [fixturesRes, liveRes] = await Promise.all([
      fetch(`https://${host}${endpoint}`, { headers: { 'x-apisports-key': apiKey }, cache: 'no-store' }),
      sport === 'soccer' 
        ? fetch(`https://${host}/fixtures?live=all`, { headers: { 'x-apisports-key': apiKey }, cache: 'no-store' })
        : Promise.resolve(null)
    ]);

    const data = await fixturesRes.json();
    let apiMatches = data.response || [];

    if (liveRes) {
      const liveData = await liveRes.json();
      if (liveData.response) {
        // 중복 제거하며 라이브 경기 추가
        const existingIds = new Set(apiMatches.map((m: any) => (m.fixture?.id || m.id)));
        liveData.response.forEach((m: any) => {
          if (!existingIds.has(m.fixture?.id || m.id)) {
            apiMatches.push(m);
          }
        });
      }
    }

    // 배당 정보 가져오기 (비동기로 병렬 처리)
    let oddsMap: Record<string, any> = {};
    try {
      const oddsRes = await fetch(`https://${host}/odds?date=${today}`, {
        headers: { 'x-apisports-key': apiKey },
        cache: 'no-store'
      });
      if (oddsRes.ok) {
        const oddsData = await oddsRes.json();
        (oddsData.response || []).forEach((item: any) => {
          const fid = `${sport}-${item.fixture?.id || item.id}`;
          const bms = item.bookmakers || [];
          const bm = bms.find((b: any) => b.name.toLowerCase().includes('pinnacle')) || bms[0];
          if (bm && bm.bets) {
            const h2h = bm.bets.find((b: any) => ['Match Winner', 'Full Time Result', 'Home/Away'].includes(b.name));
            if (h2h) {
              oddsMap[fid] = {
                h: h2h.values.find((v: any) => ['Home', '1'].includes(v.value))?.odd,
                d: h2h.values.find((v: any) => ['Draw', 'X'].includes(v.value))?.odd,
                a: h2h.values.find((v: any) => ['Away', '2'].includes(v.value))?.odd
              };
            }
          }
        });
      }
    } catch (e) { console.warn('Odds fetch failed', e); }

    matches = apiMatches.map((item: any) => mapApiSportsMatch(item, sport, oddsMap));
  } catch (err) {
    console.error(`API-Sports Error [${sport}]:`, err);
  }

  // 2. SportDB.dev (Flashscore) 데이터로 보완 (축구 위주)
  if (sport === 'soccer' && sportdbKey) {
    try {
      const flashMatches = await getFlashscoreMatches(sportdbKey);
      if (flashMatches && flashMatches.length > 0) {
        // API-Sports 결과와 병합 및 데이퍼 보정
        matches = mergeMatchSources(matches, flashMatches);
      }
    } catch (e) { console.error('Flashscore Error:', e); }
  }

  if (matches.length === 0) return getDemoMatches(sport);

  // 최종 결과 캐싱
  cache[cacheKey] = { data: matches, timestamp: Date.now() };
  return matches;
}

function mapApiSportsMatch(item: any, sport: string, oddsMap: Record<string, any>) {
  const fixture = item.fixture || item;
  const league = item.league || {};
  const teams = item.teams || {};
  const goals = item.goals || item.scores || {};
  const status = fixture.status || item.status || {};
  
  const fid = `${sport}-${fixture.id || item.id}`;
  
  return {
    id: fid,
    sport,
    home: teams.home?.name || teams.home || 'Unknown',
    away: teams.away?.name || teams.away || 'Unknown',
    homeLogo: teams.home?.logo || '',
    awayLogo: teams.away?.logo || '',
    league: league.name || 'Unknown League',
    leagueId: Number(league.id || 0),
    leagueLogo: league.logo || '',
    date: fixture.date || item.date || '',
    live: ['LIVE', '1H', '2H', 'HT', 'ET', 'P', 'BT', 'IN', 'IP', 'Q1', 'Q2', 'Q3', 'Q4', 'OT'].includes(status.short || status.code || ''),
    finished: ['FT', 'AET', 'PEN', 'AWD', 'CAN', 'ABD', 'POST', 'CANC'].includes(status.short || status.code || ''),
    score: {
      home: goals.home ?? 0,
      away: goals.away ?? 0
    },
    odds: oddsMap[fid] || null,
    statusText: status.long || 'Scheduled',
    statusCode: status.short || 'NS'
  };
}

function mergeMatchSources(primary: any[], secondary: any[]) {
  const merged = [...primary];
  const primaryKeys = new Set(primary.map(m => `${normalizeTeamName(m.home)}-${normalizeTeamName(m.away)}`));

  secondary.forEach(sec => {
    const key = `${normalizeTeamName(sec.home)}-${normalizeTeamName(sec.away)}`;
    if (!primaryKeys.has(key)) {
      merged.push(sec);
    } else {
      // 이미 존재하는 경기가 'Live'가 아니면 Flashscore 데이터로 업데이트 (실시간성 우위)
      const idx = merged.findIndex(m => `${normalizeTeamName(m.home)}-${normalizeTeamName(m.away)}` === key);
      if (idx !== -1 && !merged[idx].live && sec.live) {
        merged[idx] = { ...merged[idx], ...sec, odds: merged[idx].odds };
      }
    }
  });

  return merged;
}

async function getFlashscoreMatches(apiKey: string) {
  try {
    const res = await fetch("https://api.sportdb.dev/api/flashscore/football", {
      headers: { "X-API-Key": apiKey },
      cache: 'no-store'
    });
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map((m: any) => ({
      id: `flash-${m.id}`,
      sport: 'soccer',
      home: m.home_team?.name || m.home_name || 'Unknown',
      away: m.away_team?.name || m.away_name || 'Unknown',
      homeLogo: m.home_team?.logo || '',
      awayLogo: m.away_team?.logo || '',
      league: m.league?.name || 'Flashscore League',
      leagueId: 0,
      leagueLogo: '',
      date: m.start_time || '',
      live: m.status === 'LIVE' || m.status === 'IN_PROGRESS' || !!m.home_score,
      finished: m.status === 'FINISHED',
      score: {
        home: m.home_score ?? 0,
        away: m.away_score ?? 0
      },
      odds: null,
      statusText: m.status_name || m.status || 'Scheduled',
      statusCode: m.status === 'LIVE' ? 'LIVE' : 'NS'
    }));
  } catch (e) {
    console.error('Flashscore fetch failed', e);
    return [];
  }
}

export async function getTheSportsDBInfo(teamName: string) {
  try {
    const res = await fetch(`https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(teamName)}`);
    const data = await res.json();
    return data.teams ? data.teams[0] : null;
  } catch { return null; }
}

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
    }
  ];
  return sport === 'all' ? demo : demo.filter(m => m.sport === sport);
}
