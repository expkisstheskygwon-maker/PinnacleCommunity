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

function spinTitle(title: string): string {
  if (!title) return '';
  let spun = title;

  // Punctuation variations at the end
  spun = spun.replace(/\?$/g, () => {
    const rand = Math.random();
    if (rand < 0.3) return '??';
    if (rand < 0.6) return '? ㅋ';
    return '?';
  });

  spun = spun.replace(/\.$/g, () => {
    const rand = Math.random();
    if (rand < 0.3) return '!';
    if (rand < 0.6) return '...';
    return '.';
  });

  // Synonym replacements for title
  const synonyms = [
    { from: /축구/g, to: ['축구', '축구 경기'] },
    { from: /경기/g, to: ['경기', '게임', '매치'] },
    { from: /정말/g, to: ['정말', '진짜', '엄청'] },
    { from: /어제/g, to: ['어제', '지난'] },
    { from: /오늘/g, to: ['오늘', '금일'] }
  ];

  for (const item of synonyms) {
    spun = spun.replace(item.from, () => {
      return item.to[Math.floor(Math.random() * item.to.length)];
    });
  }

  // Add random prefix sometimes
  const randPrefix = Math.random();
  if (randPrefix < 0.1) spun = '와.. ' + spun;
  else if (randPrefix < 0.2) spun = '혹시 ' + spun;
  else if (randPrefix < 0.3) spun = '진짜 ' + spun;

  return spun;
}

