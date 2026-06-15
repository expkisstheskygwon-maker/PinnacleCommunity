"use client";

import { useState } from "react";
import { TrendingUp, Target, Activity, Calendar as CalendarIcon, ChevronDown, Check } from "lucide-react";
import MatchAnalysisCard from "./MatchAnalysisCard";
import { cn } from "@/lib/utils";

// Dummy data for AI Experts
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

// Dummy data for matches
const DUMMY_MATCHES = [
  {
    match: {
      id: 1,
      league: "KBO",
      date: "6. 14. 17:00",
      home: "KT Wiz",
      away: "NC Dinos",
    },
    predictions: [
      { botName: "AI 데이터봇 알파", botAvatar: "A", scoreHome: 5, scoreAway: 3, winRate: 65, pick: "홈 승" },
      { botName: "AI 통계봇 베타", botAvatar: "B", scoreHome: 6, scoreAway: 4, winRate: 55, pick: "홈 승" }
    ]
  },
  {
    match: {
      id: 2,
      league: "MLB",
      date: "6. 15. 02:40",
      home: "Kansas City Royals",
      away: "Detroit Tigers",
    },
    predictions: [
      { botName: "AI 밸류봇 감마", botAvatar: "G", scoreHome: 3, scoreAway: 4, winRate: 52, pick: "원정 승" },
      { botName: "AI 데이터봇 알파", botAvatar: "A", scoreHome: 4, scoreAway: 2, winRate: 60, pick: "홈 승" }
    ]
  },
  {
    match: {
      id: 3,
      league: "Premier League",
      date: "6. 16. 23:00",
      home: "Arsenal",
      away: "Manchester City",
    },
    predictions: [
      { botName: "AI 통계봇 베타", botAvatar: "B", scoreHome: 1, scoreAway: 1, winRate: 40, pick: "무승부" },
      { botName: "AI 밸류봇 감마", botAvatar: "G", scoreHome: 2, scoreAway: 1, winRate: 45, pick: "홈 승" }
    ]
  }
];

const SPORTS_TABS = [
  { id: "all", label: "전체" },
  { id: "soccer", label: "⚽ 축구" },
  { id: "baseball", label: "⚾ 야구" },
  { id: "basketball", label: "🏀 농구" },
  { id: "volleyball", label: "🏐 배구" }
];

export default function AiAnalysisTab() {
  const [activeSport, setActiveSport] = useState("all");

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
          {AI_EXPERTS.map((bot, i) => (
            <div key={i} className={cn("bg-background/60 backdrop-blur-sm border rounded-2xl p-5 hover:scale-[1.02] transition-transform", bot.borderColor)}>
              <div className="flex items-center gap-4 mb-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl", bot.bgColor, bot.color)}>
                  {bot.avatar}
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg">{bot.name}</h3>
                  <p className="text-xs text-muted-foreground">{bot.title}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <div className="text-[10px] text-muted-foreground mb-1">주간 적중</div>
                  <div className="font-mono font-bold text-lg">
                    <span className={bot.color}>{bot.recentHit.split('/')[0]}</span>
                    <span className="text-white/30 text-sm mx-0.5">/</span>
                    <span className="text-muted-foreground text-sm">{bot.recentHit.split('/')[1]}</span>
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <div className="text-[10px] text-muted-foreground mb-1">전체 적중률</div>
                  <div className="font-mono font-black text-lg">
                    {bot.winRate}<span className="text-sm ml-0.5">%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
            <span>전체 결과</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
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
          <span className="text-sm text-muted-foreground">총 <strong className="text-foreground">{DUMMY_MATCHES.length}</strong> 경기가 분석되었습니다.</span>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {DUMMY_MATCHES.map((item, idx) => (
            <MatchAnalysisCard key={idx} match={item.match} predictions={item.predictions} />
          ))}
        </div>
      </div>
    </div>
  );
}
