"use client";

import { useState, useEffect } from "react";
import { Clock, Shield, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface PredictionResultCardProps {
  match: {
    id: number;
    sport: string;
    league: string;
    time: string;
    date: string;
    home: string;
    away: string;
    homeLogo?: string;
    awayLogo?: string;
    scores: { home: number; away: number };
    odds?: { h: number; d: number; a: number };
    ah?: string;
    ou?: string;
  };
}

export default function PredictionResultCard({ match }: PredictionResultCardProps) {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPredictions = async () => {
      setIsLoading(true);
      try {
        const oddsQuery = match.odds 
          ? `&oddsH=${match.odds.h}&oddsD=${match.odds.d}&oddsA=${match.odds.a}` 
          : '';
        const res = await fetch(
          `/api/sports/predictions?fixtureId=${match.id}&sport=${match.sport}&home=${encodeURIComponent(match.home)}&away=${encodeURIComponent(match.away)}${oddsQuery}`
        );
        const data = await res.json();
        if (data.success && data.predictions) {
          setPredictions(data.predictions);
        }
      } catch (err) {
        console.error("Failed to fetch predictions:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPredictions();
  }, [match.id, match.sport, match.home, match.away, match.odds]);

  // 실제 결과 계산
  const actualHome = match.scores?.home ?? 0;
  const actualAway = match.scores?.away ?? 0;
  const actualResult = actualHome > actualAway ? "홈 승" : actualHome < actualAway ? "원정 승" : "무승부";

  // 적중 여부 판별 함수
  const isHit = (pick: string) => {
    const pickLower = pick.toLowerCase();

    // 1. 단순 승무패 매칭
    if (pick.includes("홈 승") && actualResult === "홈 승") return true;
    if (pick.includes("원정 승") && actualResult === "원정 승") return true;
    if (pick.includes("무승부") && actualResult === "무승부") return true;

    // 2. API-Sports 축구 어드바이스 매칭 (예: "Double chance : home or draw")
    if (match.sport === 'soccer') {
      if (actualResult === "홈 승" && (pickLower.includes("home") || pickLower.includes("1x"))) return true;
      if (actualResult === "원정 승" && (pickLower.includes("away") || pickLower.includes("x2"))) return true;
      if (actualResult === "무승부" && (pickLower.includes("draw") || pickLower.includes("1x") || pickLower.includes("x2"))) return true;
    }

    // 3. 언더/오버 매칭 (예: "언더/오버 2.5 오버")
    if (pick.includes("오버") || pick.includes("언더") || pickLower.includes("over") || pickLower.includes("under")) {
      const matchLine = pick.match(/(\d+(\.\d+)?)/);
      if (matchLine) {
        const line = parseFloat(matchLine[0]);
        const total = actualHome + actualAway;
        if ((pick.includes("오버") || pickLower.includes("over")) && total > line) return true;
        if ((pick.includes("언더") || pickLower.includes("under")) && total < line) return true;
      }
    }

    return false;
  };

  return (
    <div className="bg-background/60 border border-white/5 rounded-2xl p-6 transition-colors relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
          <Shield className="w-4 h-4" />
          {match.league}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-white/5 px-2.5 py-1 rounded-md">
          <Clock className="w-3 h-3" />
          {match.date} 종료됨
        </div>
      </div>

      {/* Actual Result Matchup */}
      <div className="flex items-center justify-between mb-8 bg-black/40 border border-white/5 p-4 rounded-xl relative">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">
          실제 결과
        </div>

        <div className="flex flex-col items-center gap-2 w-1/3 mt-2">
          <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
            {match.homeLogo ? (
              <Image src={match.homeLogo} alt={match.home} width={32} height={32} className="object-contain" />
            ) : (
              <span className="font-black">{match.home.substring(0, 1)}</span>
            )}
          </div>
          <span className="font-bold text-sm text-center line-clamp-1">{match.home}</span>
        </div>

        <div className="flex items-center justify-center gap-4 w-1/3 mt-2">
          <span className="font-black text-3xl text-foreground">{actualHome}</span>
          <span className="text-white/20">:</span>
          <span className="font-black text-3xl text-foreground">{actualAway}</span>
        </div>

        <div className="flex flex-col items-center gap-2 w-1/3 mt-2">
          <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
            {match.awayLogo ? (
              <Image src={match.awayLogo} alt={match.away} width={32} height={32} className="object-contain" />
            ) : (
              <span className="font-black">{match.away.substring(0, 1)}</span>
            )}
          </div>
          <span className="font-bold text-sm text-center line-clamp-1">{match.away}</span>
        </div>
      </div>

      {/* AI Bots Predictions Check */}
      <div className="space-y-3">
        <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
          AI 예측 적중 여부
          {isLoading && <Loader2 className="w-3 h-3 animate-spin text-emerald-500" />}
        </div>
        
        {isLoading ? (
          <div className="h-16 flex items-center justify-center text-muted-foreground text-sm opacity-50 bg-white/5 rounded-xl border border-white/5">
            데이터를 대조 중입니다...
          </div>
        ) : predictions.length === 0 ? (
          <div className="h-16 flex items-center justify-center text-muted-foreground text-sm bg-white/5 rounded-xl border border-white/5">
            이 경기에 대한 과거 예측 데이터가 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {predictions.map((pred, i) => {
              const hit = isHit(pred.pick);
              
              return (
                <div 
                  key={i} 
                  className={cn(
                    "border rounded-xl p-3 flex flex-col gap-2 relative overflow-hidden transition-all",
                    hit 
                      ? "bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                      : "bg-white/5 border-white/5 opacity-60 grayscale"
                  )}
                >
                  {/* Background flare for hit */}
                  {hit && (
                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/20 rounded-full blur-xl pointer-events-none" />
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                        hit ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-muted-foreground"
                      )}>
                        {pred.botAvatar}
                      </div>
                      <span className={cn("font-bold text-sm", hit ? "text-emerald-100" : "text-muted-foreground")}>
                        {pred.botName}
                      </span>
                    </div>
                    {hit ? (
                      <div className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md font-bold">
                        <CheckCircle2 className="w-3 h-3" /> 적중
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[10px] bg-red-500/10 text-red-400/70 px-2 py-0.5 rounded-md font-bold">
                        <XCircle className="w-3 h-3" /> 실패
                      </div>
                    )}
                  </div>

                  <div className="bg-black/20 rounded-lg p-2 flex justify-between items-center text-xs mt-1 border border-white/5">
                    <span className="text-muted-foreground">당시 예측 픽</span>
                    <strong className={hit ? "text-emerald-400" : "text-white"}>{pred.pick}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
