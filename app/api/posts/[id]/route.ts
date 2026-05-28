import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const authSession = cookieStore.get('auth_session');
    let userId: number | null = null;
    if (authSession?.value) {
      try {
        const sessionData = JSON.parse(authSession.value);
        userId = sessionData.id;
      } catch (e) {}
    }

    const { env } = getCloudflareContext();
    const db = env.DB as any;

    // 1. Fetch post with author info
    const post: any = await db
      .prepare(`
        SELECT p.*, u.nickname as author, u.avatar as authorAvatar, u.level as authorLevel
        FROM posts p
        JOIN users u ON p.authorId = u.id
        WHERE p.id = ?
      `)
      .bind(id)
      .first();

    if (!post) {
      return NextResponse.json(
        { success: false, error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 2. Check like/favorite status if logged in
    let isLiked = false;
    let isFavorited = false;
    if (userId) {
      const [likeRes, favRes] = await Promise.all([
        db.prepare('SELECT id FROM post_likes WHERE postId = ? AND userId = ?').bind(id, userId).first(),
        db.prepare('SELECT id FROM post_favorites WHERE postId = ? AND userId = ?').bind(id, userId).first()
      ]);
      isLiked = !!likeRes;
      isFavorited = !!favRes;
    }

    // 3. Increment view count (async-ish)
    await db
      .prepare('UPDATE posts SET views = views + 1 WHERE id = ?')
      .bind(id)
      .run();

    return NextResponse.json({ 
      success: true, 
      post: {
        ...post,
        isLiked,
        isFavorited,
        isAuthor: userId !== null && post.authorId === userId
      } 
    });
  } catch (error: any) {
    console.error('Fetch post detail error:', error);
    return NextResponse.json(
      { success: false, error: '게시글을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const authSession = cookieStore.get('auth_session');

    if (!authSession?.value) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const sessionData = JSON.parse(authSession.value);
    const userId = sessionData.id;

    const { title, content, category, tags, image: rawImage } = await request.json();

    if (!title || !content || !category) {
      return NextResponse.json(
        { success: false, error: '제목, 내용, 카테고리는 필수 항목입니다.' },
        { status: 400 }
      );
    }

    const { env } = getCloudflareContext();
    const db = env.DB as any;

    // Check ownership
    const post: any = await db
      .prepare('SELECT authorId, image FROM posts WHERE id = ?')
      .bind(id)
      .first();

    if (!post) {
      return NextResponse.json(
        { success: false, error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (post.authorId !== userId) {
      return NextResponse.json(
        { success: false, error: '수정 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // Process image if it is base64
    let image = post.image;
    if (rawImage && rawImage.startsWith('data:image/')) {
      const { uploadImageToR2 } = await import('@/lib/r2');
      image = await uploadImageToR2(rawImage);
    } else if (rawImage === '') {
      image = null;
    }

    const result = await db
      .prepare(
        'UPDATE posts SET title = ?, content = ?, category = ?, tags = ?, image = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?'
      )
      .bind(title, content, category, tags || null, image, id)
      .run();

    if (!result.success) {
      throw new Error('데이터베이스 업데이트 중 오류가 발생했습니다.');
    }

    return NextResponse.json({ success: true, message: '글이 수정되었습니다.' });
  } catch (error: any) {
    console.error('Update post error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const authSession = cookieStore.get('auth_session');

    if (!authSession?.value) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const sessionData = JSON.parse(authSession.value);
    const userId = sessionData.id;

    const { env } = getCloudflareContext();
    const db = env.DB as any;

    // Check ownership
    const post: any = await db
      .prepare('SELECT authorId FROM posts WHERE id = ?')
      .bind(id)
      .first();

    if (!post) {
      return NextResponse.json(
        { success: false, error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (post.authorId !== userId) {
      return NextResponse.json(
        { success: false, error: '삭제 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // Delete dependent tables in D1 batch
    const queries = [
      db.prepare('DELETE FROM comments WHERE postId = ?').bind(id),
      db.prepare('DELETE FROM post_likes WHERE postId = ?').bind(id),
      db.prepare('DELETE FROM post_favorites WHERE postId = ?').bind(id),
      db.prepare('DELETE FROM posts WHERE id = ?').bind(id),
    ];

    await db.batch(queries);

    return NextResponse.json({ success: true, message: '글이 삭제되었습니다.' });
  } catch (error: any) {
    console.error('Delete post error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
