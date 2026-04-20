"use client";

import Link from "next/link";
import {
  User, FileText, Star, Bell, Shield, Award,
  MessageSquare, Eye, Heart, Trophy, Flame, Target,
  Settings, ChevronRight, Clock, CheckCircle2, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

const USER_PROFILE = {
  name: "SportsAnalyst",
  email: "user@example.com",
  level: 15,
  score: 1850,
  badge: "Analyst",
  joined: "2025-11-20",
  postCount: 42,
  commentCount: 156,
  reviewCount: 8,
  likeReceived: 324,
  accuracy: 68,
};

const MY_POSTS = [
  { id: 1, title: "K리그 울산 vs 전북 경기 분석", category: "경기 토론", date: "2026-04-20", views: 234, likes: 18, comments: 9 },
  { id: 2, title: "아시안핸디캡 -0.75 활용법", category: "분석", date: "2026-04-18", views: 567, likes: 45, comments: 23 },
  { id: 3, title: "피나클 출금 후기 (3시간 완료)", category: "후기", date: "2026-04-15", views: 890, likes: 34, comments: 12 },
];

const MY_NOTIFICATIONS = [
  { id: 1, type: "reply", message: "ProBettor님이 내 글에 댓글을 달았습니다", time: "10분 전", read: false },
  { id: 2, type: "like", message: "내 후기가 추천 10개를 달성했습니다", time: "2시간 전", read: false },
  { id: 3, type: "notice", message: "새로운 사기주의 공지가 등록되었습니다", time: "5시간 전", read: true },
  { id: 4, type: "match", message: "관심 경기 울산 vs 전북이 곧 시작합니다", time: "1일 전", read: true },
];

const WATCHED_MATCHES = [
  { id: 1, home: "울산 HD", away: "전북 현대", league: "K리그1", time: "오늘 19:00", live: true },
  { id: 2, home: "Arsenal", away: "Chelsea", league: "EPL", time: "오늘 23:00", live: false },
  { id: 3, home: "T1", away: "Gen.G", league: "LCK", time: "오늘 17:00", live: false },
];

const MENU_ITEMS = [
  { id: "posts", label: "내 글/댓글", icon: FileText, count: USER_PROFILE.postCount + USER_PROFILE.commentCount },
  { id: "matches", label: "관심 경기", icon: Star, count: WATCHED_MATCHES.length },
  { id: "notifications", label: "알림 설정", icon: Bell, count: MY_NOTIFICATIONS.filter(n => !n.read).length },
  { id: "reports", label: "신고 내역", icon: Shield, count: 0 },
  { id: "activity", label: "활동 점수", icon: Award, count: USER_PROFILE.score },
];

export default function MyPage() {
  return (
    <div className="mesh-gradient min-h-screen">
      <div className="container mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <Link href="/" className="hover:text-primary transition-colors">홈</Link>
          <span>/</span>
          <span className="text-foreground font-bold">마이페이지</span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Left - Profile */}
          <div className="xl:col-span-4 space-y-6">
            {/* Profile Card */}
            <div className="glass-card rounded-2xl p-6 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-primary/15 to-transparent" />
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-2xl bg-primary/20 mx-auto mb-3 flex items-center justify-center text-3xl font-black text-primary border-2 border-primary/20">
                  {USER_PROFILE.name[0]}
                </div>
                <h2 className="text-xl font-black">{USER_PROFILE.name}</h2>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">Lv.{USER_PROFILE.level}</span>
                  <span className="badge-primary text-[8px]">
                    <Award className="w-2.5 h-2.5" /> {USER_PROFILE.badge}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">가입일: {USER_PROFILE.joined}</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                {[
                  { label: "게시글", value: USER_PROFILE.postCount, icon: FileText, color: "text-primary" },
                  { label: "댓글", value: USER_PROFILE.commentCount, icon: MessageSquare, color: "text-emerald-400" },
                  { label: "후기", value: USER_PROFILE.reviewCount, icon: Star, color: "text-[hsl(var(--gold))]" },
                  { label: "받은 추천", value: USER_PROFILE.likeReceived, icon: Heart, color: "text-red-400" },
                ].map(stat => (
                  <div key={stat.label} className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.04]">
                    <stat.icon className={cn("w-4 h-4 mx-auto mb-1", stat.color)} />
                    <p className={cn("text-lg font-black", stat.color)}>{stat.value}</p>
                    <p className="text-[9px] text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Activity Score */}
              <div className="mt-6 bg-gradient-to-r from-primary/10 to-transparent rounded-xl p-4 border border-primary/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5 text-[hsl(var(--gold))]" /> 활동 점수</span>
                  <span className="text-lg font-black text-primary">{USER_PROFILE.score.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full" style={{ width: "62%" }} />
                </div>
                <div className="flex justify-between mt-1 text-[9px] text-muted-foreground">
                  <span>다음 레벨까지 150점</span>
                  <span>Lv.16</span>
                </div>
              </div>

              <button className="mt-4 w-full btn-outline text-xs py-2.5 flex items-center justify-center gap-2">
                <Settings className="w-3.5 h-3.5" /> 프로필 설정
              </button>
            </div>

            {/* Menu */}
            <div className="glass-card rounded-2xl overflow-hidden">
              {MENU_ITEMS.map((item, idx) => (
                <button key={item.id} className={cn(
                  "w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.03] transition-colors",
                  idx < MENU_ITEMS.length - 1 && "border-b border-white/[0.04]"
                )}>
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.count > 0 && (
                      <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full min-w-[24px] text-center">
                        {item.count}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right - Content */}
          <div className="xl:col-span-8 space-y-8">
            {/* Notifications */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-primary/15 p-1.5 rounded-lg">
                  <Bell className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-bold text-lg">최근 알림</h3>
                <span className="badge-primary">
                  {MY_NOTIFICATIONS.filter(n => !n.read).length} 새 알림
                </span>
              </div>
              <div className="space-y-2">
                {MY_NOTIFICATIONS.map(notif => (
                  <div key={notif.id} className={cn(
                    "glass-card rounded-xl p-4 flex items-center gap-3 transition-colors cursor-pointer",
                    !notif.read && "border-l-2 border-l-primary bg-primary/[0.02]"
                  )}>
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                      notif.type === "reply" ? "bg-primary/15" : notif.type === "like" ? "bg-red-500/15" : notif.type === "notice" ? "bg-[hsl(var(--gold))]/15" : "bg-emerald-500/15"
                    )}>
                      {notif.type === "reply" ? <MessageSquare className="w-4 h-4 text-primary" />
                        : notif.type === "like" ? <Heart className="w-4 h-4 text-red-400" />
                        : notif.type === "notice" ? <Bell className="w-4 h-4 text-[hsl(var(--gold))]" />
                        : <Star className="w-4 h-4 text-emerald-400" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm", !notif.read ? "font-bold" : "text-muted-foreground")}>{notif.message}</p>
                      <p className="text-[10px] text-muted-foreground/60">{notif.time}</p>
                    </div>
                    {!notif.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                  </div>
                ))}
              </div>
            </section>

            {/* Watched Matches */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-emerald-500/15 p-1.5 rounded-lg">
                  <Star className="w-4 h-4 text-emerald-400" />
                </div>
                <h3 className="font-bold text-lg">관심 경기</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {WATCHED_MATCHES.map(match => (
                  <div key={match.id} className="glass-card-hover rounded-xl p-4 cursor-pointer">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[9px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase">{match.league}</span>
                      {match.live ? (
                        <span className="badge-live text-[8px]">
                          <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span></span>
                          LIVE
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">{match.time}</span>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-sm">{match.home}</p>
                      <p className="text-[10px] text-primary my-1">VS</p>
                      <p className="font-bold text-sm">{match.away}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* My Posts */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-purple-500/15 p-1.5 rounded-lg">
                    <FileText className="w-4 h-4 text-purple-400" />
                  </div>
                  <h3 className="font-bold text-lg">내 게시글</h3>
                </div>
                <Link href="/community" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                  전체보기 <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-2">
                {MY_POSTS.map(post => (
                  <div key={post.id} className="glass-card rounded-xl p-4 flex items-center gap-4 hover:bg-white/[0.03] transition-colors cursor-pointer group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-bold bg-white/5 px-1.5 py-0.5 rounded">{post.category}</span>
                      </div>
                      <h4 className="text-sm font-bold truncate group-hover:text-primary transition-colors">{post.title}</h4>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                        <span>{post.date}</span>
                        <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{post.views}</span>
                        <span className="flex items-center gap-0.5"><Heart className="w-2.5 h-2.5" />{post.likes}</span>
                        <span className="flex items-center gap-0.5"><MessageSquare className="w-2.5 h-2.5" />{post.comments}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
