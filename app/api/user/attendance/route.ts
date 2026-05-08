import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authSession = cookieStore.get('auth_session');

    if (!authSession?.value) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const sessionData = JSON.parse(authSession.value);
    const { env } = getCloudflareContext();
    const db = env.DB as any;

    // 1. 유저 정보 조회
    const user: any = await db
      .prepare('SELECT id, score, attendanceCount, lastAttendanceDate FROM users WHERE id = ?')
      .bind(sessionData.id)
      .first();

    if (!user) {
      return NextResponse.json({ success: false, error: '유저를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 2. 오늘 날짜 확인 (KST 기준 권장이나 여기서는 UTC 기준 YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];

    // 3. 중복 체크
    if (user.lastAttendanceDate === today) {
      return NextResponse.json({ 
        success: false, 
        message: '이미 오늘의 출석 체크를 완료했습니다.',
        alreadyDone: true 
      });
    }

    // 4. 포인트 지급 및 업데이트
    const ATTENDANCE_POINTS = 10;
    const newScore = (user.score || 0) + ATTENDANCE_POINTS;
    const newAttendanceCount = (user.attendanceCount || 0) + 1;

    await db
      .prepare('UPDATE users SET score = ?, attendanceCount = ?, lastAttendanceDate = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(newScore, newAttendanceCount, today, user.id)
      .run();

    return NextResponse.json({
      success: true,
      message: '출석 체크 완료! 10포인트가 지급되었습니다.',
      addedPoints: ATTENDANCE_POINTS,
      totalScore: newScore,
      attendanceCount: newAttendanceCount
    });

  } catch (error: any) {
    console.error('Attendance API Error:', error);
    return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
