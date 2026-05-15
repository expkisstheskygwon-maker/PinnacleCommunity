import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authSession = cookieStore.get('auth_session');

    if (!authSession?.value) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const sessionData = JSON.parse(authSession.value);
    const userId = sessionData.id;

    const { sport, league, match, market, selection, odds, stake, betDate } = await request.json();

    if (!sport || !market || !selection || !odds || !stake) {
      return NextResponse.json({ success: false, error: '필수 항목을 모두 입력해주세요.' }, { status: 400 });
    }

    const { env } = getCloudflareContext();
    const db = env.DB as any;

    await db.prepare(`
      INSERT INTO betting_records (userId, sport, league, match, market, selection, odds, stake, betDate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(userId, sport, league || null, match || null, market, selection, odds, stake, betDate || new Date().toISOString())
    .run();

    return NextResponse.json({ success: true, message: '베팅 기록이 저장되었습니다.' });
  } catch (error: any) {
    console.error('Create betting record error:', error);
    return NextResponse.json({ success: false, error: '기록 저장 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

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

    const { results } = await db.prepare('SELECT * FROM betting_records WHERE userId = ? ORDER BY betDate DESC')
      .bind(userId)
      .all();

    return NextResponse.json({ success: true, records: results });
  } catch (error: any) {
    console.error('Fetch betting records error:', error);
    return NextResponse.json({ success: false, error: '기록을 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
    try {
      const cookieStore = await cookies();
      const authSession = cookieStore.get('auth_session');
  
      if (!authSession?.value) {
        return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 });
      }
  
      const sessionData = JSON.parse(authSession.value);
      const userId = sessionData.id;
  
      const { id, status, resultAmount } = await request.json();
  
      if (!id || !status) {
        return NextResponse.json({ success: false, error: 'ID와 상태를 입력해주세요.' }, { status: 400 });
      }
  
      const { env } = getCloudflareContext();
      const db = env.DB as any;
  
      await db.prepare(`
        UPDATE betting_records 
        SET status = ?, resultAmount = ?, updatedAt = CURRENT_TIMESTAMP 
        WHERE id = ? AND userId = ?
      `)
      .bind(status, resultAmount || 0, id, userId)
      .run();
  
      return NextResponse.json({ success: true, message: '상태가 업데이트되었습니다.' });
    } catch (error: any) {
      console.error('Update betting record error:', error);
      return NextResponse.json({ success: false, error: '업데이트 중 오류가 발생했습니다.' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
      const cookieStore = await cookies();
      const authSession = cookieStore.get('auth_session');
  
      if (!authSession?.value) {
        return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 });
      }
  
      const sessionData = JSON.parse(authSession.value);
      const userId = sessionData.id;
  
      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');
  
      if (!id) {
        return NextResponse.json({ success: false, error: 'ID가 필요합니다.' }, { status: 400 });
      }
  
      const { env } = getCloudflareContext();
      const db = env.DB as any;
  
      await db.prepare('DELETE FROM betting_records WHERE id = ? AND userId = ?')
        .bind(id, userId)
        .run();
  
      return NextResponse.json({ success: true, message: '기록이 삭제되었습니다.' });
    } catch (error: any) {
      console.error('Delete betting record error:', error);
      return NextResponse.json({ success: false, error: '삭제 중 오류가 발생했습니다.' }, { status: 500 });
    }
}
