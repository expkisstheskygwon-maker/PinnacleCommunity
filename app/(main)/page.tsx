"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Trophy, Activity, TrendingUp, ShieldAlert, BarChart3, Users,
  MessageSquare, Calendar, Star, BookOpen, Bell, AlertTriangle,
  ChevronRight, Eye, ThumbsUp, Flame, Zap, Clock, ArrowUpRight,
  Shield, Award, Swords, Target, HelpCircle, FileText, Megaphone,
  CheckCircle2, XCircle, TrendingDown, Settings, Plus, X, Globe, Trophy as LeagueIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Mock Data ─── */
const NOTICES = [
  { id: 1, type: "scam", title: "피나클 사칭 텔레그램 채널 주의", date: "2026-04-20", urgent: true },
  { id: 2, type: "maintenance", title: "4/21 새벽 2-4시 서버 정기점검 안내", date: "2026-04-19", urgent: false },
  { id: 3, type: "policy", title: "KYC 인증 절차 변경 안내 (5월 적용)", date: "2026-04-18", urgent: false },
];

// const TODAY_MATCHES = [ ... moved to state ... ]

const ODDS_CHANGES = [
  { id: 1, match: "울산 HD vs 전북", market: "1X2 홈승", from: 1.98, to: 1.95, direction: "down", time: "12분 전" },
  { id: 2, match: "Arsenal vs Chelsea", market: "오버 2.5", from: 1.90, to: 1.95, direction: "up", time: "25분 전" },
  { id: 3, match: "T1 vs Gen.G", market: "홈승", from: 1.80, to: 1.75, direction: "down", time: "1시간 전" },
  { id: 4, match: "Bayern vs Dortmund", market: "AH -1.25", from: 1.88, to: 1.92, direction: "up", time: "2시간 전" },
];

const HOT_POSTS = [
  { id: 1, title: "K리그 울산 vs 전북 프리뷰: 이번 시즌 핵심 맞대결", author: "분석왕", category: "경기 토론", views: 1240, comments: 34, likes: 89, hot: true },
  { id: 2, title: "피나클 입금 가이드 - 2026년 최신 업데이트", author: "가이드마스터", category: "가이드", views: 3500, comments: 67, likes: 156, hot: true },
  { id: 3, title: "아시안핸디캡 완전정복: -0.5와 -0.75의 차이", author: "ProBettor", category: "분석", views: 2100, comments: 45, likes: 112, hot: false },
  { id: 4, title: "이번 주 EPL 배당 흐름 분석", author: "DataWiz", category: "칼럼", views: 890, comments: 23, likes: 67, hot: false },
  { id: 5, title: "피나클 출금 3시간 만에 완료 - 후기", author: "빠른출금", category: "후기", views: 760, comments: 18, likes: 42, hot: false },
];

const NEW_REVIEWS = [
  { id: 1, author: "축구매니아", sport: "축구", rating: 4.5, title: "EPL 배당이 확실히 높습니다", summary: "타 사이트 대비 항상 2-3% 높은 배당을 확인했습니다. 특히 1X2 시장에서 차이가 큽니다.", date: "2시간 전", category: "배당 만족도", verified: true },
  { id: 2, author: "뉴비", sport: "야구", rating: 3.5, title: "가입은 쉬운데 KYC가 좀 번거로움", summary: "가입 자체는 5분이면 되는데, 신분증 인증에 이틀 걸렸습니다.", date: "5시간 전", category: "가입 후기", verified: true },
  { id: 3, author: "글로벌배터", sport: "e스포츠", rating: 5, title: "LoL 배당은 피나클이 최고", summary: "LCK 경기 라인업이 가장 풍부하고, 라이브 베팅도 빠릅니다.", date: "8시간 전", category: "종목별 후기", verified: false },
];

const POPULAR_GUIDES = [
  { id: 1, title: "피나클 가입 방법 (2026년 최신)", icon: FileText, views: 12400, difficulty: "초급" },
  { id: 2, title: "첫 입금하기: 입금 방법 총정리", icon: Zap, views: 8900, difficulty: "초급" },
  { id: 3, title: "배당률 읽는 법: 머니라인 vs 핸디캡", icon: BarChart3, views: 6500, difficulty: "초급" },
  { id: 4, title: "출금 가이드 & 소요시간 안내", icon: Clock, views: 5200, difficulty: "초급" },
  { id: 5, title: "계정 보안 강화: 2FA 설정법", icon: Shield, views: 3100, difficulty: "중급" },
];

