"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Trophy, Home, TrendingUp, BarChart3, Star, HelpCircle,
  BookOpen, Bell, Users, User, Menu, X, ChevronDown,
  Languages, LogIn, Shield, Zap, Flame, LogOut, Lightbulb
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import NotificationBell from "@/components/NotificationBell";
import { getLevelInfo } from "@/lib/gamification";

interface SubItem {
  href: string;
  label: string;
  labelEn: string;
}

interface NavItem {
  id: string;
  href: string;
  label: string;
  labelEn: string;
  icon: any;
  children?: SubItem[];
}

const CATEGORY_TRANSLATIONS: Record<string, { ko: string; en: string }> = {
  // community
  "free": { ko: "자유게시판", en: "Free Board" },
  "match": { ko: "경기 토론", en: "Match Talk" },
  "picks": { ko: "픽 공유", en: "Picks" },
  "events": { ko: "이벤트/랭킹", en: "Events" },
  
  // concepts
  "experiments": { ko: "기상천외 배팅 실험실", en: "Betting Lab" },
  "fails": { ko: "베팅 복기", en: "Betting Review" },
  "gamification": { ko: "레벨/경험치", en: "Gamification" },
  "flex": { ko: "수익 인증", en: "Win Flex" },
  "sentiment": { ko: "시장 여론", en: "Market Sentiment" },
};

const NAV_ITEMS: NavItem[] = [
  {
    id: "home", href: "/", label: "홈", labelEn: "Home", icon: Home
  },
  {
    id: "odds", href: "/odds", label: "배당/경기", labelEn: "Odds", icon: TrendingUp,
    children: [
      { href: "/odds?cat=live", label: "라이브", labelEn: "Live" },
      { href: "/odds?cat=soccer", label: "축구", labelEn: "Soccer" },
      { href: "/odds?cat=basketball", label: "농구", labelEn: "Basketball" },
      { href: "/odds?cat=baseball", label: "야구", labelEn: "Baseball" },
      { href: "/odds?cat=volleyball", label: "배구", labelEn: "Volleyball" },
      { href: "/odds?cat=hockey", label: "하키", labelEn: "Hockey" },
      { href: "/odds?cat=handball", label: "핸드볼", labelEn: "Handball" },
    ]
  },
  {
    id: "analysis", href: "/analysis", label: "분석/결과", labelEn: "Analysis", icon: BarChart3,
    children: [
      { href: "/analysis?tab=analysis", label: "스포츠 분석", labelEn: "Sports Analysis" },
      { href: "/analysis?tab=result", label: "예측/결과", labelEn: "Prediction/Result" },
    ]
  },
  {
    id: "spotlight", href: "/spotlight", label: "스포트라이트", labelEn: "Spotlight", icon: Star,
    children: [
      { href: "/spotlight?cat=news", label: "긴급 뉴스", labelEn: "Breaking News" },
      { href: "/calculator", label: "배당/마진율 계산기", labelEn: "Margin Calculator" },
    ]
  },
  {
    id: "concepts", href: "/concepts", label: "개념 탑재", labelEn: "Concepts", icon: Lightbulb,
    children: [
      { href: "/concepts?cat=fails", label: "베팅 복기", labelEn: "Betting Review" },
      { href: "/concepts?cat=experiments", label: "기상천외 배팅 실험실", labelEn: "Betting Lab" },
      { href: "/concepts?cat=sentiment", label: "시장 여론", labelEn: "Market Sentiment" },
    ]
  },
  {
    id: "community", href: "/community", label: "커뮤니티", labelEn: "Forum", icon: Users,
    children: [
      { href: "/community?cat=free", label: "자유게시판", labelEn: "Free Board" },
      { href: "/community?cat=match", label: "경기 토론", labelEn: "Match Talk" },
      { href: "/community?cat=picks", label: "픽 공유", labelEn: "Picks" },
      { href: "/community/leaderboard", label: "수익률 랭킹", labelEn: "ROI Leaderboard" },
      { href: "/community?cat=events", label: "이벤트/랭킹", labelEn: "Events" },
    ]
  },
  {
    id: "guide", href: "/guide", label: "가이드", labelEn: "Guide", icon: BookOpen,
    children: [
      { href: "/guide?cat=가입 가이드", label: "가입 가이드", labelEn: "Signup Guide" },
      { href: "/guide?cat=입출금 가이드", label: "입출금 가이드", labelEn: "Deposit/Withdrawal Guide" },
      { href: "/guide?cat=배팅 가이드", label: "배팅 가이드", labelEn: "Betting Guide" },
      { href: "/guide?cat=기타", label: "기타", labelEn: "Others" },
    ]
  },
  {
    id: "notices", href: "/notices", label: "공지/이슈", labelEn: "Notices", icon: Bell,
    children: [
      { href: "/notices?cat=maintenance", label: "점검 공지", labelEn: "Maintenance" },
      { href: "/notices?cat=사기주의", label: "사기주의", labelEn: "Scam Alert" },
      { href: "/notices?cat=outage", label: "장애/지연", labelEn: "Outage" },
      { href: "/notices?cat=policy", label: "정책 변경", labelEn: "Policy" },
    ]
  },
  {
    id: "mypage", href: "/mypage", label: "마이페이지", labelEn: "My Page", icon: User,
  },
];

