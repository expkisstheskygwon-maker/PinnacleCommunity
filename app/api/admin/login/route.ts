import { NextResponse } from 'next/server';
import { signToken } from '@/lib/auth-utils';

export async function POST(request: Request) {
  try {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'pinnacle2026!';
    const sessionSecret = process.env.SESSION_SECRET || process.env.BOT_API_KEY || 'pinnacle_default_session_secret_key_2026';

    const body = await request.json();
    const { username, password } = body;

    if (username === adminUsername && password === adminPassword) {
      const payload = {
        id: 0,
        userId: 'admin',
        nickname: '관리자',
        role: 'admin',
        loginAt: new Date().toISOString(),
        exp: Date.now() + 1000 * 60 * 60 * 8, // 8시간 유효
      };

      const token = await signToken(payload, sessionSecret);

      const response = NextResponse.json({ success: true });
      response.cookies.set('admin_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 8, // 8시간
      });

      return response;
    }

    return NextResponse.json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

