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
      headers: {
        'x-apisports-key': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from API-Sports (${sport})`);
    }

    const data = await response.json();
    
    // API-Sports의 응답 데이터를 우리 사이트 형식으로 통일(Mapping)
    const matches = (data.response || []).map((item: any) => {
      // 축구와 다른 종목의 데이터 구조가 약간 다르므로 처리
      const fixture = item.fixture || item;
      const teams = item.teams;
      const league = item.league;
      const status = fixture.status || item.status;

      return {
        id: fixture.id,
        home: teams.home.name,
        away: teams.away.name,
        league: league.name,
        sport: sport,
        time: new Date(fixture.timestamp * 1000 || fixture.date).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }),
        live: ['1H', '2H', 'HT', 'ET', 'BT', 'P', 'SUSP', 'INT', 'IN PROGRESS', 'LIVE'].includes(status.short || status.type),
        odds: {
          h: 0, // 배당은 보통 /odds 엔드포인트로 별도 호출이 필요함
          d: 0,
          a: 0
        },
        ah: "-",
        ou: "-",
        openH: 0,
        movement: "steady"
      };
    });

    return NextResponse.json({ matches });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
