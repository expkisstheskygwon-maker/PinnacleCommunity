"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText, Star, Bell, Shield, Award,
  MessageSquare, Heart, Eye, ChevronRight,
  Clock, Zap, Trophy, History, MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";
import ProfileSection from "./ProfileSection";

interface MyPageTabsProps {
  user: any;
  profile: any;
  initialMatches: any[];
  initialFavorites: string[];
  initialInterests: any[];
  initialNotifications: any[];
  initialPosts: any[];
}

export default function MyPageTabs({
  user,
  profile,
  initialMatches,
  initialFavorites,
  initialInterests,
  initialNotifications,
  initialPosts
}: MyPageTabsProps) {
  const [activeTab, setActiveTab] = useState("overview"); // overview, posts, matches, notifications, interests
  const [favorites, setFavorites] = useState<string[]>(initialFavorites);
  const [interests, setInterests] = useState<any[]>(initialInterests);
  
  const favTeams = interests.filter(i => i.category === 'team').map(i => i.value);
  const favLeagues = interests.filter(i => i.category === 'league').map(i => i.value);
  const favSports = interests.filter(i => i.category === 'sport').map(i => i.value);

  // 즐겨찾기 필터링 로직: 즐겨찾기한 경기 ID + 관심 팀/리그/종목이 포함된 경기
  const favoriteMatches = initialMatches.filter(m => {
    const isFavMatch = favorites.includes(m.id.toString());
    const hasFavTeam = favTeams.includes(m.home) || favTeams.includes(m.away);
    const hasFavLeague = favLeagues.includes(m.league);
    const hasFavSport = favSports.includes(m.sport);
    return isFavMatch || hasFavTeam || hasFavLeague || hasFavSport;
  });

  const MENU_ITEMS = [
    { id: "overview", label: "마이페이지 홈", icon: Shield, count: 0 },
    { id: "matches", label: "관심 경기", icon: Star, count: favoriteMatches.length },
    { id: "interests", label: "관심 설정", icon: Heart, count: interests.length },
    { id: "notifications", label: "알림 서랍", icon: Bell, count: initialNotifications.filter(n => !n.readAt).length },
    { id: "posts", label: "내 글/댓글", icon: FileText, count: profile.postCount + profile.commentCount },
    { id: "activity", label: "활동 점수", icon: Award, count: profile.score },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
      {/* Left - Profile & Menu */}
      <div className="xl:col-span-4 space-y-6">
        <ProfileSection user={user} profile={profile} />

        {/* Menu */}
        <div className="glass-card rounded-2xl overflow-hidden">
          {MENU_ITEMS.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center justify-between px-5 py-4 transition-colors",
                activeTab === item.id ? "bg-primary/10 border-l-4 border-primary" : "hover:bg-white/[0.03] border-l-4 border-transparent",
                idx < MENU_ITEMS.length - 1 && "border-b border-white/[0.04]"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("w-4 h-4", activeTab === item.id ? "text-primary" : "text-muted-foreground")} />
                <span className={cn("text-sm font-medium", activeTab === item.id ? "text-foreground font-bold" : "text-muted-foreground")}>
                  {item.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {item.count > 0 && (
                  <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full min-w-[24px] text-center">
                    {item.count}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right - Dynamic Content Area */}
      <div className="xl:col-span-8 space-y-8 animate-fade-in">
        
        {/* ─── Tab: Overview or Interests ─── */}
        {activeTab === "interests" && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-rose-500/15 p-1.5 rounded-lg">
                <Heart className="w-4 h-4 text-rose-400" />
              </div>
              <h3 className="font-bold text-lg">나의 관심 설정</h3>
              <span className="badge-primary">{interests.length}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {interests.length > 0 ? (
                interests.map((interest, idx) => (
                  <div key={idx} className="glass-card rounded-2xl p-4 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                        interest.category === 'sport' ? "bg-primary/10 text-primary" :
                        interest.category === 'league' ? "bg-emerald-500/10 text-emerald-400" :
                        interest.category === 'team' ? "bg-[hsl(var(--gold))]/10 text-[hsl(var(--gold))]" :
                        "bg-purple-500/10 text-purple-400"
                      )}>
                        {interest.category === 'sport' ? <Zap className="w-4 h-4" /> :
                         interest.category === 'league' ? <Trophy className="w-4 h-4" /> :
                         interest.category === 'team' ? <Star className="w-4 h-4" /> :
                         <MapPin className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          {interest.category === 'sport' ? '종목' :
                           interest.category === 'league' ? '리그' :
                           interest.category === 'team' ? '팀' : '국가'}
                        </p>
                        <p className="text-sm font-bold">{interest.value}</p>
                      </div>
                    </div>
                    <Link href="/" className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-primary hover:underline">
                      경기 보기
                    </Link>
                  </div>
                ))
              ) : (
                <div className="col-span-full glass-card rounded-2xl p-12 text-center space-y-3">
                  <Heart className="w-10 h-10 text-muted-foreground/20 mx-auto" />
                  <p className="text-muted-foreground text-sm">설정된 관심 항목이 없습니다.<br/>홈페이지에서 관심 있는 팀이나 리그를 추가해보세요.</p>
                  <Link href="/" className="inline-block btn-primary text-xs py-2 px-4 mt-2">
                    설정하러 가기
                  </Link>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ─── Tab: Overview or Matches ─── */}
        {(activeTab === "overview" || activeTab === "matches") && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-500/15 p-1.5 rounded-lg">
                  <Star className="w-4 h-4 text-emerald-400" />
                </div>
                <h3 className="font-bold text-lg">오늘의 관심 경기</h3>
                <span className="badge-primary">{favoriteMatches.length}</span>
              </div>
              {activeTab === "overview" && (
                <button onClick={() => setActiveTab("matches")} className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                  전체 경기 <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {favoriteMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {favoriteMatches.map(match => (
                  <div key={match.id} className="glass-card-hover rounded-2xl p-5 group cursor-pointer relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3">
                      <Star className={cn("w-4 h-4 transition-opacity", favorites.includes(match.id.toString()) ? "text-[hsl(var(--gold))] fill-current opacity-100" : "text-white/10 opacity-40 group-hover:opacity-100")} />
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20 uppercase">
                          {match.league}
                        </span>
                        {favLeagues.includes(match.league) && <Heart className="w-3 h-3 text-rose-400 fill-current" />}
                      </div>
                      {match.live && (
                        <span className="badge-live text-[9px]">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                          </span>
                          LIVE
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between px-2">
                      <div className="text-center flex-1">
                        <p className={cn("font-black text-base group-hover:text-primary transition-colors flex items-center justify-center gap-1", favTeams.includes(match.home) && "text-[hsl(var(--gold))]")}>
                          {favTeams.includes(match.home) && <Star className="w-3 h-3 fill-current" />}
                          {match.home}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1 uppercase">Home</p>
                      </div>
                      <div className="px-4 text-center">
                        <div className="bg-black/40 rounded-xl px-3 py-1.5 border border-white/5 font-mono text-xl font-black text-red-500 shadow-inner">
                          {match.scores.home} : {match.scores.away}
                        </div>
                        <span className="text-[10px] text-muted-foreground/40 mt-1 block uppercase font-bold tracking-widest">{match.status}</span>
                      </div>
                      <div className="text-center flex-1">
                        <p className={cn("font-black text-base group-hover:text-primary transition-colors flex items-center justify-center gap-1", favTeams.includes(match.away) && "text-[hsl(var(--gold))]")}>
                          {match.away}
                          {favTeams.includes(match.away) && <Star className="w-3 h-3 fill-current" />}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1 uppercase">Away</p>
                      </div>
                    </div>
                    <div className="mt-5 pt-4 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-muted-foreground/60 font-medium">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {match.time}</span>
                        <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-primary" /> {match.sport === 'soccer' ? '축구' : match.sport === 'baseball' ? '야구' : '농구'}</span>
                      </div>
                      <Link href="/odds" className="text-primary hover:underline font-bold">배당 분석 →</Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-12 text-center space-y-3">
                <Star className="w-10 h-10 text-muted-foreground/20 mx-auto" />
                <p className="text-muted-foreground text-sm">관심 있는 경기가 오늘 없습니다.<br/>다른 종목을 확인하거나 새로운 팀을 관심 등록해보세요.</p>
                <Link href="/odds" className="inline-block btn-primary text-xs py-2 px-4 mt-2">
                  경기 보러가기
                </Link>
              </div>
            )}
          </section>
        )}

        {/* ─── Tab: Notifications ─── */}
        {(activeTab === "overview" || activeTab === "notifications") && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-primary/15 p-1.5 rounded-lg">
                  <Bell className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-bold text-lg">최근 알림</h3>
                {initialNotifications.filter(n => !n.readAt).length > 0 && (
                  <span className="badge-primary">{initialNotifications.filter(n => !n.readAt).length} 새 알림</span>
                )}
              </div>
              <Link href="/mypage/notifications" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                전체보기 <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {initialNotifications.length > 0 ? (
                initialNotifications.slice(0, 5).map(notif => (
                  <div key={notif.id} className={cn(
                    "glass-card rounded-xl p-4 flex items-center gap-3 transition-colors cursor-pointer",
                    !notif.readAt && "border-l-2 border-l-primary bg-primary/[0.02]"
                  )}>
                    <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                      <Bell className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm", !notif.readAt ? "font-bold text-foreground" : "text-muted-foreground")}>{notif.title}</p>
                      <p className="text-[10px] text-muted-foreground/60">{new Date(notif.createdAt).toLocaleString()}</p>
                    </div>
                    {!notif.readAt && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-sm text-muted-foreground glass-card rounded-2xl">
                  새로운 알림이 없습니다.
                </div>
              )}
            </div>
          </section>
        )}

        {/* ─── Tab: My Posts ─── */}
        {(activeTab === "overview" || activeTab === "posts") && (
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
              {initialPosts.length > 0 ? (
                initialPosts.map(post => (
                  <div key={post.id} className="glass-card rounded-xl p-4 flex items-center gap-4 hover:bg-white/[0.03] transition-colors cursor-pointer group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-bold bg-white/5 px-1.5 py-0.5 rounded">{post.category}</span>
                      </div>
                      <h4 className="text-sm font-bold truncate group-hover:text-primary transition-colors">{post.title}</h4>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{post.views}</span>
                        <span className="flex items-center gap-0.5"><Heart className="w-2.5 h-2.5" />{post.likes}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-sm text-muted-foreground glass-card rounded-2xl">
                  작성한 게시글이 없습니다.
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