const ICON_MAP: Record<string, any> = {
  Trophy, Home, TrendingUp, BarChart3, Star, HelpCircle,
  BookOpen, Bell, Users, User, Menu, X, ChevronDown,
  Languages, LogIn, Shield, Zap, Flame, LogOut, Lightbulb
};

interface HeaderProps {
  user?: {
    id: number;
    userId: string;
    nickname: string;
  } | null;
}

export default function Header({ user }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [lang, setLang] = useState<"ko" | "en">("ko");
  const pathname = usePathname();
  const router = useRouter();
  const dropdownTimeout = useRef<NodeJS.Timeout | null>(null);
  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [dbMenus, setDbMenus] = useState<NavItem[]>([]);
  const [dynamicCategories, setDynamicCategories] = useState<Record<string, SubItem[]>>({});
  const [userStats, setUserStats] = useState<{ level: number, title: string } | null>(null);
  const [topBarMsg, setTopBarMsg] = useState({ ko: "", en: "" });

  useEffect(() => {
    setMounted(true);
    setCurrentDate(new Date().toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '.'));

    // Fetch dynamic menus and their subcategories
    const fetchMenusAndCategories = async () => {
      try {
        const menusRes = await fetch('/api/menus');
        const menusData = await menusRes.json();
        if (menusData.success && menusData.menus && menusData.menus.length > 0) {
          const rawMenus = menusData.menus.filter((m: any) => m.isHidden !== 1);
          
          // Fetch categories for all dynamic menus
          const catsMap: Record<string, SubItem[]> = {};
          await Promise.all(rawMenus.map(async (menu: any) => {
            if (['home', 'odds', 'mypage', 'analysis'].includes(menu.menuId)) return;

            try {
              const res = await fetch(`/api/admin/categories?type=${menu.menuId}`);
              const data = await res.json();
              if (data.success && data.categories.length > 0) {
                catsMap[menu.menuId] = data.categories.map((c: any) => {
                  const translation = CATEGORY_TRANSLATIONS[c.name];
                  return {
                    href: `/${menu.menuId}?cat=${encodeURIComponent(c.name)}`,
                    label: translation ? translation.ko : c.name,
                    labelEn: translation ? translation.en : c.name
                  };
                });
              }
            } catch (catErr) {
              console.error(`Failed to fetch categories for ${menu.menuId}`, catErr);
            }
          }));

          setDynamicCategories(catsMap);

          // Map raw DB menus to NavItem format with Lucide components
          const mappedMenus = rawMenus.map((m: any) => {
            const IconComponent = ICON_MAP[m.icon] || HelpCircle;
            return {
              id: m.menuId,
              href: m.href,
              label: m.menuId === 'analysis' ? "분석/결과" : m.label,
              labelEn: m.menuId === 'analysis' ? "Prediction/Result" : m.labelEn,
              icon: IconComponent,
              children: m.menuId === 'odds' ? [
                { href: "/odds?cat=live", label: "라이브", labelEn: "Live" },
                { href: "/odds?cat=soccer", label: "축구", labelEn: "Soccer" },
                { href: "/odds?cat=basketball", label: "농구", labelEn: "Basketball" },
                { href: "/odds?cat=baseball", label: "야구", labelEn: "Baseball" },
                { href: "/odds?cat=volleyball", label: "배구", labelEn: "Volleyball" },
                { href: "/odds?cat=hockey", label: "하키", labelEn: "Hockey" },
                { href: "/odds?cat=handball", label: "핸드볼", labelEn: "Handball" },
              ] : m.menuId === 'analysis' ? [
                { href: "/analysis?tab=analysis", label: "스포츠 분석", labelEn: "Sports Analysis" },
                { href: "/analysis?tab=result", label: "예측/결과", labelEn: "Prediction/Result" },
              ] : undefined
            };
          });

          setDbMenus(mappedMenus);
        } else {
          // If no menus are stored in DB, fallback to fetching subcategories for hardcoded menus
          const types = ["spotlight", "qna", "notices", "guide", "community", "concepts"];
          const catsMap: Record<string, SubItem[]> = {};
          
          await Promise.all(types.map(async (type) => {
            const res = await fetch(`/api/admin/categories?type=${type}`);
            const data = await res.json();
            if (data.success && data.categories.length > 0) {
              catsMap[type] = data.categories.map((c: any) => {
                const translation = CATEGORY_TRANSLATIONS[c.name];
                return {
                  href: `/${type}?cat=${encodeURIComponent(c.name)}`,
                  label: translation ? translation.ko : c.name,
                  labelEn: translation ? translation.en : c.name
                };
              });
            }
          }));
          setDynamicCategories(catsMap);
        }
      } catch (err) {
        console.error("Failed to fetch menus and categories", err);
      }
    };

    // Fetch user stats if logged in
    const fetchUserStats = async () => {
      if (!user) return;
      try {
        const res = await fetch('/api/user/profile');
        const data = await res.json();
        if (data.success && data.profile) {
          const lvInfo = getLevelInfo(data.profile.score || 0);
          setUserStats({ level: lvInfo.level, title: lvInfo.title });
        }
      } catch (err) {
        console.error("Failed to fetch user stats", err);
      }
    };

    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.success && data.settings) {
          setTopBarMsg({
            ko: data.settings.top_bar_message || "✨ Insight Hub: 피나클 커뮤니티는 24시간 가장 빠르고 정확한 실시간 정보를 제공합니다",
            en: data.settings.top_bar_message_en || "✨ Insight Hub: Providing the fastest and most accurate real-time information 24/7"
          });
        }
      } catch (err) {
        console.error("Failed to fetch site settings", err);
      }
    };

    fetchMenusAndCategories();
    fetchUserStats();
    fetchSettings();
  }, [lang, user]);

  // Merge static/dynamic NAV_ITEMS with dynamic categories (exclude mypage from main nav)
  const activeMenus = (dbMenus.length > 0 ? dbMenus : NAV_ITEMS).filter(item => item.id !== 'mypage');
  const navItems = activeMenus.map(item => {
    const dynamic = dynamicCategories[item.id] || [];
    const staticChildren = item.children || [];
    
    if (dynamic.length > 0) {
      // If dynamic categories are fetched successfully, only keep special static children (like leaderboard)
      const specialStatic = staticChildren.filter(s => s.href.includes('/leaderboard'));
      return { ...item, children: [...specialStatic, ...dynamic] };
    }
    return item;
  });

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (response.ok) {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const isActive = (item: NavItem) => {
    if (item.href === "/") return pathname === "/";
    return pathname.startsWith(item.href.split('?')[0]);
  };

  const handleMouseEnter = (id: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setOpenDropdown(id);
  };

  const handleMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => setOpenDropdown(null), 200);
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="border-b border-white/[0.06] bg-background/80 backdrop-blur-2xl sticky top-0 z-50">
        {/* Top bar - alerts */}
        <div className="bg-gradient-to-r from-primary/10 via-transparent to-[hsl(var(--gold))]/10 border-b border-white/[0.04]">
          <div className="container mx-auto px-4 h-8 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2 text-primary font-bold">
              <Zap className="w-3 h-3 animate-pulse" />
              <span>
                {lang === "ko" ? topBarMsg.ko : topBarMsg.en}
              </span>
            </div>
            <div className="hidden md:flex items-center gap-4 text-muted-foreground">
              <button
                onClick={() => setLang(prev => prev === "ko" ? "en" : "ko")}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-white/5 bg-white/5 hover:bg-white/10 transition-all text-[10px] font-bold text-foreground"
              >
                <Languages className="w-3 h-3 text-primary" />
                <span>{lang === "ko" ? "English" : "한국어"}</span>
              </button>
              <span className="opacity-20">|</span>
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-400" />
                {lang === "ko" ? "보안 인증됨" : "Security Verified"}
              </span>
              <span className="opacity-20">|</span>
              <span className="font-mono">
                {mounted ? currentDate : "2026.05.04"}
              </span>
            </div>
          </div>
        </div>

        {/* Main navigation */}
        <div className="container mx-auto px-4">
          <div className="h-16 flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="bg-gradient-to-br from-primary to-primary/60 p-2 rounded-xl group-hover:scale-110 transition-transform shadow-[0_0_16px_rgba(59,130,246,0.3)]">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-lg tracking-tight leading-none">
                  {lang === "ko" ? "피나클 커뮤니티" : "Pinnacle Community"}
                </span>
                <span className="text-[9px] uppercase tracking-[0.2em] text-primary font-bold leading-none mt-0.5">Information Hub</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden xl:flex items-center gap-0.5">
              {navItems.map((item) => (
                <div
                  key={item.id}
                  className="relative"
                  onMouseEnter={() => item.children && handleMouseEnter(item.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[13px] font-semibold transition-all whitespace-nowrap",
                      isActive(item)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    )}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    {lang === "ko" ? item.label : item.labelEn}
                    {item.children && item.children.length > 0 && <ChevronDown className={cn("w-3 h-3 transition-transform", openDropdown === item.id && "rotate-180")} />}
                  </Link>

                  {/* Dropdown */}
                  {item.children && item.children.length > 0 && openDropdown === item.id && (
                    <div className="absolute top-full left-0 mt-1 w-48 py-2 bg-background/95 border border-white/10 backdrop-blur-xl shadow-2xl rounded-xl z-50 animate-fade-in">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors font-medium"
                        >
                          {lang === "ko" ? child.label : child.labelEn}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Notification Bell */}
              <NotificationBell />

              {user ? (
                <div className="flex items-center gap-3">
                  <Link 
                    href="/mypage" 
                    title={lang === "ko" ? "마이페이지" : "My Page"}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/5 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/20 overflow-hidden shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="hidden md:flex flex-col items-start leading-tight">
                      <span className="text-[11px] font-black group-hover:text-primary transition-colors">{user.nickname}</span>
                      <span className="text-[9px] font-bold text-muted-foreground">Lv.{userStats?.level || 1} {userStats?.title || '루키'}</span>
                    </div>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 transition-all text-xs font-bold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <Link href="/login" className="hidden sm:flex items-center gap-1.5 btn-primary text-xs py-2 px-4">
                  <LogIn className="w-3.5 h-3.5" />
                  {lang === "ko" ? "로그인" : "Login"}
                </Link>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="xl:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 xl:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-background border-l border-white/[0.06] overflow-y-auto animate-slide-in-right">
            <div className="p-6 space-y-1">
              <div className="pb-4 mb-4 border-b border-white/[0.06] flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{lang === "ko" ? "메뉴" : "Menu"}</span>
                <button
                  onClick={() => setLang(prev => prev === "ko" ? "en" : "ko")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-[11px] font-bold"
                >
                  <Languages className="w-3.5 h-3.5 text-primary" />
                  <span>{lang === "ko" ? "English" : "한국어"}</span>
                </button>
              </div>
              {navItems.map((item) => (
                <div key={item.id}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all",
                      isActive(item)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {lang === "ko" ? item.label : item.labelEn}
                  </Link>
                  {item.children && item.children.length > 0 && (
                    <div className="ml-10 space-y-0.5 mt-0.5 mb-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-3 py-2 text-xs text-muted-foreground hover:text-primary transition-colors font-medium rounded-lg hover:bg-white/5"
                        >
                          {lang === "ko" ? child.label : child.labelEn}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="pt-4 mt-4 border-t border-white/[0.06]">
                {user ? (
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 font-bold text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    {lang === "ko" ? "로그아웃" : "Logout"}
                  </button>
                ) : (
                  <Link href="/login" className="w-full btn-primary text-sm py-3 flex items-center justify-center gap-2">
                    <LogIn className="w-4 h-4" />
                    {lang === "ko" ? "로그인 / 회원가입" : "Login / Sign Up"}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
