"use client";

import { useState, useEffect } from "react";
import { Clock, Shield, FileText, Loader2, AlertCircle } from "lucide-react";
import Image from "next/image";
import AnalysisModal from "./AnalysisModal";

interface MatchAnalysisCardProps {
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
  };
}

export default function MatchAnalysisCard({ match }: MatchAnalysisCardProps) {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchPredictions = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/sports/predictions?fixtureId=${match.id}&sport=${match.sport}`);
        const data = await res.json();
        if (data.success && data.predictions) {
          setPredictions(data.predictions);
        } else {
          setError("분석 데이터를 가져올 수 없습니다.");
        }
      } catch (err) {
        console.error("Failed to fetch predictions:", err);
        setError("서버 통신 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPredictions();
  }, [match.id, match.sport]);

  return (
    <>
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
            {match.date} {match.time}
          </div>
        </div>

        {/* Matchup */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col items-center gap-3 w-1/3">
            <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center overflow-hidden">
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
            <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center overflow-hidden">
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
          <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
            AI 예측 (AI Predictions)
            {isLoading && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 opacity-50">
              {/* Skeletons */}
              {[1, 2].map((i) => (
                <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col gap-3 animate-pulse">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white/10" />
                    <div className="h-4 w-24 bg-white/10 rounded" />
                  </div>
                  <div className="h-6 w-32 bg-white/10 rounded mt-2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center justify-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {predictions.map((pred, i) => (
                <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col gap-3 group relative overflow-hidden">
                  {pred.winRate > 60 && (
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                        {pred.botAvatar}
                      </div>
                      <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{pred.botName}</span>
                    </div>
                    <div className="text-[10px] bg-white/5 text-muted-foreground px-2 py-0.5 rounded-full font-bold border border-white/10 flex items-center gap-1">
                      신뢰도 {pred.winRate}%
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground mb-1">예상 결과</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{pred.pick}</span>
                        {pred.scoreHome !== 0 && pred.scoreAway !== 0 && (
                          <div className="font-black text-sm font-mono bg-background/50 px-2 py-0.5 rounded-md border border-white/5">
                            <span className="text-blue-400">{pred.scoreHome}</span>
                            <span className="mx-1 text-white/30">:</span>
                            <span className="text-red-400">{pred.scoreAway}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="flex items-center gap-1 bg-white/5 hover:bg-primary/20 hover:text-primary transition-colors text-xs font-bold px-3 py-1.5 rounded-lg border border-white/5 shrink-0"
                    >
                      <FileText className="w-3 h-3" />
                      상세
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnalysisModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        match={match} 
        predictions={predictions} 
      />
    </>
  );
}
