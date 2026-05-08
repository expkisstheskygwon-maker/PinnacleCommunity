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

    // 2. 활동 포인트 적립 (+5 포인트)
    await db
      .prepare('UPDATE users SET score = score + 5 WHERE id = ?')
      .bind(sessionData.id)
      .run();

    return NextResponse.json({ 
      success: true, 
      message: '댓글이 등록되었습니다. (+5 포인트)',
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
