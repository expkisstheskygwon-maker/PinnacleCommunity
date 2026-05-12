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

    const statements = posts.map(p => {
      const title = p.title || p.Title;
      const content = p.content || p.Content;
      const subCat = p.subCategory || p.subcategory || p.SubCategory || p.Subcategory;
      const img = p.image || p.Image;
      
      return db.prepare(
        'INSERT INTO posts (title, content, authorId, category, tags, image) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(title, content, 0, category, subCat || null, img || null);
    });

    const results = await db.batch(statements);

    return NextResponse.json({
      success: true,
      message: `${posts.length}개의 게시글이 성공적으로 등록되었습니다.`,
      count: posts.length
    });

  } catch (error: any) {
    console.error('Bulk post error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
