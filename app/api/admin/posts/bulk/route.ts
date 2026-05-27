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
    const uniqueUsernames = new Set<string>();
    for (const p of posts) {
      if (p.author) {
        if (typeof p.author === 'object') {
          const name = p.author.username || p.author.nickname;
          if (name) uniqueUsernames.add(name);
        } else if (typeof p.author === 'string') {
          uniqueUsernames.add(p.author);
        }
      }
      if (p.comments && Array.isArray(p.comments)) {
        for (const c of p.comments) {
          const name = c.username || c.author;
          if (name) {
            if (typeof name === 'object') {
              const innerName = name.username || name.nickname;
              if (innerName) uniqueUsernames.add(innerName);
            } else if (typeof name === 'string') {
              uniqueUsernames.add(name);
            }
          }
        }
      }
    }

    // Get or create all users
    const usernameToIdMap: Record<string, number> = {};
    for (const name of uniqueUsernames) {
      let avatarSeed = undefined;
      const matchingPost = posts.find((p: any) => p.author && (p.author.username === name || p.author.nickname === name || p.author === name));
      if (matchingPost && typeof matchingPost.author === 'object' && matchingPost.author.avatarSeed) {
        avatarSeed = matchingPost.author.avatarSeed;
      }
      const id = await getOrCreateUser(db, name, avatarSeed);
      usernameToIdMap[name] = id;
    }

    let importedCount = 0;
    for (const p of posts) {
      const title = p.title || p.Title;
      const content = p.content || p.Content;
      if (!title || !content) continue;

      let cat = p.category || p.Category || category;
      // Category mapping
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

      // Insert Post
      const postResult = await db.prepare(
        'INSERT INTO posts (title, content, authorId, category, tags, image, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).bind(title, content, authorId, cat, subCat || null, img || null, createdAt).run();

      const postId = postResult.meta.last_row_id;
      importedCount++;

      // Insert Comments
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

          await db.prepare(
            'INSERT INTO comments (postId, authorId, content, createdAt) VALUES (?, ?, ?, ?)'
          ).bind(postId, commentAuthorId, commentContent, commentCreatedAt).run();
        }
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

async function getOrCreateUser(db: any, username: string, avatarSeed?: string) {
  if (!username) return 0;
  try {
    const user = await db.prepare('SELECT id FROM users WHERE nickname = ?').bind(username).first();
    if (user) {
      return user.id;
    }
    const userByUid = await db.prepare('SELECT id FROM users WHERE userId = ?').bind(username).first();
    if (userByUid) {
      return userByUid.id;
    }

    const cleanName = username.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'user';
    const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
    const userId = `${cleanName}${uniqueSuffix}`;
    const email = `${userId}@pinnacle-community.com`;
    const passwordHash = 'pbkdf2_dummy_password_hash';
    const avatar = avatarSeed 
      ? `https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed}` 
      : `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(username)}`;

    const insertResult = await db.prepare(
      'INSERT INTO users (userId, passwordHash, nickname, email, avatar) VALUES (?, ?, ?, ?, ?)'
    ).bind(userId, passwordHash, username, email, avatar).run();

    return insertResult.meta.last_row_id;
  } catch (err) {
    console.error('getOrCreateUser error:', username, err);
    return 0;
  }
}
