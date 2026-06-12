import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export async function GET(request: NextRequest) {
  try {
    const { env } = getCloudflareContext();
    const db = env.DB as any;

    const { results } = await db.prepare('SELECT * FROM main_menus ORDER BY sortOrder ASC, id ASC').all();

    return NextResponse.json({ success: true, menus: results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
