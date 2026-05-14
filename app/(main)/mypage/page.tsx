import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import MyPageTabs from "./MyPageTabs";

import ErrorBoundary from "@/components/ErrorBoundary";

// Default fallback profile
const DEFAULT_PROFILE = {
  level: 1,
  score: 0,
  badge: "Newbie",
  postCount: 0,
  commentCount: 0,
  reviewCount: 0,
  likeReceived: 0,
  accuracy: 0,
};

export default async function MyPage() {
  const cookieStore = await cookies();
  const authSession = cookieStore.get("auth_session");

  if (!authSession?.value) {
    redirect("/login");
  }

  const sessionData = JSON.parse(authSession.value);
  const { env } = getCloudflareContext();
  const db = env.DB as any;

  // 1. Fetch full user data from DB
  const user: any = await db
    .prepare("SELECT * FROM users WHERE id = ?")
    .bind(sessionData.id)
    .first();

  if (!user) {
    redirect("/login");
  }

  // 2. Fetch User Stats (Counts)
  const stats: any = await db
    .prepare(`
      SELECT 
        (SELECT COUNT(*) FROM posts WHERE authorId = ?) as postCount,
        (SELECT SUM(likes) FROM posts WHERE authorId = ?) as totalLikesReceived,
        (SELECT COUNT(*) FROM notifications WHERE userId = ? AND readAt IS NULL) as unreadCount
    `)
    .bind(user.id, user.id, user.id)
    .first();

  const interestResults = await db.prepare("SELECT category, value FROM user_interests WHERE userId = ?").bind(user.id).all();

  const allInterests = interestResults?.results || [];
  const favoriteTeams = allInterests.filter((i: any) => i.category === 'team').map((i: any) => i.value);

  // 4. Fetch Real Notifications
  const notifResults = await db
    .prepare("SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC LIMIT 10")
    .bind(user.id)
    .all();

  // 5. Fetch User's Posts
  const postResults = await db
    .prepare("SELECT id, title, category, views, likes, createdAt FROM posts WHERE authorId = ? ORDER BY createdAt DESC LIMIT 5")
    .bind(user.id)
    .all();

  // 5-2. Fetch User's Favorite Posts
  const favoritePostsResults = await db
    .prepare(`
      SELECT p.id, p.title, p.category, p.views, p.likes, p.createdAt 
      FROM posts p
      JOIN post_favorites pf ON p.id = pf.postId
      WHERE pf.userId = ?
      ORDER BY pf.createdAt DESC
      LIMIT 10
    `)
    .bind(user.id)
    .all();

  // 5-3. Fetch User's Inquiries
  const inquiryResults = await db
    .prepare("SELECT * FROM inquiries WHERE userId = ? ORDER BY createdAt DESC")
    .bind(user.id)
    .all();

  // 6. Fetch Today's Matches for multiple sports
  let todayMatches: any[] = [];
  try {
    const { getTodayMatches } = await import("@/lib/sports");
    const [allMatches] = await Promise.all([
      getTodayMatches('all').catch(() => []),
    ]);
    todayMatches = allMatches;
  } catch (e) {
    console.error("Failed to fetch matches for mypage", e);
  }

  const USER_PROFILE = {
    ...DEFAULT_PROFILE,
    name: user.nickname,
    email: user.email,
    joined: new Date(user.createdAt).toLocaleDateString("ko-KR"),
    postCount: stats?.postCount || 0,
    score: user.score || 0,
    likeReceived: stats?.totalLikesReceived || 0,
  };

  return (
    <div className="mesh-gradient min-h-screen">
      <div className="container mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <Link href="/" className="hover:text-primary transition-colors">홈</Link>
          <span>/</span>
          <span className="text-foreground font-bold">마이페이지</span>
        </div>

        <ErrorBoundary>
          <MyPageTabs 
            user={{
              id: user?.id,
              nickname: user?.nickname || '',
              email: user?.email || '',
              avatar: user?.avatar || ''
            }}
            profile={USER_PROFILE}
            initialMatches={todayMatches || []}
            initialInterests={allInterests || []}
            initialNotifications={notifResults?.results || []}
            initialPosts={postResults?.results || []}
            initialFavoritePosts={favoritePostsResults?.results || []}
            initialInquiries={inquiryResults?.results || []}
          />
        </ErrorBoundary>
      </div>
    </div>
  );
}
