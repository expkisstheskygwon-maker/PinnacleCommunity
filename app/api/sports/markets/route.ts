import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fixtureId = searchParams.get('fixtureId');
  const sport = searchParams.get('sport') || 'soccer';
  
  const apiKey = process.env.APISPORTS_KEY;

  if (!fixtureId) {
    return NextResponse.json({ error: 'Fixture ID is required' }, { status: 400 });
  }

  if (!apiKey) {
    return NextResponse.json({ error: 'API Key missing' }, { status: 500 });
  }

  // 종목별 호스트 설정
  let host = '';
  switch (sport) {
    case 'soccer': host = 'v3.football.api-sports.io'; break;
    case 'baseball': host = 'v1.baseball.api-sports.io'; break;
    case 'basketball': host = 'v2.nba.api-sports.io'; break;
    default: host = `v1.${sport}.api-sports.io`;
  }

  const url = `https://${host}/odds?fixture=${fixtureId}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'x-apisports-key': apiKey },
    });

    if (!response.ok) throw new Error(`Failed to fetch markets for ${fixtureId}`);
    const data = await response.json();
    
    // API 데이터가 없는 경우를 대비한 Mock 데이터 생성 (데모용)
    if (!data.response || data.response.length === 0) {
      return NextResponse.json({
        success: true,
        isDemo: true,
        markets: [
          {
            name: "Match Winner",
            values: [
              { value: "Home", odd: "2.10" },
              { value: "Draw", odd: "3.40" },
              { value: "Away", odd: "3.60" }
            ]
          },
          {
            name: "Both Teams to Score",
            values: [
              { value: "Yes", odd: "1.85" },
              { value: "No", odd: "2.05" }
            ]
          },
          {
            name: "Correct Score",
            values: [
              { value: "1:0", odd: "7.50" },
              { value: "2:0", odd: "11.00" },
              { value: "1:1", odd: "6.50" },
              { value: "0:1", odd: "10.00" },
              { value: "2:1", odd: "14.00" },
              { value: "0:0", odd: "9.00" }
            ]
          },
          {
            name: "Goals Over/Under",
            values: [
              { value: "Over 2.5", odd: "1.95" },
              { value: "Under 2.5", odd: "1.95" },
              { value: "Over 3.5", odd: "3.20" },
              { value: "Under 3.5", odd: "1.35" }
            ]
          },
          {
            name: "Double Chance",
            values: [
              { value: "Home/Draw", odd: "1.30" },
              { value: "Home/Away", odd: "1.35" },
              { value: "Draw/Away", odd: "1.75" }
            ]
          },
          {
            name: "First Half Winner",
            values: [
              { value: "Home", odd: "2.80" },
              { value: "Draw", odd: "2.10" },
              { value: "Away", odd: "4.20" }
            ]
          }
        ]
      });
    }

    // 실제 데이터 가공 (첫 번째 북메이커 기준 - 보통 Pinnacle이나 Bet365)
    const bookmakers = data.response[0].bookmakers || [];
    const bookmaker = 
      bookmakers.find((b: any) => b.name.toLowerCase().includes('pinnacle')) || 
      bookmakers.find((b: any) => b.name.toLowerCase().includes('bet365')) || 
      bookmakers[0];

    return NextResponse.json({ 
      success: true, 
      isDemo: false,
      markets: bookmaker ? bookmaker.bets : [] 
    });
  } catch (error: any) {
    console.error('Markets API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
