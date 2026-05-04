import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('auth_session');
    if (!sessionCookie) {
      return NextResponse.json({ success: true, favorites: [], bets: [] });
    }

    const session = JSON.parse(sessionCookie.value);
    const { env } = getCloudflareContext();
    const db = env.DB as any;

    const favorites = await db
      .prepare('SELECT matchId FROM user_favorites WHERE userId = ?')
      .bind(session.id)
      .all();
    
    const bets = await db
      .prepare('SELECT matchId FROM user_bets WHERE userId = ?')
      .bind(session.id)
      .all();

    return NextResponse.json({ 
      success: true, 
      favorites: favorites.results.map((r: any) => r.matchId.toString()),
      bets: bets.results.map((r: any) => r.matchId.toString())
    });
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
    const { matchId, type, action } = await request.json(); // type: 'favorite' or 'bet', action: 'add' or 'remove'
    
    const { env } = getCloudflareContext();
    const db = env.DB as any;

    const table = type === 'favorite' ? 'user_favorites' : 'user_bets';

    if (action === 'add') {
      const existing = await db
        .prepare(`SELECT id FROM ${table} WHERE userId = ? AND matchId = ?`)
        .bind(session.id, matchId.toString())
        .first();
      
      if (!existing) {
        await db
          .prepare(`INSERT INTO ${table} (userId, matchId) VALUES (?, ?)`)
          .bind(session.id, matchId.toString())
          .run();
      }
    } else {
      await db
        .prepare(`DELETE FROM ${table} WHERE userId = ? AND matchId = ?`)
        .bind(session.id, matchId.toString())
        .run();
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
