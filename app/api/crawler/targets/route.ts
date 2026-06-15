import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export async function GET() {
  try {
    const { env } = getCloudflareContext();
    const db = env.DB as any;
    
    const { results } = await db.prepare('SELECT * FROM crawler_targets ORDER BY id DESC').all();
    return NextResponse.json({ success: true, targets: results });
  } catch (error: any) {
    console.error('Failed to fetch crawler targets:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { env } = getCloudflareContext();
    const db = env.DB as any;
    const { url, category, subCategory } = await request.json();

    if (!url) {
      return NextResponse.json({ success: false, error: 'URL is required' }, { status: 400 });
    }

    const result = await db
      .prepare('INSERT INTO crawler_targets (url, category, subCategory, isActive) VALUES (?, ?, ?, 1)')
      .bind(url, category || 'spotlight', subCategory || '최신 동향')
      .run();

    return NextResponse.json({ success: true, targetId: result.meta.last_row_id });
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ success: false, error: 'URL already exists' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { env } = getCloudflareContext();
    const db = env.DB as any;
    const { id, isActive } = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    await db
      .prepare('UPDATE crawler_targets SET isActive = ? WHERE id = ?')
      .bind(isActive ? 1 : 0, id)
      .run();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { env } = getCloudflareContext();
    const db = env.DB as any;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    await db.prepare('DELETE FROM crawler_targets WHERE id = ?').bind(id).run();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
