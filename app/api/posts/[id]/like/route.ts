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

    // 1. Check if post exists and who is the author
    const post: any = await db.prepare('SELECT authorId FROM posts WHERE id = ?').bind(id).first();
    if (!post) {
      return NextResponse.json({ success: false, error: '게시글을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (post.authorId === userId) {
      return NextResponse.json({ success: false, error: '자신의 게시글은 추천할 수 없습니다.' }, { status: 400 });
    }

    // 2. Check if already liked
    const existingLike = await db.prepare('SELECT id FROM post_likes WHERE postId = ? AND userId = ?')
      .bind(id, userId)
      .first();

    if (existingLike) {
      // Toggle off: Unlike
      await db.prepare('DELETE FROM post_likes WHERE id = ?').bind(existingLike.id).run();
      await db.prepare('UPDATE posts SET likes = likes - 1 WHERE id = ?').bind(id).run();
      
      // Bonus: Decrease author's score (-5 score, -20 VP)
      const statements = [
        db.prepare('UPDATE users SET score = score - 5, points = points - 20 WHERE id = ?').bind(post.authorId),
        db.prepare("INSERT INTO points_logs (userId, amount, reason, referenceId) VALUES (?, -20, 'post_unlike', ?)")
          .bind(post.authorId, id)
      ];
      await db.batch(statements);

      return NextResponse.json({ success: true, liked: false, message: '추천을 취소했습니다.' });
    } else {
      // Toggle on: Like
      await db.prepare('INSERT INTO post_likes (postId, userId) VALUES (?, ?)')
        .bind(id, userId)
        .run();
      await db.prepare('UPDATE posts SET likes = likes + 1 WHERE id = ?').bind(id).run();

      // Bonus: Increase author's score (+10 score, +20 VP)
      const statements = [
        db.prepare('UPDATE users SET score = score + 10, points = points + 20 WHERE id = ?').bind(post.authorId),
        db.prepare("INSERT INTO points_logs (userId, amount, reason, referenceId) VALUES (?, 20, 'post_like', ?)")
          .bind(post.authorId, id)
      ];
      await db.batch(statements);

      return NextResponse.json({ success: true, liked: true, message: '게시글을 추천했습니다.' });
    }
  } catch (error: any) {
    console.error('Like post error:', error);
    return NextResponse.json({ success: false, error: '추천 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
