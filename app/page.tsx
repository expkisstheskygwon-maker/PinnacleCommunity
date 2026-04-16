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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation Layer */}
      <header className="border-b border-muted bg-secondary/30 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab("live")}>
            <Trophy className="h-6 w-6 text-primary" />
            <h1 className="font-bold text-xl tracking-tight">{t.title}</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLang(prev => prev === "ko" ? "en" : "ko")}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-muted bg-background/50 hover:bg-secondary/50 transition-all text-xs font-semibold"
            >
              <Languages className="w-4 h-4 text-primary" />
              <span className="uppercase">{lang === "ko" ? "English" : "한국어"}</span>
            </button>

            <div className="flex items-center gap-3 bg-secondary/50 px-4 py-2 rounded-full border border-muted/50">
              <span className={cn("text-sm font-medium transition-colors", !isProMode ? "text-primary" : "text-muted-foreground")}>{t.beginner}</span>
              <Switch checked={isProMode} onCheckedChange={setIsProMode} />
              <span className={cn("text-sm font-medium transition-colors", isProMode ? "text-primary" : "text-muted-foreground")}>{t.pro}</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground ml-6">
              <button onClick={() => setActiveTab("live")} className={cn("transition", activeTab === "live" ? "text-foreground font-bold" : "hover:text-primary")}>{t.liveOdds}</button>
              <button onClick={() => setActiveTab("analysis")} className={cn("transition", activeTab === "analysis" ? "text-foreground font-bold" : "hover:text-primary")}>{t.matchAnalysis}</button>
              <button onClick={() => setActiveTab("community")} className={cn("transition", activeTab === "community" ? "text-foreground font-bold" : "hover:text-primary")}>{t.community}</button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {activeTab === "live" && (
          <>
            <section className="mb-10 text-center space-y-4">
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">{isProMode ? t.bannerTitle.pro : t.bannerTitle.beginner}</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{isProMode ? t.bannerSub.pro : t.bannerSub.beginner}</p>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {!isProMode ? <BeginnerView t={t} /> : <ProView t={t} />}
              </div>
              <Sidebar t={t} />
            </div>
          </>
        )}

        {activeTab === "analysis" && <AnalysisView t={t} />}
        {activeTab === "community" && <CommunityForumView t={t} />}
      </main>
    </div>
  );
}

