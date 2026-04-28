import { NextResponse } from 'next/server';

// 임시 관리자 계정 (추후 DB 연동)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'pinnacle2026!',
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      const adminSession = JSON.stringify({
        id: 0,
        userId: 'admin',
        nickname: '관리자',
        role: 'admin',
        loginAt: new Date().toISOString(),
      });

      const response = NextResponse.json({ success: true });
      response.cookies.set('admin_session', adminSession, {
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
