"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Trophy, Activity, TrendingUp, ShieldAlert, BarChart3, Users, Languages, MessageSquare, Microscope, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

type Language = "ko" | "en";
type ActiveTab = "live" | "analysis" | "community";

const translations = {
  ko: {
    title: "피나클 커뮤니티",
    beginner: "초보자",
    pro: "전문가",
    liveOdds: "라이브 배당",
    matchAnalysis: "경기 분석",
    community: "커뮤니티",
    bannerTitle: {
      beginner: "스마트한 베팅의 시작",
      pro: "고급 마켓 및 데이터 분석"
    },
    bannerSub: {
      beginner: "당신이 좋아하는 스포츠를 위한 AI 기반 경기 요약과 시각적 인사이트.",
      pro: "아시안 핸디캡 변동, 오버/언더 격차 및 실시간 피나클 API 스트림 심층 분석."
    },
    activeCommunity: "활성 커뮤니티",
    predictionShared: "유저{id}님이 예측을 공유했습니다",
    predictionText: "경기 시작 전 배당이 떨어지는 추세를 볼 때 아스널의 승리가 유력해 보입니다.",
    aiSummary: "AI 경기 요약",
    liveNow: "라이브 중",
    upcoming: "예정됨",
    aiVerdict: "AI 진단:",
    realtimeOdds: "실시간 배당 흐름",
    match: "경기",
    moneyline: "머니라인 (1X2)",
    asianHandicap: "아시안 핸디캡",
    overUnder: "오버/언더",
    trend: "트렌드",
    analysisTitle: "전문가 경기 분석",
    analysisSubtitle: "상세 통계 및 심층 분석 리포트",
    communityTitle: "커뮤니티 포럼",
    communitySubtitle: "베터들 간의 자유로운 전략 공유",
    writePost: "게시글 작성",
    loadMore: "더 보기"
  },
  en: {
    title: "Pinnacle Community",
    beginner: "Beginner",
    pro: "Pro",
    liveOdds: "Live Odds",
    matchAnalysis: "Match Analysis",
    community: "Community",
    bannerTitle: {
      beginner: "Smart Betting Made Simple",
      pro: "Advanced Markets & Analytics"
    },
    bannerSub: {
      beginner: "AI-powered match summaries and visual insights for your favorite sports.",
      pro: "Deep dive into Asian Handicap movements, over/under disparities, and real-time Pinnacle API streams."
    },
    activeCommunity: "Active Community",
    predictionShared: "User{id} shared a prediction",
    predictionText: "Arsenal looks strong on standard lines given the current odds dropping before kickoff.",
    aiSummary: "AI Match Summary",
    liveNow: "Live Now",
    upcoming: "Upcoming",
    aiVerdict: "AI Verdict:",
    realtimeOdds: "Real-time Odds Flow",
    match: "Match",
    moneyline: "Moneyline (1X2)",
    asianHandicap: "Asian Handicap",
    overUnder: "Over/Under",
    trend: "Trend",
    analysisTitle: "Expert Match Analysis",
    analysisSubtitle: "Detailed statistics and deep analysis reports",
    communityTitle: "Community Forum",
    communitySubtitle: "Share strategies with fellow bettors",
    writePost: "Write Post",
    loadMore: "Load More"
  }
};

