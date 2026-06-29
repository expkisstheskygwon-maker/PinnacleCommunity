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

    const { deleteType, startId, endId, startDate, endDate } = await request.json();

    const { env } = getCloudflareContext();
    const db = env.DB as any;

    let whereClauses: string[] = [];
    let bindParams: any[] = [];

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
      // Deletes all users
    } else {
      return NextResponse.json({ success: false, error: '올바르지 않은 삭제 유형입니다.' }, { status: 400 });
    }

    const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Subqueries to target user posts and dependent rows
    const selectMatchedUserIds = `SELECT id FROM users ${whereStr}`;
    const selectMatchedPostIds = `SELECT id FROM posts WHERE authorId IN (${selectMatchedUserIds})`;

    // SQLite/D1 batch operations
    const queries = [
      db.prepare(`DELETE FROM comments WHERE authorId IN (${selectMatchedUserIds}) OR postId IN (${selectMatchedPostIds})`).bind(...bindParams, ...bindParams),
      db.prepare(`DELETE FROM post_likes WHERE userId IN (${selectMatchedUserIds}) OR postId IN (${selectMatchedPostIds})`).bind(...bindParams, ...bindParams),
      db.prepare(`DELETE FROM post_favorites WHERE userId IN (${selectMatchedUserIds}) OR postId IN (${selectMatchedPostIds})`).bind(...bindParams, ...bindParams),
      db.prepare(`DELETE FROM user_interests WHERE userId IN (${selectMatchedUserIds})`).bind(...bindParams),
      db.prepare(`DELETE FROM user_favorites WHERE userId IN (${selectMatchedUserIds})`).bind(...bindParams),
      db.prepare(`DELETE FROM user_bets WHERE userId IN (${selectMatchedUserIds})`).bind(...bindParams),
      db.prepare(`DELETE FROM betting_records WHERE userId IN (${selectMatchedUserIds})`).bind(...bindParams),
      db.prepare(`DELETE FROM points_logs WHERE userId IN (${selectMatchedUserIds})`).bind(...bindParams),
      db.prepare(`DELETE FROM user_inventory WHERE userId IN (${selectMatchedUserIds})`).bind(...bindParams),
      db.prepare(`DELETE FROM post_purchases WHERE userId IN (${selectMatchedUserIds}) OR postId IN (${selectMatchedPostIds})`).bind(...bindParams, ...bindParams),
      db.prepare(`DELETE FROM reward_logs WHERE userId IN (${selectMatchedUserIds}) OR postId IN (${selectMatchedPostIds})`).bind(...bindParams, ...bindParams),
      db.prepare(`DELETE FROM bet_money_logs WHERE userId IN (${selectMatchedUserIds})`).bind(...bindParams),
      db.prepare(`DELETE FROM notifications WHERE userId IN (${selectMatchedUserIds})`).bind(...bindParams),
      db.prepare(`DELETE FROM inquiries WHERE userId IN (${selectMatchedUserIds})`).bind(...bindParams),
      db.prepare(`DELETE FROM posts WHERE authorId IN (${selectMatchedUserIds})`).bind(...bindParams),
      db.prepare(`DELETE FROM users ${whereStr}`).bind(...bindParams),
    ];

    const results = await db.batch(queries);
    const usersDeletedResult = results[results.length - 1];

    return NextResponse.json({
      success: true,
      message: '성공적으로 일괄 삭제되었습니다.',
      count: usersDeletedResult.meta.changes || 0
    });

  } catch (error: any) {
    console.error('Bulk delete users error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
