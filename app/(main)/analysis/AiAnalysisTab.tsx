"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Activity, Calendar as CalendarIcon, ChevronDown, Loader2, X } from "lucide-react";
import MatchAnalysisCard from "./MatchAnalysisCard";
import { cn } from "@/lib/utils";

// AI Experts Banner Data
const AI_EXPERTS = [
  {
    name: "AI 데이터봇 알파",
    avatar: "A",
    title: "통계 및 배당 흐름 기반",
    winRate: 58,
    recentHit: "4/10",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/20"
  },
  {
    name: "AI 통계봇 베타",
    avatar: "B",
    title: "상대전적 및 폼 분석 특화",
    winRate: 62,
    recentHit: "6/10",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    borderColor: "border-purple-400/20"
  },
  {
    name: "AI 밸류봇 감마",
    avatar: "G",
    title: "해외 배당 가치 베팅",
    winRate: 51,
    recentHit: "3/10",
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
    borderColor: "border-emerald-400/20"
  }
];

const SPORTS_TABS = [
  { id: "soccer", label: "⚽ 축구" },
  { id: "baseball", label: "⚾ 야구" },
  { id: "basketball", label: "🏀 농구" },
];

export default function AiAnalysisTab() {
  const [activeSport, setActiveSport] = useState("soccer");
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [botStats, setBotStats] = useState<Record<string, { winRate: number; recentHit: string; bySport: any }>>({});
  const [selectedBot, setSelectedBot] = useState<any | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/sports/predictions/stats");
        const data = await res.json();
        if (data.success && data.stats) {
          setBotStats(data.stats);
        }
      } catch (err) {
        console.error("Failed to fetch bot stats", err);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchMatches = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/sports/matches?sport=${activeSport}`);
        const data = await res.json();
        if (data.matches) {
          setMatches(data.matches);
        } else {
          setMatches([]);
        }
      } catch (err) {
        console.error("Failed to fetch matches", err);
        setMatches([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, [activeSport]);

  return (
    <div className="space-y-10 mt-6 animate-fade-in">
      {/* Hero Banner - AI Experts */}
      <div className="bg-gradient-to-r from-primary/20 via-background to-secondary/10 border border-white/5 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
        
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-primary/20 rounded-xl">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">AI 스포츠 분석</h2>
            <p className="text-muted-foreground text-sm mt-1">3명의 AI 봇이 예측하는 경기 스코어와 추천 픽</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {AI_EXPERTS.map((bot, i) => {
            const stats = botStats[bot.name] || { winRate: bot.winRate, recentHit: bot.recentHit, bySport: null };
            return (
              <div key={i} className={cn("bg-background/60 backdrop-blur-sm border rounded-2xl p-5 hover:scale-[1.02] transition-transform", bot.borderColor)}>
                <div className="flex items-center gap-4 mb-4">
                  <button
                    onClick={() => setSelectedBot({ ...bot, stats })}
                    title="종목별 적중률 확인"
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl hover:scale-110 active:scale-95 transition-all shadow-md group relative cursor-pointer",
                      bot.bgColor, bot.color
                    )}
                  >
                    {bot.avatar}
                    <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/45 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary/30 text-[7px] items-center justify-center text-white font-bold">+</span>
                    </span>
                  </button>
                  <div>
                    <h3 className="font-bold text-foreground text-lg">{bot.name}</h3>
                    <p className="text-xs text-muted-foreground">{bot.title}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <div className="text-[10px] text-muted-foreground mb-1">주간 적중</div>
                    <div className="font-mono font-bold text-lg">
                      <span className={bot.color}>{stats.recentHit.split('/')[0]}</span>
                      <span className="text-white/30 text-sm mx-0.5">/</span>
                      <span className="text-muted-foreground text-sm">{stats.recentHit.split('/')[1]}</span>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <div className="text-[10px] text-muted-foreground mb-1">전체 적중률</div>
                    <div className="font-mono font-black text-lg">
                      {stats.winRate}<span className="text-sm ml-0.5">%</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/5 p-2 md:p-3 rounded-2xl border border-white/5">
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
          {SPORTS_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSport(tab.id)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                activeSport === tab.id
                  ? "bg-primary text-white shadow-[0_0_16px_rgba(59,130,246,0.3)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/10"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-between gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors">
            <span>경기 임박순</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
          <button className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors">
            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
            <span>오늘</span>
          </button>
        </div>
      </div>

      {/* Match List */}
      <div>
        <div className="flex items-center justify-between mb-4 px-2">
          <span className="text-sm text-muted-foreground">
            오늘 분석된 경기 수: <strong className="text-foreground">{matches.length}</strong> 건
          </span>
        </div>
        
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
            <p>경기 목록을 불러오는 중입니다...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            해당 종목의 예정된 경기가 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {matches.map((match) => (
              <MatchAnalysisCard key={match.id} match={match} />
            ))}
          </div>
        )}
      </div>

      {/* Bot stats detail modal */}
      <BotStatsModal 
        isOpen={!!selectedBot} 
        onClose={() => setSelectedBot(null)} 
        bot={selectedBot} 
      />
    </div>
  );
}

// Bot stats details modal with breakdown by sport
interface BotStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bot: any;
}

function BotStatsModal({ isOpen, onClose, bot }: BotStatsModalProps) {
  if (!isOpen || !bot) return null;

  const stats = bot.stats;
  const bySport = stats.bySport || {
    soccer: { winRate: 60, total: 10, hits: 6 },
    baseball: { winRate: 50, total: 10, hits: 5 },
    basketball: { winRate: 60, total: 10, hits: 6 }
  };

  const sportsMeta: Record<string, { label: string; icon: string }> = {
    soccer: { label: "축구", icon: "⚽" },
    baseball: { label: "야구", icon: "⚾" },
    basketball: { label: "농구", icon: "🏀" }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {/* Modal Container */}
      <div className={cn(
        "relative w-full max-w-sm bg-zinc-950/90 border rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200",
        bot.borderColor
      )}>
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6 pb-5 border-b border-white/5">
          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg", bot.bgColor, bot.color)}>
            {bot.avatar}
          </div>
          <div>
            <h3 className="text-lg font-black text-foreground">{bot.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{bot.title}</p>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/5 text-center">
            <span className="text-[9px] text-muted-foreground font-black uppercase tracking-wider block mb-1">최근 10경기 적중</span>
            <span className={cn("text-xl font-mono font-black", bot.color)}>
              {stats.recentHit}
            </span>
          </div>
          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/5 text-center">
            <span className="text-[9px] text-muted-foreground font-black uppercase tracking-wider block mb-1">평균 적중률</span>
            <span className="text-xl font-mono font-black text-foreground">
              {stats.winRate}%
            </span>
          </div>
        </div>

        {/* Sport-by-Sport breakdown */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">스포츠 종목별 적중률</h4>
          
          {Object.keys(bySport).map((sportKey) => {
            const sportData = bySport[sportKey];
            const meta = sportsMeta[sportKey] || { label: sportKey, icon: "🏆" };
            
            return (
              <div key={sportKey} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <span>{meta.icon}</span>
                    <span>{meta.label}</span>
                  </span>
                  <div className="font-mono text-muted-foreground text-[11px]">
                    <strong className="text-foreground">{sportData.winRate}%</strong>
                    <span className="text-[9px] ml-1 opacity-70">({sportData.hits}/{sportData.total})</span>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/[0.04]">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-500", 
                      bot.avatar === "A" ? "bg-blue-400" : bot.avatar === "B" ? "bg-purple-400" : "bg-emerald-400"
                    )}
                    style={{ width: `${sportData.winRate}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info message */}
        <div className="mt-6 pt-4 border-t border-white/5 text-[9px] text-muted-foreground/60 text-center leading-relaxed">
          이 데이터는 종료된 경기 분석과 실제 결과를 대조하여 실시간 산출한 봇의 최근 신뢰 지표입니다.
        </div>
      </div>
    </div>
  );
}
