"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText, Star, Bell, Shield, Award,
  MessageSquare, Heart, Eye, ChevronRight, ThumbsUp,
  Clock, Zap, Trophy, History, MapPin, X, BarChart3, ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import ProfileSection from "./ProfileSection";
import ContactModal from "@/components/modals/ContactModal";
import BettingStatsDashboard from "@/components/mypage/BettingStatsDashboard";

interface MyPageTabsProps {
  user: any;
  profile: any;
  initialMatches: any[];
  initialInterests: any[];
  initialNotifications: any[];
  initialPosts: any[];
  initialFavoritePosts: any[];
  initialInquiries?: any[];
  initialBettingRecords?: any[];
}

export default function MyPageTabs({
  user,
  profile,
  initialMatches = [],
  initialInterests = [],
  initialNotifications = [],
  initialPosts = [],
  initialFavoritePosts = [],
  initialInquiries = [],
  initialBettingRecords = []
}: MyPageTabsProps) {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview"); // overview, posts, matches, notifications, interests, inquiries
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [interests, setInterests] = useState<any[]>(initialInterests);
  const [bettingRecords, setBettingRecords] = useState<any[]>(initialBettingRecords);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAllMatches, setShowAllMatches] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const safeInterests = Array.isArray(interests) ? interests : [];
  const safeMatches = Array.isArray(initialMatches) ? initialMatches : [];
  const safeNotifications = Array.isArray(initialNotifications) ? initialNotifications : [];
  const safePosts = Array.isArray(initialPosts) ? initialPosts : [];
  const safeFavoritePosts = Array.isArray(initialFavoritePosts) ? initialFavoritePosts : [];
  const safeInquiries = Array.isArray(initialInquiries) ? initialInquiries : [];
  const safeBettingRecords = Array.isArray(bettingRecords) ? bettingRecords : [];

  const favTeams = safeInterests.filter(i => i.category === 'team').map(i => i.value);
  const favLeagues = safeInterests.filter(i => i.category === 'league').map(i => i.value);
  const favSports = safeInterests.filter(i => i.category === 'sport').map(i => i.value);

  const favoriteMatches = safeMatches.map(m => {
    if (!m) return null;
    let priority = 0;
    const hasFavTeam = favTeams.includes(String(m.home || '')) || favTeams.includes(String(m.away || ''));
    const hasFavLeague = favLeagues.includes(String(m.league || ''));
    const hasFavSport = favSports.includes(String(m.sport || ''));

    if (hasFavTeam) priority += 500;
    if (hasFavLeague) priority += 200;
    if (hasFavSport) priority += 10;

    if (priority === 0) return null;

    const sTerm = String(searchTerm || '').toLowerCase();
    const matchesSearch = !sTerm || 
      String(m.home || '').toLowerCase().includes(sTerm) || 
      String(m.away || '').toLowerCase().includes(sTerm) || 
      String(m.league || '').toLowerCase().includes(sTerm);

    if (!matchesSearch) return null;

    return { ...m, priority };
  }).filter(Boolean).sort((a: any, b: any) => b.priority - a.priority) as any[];

  const MENU_ITEMS = [
    { id: "overview", label: "마이페이지 홈", icon: Shield, count: 0 },
    { id: "stats", label: "베팅 분석", icon: BarChart3, count: 0 },
    { id: "betting", label: "베팅 저널", icon: History, count: safeBettingRecords.length },
    { id: "interests", label: "관심 설정", icon: Heart, count: safeInterests.length },
    { id: "favorites", label: "관심 게시글", icon: Star, count: safeFavoritePosts.length },
    { id: "notifications", label: "알림 서랍", icon: Bell, count: safeNotifications.filter(n => n && !n.readAt).length },
    { id: "posts", label: "내 글/댓글", icon: FileText, count: (profile?.postCount || 0) + (profile?.commentCount || 0) },
    { id: "betting", label: "베팅 저널", icon: History, count: safeBettingRecords.length },
    { id: "inquiries", label: "1:1 문의", icon: MessageSquare, count: safeInquiries.length },
    { id: "activity", label: "활동 점수", icon: Award, count: profile?.score || 0 },
  ];

  if (!isClient) return null; // Prevent hydration mismatch

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
              {safeInterests.length > 0 ? (
                safeInterests.map((interest, idx) => (
                  <div key={idx} className="glass-card rounded-2xl p-4 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                        interest?.category === 'sport' ? "bg-primary/10 text-primary" :
                        interest?.category === 'league' ? "bg-emerald-500/10 text-emerald-400" :
                        interest?.category === 'team' ? "bg-[hsl(var(--gold))]/10 text-[hsl(var(--gold))]" :
                        "bg-purple-500/10 text-purple-400"
                      )}>
                        {interest?.category === 'sport' ? <Zap className="w-4 h-4" /> :
                         interest?.category === 'league' ? <Trophy className="w-4 h-4" /> :
                         interest?.category === 'team' ? <Star className="w-4 h-4" /> :
                         <MapPin className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          {interest?.category === 'sport' ? '종목' :
                           interest?.category === 'league' ? '리그' :
                           interest?.category === 'team' ? '팀' : '국가'}
                        </p>
                        <p className="text-sm font-bold">{interest?.value || ''}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setSearchTerm(interest?.value || '');
                        setActiveTab("matches");
                      }}
                      className="bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border border-primary/20 group-hover:scale-105 active:scale-95"
                    >
                      경기 보기
                    </button>
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
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-500/15 p-1.5 rounded-lg">
                    <Star className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="font-bold text-lg">{searchTerm ? `'${searchTerm}' 경기` : "나의 관심 경기"}</h3>
                  <span className="badge-primary">{favoriteMatches.length}</span>
                </div>
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="flex items-center gap-1 text-[10px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded-md text-muted-foreground transition-colors"
                  >
                    필터 해제 <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              {favoriteMatches.length > 6 && (
                <button 
                  onClick={() => setShowAllMatches(!showAllMatches)} 
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  {showAllMatches ? "간략히 보기" : "전체 보기 (16개+)"} <ChevronRight className={cn("w-3 h-3 transition-transform", showAllMatches && "rotate-90")} />
                </button>
              )}
            </div>

            {favoriteMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoriteMatches.slice(0, showAllMatches ? 16 : 6).map(match => (
                  <div key={match?.id || Math.random()} className="glass-card-hover rounded-2xl p-5 group cursor-pointer relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3">
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20 uppercase">
                          {match?.league || 'LEAGUE'}
                        </span>
                        {favLeagues.includes(match?.league || '') && <Heart className="w-3 h-3 text-rose-400 fill-current" />}
                      </div>
                      {match?.live && (
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
                        <p className={cn("font-black text-base group-hover:text-primary transition-colors flex items-center justify-center gap-1", favTeams.includes(match?.home || '') && "text-[hsl(var(--gold))]")}>
                          {favTeams.includes(match?.home || '') && <Star className="w-3 h-3 fill-current" />}
                          {match?.home || 'Home'}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1 uppercase">Home</p>
                      </div>
                      <div className="px-3 text-center shrink-0">
                        <div className="bg-black/40 rounded-xl px-4 py-1.5 border border-white/5 font-mono text-xl font-black text-red-500 shadow-inner whitespace-nowrap min-w-[75px] inline-block">
                          {typeof match?.scores?.home === 'object' && match?.scores?.home !== null 
                            ? (match.scores.home.total ?? match.scores.home.goals ?? 0) 
                            : (match?.scores?.home ?? 0)} 
                          {' : '} 
                          {typeof match?.scores?.away === 'object' && match?.scores?.away !== null 
                            ? (match.scores.away.total ?? match.scores.away.goals ?? 0) 
                            : (match?.scores?.away ?? 0)}
                        </div>
                        <span className="text-[10px] text-muted-foreground/40 mt-1 block uppercase font-bold tracking-widest">{match?.status || ''}</span>
                      </div>
                      <div className="text-center flex-1">
                        <p className={cn("font-black text-base group-hover:text-primary transition-colors flex items-center justify-center gap-1", favTeams.includes(match?.away || '') && "text-[hsl(var(--gold))]")}>
                          {match?.away || 'Away'}
                          {favTeams.includes(match?.away || '') && <Star className="w-3 h-3 fill-current" />}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1 uppercase">Away</p>
                      </div>
                    </div>
                    <div className="mt-5 pt-4 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-muted-foreground/60 font-medium">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {match?.time || ''}</span>
                        <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-primary" /> {match?.sport === 'soccer' ? '축구' : match?.sport === 'baseball' ? '야구' : match?.sport === 'basketball' ? '농구' : '경기'}</span>
                      </div>
                      <Link href="/odds" className="text-primary hover:underline font-bold">배당 분석 →</Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-12 text-center space-y-3">
                <Star className="w-10 h-10 text-muted-foreground/20 mx-auto" />
                <p className="text-muted-foreground text-sm">
                  {searchTerm 
                    ? `현재 '${searchTerm}' 팀의 경기가 없습니다.` 
                    : "관심 있는 경기가 오늘 없습니다."}
                  <br/>배당 페이지에서 새로운 팀이나 리그를 관심 등록해보세요.
                </p>
                <div className="flex items-center justify-center gap-3 mt-2">
                  {searchTerm && (
                    <button onClick={() => setSearchTerm("")} className="btn-outline text-xs py-2 px-4">
                      전체 관심 경기 보기
                    </button>
                  )}
                  <Link href="/odds" className="btn-primary text-xs py-2 px-4">
                    배당 페이지로 이동
                  </Link>
                </div>
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
                {safeNotifications.filter(n => !n.readAt).length > 0 && (
                  <span className="badge-primary">{safeNotifications.filter(n => !n.readAt).length} 새 알림</span>
                )}
              </div>
              <Link href="/mypage/notifications" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                전체보기 <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {safeNotifications.length > 0 ? (
                safeNotifications.slice(0, 5).map(notif => (
                  <div key={notif.id} className={cn(
                    "glass-card rounded-xl p-4 flex items-center gap-3 transition-colors cursor-pointer",
                    !notif.readAt && "border-l-2 border-l-primary bg-primary/[0.02]"
                  )}>
                    <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                      <Bell className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm", !notif.readAt ? "font-bold text-foreground" : "text-muted-foreground")}>{notif?.title || '알림'}</p>
                      <p className="text-[10px] text-muted-foreground/60">{notif?.createdAt ? new Date(notif.createdAt).toLocaleString() : ''}</p>
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
              {safePosts.length > 0 ? (
                safePosts.map(post => (
                  <Link href={`/community/${post.id}`} key={post.id} className="glass-card rounded-xl p-4 flex items-center gap-4 hover:bg-white/[0.03] transition-colors cursor-pointer group block">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-bold bg-white/5 px-1.5 py-0.5 rounded">{post?.category || '게시판'}</span>
                      </div>
                      <h4 className="text-sm font-bold truncate group-hover:text-primary transition-colors">{post?.title || '제목 없음'}</h4>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                        <span>{post?.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}</span>
                        <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{post?.views || 0}</span>
                        <span className="flex items-center gap-0.5"><Heart className="w-2.5 h-2.5" />{post?.likes || 0}</span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-10 text-center text-sm text-muted-foreground glass-card rounded-2xl">
                  작성한 게시글이 없습니다.
                </div>
              )}
            </div>
          </section>
        )}

        {/* ─── Tab: Favorite Posts ─── */}
        {(activeTab === "overview" || activeTab === "favorites") && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-[hsl(var(--gold))]/15 p-1.5 rounded-lg">
                  <Star className="w-4 h-4 text-[hsl(var(--gold))]" />
                </div>
                <h3 className="font-bold text-lg">관심 게시글</h3>
              </div>
              <Link href="/community" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                커뮤니티 가기 <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {safeFavoritePosts.length > 0 ? (
                safeFavoritePosts.map(post => (
                  <Link href={`/community/${post.id}`} key={post.id} className="glass-card rounded-xl p-4 flex items-center gap-4 hover:bg-white/[0.03] transition-colors cursor-pointer group block">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-bold bg-[hsl(var(--gold))]/10 text-[hsl(var(--gold))] px-1.5 py-0.5 rounded">{post?.category || '게시판'}</span>
                      </div>
                      <h4 className="text-sm font-bold truncate group-hover:text-primary transition-colors">{post?.title || '제목 없음'}</h4>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                        <span>{post?.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}</span>
                        <span className="flex items-center gap-0.5"><ThumbsUp className="w-2.5 h-2.5" />{post?.likes || 0}</span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-10 text-center text-sm text-muted-foreground glass-card rounded-2xl">
                  등록된 관심 게시글이 없습니다.
                </div>
              )}
            </div>
          </section>
        )}

        {/* ─── Tab: Inquiries ─── */}
        {(activeTab === "overview" || activeTab === "inquiries") && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-blue-500/15 p-1.5 rounded-lg">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                </div>
                <h3 className="font-bold text-lg">1:1 문의</h3>
              </div>
              <button onClick={() => setIsContactModalOpen(true)} className="btn-primary text-xs py-1.5 px-3 rounded-lg">
                문의하기
              </button>
            </div>
            <div className="space-y-3">
              {safeInquiries.length > 0 ? (
                safeInquiries.map((inquiry: any) => (
                  <div key={inquiry.id} className="glass-card rounded-xl p-5 border-l-4 border-l-blue-500/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded",
                        inquiry.status === 'pending' ? "bg-yellow-500/10 text-yellow-500" : "bg-emerald-500/10 text-emerald-400"
                      )}>
                        {inquiry.status === 'pending' ? '답변 대기' : '답변 완료'}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{new Date(inquiry.createdAt).toLocaleString()}</span>
                    </div>
                    <h4 className="font-bold text-sm mb-2">{inquiry.title}</h4>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap bg-white/5 p-3 rounded-lg">{inquiry.content}</p>
                    
                    {inquiry.answer && (
                      <div className="mt-3 bg-primary/10 border border-primary/20 p-3 rounded-lg relative">
                        <div className="absolute -top-2 left-4 bg-background px-1 text-[10px] font-bold text-primary">답변</div>
                        <p className="text-xs text-foreground whitespace-pre-wrap">{inquiry.answer}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-sm text-muted-foreground glass-card rounded-2xl">
                  문의 내역이 없습니다.
                </div>
              )}
            </div>
          </section>
        )}

        {/* ─── Tab: Betting Analysis (Dashboard) ─── */}
        {(activeTab === "overview" || activeTab === "stats") && (
          <section className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-primary/15 p-1.5 rounded-lg">
                  <BarChart3 className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-bold text-lg">베팅 분석 대시보드</h3>
              </div>
              <button 
                onClick={() => {
                  const finished = safeBettingRecords.filter(r => r.status !== 'pending');
                  const totalStake = finished.reduce((acc, r) => acc + r.stake, 0);
                  const totalReturn = finished.reduce((acc, r) => acc + r.resultAmount, 0);
                  const roi = totalStake > 0 ? ((totalReturn - totalStake) / totalStake * 100).toFixed(1) : "0.0";
                  const winRate = finished.length > 0 ? (finished.filter(r => r.status === 'won').length / finished.length * 100).toFixed(1) : "0.0";
                  
                  const content = `[나의 베팅 성과 인증]\n\n📊 ROI: ${roi}%\n🎯 승률: ${winRate}%\n💰 총 수익: ${(totalReturn - totalStake).toLocaleString()}원\n\n#베팅인증 #수익률 #스포츠분석`;
                  router.push(`/community/write?content=${encodeURIComponent(content)}&category=review`);
                }}
                className="btn-primary text-[10px] py-1.5 px-3 rounded-xl flex items-center gap-1.5"
              >
                <ArrowUpRight className="w-3 h-3" /> 성과 공유하기
              </button>
            </div>
            <BettingStatsDashboard records={safeBettingRecords} />
          </section>
        )}

        {/* ─── Tab: Betting Journal ─── */}
        {(activeTab === "overview" || activeTab === "betting") && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-orange-500/15 p-1.5 rounded-lg">
                  <History className="w-4 h-4 text-orange-400" />
                </div>
                <h3 className="font-bold text-lg">베팅 저널</h3>
                <span className="badge-primary">{safeBettingRecords.length}</span>
              </div>
            </div>

            <BettingJournalView initialRecords={safeBettingRecords} />
          </section>
        )}
      </div>


      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
        isLoggedIn={true}
      />
    </div>
  );
}

function BettingJournalView({ initialRecords }: { initialRecords: any[] }) {
  const [records, setRecords] = useState(initialRecords);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newRecord, setNewRecord] = useState({
    sport: 'soccer',
    league: '',
    match: '',
    market: '',
    selection: '',
    odds: '',
    stake: '',
    betDate: new Date().toISOString().slice(0, 16)
  });

  const fetchRecords = async () => {
    try {
      const res = await fetch('/api/betting-records');
      const data = await res.json();
      if (data.success) setRecords(data.records);
    } catch (e) {}
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/betting-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord)
      });
      const data = await res.json();
      if (data.success) {
        setIsAdding(false);
        setNewRecord({
          sport: 'soccer',
          league: '',
          match: '',
          market: '',
          selection: '',
          odds: '',
          stake: '',
          betDate: new Date().toISOString().slice(0, 16)
        });
        fetchRecords();
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert("오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string, stake: number, odds: number) => {
    let resultAmount = 0;
    if (status === 'won') resultAmount = stake * odds;
    else if (status === 'lost') resultAmount = 0;
    else if (status === 'void') resultAmount = stake;

    try {
      const res = await fetch('/api/betting-records', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, resultAmount })
      });
      const data = await res.json();
      if (data.success) fetchRecords();
    } catch (e) {}
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`/api/betting-records?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchRecords();
    } catch (e) {}
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
            isAdding ? "bg-white/10 text-white" : "bg-primary text-white shadow-lg shadow-primary/20"
          )}
        >
          {isAdding ? <X className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
          {isAdding ? "취소하기" : "새 베팅 기록하기"}
        </button>
      </div>

      {isAdding && (
        <div className="glass-card rounded-2xl p-6 border border-primary/20 animate-slide-in-down">
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">종목</label>
                <select 
                  value={newRecord.sport}
                  onChange={e => setNewRecord({...newRecord, sport: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:border-primary/50 outline-none"
                >
                  <option value="soccer">축구</option>
                  <option value="basketball">농구</option>
                  <option value="baseball">야구</option>
                  <option value="volleyball">배구</option>
                  <option value="hockey">하키</option>
                  <option value="etc">기타</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">리그</label>
                <input 
                  value={newRecord.league}
                  onChange={e => setNewRecord({...newRecord, league: e.target.value})}
                  placeholder="예: EPL, NBA"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:border-primary/50 outline-none"
                />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">경기명</label>
                <input 
                  value={newRecord.match}
                  onChange={e => setNewRecord({...newRecord, match: e.target.value})}
                  placeholder="예: 토트넘 vs 아스널"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:border-primary/50 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">마켓</label>
                <input 
                  value={newRecord.market}
                  onChange={e => setNewRecord({...newRecord, market: e.target.value})}
                  placeholder="예: 승무패, 핸디캡"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:border-primary/50 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">선택</label>
                <input 
                  value={newRecord.selection}
                  onChange={e => setNewRecord({...newRecord, selection: e.target.value})}
                  placeholder="예: 홈승, 2.5 오버"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:border-primary/50 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">배당률</label>
                <input 
                  type="number" step="0.01"
                  value={newRecord.odds}
                  onChange={e => setNewRecord({...newRecord, odds: e.target.value})}
                  placeholder="예: 1.85"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:border-primary/50 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">베팅 금액</label>
                <input 
                  type="number"
                  value={newRecord.stake}
                  onChange={e => setNewRecord({...newRecord, stake: e.target.value})}
                  placeholder="금액 입력"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:border-primary/50 outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button 
                disabled={isLoading}
                className="btn-primary py-2 px-8 text-xs flex items-center gap-2"
              >
                {isLoading ? "저장 중..." : "저장하기"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b border-white/10">
                <th className="px-4 py-3 text-left">날짜/종목</th>
                <th className="px-4 py-3 text-left">경기/마켓</th>
                <th className="px-4 py-3 text-left">선택/배당</th>
                <th className="px-4 py-3 text-center">금액</th>
                <th className="px-4 py-3 text-center">상태</th>
                <th className="px-4 py-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {records.map(record => (
                <tr key={record.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-4">
                    <p className="text-[10px] text-muted-foreground">{new Date(record.betDate).toLocaleDateString()}</p>
                    <p className="font-bold text-xs capitalize">{record.sport}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-bold text-xs truncate max-w-[150px]">{record.match || '-'}</p>
                    <p className="text-[10px] text-muted-foreground">{record.league} · {record.market}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-bold text-xs text-primary">{record.selection}</p>
                    <p className="text-[10px] text-muted-foreground">@{record.odds}</p>
                  </td>
                  <td className="px-4 py-4 text-center font-mono">
                    {record.stake.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      {record.status === 'pending' ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleUpdateStatus(record.id, 'won', record.stake, record.odds)} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold">적중</button>
                          <button onClick={() => handleUpdateStatus(record.id, 'lost', record.stake, record.odds)} className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] font-bold">미적중</button>
                          <button onClick={() => handleUpdateStatus(record.id, 'void', record.stake, record.odds)} className="px-2 py-0.5 rounded bg-white/10 text-muted-foreground border border-white/20 text-[9px] font-bold">적특</button>
                        </div>
                      ) : (
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded border",
                          record.status === 'won' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          record.status === 'lost' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                          "bg-white/10 text-muted-foreground border border-white/20"
                        )}>
                          {record.status === 'won' ? '적중' : record.status === 'lost' ? '미적중' : '취소/적특'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button onClick={() => handleDelete(record.id)} className="p-1 hover:text-red-400 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-20 text-muted-foreground text-sm italic">
                    아직 기록된 베팅 내역이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