function Sidebar({ t }: { t: any }) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-muted bg-secondary/20 p-6 flex flex-col gap-4">
        <h3 className="font-semibold flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> {t.activeCommunity}</h3>
        <div className="space-y-4">
          {[102, 455, 789, 12].map((id) => (
            <div key={id} className="flex gap-3 items-start border-b border-muted pb-4 last:border-0 hover:bg-secondary/10 p-2 rounded-lg transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">U</div>
              <div>
                <p className="text-sm font-medium text-foreground">{t.predictionShared.replace("{id}", id.toString())}</p>
                <p className="text-xs text-muted-foreground mt-1">"{t.predictionText}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BeginnerView({ t }: { t: any }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Activity className="text-primary w-6 h-6" />
        <h3 className="text-xl font-bold">{t.aiSummary}</h3>
      </div>
      {MOCK_MATCHES.map((m) => (
        <div key={m.id} className="bg-background rounded-lg border border-muted overflow-hidden transition hover:border-primary/50 relative">
          <div className="p-4 border-b border-muted bg-secondary/20 flex justify-between items-center">
            <span className="text-xs font-semibold tracking-wider text-primary uppercase">{m.league}</span>
            <span className="text-xs text-muted-foreground flex items-center gap-2">
              {m.live && <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span></span>}
              {m.live ? t.liveNow : `${t.upcoming} • ${m.time}`}
            </span>
          </div>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex-1 text-center font-bold text-xl">{m.home}</div>
              <div className="px-4 text-sm font-black text-primary bg-primary/10 rounded-full py-1">VS</div>
              <div className="flex-1 text-center font-bold text-xl">{m.away}</div>
            </div>
            <div className="bg-primary/5 rounded-lg p-4 flex gap-3 text-sm border-l-4 border-primary">
              <ShieldAlert className="w-5 h-5 text-primary shrink-0" />
              <div><strong className="block mb-1 text-foreground">{t.aiVerdict}</strong><p className="text-muted-foreground">{m.verdict}</p></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProView({ t }: { t: any }) {
  return (
    <div className="rounded-xl border border-muted bg-background shadow-lg overflow-hidden">
      <div className="p-6 border-b border-muted flex items-center justify-between bg-secondary/10">
        <div className="flex items-center gap-2"><TrendingUp className="text-primary w-6 h-6" /> <h3 className="text-xl font-bold">{t.realtimeOdds}</h3></div>
        <span className="text-muted-foreground font-mono text-xs">Lat: 42ms</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground bg-secondary/30 uppercase border-b border-muted">
            <tr>
              <th className="px-6 py-4 font-medium">{t.match}</th>
              <th className="px-6 py-4 font-medium">{t.moneyline}</th>
              <th className="px-6 py-4 font-medium text-center">{t.asianHandicap}</th>
              <th className="px-6 py-4 font-medium text-center">{t.overUnder}</th>
              <th className="px-6 py-4 font-medium text-right">{t.trend}</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_MATCHES.map((m) => (
              <tr key={m.id} className="border-b border-muted/50 hover:bg-secondary/10 transition group">
                <td className="px-6 py-4 font-medium">{m.home} vs {m.away} <br/><span className="text-xs text-muted-foreground font-mono">{m.league} • {m.time}</span></td>
                <td className="px-6 py-4"><div className="flex gap-2">
                  <span className="bg-secondary/60 px-2 py-1 rounded text-primary font-mono">{m.odds.ml[0]}</span>
                  <span className="bg-secondary/60 px-2 py-1 rounded font-mono">{m.odds.ml[1]}</span>
                  <span className="bg-secondary/60 px-2 py-1 rounded font-mono">{m.odds.ml[2]}</span>
                </div></td>
                <td className="px-6 py-4 text-center font-mono">{m.odds.ah}</td>
                <td className="px-6 py-4 text-center font-mono">{m.odds.ou}</td>
                <td className="px-6 py-4 text-right">
                  <span className="text-[10px] font-bold text-primary flex items-center justify-end gap-1 bg-primary/10 px-2 py-1 rounded-full border border-primary/20 inline-flex">
                    <TrendingUp className="w-3 h-3" /> {m.trend}
                  </span>
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t.analysisTitle}</h2>
        <p className="text-muted-foreground">{t.analysisSubtitle}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_ANALYSIS.map((a) => (
          <div key={a.id} className="group rounded-xl border border-muted bg-background hover:border-primary/50 transition-all overflow-hidden cursor-pointer">
            <div className="h-40 bg-secondary/30 relative flex items-center justify-center overflow-hidden">
               <Microscope className="w-12 h-12 text-primary/20 group-hover:scale-110 transition-transform" />
               <div className="absolute top-4 left-4 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded uppercase">Premium</div>
            </div>
            <div className="p-6 space-y-3">
              <h4 className="font-bold text-lg group-hover:text-primary transition-colors">{a.title}</h4>
              <p className="text-sm text-muted-foreground line-clamp-2">{a.summary}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-4">
                <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {a.date}</div>
                <div className="flex items-center gap-3"><span>{a.views} views</span><span>{a.comments} comments</span></div>
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
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-end justify-between border-b border-muted pb-6">
        <div><h2 className="text-3xl font-bold tracking-tight">{t.communityTitle}</h2><p className="text-muted-foreground">{t.communitySubtitle}</p></div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition">{t.writePost}</button>
      </div>
      <div className="space-y-4">
        {MOCK_POSTS.map((p) => (
          <div key={p.id} className="p-6 rounded-xl border border-muted bg-secondary/10 hover:bg-secondary/20 transition cursor-pointer space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">V</div>
              <div><p className="font-bold">{p.user}</p><p className="text-xs text-muted-foreground">2 hours ago</p></div>
            </div>
            <p className="text-foreground leading-relaxed">{p.content}</p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground translate-y-2">
              <button className="flex items-center gap-1 hover:text-primary transition decoration-transparent font-medium">Like ({p.likes})</button>
              <button className="flex items-center gap-1 hover:text-primary transition font-medium"><MessageSquare className="w-4 h-4" /> Reply ({p.replies})</button>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full py-4 border border-dashed border-muted rounded-xl text-muted-foreground hover:text-primary hover:border-primary transition font-medium">{t.loadMore}</button>
    </div>
  );
}
