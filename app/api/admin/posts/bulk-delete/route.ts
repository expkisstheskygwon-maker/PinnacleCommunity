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

    const { deleteType, startId, endId, startDate, endDate, category } = await request.json();

    const { env } = getCloudflareContext();
    const db = env.DB as any;

    let whereClauses: string[] = [];
    let bindParams: any[] = [];

    // Filter by category if specified (and not 'all')
    if (category && category !== 'all') {
      whereClauses.push('category = ?');
      bindParams.push(category);
    }

    if (deleteType === 'range') {
      if (!startId && !endId) {
        return NextResponse.json({ success: false, error: '구간 범위(시작 ID 또는 종료 ID)를 입력해주세요.' }, { status: 400 });
      }
      if (startId) {
        whereClauses.push('id >= ?');
        bindParams.push(parseInt(startId));
      }
      if (endId) {
        whereClauses.push('id <= ?');
        bindParams.push(parseInt(endId));
      }
    } else if (deleteType === 'date') {
      if (!startDate && !endDate) {
        return NextResponse.json({ success: false, error: '기간 범위(시작일 또는 종료일)를 입력해주세요.' }, { status: 400 });
      }
      if (startDate) {
        whereClauses.push('date(createdAt) >= date(?)');
        bindParams.push(startDate);
      }
      if (endDate) {
        whereClauses.push('date(createdAt) <= date(?)');
        bindParams.push(endDate);
      }
    } else if (deleteType === 'all') {
      // No extra clauses (deletes all or all within selected category)
    } else {
      return NextResponse.json({ success: false, error: '올바르지 않은 삭제 유형입니다.' }, { status: 400 });
    }

    const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // 1. Delete associated comments first to ensure no foreign key constraint issues
    const deleteCommentsQuery = `DELETE FROM comments WHERE postId IN (SELECT id FROM posts ${whereStr})`;
    await db.prepare(deleteCommentsQuery).bind(...bindParams).run();

    // 2. Delete posts
    const deletePostsQuery = `DELETE FROM posts ${whereStr}`;
    const result = await db.prepare(deletePostsQuery).bind(...bindParams).run();

    return NextResponse.json({
      success: true,
      message: '성공적으로 일괄 삭제되었습니다.',
      count: result.meta.changes || 0
    });

  } catch (error: any) {
    console.error('Bulk delete error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
