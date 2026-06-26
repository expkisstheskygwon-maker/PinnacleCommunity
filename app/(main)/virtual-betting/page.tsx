"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  TrendingUp, Activity, Swords, Trophy, Zap, Clock, Shield,
  ChevronDown, Filter, Star, Info, Users, History, Check, X,
  Search, AlertCircle, ShoppingBag, Landmark, ArrowUpRight,
  Brain
} from "lucide-react";
import { cn } from "@/lib/utils";
import AnalysisModal from "../analysis/AnalysisModal";

const CATEGORIES = [
  { id: "soccer", label: "축구", icon: Swords },
  { id: "basketball", label: "농구", icon: Activity },
  { id: "baseball", label: "야구", icon: Trophy },
  { id: "volleyball", label: "배구", icon: Activity },
  { id: "hockey", label: "하키", icon: Activity },
];

function VirtualBettingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramSport = searchParams.get("sport");

  const [activeCat, setActiveCat] = useState("soccer");
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [profile, setProfile] = useState<any>(null);
  
  // Bet Slip States
  const [selectedBet, setSelectedBet] = useState<any | null>(null);
  const [stake, setStake] = useState<string>("");
  const [appliedItem, setAppliedItem] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // AI Prediction States
  const [selectedAiMatch, setSelectedAiMatch] = useState<any | null>(null);
  const [aiPredictions, setAiPredictions] = useState<any[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  // Bet Slip AI Prediction States
  const [slipPredictions, setSlipPredictions] = useState<any[]>([]);
  const [slipPredLoading, setSlipPredLoading] = useState(false);

  // Sync category with URL query param
  useEffect(() => {
    if (paramSport) {
      setActiveCat(paramSport);
    }
  }, [paramSport]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
      } else {
        setProfile(null);
      }
    } catch (err) {}
  };

  const fetchMatches = async (sport: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sports/matches?sport=${sport}&t=${Date.now()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "데이터를 불러오지 못했습니다.");
      
      // Filter out matches that don't have active odds to prevent betting on 0.00 odds
      const fetchedMatches = (data.matches || []).filter((m: any) => m.odds && (m.odds.h > 0 || m.odds.a > 0));
      setMatches(fetchedMatches);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAiAnalysis = async (match: any) => {
    setSelectedAiMatch(match);
    setAiLoading(true);
    try {
      const oddsQuery = match.odds 
        ? `&oddsH=${match.odds.h}&oddsD=${match.odds.d}&oddsA=${match.odds.a}` 
        : '';
      const res = await fetch(
        `/api/sports/predictions?fixtureId=${match.id}&sport=${activeCat}&home=${encodeURIComponent(match.home)}&away=${encodeURIComponent(match.away)}${oddsQuery}`
      );
      const data = await res.json();
      if (data.success && data.predictions) {
        setAiPredictions(data.predictions);
      } else {
        setAiPredictions([]);
      }
    } catch (err) {
      console.error(err);
      setAiPredictions([]);
    } finally {
      setAiLoading(false);
    }
  };

  // Automatically fetch prediction for selected bet in slip
  useEffect(() => {
    if (!selectedBet || !selectedBet.matchData) {
      setSlipPredictions([]);
      return;
    }
    const fetchSlipPredictions = async () => {
      setSlipPredLoading(true);
      try {
        const match = selectedBet.matchData;
        const oddsQuery = match.odds 
          ? `&oddsH=${match.odds.h}&oddsD=${match.odds.d}&oddsA=${match.odds.a}` 
          : '';
        const res = await fetch(
          `/api/sports/predictions?fixtureId=${match.id}&sport=${activeCat}&home=${encodeURIComponent(match.home)}&away=${encodeURIComponent(match.away)}${oddsQuery}`
        );
        const data = await res.json();
        if (data.success && data.predictions) {
          setSlipPredictions(data.predictions);
        } else {
          setSlipPredictions([]);
        }
      } catch (e) {
        console.error(e);
        setSlipPredictions([]);
      } finally {
        setSlipPredLoading(false);
      }
    };
    fetchSlipPredictions();
  }, [selectedBet?.matchId]);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    setMatches([]);
    fetchMatches(activeCat);
    setSelectedBet(null);
    setStake("");
    setAppliedItem(null);
  }, [activeCat]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleSelectOdd = (match: any, selection: string, odds: number) => {
    if (!profile) {
      showToast('error', '가상 배팅을 진행하려면 먼저 로그인해주셔야 합니다.');
      return;
    }
    
    if (match.finished) {
      showToast('error', '종료된 경기에는 배팅할 수 없습니다.');
      return;
    }

    let selectionKo = selection;
    if (selection === 'home') selectionKo = '홈승';
    else if (selection === 'away') selectionKo = '원정승';
    else if (selection === 'draw') selectionKo = '무승부';

    setSelectedBet({
      matchId: String(match.id),
      matchName: `${match.home} vs ${match.away}`,
      sport: activeCat,
      league: match.league,
      market: 'Match Winner',
      selection: selectionKo,
      odds,
      matchData: match,
    });
    setStake("");
    setAppliedItem(null);
  };

  const handlePlaceBet = async () => {
    if (!profile || !selectedBet || submitting) return;
    const stakeNum = parseInt(stake);
    
    if (isNaN(stakeNum) || stakeNum <= 0) {
      showToast('error', '배팅 금액을 정확히 입력해주세요.');
      return;
    }

    if (stakeNum > profile.points) {
      showToast('error', '보유한 포인트보다 많은 금액을 배팅할 수 없습니다.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/betting-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sport: selectedBet.sport,
          league: selectedBet.league,
          match: selectedBet.matchName,
          matchId: selectedBet.matchId,
          market: selectedBet.market,
          selection: selectedBet.selection,
          odds: selectedBet.odds,
          stake: stakeNum,
          isVirtual: 1,
          appliedItem
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast('success', data.message);
        setSelectedBet(null);
        setStake("");
        setAppliedItem(null);
        fetchProfile(); // update point balance
        router.refresh();
      } else {
        showToast('error', data.error);
      }
    } catch (err) {
      showToast('error', '배팅 처리 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    return matches.filter(m => {
      if (!searchTerm) return true;
      const lowerSearch = searchTerm.toLowerCase();
      return (
        m.league?.toLowerCase().includes(lowerSearch) ||
        m.home?.toLowerCase().includes(lowerSearch) ||
        m.away?.toLowerCase().includes(lowerSearch)
      );
    });
  }, [matches, searchTerm]);

  // Inventory item counts
  const boosterCount = profile?.inventory?.find((i: any) => i.itemType === 'odds_booster')?.quantity || 0;
  const insuranceCount = profile?.inventory?.find((i: any) => i.itemType === 'bet_insurance')?.quantity || 0;

  const estimatedPayout = useMemo(() => {
    const stakeNum = parseInt(stake) || 0;
    if (!selectedBet || stakeNum <= 0) return 0;
    let payout = stakeNum * selectedBet.odds;
    if (appliedItem === 'odds_booster') {
      payout = payout * 1.10;
    }
    return Math.floor(payout);
  }, [stake, selectedBet, appliedItem]);

  return (
    <div className="mesh-gradient min-h-screen pb-20">
      <div className="container mx-auto px-4 py-10 max-w-7xl">
        
        {/* Toast Notification */}
        {message && (
          <div className={cn(
            "fixed top-20 right-4 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-top-5 duration-300",
            message.type === 'success' 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
              : "bg-red-500/10 border-red-500/20 text-red-400"
          )}>
            {message.type === 'success' ? <Check className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <span className="text-sm font-bold">{message.text}</span>
          </div>
        )}

        {/* Header Section */}
        <div className="mb-8 pb-6 border-b border-white/[0.06] flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-primary font-black uppercase tracking-widest mb-1.5">
              <Landmark className="w-4 h-4" />
              <span>Virtual Betting Arena</span>
            </div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">가상 배팅 센터</h1>
            <p className="text-xs text-muted-foreground mt-2">
              실제 자금의 손실 없이 Pinnacle 실시간 배당을 통해 스포츠 배팅의 짜릿함을 경험해 보세요.
            </p>
          </div>

          {profile && (
            <div className="flex items-center gap-3">
              <div className="glass-card rounded-2xl px-5 py-2.5 border-white/5 flex items-center gap-3">
                <Zap className="w-5 h-5 text-[hsl(var(--gold))] fill-current" />
                <div className="text-left">
                  <p className="text-[9px] text-muted-foreground uppercase font-bold">보유 포인트</p>
                  <p className="text-sm font-black font-mono text-[hsl(var(--gold))]">{profile.points.toLocaleString()} VP</p>
                </div>
              </div>
              <Link href="/point-shop" className="btn-primary py-2.5 px-4 text-xs font-bold flex items-center gap-1.5 bg-primary/10 border border-primary/20 hover:bg-primary text-primary hover:text-white transition-all">
                <ShoppingBag className="w-4 h-4" /> 포인트 상점
              </Link>
            </div>
          )}
        </div>

        {/* Main Grid: Match List & Bet Slip */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
          
          {/* Match Feed */}
          <div className="space-y-6">
            
            {/* Search and Categories */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full md:w-auto">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCat(cat.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border",
                      activeCat === cat.id
                        ? "bg-primary text-white border-primary shadow-[0_0_12px_rgba(59,130,246,0.25)]"
                        : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 border-white/[0.05]"
                    )}
                  >
                    <cat.icon className="w-3.5 h-3.5" />
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-80 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="팀 또는 리그 검색..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-primary/50 focus:bg-white/[0.08] transition-all"
                />
              </div>
            </div>

            {/* Match Table */}
            <div className="glass-card rounded-[28px] overflow-hidden border-white/[0.04] shadow-2xl">
              {loading ? (
                <div className="flex flex-col items-center justify-center p-24 space-y-4">
                  <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <p className="text-xs text-muted-foreground animate-pulse">실시간 스포츠 피드 조회 중...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center p-20 space-y-4">
                  <p className="text-red-400 font-bold text-sm">데이터를 불러오지 못했습니다.</p>
                  <button onClick={() => fetchMatches(activeCat)} className="btn-primary py-2 px-5 text-xs rounded-xl">다시 시도</button>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-24 text-muted-foreground text-xs space-y-2">
                  <Swords className="w-8 h-8 opacity-20" />
                  <p>배팅 가능한 활성 경기가 없습니다.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-white/[0.02] text-[10px] text-muted-foreground uppercase font-bold border-b border-white/[0.06]">
                        <th className="px-5 py-4">리그 / 시간</th>
                        <th className="px-5 py-4 text-center">경기 매치</th>
                        <th className="px-4 py-4 text-center w-[100px]">승 (1)</th>
                        {filtered.some(m => m.odds?.d > 0) && <th className="px-4 py-4 text-center w-[100px]">무 (X)</th>}
                        <th className="px-4 py-4 text-center w-[100px]">패 (2)</th>
                        <th className="px-5 py-4 text-right">상태</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {filtered.map(m => {
                        const isLive = m.live;
                        const showsDraw = m.odds?.d > 0;
                        const isMatchSelected = selectedBet?.matchId === String(m.id);

                        return (
                          <tr 
                            key={m.id} 
                            className={cn(
                              "hover:bg-white/[0.02] transition-colors",
                              isMatchSelected && "bg-primary/[0.02]"
                            )}
                          >
                            <td className="px-5 py-5">
                              <p className="text-[10px] font-bold text-primary max-w-[120px] truncate">{m.league}</p>
                              <p className="text-[9px] text-muted-foreground mt-1 font-mono">{m.date} {m.time}</p>
                            </td>
                            
                            <td className="px-5 py-5">
                              <div className="flex flex-col items-center gap-1.5">
                                <div className="flex items-center justify-center gap-4 w-full">
                                  <span className="font-bold text-right flex-1 truncate max-w-[140px]">{m.home}</span>
                                  <div className="px-2 py-0.5 rounded bg-black/40 border border-white/5 font-mono text-[11px] font-black text-red-500 shrink-0">
                                    {m.scores?.home} : {m.scores?.away}
                                  </div>
                                  <span className="font-bold text-left flex-1 truncate max-w-[140px]">{m.away}</span>
                                </div>
                                <button
                                  onClick={() => handleOpenAiAnalysis(m)}
                                  className="px-2.5 py-1 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary text-[10px] font-bold rounded-lg flex items-center gap-1 transition-all mt-0.5 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                  <Brain className="w-3 h-3 text-primary animate-pulse" />
                                  AI 분석 리포트
                                </button>
                              </div>
                            </td>

                            {/* Home Odd Button */}
                            <td className="px-3 py-5 text-center">
                              <button
                                disabled={!(m.odds?.h > 0) || m.finished}
                                onClick={() => handleSelectOdd(m, 'home', m.odds.h)}
                                className={cn(
                                  "w-full py-2.5 rounded-xl border font-mono font-bold transition-all text-xs flex flex-col items-center justify-center gap-0.5",
                                  selectedBet?.matchId === String(m.id) && selectedBet?.selection === '홈승'
                                    ? "bg-primary border-primary text-white"
                                    : "bg-white/5 border-white/[0.04] hover:bg-white/10 hover:border-white/10"
                                )}
                              >
                                <span className="text-[9px] text-muted-foreground group-hover:text-white/60">홈</span>
                                <span>{m.odds?.h > 0 ? m.odds.h.toFixed(2) : '-'}</span>
                              </button>
                            </td>

                            {/* Draw Odd Button (Conditional) */}
                            {showsDraw && (
                              <td className="px-3 py-5 text-center">
                                <button
                                  disabled={!(m.odds?.d > 0) || m.finished}
                                  onClick={() => handleSelectOdd(m, 'draw', m.odds.d)}
                                  className={cn(
                                    "w-full py-2.5 rounded-xl border font-mono font-bold transition-all text-xs flex flex-col items-center justify-center gap-0.5",
                                    selectedBet?.matchId === String(m.id) && selectedBet?.selection === '무승부'
                                      ? "bg-primary border-primary text-white"
                                      : "bg-white/5 border-white/[0.04] hover:bg-white/10 hover:border-white/10"
                                  )}
                                >
                                  <span className="text-[9px] text-muted-foreground">무</span>
                                  <span>{m.odds?.d > 0 ? m.odds.d.toFixed(2) : '-'}</span>
                                </button>
                              </td>
                            )}

                            {/* Away Odd Button */}
                            <td className="px-3 py-5 text-center">
                              <button
                                disabled={!(m.odds?.a > 0) || m.finished}
                                onClick={() => handleSelectOdd(m, 'away', m.odds.a)}
                                className={cn(
                                  "w-full py-2.5 rounded-xl border font-mono font-bold transition-all text-xs flex flex-col items-center justify-center gap-0.5",
                                  selectedBet?.matchId === String(m.id) && selectedBet?.selection === '원정승'
                                    ? "bg-primary border-primary text-white"
                                    : "bg-white/5 border-white/[0.04] hover:bg-white/10 hover:border-white/10"
                                )}
                              >
                                <span className="text-[9px] text-muted-foreground">원정</span>
                                <span>{m.odds?.a > 0 ? m.odds.a.toFixed(2) : '-'}</span>
                              </button>
                            </td>

                            <td className="px-5 py-5 text-right font-bold">
                              {isLive ? (
                                <span className="text-red-500 font-black animate-pulse flex items-center gap-1 justify-end">
                                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                  LIVE
                                </span>
                              ) : (
                                <span className="text-muted-foreground/60">대기 중</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Bet Slip Sidebar Drawer */}
          <aside className="sticky top-24">
            {selectedBet ? (
              <div className="glass-card rounded-[32px] p-6 border-white/[0.08] shadow-2xl space-y-6 animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <h3 className="font-black text-sm tracking-tight flex items-center gap-1.5 text-primary">
                    <TrendingUp className="w-4.5 h-4.5" /> 배팅 슬립 (Bet Slip)
                  </h3>
                  <button 
                    onClick={() => { setSelectedBet(null); setStake(""); setAppliedItem(null); }}
                    className="p-1.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                {/* Selected Bet Details */}
                <div className="bg-black/35 rounded-2xl p-4 border border-white/5 space-y-2 text-left">
                  <p className="text-[9px] font-bold text-primary uppercase tracking-widest">{selectedBet.league}</p>
                  <h4 className="text-xs font-black truncate">{selectedBet.matchName}</h4>
                  <div className="h-px bg-white/5 my-2" />
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-muted-foreground uppercase font-bold">선택 픽</span>
                      <span className="font-black text-emerald-400">{selectedBet.selection}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] text-muted-foreground uppercase font-bold">배당률</span>
                      <span className="font-black font-mono text-sm">@{selectedBet.odds.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* AI Predictions Summary inside Bet Slip */}
                <div className="bg-primary/5 rounded-2xl p-3.5 border border-primary/10 text-left space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-primary font-black uppercase tracking-wider flex items-center gap-1.5">
                      <Brain className="w-3.5 h-3.5 text-primary" /> AI 분석 피드
                    </span>
                    <button
                      onClick={() => handleOpenAiAnalysis(selectedBet.matchData)}
                      className="text-[9px] text-muted-foreground hover:text-primary transition-colors font-bold uppercase"
                    >
                      상세 보기 &rarr;
                    </button>
                  </div>
                  {slipPredLoading ? (
                    <div className="flex items-center gap-2 py-1">
                      <div className="w-3.5 h-3.5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                      <span className="text-[10px] text-muted-foreground animate-pulse">AI 예측 분석 중...</span>
                    </div>
                  ) : slipPredictions.length > 0 ? (
                    <div className="grid grid-cols-3 gap-1.5">
                      {slipPredictions.map((pred, i) => {
                        const isMatch = selectedBet.selection?.includes(pred.pick.replace(" 승", ""));
                        return (
                          <div key={i} className={cn(
                            "bg-black/20 rounded-xl p-2 border border-white/5 text-center flex flex-col gap-0.5",
                            isMatch && "border-primary/30 bg-primary/5"
                          )}>
                            <span className="text-[8px] text-muted-foreground truncate font-semibold">{pred.botName.replace("AI ", "")}</span>
                            <span className={cn("text-[10px] font-black", isMatch ? "text-primary" : "text-white")}>{pred.pick}</span>
                            <span className="text-[8px] text-muted-foreground/60 font-mono font-bold">{pred.winRate}% 신뢰</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[10px] text-muted-foreground/60 py-1">이 경기에 대한 예측 데이터가 없습니다.</p>
                  )}
                </div>

                {/* Stake Input */}
                <div className="space-y-2 text-left">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">배팅 금액 입력 (VP)</label>
                    {profile && (
                      <span className="text-[9px] text-muted-foreground font-semibold">보유: {profile.points.toLocaleString()} VP</span>
                    )}
                  </div>
                  <input
                    type="number"
                    placeholder="최소 100 VP 이상"
                    value={stake}
                    onChange={(e) => setStake(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold font-mono focus:outline-none focus:border-primary/50 outline-none"
                  />
                  
                  {/* Quick stake buttons */}
                  {profile && (
                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                      {[
                        { label: "+1K", value: 1000 },
                        { label: "+5K", value: 5000 },
                        { label: "+10K", value: 10000 },
                        { label: "MAX", value: profile.points }
                      ].map((btn, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            const currentStake = parseInt(stake) || 0;
                            if (btn.label === "MAX") {
                              setStake(String(btn.value));
                            } else {
                              setStake(String(currentStake + btn.value));
                            }
                          }}
                          className="py-1.5 rounded-lg bg-white/5 border border-white/[0.04] text-[10px] font-bold text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Booster / Insurance Cards Checklist */}
                {profile && (boosterCount > 0 || insuranceCount > 0) && (
                  <div className="space-y-2 text-left border-t border-white/5 pt-4">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">부스터/보험 카드 적용</label>
                    <div className="space-y-1.5 pt-1">
                      {boosterCount > 0 && (
                        <button
                          type="button"
                          onClick={() => setAppliedItem(appliedItem === 'odds_booster' ? null : 'odds_booster')}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-bold border transition-all",
                            appliedItem === 'odds_booster'
                              ? "bg-primary/10 border-primary text-primary"
                              : "bg-white/5 border-white/[0.04] text-muted-foreground"
                          )}
                        >
                          <span className="flex items-center gap-1.5"><ArrowUpRight className="w-3.5 h-3.5" /> 배당 부스터 (+10%)</span>
                          <span>보유: {boosterCount}장</span>
                        </button>
                      )}
                      {insuranceCount > 0 && (
                        <button
                          type="button"
                          onClick={() => setAppliedItem(appliedItem === 'bet_insurance' ? null : 'bet_insurance')}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-bold border transition-all",
                            appliedItem === 'bet_insurance'
                              ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                              : "bg-white/5 border-white/[0.04] text-muted-foreground"
                          )}
                        >
                          <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> 배팅 보험 (50% 환급)</span>
                          <span>보유: {insuranceCount}장</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Potential Payout */}
                <div className="border-t border-white/5 pt-4 flex justify-between items-center text-left">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">예상 적중금</span>
                  <span className="text-base font-black font-mono text-[hsl(var(--gold))]">{estimatedPayout.toLocaleString()} VP</span>
                </div>

                {/* Place Bet Button */}
                <button
                  disabled={submitting}
                  onClick={handlePlaceBet}
                  className="w-full btn-primary py-3.5 text-xs font-black uppercase rounded-2xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {submitting ? "배팅 전송 중..." : "배팅 완료 (Place Bet)"}
                </button>
              </div>
            ) : (
              <div className="glass-card rounded-[32px] p-8 border-white/[0.05] shadow-2xl text-center py-20 space-y-4 animate-in fade-in duration-300">
                <Trophy className="w-12 h-12 text-muted-foreground/15 mx-auto" />
                <div className="space-y-1">
                  <h3 className="font-black text-sm">배팅 슬립 비어있음</h3>
                  <p className="text-[10px] text-muted-foreground max-w-[200px] mx-auto leading-relaxed">
                    왼쪽의 경기 목록에서 원하는 승/무/패 배당률 버튼을 선택하여 슬립에 추가해 주세요.
                  </p>
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* AI Detailed Analysis Modal */}
        {selectedAiMatch && (
          <AnalysisModal
            isOpen={!!selectedAiMatch}
            onClose={() => {
              setSelectedAiMatch(null);
              setAiPredictions([]);
            }}
            match={{
              id: selectedAiMatch.id,
              league: selectedAiMatch.league,
              date: selectedAiMatch.date,
              time: selectedAiMatch.time,
              home: selectedAiMatch.home,
              away: selectedAiMatch.away,
              homeLogo: selectedAiMatch.homeLogo,
              awayLogo: selectedAiMatch.awayLogo,
            }}
            predictions={aiPredictions}
          />
        )}
      </div>
    </div>
  );
}

export default function VirtualBettingPage() {
  return (
    <Suspense fallback={
      <div className="mesh-gradient min-h-screen flex flex-col items-center justify-center p-20 space-y-4">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground animate-pulse">로딩 중...</p>
      </div>
    }>
      <VirtualBettingContent />
    </Suspense>
  );
}
