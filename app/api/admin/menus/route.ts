import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');
    if (!adminSession?.value) return NextResponse.json({ success: false, error: '권한 없음' }, { status: 401 });

    const { menuId, label, labelEn, icon, href, sortOrder } = await request.json();
    if (!menuId || !label || !labelEn || !icon || !href) {
      return NextResponse.json({ success: false, error: '필수 항목 누락' }, { status: 400 });
    }

    const { env } = getCloudflareContext();
    const db = env.DB as any;

    const finalSortOrder = sortOrder !== undefined ? sortOrder : 0;

    const result = await db.prepare(
      'INSERT INTO main_menus (menuId, label, labelEn, icon, href, sortOrder) VALUES (?, ?, ?, ?, ?, ?)'
    )
      .bind(menuId, label, labelEn, icon, href, finalSortOrder)
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

    const { env } = getCloudflareContext();
    const db = env.DB as any;

    const body = await request.json();

    // Check if it is a batch order update
    if (body.menus && Array.isArray(body.menus)) {
      const statements = body.menus.map((m: any) =>
        db.prepare('UPDATE main_menus SET sortOrder = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').bind(m.sortOrder, m.id)
      );
      await db.batch(statements);
      return NextResponse.json({ success: true });
    }

    // Single item update
    const { id, menuId, label, labelEn, icon, href, sortOrder } = body;
    if (!id) return NextResponse.json({ success: false, error: 'ID 필수' }, { status: 400 });

    const updates: string[] = [];
    const params: any[] = [];

    if (menuId !== undefined) { updates.push('menuId = ?'); params.push(menuId); }
    if (label !== undefined) { updates.push('label = ?'); params.push(label); }
    if (labelEn !== undefined) { updates.push('labelEn = ?'); params.push(labelEn); }
    if (icon !== undefined) { updates.push('icon = ?'); params.push(icon); }
    if (href !== undefined) { updates.push('href = ?'); params.push(href); }
    if (sortOrder !== undefined) { updates.push('sortOrder = ?'); params.push(sortOrder); }

    if (updates.length === 0) {
      return NextResponse.json({ success: false, error: '변경할 필드가 없습니다.' }, { status: 400 });
    }

    params.push(id);
    const query = `UPDATE main_menus SET ${updates.join(', ')}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
    const result = await db.prepare(query).bind(...params).run();

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

    const result = await db.prepare('DELETE FROM main_menus WHERE id = ?').bind(id).run();
    if (!result.success) throw new Error('삭제 실패');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
