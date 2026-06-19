import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

// 한글 팀명 매핑 딕셔너리 (검색 정확도 향상용)
const KOREAN_TEAM_MAP: Record<string, string[]> = {
  "real madrid": ["레알", "마드리드", "레알마드리드"],
  "barcelona": ["바르샤", "바르셀로나", "fc바르셀로나"],
  "manchester united": ["맨유", "맨체스터", "맨체스터유나이티드", "맨체스터 utd"],
  "manchester city": ["맨시티", "맨체스터시티", "맨체스터 city"],
  "liverpool": ["리버풀"],
  "arsenal": ["아스날", "아스널"],
  "chelsea": ["첼시"],
  "tottenham": ["토트넘", "홋스퍼", "토튼햄"],
  "paris saint germain": ["파리", "psg", "파리생제르망", "파리생제르맹", "생제르망"],
  "bayern munich": ["뮌헨", "바이에른뮌헨", "바이에른 뮌헨"],
  "dortmund": ["도르트문트"],
  "juventus": ["유벤투스"],
  "ac milan": ["밀란", "ac밀란"],
  "inter": ["인테르", "인터밀란", "인터 밀란"],
  "atletico madrid": ["아틀레티코", "꼬마", "at마드리드", "아틀레티코 마드리드"],
  "napoli": ["나폴리"],
  "roma": ["로마", "as로마"],
  "ajax": ["아약스"],
  // 야구 (MLB/KBO 등)
  "dodgers": ["다저스", "la다저스", "LA 다저스"],
  "yankees": ["양키스", "뉴욕양키스", "뉴욕 양키스"],
  "red sox": ["레드삭스", "보스턴"],
  "giants": ["자이언츠"],
  "padres": ["파드리스", "샌디에이고"],
  // 농구 (NBA)
  "lakers": ["레이커스", "la레이커스", "LA 레이커스"],
  "warriors": ["워리어스", "골든스테이트", "골스"],
  "celtics": ["셀틱스", "보스턴 셀틱스"],
  "bulls": ["불스", "시카고 불스"],
  "nets": ["네츠", "브루클린 네츠"],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const sport = searchParams.get('sport') || 'all';
  const dateParam = searchParams.get('date');

  if (!query || query.trim() === '') {
    return NextResponse.json({ success: false, error: '검색어를 입력해주세요.' }, { status: 400 });
  }

  const searchKeyword = query.trim().toLowerCase();
  const targetDate = dateParam ? dateParam : new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split('T')[0];
  const origin = new URL(request.url).origin;

  try {
    // 1. 해당 날짜의 경기 목록 조회
    // matches API를 호출하여 데이터 획득 (내부 메모리 캐시 및 Fallback 동작 활용)
    const sportsToFetch = sport === 'all' ? ['soccer', 'baseball', 'basketball'] : [sport];
    
    const results = await Promise.all(
      sportsToFetch.map(async (sportKey) => {
        try {
          const res = await fetch(`${origin}/api/sports/matches?sport=${sportKey}&date=${targetDate}`);
          if (!res.ok) return [];
          const data = await res.json();
          return data.matches || [];
        } catch (err) {
          console.error(`Failed to fetch ${sportKey} matches for search:`, err);
          return [];
        }
      })
    );

    const allMatches = results.flat();

    // 2. 검색 매칭 알고리즘 적용
    const matchedMatches = allMatches.filter((match: any) => {
      const homeName = match.home.toLowerCase();
      const awayName = match.away.toLowerCase();
      const leagueName = (match.league || '').toLowerCase();

      // 영문명 단순 매칭
      if (homeName.includes(searchKeyword) || awayName.includes(searchKeyword) || leagueName.includes(searchKeyword)) {
        return true;
      }

      // 한글 딕셔너리 기반 매칭
      // KOREAN_TEAM_MAP의 key가 영문명에 포함되는지 확인하고, 해당 key에 할당된 한글 목록에 검색어가 포함되는지 대조
      for (const [engName, koNames] of Object.entries(KOREAN_TEAM_MAP)) {
        const isHomeMatch = homeName.includes(engName);
        const isAwayMatch = awayName.includes(engName);
        
        if (isHomeMatch || isAwayMatch) {
          const matchKo = koNames.some(koName => koName.includes(searchKeyword) || searchKeyword.includes(koName));
          if (matchKo) return true;
        }
      }

      return false;
    });

    return NextResponse.json({ success: true, matches: matchedMatches });
  } catch (error: any) {
    console.error("Match search error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
