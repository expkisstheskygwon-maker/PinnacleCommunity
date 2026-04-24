import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get('sport') || 'soccer'; // 기본값 soccer
  
  const apiKey = process.env.RAPIDAPI_KEY;
  const apiHost = process.env.RAPIDAPI_HOST;

  if (!apiKey || !apiHost) {
    return NextResponse.json({ error: 'API configuration missing' }, { status: 500 });
  }

  // 오늘 날짜 구하기 (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];

  const url = `https://${apiHost}/api/v1/sport/${sport}/events/date/${today}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': apiHost,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from RapidAPI');
    }

    const data = await response.json();
    
    // 여기서 API 응답 데이터를 우리 사이트의 MATCHES 형식에 맞게 변환합니다.
    // (API마다 응답 구조가 다르므로, 실제 데이터를 확인하며 맵핑 로직을 정교화해야 합니다.)
    const matches = (data.events || []).map((event: any) => ({
      id: event.id,
      home: event.homeTeam?.name || 'Unknown',
      away: event.awayTeam?.name || 'Unknown',
      league: event.tournament?.name || 'League',
      sport: sport,
      time: new Date(event.startTimestamp * 1000).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }),
      live: event.status?.type === 'inprogress',
      odds: {
        h: 0, // 배당 데이터는 별도 엔드포인트 호출이 필요할 수 있습니다.
        d: 0,
        a: 0
      },
      ah: "-",
      ou: "-",
      openH: 0,
      movement: "steady"
    }));

    return NextResponse.json({ matches });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
