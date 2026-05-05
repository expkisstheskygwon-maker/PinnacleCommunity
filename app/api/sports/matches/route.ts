import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getTodayMatches } from '@/lib/sports';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get('sport') || 'soccer';

  try {
    const { env } = getCloudflareContext();
    const matches = await getTodayMatches(sport, (env as any).APISPORTS_KEY);
    return NextResponse.json({ matches });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