const MOCK_MATCHES = [
  { id: 1, home: "Arsenal", away: "Chelsea", league: "EPL", time: "23:00", live: true, odds: { ml: [1.85, 3.65, 4.10], ah: "-0.5 @ 1.88", ou: "O 2.5 @ 1.95" }, trend: "ARS dropping", verdict: "Arsenal has a 65% win probability based on current momentum." },
  { id: 2, home: "Man City", away: "Liverpool", league: "EPL", time: "01:30", live: false, odds: { ml: [2.10, 3.80, 3.25], ah: "-0.25 @ 1.95", ou: "O 3.0 @ 1.90" }, trend: "Steady", verdict: "High-scoring game expected. Over 2.5 is a solid statistics-based pick." },
  { id: 3, home: "Real Madrid", away: "Barcelona", league: "La Liga", time: "04:00", live: false, odds: { ml: [2.05, 3.50, 3.45], ah: "-0.5 @ 2.05", ou: "U 2.5 @ 2.10" }, trend: "BAR rising", verdict: "Real Madrid's home advantage and recent form give them a slight edge." },
  { id: 4, home: "Bayern", away: "Dortmund", league: "Bundesliga", time: "22:30", live: true, odds: { ml: [1.55, 4.50, 5.20], ah: "-1.25 @ 1.92", ou: "O 3.5 @ 2.05" }, trend: "BAY dropping", verdict: "Bayern usually dominates 'Der Klassiker' at home. High probability of Home win." },
  { id: 5, home: "Inter", away: "AC Milan", league: "Serie A", time: "03:45", live: false, odds: { ml: [2.30, 3.20, 3.10], ah: "0 @ 1.85", ou: "U 2.5 @ 1.88" }, trend: "Draw rising", verdict: "A tight tactical battle. Prediction leans toward a low-scoring draw." },
  { id: 6, home: "PSG", away: "Monaco", league: "Ligue 1", time: "05:00", live: false, odds: { ml: [1.40, 4.80, 6.50], ah: "-1.5 @ 2.02", ou: "O 2.5 @ 1.75" }, trend: "PSG steady", verdict: "Monaco's weak defense might struggle against PSG's star-studded frontline." },
  { id: 7, home: "Tottenham", away: "Man Utd", league: "EPL", time: "21:00", live: false, odds: { ml: [2.45, 3.40, 2.75], ah: "0 @ 1.98", ou: "O 2.5 @ 1.85" }, trend: "MUN dropping", verdict: "United's counter-attacking style could exploit Spurs' high defensive line." },
];

const MOCK_ANALYSIS = [
  { id: 1, title: "ARS vs CHE: Tactical Breakdown", author: "Coach Kim", date: "2024-04-17", views: 1240, comments: 24, summary: "Focusing on Arsenal's midfield control versus Chelsea's transition speed..." },
  { id: 2, title: "The 'Over' Trend in Bundesliga", author: "DataWiz", date: "2024-04-16", views: 890, comments: 15, summary: "Why scoring rates in Germany are hitting a 5-year high this season..." },
  { id: 3, title: "Asian Handicap Secrets", author: "ProBettor", date: "2024-04-15", views: 2300, comments: 56, summary: "Mastering the +0.25 and -0.75 lines for consistent value..." },
];

const MOCK_POSTS = [
  { id: 1, user: "ValueSeeker", content: "Anyone else seeing the value on Monaco +1.5? PSG is missing two key defenders tonight.", likes: 12, replies: 5 },
  { id: 2, user: "StatsGuru", content: "Lazio's corners stats have been incredible lately. Definitely something to watch for live betting.", likes: 8, replies: 2 },
  { id: 3, user: "GlobalBet", content: "Great community here! Thanks for the tips on the EPL matches earlier.", likes: 25, replies: 0 },
];

