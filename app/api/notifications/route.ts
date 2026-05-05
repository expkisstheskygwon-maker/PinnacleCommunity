import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

// GET: Fetch notifications for the logged-in user
export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('auth_session');
    if (!sessionCookie) {
      return NextResponse.json({ success: true, notifications: [] });
    }

    const session = JSON.parse(sessionCookie.value);
    const { env } = getCloudflareContext();
    const db = env.DB as any;

    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit') ?? 20);
    const offset = Number(searchParams.get('offset') ?? 0);

    const { results } = await db
      .prepare(
        'SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?'
      )
      .bind(session.id, limit, offset)
      .all();

    // Also fetch unread count
    const countRow = await db
      .prepare('SELECT COUNT(*) as cnt FROM notifications WHERE userId = ? AND readAt IS NULL')
      .bind(session.id)
      .first();

    return NextResponse.json({
      success: true,
      notifications: results,
      unreadCount: countRow?.cnt ?? 0,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Create a notification (used internally by backend / admin)
export async function POST(request: NextRequest) {
  try {
    const { userId, type, title, body, link } = await request.json();

    if (!userId || !type || !title) {
      return NextResponse.json(
        { success: false, error: 'userId, type, title은 필수입니다.' },
        { status: 400 }
      );
    }

    const { env } = getCloudflareContext();
    const db = env.DB as any;

    await db
      .prepare(
        'INSERT INTO notifications (userId, type, title, body, link) VALUES (?, ?, ?, ?, ?)'
      )
      .bind(userId, type, title, body ?? null, link ?? null)
      .run();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH: Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('auth_session');
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const { ids } = await request.json(); // array of notification IDs

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: 'ids 배열이 필요합니다.' }, { status: 400 });
    }

    const { env } = getCloudflareContext();
    const db = env.DB as any;

    const now = new Date().toISOString();
    const stmt = db.prepare(
      'UPDATE notifications SET readAt = ? WHERE id = ? AND userId = ?'
    );

    for (const id of ids) {
      await stmt.bind(now, id, session.id).run();
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
