import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { cookies } from 'next/headers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const cookieStore = await cookies();
    const authSession = cookieStore.get('auth_session');

    if (!authSession?.value) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const sessionData = JSON.parse(authSession.value);
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json({ success: false, error: '댓글 내용을 입력해주세요.' }, { status: 400 });
    }

    const { env } = getCloudflareContext();
    const db = env.DB as any;

    // 1. 댓글 저장
    const result = await db
      .prepare('INSERT INTO comments (postId, authorId, content) VALUES (?, ?, ?)')
      .bind(postId, sessionData.id, content)
      .run();

    // 2. 활동 포인트 적립 (+5 스코어, +10 VP) with daily limit (max 20 times)
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayStartStr = todayStart.toISOString();

    const commentLogCount: any = await db
      .prepare("SELECT COUNT(id) as count FROM points_logs WHERE userId = ? AND reason = 'comment_write' AND createdAt >= ?")
      .bind(sessionData.id, todayStartStr)
      .first();

    const isLimitReached = (commentLogCount?.count || 0) >= 20;
    let message = '댓글이 등록되었습니다.';

    if (!isLimitReached) {
      const userData: any = await db.prepare('SELECT score, points FROM users WHERE id = ?').bind(sessionData.id).first();
      const newScore = (userData?.score || 0) + 5;
      const newPoints = (userData?.points || 0) + 10;
      
      const { calculateLevel } = await import('@/lib/gamification');
      const newLevel = calculateLevel(newScore);

      const statements = [
        db.prepare('UPDATE users SET score = ?, level = ?, points = ? WHERE id = ?')
          .bind(newScore, newLevel, newPoints, sessionData.id),
        db.prepare("INSERT INTO points_logs (userId, amount, reason, referenceId) VALUES (?, 10, 'comment_write', ?)")
          .bind(sessionData.id, postId)
      ];

      await db.batch(statements);
      message += ' (+5 활동점수, +10 VP)';
    } else {
      message += ' (오늘 포인트 적립 한도 20회를 초과하여 포인트가 지급되지 않았습니다.)';
    }

    return NextResponse.json({ 
      success: true, 
      message: message,
      commentId: result.meta.last_row_id 
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create comment error:', error);
    return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const { env } = getCloudflareContext();
    const db = env.DB as any;

    const { results } = await db
      .prepare(`
        SELECT c.*, u.nickname as author, u.avatar as authorAvatar, u.level as authorLevel
        FROM comments c
        JOIN users u ON c.authorId = u.id
        WHERE c.postId = ?
        ORDER BY c.createdAt ASC
      `)
      .bind(postId)
      .all();

    return NextResponse.json({ success: true, comments: results });

  } catch (error: any) {
    console.error('Fetch comments error:', error);
    return NextResponse.json({ success: false, error: '댓글을 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
