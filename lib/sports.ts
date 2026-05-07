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
      endpoint = `/games?date=${today}&timezone=Asia/Seoul`;
      break;
    default:
      host = `v1.${sport}.api-sports.io`;
      endpoint = `/games?date=${today}&timezone=Asia/Seoul`;
  }

  const url = (sport === 'soccer' || sport === 'all')
    ? `https://${host}/fixtures?date=${today}&timezone=Asia/Seoul`
    : `https://${host}${endpoint}`;
  
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
  const oddsUrl = `https://${host}/odds?date=${today}&timezone=Asia/Seoul`;
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
    
    if (allMatches.length === 0) return getDemoMatches('all');
    
    cache[cacheKey] = { data: allMatches, timestamp: Date.now() };
    return allMatches;
  }

  // 한국 시간(KST) 기준 오늘/어제/내일 범위 고려 (실시간성 확보)
  const now = new Date(new Date().getTime() + 9 * 60 * 60 * 1000);
  const today = now.toISOString().split('T')[0];

    return {
      id: fixture.id,
      home: teams.home.name,
      away: teams.away.name,
      league: league.name,
      status: status.long || status.short,
      statusCode: status.short,
      time: new Date(fixture.timestamp * 1000 || fixture.date).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }),
      live: ['1H', '2H', 'HT', 'ET', 'BT', 'P', 'LIVE', 'IN PROGRESS', 'Q1', 'Q2', 'Q3', 'Q4', 'OT', 'IN1', 'IN2', 'IN3', 'IN4', 'IN5', 'IN6', 'IN7', 'IN8', 'IN9'].includes(status.short?.toUpperCase()),
      scores: { home: homeScore, away: awayScore },
      odds: matchOdds,
      sport: sport
    };
  });
}
