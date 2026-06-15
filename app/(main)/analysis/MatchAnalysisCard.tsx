"use client";

import { Clock, Shield, ChevronRight, FileText } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface MatchAnalysisCardProps {
  match: {
    id: number;
    league: string;
    date: string;
    home: string;
    away: string;
    homeLogo?: string;
    awayLogo?: string;
  };
  predictions: {
    botName: string;
    botAvatar: string;
    scoreHome: number;
    scoreAway: number;
    winRate: number;
    pick: string;
  }[];
}

export default function MatchAnalysisCard({ match, predictions }: MatchAnalysisCardProps) {
  return (
    <div className="bg-background/40 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
            <Shield className="w-3 h-3 text-primary" />
          </div>
          <span className="font-bold text-sm text-foreground">{match.league}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-white/5 px-2.5 py-1 rounded-md">
          <Clock className="w-3 h-3" />
          {match.date}
        </div>
      </div>

      {/* Matchup */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col items-center gap-3 w-1/3">
          <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center">
            {match.homeLogo ? (
              <Image src={match.homeLogo} alt={match.home} width={36} height={36} className="object-contain" />
            ) : (
              <span className="font-black text-xl">{match.home.substring(0, 1)}</span>
            )}
          </div>
          <span className="font-bold text-sm text-center line-clamp-1">{match.home}</span>
          <span className="text-[10px] text-muted-foreground">홈</span>
        </div>

        <div className="flex flex-col items-center justify-center w-1/3">
          <span className="font-black text-2xl text-white/20 italic">VS</span>
        </div>

        <div className="flex flex-col items-center gap-3 w-1/3">
          <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center">
            {match.awayLogo ? (
              <Image src={match.awayLogo} alt={match.away} width={36} height={36} className="object-contain" />
            ) : (
              <span className="font-black text-xl">{match.away.substring(0, 1)}</span>
            )}
          </div>
          <span className="font-bold text-sm text-center line-clamp-1">{match.away}</span>
          <span className="text-[10px] text-muted-foreground">원정</span>
        </div>
      </div>

      {/* AI Predictions */}
      <div className="space-y-3">
        <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
          AI 예측 (AI Predictions)
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {predictions.map((pred, i) => (
            <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                    {pred.botAvatar}
                  </div>
                  <span className="font-bold text-sm text-foreground">{pred.botName}</span>
                </div>
                <div className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold border border-primary/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> LIVE
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">예측 스코어</span>
                  <div className="font-black text-lg font-mono">
                    <span className="text-blue-400">{pred.scoreHome}</span>
                    <span className="mx-1 text-white/30">:</span>
                    <span className="text-red-400">{pred.scoreAway}</span>
                  </div>
                </div>
                
                <button className="flex items-center gap-1 bg-white/10 hover:bg-primary/20 hover:text-primary transition-colors text-xs font-bold px-3 py-1.5 rounded-lg border border-white/5">
                  <FileText className="w-3 h-3" />
                  분석 보기
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
