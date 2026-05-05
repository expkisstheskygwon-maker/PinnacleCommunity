"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp, TrendingDown, Activity, Swords, Timer, BarChart3,
  ChevronDown, Filter, Star, Zap, Gamepad2, Trophy,
  ChevronRight, Info, Users, History, MapPin, User, Clock, 
  AlertCircle, X, Search, Eye, EyeOff, LayoutGrid
} from "lucide-react";
import { cn } from "@/lib/utils";
import SportsSidebar from "./SportsSidebar";

const CATEGORIES = [
  { id: "all", label: "전체", icon: Activity },
  { id: "favorites", label: "⭐ 즐겨찾기", icon: Star },
  { id: "soccer", label: "축구", icon: Swords },
  { id: "baseball", label: "야구", icon: Trophy },
  { id: "basketball", label: "농구", icon: Activity },
];

export default function OddsPage() {
  const [sport, setSport] = useState('all');
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [markets, setMarkets] = useState<any[]>([]);
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketSearch, setMarketSearch] = useState("");
  const [showOdds, setShowOdds] = useState(false);
  const [showProView, setShowProView] = useState(false);
  const [expandedMatches, setExpandedMatches] = useState<Record<string, boolean>>({});

  // ★ Favorites (Matches)
  const [favorites, setFavorites] = useState<string[]>([]);
  // ★ Favorite Teams
  const [favTeams, setFavTeams] = useState<string[]>([]);

  // Load preferences from API on mount
  useEffect(() => {
    fetch('/api/user/matches')
      .then(r => r.json())
      .then(data => {
        if (data.success) setFavorites(data.favorites || []);
      })
      .catch(() => {});
    
    fetch('/api/user/interests')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const teams = data.interests.filter((i: any) => i.category === 'team').map((i: any) => i.value);
          setFavTeams(teams);
        }
      })
      .catch(() => {});
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sports/matches?sport=${sport}&t=${Date.now()}`);
      if (!res.ok) throw new Error("데이터를 불러오지 못했습니다.");
      const data = await res.json();
      setMatches(data.matches || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMatches([]); // 종목 변경 시 기존 데이터 초기화
    fetchMatches();
  }, [sport]);

  // 필터링 및 정렬 로직
  const filteredMatches = (matches || [])
    .filter(m => {
      if (!m) return false;
      const matchesLeague = selectedLeagueId ? m.leagueId === selectedLeagueId : true;
      const matchesSearch = !searchTerm ? true : (
        (m.home?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
        (m.away?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (m.league?.toLowerCase() || "").includes(searchTerm.toLowerCase())
      );
      return matchesLeague && matchesSearch;
    })
    .sort((a, b) => {
      if (!a || !b) return 0;
      const aFav = favorites.includes(a.id.toString()) ? 1 : 0;
      const bFav = favorites.includes(b.id.toString()) ? 1 : 0;
      if (aFav !== bFav) return bFav - aFav;
      if (a.live && !b.live) return -1;
      if (!a.live && b.live) return 1;
      return 0;
    });

  const liveCount = (matches || []).filter(m => m?.live).length;

  const toggleFavorite = async (matchId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isFav = favorites.includes(matchId);
    const action = isFav ? 'remove' : 'add';
    setFavorites(prev => isFav ? prev.filter(id => id !== matchId) : [...prev, matchId]);
    try {
      await fetch('/api/user/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, type: 'favorite', action }),
      });
    } catch {
      setFavorites(prev => action === 'remove' ? [...prev, matchId] : prev.filter(id => id !== matchId));
    }
  };

  const toggleTeamFavorite = async (teamName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isFav = favTeams.includes(teamName);
    const action = isFav ? 'remove' : 'add';
    setFavTeams(prev => isFav ? prev.filter(t => t !== teamName) : [...prev, teamName]);
    try {
      await fetch('/api/user/interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: 'team', value: teamName, action }),
      });
    } catch {
      setFavTeams(prev => action === 'remove' ? [...prev, teamName] : prev.filter(t => t !== teamName));
    }
  };

  const handleOpenMarkets = async (match: any) => {
    setSelectedMatch(match);
    setMarketLoading(true);
    try {
      const res = await fetch(`/api/sports/markets?fixtureId=${match.id}&sport=${sport}`);
      const data = await res.json();
      setMarkets(data.markets || []);
    } catch (err) {
      console.error(err);
    } finally {
      setMarketLoading(false);
    }
  };

  // Mock data for Detailed Mode
  const getMockStats = (id: number) => ({
    possession: { home: 45 + (id % 15), away: 55 - (id % 15) },
    shots: { home: 2 + (id % 5), away: 3 + (id % 4) },
    corners: { home: 1 + (id % 3), away: 2 + (id % 3) },
    yellowCards: { home: id % 2, away: (id + 1) % 3 },
    form: ["W", "D", "W", "L", "W"].map(f => f),
    lineup: "4-3-3"
  });

  return (
    <div className="mesh-gradient min-h-screen">
      <div className="container mx-auto px-4 py-10">
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Sidebar Filter */}
          <SportsSidebar 
            currentSport={sport}
            onSportChange={(s) => {
              setError(null);
              setSport(s);
              setSelectedLeagueId(null);
              setSearchTerm("");
            }}
            onLeagueSelect={(id) => {
              setError(null);
              setSelectedLeagueId(id);
            }}
            selectedLeagueId={selectedLeagueId}
          />

          {/* Main Content Area */}
          <div className="flex-1 space-y-6">
            {/* Header with Team Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-card p-6 rounded-3xl border-white/5">
              <div>
                <h1 className="text-3xl font-black text-glow flex items-center gap-3">
                  <Activity className="w-8 h-8 text-primary animate-pulse" />
                  실시간 배당 분석
                </h1>
                <p className="text-xs text-muted-foreground mt-1 font-medium opacity-60">
                  {selectedLeagueId ? `${matches.find(m => m.leagueId === selectedLeagueId)?.league || '선택된 리그'}의 경기` : "전 세계 주요 리그의 배당 흐름을 실시간으로 분석합니다."}
                </p>
              </div>
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <input 
                    type="text" 
                    placeholder="팀명으로 경기 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-4 outline-none focus:border-primary/50 transition-all text-sm font-bold"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowOdds(!showOdds)}
                    className={cn(
                      "p-3 rounded-2xl transition-all border",
                      showOdds ? "bg-primary text-primary-foreground border-primary" : "bg-white/5 text-muted-foreground border-white/10 hover:border-primary/40"
                    )}
                    title={showOdds ? "배당 숨기기" : "배당 보기"}
                  >
                    {showOdds ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={() => setShowProView(!showProView)}
                    className={cn(
                      "p-3 rounded-2xl transition-all border",
                      showProView ? "bg-blue-500 text-white border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]" : "bg-white/5 text-muted-foreground border-white/10 hover:border-blue-500/40"
                    )}
                    title="상세 분석 모드"
                  >
                    <LayoutGrid className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Status Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "전체 경기", value: matches.length, icon: Trophy, color: "text-primary" },
                { label: "실시간 중", value: liveCount, icon: Zap, color: "text-red-500" },
                { label: "종료된 경기", value: matches.filter(m => m.finished).length, icon: History, color: "text-emerald-400" },
                { label: "즐겨찾기", value: favorites.length, icon: Star, color: "text-[hsl(var(--gold))]" },
              ].map((stat, i) => (
                <div key={i} className="glass-card-hover p-4 rounded-2xl border-white/5 flex items-center gap-4">
                  <div className={cn("p-2.5 rounded-xl bg-white/5", stat.color)}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">{stat.label}</p>
                    <p className="text-xl font-black">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

        {/* Matches Table */}
        <div className="glass-card rounded-2xl overflow-hidden min-h-[400px] flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-20 space-y-4">
              <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-muted-foreground animate-pulse">실시간 데이터를 가져오는 중...</p>
            </div>
          ) : (error && matches.length === 0) ? (
            <div className="flex-1 flex flex-col items-center justify-center p-20 space-y-4">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-red-400 font-bold">데이터를 불러오지 못했습니다.</p>
              {error && (
                <div className="bg-black/20 p-3 rounded-xl border border-white/5 max-w-md w-full">
                  <p className="text-[10px] text-muted-foreground/60 break-all text-center font-mono">{error}</p>
                </div>
              )}
              <button onClick={() => fetchMatches()} className="btn-primary py-2 px-6 text-xs">다시 시도</button>
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
                    <th className="text-left px-3 py-4 font-bold">경기 현황</th>
                    <th className="text-center px-3 py-4 font-bold">승 (1)</th>
                    {filteredMatches.some(m => m.odds.d > 0) && <th className="text-center px-3 py-4 font-bold">무 (X)</th>}
                    <th className="text-center px-3 py-4 font-bold">패 (2)</th>
                    <th className="text-center px-3 py-4 font-bold">결과</th>
                    <th className="text-center px-3 py-4 font-bold hidden md:table-cell">핸디캡</th>
                    <th className="text-center px-3 py-4 font-bold hidden md:table-cell">O/U</th>
                    <th className="text-right px-5 py-4 font-bold">상태/시간</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredMatches.map(m => {
                    const diff = (m.odds?.h || 0) - (m.openH || m.odds?.h || 0);
                    
                    // 결과 텍스트 도출
                    let resultText = "-";
                    let resultColor = "text-muted-foreground";
                    
                    if (m.finished || m.live) {
                      if (m.scores.home > m.scores.away) {
                        resultText = "홈승";
                        resultColor = "bg-blue-500/10 text-blue-400 border-blue-500/20";
                      } else if (m.scores.home < m.scores.away) {
                        resultText = "원정승";
                        resultColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                      } else {
                        resultText = "무승부";
                        resultColor = "bg-gray-500/10 text-gray-400 border-gray-500/20";
                      }
                    }

                    const getStatusKo = (status: string) => {
                      const map: any = {
                        '1H': '전반', '2H': '후반', 'HT': '하프타임', 'ET': '연장', 'BT': '연장휴식', 'P': '승부차기',
                        'FT': '종료', 'AET': '연장종료', 'PEN': '승부차기종료', 'LIVE': '진행중', 'IN PROGRESS': '진행중',
                        'POST': '연기', 'CANC': '취소', 'ABD': '중단', 'NS': '예정'
                      };
                      return map[status.toUpperCase()] || status;
                    };

                    const stats = getMockStats(m.id);
                    const isExpanded = expandedMatches[m.id] || showProView;

                    return (
                      <>
                        <tr 
                          key={m.id} 
                          onClick={() => setExpandedMatches(prev => ({ ...prev, [m.id]: !prev[m.id] }))}
                          className={cn(
                            "hover:bg-white/[0.03] transition-colors group cursor-pointer border-l-2 border-transparent",
                            isExpanded && "bg-white/[0.02] border-primary"
                          )}
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              {/* ★ Favorite Star */}
                              <button
                                onClick={(e) => toggleFavorite(m.id.toString(), e)}
                                className={cn(
                                  "p-1 rounded-lg transition-all shrink-0",
                                  favorites.includes(m.id.toString())
                                    ? "text-[hsl(var(--gold))] hover:bg-[hsl(var(--gold))]/10"
                                    : "text-muted-foreground/30 hover:text-[hsl(var(--gold))]/60 hover:bg-white/5"
                                )}
                                title={favorites.includes(m.id.toString()) ? "즐겨찾기 해제" : "즐겨찾기 등록"}
                              >
                                <Star className={cn("w-3.5 h-3.5", favorites.includes(m.id.toString()) && "fill-current")} />
                              </button>
                              <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 uppercase max-w-[80px] truncate block w-fit">
                                    {m.sport === 'soccer' ? '⚽' : m.sport === 'baseball' ? '⚾' : m.sport === 'basketball' ? '🏀' : '🌐'} {m.league}
                                  </span>
                                </div>
                                {showProView && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-2.5 h-2.5 text-muted-foreground/40" />
                                    <span className="text-[9px] text-muted-foreground/40 font-medium">Stadion Arena</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-4">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 min-w-[120px] justify-end group/team">
                                  {/* Home Team Star */}
                                  <button
                                    onClick={(e) => toggleTeamFavorite(m.home, e)}
                                    className={cn(
                                      "opacity-0 group-hover/team:opacity-100 transition-opacity p-0.5",
                                      favTeams.includes(m.home) ? "opacity-100 text-[hsl(var(--gold))]" : "text-white/20 hover:text-white/40"
                                    )}
                                  >
                                    <Star className={cn("w-2.5 h-2.5", favTeams.includes(m.home) && "fill-current")} />
                                  </button>
                                  <span className={cn("font-bold text-sm", m.scores.home > m.scores.away && (m.live || m.finished) && "text-blue-400", favTeams.includes(m.home) && "text-[hsl(var(--gold))]")}>
                                    {m.home}
                                  </span>
                                  {showProView && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" title="라인업 확인됨" />}
                                </div>
                                <div className="flex items-center bg-black/40 rounded-lg px-2 py-1 border border-white/5 min-w-[50px] justify-center">
                                  <span className={cn("font-black text-sm w-4 text-center", (m.live || m.finished) ? "text-red-500" : "text-muted-foreground")}>{m.scores.home}</span>
                                  <span className="text-muted-foreground/30 px-1 text-[10px]">:</span>
                                  <span className={cn("font-black text-sm w-4 text-center", (m.live || m.finished) ? "text-red-500" : "text-muted-foreground")}>{m.scores.away}</span>
                                </div>
                                <div className="flex items-center gap-2 min-w-[120px] group/team">
                                  {showProView && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />}
                                  <span className={cn("font-bold text-sm", m.scores.away > m.scores.home && (m.live || m.finished) && "text-blue-400", favTeams.includes(m.away) && "text-[hsl(var(--gold))]")}>
                                    {m.away}
                                  </span>
                                  {/* Away Team Star */}
                                  <button
                                    onClick={(e) => toggleTeamFavorite(m.away, e)}
                                    className={cn(
                                      "opacity-0 group-hover/team:opacity-100 transition-opacity p-0.5",
                                      favTeams.includes(m.away) ? "opacity-100 text-[hsl(var(--gold))]" : "text-white/20 hover:text-white/40"
                                    )}
                                  >
                                    <Star className={cn("w-2.5 h-2.5", favTeams.includes(m.away) && "fill-current")} />
                                  </button>
                                </div>
                              </div>
                              {showProView && (
                                <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground/60 font-medium">
                                  <div className="flex items-center gap-1"><History className="w-3 h-3" /> W-D-W-L-W</div>
                                  <div className="flex items-center gap-1"><Users className="w-3 h-3" /> {stats.lineup}</div>
                                </div>
                              )}
                            </div>
                          </td>
                           <td className="text-center px-3 py-4">
                            <div className={cn("flex flex-col items-center gap-0.5 transition-all", !showOdds && "blur-sm select-none")}>
                              <span className={cn("font-mono text-xs font-bold", diff < 0 ? "text-red-400" : diff > 0 ? "text-emerald-400" : "text-foreground")}>
                                {m.odds?.h ? m.odds.h.toFixed(2) : "-"}
                              </span>
                              {showProView && m.odds?.h && (
                                <span className="text-[8px] text-muted-foreground/40 line-through">{(m.odds.h * 1.02).toFixed(2)}</span>
                              )}
                            </div>
                          </td>
                          {sortedMatches.some(m2 => (m2.odds?.d || 0) > 0) && (
                            <td className="text-center px-3 py-4">
                              <div className={cn("flex flex-col items-center gap-0.5 transition-all", !showOdds && "blur-sm select-none")}>
                                <span className="font-mono text-xs text-muted-foreground">{m.odds?.d ? m.odds.d.toFixed(2) : "-"}</span>
                                {showProView && (m.odds?.d || 0) > 0 && (
                                  <span className="text-[8px] text-muted-foreground/40 line-through">{(m.odds?.d * 0.98).toFixed(2)}</span>
                                )}
                              </div>
                            </td>
                          )}
                          <td className="text-center px-3 py-4">
                            <div className={cn("flex flex-col items-center gap-0.5 transition-all", !showOdds && "blur-sm select-none")}>
                              <span className="font-mono text-xs text-foreground font-bold">{m.odds?.a ? m.odds.a.toFixed(2) : "-"}</span>
                              {showProView && m.odds?.a && (
                                <span className="text-[8px] text-muted-foreground/40 line-through">{(m.odds.a * 0.97).toFixed(2)}</span>
                              )}
                            </div>
                          </td>
                          <td className="text-center px-3 py-4">
                            <span className={cn("text-[10px] font-black px-2 py-1 rounded border transition-all", resultColor)}>
                              {resultText}
                            </span>
                          </td>
                          <td className="text-center px-3 py-4 hidden md:table-cell">
                            <div className="flex flex-col items-center">
                              <span className="font-mono text-[11px] text-muted-foreground">{m.ah}</span>
                              {showProView && m.live && (
                                <span className="text-[8px] text-emerald-400 font-bold mt-0.5">DANGEROUS ATTACK</span>
                              )}
                            </div>
                          </td>
                          <td className="text-center px-3 py-4 hidden md:table-cell font-mono text-[11px] text-muted-foreground">{m.ou}</td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <div className="flex flex-col items-end gap-1">
                                {m.live ? (
                                  <div className="flex items-center gap-1.5">
                                    <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span></span>
                                    <span className="text-[10px] font-black text-red-500 uppercase tracking-tighter">{getStatusKo(m.statusCode)}</span>
                                  </div>
                                ) : m.finished ? (
                                  <span className="text-[10px] font-bold text-muted-foreground/60 bg-white/5 px-2 py-0.5 rounded uppercase">{getStatusKo(m.statusCode)}</span>
                                ) : (
                                  <span className="text-[10px] font-bold text-muted-foreground/80 uppercase">{getStatusKo(m.statusCode)}</span>
                                )}
                                <span className="text-[10px] text-muted-foreground/40 font-mono">{m.time}</span>
                              </div>
                              <ChevronDown className={cn("w-4 h-4 text-muted-foreground/20 transition-transform", isExpanded && "rotate-180 text-primary")} />
                            </div>
                          </td>
                        </tr>

                        {/* Detail Panel */}
                        {isExpanded && (
                          <tr className="bg-white/[0.01] border-l-2 border-primary/40 overflow-hidden animate-in slide-in-from-top-1 duration-200">
                            <td colSpan={9} className="p-0">
                              <div className="px-5 py-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Live Stats */}
                                <div className="space-y-4">
                                  <div className="flex items-center gap-2 text-xs font-bold text-primary mb-2">
                                    <BarChart3 className="w-3.5 h-3.5" /> 실시간 경기 데이터
                                  </div>
                                  <div className="space-y-3">
                                    {[
                                      { label: "점유율", home: stats.possession.home, away: stats.possession.away, suffix: "%" },
                                      { label: "슈팅", home: stats.shots.home, away: stats.shots.away },
                                      { label: "코너킥", home: stats.corners.home, away: stats.corners.away },
                                      { label: "경고", home: stats.yellowCards.home, away: stats.yellowCards.away },
                                    ].map(stat => (
                                      <div key={stat.label} className="space-y-1.5">
                                        <div className="flex justify-between text-[10px] font-bold">
                                          <span>{stat.home}{stat.suffix || ""}</span>
                                          <span className="text-muted-foreground font-medium uppercase tracking-widest">{stat.label}</span>
                                          <span>{stat.away}{stat.suffix || ""}</span>
                                        </div>
                                        <div className="h-1 bg-white/5 rounded-full overflow-hidden flex">
                                          <div className="h-full bg-blue-500/60" style={{ width: `${(stat.home / (stat.home + stat.away)) * 100}%` }} />
                                          <div className="h-full bg-emerald-500/60" style={{ width: `${(stat.away / (stat.home + stat.away)) * 100}%` }} />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Odds Movement */}
                                <div className="space-y-4">
                                  <div className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--gold))] mb-2">
                                    <TrendingUp className="w-3.5 h-3.5" /> 배당 흐름 분석
                                  </div>
                                  <div className="bg-black/20 rounded-xl p-4 border border-white/5 space-y-3">
                                    <div className="flex justify-between text-[10px] border-b border-white/5 pb-2 font-bold uppercase text-muted-foreground">
                                      <span>시장</span>
                                      <span>초기</span>
                                      <span>현재</span>
                                      <span>변동</span>
                                    </div>
                                    {[
                                      { label: "홈 (1)", start: (m.odds.h * 1.02).toFixed(2), current: m.odds.h.toFixed(2), trend: "down" },
                                      { label: "무 (X)", start: (m.odds.d * 0.98).toFixed(2), current: m.odds.d.toFixed(2), trend: "up" },
                                      { label: "패 (2)", start: (m.odds.a * 0.97).toFixed(2), current: m.odds.a.toFixed(2), trend: "up" },
                                    ].map(o => (
                                      <div key={o.label} className="flex justify-between items-center text-[11px]">
                                        <span className="font-bold w-12">{o.label}</span>
                                        <span className="font-mono text-muted-foreground/60">{o.start}</span>
                                        <span className="font-mono font-bold text-foreground">{o.current}</span>
                                        <span className={cn(
                                          "px-1.5 py-0.5 rounded-[4px] text-[9px] font-black uppercase",
                                          o.trend === "down" ? "bg-red-500/15 text-red-400" : "bg-emerald-500/15 text-emerald-400"
                                        )}>
                                          {o.trend === "down" ? "↓ 2.1%" : "↑ 1.4%"}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Match Info & Markets */}
                                <div className="space-y-4">
                                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-2">
                                    <Zap className="w-3.5 h-3.5" /> 추가 정보
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="glass-card p-3 rounded-xl border-white/5">
                                      <p className="text-[9px] text-muted-foreground uppercase font-bold mb-1">경기장</p>
                                      <p className="text-xs font-bold truncate">Seoul World Cup Stadium</p>
                                    </div>
                                    <div className="glass-card p-3 rounded-xl border-white/5">
                                      <p className="text-[9px] text-muted-foreground uppercase font-bold mb-1">날씨</p>
                                      <p className="text-xs font-bold">18°C, 맑음</p>
                                    </div>
                                    <div className="glass-card p-3 rounded-xl border-white/5">
                                      <p className="text-[9px] text-muted-foreground uppercase font-bold mb-1">심판</p>
                                      <p className="text-xs font-bold">Kim Cheol-su</p>
                                    </div>
                                    <div className="glass-card p-3 rounded-xl border-white/5">
                                      <p className="text-[9px] text-muted-foreground uppercase font-bold mb-1">배당사</p>
                                      <p className="text-xs font-bold text-primary">Pinnacle Official</p>
                                    </div>
                                  </div>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleOpenMarkets(m); }}
                                    className="w-full py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[10px] font-black hover:bg-primary hover:text-white transition-all uppercase tracking-widest"
                                  >
                                    전체 마켓 보기 (45+)
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
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
  </div>

  {/* Full Markets Modal */}
  {selectedMatch && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-hidden">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedMatch(null)} />
      
      <div className="relative w-full max-w-4xl glass-card rounded-[32px] overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-300">
        {/* Modal Header */}
        <div className="px-8 py-6 border-b border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary/20 p-2.5 rounded-2xl">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight">{selectedMatch.home} vs {selectedMatch.away}</h3>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">{selectedMatch.league} • 전체 마켓 현황</p>
            </div>
          </div>
          <button 
            onClick={() => setSelectedMatch(null)}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors group"
          >
            <X className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/20">
          {marketLoading ? (
            <div className="flex flex-col items-center justify-center p-32 space-y-4">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-sm font-bold text-muted-foreground animate-pulse">마켓 데이터를 분석하는 중...</p>
            </div>
          ) : (
            <div className="p-8">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="마켓 이름 검색..." 
                    value={marketSearch}
                    onChange={(e) => setMarketSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/[0.08] rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
                  {["인기", "득점", "전반", "핸디캡"].map(f => (
                    <button key={f} className="px-4 py-2 rounded-xl bg-white/5 border border-white/[0.06] text-[11px] font-bold hover:bg-white/10 transition-colors whitespace-nowrap">
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Market Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {markets
                  .filter(m => m.name.toLowerCase().includes(marketSearch.toLowerCase()))
                  .map((market, idx) => (
                    <div key={idx} className="glass-card rounded-[24px] overflow-hidden border border-white/[0.04] bg-white/[0.02] hover:border-white/[0.08] transition-colors">
                      <div className="px-5 py-3.5 border-b border-white/[0.04] bg-white/[0.02] flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">{market.name}</span>
                        <Info className="w-3.5 h-3.5 text-muted-foreground/30" />
                      </div>
                      <div className="p-5">
                        <div className="grid grid-cols-2 gap-2.5">
                          {market.values.map((v: any, vIdx: number) => (
                            <button key={vIdx} className="flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-primary/20 rounded-2xl border border-white/[0.04] hover:border-primary/30 transition-all group/opt">
                              <span className="text-[11px] font-bold text-muted-foreground group-hover/opt:text-foreground transition-colors">{v.value}</span>
                              <span className="text-sm font-black font-mono text-primary group-hover/opt:scale-110 transition-transform">{v.odd}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {markets.length === 0 && (
                <div className="text-center py-20">
                  <AlertCircle className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">검색 결과와 일치하는 마켓이 없습니다.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-8 py-5 border-t border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">배당 실시간 연동 중 • Pinnacle Official</span>
          </div>
          <button 
            onClick={() => setSelectedMatch(null)}
            className="btn-primary py-2.5 px-8 text-xs h-auto"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )}
  </div>
);
}
