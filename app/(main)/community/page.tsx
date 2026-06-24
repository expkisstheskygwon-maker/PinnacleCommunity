"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Users, MessageSquare, Swords, Target, Trophy,
  PenLine, ThumbsUp, Eye, Clock, Flame, ChevronRight,
  Hash, Award, TrendingUp, Star, Search, X,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/useLanguage";

const CATEGORIES = [
  { id: "all", label: "전체", icon: Users },
  { id: "free", label: "자유게시판", icon: MessageSquare },
  { id: "match", label: "경기 토론", icon: Swords },
  { id: "picks", label: "픽 공유", icon: Target },
  { id: "events", label: "이벤트/랭킹", icon: Trophy },
];

const getIcon = (id: string) => {
  switch (id) {
    case "free": return MessageSquare;
    case "match": return Swords;
    case "picks": return Target;
    case "events": return Trophy;
    default: return MessageSquare;
  }
};

const TOP_USERS = [
  { rank: 1, name: "ProBettor", score: 2840, badge: "Expert", streak: 12 },
  { rank: 2, name: "분석왕", score: 2650, badge: "MVP", streak: 8 },
  { rank: 3, name: "DataWiz", score: 2420, badge: "Expert", streak: 15 },
  { rank: 4, name: "e스포츠마니아", score: 1980, badge: "Analyst", streak: 6 },
  { rank: 5, name: "야구덕후", score: 1750, badge: "Streak", streak: 10 },
];

