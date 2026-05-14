import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { cookies } from 'next/headers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const authSession = cookieStore.get('auth_session');

    if (!authSession?.value) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const sessionData = JSON.parse(authSession.value);
    const userId = sessionData.id;

    const { env } = getCloudflareContext();
    const db = env.DB as any;

    // 1. Check if post exists
    const post: any = await db.prepare('SELECT authorId FROM posts WHERE id = ?').bind(id).first();
    if (!post) {
      return NextResponse.json({ success: false, error: '게시글을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (post.authorId === userId) {
      return NextResponse.json({ success: false, error: '자신의 게시글은 관심글로 등록할 수 없습니다.' }, { status: 400 });
    }

    // 2. Check if already favorited
    const existingFav = await db.prepare('SELECT id FROM post_favorites WHERE postId = ? AND userId = ?')
      .bind(id, userId)
      .first();

    if (existingFav) {
      // Toggle off: Unfavorite
      await db.prepare('DELETE FROM post_favorites WHERE id = ?').bind(existingFav.id).run();
      return NextResponse.json({ success: true, favorited: false, message: '관심글에서 해제했습니다.' });
    } else {
      // Toggle on: Favorite
      await db.prepare('INSERT INTO post_favorites (postId, userId) VALUES (?, ?)')
        .bind(id, userId)
        .run();
      return NextResponse.json({ success: true, favorited: true, message: '관심글로 등록했습니다.' });
    }
  } catch (error: any) {
    console.error('Favorite post error:', error);
    return NextResponse.json({ success: false, error: '관심글 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
