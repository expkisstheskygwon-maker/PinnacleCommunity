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
    
    // Pinnacle은 구조가 자주 바뀜. 최신글은 보통 boxesBottom이나 mainStageData에 있음
    let articles = [];
    
    // 1. boxesBottom (최신 목록)
    if (nextData.props.pageProps.boxesBottom) {
      nextData.props.pageProps.boxesBottom.forEach(box => {
        if (box.listing && Array.isArray(box.listing)) {
          articles = [...articles, ...box.listing];
        }
      });
    }

    // 2. mainStageData (Featured/Main articles)
    if (nextData.props.pageProps.mainStageData) {
      try {
        const mainArticles = JSON.parse(nextData.props.pageProps.mainStageData);
        if (Array.isArray(mainArticles)) {
          articles = [...articles, ...mainArticles];
        }
      } catch (e) {
        console.error('Failed to parse mainStageData', e);
      }
    }

    // 3. Fallback
    if (articles.length === 0) {
      articles = nextData.props.pageProps.initialState?.content?.articles || [];
    }

    // 중복 제거 (nid 또는 title 기준)
    const uniqueArticles = [];
    const seenTitles = new Set();
    for (const art of articles) {
      if (art.title && !seenTitles.has(art.title)) {
        uniqueArticles.push(art);
        seenTitles.add(art.title);
      }
    }
    articles = uniqueArticles;

    console.log(`Found ${articles.length} articles.`);

    // 2. 최신글 처리
    const count = process.env.SCRAPE_COUNT ? parseInt(process.env.SCRAPE_COUNT) : 3;
    const latestArticles = articles.slice(0, count);

    for (const article of latestArticles) {
      console.log(`Processing: ${article.title}`);

      // 3. 데이터 가공 (구조별 매핑)
      const title = article.title;
      const content = article.description || article.bodyListing || article.summaryListing || article.content || "";
      
      // 이미지 경로 처리
      let image = null;
      if (article.image) {
        image = article.image;
      } else if (article.featuredImage && article.featuredImage.length > 0) {
        image = article.featuredImage[0].horizontalCardImage;
      }
      const finalImage = image ? (image.startsWith('http') ? image : `https://www.pinnacle.com${image}`) : null;

      // 외부 URL 처리
      const alias = article.alias || article.pathAlias || "";
      const externalUrl = alias ? (alias.startsWith('http') ? alias : `https://www.pinnacle.com/betting-resources/ko${alias}`) : null;

      const postData = {
        title: title,
        content: content,
        category: 'spotlight',
        subCategory: '최신 동향',
        image: finalImage,
        externalUrl: externalUrl
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
