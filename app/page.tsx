"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Activity,
  TrendingUp,
  ShieldAlert,
  BarChart3,
  Users,
  MessageSquare,
  Calendar,
  Star,
  BookOpen,
  Bell,
  AlertTriangle,
  ChevronRight,
  Eye,
  ThumbsUp,
  Flame,
  Zap,
  Clock,
  ArrowUpRight,
  Shield,
  Award,
  Swords,
  Target,
  HelpCircle,
  FileText,
  Megaphone,
  CheckCircle2,
  XCircle,
  TrendingDown,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── i18n 설정 ─── */
const LANGUAGES = {
  ko: {
    heroTitle: "모든 정보를 한곳에서",
    heroDesc: "가입 가이드부터 배당 분석, 실사용 후기, 사기주의 안내까지. 신뢰할 수 있는 피나클 커뮤니티에 오신 것을 환영합니다.",
    guideBtn: "초보자 가이드",
    oddsBtn: "오늘의 배당",
    notices: "공지",
    todayMatches: "오늘의 경기",
    oddsChanges: "배당 변동 하이라이트",
    hotPosts: "인기 게시글",
    latestReviews: "최신 후기",
    recentQna: "최근 Q&A",
    communityActivity: "커뮤니티 활동",
    trustMetrics: "신뢰 지표",
    viewAll: "전체보기",
    liveBadge: "LIVE",
    language: "English"
  },
  en: {
    heroTitle: "All Information in One Place",
    heroDesc: "From sign‑up guides to odds analysis, user reviews, and scam alerts – welcome to the trusted Pinacle community.",
    guideBtn: "Beginner Guide",
    oddsBtn: "Today's Odds",
    notices: "Notices",
    todayMatches: "Today’s Matches",
    oddsChanges: "Odds Change Highlights",
    hotPosts: "Hot Posts",
    latestReviews: "Latest Reviews",
    recentQna: "Recent Q&A",
    communityActivity: "Community Activity",
    trustMetrics: "Trust Metrics",
    viewAll: "View All",
    liveBadge: "LIVE",
    language: "한국어"
  }
};

/* ─── Mock Data (unchanged) ─── */
const NOTICES = [
  { id: 1, type: "scam", title: "피나클 사칭 텔레그램 채널 주의", date: "2026-04-20", urgent: true },
  { id: 2, type: "maintenance", title: "4/21 새벽 2-4시 서버 정기점검 안내", date: "2026-04-19", urgent: false },
  { id: 3, type: "policy", title: "KYC 인증 절차 변경 안내 (5월 적용)", date: "2026-04-18", urgent: false }
];

const TODAY_MATCHES = [
  { id: 1, home: "울산 HD", away: "전북 현대", league: "K리그1", time: "19:00", live: true, homeOdds: 1.95, drawOdds: 3.60, awayOdds: 3.85, prevHome: 1.98, ahLine: "-0.5", ahOdds: 1.92, ou: "2.5", ouOdds: 1.88 },
  { id: 2, home: "Arsenal", away: "Chelsea", league: "EPL", time: "23:00", live: false, homeOdds: 1.85, drawOdds: 3.65, awayOdds: 4.10, prevHome: 1.90, ahLine: "-0.5", ahOdds: 1.88, ou: "2.5", ouOdds: 1.95 },
  { id: 3, home: "Real Madrid", away: "Barcelona", league: "La Liga", time: "04:00", live: false, homeOdds: 2.05, drawOdds: 3.50, awayOdds: 3.45, prevHome: 2.10, ahLine: "PK", ahOdds: 1.95, ou: "2.5", ouOdds: 2.10 },
  { id: 4, home: "Bayern", away: "Dortmund", league: "Bundesliga", time: "22:30", live: true, homeOdds: 1.55, drawOdds: 4.50, awayOdds: 5.20, prevHome: 1.58, ahLine: "-1.25", ahOdds: 1.92, ou: "3.5", ouOdds: 2.05 },
  { id: 5, home: "T1", away: "Gen.G", league: "LCK", time: "17:00", live: false, homeOdds: 1.75, drawOdds: 0, awayOdds: 2.05, prevHome: 1.80, ahLine: "-1.5", ahOdds: 2.15, ou: "2.5", ouOdds: 1.85 }
];

