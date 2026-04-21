import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { verifyPassword } from '@/lib/auth-utils';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { userId, password } = (await request.json()) as any;

    if (!userId || !password) {
      return NextResponse.json(
        { success: false, error: '아이디와 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    const { env } = getRequestContext();
    const db = env.DB;

    // Find user
    const user: any = await db
      .prepare('SELECT * FROM users WHERE userId = ?')
      .bind(userId)
      .first();

    if (!user) {
      return NextResponse.json(
        { success: false, error: '존재하지 않는 사용자입니다.' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: '비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      );
    }

    // In a real app, you would set a session cookie here.
    // For now, we'll return user info (excluding password hash)
    const { passwordHash, ...userWithoutPassword } = user;

    const response = NextResponse.json(
      { 
        success: true, 
        message: '로그인 성공!',
        user: userWithoutPassword
      },
      { status: 200 }
    );

    // Simple session cookie (unencrypted for demonstration)
    response.cookies.set('auth_session', JSON.stringify({
      id: user.id,
      userId: user.userId,
      nickname: user.nickname
    }), {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
