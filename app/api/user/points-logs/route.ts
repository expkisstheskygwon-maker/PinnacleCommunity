import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { cookies } from 'next/headers';

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

    const { results } = await db
      .prepare('SELECT id, amount, reason, referenceId, createdAt FROM points_logs WHERE userId = ? ORDER BY createdAt DESC LIMIT 100')
      .bind(userId)
      .all();

    return NextResponse.json({
      success: true,
      logs: results || []
    });
  } catch (error: any) {
    console.error('Fetch points logs error:', error);
    return NextResponse.json({ success: false, error: '거래 내역을 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
