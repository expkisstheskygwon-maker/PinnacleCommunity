import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { cookies } from 'next/headers';
import { hashPassword } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
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
    const { nickname, email, password, avatar } = (await request.json()) as any;

    const { env } = getCloudflareContext();
    const db = env.DB as any;

    // 1. Validation
    if (!nickname || !email) {
      return NextResponse.json(
        { success: false, error: '닉네임과 이메일은 필수 항목입니다.' },
        { status: 400 }
      );
    }

    // Check if email or nickname is already taken by someone else
    const existingUser = await db
      .prepare('SELECT id FROM users WHERE (nickname = ? OR email = ?) AND id != ?')
      .bind(nickname, email, sessionData.id)
      .first();

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: '이미 사용 중인 닉네임 또는 이메일입니다.' },
        { status: 409 }
      );
    }

    // 2. Prepare update fields
    let query = 'UPDATE users SET nickname = ?, email = ?, updatedAt = CURRENT_TIMESTAMP';
    let params = [nickname, email];

    if (avatar) {
      query += ', avatar = ?';
      params.push(avatar);
    }

    if (password && password.trim() !== '') {
      const passwordHash = await hashPassword(password);
      query += ', passwordHash = ?';
      params.push(passwordHash);
    }

    query += ' WHERE id = ?';
    params.push(sessionData.id);

    // 3. Execute update
    const result = await db.prepare(query).bind(...params).run();

    if (!result.success) {
      throw new Error('데이터베이스 업데이트 중 오류가 발생했습니다.');
    }

    // 4. Update session cookie if needed (e.g., nickname changed)
    const updatedSession = {
      ...sessionData,
      nickname: nickname,
    };

    const response = NextResponse.json({
      success: true,
      message: '프로필이 성공적으로 업데이트되었습니다.',
      user: {
        nickname,
        email,
        avatar: avatar || null
      }
    });

    response.cookies.set('auth_session', JSON.stringify(updatedSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return response;
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
