import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { cookies } from 'next/headers';

function convertHtmlToHumanText(html: string): string {
  if (!html) return '';
  
  let text = html;
  
  // Replace <br> tags with a single or double newline randomly
  text = text.replace(/<br\s*\/?>/gi, () => {
    return Math.random() < 0.6 ? '\n' : '\n\n';
  });
  
  // Replace </p> followed by <p> with a random number of newlines (1, 2, or 3) to mimic human posting
  text = text.replace(/<\/p>\s*<p[^>]*>/gi, () => {
    const r = Math.random();
    if (r < 0.4) return '\n\n'; 
    if (r < 0.8) return '\n';   
    return '\n\n\n';            
  });
  
  text = text.replace(/<p[^>]*>/gi, '');
  text = text.replace(/<\/p>/gi, '\n');

  // Strip all other HTML tags
  text = text.replace(/<[^>]*>/g, '');
  
  // Decode HTML entities
  text = text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

  // Format line endings and clean redundant blank lines (allow max 3 consecutive newlines)
  text = text.split('\n').map(line => line.trimEnd()).join('\n');
  text = text.replace(/\n{4,}/g, '\n\n\n');
  
  return text.trim();
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');
    if (!adminSession?.value) {
      return NextResponse.json({ success: false, error: '관리자 로그인이 필요합니다.' }, { status: 401 });
    }

    const { posts, category, apiConfig = {}, allowHtml } = await request.json();

    if (!posts || !Array.isArray(posts) || posts.length === 0 || !category) {
      return NextResponse.json({ success: false, error: '데이터가 올바르지 않습니다.' }, { status: 400 });
    }

    // A. Forward to External API if configured
    if (apiConfig.useExternalApi && apiConfig.endpointUrl) {
      try {
        const extResponse = await fetch(apiConfig.endpointUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(apiConfig.apiKey ? { 'Authorization': `Bearer ${apiConfig.apiKey}` } : {}),
          },
          body: JSON.stringify({ posts, category }),
        });

        if (!extResponse.ok) {
          const errMsg = await extResponse.text();
          return NextResponse.json({ success: false, error: `외부 API 전송 실패: ${errMsg}` }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: `외부 API로 성공적으로 전송 완료했습니다.` });
      } catch (err: any) {
        return NextResponse.json({ success: false, error: `외부 API 전송 오류: ${err.message}` }, { status: 500 });
      }
    }

    // B. Direct insertion to local D1 Database
    const { env } = getCloudflareContext();
    const db = env.DB as any;

    // 1. Gather all unique authors
    const uniqueUsernamesSet = new Set<string>();
    for (const p of posts) {
      if (p.author) uniqueUsernamesSet.add(p.author);
      if (p.comments && Array.isArray(p.comments)) {
        for (const c of p.comments) {
          if (c.author) uniqueUsernamesSet.add(c.author);
        }
      }
    }

    const uniqueUsernames = Array.from(uniqueUsernamesSet);
    const usernameToIdMap: Record<string, number> = { 'admin': 0, '관리자': 0 };

    // 2. Fetch existing users
    if (uniqueUsernames.length > 0) {
      const chunkSize = 50;
      for (let i = 0; i < uniqueUsernames.length; i += chunkSize) {
        const chunk = uniqueUsernames.slice(i, i + chunkSize);
        const placeholders = chunk.map(() => '?').join(',');
        const query = `SELECT id, nickname, userId FROM users WHERE nickname IN (${placeholders}) OR userId IN (${placeholders})`;
        const { results } = await db.prepare(query).bind(...chunk, ...chunk).all();
        
        if (results) {
          for (const u of results) {
            if (u.nickname) usernameToIdMap[u.nickname] = u.id;
            if (u.userId) usernameToIdMap[u.userId] = u.id;
          }
        }
      }
    }

    // 3. Create missing users
    const missingUsersToInsert: { nickname: string; userId: string; email: string; avatar: string }[] = [];
    for (const name of uniqueUsernames) {
      if (usernameToIdMap[name] === undefined) {
        const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'user';
        const uniqueSuffix = Math.random().toString(36).substring(2, 10);
        const userId = `dummy_${cleanName}_${uniqueSuffix}`;
        const email = `${userId}@pinnacle-community.com`;
        const avatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`;
        
        missingUsersToInsert.push({ nickname: name, userId, email, avatar });
      }
    }

    if (missingUsersToInsert.length > 0) {
      const userStatements = missingUsersToInsert.map(u => 
        db.prepare(
          'INSERT INTO users (userId, passwordHash, nickname, email, avatar) VALUES (?, ?, ?, ?, ?)'
        ).bind(u.userId, 'pbkdf2_dummy_password_hash', u.nickname, u.email, u.avatar)
      );
      const insertResults = await db.batch(userStatements);
      for (let i = 0; i < missingUsersToInsert.length; i++) {
        const insertRes = insertResults[i];
        const newId = insertRes.meta.last_row_id;
        usernameToIdMap[missingUsersToInsert[i].nickname] = newId;
      }
    }

    // 4. Batch insert posts with views, likes, and createdAt
    const postStatements = [];
    const isHtmlAllowed = allowHtml !== undefined ? allowHtml : ['notices', 'guide', 'analysis', 'spotlight'].includes(category);

    for (const p of posts) {
      let authorId = 0;
      if (p.author && usernameToIdMap[p.author] !== undefined) {
        authorId = usernameToIdMap[p.author];
      }

      const finalContent = isHtmlAllowed ? p.content : convertHtmlToHumanText(p.content);

      postStatements.push(
        db.prepare(
          'INSERT INTO posts (title, content, authorId, category, views, likes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).bind(p.title, finalContent, authorId, category, p.views || 0, p.likes || 0, p.createdAt || new Date().toISOString())
      );
    }

    if (postStatements.length > 0) {
      const postResults = await db.batch(postStatements);

      // 5. Batch insert comments linked to correct post ID
      const commentStatements = [];
      for (let i = 0; i < posts.length; i++) {
        const p = posts[i];
        const postId = postResults[i].meta.last_row_id;
        
        if (p.comments && Array.isArray(p.comments) && postId) {
          for (const c of p.comments) {
            let commentAuthorId = 0;
            if (c.author && usernameToIdMap[c.author] !== undefined) {
              commentAuthorId = usernameToIdMap[c.author];
            }
            commentStatements.push(
              db.prepare(
                'INSERT INTO comments (postId, authorId, content, createdAt) VALUES (?, ?, ?, ?)'
              ).bind(postId, commentAuthorId, c.content, c.createdAt || new Date().toISOString())
            );
          }
        }
      }

      if (commentStatements.length > 0) {
        await db.batch(commentStatements);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${posts.length}개의 게시글과 관련 댓글이 성공적으로 등록되었습니다.`,
      count: posts.length
    });
  } catch (error: any) {
    console.error('Upload API error:', error);
    return NextResponse.json({ success: false, error: error.message || '서버 오류' }, { status: 500 });
  }
}
