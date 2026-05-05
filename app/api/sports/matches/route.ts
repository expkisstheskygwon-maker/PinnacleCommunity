import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getTodayMatches } from '@/lib/sports';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get('sport') || 'soccer';

  try {
    const { env } = getCloudflareContext();
    const apiKey = (env as any).APISPORTS_KEY;
    
    if (!apiKey) {
      console.warn('[Matches API] APISPORTS_KEY is missing in env');
    }

    const matches = await getTodayMatches(sport, apiKey);
    console.log(`[Matches API] Success: ${sport}, Count: ${matches.length}`);
    return NextResponse.json({ matches });
  } catch (error: any) {
    console.error('[Matches API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