export default function DashboardPage() {
  const [isProMode, setIsProMode] = useState(false);
  const [lang, setLang] = useState<Language>("ko");
  const [activeTab, setActiveTab] = useState<ActiveTab>("live");

  const t = translations[lang];

  return (
    <div className="min-h-screen bg-background flex flex-col mesh-gradient overflow-x-hidden">
      {/* Navigation Layer */}
      <header className="border-b border-white/5 bg-secondary/10 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab("live")}>
            <div className="bg-primary/20 p-2 rounded-xl group-hover:scale-110 transition-transform">
              <Trophy className="h-6 w-6 text-primary animate-pulse-slow" />
            </div>
            <h1 className="font-bold text-2xl tracking-tighter text-glow">{t.title}</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLang(prev => prev === "ko" ? "en" : "ko")}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-sm font-semibold group"
            >
              <Languages className="w-4 h-4 text-primary group-hover:rotate-12 transition-transform" />
              <span className="uppercase">{lang === "ko" ? "English" : "한국어"}</span>
            </button>

            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <span className={cn("text-sm font-bold transition-colors", !isProMode ? "text-primary" : "text-muted-foreground")}>{t.beginner}</span>
              <Switch checked={isProMode} onCheckedChange={setIsProMode} />
              <span className={cn("text-sm font-bold transition-colors", isProMode ? "text-primary" : "text-muted-foreground")}>{t.pro}</span>
            </div>
            
            <nav className="hidden lg:flex items-center gap-2 text-sm font-medium ml-6">
              {[
                { id: "live", label: t.liveOdds, icon: Activity },
                { id: "analysis", label: t.matchAnalysis, icon: BarChart3 },
                { id: "community", label: t.community, icon: Users }
              ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id as ActiveTab)} 
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                    activeTab === item.id 
                      ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(59,130,246,0.3)]" 
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 relative">
        {/* Abstract Background Elements */}
        <div className="absolute top-20 left-0 w-72 h-72 bg-primary/10 rounded-full blur-[120px] -z-10 animate-float" />
        <div className="absolute bottom-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[150px] -z-10" />

        {activeTab === "live" && (
          <>
            <section className="mb-16 text-center space-y-6 relative">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold animate-fade-in">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                LIVE UPDATES
              </div>
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-none">
                {isProMode ? (
                  <>ADVANCED <span className="text-primary italic">MARKETS</span></>
                ) : (
                  <>SMART <span className="text-primary italic">BETTING</span></>
                )}
              </h2>
              <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                {isProMode ? t.bannerSub.pro : t.bannerSub.beginner}
              </p>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-8">
                {!isProMode ? <BeginnerView t={t} /> : <ProView t={t} />}
              </div>
              <div className="lg:col-span-4">
                <Sidebar t={t} />
              </div>
            </div>
          </>
        )}

        {activeTab === "analysis" && <AnalysisView t={t} />}
        {activeTab === "community" && <CommunityForumView t={t} />}
      </main>

      <footer className="border-t border-white/5 py-12 bg-secondary/20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg">{t.title}</span>
          </div>
          <p className="text-muted-foreground text-sm">© 2024 Pinnacle Community. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function Sidebar({ t }: { t: any }) {
  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 flex flex-col gap-6">
        <h3 className="font-bold text-lg flex items-center gap-2 px-2">
          <Users className="w-5 h-5 text-primary" /> 
          {t.activeCommunity}
        </h3>
        <div className="space-y-2">
          {[102, 455, 789, 12].map((id) => (
            <div key={id} className="flex gap-4 items-start p-3 rounded-xl transition-all hover:bg-white/5 cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                U
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  {t.predictionShared.replace("{id}", id.toString())}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed italic">
                  "{t.predictionText}"
                </p>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full py-3 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary hover:text-primary-foreground transition-all uppercase tracking-widest">
          View All Feed
        </button>
      </div>
      
      {/* Featured Insight Card */}
      <div className="glass-card rounded-2xl p-6 bg-primary/5 border-primary/20 overflow-hidden relative group">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/40 transition-colors" />
        <h4 className="font-bold mb-2 relative z-10 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          Market Insight
        </h4>
        <p className="text-sm text-muted-foreground relative z-10 mb-4">
          Asian Handicap lines for upcoming EPL matches are showing significant movement. Log in to see detailed flow.
        </p>
        <button className="text-xs font-bold text-primary hover:underline relative z-10">Read Analysis →</button>
      </div>
    </div>
  );
}

function BeginnerView({ t }: { t: any }) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Activity className="text-primary w-5 h-5" />
          </div>
          <h3 className="text-2xl font-black tracking-tight">{t.aiSummary}</h3>
        </div>
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
          {MOCK_MATCHES.length} Matches Found
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_MATCHES.map((m) => (
          <div key={m.id} className="glass-card rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10 group">
            <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
              <span className="text-[10px] font-black tracking-widest text-primary uppercase bg-primary/10 px-2 py-0.5 rounded border border-primary/20">{m.league}</span>
              <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5 bg-background/50 px-2 py-0.5 rounded-full">
                {m.live ? (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span className="text-red-500">{t.liveNow}</span>
                  </>
                ) : (
                  <>{t.upcoming} • {m.time}</>
                )}
              </span>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center font-bold text-lg border border-white/5 group-hover:scale-110 transition-transform">
                    {m.home[0]}
                  </div>
                  <span className="font-bold text-sm text-center line-clamp-1">{m.home}</span>
                </div>
                <div className="px-4 text-[10px] font-black text-primary bg-primary/10 rounded-full py-1 border border-primary/10 self-center">VS</div>
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center font-bold text-lg border border-white/5 group-hover:scale-110 transition-transform">
                    {m.away[0]}
                  </div>
                  <span className="font-bold text-sm text-center line-clamp-1">{m.away}</span>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 flex gap-4 text-sm border border-white/1 flex-col sm:flex-row shadow-inner">
                <div className="bg-primary/20 w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <strong className="block mb-1 text-primary text-xs uppercase tracking-wider">{t.aiVerdict}</strong>
                  <p className="text-muted-foreground text-xs leading-relaxed italic line-clamp-2">"{m.verdict}"</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProView({ t }: { t: any }) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <TrendingUp className="text-primary w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold tracking-tight">{t.realtimeOdds}</h3>
        </div>
        <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest">Connected • 42ms</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] text-muted-foreground bg-white/5 uppercase tracking-widest border-b border-white/5 font-bold">
            <tr>
              <th className="px-6 py-5">{t.match}</th>
              <th className="px-6 py-5">{t.moneyline}</th>
              <th className="px-6 py-5 text-center">{t.asianHandicap}</th>
              <th className="px-6 py-5 text-center">{t.overUnder}</th>
              <th className="px-6 py-5 text-right font-medium">{t.trend}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {MOCK_MATCHES.map((m) => (
              <tr key={m.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-5">
                  <div className="font-bold text-foreground group-hover:text-primary transition-colors">{m.home} vs {m.away}</div>
                  <div className="text-[10px] text-muted-foreground font-mono uppercase mt-1 opacity-70">{m.league} • {m.time}</div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex gap-1.5">
                    {m.odds.ml.map((odd, idx) => (
                      <span key={idx} className="bg-white/5 px-2.5 py-1 rounded text-xs font-mono border border-white/5 hover:border-primary/30 transition-colors cursor-pointer text-primary">
                        {odd}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-5 text-center font-mono text-xs text-muted-foreground">{m.odds.ah}</td>
                <td className="px-6 py-5 text-center font-mono text-xs text-muted-foreground">{m.odds.ou}</td>
                <td className="px-6 py-5 text-right">
                  <div className="inline-flex items-center gap-1.5 bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                    <TrendingUp className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-black text-primary uppercase whitespace-nowrap">{m.trend}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AnalysisView({ t }: { t: any }) {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-black tracking-tighter">{t.analysisTitle}</h2>
        <p className="text-muted-foreground text-lg leading-relaxed">{t.analysisSubtitle}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {MOCK_ANALYSIS.map((a) => (
          <div key={a.id} className="glass-card rounded-2xl group overflow-hidden hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5">
            <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/40 relative flex items-center justify-center overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
               <Microscope className="w-16 h-16 text-primary/30 group-hover:scale-125 transition-transform duration-700 blur-[1px] group-hover:blur-0" />
               <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Premium</div>
            </div>
            <div className="p-8 space-y-4">
              <h4 className="font-bold text-xl leading-tight group-hover:text-primary transition-colors line-clamp-2">{a.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 italic opacity-80 decoration-primary/30 underline-offset-4 decoration-1">"{a.summary}"</p>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-6 border-t border-white/5 font-black uppercase tracking-widest">
                <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-primary" /> {a.date}</div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {a.views}</span>
                  <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {a.comments}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CommunityForumView({ t }: { t: any }) {
  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex items-center justify-between border-b border-white/5 pb-8">
        <div className="space-y-2">
          <h2 className="text-4xl font-black tracking-tighter">{t.communityTitle}</h2>
          <p className="text-muted-foreground text-lg">{t.communitySubtitle}</p>
        </div>
        <button className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] uppercase tracking-widest text-xs">
          {t.writePost}
        </button>
      </div>
      <div className="space-y-6">
        {MOCK_POSTS.map((p) => (
          <div key={p.id} className="glass-card p-8 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group space-y-6 border-l-4 border-l-transparent hover:border-l-primary">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary border border-primary/20 text-xl group-hover:rotate-6 transition-transform">
                  {p.user[0]}
                </div>
                <div>
                  <p className="font-bold text-lg group-hover:text-primary transition-colors">{p.user}</p>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-tighter opacity-60">Posted 2 hours ago</p>
                </div>
              </div>
              <div className="bg-white/5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-muted-foreground">General</div>
            </div>
            <p className="text-foreground text-base leading-relaxed opacity-90">{p.content}</p>
            <div className="flex items-center gap-8 pt-4 border-t border-white/5">
              <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group/btn">
                <Trophy className="w-4 h-4 group-hover/btn:scale-125 transition-transform" /> 
                Insightful ({p.likes})
              </button>
              <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group/btn">
                <MessageSquare className="w-4 h-4 group-hover/btn:scale-125 transition-transform" /> 
                Reply ({p.replies})
              </button>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full py-6 rounded-2xl border-2 border-dashed border-white/5 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all font-black uppercase tracking-widest text-xs shadow-inner">
        {t.loadMore}
      </button>
    </div>
  );
}
