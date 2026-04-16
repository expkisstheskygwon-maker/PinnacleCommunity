"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Trophy, Activity, TrendingUp, ShieldAlert, BarChart3, Users, Languages } from "lucide-react";
import { cn } from "@/lib/utils";

type Language = "ko" | "en";

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
    aiVerdict: "AI 진단:",
    aiVerdictText: "현재의 흐름과 과거 통계를 바탕으로 아스널의 승리 확률은 65%입니다. 피나클의 라인 움직임을 고려할 때, 첫 골을 넣을 가능성이 매우 높습니다.",
    realtimeOdds: "실시간 배당 흐름",
    match: "경기",
    moneyline: "머니라인 (1X2)",
    asianHandicap: "아시안 핸디캡",
    overUnder: "오버/언더",
    trend: "트렌드",
    trendText: "아스널 하락 중"
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
    aiVerdict: "AI Verdict:",
    aiVerdictText: "Arsenal has a 65% win probability based on current momentum and historical stats. Considering Pinnacle's line movement, they are strongly favored to score first.",
    realtimeOdds: "Real-time Odds Flow",
    match: "Match",
    moneyline: "Moneyline (1X2)",
    asianHandicap: "Asian Handicap",
    overUnder: "Over/Under",
    trend: "Trend",
    trendText: "ARS dropping"
  }
};

export default function DashboardPage() {
  const [isProMode, setIsProMode] = useState(false);
  const [lang, setLang] = useState<Language>("ko");

  const t = translations[lang];

  const toggleLang = () => {
    setLang(prev => prev === "ko" ? "en" : "ko");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation Layer */}
      <header className="border-b border-muted bg-secondary/30 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            <h1 className="font-bold text-xl tracking-tight">{t.title}</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <button 
              onClick={toggleLang}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-muted bg-background/50 hover:bg-secondary/50 transition-all text-xs font-semibold"
            >
              <Languages className="w-4 h-4 text-primary" />
              <span className="uppercase">{lang === "ko" ? "English" : "한국어"}</span>
            </button>

            <div className="flex items-center gap-3 bg-secondary/50 px-4 py-2 rounded-full border border-muted/50">
              <span className={cn("text-sm font-medium transition-colors", !isProMode ? "text-primary" : "text-muted-foreground")}>
                {t.beginner}
              </span>
              <Switch checked={isProMode} onCheckedChange={setIsProMode} />
              <span className={cn("text-sm font-medium transition-colors", isProMode ? "text-primary" : "text-muted-foreground")}>
                {t.pro}
              </span>
            </div>
            
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground ml-6">
              <a href="#" className="text-foreground hover:text-primary transition">{t.liveOdds}</a>
              <a href="#" className="hover:text-primary transition">{t.matchAnalysis}</a>
              <a href="#" className="hover:text-primary transition">{t.community}</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Banner Section */}
        <section className="mb-10 text-center space-y-4">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            {isProMode ? t.bannerTitle.pro : t.bannerTitle.beginner}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {isProMode ? t.bannerSub.pro : t.bannerSub.beginner}
          </p>
        </section>

        {/* Content Toggle Layer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {!isProMode ? (
              <BeginnerView t={t} />
            ) : (
              <ProView t={t} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-xl border border-muted bg-secondary/20 p-6 flex flex-col gap-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> {t.activeCommunity}
              </h3>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 items-start border-b border-muted pb-4 last:border-0 hover:bg-secondary/10 p-2 rounded-lg transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      U{i}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{t.predictionShared.replace("{id}", (i * 102).toString())}</p>
                      <p className="text-xs text-muted-foreground mt-1">"{t.predictionText}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function BeginnerView({ t }: { t: any }) {
  return (
    <div className="rounded-xl border border-muted bg-gradient-to-br from-secondary/40 to-background p-6">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="text-primary w-6 h-6" />
        <h3 className="text-xl font-bold">{t.aiSummary}</h3>
      </div>
      
      <div className="space-y-4">
        {/* Mock Match Card */}
        <div className="bg-background rounded-lg border border-muted overflow-hidden transition hover:border-primary/50 relative">
          <div className="p-4 border-b border-muted bg-secondary/20 flex justify-between items-center">
            <span className="text-xs font-semibold tracking-wider text-primary uppercase">Premier League</span>
            <span className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              {t.liveNow}
            </span>
          </div>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex-1 text-center font-bold text-xl">Arsenal</div>
              <div className="px-4 text-xl font-black text-primary bg-primary/10 rounded-full py-1">VS</div>
              <div className="flex-1 text-center font-bold text-xl">Chelsea</div>
            </div>
            
            <div className="bg-primary/5 rounded-lg p-4 flex gap-3 text-sm border-l-4 border-primary shadow-inner">
              <ShieldAlert className="w-5 h-5 text-primary shrink-0" />
              <div>
                <strong className="block mb-1 text-foreground">{t.aiVerdict}</strong>
                <p className="text-muted-foreground leading-relaxed">{t.aiVerdictText}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProView({ t }: { t: any }) {
  return (
    <div className="rounded-xl border border-muted bg-background shadow-lg overflow-hidden">
      <div className="p-6 border-b border-muted flex items-center justify-between bg-secondary/10">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-primary w-6 h-6" />
          <h3 className="text-xl font-bold">{t.realtimeOdds}</h3>
        </div>
        <div className="flex items-center gap-2 text-xs bg-background px-3 py-1 rounded-full border border-muted">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground font-mono">Lat: 42ms</span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
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
            <tr className="border-b border-muted/50 hover:bg-secondary/10 transition group">
              <td className="px-6 py-4 font-medium">
                ARS vs CHE <br/>
                <span className="text-xs text-muted-foreground font-mono">EPL • 23:00</span>
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <span className="bg-secondary/50 px-2 py-1 rounded text-primary border border-primary/20 shadow-sm font-mono font-semibold">1.85</span>
                  <span className="bg-secondary/50 px-2 py-1 rounded font-mono">3.65</span>
                  <span className="bg-secondary/50 px-2 py-1 rounded text-red-400 font-mono">4.10</span>
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <div className="flex flex-col items-center justify-center p-1 rounded hover:bg-background">
                  <span className="font-semibold text-primary font-mono">-0.5</span>
                  <span className="text-xs text-muted-foreground font-mono">@ 1.88</span>
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <div className="flex flex-col items-center justify-center p-1 rounded hover:bg-background">
                  <span className="font-semibold font-mono">O 2.5</span>
                  <span className="text-xs text-muted-foreground font-mono">@ 1.95</span>
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <span className="text-xs font-medium text-primary flex items-center justify-end gap-1 bg-primary/10 px-2 py-1 rounded-full border border-primary/20 inline-flex">
                  <TrendingUp className="w-3 h-3" /> {t.trendText}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
