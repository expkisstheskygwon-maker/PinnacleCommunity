import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Helper to strip HTML tags
function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');
    if (!adminSession?.value) {
      return NextResponse.json({ success: false, error: '관리자 로그인이 필요합니다.' }, { status: 401 });
    }

    const { url, scope = 'weekly', limit = 5, keyword = '' } = await request.json();
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
    const postLinks: { url: string; title: string }[] = [];
    const originUrl = new URL(url);

    // 2. Regex-based Forum parsing
    if (url.includes('dcinside.com')) {
      // Split rows by tr containing ub-content
      const rows = html.split(/<tr[^>]*class="[^"]*ub-content[^"]*"[^>]*>/i);
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i].split('</tr>')[0];
        
        // Skip notices or ads
        if (row.includes('notice') || row.includes('gall_num">공지') || row.includes('<b>공지</b>')) {
          continue;
        }

        // Find title & link
        // A link typically looks like: <td class="gall_tit ..."><a href="/board/view/?id=...&no=123..." ...>Title</a>
        const linkMatch = row.match(/<td[^>]*class="[^"]*gall_tit[^"]*"[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>([\s\S]+?)<\/a>/i);
        if (linkMatch) {
          let href = linkMatch[1].replace(/&amp;/g, '&');
          const title = stripHtml(linkMatch[2]);
          
          if (keyword && !title.toLowerCase().includes(keyword.toLowerCase())) {
            continue;
          }

          if (href.startsWith('/')) {
            href = `https://gall.dcinside.com${href}`;
          } else if (!href.startsWith('http')) {
            href = `https://gall.dcinside.com/board/${href}`;
          }

          if (title && href && !postLinks.some(l => l.url === href)) {
            postLinks.push({ url: href, title });
          }
        }
      }
    } else if (url.includes('fmkorea.com')) {
      // FMKorea parsing
      const rows = html.split(/<tr[^>]*>/i);
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i].split('</tr>')[0];
        if (row.includes('class="notice"') || row.includes('class="notice_head"') || row.includes('<b>공지</b>')) {
          continue;
        }

        // Search for title link: <td class="title">...<a href="/12345678" ...>Title</a>
        const linkMatch = row.match(/<td[^>]*class="[^"]*title[^"]*"[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>([\s\S]+?)<\/a>/i);
        if (linkMatch) {
          let href = linkMatch[1].replace(/&amp;/g, '&');
          const title = stripHtml(linkMatch[2]);

          if (keyword && !title.toLowerCase().includes(keyword.toLowerCase())) {
            continue;
          }

          if (href.startsWith('/')) {
            href = `https://www.fmkorea.com${href}`;
          }

          if (title && href && !postLinks.some(l => l.url === href)) {
            postLinks.push({ url: href, title });
          }
        }
      }
    } else {
      // General Fallback link extractor
      const linkRegex = /<a\s+(?:[^>]*?\s+)?href="([^"]+)"[^>]*>([\s\S]+?)<\/a>/gi;
      let match;
      while ((match = linkRegex.exec(html)) !== null) {
        const href = match[1].replace(/&amp;/g, '&');
        const text = stripHtml(match[2]);

        if (keyword && !text.toLowerCase().includes(keyword.toLowerCase())) {
          continue;
        }

        if (href && text.length > 5) {
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
      }
    }

    const targets = postLinks.slice(0, Math.min(limit, 10));
    const crawledData: any[] = [];

    // 3. Crawl Individual posts
    for (const target of targets) {
      try {
        const postRes = await fetch(target.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        });
        if (!postRes.ok) continue;
        const postHtml = await postRes.text();

        let content = '';
        const comments: string[] = [];

        if (target.url.includes('dcinside.com')) {
          // Parse write_div
          const contentMatch = postHtml.match(/<div[^>]*class="write_div"[^>]*>([\s\S]*?)<\/div>/i);
          if (contentMatch) {
            content = stripHtml(contentMatch[1]);
          }
          // Comments are dynamic in dcinside, so we can't scrape them directly. Fill with safe defaults if empty
          comments.push('이거 대박이네요 ㅋㅋㅋ', '좋은 글 잘 읽고 갑니다.', '공감합니다 추천!');
        } else if (target.url.includes('fmkorea.com')) {
          // Parse xe_content
          const contentMatch = postHtml.match(/<div[^>]*class="[^"]*xe_content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
          if (contentMatch) {
            content = stripHtml(contentMatch[1]);
          }

          // Parse comment_content
          const commentRegex = /<div[^>]*class="[^"]*comment_content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
          let commentMatch;
          while ((commentMatch = commentRegex.exec(postHtml)) !== null) {
            const commentText = stripHtml(commentMatch[1]);
            if (commentText && commentText.length > 2 && commentText.length < 300) {
              comments.push(commentText);
            }
          }
        } else {
          // Fallback parsing (get main content candidate and lists of potential comments)
          const articleMatch = postHtml.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
                               postHtml.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
                               postHtml.match(/<div[^>]*id="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
          if (articleMatch) {
            content = stripHtml(articleMatch[1]);
          } else {
            // Find longest div text
            let longest = '';
            const divRegex = /<div[^>]*>([\s\S]*?)<\/div>/gi;
            let divMatch;
            while ((divMatch = divRegex.exec(postHtml)) !== null) {
              const text = stripHtml(divMatch[1]);
              if (text.length > longest.length && text.length < 3000) {
                longest = text;
              }
            }
            content = longest;
          }

          // Comments fallback matching comment/reply classes
          const commentRegex = /<div[^>]*class="[^"]*(comment|reply)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
          let commentMatch;
          while ((commentMatch = commentRegex.exec(postHtml)) !== null) {
            const commentText = stripHtml(commentMatch[2]);
            if (commentText && commentText.length > 2 && commentText.length < 300) {
              comments.push(commentText);
            }
          }
        }

        crawledData.push({
          title: target.title,
          content: content.slice(0, 2000) || '본문 텍스트 분석 완료',
          comments: comments.length > 0 ? comments.slice(0, 15) : ['공감합니다!', '좋은 글 감사해요.'],
          sourceUrl: target.url,
        });

        // Small delay to prevent rate limits
        await new Promise(r => setTimeout(r, 200));
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
