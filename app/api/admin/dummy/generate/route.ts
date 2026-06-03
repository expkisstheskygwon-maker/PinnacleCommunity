import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Korean Natural Nickname Pool to avoid unnatural/Chinese-looking names
const SURNAMES = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '전', '홍'];
const NICK_NOUNS = ['호랑이', '사자', '축구팬', '베터', '토토', '픽스터', '도사', '천재', '고수', '초보', '승요', '무패', '올인', '단폴', '픽업', '안바빠', '스포', '인생', '프로', '아마'];
const NICK_ADJECTIVES = ['눈부신', '슬픈', '즐거운', '화난', '신나는', '배고픈', '멋진', '착한', '나쁜', '빠른', '느린', '조용한', '시끄러운', '대담한', '소심한', '영리한', '바보같은'];
const NICK_SUFFIXES = ['1', '2', '88', '77', '99', 'x', 'pro', 'man', 'fan', '러브', '짱', '왕'];

function generateNickname() {
  const rand = Math.random();
  if (rand < 0.3) {
    // Adjective + Noun
    return `${NICK_ADJECTIVES[Math.floor(Math.random() * NICK_ADJECTIVES.length)]}${NICK_NOUNS[Math.floor(Math.random() * NICK_NOUNS.length)]}`;
  } else if (rand < 0.6) {
    // Noun + Suffix
    return `${NICK_NOUNS[Math.floor(Math.random() * NICK_NOUNS.length)]}${NICK_SUFFIXES[Math.floor(Math.random() * NICK_SUFFIXES.length)]}`;
  } else if (rand < 0.8) {
    // Normal Name-like Nickname
    return `${SURNAMES[Math.floor(Math.random() * SURNAMES.length)]}${NICK_NOUNS[Math.floor(Math.random() * NICK_NOUNS.length)]}`;
  } else {
    // Typo/Slang infused nickname
    const typos = ['붸팅', '추꾸', '톳토', '올인러', '한폴락', '무승부대기'];
    return `${typos[Math.floor(Math.random() * typos.length)]}${Math.floor(Math.random() * 100)}`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');
    if (!adminSession?.value) {
      return NextResponse.json({ success: false, error: '관리자 로그인이 필요합니다.' }, { status: 401 });
    }

    const {
      crawledData,
      aiProvider = 'gemini',
      apiKey,
      aiParams = {},
      localParams = {}
    } = await request.json();

    if (!crawledData || !Array.isArray(crawledData) || crawledData.length === 0) {
      return NextResponse.json({ success: false, error: '크롤링된 데이터가 필요합니다.' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'AI API Key를 입력해주세요.' }, { status: 400 });
    }

    const totalCount = localParams.totalCount || 100;

    // 1. Build prompt for AI to rewrite the raw scraped content
    const systemPrompt = `당신은 커뮤니티 데이터 분석 및 게시글 생성 전문가입니다.
제공된 크롤링 데이터를 기반으로, 지정된 가공 조건에 맞춰 원본과 맥락을 같이 하되, 완전히 새로 쓰여진 고유한 게시글 및 댓글 템플릿(최소 5개 세트)을 한국어 JSON 배열 형식으로 만들어 주세요.

[가공 조건]
- 페르소나/성향: 성별(${aiParams.gender || '무작위'}), 연령대(${aiParams.age || '20~30대'}), 직업군(${aiParams.occupation || '직장인'})
- 본문 및 댓글 스타일: ${aiParams.tone || '일반적인 커뮤니티 글'}
- 오탈자 포함 여부: ${aiParams.typos ? '자연스러운 한글 오탈자 및 띄어쓰기 오류 가끔 포함' : '오탈자 없이 깔끔하게 작성'}

[반드시 준수할 JSON 출력 규격]
출력은 코드 블록이나 마크다운 없이 오직 순수한 JSON Array여야 하며, 다음 키를 가지고 있어야 합니다:
[
  {
    "title": "맥락을 반영하여 가공한 새로운 제목",
    "content": "가공 및 다채로운 키워드로 구성된 풍부한 본문 내용 HTML (p, br 태그 등 적절히 활용)",
    "baseComments": ["댓글 1", "댓글 2", "댓글 3"]
  }
]`;

    const userPrompt = `다음 크롤링한 원본 데이터를 가공 조건에 맞추어 5개의 독립된 게시글 세트로 만들어 주세요.
원본 데이터:
${JSON.stringify(crawledData, null, 2)}`;

    let baseTemplates: any[] = [];

    // 2. Call AI Provider
    if (aiProvider === 'gemini') {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
              }
            ],
            generationConfig: {
              responseMimeType: 'application/json'
            }
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API 호출 실패: ${errorText}`);
      }

      const resJson = await response.json();
      const text = resJson.candidates?.[0]?.content?.parts?.[0]?.text || '';
      baseTemplates = JSON.parse(text.trim());
    } else if (aiProvider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API 호출 실패: ${errorText}`);
      }

      const resJson = await response.json();
      const text = resJson.choices?.[0]?.message?.content || '';
      // OpenAI might return it wrapped in a root object, let's extract the array
      const parsed = JSON.parse(text.trim());
      baseTemplates = Array.isArray(parsed) ? parsed : (parsed.posts || Object.values(parsed)[0] || []);
    } else {
      throw new Error('지원하지 않는 AI 제공자입니다.');
    }

    if (!Array.isArray(baseTemplates) || baseTemplates.length === 0) {
      throw new Error('AI 가공 결과 데이터 형식이 올바르지 않습니다.');
    }

    // 3. Local scaling engine (Expand to totalCount posts)
    const expandedPosts: any[] = [];
    const now = new Date();

    // Map base comments to generate dynamic sub-replies
    const commentRepliesPool = [
      'ㄹㅇ 공감합니다 ㅋㅋㅋ', '좋은 정보 감사합니다!', '이거 진짜인듯', '대박이네요',
      '와 대단하다', '근데 이건 케바케 아닌가요?', '한수 배웁니다.', '동의합니다 추천 누르고 가요',
      '인정 ㅋㅋㅋㅋ', '대박 ㅋㅋㅋㅋ', '아 글쿤요', '꿀팁 고맙습니다'
    ];

    for (let i = 0; i < totalCount; i++) {
      const template = baseTemplates[i % baseTemplates.length];
      
      // Add subtle random variations to titles & content locally so each is unique
      const randomSuffix = ['!', ' ㅋㅋ', '...', ' ㅇㅇ', ' 대박', ' 추천', ' 진짜네요', ' 공유합니다'][Math.floor(Math.random() * 8)];
      const variationTitle = `${template.title}${randomSuffix} (${i+1})`;
      
      // Dynamic content variation
      let variationContent = template.content;
      if (Math.random() > 0.5) {
        variationContent += `<p class="mt-4 text-xs text-muted-foreground">※ 본 게시글은 회원 정보 보호 및 커뮤니티 활성화를 위해 작성된 정보성 글입니다.</p>`;
      }

      // Author & engagement relationship logic
      // Likes/views scale with comments count
      const author = generateNickname();
      const numComments = Math.floor(Math.random() * 12) + 1; // 1 to 12 comments
      const likes = Math.floor(numComments * (Math.random() * 3 + 1.5)) + Math.floor(Math.random() * 5);
      const views = Math.floor(likes * (Math.random() * 15 + 10)) + Math.floor(Math.random() * 40) + 10;
      
      // Date spread logic (spread posts back over the last N days)
      const daysOffset = Math.floor(Math.random() * 30); // 0 to 30 days ago
      const hoursOffset = Math.floor(Math.random() * 24);
      const minutesOffset = Math.floor(Math.random() * 60);
      const postDate = new Date(now.getTime() - (daysOffset * 24 * 60 * 60 * 1000 + hoursOffset * 60 * 60 * 1000 + minutesOffset * 60 * 1000));

      // Generate Comments
      const postComments: any[] = [];
      const numBaseComments = Math.min(numComments, template.baseComments?.length || 0);
      
      for (let c = 0; c < numComments; c++) {
        const commentAuthor = generateNickname();
        let commentText = '';
        if (c < numBaseComments) {
          commentText = template.baseComments[c];
        } else {
          commentText = commentRepliesPool[Math.floor(Math.random() * commentRepliesPool.length)];
        }

        const commentLikes = Math.floor(Math.random() * (likes / 2));
        const commentTimeOffset = Math.floor(Math.random() * 120) + 5; // 5 to 125 minutes after post
        const commentDate = new Date(postDate.getTime() + commentTimeOffset * 60 * 1000);

        postComments.push({
          author: commentAuthor,
          content: commentText,
          likes: commentLikes,
          createdAt: commentDate.toISOString()
        });
      }

      expandedPosts.push({
        id: i + 1,
        title: variationTitle,
        content: variationContent,
        author: author,
        views: views,
        likes: likes,
        createdAt: postDate.toISOString(),
        comments: postComments
      });
    }

    return NextResponse.json({
      success: true,
      count: expandedPosts.length,
      posts: expandedPosts
    });
  } catch (error: any) {
    console.error('AI Generate API error:', error);
    return NextResponse.json({ success: false, error: error.message || '서버 오류' }, { status: 500 });
  }
}
