import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import MyPageTabs from "./MyPageTabs";

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
        (SELECT COUNT(*) FROM notifications WHERE userId = ? AND readAt IS NULL) as unreadCount
    `)
    .bind(user.id, user.id)
    .first();

  // 3. Fetch Favorites (Match IDs) & Favorite Teams (Interests)
  const [favResults, interestResults] = await Promise.all([
    db.prepare("SELECT matchId FROM user_favorites WHERE userId = ?").bind(user.id).all(),
    db.prepare("SELECT value FROM user_interests WHERE userId = ? AND category = 'team'").bind(user.id).all()
  ]);

  const favoriteIds = favResults.results.map((r: any) => r.matchId.toString());
  const favoriteTeams = interestResults.results.map((r: any) => r.value);

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

  // 6. Fetch Today's Matches using internal utility (No more self-fetch via URL)
  let todayMatches = [];
  try {
    const { getTodayMatches } = await import("@/lib/sports");
    todayMatches = await getTodayMatches('soccer');
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

        <MyPageTabs 
          user={user}
          profile={USER_PROFILE}
          initialMatches={todayMatches}
          initialFavorites={favoriteIds}
          initialFavTeams={favoriteTeams}
          initialNotifications={notifResults.results}
          initialPosts={postResults.results}
        />
      </div>
    </div>
  );
}
