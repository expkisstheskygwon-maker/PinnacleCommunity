import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const { env } = getCloudflareContext();
    const db = env.DB as any;

    let query = 'SELECT * FROM post_categories';
    let params: any[] = [];

    if (type) {
      query += ' WHERE type = ?';
      params.push(type);
    }

    query += ' ORDER BY createdAt ASC';

    const { results } = await db.prepare(query).bind(...params).all();

    return NextResponse.json({ success: true, categories: results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');
    if (!adminSession?.value) return NextResponse.json({ success: false, error: '권한 없음' }, { status: 401 });

    const { type, name } = await request.json();
    if (!type || !name) return NextResponse.json({ success: false, error: '필수 항목 누락' }, { status: 400 });

    const { env } = getCloudflareContext();
    const db = env.DB as any;

    const result = await db.prepare('INSERT INTO post_categories (type, name) VALUES (?, ?)')
      .bind(type, name)
      .run();

    if (!result.success) throw new Error('저장 실패');

    return NextResponse.json({ success: true, id: result.meta.last_row_id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');
    if (!adminSession?.value) return NextResponse.json({ success: false, error: '권한 없음' }, { status: 401 });

    const { id, name } = await request.json();
    if (!id || !name) return NextResponse.json({ success: false, error: '필수 항목 누락' }, { status: 400 });

    const { env } = getCloudflareContext();
    const db = env.DB as any;

    const result = await db.prepare('UPDATE post_categories SET name = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(name, id)
      .run();

    if (!result.success) throw new Error('수정 실패');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');
    if (!adminSession?.value) return NextResponse.json({ success: false, error: '권한 없음' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: '필수 항목 누락' }, { status: 400 });

    const { env } = getCloudflareContext();
    const db = env.DB as any;

    const result = await db.prepare('DELETE FROM post_categories WHERE id = ?').bind(id).run();
    if (!result.success) throw new Error('삭제 실패');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
