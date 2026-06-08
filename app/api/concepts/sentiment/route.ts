import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export async function GET(request: NextRequest) {
  try {
    const { env } = getCloudflareContext();
    const db = env.DB as any;

    // Fetch the last 50 sentiment post records
    const { results } = await db.prepare(
      "SELECT sentiment, COUNT(*) as count FROM (SELECT sentiment FROM posts WHERE category = 'sentiment' ORDER BY createdAt DESC LIMIT 50) GROUP BY sentiment"
    ).all();

    // Default distribution in case of no data
    const counts: Record<string, number> = {
      '🔥': 0,
      '😭': 0,
      '🎉': 0,
      '🤬': 0
    };

    let total = 0;
    results.forEach((row: any) => {
      if (row.sentiment && counts[row.sentiment] !== undefined) {
        counts[row.sentiment] = row.count;
        total += row.count;
      }
    });

    const percentages: Record<string, number> = {};
    if (total === 0) {
      percentages['🔥'] = 25;
      percentages['😭'] = 25;
      percentages['🎉'] = 25;
      percentages['🤬'] = 25;
    } else {
      Object.keys(counts).forEach(key => {
        percentages[key] = Math.round((counts[key] / total) * 100);
      });
    }

    return NextResponse.json({
      success: true,
      total,
      counts,
      percentages
    });
  } catch (error: any) {
    console.error('Sentiment calculations error:', error);
    return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
