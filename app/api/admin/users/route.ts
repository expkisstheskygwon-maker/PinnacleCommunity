import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');

    if (!adminSession?.value) {
      return NextResponse.json(
        { success: false, error: '관리자 로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { env } = getCloudflareContext();
    const db = env.DB as any;

    const { results } = await db.prepare(`
      SELECT 
        u.id, 
        u.userId, 
        u.nickname, 
        u.status, 
        u.points, 
        u.attendanceCount, 
        u.createdAt as joinDate,
        COUNT(p.id) as postsCount
      FROM users u
      LEFT JOIN posts p ON u.id = p.authorId
      GROUP BY u.id
      ORDER BY u.createdAt DESC
    `).all();

    return NextResponse.json({ success: true, users: results });
  } catch (error: any) {
    console.error('Fetch users error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');

    if (!adminSession?.value) {
      return NextResponse.json(
        { success: false, error: '관리자 로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { userId, status, points, attendanceCount } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const { env } = getCloudflareContext();
    const db = env.DB as any;

    const updates = [];
    const values = [];

    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    if (points !== undefined) {
      updates.push('points = ?');
      values.push(points);
    }
    if (attendanceCount !== undefined) {
      updates.push('attendanceCount = ?');
      values.push(attendanceCount);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: '수정할 데이터가 없습니다.' },
        { status: 400 }
      );
    }

    values.push(userId);

    const result = await db
      .prepare(`UPDATE users SET ${updates.join(', ')}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`)
      .bind(...values)
      .run();

    if (!result.success) {
      throw new Error('데이터베이스 업데이트 중 오류가 발생했습니다.');
    }

    return NextResponse.json({ success: true, message: '사용자 정보가 업데이트되었습니다.' });
  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
