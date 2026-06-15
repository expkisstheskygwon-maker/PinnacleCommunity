"use client";

import { X, Trophy, TrendingUp, Shield, Activity, BarChart3 } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: {
    id: number;
    league: string;
    date: string;
    time: string;
    home: string;
    away: string;
    homeLogo?: string;
    awayLogo?: string;
  };
  predictions: any[];
}

export default function AnalysisModal({ isOpen, onClose, match, predictions }: AnalysisModalProps) {
  // 모달이 열려있을 때 배경 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground">AI 상세 분석 리포트</h2>
              <p className="text-xs text-muted-foreground">{match.league} • {match.date} {match.time}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors text-muted-foreground hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          
          {/* Matchup Banner */}
          <div className="flex items-center justify-center gap-8 mb-10 bg-gradient-to-b from-white/5 to-transparent p-6 rounded-2xl border border-white/5">
            <div className="flex flex-col items-center gap-3 w-1/3">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                {match.homeLogo ? (
                  <Image src={match.homeLogo} alt={match.home} width={48} height={48} className="object-contain" />
                ) : (
                  <span className="font-black text-3xl">{match.home.substring(0, 1)}</span>
                )}
              </div>
              <span className="font-bold text-base text-center">{match.home}</span>
              <span className="text-xs text-muted-foreground bg-white/10 px-3 py-1 rounded-full">홈 (Home)</span>
            </div>

            <div className="flex flex-col items-center justify-center">
              <span className="font-black text-3xl text-primary/40 italic mb-2">VS</span>
            </div>

            <div className="flex flex-col items-center gap-3 w-1/3">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                {match.awayLogo ? (
                  <Image src={match.awayLogo} alt={match.away} width={48} height={48} className="object-contain" />
                ) : (
                  <span className="font-black text-3xl">{match.away.substring(0, 1)}</span>
                )}
              </div>
              <span className="font-bold text-base text-center">{match.away}</span>
              <span className="text-xs text-muted-foreground bg-white/10 px-3 py-1 rounded-full">원정 (Away)</span>
            </div>
          </div>

          {/* Detailed Predictions */}
          <div className="space-y-6">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              AI 봇 그룹 종합 분석
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              {predictions.map((pred, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 relative overflow-hidden">
                  {pred.winRate > 60 && (
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                  )}
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary border border-primary/30">
                        {pred.botAvatar}
                      </div>
                      <div>
                        <span className="font-bold text-sm block">{pred.botName}</span>
                        <span className="text-[10px] text-muted-foreground">신뢰도: {pred.winRate}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                      <div className="text-[10px] text-muted-foreground mb-1">추천 픽</div>
                      <div className="font-bold text-white text-sm">{pred.pick}</div>
                    </div>
                    
                    <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                      <div className="text-[10px] text-muted-foreground mb-1">예상 스코어</div>
                      <div className="font-mono font-bold text-sm">
                        <span className="text-blue-400">{pred.scoreHome}</span>
                        <span className="mx-2 text-white/20">-</span>
                        <span className="text-red-400">{pred.scoreAway}</span>
                      </div>
                    </div>

                    <div className="bg-black/30 rounded-xl p-3 border border-white/5 col-span-2 sm:col-span-1">
                      <div className="text-[10px] text-muted-foreground mb-1">코멘트</div>
                      <div className="font-bold text-white text-xs opacity-80 leading-snug">
                        {pred.scoreHome > pred.scoreAway ? "홈팀의 우세가 예상됩니다." : pred.scoreHome < pred.scoreAway ? "원정팀의 선전이 기대됩니다." : "팽팽한 접전이 예상됩니다."}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-primary/10 border border-primary/20 rounded-xl text-center">
            <p className="text-xs text-primary font-bold">💡 위 분석은 과거 데이터를 바탕으로 한 AI의 확률적 예측이므로 실제 결과와 다를 수 있습니다.</p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
