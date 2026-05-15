"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Trophy, TrendingUp, Target, Award, 
  ChevronRight, ArrowUpRight, Shield, Zap,
  Search, Filter, History, Users
} from "lucide-react";
import { cn } from "@/lib/utils";

const BADGE_CONFIG = {
  VERIFIED: {
    label: "검증된 팁스터",
    color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    icon: Shield
  },
  EXPERT: {
    label: "수익왕",
    color: "bg-primary/20 text-primary border-primary/30",
    icon: Award
  },
  ROOKIE: {
    label: "루키",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    icon: Zap
  }
};

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/leaderboard');
        const data = await res.json();
        if (data.success) {
          setLeaderboard(data.leaderboard);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getBadge = (user: any) => {
    if (user.totalBets >= 30 && user.roi >= 5) return BADGE_CONFIG.VERIFIED;
    if (user.roi >= 15) return BADGE_CONFIG.EXPERT;
    if (user.totalBets >= 10) return BADGE_CONFIG.ROOKIE;
    return null;
  };

  return (
    <div className="mesh-gradient min-h-screen">
      <div className="container mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <Link href="/" className="hover:text-primary transition-colors">홈</Link>
          <span>/</span>
          <Link href="/community" className="hover:text-primary transition-colors">커뮤니티</Link>
          <span>/</span>
          <span className="text-foreground font-bold">수익률 랭킹</span>
        </div>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-[hsl(var(--gold))]/15 p-2 rounded-xl">
              <Trophy className="w-6 h-6 text-[hsl(var(--gold))]" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter">실시간 수익률 랭킹</h1>
          </div>
          <p className="text-muted-foreground">실제 베팅 저널 데이터를 기반으로 산출된 투명한 성과 랭킹입니다.</p>
        </div>

        {/* Top 3 Podiums */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {leaderboard.slice(0, 3).map((user, index) => (
            <div key={user.id} className={cn(
              "glass-card rounded-3xl p-8 relative overflow-hidden group hover:scale-[1.02] transition-all",
              index === 0 ? "border-primary/30 bg-primary/5 md:-translate-y-4 shadow-[0_0_40px_rgba(59,130,246,0.15)]" : "border-white/5"
            )}>
              {/* Rank Badge */}
              <div className={cn(
                "absolute -top-2 -right-2 w-16 h-16 flex items-center justify-center font-black text-2xl",
                index === 0 ? "text-[hsl(var(--gold))]" : index === 1 ? "text-slate-300" : "text-amber-700"
              )}>
                #{index + 1}
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-white/5 mb-4 flex items-center justify-center text-3xl font-bold text-primary border border-white/10 overflow-hidden shadow-2xl">
                  {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.nickname[0]}
                </div>
                <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">{user.nickname}</h3>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-4">
                  <span className="bg-white/5 px-2 py-0.5 rounded">Lv.{user.level}</span>
                  {getBadge(user) && (
                    <span className={cn("px-2 py-0.5 rounded border", getBadge(user)!.color)}>
                      {getBadge(user)!.label}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 w-full pt-6 border-t border-white/5">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">ROI</p>
                    <p className="text-2xl font-black text-emerald-400">+{user.roi.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Win Rate</p>
                    <p className="text-2xl font-black text-white">{user.winRate.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Ranking List Table */}
        <div className="glass-card rounded-3xl overflow-hidden border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">순위</th>
                  <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">사용자</th>
                  <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">ROI</th>
                  <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">승률</th>
                  <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">총 베팅</th>
                  <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">상세</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-6 h-16 bg-white/[0.01]" />
                    </tr>
                  ))
                ) : leaderboard.slice(3).map((user, index) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-5 font-black text-muted-foreground">#{index + 4}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center font-bold text-primary border border-white/10 shrink-0">
                          {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.nickname[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold group-hover:text-primary transition-colors">{user.nickname}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[9px] text-muted-foreground">Lv.{user.level}</span>
                            {getBadge(user) && (
                              <span className={cn("text-[8px] px-1.5 py-0 rounded border", getBadge(user)!.color)}>
                                {getBadge(user)!.label}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-emerald-400 font-black">+{user.roi.toFixed(1)}%</span>
                    </td>
                    <td className="px-6 py-5 text-center font-bold text-white">
                      {user.winRate.toFixed(1)}%
                    </td>
                    <td className="px-6 py-5 text-center text-sm text-muted-foreground">
                      {user.totalBets}회
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 p-6 glass-card rounded-2xl border-white/5 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-xl">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-bold text-sm">검증된 팁스터가 되어보세요</h4>
              <p className="text-xs text-muted-foreground">베팅 30회 이상, ROI 5% 이상 달성 시 인증 배지가 수여됩니다.</p>
            </div>
          </div>
          <Link href="/mypage" className="btn-primary py-2 px-6 text-xs flex items-center gap-2">
            베팅 기록하러 가기 <TrendingUp className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
