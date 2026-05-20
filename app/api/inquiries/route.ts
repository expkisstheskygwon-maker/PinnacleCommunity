import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, title, content } = await request.json();
    const cookieStore = await cookies();
    const authSession = cookieStore.get('auth_session');

    let userId: number | null = null;
    if (authSession?.value) {
      try {
        const sessionData = JSON.parse(authSession.value);
        userId = sessionData.id;
      } catch (e) {}
    }

    if (!userId && !email) {
      return NextResponse.json({ success: false, error: '이메일 주소를 입력해주세요.' }, { status: 400 });
    }

    if (!title || !content) {
      return NextResponse.json({ success: false, error: '제목과 내용을 입력해주세요.' }, { status: 400 });
    }

    const { env } = getCloudflareContext();
    const db = env.DB as any;

    await db.prepare('INSERT INTO inquiries (userId, email, title, content) VALUES (?, ?, ?, ?)')
      .bind(userId, email || null, title, content)
      .run();

    return NextResponse.json({ success: true, message: '문의가 성공적으로 접수되었습니다.' });
  } catch (error: any) {
    console.error('Create inquiry error:', error);
    return NextResponse.json({ success: false, error: '문의 접수 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const { env } = getCloudflareContext();
    const db = env.DB as any;

    if (type === 'featured') {
      const { results } = await db.prepare(`
        SELECT i.*, u.nickname as userNickname 
        FROM inquiries i 
        LEFT JOIN users u ON i.userId = u.id 
        WHERE i.status = 'answered' AND i.showOnMain = 1 
        ORDER BY i.createdAt DESC 
        LIMIT 5
      `).all();
      return NextResponse.json({ success: true, inquiries: results });
    }

    if (type === 'public') {
      const { results } = await db.prepare(`
        SELECT i.*, u.nickname as userNickname 
        FROM inquiries i 
        LEFT JOIN users u ON i.userId = u.id 
        ORDER BY i.createdAt DESC
      `).all();
      return NextResponse.json({ success: true, inquiries: results });
    }

    const cookieStore = await cookies();
    const authSession = cookieStore.get('auth_session');

    if (!authSession?.value) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const sessionData = JSON.parse(authSession.value);
    const userId = sessionData.id;

    const { results } = await db.prepare('SELECT * FROM inquiries WHERE userId = ? ORDER BY createdAt DESC')
      .bind(userId)
      .all();

    return NextResponse.json({ success: true, inquiries: results });
  } catch (error: any) {
    console.error('Fetch inquiries error:', error);
    return NextResponse.json({ success: false, error: '문의 내역을 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
