/**
 * Pinnacle Betting Resources Scraper
 * 매일 최신글을 긁어와 우리 사이트의 '스포트라이트 > 최신 동향'에 업로드합니다.
 */

const BOT_KEY = process.env.BOT_API_KEY || 'pinnacle_bot_secret_2026';
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const API_ENDPOINT = `${API_BASE_URL}/api/bot/posts`;
const TARGET_URL = 'https://www.pinnacle.com/betting-resources/ko';

async function scrapePinnacle() {
  console.log(`--- Scraper Started at ${new Date().toISOString()} ---`);
  
  try {
    const response = await fetch(TARGET_URL);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const html = await response.text();

    // 1. Next.js 데이터 추출
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if (!nextDataMatch) {
      throw new Error('Could not find __NEXT_DATA__ script.');
    }

    const nextData = JSON.parse(nextDataMatch[1]);
    
    // Pinnacle은 mainStageData에 메인 최신글을 문자열화된 JSON으로 담고 있음
    let articles = [];
    if (nextData.props.pageProps.mainStageData) {
      articles = JSON.parse(nextData.props.pageProps.mainStageData);
    } else {
      // 대체 경로 확인 (구조 변경 대비)
      articles = nextData.props.pageProps.initialState?.content?.articles || [];
    }

    console.log(`Found ${articles.length} articles.`);

    // 2. 최신글 처리
    const count = process.env.SCRAPE_COUNT ? parseInt(process.env.SCRAPE_COUNT) : 1;
    const latestArticles = articles.slice(0, count);

    for (const article of latestArticles) {
      console.log(`Processing: ${article.title}`);

      // 3. 데이터 가공
      const postData = {
        title: article.title,
        content: article.description || article.content || "",
        category: 'spotlight',
        subCategory: '최신 동향',
        image: article.image ? `https://www.pinnacle.com${article.image}` : null,
        externalUrl: `https://www.pinnacle.com/betting-resources/ko${article.alias}`
      };

      // 4. API 전송
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
            console.log(`[Skip] Already exists: ${article.title}`);
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
    process.exit(1);
  }

  console.log('--- Scraper Finished ---');
}

scrapePinnacle();
