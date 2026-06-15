import { NextResponse } from 'next/server';

// 간단한 인메모리 캐시 (TTL: 6시간 = 6 * 60 * 60 * 1000 ms)
const cache: Record<string, { data: any, timestamp: number }> = {};
const CACHE_TTL = 6 * 60 * 60 * 1000;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fixtureId = searchParams.get('fixtureId');
  const sport = searchParams.get('sport') || 'soccer';
  
  if (!fixtureId) {
    return NextResponse.json({ error: 'fixtureId is required' }, { status: 400 });
  }

  const cacheKey = `predictions-${sport}-${fixtureId}`;
  if (cache[cacheKey] && (Date.now() - cache[cacheKey].timestamp < CACHE_TTL)) {
    return NextResponse.json(cache[cacheKey].data);
  }

  const apiKey = process.env.APISPORTS_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API Key missing' }, { status: 500 });
  }

  try {
    let predictions = [];

    if (sport === 'soccer') {
      const response = await fetch(`https://v3.football.api-sports.io/predictions?fixture=${fixtureId}`, {
        headers: { 'x-apisports-key': apiKey },
        next: { revalidate: 3600 }
      });

      if (response.ok) {
        const data = await response.json();
        const predData = data.response?.[0]?.predictions;
        
        if (predData) {
          const homeP = parseInt(predData.percent?.home?.replace('%', '') || '33');
          const awayP = parseInt(predData.percent?.away?.replace('%', '') || '33');
          
          // AI 봇 1 (알파 - 확률 기반)
          predictions.push({
            botName: "AI 데이터봇 알파",
            botAvatar: "A",
            scoreHome: homeP > awayP ? 2 : 1,
            scoreAway: awayP > homeP ? 2 : 1,
            winRate: 65,
            pick: homeP > awayP ? "홈 승" : (awayP > homeP ? "원정 승" : "무승부")
          });

          // AI 봇 2 (베타 - 어드바이스 기반)
          predictions.push({
            botName: "AI 통계봇 베타",
            botAvatar: "B",
            scoreHome: homeP > awayP ? 3 : 0,
            scoreAway: awayP > homeP ? 3 : 0,
            winRate: 55,
            pick: predData.advice || "분석 중"
          });
          
          // AI 봇 3 (감마 - 다른 기준)
          predictions.push({
            botName: "AI 밸류봇 감마",
            botAvatar: "G",
            scoreHome: 1,
            scoreAway: 1,
            winRate: 51,
            pick: predData.under_over ? `언더/오버 ${predData.under_over}` : "가치 베팅"
          });
        }
      }
    }

    // 데이터가 없거나 축구가 아닌 경우 (임의의 폴백 데이터 생성)
    if (predictions.length === 0) {
      predictions = [
        { botName: "AI 데이터봇 알파", botAvatar: "A", scoreHome: 0, scoreAway: 0, winRate: 60, pick: "데이터 부족" },
        { botName: "AI 통계봇 베타", botAvatar: "B", scoreHome: 0, scoreAway: 0, winRate: 55, pick: "데이터 부족" }
      ];
    }

    const result = { success: true, predictions };
    
    // 캐시에 저장
    cache[cacheKey] = { data: result, timestamp: Date.now() };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Prediction fetch error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
