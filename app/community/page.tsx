"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users, MessageSquare, Swords, Target, Trophy,
  PenLine, ThumbsUp, Eye, Clock, Flame, ChevronRight,
  Hash, Award, TrendingUp, Star
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useEffect } from "react";

const CATEGORIES = [
  { id: "all", label: "전체", icon: Users },
  { id: "free", label: "자유게시판", icon: MessageSquare },
  { id: "match", label: "경기 토론", icon: Swords },
  { id: "picks", label: "픽 공유", icon: Target },
  { id: "events", label: "이벤트/랭킹", icon: Trophy },
];

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
  const [activeCat, setActiveCat] = useState("all");
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/posts?category=${activeCat}`);
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
  }, [activeCat]);

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
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter">커뮤니티</h1>
            <p className="text-muted-foreground mt-1">경기 토론, 픽 공유, 자유로운 소통의 공간</p>
          </div>
          <Link href="/community/write" className="btn-primary flex items-center gap-2 w-fit">
            <PenLine className="w-4 h-4" /> 글쓰기
          </Link>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {CATEGORIES.map(cat => (
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
                <div key={post.id} className="glass-card rounded-xl p-5 hover:bg-white/[0.03] transition-colors cursor-pointer group">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-xl bg-primary/10 overflow-hidden flex items-center justify-center font-bold text-primary text-lg shrink-0 group-hover:scale-105 transition-transform">
                      {post.authorAvatar ? (
                        <img src={post.authorAvatar} className="w-full h-full object-cover" alt={post.author} />
                      ) : (
                        post.author[0]
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Meta */}
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-[9px] font-bold bg-white/5 px-1.5 py-0.5 rounded uppercase">
                          {CATEGORIES.find(c => c.id === post.category)?.label}
                        </span>
                        {post.views > 1000 && (
                          <span className="badge-danger text-[8px]">
                            <Flame className="w-2.5 h-2.5" /> HOT
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-[15px] leading-snug group-hover:text-primary transition-colors mb-2">
                        {post.title}
                      </h3>

                      {/* Author & Stats */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-foreground">{post.author}</span>
                          <span className="text-muted-foreground/40">Lv.{post.level || 1}</span>
                        </div>
                        <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{new Date(post.createdAt).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><Eye className="w-2.5 h-2.5" />{post.views.toLocaleString()}</span>
                        <span className="flex items-center gap-1"><ThumbsUp className="w-2.5 h-2.5" />{post.likes}</span>
                      </div>

                      {/* Tags */}
                      {post.tags && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {post.tags.split(',').map((tag: string) => (
                            <span key={tag} className="text-[9px] text-muted-foreground/60 flex items-center gap-0.5">
                              <Hash className="w-2 h-2" />{tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-card rounded-xl p-10 text-center space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-muted-foreground/20">
                  <PenLine className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-bold">등록된 게시글이 없습니다.</p>
                  <p className="text-xs text-muted-foreground">가장 먼저 새로운 이야기를 시작해보세요!</p>
                </div>
                <Link href="/community/write" className="btn-primary inline-flex items-center gap-2 py-3 px-6 text-xs mx-auto">
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
            {/* Rankings */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-[hsl(var(--gold))]/15 p-1.5 rounded-lg">
                  <Trophy className="w-4 h-4 text-[hsl(var(--gold))]" />
                </div>
                <h3 className="font-bold">활동 랭킹</h3>
              </div>
              <div className="space-y-2">
                {TOP_USERS.map(user => (
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
                {["EPL", "K리그", "LCK", "KBO", "MLB", "배당분석", "핸디캡", "라이브", "오버언더", "축구", "야구", "e스포츠", "전략", "피나클"].map(tag => (
                  <button key={tag} className="text-xs bg-white/5 text-muted-foreground hover:text-primary hover:bg-primary/10 px-3 py-1.5 rounded-full transition-all font-medium border border-white/[0.04] hover:border-primary/20">
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
              <button className="btn-primary w-full text-sm py-3">글쓰기</button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
