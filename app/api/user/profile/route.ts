import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authSession = cookieStore.get('auth_session');

    if (!authSession?.value) {
      return NextResponse.json(
        { success: false, error: '인증 세션이 만료되었습니다. 다시 로그인해주세요.' },
        { status: 401 }
      );
    }

    const sessionData = JSON.parse(authSession.value);

    const { env } = getCloudflareContext();
    const db = env.DB as any;

    const user: any = await db
      .prepare('SELECT id, userId, nickname, email, avatar, score, level, points, status, attendanceCount, createdAt FROM users WHERE id = ?')
      .bind(sessionData.id)
      .first();

    if (!user) {
      return NextResponse.json(
        { success: false, error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: user
    });
  } catch (error: any) {
    console.error('Fetch user profile error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
