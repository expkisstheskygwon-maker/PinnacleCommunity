import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as cheerio from 'cheerio';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');
    if (!adminSession?.value) {
      return NextResponse.json({ success: false, error: '관리자 로그인이 필요합니다.' }, { status: 401 });
    }

    const { url, scope = 'weekly', limit = 5 } = await request.json();
    if (!url) {
      return NextResponse.json({ success: false, error: 'URL을 입력해주세요.' }, { status: 400 });
    }

    // 1. Fetch Board List HTML
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ success: false, error: `게시판을 불러오는 데 실패했습니다. (HTTP ${response.status})` }, { status: 400 });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const postLinks: { url: string; title: string }[] = [];
    const originUrl = new URL(url);

    // 2. Identify Forum Type and Extract Links (excluding notices)
    if (url.includes('dcinside.com')) {
      // DCinside: .gall_list tbody tr.ub-content
      $('.gall_list tbody tr.ub-content').each((_, el) => {
        const row = $(el);
        // Exclude notice/ad rows
        if (row.hasClass('notice') || row.find('.gall_num').text().trim() === '공지') {
          return;
        }
        const linkEl = row.find('td.gall_tit a').first();
        let href = linkEl.attr('href');
        if (href) {
          if (href.startsWith('/')) href = `https://gall.dcinside.com${href}`;
          else if (!href.startsWith('http')) href = `https://gall.dcinside.com/board/${href}`;
          
          postLinks.push({
            url: href,
            title: linkEl.text().trim(),
          });
        }
      });
    } else if (url.includes('fmkorea.com')) {
      // FMKorea
      $('tr').each((_, el) => {
        const row = $(el);
        if (row.hasClass('notice') || row.find('.notice').length > 0) {
          return;
        }
        const linkEl = row.find('td.title a').first();
        let href = linkEl.attr('href');
        if (href) {
          if (href.startsWith('/')) href = `https://www.fmkorea.com${href}`;
          postLinks.push({
            url: href,
            title: linkEl.text().trim(),
          });
        }
      });
    } else {
      // General Fallback
      $('a').each((_, el) => {
        const linkEl = $(el);
        const href = linkEl.attr('href');
        const text = linkEl.text().trim();
        
        if (href && text.length > 5) {
          // Look for URLs that typically represent board articles
          const isArticleLink = /\/(board|view|read|post|p|article|g5)\/|\b(id|wr_id|no|article_no)=\d+/.test(href);
          const isNotice = /공지|안내|필독|rule/i.test(text);
          
          if (isArticleLink && !isNotice) {
            let fullUrl = href;
            if (href.startsWith('/')) {
              fullUrl = `${originUrl.protocol}//${originUrl.host}${href}`;
            } else if (!href.startsWith('http')) {
              fullUrl = new URL(href, url).toString();
            }
            if (!postLinks.some(l => l.url === fullUrl)) {
              postLinks.push({ url: fullUrl, title: text });
            }
          }
        }
      });
    }

    // Limit crawling list to limit items
    const targets = postLinks.slice(0, Math.min(limit, 10));
    const crawledData: any[] = [];

    // 3. Crawl Individual Posts & Comments
    for (const target of targets) {
      try {
        const postRes = await fetch(target.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        });
        if (!postRes.ok) continue;
        const postHtml = await postRes.text();
        const p$ = cheerio.load(postHtml);

        let content = '';
        const comments: string[] = [];

        if (target.url.includes('dcinside.com')) {
          content = p$('.write_div').text().trim();
          p$('.comment_list .txt').each((_, el) => {
            const commentText = p$(el).text().trim();
            if (commentText) comments.push(commentText);
          });
        } else if (target.url.includes('fmkorea.com')) {
          content = p$('.xe_content').first().text().trim();
          p$('.comment_content').each((_, el) => {
            const commentText = p$(el).text().trim();
            if (commentText) comments.push(commentText);
          });
        } else {
          // Fallback parsing (get main content candidate and lists of potential comments)
          content = p$('article').text().trim() || p$('.content').text().trim() || p$('#content').text().trim();
          if (!content) {
            // Take the longest text container
            let longestText = '';
            p$('div, section').each((_, el) => {
              const text = p$(el).text().trim();
              if (text.length > longestText.length && text.length < 5000) {
                longestText = text;
              }
            });
            content = longestText;
          }
          
          // Comments fallback
          p$('.comment, .reply, [class*="comment"], [class*="reply"]').each((_, el) => {
            const commentText = p$(el).text().trim();
            if (commentText && commentText.length > 2 && commentText.length < 300) {
              comments.push(commentText);
            }
          });
        }

        crawledData.push({
          title: target.title,
          content: content.slice(0, 2000), // safety truncate
          comments: comments.slice(0, 15), // keep up to 15 comments
          sourceUrl: target.url,
        });

        // Small delay to prevent rate limits
        await new Promise(r => setTimeout(r, 300));
      } catch (err) {
        console.error(`Error crawling ${target.url}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      crawledCount: crawledData.length,
      data: crawledData,
    });
  } catch (error: any) {
    console.error('Crawl API error:', error);
    return NextResponse.json({ success: false, error: error.message || '서버 오류' }, { status: 500 });
  }
}
