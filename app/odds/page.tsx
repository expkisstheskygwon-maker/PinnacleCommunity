"use client";

import { useState } from "react";
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

const MATCHES = [
  { id: 1, home: "울산 HD", away: "전북 현대", league: "K리그1", sport: "soccer", time: "19:00", live: true, odds: { h: 1.95, d: 3.60, a: 3.85 }, ah: "-0.5 @ 1.92", ou: "O2.5 @ 1.88", openH: 1.98, movement: "dropping" },
  { id: 2, home: "포항 스틸러스", away: "수원 FC", league: "K리그1", sport: "soccer", time: "19:00", live: true, odds: { h: 2.15, d: 3.30, a: 3.25 }, ah: "PK @ 1.90", ou: "O2.5 @ 2.05", openH: 2.20, movement: "dropping" },
  { id: 3, home: "Arsenal", away: "Chelsea", league: "EPL", sport: "soccer", time: "23:00", live: false, odds: { h: 1.85, d: 3.65, a: 4.10 }, ah: "-0.5 @ 1.88", ou: "O2.5 @ 1.95", openH: 1.90, movement: "dropping" },
  { id: 4, home: "Real Madrid", away: "Barcelona", league: "La Liga", sport: "soccer", time: "04:00", live: false, odds: { h: 2.05, d: 3.50, a: 3.45 }, ah: "PK @ 1.95", ou: "O2.5 @ 2.10", openH: 2.10, movement: "dropping" },
  { id: 5, home: "Bayern", away: "Dortmund", league: "Bundesliga", sport: "soccer", time: "22:30", live: true, odds: { h: 1.55, d: 4.50, a: 5.20 }, ah: "-1.25 @ 1.92", ou: "O3.5 @ 2.05", openH: 1.58, movement: "dropping" },
  { id: 6, home: "LG 트윈스", away: "두산 베어스", league: "KBO", sport: "baseball", time: "18:30", live: false, odds: { h: 1.70, d: 0, a: 2.15 }, ah: "-1.5 @ 2.10", ou: "O8.5 @ 1.85", openH: 1.75, movement: "dropping" },
  { id: 7, home: "삼성 라이온즈", away: "기아 타이거즈", league: "KBO", sport: "baseball", time: "18:30", live: false, odds: { h: 2.25, d: 0, a: 1.65 }, ah: "+1.5 @ 1.80", ou: "O9.0 @ 1.90", openH: 2.30, movement: "steady" },
  { id: 8, home: "T1", away: "Gen.G", league: "LCK", sport: "esports", time: "17:00", live: false, odds: { h: 1.75, d: 0, a: 2.05 }, ah: "-1.5 @ 2.15", ou: "O2.5 @ 1.85", openH: 1.80, movement: "dropping" },
  { id: 9, home: "HLE", away: "DRX", league: "LCK", sport: "esports", time: "20:00", live: false, odds: { h: 1.45, d: 0, a: 2.65 }, ah: "-1.5 @ 1.90", ou: "O2.5 @ 2.00", openH: 1.48, movement: "dropping" },
  { id: 10, home: "LA Lakers", away: "Boston Celtics", league: "NBA", sport: "basketball", time: "09:30", live: false, odds: { h: 2.35, d: 0, a: 1.60 }, ah: "+4.5 @ 1.88", ou: "O220.5 @ 1.92", openH: 2.40, movement: "dropping" },
];

export default function OddsPage() {
  const [activeCat, setActiveCat] = useState("all");
  const [showProView, setShowProView] = useState(false);

  const filtered = activeCat === "all" ? MATCHES : MATCHES.filter(m => m.sport === activeCat);
  const liveCount = filtered.filter(m => m.live).length;

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
        <div className="glass-card rounded-2xl overflow-hidden">
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
                        <span className={cn("font-mono text-xs font-bold", diff < 0 ? "text-red-400" : diff > 0 ? "text-emerald-400" : "text-muted-foreground")}>{m.odds.h.toFixed(2)}</span>
                      </td>
                      {filtered.some(m2 => m2.odds.d > 0) && (
                        <td className="text-center px-3 py-4">
                          <span className="font-mono text-xs text-muted-foreground">{m.odds.d > 0 ? m.odds.d.toFixed(2) : "-"}</span>
                        </td>
                      )}
                      <td className="text-center px-3 py-4">
                        <span className="font-mono text-xs text-muted-foreground">{m.odds.a.toFixed(2)}</span>
                      </td>
                      {showProView && (
                        <td className="text-center px-3 py-4">
                          <span className="font-mono text-[11px] text-muted-foreground/60">{m.openH.toFixed(2)}</span>
                          {diff !== 0 && (
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
          <div className="px-5 py-3 border-t border-white/[0.04] bg-white/[0.02] text-[10px] text-muted-foreground">
            배당은 Pinnacle 기준 참고용 데이터입니다. 실시간 변동될 수 있으며, 실제 배당은 Pinnacle 공식 사이트에서 확인하세요.
          </div>
        </div>
      </div>
    </div>
  );
}
