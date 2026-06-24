import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getTodayMatches } from '@/lib/sports';

// 메모리 내 캐시 시스템 (TTL: 3분)
const cache: Record<string, { data: any, timestamp: number }> = {};
const CACHE_TTL = 3 * 60 * 1000;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get('sport') || 'soccer';
  const dateParam = searchParams.get('date');
  const fixtureId = searchParams.get('fixtureId');
  
  const apiKey = process.env.APISPORTS_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'API Key missing' }, { status: 500 });
  }

  // 종목별 설정 정의
  const sportConfigs: Record<string, { host: string; endpoint: string }> = {
    soccer: { host: 'v3.football.api-sports.io', endpoint: '/fixtures' },
    baseball: { host: 'v1.baseball.api-sports.io', endpoint: '/games' },
    basketball: { host: 'v1.basketball.api-sports.io', endpoint: '/games' },
    volleyball: { host: 'v1.volleyball.api-sports.io', endpoint: '/games' },
    handball: { host: 'v1.handball.api-sports.io', endpoint: '/games' },
    hockey: { host: 'v1.hockey.api-sports.io', endpoint: '/games' },
  };

  // 단일 경기 조회 처리
  if (fixtureId) {
    const config = sportConfigs[sport] || { host: `v1.${sport}.api-sports.io`, endpoint: '/games' };
    const url = `https://${config.host}${config.endpoint}?id=${fixtureId}`;
    try {
      const response = await fetch(url, { 
        headers: { 'x-apisports-key': apiKey },
        next: { revalidate: 60 }
      });
      if (response.ok) {
        const data = await response.json();
        const fixtureData = data.response || [];
        if (fixtureData.length > 0) {
          const item = fixtureData[0];
          const fixture = item.fixture || item;
          const teams = item.teams;
          const league = item.league;
          const status = fixture.status || item.status;
          
          const scores = item.goals || item.scores || { home: 0, away: 0 };
          const homeScore = scores.home != null ? (typeof scores.home === 'object' ? scores.home?.total ?? 0 : scores.home) : 0;
          const awayScore = scores.away != null ? (typeof scores.away === 'object' ? scores.away?.total ?? 0 : scores.away) : 0;

          const matchResult = {
            id: fixture.id,
            home: teams.home.name,
            away: teams.away.name,
            league: league.name,
            country: league.country || item.country?.name || "World",
            sport: sport,
            status: status.long || status.short,
            statusCode: status.short,
            time: new Date(fixture.timestamp * 1000 || fixture.date).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }),
            date: new Date(fixture.timestamp * 1000 || fixture.date).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }),
            live: ['1H', '2H', 'HT', 'ET', 'BT', 'P', 'LIVE', 'IN PROGRESS', 'Q1', 'Q2', 'Q3', 'Q4', 'OT', 'IN1', 'IN2', 'IN3', 'IN4', 'IN5', 'IN6', 'IN7', 'IN8', 'IN9'].includes(status.short?.toUpperCase()),
            finished: ['FT', 'AET', 'PEN', 'POST', 'CANC', 'ABD', 'AWD', 'WO', 'AOT', 'F', 'END'].includes(status.short?.toUpperCase()),
            scores: { home: homeScore ?? 0, away: awayScore ?? 0 }
          };
          return NextResponse.json({ success: true, match: matchResult });
        }
      }
      return NextResponse.json({ success: false, error: '경기를 찾을 수 없습니다.' }, { status: 404 });
    } catch (err: any) {
      return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
  }

  const targetDate = dateParam ? dateParam : new Date().toISOString().split('T')[0];

  const fetchTheSportsDBData = async (sportKey: string) => {
    const tsdbKey = process.env.THESPORTSDB_KEY || '123';
    
    // 종목별 리그 ID 매핑
    const leagueMap: Record<string, number[]> = {
      soccer: [4328, 4335, 4332, 4331, 4334], // EPL, La Liga, Serie A, Bundesliga, Ligue 1
      basketball: [4387], // NBA
      baseball: [4424],   // MLB
    };

    const leagues = leagueMap[sportKey] || [];
    if (leagues.length === 0) return [];
    
    try {
      const allEvents = await Promise.all(leagues.map(async (id) => {
        const url = `https://www.thesportsdb.com/api/v1/json/${tsdbKey}/eventsnextleague.php?id=${id}`;
        const res = await fetch(url);
        const data = await res.json();
        return data.events || [];
      }));

      return allEvents.flat().map((event: any) => ({
        id: event.idEvent,
        home: event.strHomeTeam,
        away: event.strAwayTeam,
        league: event.strLeague,
        country: event.strCountry || "World",
        countryCode: "EU", // TheSportsDB는 국가 코드를 주지 않으므로 기본값
        flag: null,
        leagueLogo: null,
        sport: sportKey,
        status: "Upcoming",
        statusCode: "NS",
        time: event.strTime ? event.strTime.substring(0, 5) : "00:00",
        date: event.dateEvent ? event.dateEvent.substring(5).replace('-', '/') : "00/00",
        live: false,
        finished: false,
        scores: { home: 0, away: 0 },
        odds: { h: 0, d: 0, a: 0 },
        ah: "-",
        ou: "-",
        openH: 0,
        movement: "steady",
        source: "TheSportsDB"
      }));
    } catch (err) {
      console.error(`TheSportsDB Fallback Error for ${sportKey}:`, err);
      return [];
    }
  };

  const fetchSportData = async (sportKey: string, isLiveOnly: boolean = false) => {
    const config = sportConfigs[sportKey] || { host: `v1.${sportKey}.api-sports.io`, endpoint: '/games' };
    
    // API-Sports의 v1 (농구, 야구 등)은 live=all 파라미터가 존재하지 않으므로, date로 전체 호출 후 자체 필터링
    const url = `https://${config.host}${config.endpoint}?date=${targetDate}&timezone=Asia/Seoul`;

    // 캐시 확인
    const cacheKey = `route-matches-${sportKey}-${isLiveOnly}-${targetDate}`;
    if (cache[cacheKey] && (Date.now() - cache[cacheKey].timestamp < CACHE_TTL)) {
      return cache[cacheKey].data;
    }

    try {
      const response = await fetch(url, { 
        headers: { 'x-apisports-key': apiKey },
        next: { revalidate: 180 }
      });
      if (!response.ok) {
        // 네트워크 에러 시에도 폴백 시도
        if (!isLiveOnly) return await fetchTheSportsDBData(sportKey);
        return [];
      }

      const data = await response.json();
      
      // API 한도 초과 등의 에러 체크
      if (data.errors && Object.keys(data.errors).length > 0) {
        console.warn(`API-Sports Error for ${sportKey}:`, data.errors);
        // 라이브가 아닌 경우에만 TheSportsDB로 폴백 시도
        if (!isLiveOnly) {
          return await fetchTheSportsDBData(sportKey);
        }
        return [];
      }

      const fixtureData = data.response || [];
      if (fixtureData.length === 0 && !isLiveOnly) {
        // 데이터가 없어도 폴백 시도
        const fallback = await fetchTheSportsDBData(sportKey);
        if (fallback.length > 0) return fallback;
      }

      // 배당 데이터 (페이지네이션 적용 및 축구는 Pinnacle 필터링)
      const bookmakerParam = sportKey === 'soccer' ? '&bookmaker=4' : '';
      const oddsUrl = `https://${config.host}/odds?date=${targetDate}&timezone=Asia/Seoul&page=1${bookmakerParam}`;
      const oddsResponse = await fetch(oddsUrl, { 
        headers: { 'x-apisports-key': apiKey },
        next: { revalidate: 180 }
      });
      
      let oddsMap: Record<number, any> = {};
      if (oddsResponse.ok) {
        const oddsData = await oddsResponse.json();
        const firstPageResponse = oddsData.response || [];
        const totalPages = oddsData.paging?.total || 1;
        
        let allOddsResponses = [...firstPageResponse];
        
        // 추가 페이지가 있는 경우 안전 한도(최대 8페이지) 내에서 병렬 조회
        if (totalPages > 1) {
          const remainingPages = Array.from({ length: Math.min(totalPages, 8) - 1 }, (_, i) => i + 2);
          const pageRequests = remainingPages.map(async (page) => {
            try {
              const pageUrl = `https://${config.host}/odds?date=${targetDate}&timezone=Asia/Seoul&page=${page}${bookmakerParam}`;
              const pageRes = await fetch(pageUrl, { 
                headers: { 'x-apisports-key': apiKey },
                next: { revalidate: 180 }
              });
              if (pageRes.ok) {
                const pageData = await pageRes.json();
                return pageData.response || [];
              }
            } catch (err) {
              console.error(`Failed to fetch odds page ${page} for ${sportKey}:`, err);
            }
            return [];
          });
          
          const pagesResults = await Promise.all(pageRequests);
          pagesResults.forEach((res) => {
            allOddsResponses = [...allOddsResponses, ...res];
          });
        }

        allOddsResponses.forEach((item: any) => {
          const bookmakers = item.bookmakers || [];
          const bookmaker = bookmakers.find((b: any) => b.name.toLowerCase().includes('pinnacle')) || 
                            bookmakers.find((b: any) => b.name.toLowerCase().includes('bet365')) || 
                            bookmakers[0];

          if (bookmaker?.bets) {
            const findBet = (names: string[]) => bookmaker.bets.find((b: any) => names.includes(b.name));
            const matchWinner = findBet(['Match Winner', '1X2', 'Home/Away']);
            const handicap = findBet(['Asian Handicap', 'Handicap Result']);
            const goals = findBet(['Goals Over/Under', 'Total Goals']);

            oddsMap[item.fixture?.id || item.id] = {
              h: matchWinner?.values.find((v: any) => ['Home', '1'].includes(v.value))?.odd || 0,
              d: matchWinner?.values.find((v: any) => ['Draw', 'X'].includes(v.value))?.odd || 0,
              a: matchWinner?.values.find((v: any) => ['Away', '2'].includes(v.value))?.odd || 0,
              ah: handicap?.values[0] ? `${handicap.values[0].value} @ ${handicap.values[0].odd}` : "-",
              ou: goals?.values[0] ? `${goals.values[0].value} @ ${goals.values[0].odd}` : "-"
            };
          }
        });
      }

      const mappedMatches = fixtureData.map((item: any) => {
        const fixture = item.fixture || item;
        const teams = item.teams;
        const league = item.league;
        const status = fixture.status || item.status;
        const matchOdds = oddsMap[fixture.id] || { h: 0, d: 0, a: 0, ah: "-", ou: "-" };
        
        const scores = item.goals || item.scores || { home: 0, away: 0 };
        const homeScore = scores.home != null ? (typeof scores.home === 'object' ? scores.home?.total ?? 0 : scores.home) : 0;
        const awayScore = scores.away != null ? (typeof scores.away === 'object' ? scores.away?.total ?? 0 : scores.away) : 0;

        return {
          id: fixture.id,
          home: teams.home.name,
          away: teams.away.name,
          league: league.name,
          country: league.country || item.country?.name || "World",
          countryCode: item.country?.code || null,
          flag: league.flag || item.country?.flag || null,
          leagueLogo: league.logo,
          sport: sportKey,
          status: status.long || status.short,
          statusCode: status.short,
          time: new Date(fixture.timestamp * 1000 || fixture.date).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }),
          date: new Date(fixture.timestamp * 1000 || fixture.date).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }),
          live: ['1H', '2H', 'HT', 'ET', 'BT', 'P', 'LIVE', 'IN PROGRESS', 'Q1', 'Q2', 'Q3', 'Q4', 'OT', 'IN1', 'IN2', 'IN3', 'IN4', 'IN5', 'IN6', 'IN7', 'IN8', 'IN9'].includes(status.short?.toUpperCase()),
          finished: ['FT', 'AET', 'PEN', 'POST', 'CANC', 'ABD', 'AWD', 'WO', 'AOT', 'F', 'END'].includes(status.short?.toUpperCase()),
          scores: { home: homeScore ?? 0, away: awayScore ?? 0 },
          odds: { h: parseFloat(matchOdds.h), d: parseFloat(matchOdds.d), a: parseFloat(matchOdds.a) },
          ah: matchOdds.ah,
          ou: matchOdds.ou,
          openH: parseFloat(matchOdds.h),
          movement: "steady"
        };
      });

      const result = isLiveOnly ? mappedMatches.filter((m: any) => m.live) : mappedMatches;
      
      // 캐시 저장
      cache[cacheKey] = { data: result, timestamp: Date.now() };
      
      return result;
    } catch (err) {
      console.error(`Error fetching ${sportKey}:`, err);
      return [];
    }
  };

  try {
    if (sport === 'live') {
      const sportsToFetch = ['soccer', 'baseball', 'basketball', 'volleyball', 'handball', 'hockey'];
      const allResults = await Promise.all(sportsToFetch.map(s => fetchSportData(s, true)));
      const matches = allResults.flat();
      return NextResponse.json({ matches });
    } else if (sport === 'all') {
      // 원래 'all'은 soccer만 불렀으나, 진짜 전체 경기를 보여주기 위해 인기 3종목 병렬 호출
      const sportsToFetch = ['soccer', 'baseball', 'basketball'];
      const allResults = await Promise.all(sportsToFetch.map(s => fetchSportData(s, false)));
      const matches = allResults.flat();
      return NextResponse.json({ matches });
    } else {
      const matches = await fetchSportData(sport);
      return NextResponse.json({ matches });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
