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
      .prepare('SELECT betMoney, lastRechargeDate FROM users WHERE id = ?')
      .bind(userId)
      .first();

    if (!user) {
      return NextResponse.json({ success: false, error: '유저를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 1. Check betMoney balance limit
    if ((user.betMoney || 0) >= 10000) {
      return NextResponse.json({ 
        success: false, 
        error: '무료 충전은 보유 배팅 머니가 10,000 BM 미만일 때만 신청 가능합니다.' 
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

    const rechargeAmount = 50000;
    const statements = [
      // Update betMoney and last recharge date
      db.prepare('UPDATE users SET betMoney = betMoney + ?, lastRechargeDate = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
        .bind(rechargeAmount, today, userId),
      // Log betMoney transaction
      db.prepare(`
        INSERT INTO bet_money_logs (userId, amount, reason)
        VALUES (?, ?, 'recharge')
      `).bind(userId, rechargeAmount),
      // Create notification
      db.prepare('INSERT INTO notifications (userId, type, title, body) VALUES (?, "system", ?, ?)')
        .bind(
          userId,
          `⚡ 무료 배팅 머니 충전 완료 (+${rechargeAmount.toLocaleString()} BM)`,
          `배팅 머니 무료 충전이 완료되어 50,000 BM이 지급되었습니다. 보유 배팅 머니: ${(user.betMoney + rechargeAmount).toLocaleString()} BM`
        )
    ];

    await db.batch(statements);

    return NextResponse.json({ 
      success: true, 
      message: '50,000 BM이 무료 충전되었습니다.',
      addedPoints: rechargeAmount,
      totalPoints: user.betMoney + rechargeAmount
    });

  } catch (error: any) {
    console.error('Recharge API error:', error);
    return NextResponse.json({ success: false, error: '충전 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
