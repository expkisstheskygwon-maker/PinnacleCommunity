import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');

    if (!adminSession?.value) {
      return NextResponse.json({ success: false, error: '권한이 없습니다.' }, { status: 401 });
    }

    const { env } = getCloudflareContext();
    const db = env.DB as any;

    // Get total users
    const { results: usersResults } = await db.prepare('SELECT COUNT(*) as total FROM users').all();
    const totalUsers = usersResults[0]?.total || 0;

    // Get total posts
    const { results: postsResults } = await db.prepare('SELECT COUNT(*) as total FROM posts').all();
    const totalPosts = postsResults[0]?.total || 0;

    // Today's visits - Since we don't have a visits table, we'll just mock or use a simple logic. 
    // We can count users who joined today for now, or just leave it as dummy data. Let's return 0 for now or some calculated value.
    const today = new Date().toISOString().split('T')[0];
    const { results: todayUsersResults } = await db.prepare('SELECT COUNT(*) as total FROM users WHERE date(createdAt) = ?').bind(today).all();
    const todayJoined = todayUsersResults[0]?.total || 0;

    // Recent activities (mix of new users and new posts)
    const { results: recentUsers } = await db.prepare('SELECT nickname, createdAt FROM users ORDER BY createdAt DESC LIMIT 2').all();
    const { results: recentPosts } = await db.prepare('SELECT title, createdAt FROM posts ORDER BY createdAt DESC LIMIT 2').all();
    
    const activities = [
      ...recentUsers.map((u: any) => ({ text: `새 회원 가입: ${u.nickname}`, time: u.createdAt, type: 'user' })),
      ...recentPosts.map((p: any) => ({ text: `새 게시글 작성: ${p.title}`, time: p.createdAt, type: 'post' }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 4);

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalPosts,
        todayJoined
      },
      activities: activities.map(a => {
        // Calculate time ago
        const diffMs = Date.now() - new Date(a.time).getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        let timeStr = '방금 전';
        if (diffDays > 0) timeStr = `${diffDays}일 전`;
        else if (diffHours > 0) timeStr = `${diffHours}시간 전`;
        else if (diffMins > 0) timeStr = `${diffMins}분 전`;

        return { ...a, timeStr };
      })
    });
  } catch (error: any) {
    console.error('Fetch dashboard stats error:', error);
    return NextResponse.json({ success: false, error: '데이터를 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
