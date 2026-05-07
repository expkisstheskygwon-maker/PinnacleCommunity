/**
 * Pinnacle Betting Resources Scraper
 * 매일 최신글 2~3개를 긁어와 우리 사이트에 자동으로 업로드합니다.
 */

const BOT_KEY = 'pinnacle_bot_secret_2026'; // wrangler.toml과 일치해야 함
const TARGET_URL = 'https://www.pinnacle.com/betting-resources/ko';
const API_ENDPOINT = 'http://localhost:3000/api/bot/posts'; // 로컬 테스트용 (배포 시 운영 서버 URL로 변경)

async function scrapePinnacle() {
  console.log('--- Scraper Started ---');
  
  try {
    const response = await fetch(TARGET_URL);
    const html = await response.text();

    // 1. Next.js 데이터 추출 (가장 깨끗한 데이터 소스)
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if (!nextDataMatch) {
      throw new Error('Could not find __NEXT_DATA__ script');
    }

    const nextData = JSON.parse(nextDataMatch[1]);
    const articles = nextData.props.pageProps.initialState.content.articles || [];

    console.log(`Found ${articles.length} articles.`);

    // 2. 최신 3개 글만 처리
    const latestArticles = articles.slice(0, 3);

    for (const article of latestArticles) {
      console.log(`Processing: ${article.title}`);

      // 3. 우리 API 규격에 맞춰 데이터 가공
      const postData = {
        title: article.title,
        content: article.content || article.excerpt || article.description,
        category: 'spotlight', // 스포트라이트 게시판
        subCategory: '전문가 칼럼', // 소분류
        image: article.imageUrl || article.thumbnailUrl,
        externalUrl: `https://www.pinnacle.com${article.url}`
      };

      // 4. 우리 사이트 API로 전송
      try {
        const uploadRes = await fetch(API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-bot-key': BOT_KEY
          },
          body: JSON.stringify(postData)
        });

        const result = await uploadRes.json();
        if (result.success) {
          if (result.duplicated) {
            console.log(`[Skip] Already uploaded: ${article.title}`);
          } else {
            console.log(`[Success] Uploaded: ${article.title} (ID: ${result.postId})`);
          }
        } else {
          console.error(`[Error] Failed to upload ${article.title}:`, result.error);
        }
      } catch (e) {
        console.error(`[Network Error] API call failed:`, e.message);
      }
    }

  } catch (error) {
    console.error('Scraper Fatal Error:', error);
  }

  console.log('--- Scraper Finished ---');
}

// 실행
scrapePinnacle();