const ODDS_CHANGES = [
  { id: 1, match: "울산 HD vs 전북", market: "1X2 홈승", from: 1.98, to: 1.95, direction: "down", time: "12분 전" },
  { id: 2, match: "Arsenal vs Chelsea", market: "오버 2.5", from: 1.90, to: 1.95, direction: "up", time: "25분 전" },
  { id: 3, match: "T1 vs Gen.G", market: "홈승", from: 1.80, to: 1.75, direction: "down", time: "1시간 전" },
  { id: 4, match: "Bayern vs Dortmund", market: "AH -1.25", from: 1.88, to: 1.92, direction: "up", time: "2시간 전" }
];

const HOT_POSTS = [
  { id: 1, title: "K리그 울산 vs 전북 프리뷰: 이번 시즌 핵심 맞대결", author: "분석왕", category: "경기 토론", views: 1240, comments: 34, likes: 89, hot: true },
  { id: 2, title: "피나클 입금 가이드 - 2026년 최신 업데이트", author: "가이드마스터", category: "가이드", views: 3500, comments: 67, likes: 156, hot: true },
  { id: 3, title: "아시안핸디캡 완전정복: -0.5와 -0.75의 차이", author: "ProBettor", category: "분석", views: 2100, comments: 45, likes: 112, hot: false },
  { id: 4, title: "이번 주 EPL 배당 흐름 분석", author: "DataWiz", category: "칼럼", views: 890, comments: 23, likes: 67, hot: false },
  { id: 5, title: "피나클 출금 3시간 만에 완료 - 후기", author: "빠른출금", category: "후기", views: 760, comments: 12, likes: 42, hot: false }
];

const NEW_REVIEWS = [
  { id: 1, author: "축구매니아", sport: "축구", rating: 4.5, title: "EPL 배당이 확실히 높습니다", summary: "타 사이트 대비 항상 2-3% 높은 배당을 확인했습니다. 특히 1X2 시장에서 차이가 큽니다.", date: "2시간 전", category: "배당 만족도", verified: true },
  { id: 2, author: "뉴비", sport: "야구", rating: 3.5, title: "가입은 쉬운데 KYC가 좀 번거로움", summary: "가입 자체는 5분이면 되는데, 신분증 인증에 이틀 걸렸습니다.", date: "5시간 전", category: "가입 후기", verified: true },
  { id: 3, author: "글로벌배터", sport: "e스포츠", rating: 5, title: "LoL 배당은 피나클이 최고", summary: "LCK 경기 라인업이 가장 풍부하고, 라이브 베팅도 빠릅니다.", date: "8시간 전", category: "종목별 후기", verified: false }
];

const POPULAR_GUIDES = [
  { id: 1, title: "피나클 가입 방법 (2026년 최신)", icon: FileText, views: 12400, difficulty: "초급" },
  { id: 2, title: "첫 입금하기: 입금 방법 총정리", icon: Zap, views: 8900, difficulty: "초급" },
  { id: 3, title: "배당률 읽는 법: 머니라인 vs 핸디캡", icon: BarChart3, views: 6500, difficulty: "초급" },
  { id: 4, title: "출금 가이드 & 소요시간 안내", icon: Clock, views: 5200, difficulty: "초급" },
  { id: 5, title: "계정 보안 강화: 2FA 설정법", icon: Shield, views: 3100, difficulty: "중급" }
];

const QNA_RECENT = [
  { id: 1, question: "피나클 가입 시 VPN이 필요한가요?", answers: 12, solved: true, category: "가입/인증" },
  { id: 2, question: "출금 신청 후 48시간 넘게 처리 안 됩니다", answers: 8, solved: false, category: "결제/입출금" },
  { id: 3, question: "아시안핸디캡 정산 기준이 궁금합니다", answers: 15, solved: true, category: "배당/정산" }
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
        <Star key={i} className={cn("w-3 h-3", i <= rating ? "text-[hsl(var(--gold))] fill-[hsl(var(--gold))]" : "text-white/10")} />
      ))}
    </div>
  );
}

