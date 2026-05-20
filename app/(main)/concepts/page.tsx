"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Users, PenLine, ThumbsUp, Eye, Clock, Flame,
  Hash, Search, X,
  History, Shield, Zap, Lightbulb, Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

const CONCEPT_CATEGORIES = [
  { id: "review", label: "베팅 복기", icon: History, desc: "나의 베팅 성과 복기" },
  { id: "bankroll", label: "심리/자금관리", icon: Shield, desc: "마인드 및 자금 관리" },
  { id: "strategy", label: "전략 실험실", icon: Zap, desc: "전략 실험 및 연구" },
];

function ConceptsDashboard({ activeCat }: { activeCat: string }) {
  const stats = {
    review: { profit: "+1,248,500원", winRate: 68, avgOdds: "1.92", roi: "114.5%", bets: 42 },
    bankroll: { profit: "+850,000원", winRate: 72, avgOdds: "1.75", roi: "109.8%", bets: 28 },
    strategy: { profit: "+3,120,000원", winRate: 59, avgOdds: "2.10", roi: "128.3%", bets: 65 },
  }[activeCat as 'review' | 'bankroll' | 'strategy'] || { profit: "+1,248,500원", winRate: 68, avgOdds: "1.92", roi: "114.5%", bets: 42 };

  return (
    <div className="glass-card rounded-3xl p-6 mb-8 border-white/10 relative overflow-hidden animate-fade-in">
      <div className="absolute -right-24 -top-24 w-48 h-48 rounded-full bg-primary/10 blur-[80px] pointer-events-none" />
      <div className="absolute -left-24 -bottom-24 w-48 h-48 rounded-full bg-[hsl(var(--gold))]/5 blur-[80px] pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="w-full lg:w-1/3 flex flex-col justify-center items-center lg:items-start text-center lg:text-left">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">My Cumulative Return</span>
          <h2 className="text-3xl md:text-4xl font-black text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.2)] tracking-tight">
            {stats.profit}
          </h2>
          <p className="text-xs text-muted-foreground/60 mt-2 font-medium">최근 등록된 복기 기록 기반 실시간 집계</p>
        </div>

        <div className="w-full lg:w-1/3 flex items-center justify-center gap-6 border-y lg:border-y-0 lg:border-x border-white/5 py-6 lg:py-2">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="transparent" />
              <circle cx="50" cy="50" r="40" stroke="url(#winRateGrad)" strokeWidth="8" fill="transparent"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * stats.winRate) / 100}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="winRateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-lg font-black font-mono leading-none">{stats.winRate}%</span>
              <span className="text-[8px] font-bold text-muted-foreground tracking-wider mt-0.5">승률</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>총 {stats.bets}회 베팅</span>
            </div>
            <p className="text-[10px] text-muted-foreground/60 leading-relaxed font-medium">
              전략적 베팅 및 리스크 분산 관리를 통해<br/>안정적인 Win-rate 비율을 유지 중입니다.
            </p>
          </div>
        </div>

        <div className="w-full lg:w-1/3 grid grid-cols-2 gap-4">
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col justify-center items-center group hover:bg-white/[0.04] transition-all">
            <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest mb-1.5">Average Odds</span>
            <span className="text-xl font-mono font-black text-[hsl(var(--gold))] group-hover:scale-105 transition-transform">{stats.avgOdds}</span>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col justify-center items-center group hover:bg-white/[0.04] transition-all">
            <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest mb-1.5">Return (ROI)</span>
            <span className="text-xl font-mono font-black text-primary group-hover:scale-105 transition-transform">{stats.roi}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConceptsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const activeCat = searchParams.get("cat") || "review";
  const currentSearch = searchParams.get("search") || "";

  useEffect(() => {
    setSearchQuery(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const url = new URL("/api/posts", window.location.origin);
        url.searchParams.set("category", activeCat);
        if (currentSearch) url.searchParams.set("search", currentSearch);
        
        const response = await fetch(url.toString());
        const data = await response.json();
        if (data.success) {
          setPosts(data.posts);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [activeCat, currentSearch]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery) {
      params.set("search", searchQuery);
    } else {
      params.delete("search");
    }
    router.push(`/concepts?${params.toString()}`);
  };

  const handleTagClick = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("search", `#${tag}`);
    router.push(`/concepts?${params.toString()}`);
  };

  const setActiveCat = (catId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("cat", catId);
    router.push(`/concepts?${params.toString()}`);
  };

  return (
    <div className="mesh-gradient min-h-screen">
      <div className="container mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <Link href="/" className="hover:text-primary transition-colors">홈</Link>
          <span>/</span>
          <span className="hover:text-primary transition-colors cursor-pointer" onClick={() => router.push('/concepts')}>개념 탑재</span>
          <span>/</span>
          <span className="text-foreground font-bold">
            {CONCEPT_CATEGORIES.find(c => c.id === activeCat)?.label || "베팅 복기"}
          </span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter flex items-center gap-2">
              <Lightbulb className="w-8 h-8 text-[hsl(var(--gold))] animate-pulse" /> 개념 탑재
            </h1>
            <p className="text-muted-foreground mt-1">성공적인 베팅을 위한 복기 및 자금 관리 전략 수립 공간</p>
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
                  onClick={() => { setSearchQuery(""); router.push(`/concepts?cat=${activeCat}`); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              )}
            </form>
            <Link href={`/concepts/write?category=${activeCat}`} className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center">
              <PenLine className="w-4 h-4" /> 글쓰기
            </Link>
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {CONCEPT_CATEGORIES.map(cat => (
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
              {cat.label}
            </button>
          ))}
        </div>

        {/* Mini Dashboard */}
        <ConceptsDashboard activeCat={activeCat} />

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Posts List */}
          <div className="xl:col-span-8 space-y-3">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="glass-card rounded-xl p-5 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-white/5 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-2 w-20 bg-white/5 rounded" />
                      <div className="h-4 w-full bg-white/5 rounded" />
                      <div className="h-2 w-40 bg-white/5 rounded" />
                    </div>
                  </div>
                </div>
              ))
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <Link key={post.id} href={`/community/${post.id}`}>
                  <div className="glass-card rounded-xl p-5 hover:bg-white/[0.03] transition-all hover:scale-[1.01] hover:shadow-2xl border-white/5 hover:border-primary/20 cursor-pointer group mb-3">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 overflow-hidden flex items-center justify-center font-bold text-primary text-lg shrink-0 group-hover:scale-105 transition-transform">
                        {post.authorAvatar ? (
                          <img src={post.authorAvatar} className="w-full h-full object-cover" alt={post.author} />
                        ) : (
                          post.author[0]
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="text-[9px] font-bold bg-white/5 px-1.5 py-0.5 rounded uppercase">
                            {CONCEPT_CATEGORIES.find(c => c.id === post.category)?.label || post.category}
                          </span>
                          {post.views > 1000 && (
                            <span className="badge-danger text-[8px]">
                              <Flame className="w-2.5 h-2.5" /> HOT
                            </span>
                          )}
                        </div>
                        <div className="flex items-start justify-between gap-4">
                          {post.authorId === 0 ? (
                            <h3 className="font-bold text-[15px] leading-snug group-hover:text-primary transition-colors mb-2 flex-1" dangerouslySetInnerHTML={{ __html: post.title }} />
                          ) : (
                            <h3 className="font-bold text-[15px] leading-snug group-hover:text-primary transition-colors mb-2 flex-1">
                              {post.title}
                            </h3>
                          )}
                          {post.image && (
                            <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-white/5 bg-white/5">
                              <img src={post.image} className="w-full h-full object-cover" alt="Thumbnail" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-foreground">{post.author}</span>
                            <span className="text-muted-foreground/40">Lv.{post.level || 1}</span>
                          </div>
                          <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{new Date(post.createdAt).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><Eye className="w-2.5 h-2.5" />{post.views.toLocaleString()}</span>
                          <span className="flex items-center gap-1"><ThumbsUp className="w-2.5 h-2.5" />{post.likes}</span>
                        </div>
                        {post.tags && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {post.tags.split(',').map((tag: string) => {
                              const t = tag.trim();
                              if (!t) return null;
                              return (
                                <button 
                                  key={t} 
                                  onClick={(e) => { e.preventDefault(); handleTagClick(t); }}
                                  className="text-[9px] text-muted-foreground/60 hover:text-primary flex items-center gap-0.5 transition-colors"
                                >
                                  <Hash className="w-2 h-2" />{t}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="glass-card rounded-xl p-10 text-center space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-muted-foreground/20">
                  <PenLine className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-bold">등록된 게시글이 없습니다.</p>
                  <p className="text-xs text-muted-foreground">나의 베팅 경험을 기록하고 공유해보세요!</p>
                </div>
                <Link href={`/concepts/write?category=${activeCat}`} className="btn-primary inline-flex items-center gap-2 py-3 px-6 text-xs mx-auto">
                  첫 글 작성하기
                </Link>
              </div>
            )}

            {posts.length > 0 && (
              <button className="w-full py-5 rounded-xl border-2 border-dashed border-white/[0.06] text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all font-bold text-xs uppercase tracking-widest">
                더 보기
              </button>
            )}
          </div>

          {/* Sidebar */}
          <aside className="xl:col-span-4 space-y-6">
            {/* Top Contributors */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-[hsl(var(--gold))]/15 p-1.5 rounded-lg">
                  <Trophy className="w-4 h-4 text-[hsl(var(--gold))]" />
                </div>
                <h3 className="font-bold">복기 랭킹</h3>
              </div>
              <div className="py-6 text-center">
                <p className="text-xs text-muted-foreground">데이터 집계 중...</p>
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
                {["복기", "자금관리", "전략", "ROI", "적중", "배당분석", "핸디캡", "오버언더", "심리관리", "뱅크롤"].map(tag => (
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
            <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-[hsl(var(--gold))]/[0.06] to-transparent text-center">
              <Lightbulb className="w-8 h-8 text-[hsl(var(--gold))] mx-auto mb-3" />
              <h4 className="font-bold mb-1">나의 베팅을 기록하세요</h4>
              <p className="text-xs text-muted-foreground mb-4">베팅 복기, 전략 공유, 자금 관리 노하우</p>
              <Link href={`/concepts/write?category=${activeCat}`} className="btn-primary w-full text-sm py-3 block">글쓰기</Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
