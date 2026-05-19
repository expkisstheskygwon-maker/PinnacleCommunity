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

  let sessionData: any = {};
  try {
    sessionData = JSON.parse(authSession.value);
  } catch (e) {
    redirect("/login");
  }

  const { env } = getCloudflareContext();
  const db = env.DB as any;
  const errors: string[] = [];

  // 1. Fetch full user data from DB
  let user: any = null;
  try {
    user = await db
      .prepare("SELECT * FROM users WHERE id = ?")
      .bind(sessionData.id)
      .first();
  } catch (e: any) {
    errors.push(`[users 테이블] ${e.message}`);
  }

  // DB 에러가 아닌 순수 사용자 세션 만료인 경우만 리다이렉트
  if (!user && errors.length === 0) {
    redirect("/login");
  }

  // DB 조회 실패 시 최소한의 세션 정보 기반 폴백 데이터 생성
  const safeUser = user || {
    id: sessionData.id,
    nickname: sessionData.nickname || 'Unknown',
    email: sessionData.email || '',
    avatar: '',
    score: 0,
    createdAt: new Date().toISOString()
  };

  // 2. Fetch User Stats (Counts)
  let stats: any = null;
  try {
    stats = await db
      .prepare(`
        SELECT 
          (SELECT COUNT(*) FROM posts WHERE authorId = ?) as postCount,
          (SELECT SUM(likes) FROM posts WHERE authorId = ?) as totalLikesReceived,
          (SELECT COUNT(*) FROM notifications WHERE userId = ? AND readAt IS NULL) as unreadCount
      `)
      .bind(safeUser.id, safeUser.id, safeUser.id)
      .first();
  } catch (e: any) {
    errors.push(`[stats(posts/notifications) 쿼리] ${e.message}`);
  }

  // 3. User Interests
  let allInterests: any[] = [];
  try {
    const interestResults = await db
      .prepare("SELECT category, value FROM user_interests WHERE userId = ?")
      .bind(safeUser.id)
      .all();
    allInterests = interestResults?.results || [];
  } catch (e: any) {
    errors.push(`[user_interests 테이블] ${e.message}`);
  }

  // 4. Fetch Real Notifications
  let notifResults: any = { results: [] };
  try {
    notifResults = await db
      .prepare("SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC LIMIT 10")
      .bind(safeUser.id)
      .all();
  } catch (e: any) {
    errors.push(`[notifications 테이블] ${e.message}`);
  }

  // 5. Fetch User's Posts
  let postResults: any = { results: [] };
  try {
    postResults = await db
      .prepare("SELECT id, title, category, views, likes, createdAt FROM posts WHERE authorId = ? ORDER BY createdAt DESC LIMIT 5")
      .bind(safeUser.id)
      .all();
  } catch (e: any) {
    errors.push(`[posts 테이블] ${e.message}`);
  }

  // 5-2. Fetch User's Favorite Posts
  let favoritePostsResults: any = { results: [] };
  try {
    favoritePostsResults = await db
      .prepare(`
        SELECT p.id, p.title, p.category, p.views, p.likes, p.createdAt 
        FROM posts p
        JOIN post_favorites pf ON p.id = pf.postId
        WHERE pf.userId = ?
        ORDER BY pf.createdAt DESC
        LIMIT 10
      `)
      .bind(safeUser.id)
      .all();
  } catch (e: any) {
    errors.push(`[post_favorites 테이블] ${e.message}`);
  }

  // 5-3. Fetch User's Inquiries
  let inquiryResults: any = { results: [] };
  try {
    inquiryResults = await db
      .prepare("SELECT * FROM inquiries WHERE userId = ? ORDER BY createdAt DESC")
      .bind(safeUser.id)
      .all();
  } catch (e: any) {
    errors.push(`[inquiries 테이블] ${e.message}`);
  }

  // 5-4. Fetch User's Betting Records
  let bettingResults: any = { results: [] };
  try {
    bettingResults = await db
      .prepare("SELECT * FROM betting_records WHERE userId = ? ORDER BY betDate DESC")
      .bind(safeUser.id)
      .all();
  } catch (e: any) {
    errors.push(`[betting_records 테이블] ${e.message}`);
  }

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

  let joinedDate = "알 수 없음";
  try {
    joinedDate = new Date(safeUser.createdAt).toLocaleDateString("ko-KR");
  } catch (e) {
    console.error("Joined date parse error:", e);
  }

  const USER_PROFILE = {
    ...DEFAULT_PROFILE,
    name: safeUser.nickname,
    email: safeUser.email,
    joined: joinedDate,
    postCount: stats?.postCount || 0,
    score: safeUser.score || 0,
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

        {/* 상세 디버그 경고창 */}
        {errors.length > 0 && (
          <div className="mb-6 p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs space-y-2">
            <p className="font-bold text-sm">⚠️ 마이페이지 데이터 로드 중 D1 DB 조회 에러가 발생했습니다:</p>
            <ul className="list-disc list-inside space-y-1 font-mono">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
            <p className="text-[10px] text-muted-foreground mt-2">
              ※ Cloudflare D1 데이터베이스에 해당 테이블이 누락되었거나, 칼럼 스키마가 불일치할 수 있습니다. 
              Wrangler 마이그레이션 적용 상태를 확인해 주시기 바랍니다.
            </p>
          </div>
        )}

        <ErrorBoundary>
          <MyPageTabs 
            user={{
              id: safeUser?.id,
              nickname: safeUser?.nickname || '',
              email: safeUser?.email || '',
              avatar: safeUser?.avatar || ''
            }}
            profile={USER_PROFILE}
            initialMatches={todayMatches || []}
            initialInterests={allInterests || []}
            initialNotifications={notifResults?.results || []}
            initialPosts={postResults?.results || []}
            initialFavoritePosts={favoritePostsResults?.results || []}
            initialInquiries={inquiryResults?.results || []}
            initialBettingRecords={bettingResults?.results || []}
          />
        </ErrorBoundary>
      </div>
    </div>
  );
}

