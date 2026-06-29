import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export async function GET(request: NextRequest) {
  try {
    const { env } = getCloudflareContext();
    const db = env.DB as any;

    // 1. Fetch recent posts
    const { results: posts } = await db.prepare(`
      SELECT p.id, p.title, p.category, p.createdAt, u.nickname, u.avatar
      FROM posts p
      JOIN users u ON p.authorId = u.id
      ORDER BY p.createdAt DESC
      LIMIT 10
    `).all();

    // 2. Fetch recent comments
    const { results: comments } = await db.prepare(`
      SELECT c.id, c.postId, c.content, c.createdAt, u.nickname, u.avatar
      FROM comments c
      JOIN users u ON c.authorId = u.id
      ORDER BY c.createdAt DESC
      LIMIT 10
    `).all();

    // 3. Fetch recent betting records
    const { results: bets } = await db.prepare(`
      SELECT b.id, b.match, b.sport, b.createdAt, u.nickname, u.avatar
      FROM betting_records b
      JOIN users u ON b.userId = u.id
      ORDER BY b.createdAt DESC
      LIMIT 10
    `).all();

    // 4. Combine and format
    const activities: any[] = [];

    posts.forEach((p: any) => {
      let categoryName = '커뮤니티';
      if (p.category === 'notices') categoryName = '공지사항';
      else if (p.category === 'spotlight') categoryName = '스포트라이트';
      else if (p.category === 'analysis') categoryName = '분석 게시판';
      else if (p.category === 'concepts') categoryName = '개념탑재';
      else if (p.category === 'guide') categoryName = '가이드';
      else if (p.category === 'qna') categoryName = 'Q&A';

      activities.push({
        type: 'post',
        postId: p.id,
        user: p.nickname || '익명',
        avatar: (p.nickname || '익명').substring(0, 2),
        action: `${categoryName}에 글을 작성했습니다`,
        time: p.createdAt,
        rawTime: new Date(p.createdAt).getTime()
      });
    });

    comments.forEach((c: any) => {
      activities.push({
        type: 'comment',
        postId: c.postId,
        user: c.nickname || '익명',
        avatar: (c.nickname || '익명').substring(0, 2),
        action: `댓글을 작성했습니다`,
        time: c.createdAt,
        rawTime: new Date(c.createdAt).getTime()
      });
    });

    bets.forEach((b: any) => {
      activities.push({
        type: 'bet',
        user: b.nickname || '익명',
        avatar: (b.nickname || '익명').substring(0, 2),
        action: `가상 배팅을 완료했습니다`,
        time: b.createdAt,
        rawTime: new Date(b.createdAt).getTime()
      });
    });

    // Sort by time descending
    activities.sort((a, b) => b.rawTime - a.rawTime);

    // Limit to 5
    const recentActivities = activities.slice(0, 5);

    return NextResponse.json({ success: true, activities: recentActivities });
  } catch (error: any) {
    console.error('Fetch recent activities error:', error);
    return NextResponse.json({ success: false, error: '최근 활동 내역을 불러오는데 실패했습니다.' }, { status: 500 });
  }
}
