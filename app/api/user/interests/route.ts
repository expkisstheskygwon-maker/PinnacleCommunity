import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('auth_session');
    if (!sessionCookie) {
      return NextResponse.json({ success: true, interests: [] });
    }

    const session = JSON.parse(sessionCookie.value);
    const { env } = getCloudflareContext();
    const db = env.DB as any;

    const interests = await db
      .prepare('SELECT * FROM user_interests WHERE userId = ? ORDER BY priority DESC')
      .bind(session.id)
      .all();

    return NextResponse.json({ success: true, interests: interests.results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('auth_session');
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const { category, value, action } = await request.json(); // action: 'add' or 'remove'
    
    const { env } = getCloudflareContext();
    const db = env.DB as any;

    if (action === 'add') {
      // 중복 체크
      const existing = await db
        .prepare('SELECT id FROM user_interests WHERE userId = ? AND category = ? AND value = ?')
        .bind(session.id, category, value)
        .first();
      
      if (!existing) {
        await db
          .prepare('INSERT INTO user_interests (userId, category, value) VALUES (?, ?, ?)')
          .bind(session.id, category, value)
          .run();
      }
    } else {
      await db
        .prepare('DELETE FROM user_interests WHERE userId = ? AND category = ? AND value = ?')
        .bind(session.id, category, value)
        .run();
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
