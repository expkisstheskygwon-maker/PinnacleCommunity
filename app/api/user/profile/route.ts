import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
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

    const user: any = await db
      .prepare('SELECT id, userId, nickname, email, referralCode, avatar, score, level, status, points, attendanceCount, nicknameColor, lastRechargeDate, createdAt FROM users WHERE id = ?')
      .bind(userId)
      .first();

    if (!user) {
      return NextResponse.json({ success: false, error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // Fetch user inventory
    const { results: inventory } = await db
      .prepare('SELECT itemType, quantity FROM user_inventory WHERE userId = ?')
      .bind(userId)
      .all();

    return NextResponse.json({
      success: true,
      profile: {
        ...user,
        inventory: inventory || []
      }
    });
  } catch (error: any) {
    console.error('Fetch profile error:', error);
    return NextResponse.json({ success: false, error: '프로필을 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
