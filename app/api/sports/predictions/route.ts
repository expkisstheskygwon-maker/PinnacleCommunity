import { NextResponse } from 'next/server';

// 간단한 인메모리 캐시 (TTL: 6시간 = 6 * 60 * 60 * 1000 ms)
const cache: Record<string, { data: any, timestamp: number }> = {};
const CACHE_TTL = 6 * 60 * 60 * 1000;

// 결정론적 해시 함수 (일정한 예측 결과 반환을 위해 사용)
function getDeterministicHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fixtureId = searchParams.get('fixtureId');
  const sport = searchParams.get('sport') || 'soccer';
  const home = searchParams.get('home') || '홈팀';
  const away = searchParams.get('away') || '원정팀';
  
  const oddsHParam = searchParams.get('oddsH');
  const oddsDParam = searchParams.get('oddsD');
  const oddsAParam = searchParams.get('oddsA');

  if (!fixtureId) {
    return NextResponse.json({ error: 'fixtureId is required' }, { status: 400 });
  }

  const cacheKey = `predictions-${sport}-${fixtureId}`;
  if (cache[cacheKey] && (Date.now() - cache[cacheKey].timestamp < CACHE_TTL)) {
    return NextResponse.json(cache[cacheKey].data);
  }

  const apiKey = process.env.APISPORTS_KEY;

  try {
    let predictions: any[] = [];

    // 축구인 경우 API-Sports 예측 정보 가져오기 시도
    if (sport === 'soccer' && apiKey) {
      try {
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
              winRate: 62,
              pick: predData.advice || "분석 중"
            });
            
            // AI 봇 3 (감마 - 해외 배당 오버/언더 또는 핸디캡)
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
      } catch (err) {
        console.error("API-Sports soccer prediction fetch error:", err);
      }
    }

    // 예측 데이터가 생성되지 않았거나 다른 종목인 경우 (결정론적 휴리스틱 알고리즘 구동)
    if (predictions.length === 0) {
      const hash = getDeterministicHash(fixtureId);
      
      // 1. 배당 파싱 및 정규화
      let oddsH = oddsHParam ? parseFloat(oddsHParam) : 0;
      let oddsD = oddsDParam ? parseFloat(oddsDParam) : 0;
      let oddsA = oddsAParam ? parseFloat(oddsAParam) : 0;

      // 배당 데이터가 없다면 고유 해시값을 바탕으로 사실적인 배당 생성
      if (oddsH <= 0 && oddsA <= 0) {
        const hashType = hash % 3;
        if (hashType === 0) { // 홈 정배
          oddsH = 1.45 + (hash % 30) / 100; // 1.45 ~ 1.75
          oddsD = 3.20 + (hash % 40) / 100; // 3.20 ~ 3.60
          oddsA = 4.20 + (hash % 150) / 100; // 4.20 ~ 5.70
        } else if (hashType === 1) { // 원정 정배
          oddsH = 3.90 + (hash % 120) / 100; // 3.90 ~ 5.10
          oddsD = 3.10 + (hash % 40) / 100; // 3.10 ~ 3.50
          oddsA = 1.50 + (hash % 35) / 100; // 1.50 ~ 1.85
        } else { // 팽팽한 매치
          oddsH = 2.15 + (hash % 35) / 100; // 2.15 ~ 2.50
          oddsD = 2.90 + (hash % 30) / 100; // 2.90 ~ 3.20
          oddsA = 2.60 + (hash % 40) / 100; // 2.60 ~ 3.00
        }
      }

      // 무승부가 존재하지 않는 종목(농구, 야구 등)은 oddsD = 0 처리
      const hasDraw = sport === 'soccer';
      if (!hasDraw) {
        oddsD = 0;
      }

      // 2. 승리 확률 역산 (Implied Probability)
      let rawH = oddsH > 0 ? 1 / oddsH : 0.45;
      let rawD = oddsD > 0 ? 1 / oddsD : 0.0;
      let rawA = oddsA > 0 ? 1 / oddsA : 0.45;
      
      if (!hasDraw && oddsH <= 0 && oddsA <= 0) {
        rawH = 0.52;
        rawA = 0.48;
      }

      const totalRaw = rawH + rawD + rawA;
      const probH = Math.round((rawH / totalRaw) * 100);
      const probD = hasDraw ? Math.round((rawD / totalRaw) * 100) : 0;
      const probA = 100 - probH - probD;

      // 3. 종목별 점수 시뮬레이션
      let scoreH = 0;
      let scoreA = 0;
      let alphaPick = "무승부";
      let betaPick = "무승부";
      let gammaPick = "언더 2.5";

      if (sport === 'soccer') {
        const totalGoals = 1 + (hash % 4); // 1 ~ 4골
        if (probH > probA + 5) {
          alphaPick = "홈 승";
          scoreH = Math.max(1, Math.round(totalGoals * (probH / 100) + 0.3));
          scoreA = Math.max(0, totalGoals - scoreH);
          if (scoreH <= scoreA) scoreH = scoreA + 1;
        } else if (probA > probH + 5) {
          alphaPick = "원정 승";
          scoreA = Math.max(1, Math.round(totalGoals * (probA / 100) + 0.3));
          scoreH = Math.max(0, totalGoals - scoreA);
          if (scoreA <= scoreH) scoreA = scoreH + 1;
        } else {
          alphaPick = "무승부";
          scoreH = Math.round(totalGoals / 2);
          scoreA = scoreH;
        }
        
        // 베타 Pick 코멘트
        if (alphaPick === "홈 승") {
          const templates = [
            `${home}의 홈 전술적 우위와 점유율 장악이 돋보입니다.`,
            `${home}의 핵심 공격수 폼이 매우 좋으며 최근 득점 기동력이 우세합니다.`,
            `${home}의 중원 빌드업 조직력이 ${away}의 수비벽보다 앞섭니다.`
          ];
          betaPick = templates[hash % templates.length] + " 홈 승을 추천합니다.";
        } else if (alphaPick === "원정 승") {
          const templates = [
            `${away}의 탄탄한 역습 전술과 원정 경기 기세가 매섭습니다.`,
            `${away}의 공격 전개 속도가 ${home}의 백포 라인을 무너뜨릴 것입니다.`,
            `${home}의 최근 수비 누수가 심각하여 ${away}의 원정 승리가 기대됩니다.`
          ];
          betaPick = templates[hash % templates.length] + " 원정 승을 추천합니다.";
        } else {
          const templates = [
            "두 팀의 최근 전력차가 크지 않아 치열한 미드필더 진흙탕 싸움이 예상됩니다.",
            "수비 중심의 보수적인 경기 운영으로 저득점 무승부 가능성이 매우 큽니다.",
            "맞대결 전적에서 양 팀의 전술이 서로를 상쇄하는 흐름을 보여줍니다."
          ];
          betaPick = templates[hash % templates.length] + " 무승부를 예상합니다.";
        }

        // 감마 Pick (오버/언더 또는 핸디캡)
        const isOver = (scoreH + scoreA) >= 2.5;
        gammaPick = isOver ? "언더/오버 2.5 오버" : "언더/오버 2.5 언더";

      } else if (sport === 'basketball') {
        // 농구 스코어 (85 ~ 115점)
        const avgScore = 95 + (hash % 16); // 95 ~ 110
        const scoreDiff = 2 + (hash % 9);  // 2 ~ 10점 차이
        if (probH >= probA) {
          alphaPick = "홈 승";
          scoreH = avgScore + Math.round(scoreDiff / 2);
          scoreA = avgScore - Math.round(scoreDiff / 2);
        } else {
          alphaPick = "원정 승";
          scoreA = avgScore + Math.round(scoreDiff / 2);
          scoreH = avgScore - Math.round(scoreDiff / 2);
        }

        if (alphaPick === "홈 승") {
          betaPick = `${home}의 높이 우위(리바운드)와 골밑 장악력이 앞섭니다. 홈 승을 예상합니다.`;
        } else {
          betaPick = `${away}의 백코트 빠른 공수전환과 외곽 3점슛의 지원이 월등합니다. 원정 승을 권장합니다.`;
        }

        // 감마 Pick (농구 오버/언더)
        const totalBasketballPoints = scoreH + scoreA;
        const line = 195.5 + (hash % 10); // 195.5 ~ 204.5
        gammaPick = totalBasketballPoints > line ? `언더/오버 ${line} 오버` : `언더/오버 ${line} 언더`;

      } else if (sport === 'baseball') {
        // 야구 스코어 (2 ~ 10점)
        const avgRuns = 4 + (hash % 5); // 4 ~ 8점
        const runDiff = 1 + (hash % 4); // 1 ~ 4점 차이
        if (probH >= probA) {
          alphaPick = "홈 승";
          scoreH = avgRuns + Math.round(runDiff / 2);
          scoreA = Math.max(0, avgRuns - Math.round(runDiff / 2));
          if (scoreH <= scoreA) scoreH = scoreA + 1;
        } else {
          alphaPick = "원정 승";
          scoreA = avgRuns + Math.round(runDiff / 2);
          scoreH = Math.max(0, avgRuns - Math.round(runDiff / 2));
          if (scoreA <= scoreH) scoreA = scoreH + 1;
        }

        if (alphaPick === "홈 승") {
          betaPick = `${home} 선발 투수의 최근 이닝 이팅 및 방어율이 월등하며 타선의 컨디션이 앞섭니다.`;
        } else {
          betaPick = `${away} 선발 에이스의 강력한 구위와 불펜진의 철벽 계투로 원정팀이 승기를 잡을 것입니다.`;
        }

        const totalBaseballRuns = scoreH + scoreA;
        const line = 7.5 + (hash % 3); // 7.5 ~ 9.5
        gammaPick = totalBaseballRuns > line ? `언더/오버 ${line} 오버` : `언더/오버 ${line} 언더`;
      } else {
        // 기타 종목 폴백
        alphaPick = probH >= probA ? "홈 승" : "원정 승";
        scoreH = probH >= probA ? 2 : 1;
        scoreA = probH >= probA ? 1 : 2;
        betaPick = "최근 전적 및 흐름 분석상 " + alphaPick + " 가능성이 높습니다.";
        gammaPick = "가치 베팅";
      }

      predictions = [
        {
          botName: "AI 데이터봇 알파",
          botAvatar: "A",
          scoreHome: scoreH,
          scoreAway: scoreA,
          winRate: 58 + (hash % 8), // 58% ~ 65%
          pick: alphaPick
        },
        {
          botName: "AI 통계봇 베타",
          botAvatar: "B",
          scoreHome: scoreH,
          scoreAway: scoreA,
          winRate: 60 + (hash % 6), // 60% ~ 65%
          pick: betaPick
        },
        {
          botName: "AI 밸류봇 감마",
          botAvatar: "G",
          scoreHome: scoreH,
          scoreAway: scoreA,
          winRate: 50 + (hash % 6), // 50% ~ 55%
          pick: gammaPick
        }
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