/* ─── Main Page ─── */
export default function HomePage() {
  const [lang, setLang] = useState<'ko' | 'en'>('ko');
  const t = LANGUAGES[lang];

  return (
    <div className="mesh-gradient overflow-x-hidden min-h-screen">
      {/* Language Toggle */}
      <div className="fixed top-4 right-4 z-20">
        <button
          onClick={() => setLang(prev => (prev === 'ko' ? 'en' : 'ko'))}
          className="btn-primary px-3 py-1 text-sm rounded-full shadow-lg"
        >
          {t.language}
        </button>
      </div>

      {/* Abstract background */}
      <div className="fixed top-20 left-0 w-72 h-72 bg-primary/10 rounded-full blur-[120px] -z-10 animate-float pointer-events-none" />
      <div className="fixed bottom-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[150px] -z-10 pointer-events-none" />

      {/* Hero */}
      <section className="relative py-12 md:py-16 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto space-y-5 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              {t.notices}
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.1]">
              {t.heroTitle}
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
              {t.heroDesc}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href="/guide" className="btn-primary flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> {t.guideBtn}
              </Link>
              <Link href="/odds" className="btn-outline flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> {t.oddsBtn}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Notice Alert Bar */}
      <section className="border-y border-white/[0.04] bg-secondary/10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-1.5 shrink-0">
              <Megaphone className="w-4 h-4 text-[hsl(var(--gold))]" />
              <span className="text-xs font-bold text-[hsl(var(--gold))] uppercase tracking-wider">{t.notices}</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              {NOTICES.map(n => (
                <Link key={n.id} href="/notices" className="flex items-center gap-2 shrink-0 hover:text-primary transition-colors group">
                  {n.urgent && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />}
                  <span className={cn("font-medium", n.urgent ? "text-red-400" : "text-muted-foreground")}>{n.title}</span>
                  <span className="text-[10px] text-muted-foreground/50">{n.date}</span>
                </Link>
              ))}
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
              <SectionHeader
                icon={Swords}
                title={t.todayMatches}
                href="/odds"
                badge={`${TODAY_MATCHES.filter(m => m.live).length} ${t.liveBadge}`}
              />
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
                      {TODAY_MATCHES.map(m => (
                        <tr key={m.id} className="hover:bg-white/[0.03] transition-colors group cursor-pointer">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 shrink-0 uppercase">{m.league}</span>
                              <div>
                                <span className="font-bold text-foreground group-hover:text-primary transition-colors text-[13px]">{m.home}</span>
                                <span className="text-muted-foreground mx-1.5 text-xs">vs</span>
                                <span className="font-bold text-foreground text-[13px]">{m.away}</span>
                              </div>
                            </div>
                          </td>
                          <td className="text-center px-3 py-4"><OddsChange value={m.homeOdds} prev={m.prevHome} /></td>
                          <td className="text-center px-3 py-4"><span className="font-mono text-xs text-muted-foreground">{m.drawOdds > 0 ? m.drawOdds.toFixed(2) : "-"}</span></td>
                          <td className="text-center px-3 py-4"><span className="font-mono text-xs text-muted-foreground">{m.awayOdds.toFixed(2)}</span></td>
                          <td className="text-center px-3 py-4 hidden md:table-cell"><span className="font-mono text-[11px] text-muted-foreground">{m.ahLine} @ {m.ahOdds}</span></td>
                          <td className="text-center px-3 py-4 hidden md:table-cell"><span className="font-mono text-[11px] text-muted-foreground">O{m.ou} @ {m.ouOdds}</span></td>
                          <td className="px-5 py-4 text-right">
                            {m.live ? (
                              <span className="badge-live">
                                <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" /></span>
                                LIVE
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground font-mono">{m.time}</span>
                            )}
                          </td>
                        </tr>
                      ))}
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
              <SectionHeader icon={TrendingUp} title={t.oddsChanges} href="/odds" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ODDS_CHANGES.map(oc => (
                  <div key={oc.id} className="glass-card rounded-xl p-4 flex items-center gap-4 hover:bg-white/[0.03] transition-colors cursor-pointer group">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", oc.direction === "down" ? "bg-red-500/15" : "bg-emerald-500/15")}>
                      {oc.direction === "down" ? <TrendingDown className="w-5 h-5 text-red-400" /> : <TrendingUp className="w-5 h-5 text-emerald-400" />}
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
              <SectionHeader icon={Flame} title={t.hotPosts} href="/community" badge="HOT" />
              <div className="space-y-2">
                {HOT_POSTS.map((post, idx) => (
                  <div key={post.id} className="glass-card rounded-xl p-4 flex items-center gap-4 hover:bg-white/[0.03] transition-colors cursor-pointer group">
                    <span className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0", idx < 3 ? "bg-primary/20 text-primary" : "bg-white/5 text-muted-foreground")}>{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        {post.hot && <Flame className="w-3 h-3 text-orange-400 shrink-0" />}
                        <h4 className="text-sm font-bold truncate group-hover:text-primary transition-colors">{post.title}</h4>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span className="bg-white/5 px-1.5 py-0.5 rounded text-[9px] font-bold">{post.category}</span>
                        <span>{post.author}</span>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-4 text-[10px] text-muted-foreground shrink-0">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.views.toLocaleString()}</span>
                      <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{post.likes}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{post.comments}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Latest Reviews */}
            <section>
              <SectionHeader icon={Star} title={t.latestReviews} href="/reviews" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {NEW_REVIEWS.map(review => (
                  <div key={review.id} className="glass-card-hover rounded-2xl p-5 space-y-3 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <span className="badge-primary">{review.category}</span>
                      {review.verified && (
                        <span className="badge-success"><CheckCircle2 className="w-3 h-3" /> 검증됨</span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm leading-snug">{review.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">{review.summary}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{review.author[0]}</div>
                        <span className="text-xs font-medium">{review.author}</span>
                      </div>
                      <StarRating rating={review.rating} />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground/60">
                      <span>{review.sport}</span>
                      <span>{review.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <aside className="xl:col-span-4 space-y-6">
            {/* Popular Guides */}
            <div className="glass-card rounded-2xl p-5">
              <SectionHeader icon={BookOpen} title={t.guideBtn} href="/guide" />
              <div className="space-y-2">
                {POPULAR_GUIDES.map((guide, idx) => (
                  <Link key={guide.id} href="/guide" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <guide.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold truncate group-hover:text-primary transition-colors">{guide.title}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded text-[9px] font-bold">{guide.difficulty}</span>
                        <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{guide.views.toLocaleString()}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Q&A */}
            <div className="glass-card rounded-2xl p-5">
              <SectionHeader icon={HelpCircle} title={t.recentQna} href="/qna" />
              <div className="space-y-3">
                {QNA_RECENT.map(q => (
                  <Link key={q.id} href="/qna" className="block p-3 rounded-xl hover:bg-white/[0.04] transition-colors group">
                    <div className="flex items-start gap-2.5">
                      <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5", q.solved ? "bg-emerald-500/15" : "bg-[hsl(var(--gold))]/15")}>
                        {q.solved ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <HelpCircle className="w-3 h-3 text-[hsl(var(--gold))]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold line-clamp-2 group-hover:text-primary transition-colors">{q.question}</p>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                          <span className="bg-white/5 px-1.5 py-0.5 rounded font-bold">{q.category}</span>
                          <span className="flex items-center gap-0.5">답변 {q.answers}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Trust Metrics */}
            <div className="glass-card rounded-2xl p-5 bg-gradient-to-br from-primary/[0.05] to-transparent">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-[hsl(var(--gold))]" /> {t.trustMetrics}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[{ label: "검증된 후기", value: "847건", icon: CheckCircle2, color: "text-emerald-400" },
                  { label: "전문가 칼럼", value: "156편", icon: FileText, color: "text-primary" },
                  { label: "해결된 Q&A", value: "2,341건", icon: Target, color: "text-purple-400" },
                  { label: "사기 신고", value: "23건", icon: Shield, color: "text-red-400" }].map(badge => (
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
    </div>
  );
}
