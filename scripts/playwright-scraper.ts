import { chromium } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local for local testing
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Setup stealth
chromium.use(stealth());

const BOT_KEY = process.env.BOT_API_KEY || 'pinnacle_bot_secret_2026';
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const TARGETS_API = `${API_BASE_URL}/api/crawler/targets`;
const POST_API = `${API_BASE_URL}/api/bot/posts`;

const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  console.error("GEMINI_API_KEY is not set. AI transformation will be skipped.");
}

const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

async function rewriteContentWithAI(title: string, rawHtml: string) {
  if (!genAI) return { title, content: rawHtml };
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
당신은 한국의 스포츠 분석 커뮤니티의 전문 에디터입니다.
다음은 피나클(Pinnacle)의 최신 스포츠 분석글입니다.
우리의 스포츠 커뮤니티 성격에 맞게 존댓말을 사용하여 읽기 쉽고 매끄럽게 윤문해주세요.
SEO 최적화를 위해 원본의 의미를 살리되 문장 구조를 약간 변경해주시고, HTML 태그(h2, h3, p, strong 등)를 적절히 유지하여 서식을 살려주세요.
이미지 위치(<img> 태그)는 그대로 유지해야 합니다.
제목도 조금 더 클릭을 유도할 수 있는 매력적인 제목으로 변경해주세요.

원본 제목: ${title}
원본 내용 HTML:
${rawHtml}

응답은 반드시 JSON 형식으로, {"title": "변경된 제목", "content": "변경된 HTML 본문"} 형태로 반환해주세요. JSON 마크다운 블록이나 다른 텍스트 없이 순수 JSON만 반환하세요.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim().replace(/^```json/i, '').replace(/```$/i, '').trim();
    
    return JSON.parse(responseText);
  } catch (error) {
    console.error("AI Rewriting failed, falling back to original:", error);
    return { title, content: rawHtml };
  }
}

async function imageToBase64(page: any, imageUrl: string): Promise<string | null> {
  if (!imageUrl) return null;
  
  // URL이 절대 경로가 아닌 경우 보정
  const fullUrl = imageUrl.startsWith('http') ? imageUrl : `https://www.pinnacle.com${imageUrl}`;
  
  try {
    // Playwright page 컨텍스트 내에서 이미지를 가져옴 (Cloudflare 쿠키/세션 유지)
    const base64 = await page.evaluate(async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) return null;
      const blob = await res.blob();
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    }, fullUrl);
    
    return base64;
  } catch (error) {
    console.error(`Failed to download image ${fullUrl}:`, error);
    return null;
  }
}

async function scrapePinnacle() {
  console.log(`[Scraper] Started at ${new Date().toISOString()}`);

  // 1. Fetch target URLs
  let targets = [];
  try {
    const res = await fetch(TARGETS_API);
    if (!res.ok) throw new Error('Failed to fetch targets from API');
    const data = await res.json();
    targets = data.targets.filter((t: any) => t.isActive === 1);
  } catch (err) {
    console.error("[Scraper] Cannot connect to Target API:", err);
    console.log("[Scraper] Using default target for testing.");
    targets = [{ url: 'https://www.pinnacle.com/betting-resources/ko/spotlight', category: 'spotlight', subCategory: '최신 동향' }];
  }

  if (targets.length === 0) {
    console.log("[Scraper] No active targets found.");
    return;
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'ko-KR'
  });
  const page = await context.newPage();

  for (const target of targets) {
    console.log(`\n[Scraper] Processing target: ${target.url}`);
    
    try {
      await page.goto(target.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      
      // 약간 대기하여 JS 렌더링 완료 및 안티봇 챌린지 우회 확인
      await page.waitForTimeout(5000);

      // 본문 요소 추출 (피나클의 기사 컨텐츠 형태에 따라 조정)
      // 예시: 보통 클래스에 article, content, post 등이 포함됨
      // 실제 피나클 사이트는 __NEXT_DATA__ 를 렌더링하므로 화면의 HTML을 긁어오거나, 네트워크를 모니터링할 수도 있습니다.
      // 여기서는 화면 내 첫번째 게시글 블록을 추출한다고 가정합니다. (구조에 따라 CSS 선택자 변경 필요)
      
      const articles = await page.evaluate(() => {
        // 피나클의 전형적인 카드형 레이아웃 요소 찾기 (예시 CSS)
        const cards = document.querySelectorAll('a[href*="/betting-resources/ko/"]');
        const results = [];
        const seen = new Set();
        
        cards.forEach(card => {
          const href = (card as HTMLAnchorElement).href;
          if (seen.has(href)) return;
          if (href.includes('/author/')) return;
          
          seen.add(href);
          
          // 보통 제목은 h2나 특정 클래스를 가짐
          const titleEl = card.querySelector('h2') || card.querySelector('.title') || card.querySelector('span');
          const title = titleEl ? titleEl.textContent?.trim() : null;
          
          const imgEl = card.querySelector('img');
          const image = imgEl ? imgEl.src : null;
          
          if (title && href && image) {
            results.push({ url: href, title, image });
          }
        });
        
        return results;
      });

      console.log(`[Scraper] Found ${articles.length} potential articles on page.`);

      // 최상위 1개만 샘플 처리
      for (const article of articles.slice(0, 1)) {
        console.log(`[Scraper] Navigating to article: ${article.title}`);
        await page.goto(article.url, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(3000);

        // 상세 페이지에서 본문 HTML 긁기
        const contentHtml = await page.evaluate(() => {
          // 피나클 본문 컨테이너 (실제에 맞춰 CSS 선택자 수정)
          const contentWrapper = document.querySelector('article') || document.querySelector('.content') || document.querySelector('.main-stage');
          return contentWrapper ? contentWrapper.innerHTML : '';
        });

        if (!contentHtml) {
          console.log(`[Scraper] No content found for ${article.title}, skipping.`);
          continue;
        }

        // AI 재가공
        console.log(`[Scraper] AI Rewriting content...`);
        const { title: newTitle, content: newContent } = await rewriteContentWithAI(article.title, contentHtml);

        // 썸네일 썸네일 Base64 추출
        console.log(`[Scraper] Downloading main image...`);
        const imageBase64 = await imageToBase64(page, article.image);

        const postData = {
          title: newTitle,
          content: newContent,
          category: target.category,
          subCategory: target.subCategory,
          image: imageBase64, // API가 R2 업로드를 처리하도록 base64 전송
          externalUrl: article.url
        };

        // 전송
        console.log(`[Scraper] Uploading to API...`);
        const uploadRes = await fetch(POST_API, {
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
            console.log(`[Skip] Already exists: ${newTitle}`);
          } else {
            console.log(`[Success] Uploaded: ${newTitle} (ID: ${result.postId})`);
          }
        } else {
          console.error(`[Error] Failed to upload:`, result.error);
        }
      }

    } catch (err) {
      console.error(`[Scraper] Error processing target ${target.url}:`, err);
    }
  }

  await browser.close();
  console.log(`[Scraper] Finished at ${new Date().toISOString()}`);
}

scrapePinnacle().catch(console.error);
