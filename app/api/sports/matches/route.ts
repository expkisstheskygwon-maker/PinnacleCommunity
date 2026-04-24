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
      host = 'v2.nba.api-sports.io'; // NBA 전용 또는 v1.basketball
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
        // Pinnacle 배당 찾기
        const pinnacle = item.bookmakers.find((b: any) => b.name.toLowerCase() === 'pinnacle') || item.bookmakers[0];
        if (pinnacle) {
          const matchWinner = pinnacle.bets.find((b: any) => b.name === 'Match Winner');
          const handicap = pinnacle.bets.find((b: any) => b.name.includes('Handicap'));
          const goals = pinnacle.bets.find((b: any) => b.name.includes('Goals Over/Under'));

          oddsMap[item.fixture.id] = {
            h: matchWinner?.values.find((v: any) => v.value === 'Home')?.odd || 0,
            d: matchWinner?.values.find((v: any) => v.value === 'Draw')?.odd || 0,
            a: matchWinner?.values.find((v: any) => v.value === 'Away')?.odd || 0,
            ah: handicap?.values[0] ? `${handicap.values[0].value} @ ${handicap.values[0].odd}` : "-",
            ou: goals?.values[0] ? `${goals.values[0].value} @ ${goals.values[0].odd}` : "-"
          };
        }
      });
    }

    // API-Sports의 응답 데이터를 우리 사이트 형식으로 통일(Mapping)
    const matches = fixtureData.map((item: any) => {
      const fixture = item.fixture || item;
      const teams = item.teams;
      const league = item.league;
      const status = fixture.status || item.status;
      const matchOdds = oddsMap[fixture.id] || { h: 0, d: 0, a: 0, ah: "-", ou: "-" };

      return {
        id: fixture.id,
        home: teams.home.name,
        away: teams.away.name,
        league: league.name,
        sport: sport,
        time: new Date(fixture.timestamp * 1000 || fixture.date).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }),
        live: ['1H', '2H', 'HT', 'ET', 'BT', 'P', 'SUSP', 'INT', 'IN PROGRESS', 'LIVE'].includes(status.short || status.type),
        odds: {
          h: parseFloat(matchOdds.h),
          d: parseFloat(matchOdds.d),
          a: parseFloat(matchOdds.a)
        },
        ah: matchOdds.ah,
        ou: matchOdds.ou,
        openH: parseFloat(matchOdds.h), // 오픈 배당 대용
        movement: "steady"
      };
    });

    return NextResponse.json({ matches });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