const BADGE_COLORS: Record<string, string> = {
  "Admin": "bg-red-500/20 text-red-400 border-red-500/30",
  "Expert": "bg-primary/20 text-primary border-primary/30",
  "MVP": "bg-[hsl(var(--gold))]/20 text-[hsl(var(--gold))] border-[hsl(var(--gold))]/30",
  "Analyst": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "Streak": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

export default function CommunityPage() {
  const { lang } = useLanguage();
  const [posts, setPosts] = useState<any[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [mainMenuDesc, setMainMenuDesc] = useState<string>("경기 토론, 픽 공유, 자유로운 소통의 공간");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dynCategories, setDynCategories] = useState<any[]>(CATEGORIES);
  const [topUsers, setTopUsers] = useState<any[]>(TOP_USERS);
  const [popTags, setPopTags] = useState<string[]>([
    "EPL", "K리그", "LCK", "KBO", "MLB", "배당분석", "핸디캡", "라이브", "오버언더", "축구", "야구", "e스포츠", "전략", "피나클"
  ]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const activeCat = searchParams.get("cat") || "all";
  const currentSearch = searchParams.get("search") || "";
  const currentPage = parseInt(searchParams.get("page") || "1");
  const pageSize = 15;

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (data.success && data.settings) {
          if (data.settings.leaderboard_users) {
            try {
              const parsed = JSON.parse(data.settings.leaderboard_users);
              if (Array.isArray(parsed) && parsed.length > 0) {
                const mappedUsers = parsed.map((u: any) => ({
                  rank: u.rank || 1,
                  name: u.nickname || "",
                  score: u.points || 0,
                  badge: u.badge === "None" ? "" : u.badge,
                  streak: u.streak || 0
                }));
                setTopUsers(mappedUsers);
              }
            } catch (e) {
              console.error("Failed to parse leaderboard_users in community:", e);
            }
          }
          if (data.settings.popular_tags) {
            const tags = data.settings.popular_tags
              .split(",")
              .map((t: string) => t.trim())
              .filter(Boolean);
            if (tags.length > 0) {
              setPopTags(tags);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch settings in community page:", err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    setSearchQuery(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const [res, menusRes] = await Promise.all([
          fetch("/api/admin/categories?type=community"),
          fetch("/api/menus")
        ]);
        const data = await res.json();
        const menusData = await menusRes.json();
        
        if (menusData.success) {
          const menu = menusData.menus.find((m: any) => m.menuId === "community" || m.href === "/community");
          if (menu && menu.description) {
            setMainMenuDesc(menu.description);
          }
        }

        if (data.success && data.categories && data.categories.length > 0) {
          const mapped = data.categories.map((c: any) => ({
            id: c.name,
            label: c.name === 'free' ? '자유게시판' : c.name === 'match' ? '경기 토론' : c.name === 'picks' ? '픽 공유' : c.name === 'events' ? '이벤트/랭킹' : c.name,
            labelEn: c.nameEn || (c.name === 'free' ? 'Free Board' : c.name === 'match' ? 'Match Talk' : c.name === 'picks' ? 'Picks' : c.name === 'events' ? 'Events' : c.name),
            icon: getIcon(c.name),
            description: c.description
          }));
          setDynCategories([
            { id: "all", label: lang === "ko" ? "전체" : "All", icon: Users },
            ...mapped
          ]);
        }
      } catch (e) {
        console.error("Failed to fetch community categories:", e);
      }
    };
    fetchCategories();
  }, [lang]);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const url = new URL("/api/posts", window.location.origin);
        if (activeCat === "all") {
          const communityCats = dynCategories.filter(c => c.id !== "all").map(c => c.id).join(",");
          url.searchParams.set("category", communityCats);
        } else {
          url.searchParams.set("category", activeCat);
        }
        url.searchParams.set("limit", pageSize.toString());
        url.searchParams.set("offset", ((currentPage - 1) * pageSize).toString());
        if (currentSearch) url.searchParams.set("search", currentSearch);
        
        const response = await fetch(url.toString());
        const data = await response.json();
        if (data.success) {
          setPosts(data.posts);
          if (data.total !== undefined) setTotalPosts(data.total);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (dynCategories.length > 0) {
      fetchPosts();
    }
  }, [activeCat, currentSearch, currentPage, dynCategories]);

  const totalPages = Math.ceil(totalPosts / pageSize) || 1;
  
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/community?${params.toString()}`);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    
    if (isToday) {
      return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
    } else {
      return date.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }).replace(/\.$/, '');
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery) {
      params.set("search", searchQuery);
    } else {
      params.delete("search");
    }
    router.push(`/community?${params.toString()}`);
  };

  const handleTagClick = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("search", `#${tag}`);
    router.push(`/community?${params.toString()}`);
  };

  const setActiveCat = (catId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("cat", catId);
    router.push(`/community?${params.toString()}`);
  };

  return (
    <div className="mesh-gradient min-h-screen">
      <div className="container mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <Link href="/" className="hover:text-primary transition-colors">홈</Link>
          <span>/</span>
          <span className="text-foreground font-bold">커뮤니티</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter">
              {activeCat === "all" ? (lang === "ko" ? "커뮤니티" : "Community") : (dynCategories.find(c => c.id === activeCat)?.label || "커뮤니티")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {activeCat !== "all" && dynCategories.find(c => c.id === activeCat)?.description 
                ? dynCategories.find(c => c.id === activeCat)?.description 
                : mainMenuDesc}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <form onSubmit={handleSearch} className="relative w-full sm:w-80">
              <input 
                ref={searchInputRef}
                type="text"
                placeholder="검색어 또는 #해시태그 입력..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              {searchQuery && (
                <button 
                  type="button"
                  onClick={() => { setSearchQuery(""); router.push(`/community?cat=${activeCat}`); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              )}
            </form>
            <Link href="/community/write" className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center">
              <PenLine className="w-4 h-4" /> 글쓰기
            </Link>
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {dynCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                activeCat === cat.id
                  ? "bg-primary text-white shadow-[0_0_16px_rgba(59,130,246,0.3)]"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10 border border-white/[0.06]"
              )}
            >
              <cat.icon className="w-3.5 h-3.5" />
              {lang === "ko" ? cat.label : (cat.labelEn || cat.label)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Posts List */}
          <div className="xl:col-span-8">
            <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-white/[0.02] border-b border-white/[0.06]">
                  <tr>
                    <th className="px-4 py-3.5 text-center w-20 hidden sm:table-cell">번호</th>
                    <th className="px-4 py-3.5 text-center w-24 hidden md:table-cell">카테고리</th>
                    <th className="px-4 py-3.5">제목</th>
                    <th className="px-4 py-3.5 text-center w-28">글쓴이</th>
                    <th className="px-4 py-3.5 text-center w-20">날짜</th>
                    <th className="px-4 py-3.5 text-center w-16 hidden sm:table-cell">조회</th>
                    <th className="px-4 py-3.5 text-center w-16 hidden sm:table-cell">추천</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {isLoading ? (
                    Array.from({ length: pageSize }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-4 py-4 hidden sm:table-cell"><div className="h-4 bg-white/5 rounded w-8 mx-auto" /></td>
                        <td className="px-4 py-4 hidden md:table-cell"><div className="h-4 bg-white/5 rounded w-12 mx-auto" /></td>
                        <td className="px-4 py-4"><div className="h-4 bg-white/5 rounded w-3/4" /></td>
                        <td className="px-4 py-4"><div className="h-4 bg-white/5 rounded w-16 mx-auto" /></td>
                        <td className="px-4 py-4"><div className="h-4 bg-white/5 rounded w-10 mx-auto" /></td>
                        <td className="px-4 py-4 hidden sm:table-cell"><div className="h-4 bg-white/5 rounded w-6 mx-auto" /></td>
                        <td className="px-4 py-4 hidden sm:table-cell"><div className="h-4 bg-white/5 rounded w-6 mx-auto" /></td>
                      </tr>
                    ))
                  ) : posts.length > 0 ? (
                    posts.map((post, idx) => {
                      const postNumber = totalPosts - ((currentPage - 1) * pageSize) - idx;
                      const isNew = new Date(post.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000;
                      return (
                        <tr key={post.id} onClick={() => router.push(`/community/${post.id}`)} className="hover:bg-white/[0.03] transition-colors group cursor-pointer">
                          <td className="px-4 py-3.5 text-center text-muted-foreground hidden sm:table-cell font-mono">{postNumber}</td>
                          <td className="px-4 py-3.5 text-center hidden md:table-cell">
                            <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded uppercase">
                              {(() => {
                                const cat = dynCategories.find(c => c.id === post.category);
                                if (!cat) return post.category;
                                return lang === 'ko' ? cat.label : (cat.labelEn || cat.label);
                              })()}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              {/* 모바일용 카테고리 뱃지 */}
                              <span className="md:hidden text-[9px] font-bold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded uppercase shrink-0">
                                {(() => {
                                  const cat = dynCategories.find(c => c.id === post.category);
                                  if (!cat) return post.category;
                                  return lang === 'ko' ? cat.label : (cat.labelEn || cat.label);
                                })()}
                              </span>
                              
                              <span className="font-medium group-hover:text-primary transition-colors line-clamp-1 break-all">
                                {post.authorId === 0 ? <span dangerouslySetInnerHTML={{ __html: post.title }} /> : post.title}
                              </span>
                              
                              {(post.commentsCount || 0) > 0 && (
                                <span className="text-[10px] font-bold text-emerald-400 shrink-0">[{post.commentsCount}]</span>
                              )}
                              
                              {post.image && (
                                <span className="text-muted-foreground shrink-0"><Search className="w-3 h-3" /></span>
                              )}
                              
                              {isNew && (
                                <span className="w-3.5 h-3.5 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-[8px] font-black text-red-400 shrink-0">N</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-xs">
                              {post.level > 0 && (
                                <span className="w-4 h-4 rounded bg-[hsl(var(--gold))]/20 text-[hsl(var(--gold))] flex items-center justify-center text-[9px] font-bold border border-[hsl(var(--gold))]/30 shrink-0">
                                  {post.level}
                                </span>
                              )}
                              <span className="truncate max-w-[80px]">{post.author}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-center text-muted-foreground text-xs">{formatDate(post.createdAt)}</td>
                          <td className="px-4 py-3.5 text-center text-muted-foreground text-xs hidden sm:table-cell">{post.views}</td>
                          <td className="px-4 py-3.5 text-center text-muted-foreground text-xs hidden sm:table-cell">{post.likes}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-16 text-center">
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-muted-foreground/20">
                            <PenLine className="w-8 h-8" />
                          </div>
                          <div>
                            <p className="font-bold">등록된 게시글이 없습니다.</p>
                            <p className="text-xs text-muted-foreground mt-1">가장 먼저 새로운 이야기를 시작해보세요!</p>
                          </div>
                          <Link href="/community/write" className="btn-primary inline-flex items-center gap-2 py-2 px-5 text-xs">
                            첫 글 작성하기
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-8">
                <button 
                  onClick={() => handlePageChange(1)} 
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  &laquo;
                </button>
                <button 
                  onClick={() => handlePageChange(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  &lsaquo;
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let start = Math.max(1, currentPage - 2);
                  if (start + 4 > totalPages) start = Math.max(1, totalPages - 4);
                  const page = start + i;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={cn(
                        "w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all border",
                        currentPage === page 
                          ? "bg-primary text-white border-primary/50 shadow-md shadow-primary/20" 
                          : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground hover:border-white/10"
                      )}
                    >
                      {page}
                    </button>
                  );
                })}

                <button 
                  onClick={() => handlePageChange(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  &rsaquo;
                </button>
                <button 
                  onClick={() => handlePageChange(totalPages)} 
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  &raquo;
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="xl:col-span-4 space-y-6">
            {/* Rankings */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-[hsl(var(--gold))]/15 p-1.5 rounded-lg">
                  <Trophy className="w-4 h-4 text-[hsl(var(--gold))]" />
                </div>
                <h3 className="font-bold">활동 랭킹</h3>
              </div>
              <div className="space-y-2">
                {topUsers.map(user => (
                  <div key={user.rank} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer group">
                    <span className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0",
                      user.rank <= 3 ? "bg-[hsl(var(--gold))]/20 text-[hsl(var(--gold))]" : "bg-white/5 text-muted-foreground"
                    )}>
                      {user.rank}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold group-hover:text-primary transition-colors">{user.name}</span>
                        {user.badge && (
                          <span className={cn("text-[7px] font-bold px-1 py-0.5 rounded border", BADGE_COLORS[user.badge])}>
                            {user.badge}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                        <span>{user.score.toLocaleString()}점</span>
                        <span className="flex items-center gap-0.5 text-emerald-400">
                          <Flame className="w-2 h-2" />{user.streak}연승
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Tags */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-primary/15 p-1.5 rounded-lg">
                  <Hash className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-bold">인기 태그</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {popTags.map(tag => (
                  <button 
                    key={tag} 
                    onClick={() => handleTagClick(tag)}
                    className={cn(
                      "text-xs px-3 py-1.5 rounded-full transition-all font-medium border",
                      currentSearch === `#${tag}` 
                        ? "bg-primary/20 text-primary border-primary/30"
                        : "bg-white/5 text-muted-foreground hover:text-primary hover:bg-primary/10 border-white/[0.04] hover:border-primary/20"
                    )}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Write CTA */}
            <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-primary/[0.06] to-transparent text-center">
              <PenLine className="w-8 h-8 text-primary mx-auto mb-3" />
              <h4 className="font-bold mb-1">커뮤니티에 참여하세요</h4>
              <p className="text-xs text-muted-foreground mb-4">경기 분석, 픽 공유, 질문 등</p>
              <Link href="/community/write" className="btn-primary w-full text-sm py-3 block">글쓰기</Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
