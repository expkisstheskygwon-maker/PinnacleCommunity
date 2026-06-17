"use client";

import { useState } from "react";
import { Plus, Trash2, Info, ShieldCheck, CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Selection {
  id: string;
  name: string;
  odds: string;
  outcome: "win" | "lose" | "void";
}

export default function BetCalc() {
  const [betType, setBetType] = useState<"single" | "parlay" | "system">("parlay");
  const [selections, setSelections] = useState<Selection[]>([
    { id: "1", name: "경기 1", odds: "1.91", outcome: "win" },
    { id: "2", name: "경기 2", odds: "1.91", outcome: "win" },
    { id: "3", name: "경기 3", odds: "1.91", outcome: "win" },
  ]);
  const [totalStake, setTotalStake] = useState<number>(100);
  const [systemK, setSystemK] = useState<number>(2); // for system bets: 'k' out of 'n'

  // Add selection
  const handleAddSelection = () => {
    const nextId = (Math.max(...selections.map(s => parseInt(s.id))) + 1).toString();
    setSelections([
      ...selections,
      { id: nextId, name: `경기 ${nextId}`, odds: "1.91", outcome: "win" }
    ]);
  };

  // Remove selection
  const handleRemoveSelection = (id: string) => {
    if (selections.length <= 1) return;
    setSelections(selections.filter(s => s.id !== id));
  };

  // Update selection value
  const handleUpdateSelection = (id: string, field: keyof Selection, value: any) => {
    setSelections(selections.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  // Clear selections
  const handleClear = () => {
    setSelections([
      { id: "1", name: "경기 1", odds: "", outcome: "win" },
      { id: "2", name: "경기 2", odds: "", outcome: "win" },
    ]);
  };

  // Helper to parse odds safely
  const parseOdds = (oddsStr: string): number => {
    const num = parseFloat(oddsStr);
    return isNaN(num) || num <= 0 ? 0 : num;
  };

  // 1. Single Bet Calculation
  const calculateSingles = () => {
    const activeSels = selections.filter(s => parseOdds(s.odds) > 0);
    if (activeSels.length === 0) return { totalPayout: 0, totalProfit: 0, details: [] };

    const stakePerBet = totalStake / activeSels.length;
    let totalPayout = 0;
    
    const details = activeSels.map(s => {
      const o = parseOdds(s.odds);
      let payout = 0;
      if (s.outcome === "win") {
        payout = stakePerBet * o;
      } else if (s.outcome === "void") {
        payout = stakePerBet;
      }
      totalPayout += payout;
      return {
        id: s.id,
        name: s.name,
        stake: stakePerBet,
        payout,
        profit: payout - stakePerBet
      };
    });

    return {
      totalPayout,
      totalProfit: totalPayout - totalStake,
      details
    };
  };

  // 2. Parlay (Accumulator) Calculation
  const calculateParlay = () => {
    const activeSels = selections.filter(s => parseOdds(s.odds) > 0);
    if (activeSels.length === 0) return { totalOdds: 0, totalPayout: 0, totalProfit: 0, status: "pending" };

    let totalOdds = 1;
    let hasLost = false;

    activeSels.forEach(s => {
      const o = parseOdds(s.odds);
      if (s.outcome === "lose") {
        hasLost = true;
      } else if (s.outcome === "void") {
        totalOdds *= 1.0;
      } else {
        totalOdds *= o;
      }
    });

    if (hasLost) {
      return {
        totalOdds: activeSels.length > 0 ? totalOdds : 0,
        totalPayout: 0,
        totalProfit: -totalStake,
        status: "lost"
      };
    }

    const totalPayout = totalStake * totalOdds;
    return {
      totalOdds,
      totalPayout,
      totalProfit: totalPayout - totalStake,
      status: "won"
    };
  };

  // Helper to generate combinations of size k
  const getCombinations = <T,>(array: T[], k: number): T[][] => {
    const result: T[][] = [];
    const helper = (start: number, combo: T[]) => {
      if (combo.length === k) {
        result.push([...combo]);
        return;
      }
      for (let i = start; i < array.length; i++) {
        combo.push(array[i]);
        helper(i + 1, combo);
        combo.pop();
      }
    };
    helper(0, []);
    return result;
  };

  // 3. System Bet Calculation (k of n)
  const calculateSystem = () => {
    const activeSels = selections.filter(s => parseOdds(s.odds) > 0);
    const n = activeSels.length;
    
    if (n === 0 || systemK > n || systemK <= 0) {
      return { totalBets: 0, totalPayout: 0, totalProfit: 0, winningBets: 0, details: [] };
    }

    const combos = getCombinations(activeSels, systemK);
    const totalBets = combos.length;
    const stakePerBet = totalStake / totalBets;
    
    let totalPayout = 0;
    let winningBetsCount = 0;

    const details = combos.map((combo, idx) => {
      let comboOdds = 1;
      let isComboWon = true;

      combo.forEach(s => {
        const o = parseOdds(s.odds);
        if (s.outcome === "lose") {
          isComboWon = false;
        } else if (s.outcome === "void") {
          comboOdds *= 1.0;
        } else {
          comboOdds *= o;
        }
      });

      const payout = isComboWon ? stakePerBet * comboOdds : 0;
      totalPayout += payout;
      if (isComboWon) winningBetsCount++;

      return {
        id: idx + 1,
        comboNames: combo.map(s => s.name).join(" + "),
        comboOdds: isComboWon ? comboOdds : 0,
        payout,
        status: isComboWon ? "won" : "lost"
      };
    });

    return {
      totalBets,
      totalPayout,
      totalProfit: totalPayout - totalStake,
      winningBets: winningBetsCount,
      details
    };
  };

  // Calculations Results selectors
  const singlesResult = calculateSingles();
  const parlayResult = calculateParlay();
  const systemResult = calculateSystem();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Left Column: Calculator Card */}
      <div className="lg:col-span-2 glass-card rounded-2xl p-6 md:p-8 border-white/[0.04] shadow-2xl relative overflow-hidden">
        
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
        
        <div className="space-y-6">
          
          {/* Row 1: Bet Types & General Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">베팅 유형</label>
              <div className="grid grid-cols-3 gap-1 bg-secondary/40 border border-white/10 p-1 rounded-xl h-[46px] items-center">
                <button
                  type="button"
                  onClick={() => setBetType("single")}
                  className={cn(
                    "h-full text-xs font-bold rounded-lg transition-all",
                    betType === "single" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  싱글
                </button>
                <button
                  type="button"
                  onClick={() => setBetType("parlay")}
                  className={cn(
                    "h-full text-xs font-bold rounded-lg transition-all",
                    betType === "parlay" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  멀티 (파레이)
                </button>
                <button
                  type="button"
                  onClick={() => setBetType("system")}
                  className={cn(
                    "h-full text-xs font-bold rounded-lg transition-all",
                    betType === "system" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  시스템
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">총 베팅 금액</label>
                <span className="text-xs font-bold text-primary">${totalStake.toLocaleString()}</span>
              </div>
              <input
                type="number"
                min="1"
                value={totalStake === 0 ? "" : totalStake}
                onChange={(e) => setTotalStake(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-secondary/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-semibold text-foreground focus:outline-none focus:border-primary/50 transition-colors h-[46px]"
              />
            </div>
          </div>

          {/* System Bet Specific Configuration */}
          {betType === "system" && (
            <div className="bg-secondary/20 border border-white/5 rounded-xl p-4 space-y-3 animate-scale-in">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">조합 크기 선택 (System Combinations)</label>
                <span className="text-xs font-bold text-primary">{systemK} / {selections.length}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: selections.length - 1 }, (_, i) => i + 2).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setSystemK(k)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                      systemK === k 
                        ? "bg-primary/20 border-primary text-primary" 
                        : "bg-background/40 border-white/10 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {k}폴더 조합 ({getCombinations(selections, k).length}개 베팅)
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="section-divider" />

          {/* Selections List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">경기 리스트</h3>
              <span className="text-xs text-muted-foreground/60 italic">각 경기별 배당 및 예측 결과를 선택하세요.</span>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {selections.map((sel) => (
                <div 
                  key={sel.id} 
                  className="bg-secondary/20 border border-white/5 rounded-xl p-3 grid grid-cols-1 md:grid-cols-12 items-center gap-3"
                >
                  <div className="md:col-span-3">
                    <input 
                      type="text" 
                      value={sel.name}
                      onChange={(e) => handleUpdateSelection(sel.id, "name", e.target.value)}
                      className="bg-transparent border-b border-white/10 hover:border-white/20 focus:border-primary text-xs font-bold text-foreground w-full py-1 focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <input 
                      type="text" 
                      value={sel.odds}
                      placeholder="배당률 (예: 1.91)"
                      onChange={(e) => handleUpdateSelection(sel.id, "odds", e.target.value)}
                      className="w-full bg-background/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:border-primary/50"
                    />
                  </div>

                  <div className="md:col-span-5 flex items-center gap-1.5 justify-end">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider mr-2">시뮬레이션:</span>
                    <button
                      type="button"
                      onClick={() => handleUpdateSelection(sel.id, "outcome", "win")}
                      className={cn(
                        "px-2.5 py-1 rounded text-[10px] font-bold transition-all",
                        sel.outcome === "win" 
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                          : "bg-background/20 text-muted-foreground border border-transparent hover:border-white/10"
                      )}
                    >
                      적중
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateSelection(sel.id, "outcome", "lose")}
                      className={cn(
                        "px-2.5 py-1 rounded text-[10px] font-bold transition-all",
                        sel.outcome === "lose" 
                          ? "bg-red-500/20 text-red-400 border border-red-500/30" 
                          : "bg-background/20 text-muted-foreground border border-transparent hover:border-white/10"
                      )}
                    >
                      미적중
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateSelection(sel.id, "outcome", "void")}
                      className={cn(
                        "px-2.5 py-1 rounded text-[10px] font-bold transition-all",
                        sel.outcome === "void" 
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" 
                          : "bg-background/20 text-muted-foreground border border-transparent hover:border-white/10"
                      )}
                    >
                      적특 (1.0배)
                    </button>
                  </div>

                  <div className="md:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveSelection(sel.id)}
                      disabled={selections.length <= 1}
                      className="text-muted-foreground hover:text-red-400 transition-colors disabled:opacity-40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={handleAddSelection}
                className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover transition-colors"
              >
                <Plus className="w-4 h-4" /> 새로운 경기 추가
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="text-xs font-bold text-muted-foreground hover:text-red-400 transition-colors"
              >
                초기화
              </button>
            </div>
          </div>

          {/* Results dashboard based on betType */}
          <div className="section-divider" />

          {betType === "single" && (
            <div className="bg-secondary/20 border border-white/5 rounded-2xl p-5 md:p-6 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">싱글 베팅 결과 시뮬레이션</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-[11px] text-muted-foreground block">총 투자금액</span>
                  <span className="text-base font-bold text-foreground block">${totalStake.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground block">예상 지급금</span>
                  <span className="text-base font-bold text-emerald-400 block">${singlesResult.totalPayout.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground block">순수익</span>
                  <span className={cn("text-base font-bold block", singlesResult.totalProfit >= 0 ? "text-emerald-400" : "text-red-400")}>
                    ${singlesResult.totalProfit.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="border-t border-white/5 pt-3 space-y-1.5 text-xs">
                <span className="text-muted-foreground block font-bold text-[10px] uppercase tracking-wider mb-2">경기별 세부 내역 (개별 배팅액: ${(totalStake / selections.filter(s => parseOdds(s.odds) > 0).length || 0).toFixed(2)})</span>
                {singlesResult.details.map((item) => (
                  <div key={item.id} className="flex justify-between items-center bg-white/[0.02] p-2 rounded">
                    <span className="font-semibold text-foreground">{item.name}</span>
                    <div className="space-x-4">
                      <span className="text-muted-foreground">지급: <strong className="text-foreground">${item.payout.toFixed(2)}</strong></span>
                      <span className={item.profit >= 0 ? "text-emerald-400" : "text-red-400"}>수익: <strong>${item.profit.toFixed(2)}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {betType === "parlay" && (
            <div className={cn(
              "border rounded-2xl p-5 md:p-6 transition-all duration-300",
              parlayResult.status === "lost" 
                ? "border-red-500/30 bg-red-500/5 text-red-400" 
                : "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
            )}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">멀티 (파레이) 베팅 결과</h4>
                  <p className="text-sm font-semibold opacity-90 leading-tight mt-1">
                    {parlayResult.status === "lost" 
                      ? "미적중 (한 경기 이상의 패배가 포함됨)" 
                      : "모두 적중! 무결점 승리"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black block text-foreground">{parlayResult.totalOdds.toFixed(2)}배</span>
                  <span className="text-[10px] text-muted-foreground">합산 총 배당률</span>
                </div>
              </div>
              
              <div className="border-t border-white/10 pt-4 grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground block">총 베팅 금액</span>
                  <span className="text-base font-bold text-foreground block">${totalStake.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">예상 지급금</span>
                  <span className="text-base font-bold text-foreground block">${parlayResult.totalPayout.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">시뮬레이션 순수익</span>
                  <span className={cn("text-base font-bold block", parlayResult.totalProfit >= 0 ? "text-emerald-400 animate-pulse" : "text-red-400")}>
                    ${parlayResult.totalProfit.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {betType === "system" && (
            <div className="bg-secondary/20 border border-white/5 rounded-2xl p-5 md:p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">시스템 베팅 결과</h4>
                  <p className="text-sm font-semibold opacity-90 leading-tight mt-1">
                    총 {systemResult.totalBets}개 조합 중 <strong className="text-primary">{systemResult.winningBets}개 조합</strong> 적중
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground">조합당 배팅금</span>
                  <span className="text-base font-bold text-foreground block">${(totalStake / (systemResult.totalBets || 1)).toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground block">총 투자금액</span>
                  <span className="text-base font-bold text-foreground block">${totalStake.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">총 반환금 (지급)</span>
                  <span className="text-base font-bold text-emerald-400 block">${systemResult.totalPayout.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">합산 순수익</span>
                  <span className={cn("text-base font-bold block", systemResult.totalProfit >= 0 ? "text-emerald-400" : "text-red-400")}>
                    ${systemResult.totalProfit.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Combination Details list */}
              <div className="border-t border-white/5 pt-3 space-y-1.5 text-xs max-h-[160px] overflow-y-auto">
                <span className="text-muted-foreground font-bold text-[10px] uppercase tracking-wider block mb-1">상세 조합별 지급 현황</span>
                {systemResult.details.map((detail) => (
                  <div key={detail.id} className="flex justify-between items-center bg-white/[0.02] p-2 rounded text-[11px]">
                    <span className="text-muted-foreground truncate max-w-[200px]">{detail.comboNames}</span>
                    <div className="flex items-center gap-3">
                      {detail.status === "won" ? (
                        <>
                          <span className="text-[10px] font-bold text-emerald-400">적중 ({detail.comboOdds.toFixed(2)}배)</span>
                          <span className="font-bold text-foreground">${detail.payout.toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">미적중 ($0.00)</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Right Column: Educational Card */}
      <div className="space-y-6">
        
        {/* Guide Card */}
        <div className="glass-card rounded-2xl p-6 border-white/[0.04] shadow-xl">
          <h2 className="text-base font-bold flex items-center gap-2 mb-4 text-glow">
            <Info className="w-4 h-4 text-primary" /> 베팅 유형별 개념 가이드
          </h2>
          
          <div className="space-y-4 text-xs text-muted-foreground leading-relaxed">
            <div>
              <h4 className="font-bold text-foreground mb-1">1. 싱글 (Single) 베팅</h4>
              <p>
                가장 정석적이고 안전한 방식입니다. 
                선택한 각 경기에 독립적으로 베팅을 배분하므로 한 경기가 부러지더라도 
                다른 경기들이 적중하면 그만큼 부분 수익을 올릴 수 있어 자금 관리(Bankroll Management)에 유리합니다.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-1">2. 멀티 / 파레이 (Parlay)</h4>
              <p>
                높은 배당 시너지 효과를 얻는 대신, 모든 선택이 맞아야 당첨금을 얻는 고위험-고수익 방식입니다. 
                단 한 경기의 무승부나 취소가 발생할 경우, 해당 매치는 1.0배(Void/적특)로 계산되며 파레이 전체는 유지됩니다.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-1">3. 시스템 (System) 베팅</h4>
              <p>
                조합(Combination) 베팅이라고도 부르며, 여러 경기를 묶되 모든 경기가 다 맞지 않더라도 부분 환급을 받을 수 있는 구조입니다. 
                예컨대 &quot;3경기 중 2경기 조합&quot;을 선택하면, 2경기만 적중해도 해당 적중 조합에 할당된 당첨금을 정상적으로 수령하게 됩니다.
              </p>
            </div>
          </div>
        </div>

        {/* Pro Bet Tip Card */}
        <div className="glass-card rounded-2xl p-6 border-white/[0.04] shadow-xl">
          <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> 프로 베터의 팁
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            파레이 베팅은 배당률이 곱해질수록 사이트의 마진(수수료)도 기하급수적으로 복리 가산되어 베터에게 통계적으로 불리해집니다. 
            따라서 멀티 베팅을 조합할 때는 애초에 기준 마진율이 가장 좁고 고배당을 제공하는 사이트를 선택해야 기대 수익 편차가 발생하지 않습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
