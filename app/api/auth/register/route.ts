import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

import { hashPassword } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const { userId, password, nickname, email, referralCode } = (await request.json()) as any;

    if (!userId || !password || !nickname || !email) {
      return NextResponse.json(
        { success: false, error: '모든 필수 항목을 입력해주세요.' },
        { status: 400 }
      );
    }

    const { env } = getCloudflareContext();
    const db = env.DB as any;

    // Check if user already exists
    const existingUser = await db
      .prepare('SELECT id FROM users WHERE userId = ? OR email = ?')
      .bind(userId, email)
      .first();

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: '이미 사용 중인 아이디 또는 이메일입니다.' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Insert user
    const result = await db
      .prepare(
        'INSERT INTO users (userId, passwordHash, nickname, email, referralCode) VALUES (?, ?, ?, ?, ?)'
      )
      .bind(userId, passwordHash, nickname, email, referralCode || null)
      .run();

    if (!result.success) {
      throw new Error('데이터베이스 저장 중 오류가 발생했습니다.');
    }

    return NextResponse.json(
      { success: true, message: '회원가입이 완료되었습니다.' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
