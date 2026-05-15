import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { cookies } from 'next/headers';

async function checkAdmin() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');

  if (!adminSession?.value) return false;

  try {
    const session = JSON.parse(adminSession.value);
    return session.role === 'admin';
  } catch (e) {
    return false;
  }
}

export async function GET(request: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { env } = getCloudflareContext();
    const db = env.DB as any;

    // Fetch inquiries with user information if available
    const { results } = await db.prepare(`
      SELECT i.*, u.nickname as userNickname 
      FROM inquiries i 
      LEFT JOIN users u ON i.userId = u.id 
      ORDER BY i.createdAt DESC
    `).all();

    return NextResponse.json({ success: true, inquiries: results });
  } catch (error: any) {
    console.error('Admin fetch inquiries error:', error);
    return NextResponse.json({ success: false, error: '문의 내역을 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, answer } = await request.json();

    if (!id || !answer) {
      return NextResponse.json({ success: false, error: 'ID와 답변 내용을 입력해주세요.' }, { status: 400 });
    }

    const { env } = getCloudflareContext();
    const db = env.DB as any;

    await db.prepare('UPDATE inquiries SET answer = ?, status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(answer, 'answered', id)
      .run();

    return NextResponse.json({ success: true, message: '답변이 등록되었습니다.' });
  } catch (error: any) {
    console.error('Admin update inquiry error:', error);
    return NextResponse.json({ success: false, error: '답변 등록 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
