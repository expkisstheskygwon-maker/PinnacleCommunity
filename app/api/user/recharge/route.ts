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
    const userId = sessionData.id;

    const { env } = getCloudflareContext();
    const db = env.DB as any;

    // Fetch user info
    const user: any = await db
      .prepare('SELECT points, lastRechargeDate FROM users WHERE id = ?')
      .bind(userId)
      .first();

    if (!user) {
      return NextResponse.json({ success: false, error: '유저를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 1. Check points balance limit
    if ((user.points || 0) >= 1000) {
      return NextResponse.json({ 
        success: false, 
        error: '무료 충전은 보유 포인트가 1,000 VP 미만일 때만 신청 가능합니다.' 
      }, { status: 400 });
    }

    // 2. Check daily limit
    const today = new Date().toISOString().split('T')[0];
    if (user.lastRechargeDate === today) {
      return NextResponse.json({ 
        success: false, 
        error: '이미 오늘의 무료 충전을 완료했습니다. 내일 다시 시도해주세요.' 
      }, { status: 400 });
    }

    const rechargeAmount = 5000;
    const statements = [
      // Update points and last recharge date
      db.prepare('UPDATE users SET points = points + ?, lastRechargeDate = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
        .bind(rechargeAmount, today, userId),
      // Log point transaction
      db.prepare(`
        INSERT INTO points_logs (userId, amount, reason)
        VALUES (?, ?, 'recharge')
      `).bind(userId, rechargeAmount),
      // Create notification
      db.prepare('INSERT INTO notifications (userId, type, title, body) VALUES (?, "system", ?, ?)')
        .bind(
          userId,
          `⚡ 무료 포인트 충전 완료 (+${rechargeAmount.toLocaleString()} VP)`,
          `포인트 무료 충전이 완료되어 5,000 VP가 지급되었습니다. 보유 포인트: ${(user.points + rechargeAmount).toLocaleString()} VP`
        )
    ];

    await db.batch(statements);

    return NextResponse.json({ 
      success: true, 
      message: '5,000 VP가 무료 충전되었습니다.',
      addedPoints: rechargeAmount,
      totalPoints: user.points + rechargeAmount
    });

  } catch (error: any) {
    console.error('Recharge API error:', error);
    return NextResponse.json({ success: false, error: '충전 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
