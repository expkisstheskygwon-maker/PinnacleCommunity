import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get('sport') || 'soccer';
  
  const apiKey = process.env.APISPORTS_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'API Key missing' }, { status: 500 });
  }

  // 오늘 날짜 구하기 (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];

  // 종목별 호스트 및 엔드포인트 설정
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

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'x-apisports-key': apiKey },
    });

    if (!response.ok) throw new Error(`Failed to fetch from API-Sports (${sport})`);
    const data = await response.json();
    const fixtureData = data.response || [];

    // --- 추가: 배당(Odds) 데이터 가져오기 ---
    const oddsUrl = `https://${host}/odds?date=${today}`;
    const oddsResponse = await fetch(oddsUrl, {
      method: 'GET',
      headers: { 'x-apisports-key': apiKey },
    });

    let oddsMap: Record<number, any> = {};
    if (oddsResponse.ok) {
      const oddsData = await oddsResponse.json();
      (oddsData.response || []).forEach((item: any) => {
        // 배당사 우선순위: Pinnacle -> Bet365 -> Bwin -> 첫 번째 업체
        const bookmakers = item.bookmakers || [];
        const bookmaker = 
          bookmakers.find((b: any) => b.name.toLowerCase().includes('pinnacle')) || 
          bookmakers.find((b: any) => b.name.toLowerCase().includes('bet365')) || 
          bookmakers[0];

        if (bookmaker && bookmaker.bets) {
          const findBet = (names: string[]) => bookmaker.bets.find((b: any) => names.includes(b.name));
          
          const matchWinner = findBet(['Match Winner', '1X2', 'Home/Away']);
          const handicap = findBet(['Asian Handicap', 'Handicap Result']);
          const goals = findBet(['Goals Over/Under', 'Total Goals']);

          oddsMap[item.fixture.id] = {
            h: matchWinner?.values.find((v: any) => ['Home', '1'].includes(v.value))?.odd || 0,
            d: matchWinner?.values.find((v: any) => ['Draw', 'X'].includes(v.value))?.odd || 0,
            a: matchWinner?.values.find((v: any) => ['Away', '2'].includes(v.value))?.odd || 0,
            ah: handicap?.values[0] ? `${handicap.values[0].value} @ ${handicap.values[0].odd}` : "-",
            ou: goals?.values[0] ? `${goals.values[0].value} @ ${goals.values[0].odd}` : "-"
          };
        }
      });
    }

    const matches = fixtureData.map((item: any) => {
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
        sport: sport,
        status: status.long || status.short,
        statusCode: status.short,
        time: new Date(fixture.timestamp * 1000 || fixture.date).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }),
        date: new Date(fixture.timestamp * 1000 || fixture.date).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }),
        live: ['1H', '2H', 'HT', 'ET', 'BT', 'P', 'LIVE', 'IN PROGRESS', 'Q1', 'Q2', 'Q3', 'Q4', 'OT', 'IN1', 'IN2', 'IN3', 'IN4', 'IN5', 'IN6', 'IN7', 'IN8', 'IN9'].includes(status.short?.toUpperCase()),
        finished: ['FT', 'AET', 'PEN', 'POST', 'CANC', 'ABD', 'AWD', 'WO', 'AOT', 'F'].includes(status.short?.toUpperCase()),
        scores: {
          home: homeScore ?? 0,
          away: awayScore ?? 0
        },
        odds: {
          h: parseFloat(matchOdds.h),
          d: parseFloat(matchOdds.d),
          a: parseFloat(matchOdds.a)
        },
        ah: matchOdds.ah,
        ou: matchOdds.ou,
        openH: parseFloat(matchOdds.h),
        movement: "steady"
      };
    });

    return NextResponse.json({ matches });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
