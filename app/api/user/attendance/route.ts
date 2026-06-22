import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { cookies } from 'next/headers';

// GET: Retrieve attendance history and stats for the current user
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authSession = cookieStore.get('auth_session');

    if (!authSession?.value) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const sessionData = JSON.parse(authSession.value);
    const { env } = getCloudflareContext();
    const db = env.DB as any;

    // 1. Fetch user stats
    const user: any = await db
      .prepare('SELECT id, score, points, attendanceCount, lastAttendanceDate, attendanceStreak FROM users WHERE id = ?')
      .bind(sessionData.id)
      .first();

    if (!user) {
      return NextResponse.json({ success: false, error: '유저를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 2. Fetch check-in dates from points_logs
    // Using substr(createdAt, 1, 10) to format as YYYY-MM-DD
    const { results } = await db
      .prepare("SELECT DISTINCT substr(createdAt, 1, 10) as date FROM points_logs WHERE userId = ? AND reason = 'attendance' ORDER BY date DESC LIMIT 365")
      .bind(sessionData.id)
      .all();

    const checkedInDates = (results || []).map((r: any) => r.date);

    return NextResponse.json({
      success: true,
      stats: {
        points: user.points || 0,
        score: user.score || 0,
        attendanceCount: user.attendanceCount || 0,
        attendanceStreak: user.attendanceStreak || 0,
        lastAttendanceDate: user.lastAttendanceDate || null,
      },
      history: checkedInDates
    });

  } catch (error: any) {
    console.error('Fetch attendance history error:', error);
    return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// POST: Perform attendance check
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
      .prepare('SELECT id, score, points, attendanceCount, lastAttendanceDate, attendanceStreak FROM users WHERE id = ?')
      .bind(sessionData.id)
      .first();

    if (!user) {
      return NextResponse.json({ success: false, error: '유저를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 2. 오늘 및 어제 날짜 확인 (KST/UTC 기준 문자열 YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];

    // 3. 중복 체크
    if (user.lastAttendanceDate === today) {
      return NextResponse.json({ 
        success: false, 
        message: '이미 오늘의 출석 체크를 완료했습니다.',
        alreadyDone: true 
      });
    }

    // 4. 연속 출석(Streak) 및 총 출석 횟수 계산
    let newStreak = 1;
    if (user.lastAttendanceDate === yesterday) {
      newStreak = (user.attendanceStreak || 0) + 1;
    } else {
      newStreak = 1;
    }
    const newAttendanceCount = (user.attendanceCount || 0) + 1;

    // 5. 포인트 지급 및 업데이트 설정
    // 기본 출석: +10 EXP(활동점수), +50 VP(포인트)
    const ATTENDANCE_EXP = 10;
    const ATTENDANCE_POINTS = 50;
    
    const newScore = (user.score || 0) + ATTENDANCE_EXP;
    
    // 자동 레벨 계산
    const { calculateLevel } = await import('@/lib/gamification');
    const newLevel = calculateLevel(newScore);

    // 연속 출석 보너스 계산
    let streakBonus = 0;
    let streakReason = '';
    
    if (newStreak === 7) {
      streakBonus = 100;
      streakReason = 'attendance_streak_7';
    } else if (newStreak === 30) {
      streakBonus = 500;
      streakReason = 'attendance_streak_30';
    }

    const totalPointsAdded = ATTENDANCE_POINTS + streakBonus;
    const newPoints = (user.points || 0) + totalPointsAdded;

    // 6. DB 일괄 업데이트 (Batch)
    const statements = [
      // 유저 테이블 업데이트
      db.prepare('UPDATE users SET score = ?, level = ?, points = ?, attendanceCount = ?, attendanceStreak = ?, lastAttendanceDate = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
        .bind(newScore, newLevel, newPoints, newAttendanceCount, newStreak, today, user.id),
      // 기본 출석 포인트 로그 작성
      db.prepare("INSERT INTO points_logs (userId, amount, reason) VALUES (?, ?, 'attendance')")
        .bind(user.id, ATTENDANCE_POINTS)
    ];

    // 연속 출석 보너스 로그 추가
    if (streakBonus > 0) {
      statements.push(
        db.prepare("INSERT INTO points_logs (userId, amount, reason) VALUES (?, ?, ?)")
          .bind(user.id, streakBonus, streakReason)
      );
    }

    await db.batch(statements);

    let message = `출석 체크 완료! ${ATTENDANCE_POINTS} VP가 지급되었습니다.`;
    if (streakBonus > 0) {
      message += ` 🎉 ${newStreak}일 연속 출석 보너스 +${streakBonus} VP 추가 지급!`;
    }

    return NextResponse.json({
      success: true,
      message,
      addedPoints: totalPointsAdded,
      totalScore: newScore,
      totalPoints: newPoints,
      attendanceCount: newAttendanceCount,
      attendanceStreak: newStreak
    });

  } catch (error: any) {
    console.error('Attendance API Error:', error);
    return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
