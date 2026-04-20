"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users, MessageSquare, Swords, Target, Trophy,
  PenLine, ThumbsUp, Eye, Clock, Flame, ChevronRight,
  Hash, Award, TrendingUp, Star
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "all", label: "전체", icon: Users },
  { id: "free", label: "자유게시판", icon: MessageSquare },
  { id: "match", label: "경기 토론", icon: Swords },
  { id: "picks", label: "픽 공유", icon: Target },
  { id: "events", label: "이벤트/랭킹", icon: Trophy },
];

const POSTS = [
  { id: 1, title: "K리그 울산 vs 전북 프리뷰 - 올 시즌 최고의 빅매치", author: "분석왕", avatar: "분", category: "match", date: "2026-04-20 14:30", views: 1240, likes: 89, comments: 34, hot: true, tags: ["K리그", "울산", "전북"], level: 15, badge: "MVP" },
  { id: 2, title: "오늘의 EPL 픽: 아스널 vs 첼시 (아스널 승 예상)", author: "ProBettor", avatar: "P", category: "picks", date: "2026-04-20 13:15", views: 890, likes: 45, comments: 23, hot: false, tags: ["EPL", "Arsenal", "Pick"], level: 22, badge: "Expert" },
  { id: 3, title: "피나클 신규 가입자인데 첫인상 공유합니다", author: "뉴비생활", avatar: "뉴", category: "free", date: "2026-04-20 12:00", views: 567, likes: 34, comments: 18, hot: false, tags: ["가입", "첫인상"], level: 3, badge: "" },
  { id: 4, title: "LCK T1 vs Gen.G 경기 분석 및 베팅 포인트", author: "e스포츠마니아", avatar: "e", category: "match", date: "2026-04-20 11:30", views: 780, likes: 56, comments: 29, hot: true, tags: ["LCK", "T1", "Gen.G"], level: 18, badge: "Analyst" },
  { id: 5, title: "[이벤트] 이번 주 적중률 1위는 누구?", author: "운영자", avatar: "★", category: "events", date: "2026-04-20 10:00", views: 2300, likes: 120, comments: 67, hot: true, tags: ["이벤트", "랭킹"], level: 99, badge: "Admin" },
  { id: 6, title: "분데스리가 배당 트렌드가 살짝 이상한데", author: "GlobalBet", avatar: "G", category: "free", date: "2026-04-20 09:45", views: 345, likes: 12, comments: 8, hot: false, tags: ["분데스리가", "배당"], level: 11, badge: "" },
  { id: 7, title: "KBO 오늘 3경기 픽 공유 (LG, 삼성, 한화)", author: "야구덕후", avatar: "야", category: "picks", date: "2026-04-20 08:30", views: 456, likes: 28, comments: 15, hot: false, tags: ["KBO", "야구", "Pick"], level: 14, badge: "Streak" },
  { id: 8, title: "피나클 vs 타사 배당 비교 (EPL 4월 데이터)", author: "DataWiz", avatar: "D", category: "match", date: "2026-04-19 22:00", views: 1100, likes: 78, comments: 42, hot: true, tags: ["배당비교", "EPL", "데이터"], level: 25, badge: "Expert" },
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
  const filtered = activeCat === "all" ? POSTS : POSTS.filter(p => p.category === activeCat);

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
          <button className="btn-primary flex items-center gap-2 w-fit">
            <PenLine className="w-4 h-4" /> 글쓰기
          </button>
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
            {filtered.map((post, idx) => (
              <div key={post.id} className="glass-card rounded-xl p-5 hover:bg-white/[0.03] transition-colors cursor-pointer group">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary text-lg shrink-0 group-hover:scale-105 transition-transform">
                    {post.avatar}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Meta */}
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-[9px] font-bold bg-white/5 px-1.5 py-0.5 rounded uppercase">
                        {CATEGORIES.find(c => c.id === post.category)?.label}
                      </span>
                      {post.hot && (
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
                        <span className="text-muted-foreground/40">Lv.{post.level}</span>
                        {post.badge && (
                          <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded-full border", BADGE_COLORS[post.badge] || "bg-white/5 text-muted-foreground")}>
                            {post.badge}
                          </span>
                        )}
                      </div>
                      <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{post.date.split(" ")[1]}</span>
                      <span className="flex items-center gap-1"><Eye className="w-2.5 h-2.5" />{post.views.toLocaleString()}</span>
                      <span className="flex items-center gap-1"><ThumbsUp className="w-2.5 h-2.5" />{post.likes}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="w-2.5 h-2.5" />{post.comments}</span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {post.tags.map(tag => (
                        <span key={tag} className="text-[9px] text-muted-foreground/60 flex items-center gap-0.5">
                          <Hash className="w-2 h-2" />{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button className="w-full py-5 rounded-xl border-2 border-dashed border-white/[0.06] text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all font-bold text-xs uppercase tracking-widest">
              더 보기
            </button>
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
