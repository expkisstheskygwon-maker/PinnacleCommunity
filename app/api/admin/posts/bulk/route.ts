import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');

    if (!adminSession?.value) {
      return NextResponse.json(
        { success: false, error: '관리자 로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { posts, category } = await request.json();

    if (!posts || !Array.isArray(posts) || posts.length === 0 || !category) {
      return NextResponse.json(
        { success: false, error: '잘못된 데이터 형식입니다.' },
        { status: 400 }
      );
    }

    const { env } = getCloudflareContext();
    const db = env.DB as any;

    // Ensure admin user exists
    try {
      await db.prepare(`
        INSERT OR IGNORE INTO users (id, userId, nickname, passwordHash, email) 
        VALUES (0, 'admin', '관리자', 'admin_pass_hash', 'admin@pinnacle.com')
      `).run();
    } catch(e) {}

    // Gather all unique authors
    const uniqueUsernamesSet = new Set<string>();
    for (const p of posts) {
      if (p.author) {
        if (typeof p.author === 'object') {
          const name = p.author.username || p.author.nickname;
          if (name) uniqueUsernamesSet.add(name);
        } else if (typeof p.author === 'string') {
          uniqueUsernamesSet.add(p.author);
        }
      }
      if (p.comments && Array.isArray(p.comments)) {
        for (const c of p.comments) {
          const name = c.username || c.author;
          if (name) {
            if (typeof name === 'object') {
              const innerName = name.username || name.nickname;
              if (innerName) uniqueUsernamesSet.add(innerName);
            } else if (typeof name === 'string') {
              uniqueUsernamesSet.add(name);
            }
          }
        }
      }
    }

    const uniqueUsernames = Array.from(uniqueUsernamesSet);
    const usernameToIdMap: Record<string, number> = { 'admin': 0, '관리자': 0 };

    if (uniqueUsernames.length > 0) {
      // Find existing users using chunks of 50 to avoid SQLite variable limits (999 maximum)
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

    // Prepare missing users to insert
    const missingUsersToInsert: { nickname: string; userId: string; email: string; avatar: string | null }[] = [];
    for (const name of uniqueUsernames) {
      if (usernameToIdMap[name] === undefined) {
        const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'user';
        const uniqueSuffix = Math.random().toString(36).substring(2, 10);
        const userId = `dummy_${cleanName}_${uniqueSuffix}`;
        const email = `${userId}@pinnacle-community.com`;
        
        let avatarSeed = undefined;
        const matchingPost = posts.find((p: any) => p.author && (p.author.username === name || p.author.nickname === name || p.author === name));
        if (matchingPost && typeof matchingPost.author === 'object' && matchingPost.author.avatarSeed) {
          avatarSeed = matchingPost.author.avatarSeed;
        }
        const avatar = avatarSeed 
          ? `https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed}` 
          : `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`;

        missingUsersToInsert.push({ nickname: name, userId, email, avatar });
      }
    }

    // Batch insert missing users
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

    // Batch insert posts
    const postStatements = [];
    const validPostsToInsert: any[] = [];
    
    for (const p of posts) {
      const title = p.title || p.Title;
      const content = p.content || p.Content;
      if (!title || !content) continue;

      let cat = p.category || p.Category || category;
      if (cat === 'pinnacle_analysis') cat = 'analysis';
      else if (cat === 'pinnacle_guide') cat = 'guide';
      else if (cat === 'pinnacle_notices') cat = 'notices';
      else if (cat === 'pinnacle_qna') cat = 'qna';
      else if (cat === 'pinnacle_spotlight') cat = 'spotlight';
      else if (cat === 'pinnacle_free') cat = 'free';

      const validCats = ['guide', 'qna', 'notices', 'analysis', 'spotlight', 'free'];
      if (!validCats.includes(cat)) {
        cat = category;
      }

      let subCat = p.subCategory || p.subcategory || p.SubCategory || p.Subcategory;
      if (!subCat && p.keywords && Array.isArray(p.keywords)) {
        subCat = p.keywords.join(',');
      }

      const img = p.imageUrl || p.image || p.Image || p.ImageUrl || null;
      const createdAt = p.createdAt || p.Createdat || p.CreatedAt || new Date().toISOString();

      let authorId = 0;
      if (p.author) {
        const name = typeof p.author === 'object' ? (p.author.username || p.author.nickname) : p.author;
        if (name && usernameToIdMap[name] !== undefined) {
          authorId = usernameToIdMap[name];
        }
      }

      const isHtml = p.isHtml !== undefined ? (p.isHtml ? 1 : 0) : (/<[a-z][\s\S]*>/i.test(content) ? 1 : 0);
      postStatements.push(
        db.prepare(
          'INSERT INTO posts (title, content, authorId, category, tags, image, createdAt, isHtml) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        ).bind(title, content, authorId, cat, subCat || null, img || null, createdAt, isHtml)
      );
      validPostsToInsert.push(p);
    }

    let importedCount = 0;
    if (postStatements.length > 0) {
      const postResults = await db.batch(postStatements);
      importedCount = postResults.length;

      // Batch insert comments
      const commentStatements = [];
      for (let i = 0; i < validPostsToInsert.length; i++) {
        const p = validPostsToInsert[i];
        const postId = postResults[i].meta.last_row_id;
        
        if (p.comments && Array.isArray(p.comments) && postId) {
          for (const c of p.comments) {
            const commentContent = c.content || c.Content;
            if (!commentContent) continue;

            let commentAuthorId = 0;
            const commentAuthorName = typeof (c.username || c.author) === 'object'
              ? ((c.username || c.author).username || (c.username || c.author).nickname)
              : (c.username || c.author);

            if (commentAuthorName && usernameToIdMap[commentAuthorName] !== undefined) {
              commentAuthorId = usernameToIdMap[commentAuthorName];
            }

            const commentCreatedAt = c.createdAt || c.Createdat || c.CreatedAt || new Date().toISOString();

            commentStatements.push(
              db.prepare(
                'INSERT INTO comments (postId, authorId, content, createdAt) VALUES (?, ?, ?, ?)'
              ).bind(postId, commentAuthorId, commentContent, commentCreatedAt)
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
      message: `${importedCount}개의 게시글이 성공적으로 등록되었습니다.`,
      count: importedCount
    });

  } catch (error: any) {
    console.error('Bulk post error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
