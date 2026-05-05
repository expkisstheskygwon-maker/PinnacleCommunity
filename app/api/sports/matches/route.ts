import { NextResponse } from 'next/server';
import { getTodayMatches } from '@/lib/sports';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get('sport') || 'soccer';

  try {
    const matches = await getTodayMatches(sport);
    return NextResponse.json({ matches });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