const QNA_RECENT = [
  { id: 1, question: "피나클 가입 시 VPN이 필요한가요?", answers: 12, solved: true, category: "가입/인증" },
  { id: 2, question: "출금 신청 후 48시간 넘게 처리 안 됩니다", answers: 8, solved: false, category: "결제/입출금" },
  { id: 3, question: "아시안핸디캡 정산 기준이 궁금합니다", answers: 15, solved: true, category: "배당/정산" },
];

/* ─── Helper Components ─── */
function SectionHeader({ icon: Icon, title, href, badge }: { icon: any; title: string; href?: string; badge?: string }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2.5">
        <div className="bg-primary/15 p-1.5 rounded-lg">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <h3 className="section-title text-lg">{title}</h3>
        {badge && <span className="badge-primary">{badge}</span>}
      </div>
      {href && (
        <Link href={href} className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-primary transition-colors group">
          전체보기
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </div>
  );
}

function OddsChange({ value, prev }: { value: number; prev: number }) {
  const diff = value - prev;
  if (Math.abs(diff) < 0.001) return <span className="text-muted-foreground font-mono text-xs">{value.toFixed(2)}</span>;
  return (
    <span className={cn("font-mono text-xs font-bold", diff < 0 ? "text-red-400" : "text-emerald-400")}>
      {value.toFixed(2)}
      <span className="text-[9px] ml-0.5">{diff < 0 ? "↓" : "↑"}</span>
    </span>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={cn("w-3 h-3", i <= rating ? "text-[hsl(var(--gold))] fill-[hsl(var(--gold))]" : i - 0.5 <= rating ? "text-[hsl(var(--gold))]" : "text-white/10")} />
      ))}
    </div>
  );
}

const getNoticeLabel = (typeOrTag: string) => {
  const mapping: Record<string, string> = {
    scam: "사칭주의",
    maintenance: "점검안내",
    policy: "규정안내",
    event: "이벤트",
    general: "공지사항",
    urgent: "긴급공지",
  };
  
  if (mapping[typeOrTag]) return mapping[typeOrTag];
  if (typeOrTag && typeOrTag !== 'general' && typeOrTag !== 'none' && typeOrTag !== 'null') return typeOrTag;
  return "공지";
};