function spinContent(htmlContent: string): string {
  if (!htmlContent) return '';
  
  let spun = htmlContent;

  // 1. Punctuation variations
  spun = spun.replace(/\.<\/p>/gi, () => {
    const rand = Math.random();
    if (rand < 0.25) return '!</p>';
    if (rand < 0.5) return ' ㅋ</p>';
    if (rand < 0.7) return '... </p>';
    return '.</p>';
  });

  spun = spun.replace(/습니다\./gi, () => {
    const rand = Math.random();
    if (rand < 0.3) return '습니다!';
    if (rand < 0.5) return '습니당';
    if (rand < 0.7) return '습니다...';
    return '습니다.';
  });

  spun = spun.replace(/합니다\./gi, () => {
    const rand = Math.random();
    if (rand < 0.3) return '합니다!';
    if (rand < 0.55) return '해요~';
    if (rand < 0.7) return '함.';
    if (rand < 0.8) return '하네요 ㅋ';
    return '합니다.';
  });

  spun = spun.replace(/요\./gi, () => {
    const rand = Math.random();
    if (rand < 0.25) return '요!';
    if (rand < 0.5) return '요 ㅋ';
    if (rand < 0.7) return '요...';
    return '요.';
  });

  // 2. Insert natural Korean filler words at the beginning of paragraphs
  spun = spun.replace(/<p>/gi, () => {
    const rand = Math.random();
    if (rand < 0.08) return '<p>진짜 ';
    if (rand < 0.16) return '<p>솔직히 ';
    if (rand < 0.24) return '<p>근데 ';
    if (rand < 0.30) return '<p>와 ';
    if (rand < 0.36) return '<p>혹시 ';
    return '<p>';
  });

  // 3. Synonym replacements (subtle and context-safe)
  const synonyms = [
    { from: /축구/g, to: ['축구', '축구 경기', '볼차기'] },
    { from: /경기/g, to: ['경기', '게임', '매치'] },
    { from: /선수/g, to: ['선수', '멤버', '플레이어'] },
    { from: /정말/g, to: ['정말', '진짜', '참', '엄청'] },
    { from: /생각/g, to: ['생각', '의견', '느낌'] },
    { from: /정보/g, to: ['정보', '소식', '글'] },
    { from: /추천/g, to: ['추천', '추천글', '강추'] }
  ];

  for (const item of synonyms) {
    spun = spun.replace(item.from, () => {
      return item.to[Math.floor(Math.random() * item.to.length)];
    });
  }

  return spun;
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

    const toneDescription = aiParams.tone === 'random' 
      ? '각 세트별로 서로 다른 톤앤매너(예: 1번 세트는 매우 신난 어조, 2번 세트는 화가 난 어조, 3번 세트는 TMI 수다, 4번 세트는 짧고 무성의한 코멘트, 5번 세트는 진지한 정보글 등)를 다채롭게 골고루 지정하여 작성'
      : (aiParams.tone || '일반적인 커뮤니티 글');

    // 1. Build prompt for AI to rewrite the raw scraped content
    const systemPrompt = `당신은 커뮤니티 데이터 분석 및 게시글 생성 전문가입니다.
제공된 크롤링 데이터를 기반으로, 지정된 가공 조건에 맞춰 원본과 맥락을 같이 하되, 완전히 새로 쓰여진 고유한 게시글 및 댓글 템플릿(최소 10개 세트)을 한국어 JSON 배열 형식으로 만들어 주세요.

[가공 조건]
- 페르소나/성향: 성별(${aiParams.gender || '무작위'}), 연령대(${aiParams.age || '20~30대'}), 직업군(${aiParams.occupation || '직장인'})
- 본문 및 댓글 스타일: ${toneDescription}
- 오탈자 포함 여부: ${aiParams.typos ? '자연스러운 한글 오탈자 및 띄어쓰기 오류 가끔 포함' : '오탈자 없이 깔끔하게 작성'}

[필수 요구사항]
1. 본문이나 댓글에 'OOO', 'XXX', '김OO', '이모씨' 등 이름/선수명/단체명/날짜 등을 지칭하는 임의의 플레이스홀더를 절대 사용하지 마세요. 필요한 경우 맥락에 어울리는 구체적이고 실제 스포츠 스타(예: 손흥민, 김민재, 메시 등)나 팀명 등 적절한 명칭을 자연스럽게 사용하거나 명칭을 생략하고 대명사로 표현하여 실존 유저가 쓴 것처럼 매끄럽고 자연스러운 문장으로 작성해 주세요.
2. '※ 본 게시글은 회원 정보 보호...' 와 같은 안내문, 다짐, 공지성 멘트나 정보성 글임을 나타내는 사족을 게시글 본문 및 댓글에 절대 포함하지 마세요. 오직 일반 유저가 작성한 것 같은 게시글 내용만 출력해야 합니다.

[반드시 준수할 JSON 출력 규격]
출력은 코드 블록이나 마크다운 없이 오직 순수한 JSON Array여야 하며, 다음 키를 가지고 있어야 합니다:
[
  {
    "title": "맥락을 반영하여 가공한 새로운 제목",
    "content": "가공 및 다채로운 키워드로 구성된 풍부한 본문 내용 HTML (p, br 태그 등 적절히 활용)",
    "baseComments": ["댓글 1", "댓글 2", "댓글 3"]
  }
]`;

    const userPrompt = `다음 크롤링한 원본 데이터를 가공 조건에 맞추어 10개의 독립된 게시글 세트로 만들어 주세요.
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
      
      // Add subtle random variations to titles & content locally so each is unique and looks natural
      const randomSuffixes = ['', '!', ' ㅋㅋ', '...', ' ㅇㅇ', ' 대박', ' 추천', ' 진짜네요', ' 공유합니다', ' ㅎ', ' 대박이네요', ' 강추', '👍', '🔥', ' 후기', ' 대박인듯'];
      const randomSuffix = randomSuffixes[Math.floor(Math.random() * randomSuffixes.length)];
      const variationTitle = spinTitle(`${template.title}${randomSuffix}`);
      
      // Dynamic content variation with local synonym and ending spinners
      let variationContent = spinContent(template.content);

      // Author & engagement relationship logic
      // Likes/views scale with comments count
      const author = generateNickname();
      const numComments = Math.floor(Math.random() * 12) + 1; // 1 to 12 comments
      const likes = Math.floor(numComments * (Math.random() * 3 + 1.5)) + Math.floor(Math.random() * 5);
      const views = Math.floor(likes * (Math.random() * 15 + 10)) + Math.floor(Math.random() * 40) + 10;
      
      // Date spread logic (spread posts back over the last N days or cluster around an event)
      let postDate: Date;
      if (localParams.dateMode === 'event' && localParams.eventDate) {
        const baseDate = new Date(localParams.eventDate);
        const durationHours = localParams.eventDuration || 6;
        
        // 85% of posts clustered in the event window, 15% spread around it
        const isCluster = Math.random() < 0.85;
        if (isCluster) {
          const offsetMs = Math.random() * durationHours * 60 * 60 * 1000;
          postDate = new Date(baseDate.getTime() + offsetMs);
        } else {
          // Spread from -24 hours to +48 hours
          const offsetMs = (Math.random() * 72 - 24) * 60 * 60 * 1000;
          postDate = new Date(baseDate.getTime() + offsetMs);
        }
      } else {
        const daysOffset = Math.floor(Math.random() * 30); // 0 to 30 days ago
        const hoursOffset = Math.floor(Math.random() * 24);
        const minutesOffset = Math.floor(Math.random() * 60);
        postDate = new Date(now.getTime() - (daysOffset * 24 * 60 * 60 * 1000 + hoursOffset * 60 * 60 * 1000 + minutesOffset * 60 * 1000));
      }

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
        
        // Faster reaction time during event clustering (e.g. 1 to 30 mins)
        const maxOffset = localParams.dateMode === 'event' ? 30 : 120;
        const commentTimeOffset = Math.floor(Math.random() * maxOffset) + 1; // 1 to maxOffset minutes after post
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
