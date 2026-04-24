"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp, TrendingDown, Activity, Swords, Timer, BarChart3,
  ChevronDown, Filter, Star, Zap, Gamepad2, Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "all", label: "전체", icon: Activity },
  { id: "soccer", label: "축구", icon: Swords },
  { id: "baseball", label: "야구", icon: Trophy },
  { id: "basketball", label: "농구", icon: Activity },
  { id: "esports", label: "e스포츠", icon: Gamepad2 },
  { id: "live", label: "라이브", icon: Zap },
];

export default function OddsPage() {
  const [activeCat, setActiveCat] = useState("all");
  const [showProView, setShowProView] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 데이터 가져오는 함수
  const fetchMatches = async (sport: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/sports/matches?sport=${sport === 'all' ? 'soccer' : sport}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMatches(data.matches || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 카테고리 변경 시 데이터 호출
  useEffect(() => {
    fetchMatches(activeCat);
  }, [activeCat]);

  const filtered = matches; // API에서 이미 필터링된 데이터를 가져옴
  const liveCount = matches.filter(m => m.live).length;

  return (
    <div className="mesh-gradient min-h-screen">
      <div className="container mx-auto px-4 py-10">
        {/* Page Header */}
        <div className="mb-8 space-y-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">홈</Link>
            <span>/</span>
            <span className="text-foreground font-bold">배당/경기</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter">배당/경기</h1>
              <p className="text-muted-foreground mt-1">실시간 배당률과 경기 일정을 확인하세요</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowProView(!showProView)}
                className={cn("btn-outline text-xs py-2", showProView && "bg-primary/10 border-primary/20 text-primary")}
              >
                <BarChart3 className="w-3.5 h-3.5 inline mr-1.5" />
                {showProView ? "상세 모드 ON" : "상세 모드"}
              </button>
              {liveCount > 0 && (
                <div className="badge-live">
                  <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span></span>
                  {liveCount} LIVE
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                activeCat === cat.id
                  ? "bg-primary text-white shadow-[0_0_16px_rgba(59,130,246,0.3)]"
                  : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 border border-white/[0.06]"
              )}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Matches Table */}
        <div className="glass-card rounded-2xl overflow-hidden min-h-[400px] flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-20 space-y-4">
              <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-muted-foreground animate-pulse">실시간 데이터를 가져오는 중...</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center p-20 space-y-4">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-red-400 font-bold">데이터를 불러오지 못했습니다.</p>
              <button onClick={() => fetchMatches(activeCat)} className="btn-primary py-2 px-6 text-xs">다시 시도</button>
            </div>
          ) : matches.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-20 space-y-4 text-muted-foreground">
              <Swords className="w-12 h-12 opacity-20" />
              <p>현재 진행 중인 경기가 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] text-muted-foreground uppercase tracking-widest border-b border-white/[0.06] bg-white/[0.02]">
                    <th className="text-left px-5 py-4 font-bold">리그</th>
                    <th className="text-left px-3 py-4 font-bold">경기</th>
                    <th className="text-center px-3 py-4 font-bold">1</th>
                    {filtered.some(m => m.odds.d > 0) && <th className="text-center px-3 py-4 font-bold">X</th>}
                    <th className="text-center px-3 py-4 font-bold">2</th>
                    {showProView && <th className="text-center px-3 py-4 font-bold">오픈 배당</th>}
                    <th className="text-center px-3 py-4 font-bold hidden md:table-cell">핸디캡</th>
                    <th className="text-center px-3 py-4 font-bold hidden md:table-cell">오버/언더</th>
                    <th className="text-right px-5 py-4 font-bold">시간</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filtered.map(m => {
                    const diff = m.odds.h - m.openH;
                    return (
                      <tr key={m.id} className="hover:bg-white/[0.03] transition-colors group cursor-pointer">
                        <td className="px-5 py-4">
                          <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 uppercase">{m.league}</span>
                        </td>
                        <td className="px-3 py-4">
                          <span className="font-bold group-hover:text-primary transition-colors">{m.home}</span>
                          <span className="text-muted-foreground mx-1.5 text-xs">vs</span>
                          <span className="font-bold">{m.away}</span>
                        </td>
                        <td className="text-center px-3 py-4">
                          <span className={cn("font-mono text-xs font-bold", diff < 0 ? "text-red-400" : diff > 0 ? "text-emerald-400" : "text-muted-foreground")}>{m.odds.h > 0 ? m.odds.h.toFixed(2) : "-"}</span>
                        </td>
                        {filtered.some(m2 => m2.odds.d > 0) && (
                          <td className="text-center px-3 py-4">
                            <span className="font-mono text-xs text-muted-foreground">{m.odds.d > 0 ? m.odds.d.toFixed(2) : "-"}</span>
                          </td>
                        )}
                        <td className="text-center px-3 py-4">
                          <span className="font-mono text-xs text-muted-foreground">{m.odds.a > 0 ? m.odds.a.toFixed(2) : "-"}</span>
                        </td>
                        {showProView && (
                          <td className="text-center px-3 py-4">
                            <span className="font-mono text-[11px] text-muted-foreground/60">{m.openH > 0 ? m.openH.toFixed(2) : "-"}</span>
                            {diff !== 0 && m.openH > 0 && (
                              <span className={cn("ml-1 text-[9px] font-bold", diff < 0 ? "text-red-400" : "text-emerald-400")}>
                                ({diff > 0 ? "+" : ""}{diff.toFixed(2)})
                              </span>
                            )}
                          </td>
                        )}
                        <td className="text-center px-3 py-4 hidden md:table-cell font-mono text-[11px] text-muted-foreground">{m.ah}</td>
                        <td className="text-center px-3 py-4 hidden md:table-cell font-mono text-[11px] text-muted-foreground">{m.ou}</td>
                        <td className="px-5 py-4 text-right">
                          {m.live ? (
                            <span className="badge-live">
                              <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span></span>
                              LIVE
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground font-mono">{m.time}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div className="px-5 py-3 border-t border-white/[0.04] bg-white/[0.02] text-[10px] text-muted-foreground">
            배당은 Pinnacle 기준 참고용 데이터입니다. 실시간 변동될 수 있으며, 실제 배당은 Pinnacle 공식 사이트에서 확인하세요.
          </div>
        </div>
      </div>
    </div>
  );
}