/* ─── Main Page ─── */
export default function HomePage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [hotPosts, setHotPosts] = useState<any[]>(HOT_POSTS); // Fallback to mock initially
  const [spotlightPosts, setSpotlightPosts] = useState<any[]>([]);
  const [qnaPosts, setQnaPosts] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [scamPosts, setScamPosts] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>({});
  const [userPrefs, setUserPrefs] = useState<{ interests: any[] }>({
    interests: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // all, interest, favorite, bet

  const handleInterestChange = async (category: string, value: string, action: 'add' | 'remove') => {
    try {
      const res = await fetch("/api/user/interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, value, action })
      });
      const data = await res.json();
      if (data.success) {
        const intRes = await fetch("/api/user/interests");
        const intData = await intRes.json();
        setUserPrefs(prev => ({ ...prev, interests: intData.interests || [] }));
      } else {
        if (data.error === '로그인이 필요합니다.') {
          alert("로그인이 필요한 기능입니다.");
        } else {
          alert(data.error);
        }
      }
    } catch (err) {
      console.error("Failed to update interest", err);
    }
  };

  // Fetch matches
  useEffect(() => {
    const fetchMatches = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/sports/matches?sport=all&t=${Date.now()}`);
        const data = await res.json();
        if (data.matches) {
          setMatches(data.matches);
        } else if (data.error) {
          console.error("API Error in HomePage:", data.error);
        }
      } catch (err) {
        console.error("Failed to fetch matches", err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchUserPrefs = async () => {
      try {
        const [intRes] = await Promise.all([
          fetch("/api/user/interests")
        ]);
        const intData = await intRes.json();
        
        setUserPrefs({
          interests: intData.interests || []
        });
      } catch (err) {
        console.error("Failed to fetch user preferences", err);
      }
    };

    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/posts?category=community&limit=5");
        const data = await res.json();
        if (data.success && data.posts) {
          // Normalize post structure to match the UI expectations
          const formattedPosts = data.posts.map((p: any) => ({
            id: p.id,
            title: p.title,
            author: p.author || '익명',
            category: p.category === 'community' ? '커뮤니티' : (p.category === 'analysis' ? '분석' : (p.category === 'guide' ? '가이드' : (p.category === 'qna' ? '질문' : (p.category === 'column' ? '칼럼' : p.category)))),
            views: p.views || 0,
            comments: p.commentsCount || 0,
            likes: p.likes || 0,
            hot: (p.views || 0) > 100 || (p.likes || 0) > 5
          }));
          setHotPosts(formattedPosts);
        }
      } catch (err) {
        console.error("Failed to fetch posts", err);
      }
    };

    const fetchSpotlight = async () => {
      try {
        const res = await fetch("/api/posts?category=spotlight&limit=3");
        const data = await res.json();
        if (data.success) setSpotlightPosts(data.posts);
      } catch (err) {
        console.error("Failed to fetch spotlight", err);
      }
    };

    const fetchNotices = async () => {
      try {
        const res = await fetch("/api/posts?category=notices&limit=5");
        const data = await res.json();
        if (data.success && data.posts) {
          setNotices(data.posts);
        }
      } catch (err) {
        console.error("Failed to fetch notices", err);
      }
    };

    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (data.success) {
          setSiteSettings(data.settings);
        }
      } catch (err) {
        console.error("Failed to fetch settings", err);
      }
    };

    const fetchQna = async () => {
      try {
        const res = await fetch("/api/posts?category=qna&limit=5");
        const data = await res.json();
        if (data.success && data.posts) {
          setQnaPosts(data.posts);
        }
      } catch (err) {
        console.error("Failed to fetch Q&A", err);
      }
    };

    const fetchScamPosts = async () => {
      try {
        const res = await fetch("/api/posts?category=notices&tag=사기주의&limit=3");
        const data = await res.json();
        if (data.success && data.posts) {
          setScamPosts(data.posts);
        }
      } catch (err) {
        console.error("Failed to fetch scam posts", err);
      }
    };

    fetchMatches();
    fetchUserPrefs();
    fetchPosts();
    fetchSpotlight();
    fetchNotices();
    fetchSettings();
    fetchQna();
    fetchScamPosts();
  }, []);

  // Personalized Sorting and Filtering
  const processedMatches = useMemo(() => {
    let list = [...(matches || [])].map(m => {
      if (!m || !m.id) return null;
      return {
        ...m,
        interestScore: 0
      };
    }).filter(Boolean) as any[];

    // Calculate interest score
    list.forEach(m => {
      if (!m) return;
      (userPrefs?.interests || []).forEach(pref => {
        if (!pref) return;
        // Increase weights to prioritize teams/leagues over generic live status
        if (pref.category === 'sport' && m.sport === pref.value) m.interestScore += 10;
        if (pref.category === 'league' && m.league === pref.value) m.interestScore += 200;
        if (pref.category === 'team' && (
          m.home?.toLowerCase().trim() === pref.value?.toLowerCase().trim() || 
          m.away?.toLowerCase().trim() === pref.value?.toLowerCase().trim()
        )) m.interestScore += 500;
        m.interestScore += (pref.priority || 0);
      });
      
      if (m.live) m.interestScore += 100;
    });

    // Filter by tab
    if (activeTab === "all") {
      return list.sort((a, b) => {
        // Prioritize LIVE games first regardless of interest
        if (a.live && !b.live) return -1;
        if (!a.live && b.live) return 1;
        // Then sort by interest score
        if (b.interestScore !== a.interestScore) return b.interestScore - a.interestScore;
        return 0;
      }).slice(0, 7);
    }
    
    if (activeTab === "interest") return list.filter(m => m.interestScore > 0).sort((a, b) => b.interestScore - a.interestScore);

    return list.sort((a, b) => b.interestScore - a.interestScore);
  }, [matches, userPrefs, activeTab]);

  return (
    <div className="mesh-gradient overflow-x-hidden">
      {/* Abstract background */}
      <div className="fixed top-20 left-0 w-72 h-72 bg-primary/10 rounded-full blur-[120px] -z-10 animate-float pointer-events-none" />
      <div className="fixed bottom-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[150px] -z-10 pointer-events-none" />

      {/* Hero */}
      <section className="relative py-12 md:py-16 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto space-y-5 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              피나클 사용자 정보 허브
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.1]">
              모든 정보를 <span className="text-primary italic">한곳</span>에서
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
              가입 가이드부터 배당 분석, 스포트라이트, 사기주의 안내까지.<br className="hidden md:block" />
              신뢰할 수 있는 피나클 커뮤니티에 오신 것을 환영합니다.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href="/guide" className="btn-primary flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> 초보자 가이드
              </Link>
              <Link href="/odds" className="btn-outline flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> 오늘의 배당
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto stagger-children">
            {[
              { 
                icon: Users, 
                label: siteSettings.trust_stat_1_label || "활성 회원", 
                value: siteSettings.trust_stat_1_value || "12,847", 
                color: "text-primary" 
              },
              { 
                icon: BarChart3, 
                label: siteSettings.trust_stat_2_label || "오늘 경기", 
                value: siteSettings.trust_stat_2_value || `${matches.length}개`, 
                color: "text-emerald-400" 
              },
              { 
                icon: Star, 
                label: siteSettings.trust_stat_3_label || "평균 평점", 
                value: siteSettings.trust_stat_3_value || "4.3 / 5", 
                color: "text-[hsl(var(--gold))]" 
              },
              { 
                icon: MessageSquare, 
                label: siteSettings.trust_stat_4_label || "오늘 게시글", 
                value: siteSettings.trust_stat_4_value || "234건", 
                color: "text-purple-400" 
              },
            ].map((stat) => (
              <div key={stat.label} className="stat-card rounded-xl">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                  <stat.icon className={cn("w-3.5 h-3.5", stat.color)} />
                  {stat.label}
                </div>
                <span className={cn("text-2xl font-black tracking-tight", stat.color)}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Notice Alert Bar */}
      <section className="border-y border-white/[0.04] bg-secondary/10 overflow-hidden">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4 relative">
            <div className="flex items-center gap-1.5 shrink-0 bg-secondary/10 backdrop-blur-md z-10 pr-4 border-r border-white/[0.04]">
              <Megaphone className="w-4 h-4 text-[hsl(var(--gold))]" />
              <span className="text-xs font-bold text-[hsl(var(--gold))] uppercase tracking-wider">공지</span>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <div className="animate-marquee whitespace-nowrap">
                {(notices.length > 0 ? [...notices, ...notices] : [...NOTICES, ...NOTICES]).map((n, idx) => {
                  const label = getNoticeLabel(n.tags || n.type || "general");
                  const isUrgent = n.urgent || n.tags === 'urgent' || n.tags?.includes('urgent');
                  
                  return (
                    <Link 
                      key={`${n.id}-${idx}`} 
                      href={n.id && (n.category === 'notices' || !n.category) ? `/community/${n.id}` : "/notices"} 
                      className="inline-flex items-center gap-3 mx-8 hover:text-primary transition-colors group"
                    >
                      <div className="flex items-center gap-1.5">
                        {isUrgent && (
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                        )}
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tight shrink-0",
                          isUrgent 
                            ? "bg-red-500/20 text-red-400 border border-red-500/30" 
                            : "bg-white/10 text-muted-foreground border border-white/10"
                        )}>
                          {label}
                        </span>
                      </div>
                      <span 
                        className={cn(
                          "font-bold text-sm", 
                          isUrgent ? "text-red-400" : "text-foreground/90 group-hover:text-primary transition-colors"
                        )}
                        dangerouslySetInnerHTML={{ __html: n.title }}
                      />
                      <span className="text-[10px] text-muted-foreground/40 font-mono">
                        {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : n.date}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Left: Main Content */}
          <div className="xl:col-span-8 space-y-10">
            {/* Today's Matches */}
            <section>
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-5 gap-4">
                <SectionHeader icon={Swords} title="오늘의 경기" href="/odds" badge={`${matches.filter(m => m.live).length} LIVE`} />
                
                {/* Tabs & Settings */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/[0.06]">
                    {[
                      { id: "all", label: "전체" },
                      { id: "interest", label: "관심" },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                          activeTab === tab.id 
                            ? "bg-primary text-white shadow-lg shadow-primary/20" 
                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                        )}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowInterestModal(true)}
                    className="p-2 rounded-xl bg-white/5 border border-white/[0.06] text-muted-foreground hover:text-primary hover:bg-white/10 transition-all"
                    title="관심 설정"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[10px] text-muted-foreground uppercase tracking-widest border-b border-white/[0.06] bg-white/[0.02]">
                        <th className="text-left px-5 py-3.5 font-bold">경기</th>
                        <th className="text-center px-3 py-3.5 font-bold">1</th>
                        <th className="text-center px-3 py-3.5 font-bold">X</th>
                        <th className="text-center px-3 py-3.5 font-bold">2</th>
                        <th className="text-center px-3 py-3.5 font-bold hidden md:table-cell">핸디캡</th>
                        <th className="text-center px-3 py-3.5 font-bold hidden md:table-cell">오버/언더</th>
                        <th className="text-right px-5 py-3.5 font-bold">시간</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {processedMatches.length > 0 ? (
                        processedMatches.map((m) => (
                          <tr key={m.id} className="hover:bg-white/[0.03] transition-colors group cursor-pointer">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">

                                <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 shrink-0 uppercase truncate max-w-[60px]">{m.league}</span>
                                <div className="min-w-0 flex-1">
                                  <span className="font-bold text-foreground group-hover:text-primary transition-colors text-[13px]">{m.home}</span>
                                  <span className="text-muted-foreground mx-1.5 text-xs">vs</span>
                                  <span className="font-bold text-foreground text-[13px]">{m.away}</span>
                                </div>
                              </div>
                            </td>
                            <td className="text-center px-3 py-4">
                              <span className="font-mono text-xs font-bold text-emerald-400">{m.odds?.h?.toFixed(2) || "0.00"}</span>
                            </td>
                            <td className="text-center px-3 py-4">
                              <span className="font-mono text-xs text-muted-foreground">{m.odds?.d > 0 ? m.odds.d.toFixed(2) : "-"}</span>
                            </td>
                            <td className="text-center px-3 py-4">
                              <span className="font-mono text-xs text-muted-foreground">{m.odds?.a?.toFixed(2) || "0.00"}</span>
                            </td>
                            <td className="text-center px-3 py-4 hidden md:table-cell">
                              <span className="font-mono text-[11px] text-muted-foreground">{m.ah || "-"}</span>
                            </td>
                            <td className="text-center px-3 py-4 hidden md:table-cell">
                              <span className="font-mono text-[11px] text-muted-foreground">{m.ou || "-"}</span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              {m.live ? (
                                <span className="badge-live">
                                  <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span></span>
                                  LIVE
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground font-mono">{m.time}</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                            {isLoading ? "경기를 불러오는 중..." : "해당되는 경기가 없습니다."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-3 border-t border-white/[0.04] bg-white/[0.02] flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">배당은 실시간 변동됩니다 • 참고용</span>
                  <Link href="/odds" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                    전체 경기 보기 <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </section>

            {/* Odds Changes */}
            <section>
              <SectionHeader icon={TrendingUp} title="배당 변동 하이라이트" href="/odds" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ODDS_CHANGES.map(oc => (
                  <div key={oc.id} className="glass-card rounded-xl p-4 flex items-center gap-4 hover:bg-white/[0.03] transition-colors cursor-pointer group">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                      oc.direction === "down" ? "bg-red-500/15" : "bg-emerald-500/15"
                    )}>
                      {oc.direction === "down" 
                        ? <TrendingDown className="w-5 h-5 text-red-400" />  
                        : <TrendingUp className="w-5 h-5 text-emerald-400" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{oc.match}</p>
                      <p className="text-[11px] text-muted-foreground">{oc.market}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground font-mono line-through">{oc.from.toFixed(2)}</span>
                        <span className="text-xs text-muted-foreground">→</span>
                        <span className={cn("text-sm font-bold font-mono", oc.direction === "down" ? "text-red-400" : "text-emerald-400")}>{oc.to.toFixed(2)}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground/60">{oc.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Hot Posts */}
            <section>
              <SectionHeader icon={Flame} title="인기 게시글" href="/community" badge="HOT" />
              <div className="space-y-2">
                {hotPosts.map((post, idx) => (
                  <Link href={`/community/${post.id}`} key={post.id} className="glass-card rounded-xl p-4 flex items-center gap-4 hover:bg-white/[0.03] transition-colors cursor-pointer group">
                    <span className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0",
                      idx < 3 ? "bg-primary/20 text-primary" : "bg-white/5 text-muted-foreground"
                    )}>
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        {post.hot && <Flame className="w-3 h-3 text-orange-400 shrink-0" />}
                        {post.authorId === 0 ? (
                          <span className="text-sm font-bold truncate group-hover:text-primary transition-colors" dangerouslySetInnerHTML={{ __html: post.title }} />
                        ) : (
                          <span className="text-sm font-bold truncate group-hover:text-primary transition-colors">{post.title}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span className="bg-white/5 px-1.5 py-0.5 rounded text-[9px] font-bold">{post.category}</span>
                        <span>{post.author}</span>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-4 text-[10px] text-muted-foreground shrink-0">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{(post.views || 0).toLocaleString()}</span>
                      <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{post.likes || 0}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{post.comments || 0}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Spotlight (Formerly Reviews) */}
            <section>
              <SectionHeader icon={Star} title="스포트라이트" href="/spotlight" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {spotlightPosts.length > 0 ? (
                  spotlightPosts.map(post => (
                    <Link href={`/spotlight/${post.id}`} key={post.id} className="glass-card rounded-2xl overflow-hidden hover:bg-white/[0.02] transition-all group flex flex-col h-full border border-white/5">
                      {post.image ? (
                        <div className="aspect-[16/9] w-full overflow-hidden relative">
                          <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute top-3 left-3">
                            <span className="bg-primary/90 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-black text-white uppercase tracking-wider">
                              {post.tags || "Premium"}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-[16/9] w-full bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center relative">
                          <Star className="w-8 h-8 text-primary/20" />
                          <div className="absolute top-3 left-3">
                            <span className="bg-primary/90 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-black text-white uppercase tracking-wider">
                              {post.tags || "Premium"}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="p-5 flex-1 flex flex-col space-y-3">
                        {post.authorId === 0 ? (
                          <h4 className="font-bold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2" dangerouslySetInnerHTML={{ __html: post.title }} />
                        ) : (
                          <h4 className="font-bold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">{post.title}</h4>
                        )}
                        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 flex-1">
                          {post.content.replace(/<[^>]*>/g, '').substring(0, 80)}...
                        </p>
                        <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary">管</div>
                            <span className="text-[10px] font-bold">관리자</span>
                          </div>
                          <div className="flex items-center gap-2 text-[9px] text-muted-foreground/60 font-medium">
                            <span className="flex items-center gap-1"><Eye className="w-2.5 h-2.5" /> {post.views || 0}</span>
                            <span>•</span>
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  [1, 2, 3].map(i => (
                    <div key={i} className="glass-card rounded-2xl p-5 space-y-3 opacity-50">
                      <div className="w-16 h-4 bg-white/5 rounded animate-pulse" />
                      <div className="w-full h-8 bg-white/5 rounded animate-pulse" />
                      <div className="w-full h-12 bg-white/5 rounded animate-pulse" />
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <aside className="xl:col-span-4 space-y-6">
            {/* Spotlight List (Formerly Popular Guides) */}
            <div className="glass-card rounded-2xl p-5">
              <SectionHeader icon={Star} title="스포트라이트" href="/community?category=spotlight" />
              <div className="space-y-2">
                {spotlightPosts.length > 0 ? spotlightPosts.slice(0, 5).map((post, idx) => {
                  const icons = [Zap, BarChart3, Clock, Shield, Award];
                  const Icon = icons[idx % icons.length];
                  return (
                    <Link key={post.id} href={`/community/${post.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors group cursor-pointer">
                      <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0 group-hover:bg-yellow-500/20 transition-colors">
                        <Icon className="w-4 h-4 text-[hsl(var(--gold))]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        {post.authorId === 0 ? (
                          <p className="text-[13px] font-semibold truncate group-hover:text-primary transition-colors" dangerouslySetInnerHTML={{ __html: post.title }} />
                        ) : (
                          <p className="text-[13px] font-semibold truncate group-hover:text-primary transition-colors">{post.title}</p>
                        )}
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-[9px] font-bold",
                            idx % 2 === 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"
                          )}>
                            {post.subCategory || post.tags || "Hot"}
                          </span>
                          <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{(post.views || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </Link>
                  );
                }) : (
                  <div className="py-10 text-center opacity-20">
                    <Star className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-[10px] font-bold">등록된 글이 없습니다.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Interest Q&A (Formerly Recent Q&A) */}
            <div className="glass-card rounded-2xl p-5">
              <SectionHeader icon={HelpCircle} title="관심 Q&A" href="/community?category=qna" />
              <div className="space-y-3">
                {qnaPosts.length > 0 ? qnaPosts.slice(0, 5).map((q, idx) => (
                  <Link key={q.id} href={`/community/${q.id}`} className="block p-3 rounded-xl hover:bg-white/[0.04] transition-colors group cursor-pointer">
                    <div className="flex items-start gap-2.5">
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                        (q.commentsCount > 0) ? "bg-emerald-500/15" : "bg-[hsl(var(--gold))]/15"
                      )}>
                        {q.commentsCount > 0 
                          ? <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          : <HelpCircle className="w-3 h-3 text-[hsl(var(--gold))]" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold group-hover:text-primary transition-colors line-clamp-2 leading-snug">{q.title}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-[9px] font-black uppercase",
                            q.commentsCount > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-muted-foreground"
                          )}>
                            {q.commentsCount > 0 ? "답변완료" : "답변대기"}
                          </span>
                          <span className="text-[9px] text-muted-foreground/60 font-medium">{new Date(q.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )) : (
                  <div className="py-10 text-center opacity-20">
                    <HelpCircle className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-[10px] font-bold">등록된 질문이 없습니다.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 border-red-500/20 bg-red-500/[0.03]">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-red-500/15 p-1.5 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                </div>
                <h3 className="font-bold text-red-400">사기주의 알림</h3>
              </div>
              <div className="space-y-3">
                {scamPosts.length > 0 ? (
                  scamPosts.map((post) => (
                    <Link key={post.id} href={`/notices?cat=사기주의&id=${post.id}`} className="block rounded-xl overflow-hidden bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-colors">
                      {post.image ? (
                        <img src={post.image} alt={post.title} className="w-full h-auto object-cover" />
                      ) : (
                        <div className="p-3">
                          {post.authorId === 0 ? (
                            <p className="text-xs font-bold text-red-400 mb-1" dangerouslySetInnerHTML={{ __html: post.title }} />
                          ) : (
                            <p className="text-xs font-bold text-red-400 mb-1">{post.title}</p>
                          )}
                          <div 
                            className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2"
                            dangerouslySetInnerHTML={{ __html: post.content.replace(/<[^>]*>/g, '') }}
                          />
                        </div>
                      )}
                    </Link>
                  ))
                ) : (
                  <div className="py-4 text-center text-[11px] text-muted-foreground italic">
                    등록된 사기주의 알림이 없습니다.
                  </div>
                )}
              </div>
              <Link href="/notices?cat=사기주의" className="mt-4 block text-center text-xs font-bold text-red-400 hover:underline">
                사기주의 전체 보기 →
              </Link>
            </div>

            {/* Community Activity */}
            <div className="glass-card rounded-2xl p-5">
              <SectionHeader icon={Users} title="커뮤니티 활동" />
              <div className="space-y-3">
                {[
                  { user: "분석왕", action: "경기 토론에 글을 작성했습니다", time: "3분 전", avatar: "분" },
                  { user: "빠른출금", action: "스포트라이트 글을 확인했습니다", time: "12분 전", avatar: "빠" },
                  { user: "ProBettor", action: "Q&A에 답변을 달았습니다", time: "25분 전", avatar: "P" },
                  { user: "축구매니아", action: "EPL 픽을 공유했습니다", time: "42분 전", avatar: "축" },
                ].map((activity, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer group">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0 group-hover:scale-110 transition-transform">
                      {activity.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs">
                        <span className="font-bold text-foreground group-hover:text-primary transition-colors">{activity.user}</span>
                        <span className="text-muted-foreground">님이 {activity.action}</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground/50">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/community" className="mt-4 block text-center py-2.5 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary hover:text-white transition-all">
                커뮤니티 바로가기
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="glass-card rounded-2xl p-5 bg-gradient-to-br from-primary/[0.05] to-transparent">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-[hsl(var(--gold))]" />
                신뢰 지표
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { 
                    icon: Users, 
                    label: siteSettings.trust_stat_1_label || "활성 회원", 
                    value: siteSettings.trust_stat_1_value || "12,847", 
                    color: "text-primary" 
                  },
                  { 
                    icon: BarChart3, 
                    label: siteSettings.trust_stat_2_label || "오늘 경기", 
                    value: siteSettings.trust_stat_2_value || `${matches.length}개`, 
                    color: "text-emerald-400" 
                  },
                  { 
                    icon: Star, 
                    label: siteSettings.trust_stat_3_label || "평균 평점", 
                    value: siteSettings.trust_stat_3_value || "4.3 / 5", 
                    color: "text-[hsl(var(--gold))]" 
                  },
                  { 
                    icon: MessageSquare, 
                    label: siteSettings.trust_stat_4_label || "오늘 게시글", 
                    value: siteSettings.trust_stat_4_value || "234건", 
                    color: "text-purple-400" 
                  },
                ].map(badge => (
                  <div key={badge.label} className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                    <badge.icon className={cn("w-5 h-5 mx-auto mb-1.5", badge.color)} />
                    <p className={cn("text-lg font-black", badge.color)}>{badge.value}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">{badge.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Interest Management Modal */}
      {showInterestModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowInterestModal(false)} />
          <div className="relative w-full max-w-lg glass-card rounded-3xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2.5">
                <div className="bg-primary/15 p-1.5 rounded-lg">
                  <Star className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-bold text-lg">관심 설정 관리</h3>
              </div>
              <button onClick={() => setShowInterestModal(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Sport Selection */}
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5" /> 종목
                </h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "soccer", label: "축구" },
                    { id: "baseball", label: "야구" },
                    { id: "basketball", label: "농구" },
                    { id: "tennis", label: "테니스" },
                    { id: "esports", label: "e스포츠" }
                  ].map(sport => {
                    const isSelected = userPrefs.interests.some(i => i.category === 'sport' && i.value === sport.id);
                    return (
                      <button
                        key={sport.id}
                        onClick={() => handleInterestChange('sport', sport.id, isSelected ? 'remove' : 'add')}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2",
                          isSelected 
                            ? "bg-primary/20 border-primary/40 text-primary" 
                            : "bg-white/5 border-white/[0.06] text-muted-foreground hover:border-white/20"
                        )}
                      >
                        {sport.label}
                        {isSelected ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* League Selection */}
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                  <LeagueIcon className="w-3.5 h-3.5" /> 주요 리그
                </h4>
                <div className="flex flex-wrap gap-2">
                  {["Premier League", "La Liga", "K League 1", "Bundesliga", "Serie A", "NBA", "MLB", "LCK"].map(league => {
                    const isSelected = userPrefs.interests.some(i => i.category === 'league' && i.value === league);
                    return (
                      <button
                        key={league}
                        onClick={() => handleInterestChange('league', league, isSelected ? 'remove' : 'add')}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2",
                          isSelected 
                            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" 
                            : "bg-white/5 border-white/[0.06] text-muted-foreground hover:border-white/20"
                        )}
                      >
                        {league}
                        {isSelected ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Country Selection */}
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5" /> 국가 / 팀
                </h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {["대한민국", "영국", "스페인", "독일", "미국", "일본"].map(country => {
                    const isSelected = userPrefs.interests.some(i => i.category === 'country' && i.value === country);
                    return (
                      <button
                        key={country}
                        onClick={() => handleInterestChange('country', country, isSelected ? 'remove' : 'add')}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2",
                          isSelected 
                            ? "bg-purple-500/20 border-purple-500/40 text-purple-400" 
                            : "bg-white/5 border-white/[0.06] text-muted-foreground hover:border-white/20"
                        )}
                      >
                        {country}
                        {isSelected ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                      </button>
                    );
                  })}
                </div>
                
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      placeholder="팀명 직접 입력 (예: 울산 HD, Arsenal)"
                      className="w-full bg-white/5 border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = e.currentTarget.value.trim();
                          if (val) {
                            handleInterestChange('team', val, 'add');
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                    />
                    <Plus className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              {/* Current Interests List */}
              {userPrefs.interests.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">나의 관심 목록</h4>
                    <span className="text-[10px] text-muted-foreground">{userPrefs.interests.length}개 설정됨</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {userPrefs.interests.map((interest, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04] group/item">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={cn(
                            "text-[8px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0",
                            interest.category === 'sport' ? "bg-primary/10 text-primary" :
                            interest.category === 'league' ? "bg-emerald-500/10 text-emerald-400" :
                            "bg-purple-500/10 text-purple-400"
                          )}>
                            {interest.category === 'sport' ? '종목' : interest.category === 'league' ? '리그' : interest.category === 'country' ? '국가' : '팀'}
                          </span>
                          <span className="text-xs font-bold truncate">{interest.value}</span>
                        </div>
                        <button 
                          onClick={() => handleInterestChange(interest.category, interest.value, 'remove')}
                          className="text-muted-foreground hover:text-red-400 transition-colors opacity-0 group-hover/item:opacity-100"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-white/[0.02] border-t border-white/[0.06] flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground">관심도가 높은 경기가 목록 상단에 노출됩니다.</p>
              <button 
                onClick={() => setShowInterestModal(false)}
                className="btn-primary text-xs px-6 py-2 h-auto"
              >
                설정 완료
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
