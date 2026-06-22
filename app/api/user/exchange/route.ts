import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { cookies } from 'next/headers';

const EXCHANGE_RATE = 10; // 1 VP = 10 BM

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authSession = cookieStore.get('auth_session');

    if (!authSession?.value) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const sessionData = JSON.parse(authSession.value);
    const userId = sessionData.id;

    const { amount } = await request.json();
    const vpAmount = parseInt(amount);

    if (isNaN(vpAmount) || vpAmount <= 0) {
      return NextResponse.json({ success: false, error: '환전할 포인트를 정확히 입력해주세요.' }, { status: 400 });
    }

    if (vpAmount < 100) {
      return NextResponse.json({ success: false, error: '최소 환전 금액은 100 VP입니다.' }, { status: 400 });
    }

    const { env } = getCloudflareContext();
    const db = env.DB as any;

    // Fetch user points
    const user: any = await db
      .prepare('SELECT points, betMoney FROM users WHERE id = ?')
      .bind(userId)
      .first();

    if (!user) {
      return NextResponse.json({ success: false, error: '유저를 찾을 수 없습니다.' }, { status: 404 });
    }

    if (user.points < vpAmount) {
      return NextResponse.json({ success: false, error: '보유한 포인트가 부족합니다.' }, { status: 400 });
    }

    const bmAmount = vpAmount * EXCHANGE_RATE;
    const statements = [
      // 1. Deduct points, Add betMoney
      db.prepare('UPDATE users SET points = points - ?, betMoney = betMoney + ? WHERE id = ?')
        .bind(vpAmount, bmAmount, userId),
      // 2. Log points log (exchange out)
      db.prepare(`
        INSERT INTO points_logs (userId, amount, reason)
        VALUES (?, ?, 'exchange_out')
      `).bind(userId, -vpAmount),
      // 3. Log bet money log (exchange in)
      db.prepare(`
        INSERT INTO bet_money_logs (userId, amount, reason)
        VALUES (?, ?, 'exchange_in')
      `).bind(userId, bmAmount),
      // 4. Create notification
      db.prepare('INSERT INTO notifications (userId, type, title, body) VALUES (?, "system", ?, ?)')
        .bind(
          userId,
          `💱 포인트 환전 완료 (-${vpAmount.toLocaleString()} VP)`,
          `포인트 환전이 성공적으로 완료되었습니다. VP: -${vpAmount.toLocaleString()} VP, BM: +${bmAmount.toLocaleString()} BM 지급`
        )
    ];

    await db.batch(statements);

    return NextResponse.json({
      success: true,
      message: `${vpAmount.toLocaleString()} VP가 ${bmAmount.toLocaleString()} BM으로 환전되었습니다.`,
      points: user.points - vpAmount,
      betMoney: user.betMoney + bmAmount
    });

  } catch (error: any) {
    console.error('Points exchange API error:', error);
    return NextResponse.json({ success: false, error: '환전 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
