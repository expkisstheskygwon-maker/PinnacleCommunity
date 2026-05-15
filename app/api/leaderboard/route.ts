import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { env } = getCloudflareContext();
    const db = env.DB as any;

    // Calculate ROI and other stats per user
    // ROI = (Total Return - Total Stake) / Total Stake * 100
    const query = `
      SELECT 
        u.id,
        u.nickname,
        u.avatar,
        u.level,
        COUNT(b.id) as totalBets,
        SUM(b.stake) as totalStake,
        SUM(b.resultAmount) as totalReturn,
        (SUM(b.resultAmount) - SUM(b.stake)) as netProfit,
        ((SUM(b.resultAmount) - SUM(b.stake)) / SUM(b.stake) * 100) as roi,
        (CAST(COUNT(CASE WHEN b.status = 'won' THEN 1 END) AS FLOAT) / COUNT(*) * 100) as winRate
      FROM users u
      JOIN betting_records b ON u.id = b.userId
      WHERE b.status IN ('won', 'lost', 'half-won', 'half-lost', 'void')
      GROUP BY u.id
      HAVING totalStake > 0
      ORDER BY roi DESC
      LIMIT 20
    `;

    const { results } = await db.prepare(query).all();

    return NextResponse.json({ 
      success: true, 
      leaderboard: results 
    });
  } catch (error: any) {
    console.error('Fetch leaderboard error:', error);
    return NextResponse.json({ success: false, error: '랭킹 정보를 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
