"use client";

import { useState } from "react";
import { ArrowRightLeft, Trash2, Info, ShieldCheck, TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ArbitrageCalc() {
  const [oddsFormat, setOddsFormat] = useState<"american" | "decimal">("decimal");
  const [marketType, setMarketType] = useState<"2way" | "3way">("2way");
  
  const [option1, setOption1] = useState<string>("");
  const [option2, setOption2] = useState<string>("");
  const [option3, setOption3] = useState<string>("");
  const [totalStake, setTotalStake] = useState<number>(1000);

  // Clear all fields
  const handleClear = () => {
    setOption1("");
    setOption2("");
    setOption3("");
  };

  // Convert input to decimal odds
  const parseToDecimal = (val: string, format: "american" | "decimal"): number => {
    const num = parseFloat(val);
    if (isNaN(num)) return 0;
    
    if (format === "decimal") {
      return num > 1.0 ? num : 0;
    } else {
      // American odds
      if (num === 0) return 0;
      if (num > 0) {
        return 1 + (num / 100);
      } else {
        return 1 + (100 / Math.abs(num));
      }
    }
  };

  // Get Implied probability from decimal odds
  const getImpliedProb = (decimalOdds: number): number => {
    if (decimalOdds <= 1.0) return 0;
    return 1 / decimalOdds;
  };

  // Compute values
  const d1 = parseToDecimal(option1, oddsFormat);
  const d2 = parseToDecimal(option2, oddsFormat);
  const d3 = marketType === "3way" ? parseToDecimal(option3, oddsFormat) : 0;

  const p1 = getImpliedProb(d1);
  const p2 = getImpliedProb(d2);
  const p3 = marketType === "3way" ? getImpliedProb(d3) : 0;

  // Total implied probability (Arbitrage %)
  const arbPercent = p1 + p2 + p3;
  const isArbOpportunity = arbPercent > 0 && arbPercent < 1.0;

  // Individual stakes & payouts
  let stake1 = 0;
  let stake2 = 0;
  let stake3 = 0;

  let payout1 = 0;
  let payout2 = 0;
  let payout3 = 0;

  if (arbPercent > 0) {
    stake1 = totalStake * (p1 / arbPercent);
    stake2 = totalStake * (p2 / arbPercent);
    stake3 = marketType === "3way" ? totalStake * (p3 / arbPercent) : 0;

    payout1 = d1 > 0 ? stake1 * d1 : 0;
    payout2 = d2 > 0 ? stake2 * d2 : 0;
    payout3 = d3 > 0 ? stake3 * d3 : 0;
  }

  const averagePayout = payout1 > 0 ? payout1 : 0; // Since mathematically payout is equal across selections if distribution is fair.
  const expectedProfit = averagePayout > 0 ? averagePayout - totalStake : 0;
  const roi = arbPercent > 0 ? ((1 / arbPercent) - 1) * 100 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Left Column: Calculator Card */}
      <div className="lg:col-span-2 glass-card rounded-2xl p-6 md:p-8 border-white/[0.04] shadow-2xl relative overflow-hidden">
        
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
        
        <div className="space-y-6">
          
          {/* Row 1: Odds Format & Market Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Odds Format Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">배당률 형식</label>
              <select 
                value={oddsFormat} 
                onChange={(e) => {
                  setOddsFormat(e.target.value as "american" | "decimal");
                  handleClear();
                }}
                className="w-full bg-secondary/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-semibold text-foreground focus:outline-none focus:border-primary/50 transition-colors cursor-pointer"
              >
                <option value="decimal" className="bg-background">소수식 (Decimal)</option>
                <option value="american" className="bg-background">미국식 (American)</option>
              </select>
            </div>

            {/* Market Type Options */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">마켓 유형</label>
              <div className="grid grid-cols-2 gap-2 bg-secondary/40 border border-white/10 p-1 rounded-xl h-[46px] items-center">
                <button
                  type="button"
                  onClick={() => {
                    setMarketType("2way");
                    setOption3("");
                  }}
                  className={cn(
                    "h-full text-xs font-bold rounded-lg transition-all",
                    marketType === "2way" 
                      ? "bg-primary text-white shadow-lg shadow-primary/20" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  2-Way (승/패)
                </button>
                <button
                  type="button"
                  onClick={() => setMarketType("3way")}
                  className={cn(
                    "h-full text-xs font-bold rounded-lg transition-all",
                    marketType === "3way" 
                      ? "bg-primary text-white shadow-lg shadow-primary/20" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  3-Way (승/무/패)
                </button>
              </div>
            </div>
          </div>

          {/* Total Stake Field */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                총 베팅 투자금액
              </label>
              <span className="text-xs font-bold text-primary">${totalStake.toLocaleString()}</span>
            </div>
            <input
              type="number"
              min="1"
              value={totalStake === 0 ? "" : totalStake}
              onChange={(e) => setTotalStake(Math.max(0, parseInt(e.target.value) || 0))}
              placeholder="총 투자금액 입력"
              className="w-full bg-secondary/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-semibold text-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          <div className="section-divider" />

          {/* Option Inputs */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 items-end gap-3">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-foreground">옵션 1 배당률 (사이트 A)</label>
                <input
                  type="text"
                  value={option1}
                  onChange={(e) => setOption1(e.target.value)}
                  placeholder={oddsFormat === "american" ? "예: -110" : "예: 2.10"}
                  className="w-full bg-secondary/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
              <div className="bg-secondary/20 border border-white/5 rounded-xl px-4 py-2.5 h-[42px] flex items-center justify-between text-xs">
                <span className="text-muted-foreground">분배 투자금:</span>
                <span className="font-bold text-primary">${stake1 > 0 ? stake1.toFixed(2) : "0.00"}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 items-end gap-3">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-foreground">옵션 2 배당률 (사이트 B)</label>
                <input
                  type="text"
                  value={option2}
                  onChange={(e) => setOption2(e.target.value)}
                  placeholder={oddsFormat === "american" ? "예: +115" : "예: 2.05"}
                  className="w-full bg-secondary/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
              <div className="bg-secondary/20 border border-white/5 rounded-xl px-4 py-2.5 h-[42px] flex items-center justify-between text-xs">
                <span className="text-muted-foreground">분배 투자금:</span>
                <span className="font-bold text-primary">${stake2 > 0 ? stake2.toFixed(2) : "0.00"}</span>
              </div>
            </div>

            {marketType === "3way" && (
              <div className="grid grid-cols-1 md:grid-cols-3 items-end gap-3 animate-scale-in">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-foreground">옵션 3 배당률 (사이트 C / 무승부 등)</label>
                  <input
                    type="text"
                    value={option3}
                    onChange={(e) => setOption3(e.target.value)}
                    placeholder={oddsFormat === "american" ? "예: +280" : "예: 3.80"}
                    className="w-full bg-secondary/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                <div className="bg-secondary/20 border border-white/5 rounded-xl px-4 py-2.5 h-[42px] flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">분배 투자금:</span>
                  <span className="font-bold text-primary">${stake3 > 0 ? stake3.toFixed(2) : "0.00"}</span>
                </div>
              </div>
            )}
          </div>

          {/* Clear Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-red-400 transition-colors py-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> 모든 배당률 제거
            </button>
          </div>

          {/* Result Alert Dashboard */}
          <div className={cn(
            "border rounded-2xl p-5 md:p-6 transition-all duration-300",
            arbPercent === 0 
              ? "text-muted-foreground border-white/10 bg-transparent"
              : isArbOpportunity
                ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/5"
                : "text-red-400 border-red-500/30 bg-red-500/5"
          )}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {arbPercent === 0 ? (
                    <Info className="w-4 h-4" />
                  ) : isArbOpportunity ? (
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  )}
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    양방 차익 거래 여부
                  </h3>
                </div>
                <p className="text-sm font-semibold opacity-90 leading-tight">
                  {arbPercent === 0 
                    ? "배당률을 입력하여 차익 기회를 확인하세요."
                    : isArbOpportunity 
                      ? "양방 차익 기회 감지! 무위험 수익을 거둘 수 있습니다."
                      : "차익 거래 불가. 현재 조건에서는 손실이 발생합니다."}
                </p>
              </div>
              <div className="text-left md:text-right shrink-0">
                <span className="text-3xl font-black tracking-tight">
                  {arbPercent > 0 ? `${(arbPercent * 100).toFixed(2)}%` : "0.00%"}
                </span>
                <span className="text-[10px] text-muted-foreground block">합산 확률 백분율 (차익 비율)</span>
              </div>
            </div>

            {arbPercent > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground block">기대 회수율 (ROI)</span>
                  <span className={cn("text-lg font-bold block", isArbOpportunity ? "text-emerald-400" : "text-red-400")}>
                    {roi > 0 ? `+${roi.toFixed(2)}%` : `${roi.toFixed(2)}%`}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">예상 반환금 (지급금)</span>
                  <span className="text-lg font-bold text-foreground block">
                    ${averagePayout > 0 ? averagePayout.toFixed(2) : "0.00"}
                  </span>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <span className="text-muted-foreground block">확정 예상 순수익</span>
                  <span className={cn("text-lg font-bold block", expectedProfit > 0 ? "text-emerald-400 animate-pulse" : "text-red-400")}>
                    ${expectedProfit.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Right Column: Educational Card */}
      <div className="space-y-6">
        
        {/* Guide Card */}
        <div className="glass-card rounded-2xl p-6 border-white/[0.04] shadow-xl">
          <h2 className="text-base font-bold flex items-center gap-2 mb-4 text-glow">
            <Info className="w-4 h-4 text-primary" /> 차익 거래(양방) 가이드
          </h2>
          
          <div className="space-y-4 text-xs text-muted-foreground leading-relaxed">
            <div>
              <h4 className="font-bold text-foreground mb-1">1. 차익 거래 (Arbitrage) 란?</h4>
              <p>
                동일한 경기에 대해 서로 다른 베팅 사이트의 배당률이 격차를 보일 때, 
                그 배당 격차를 수학적으로 계산해 모든 결과에 분산 투자함으로써 
                경기 결과와 관계없이 **무위험 고정 수익**을 획득하는 투자 기법입니다.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-1">2. 계산 결과 읽는 방법</h4>
              <p>
                <span className="text-foreground font-semibold">합산 확률 백분율:</span> 각 배당률의 역수를 더한 값입니다. 이 값이 **100% 미만**이어야만 차익 거래가 가능합니다.<br />
                <span className="text-foreground font-semibold">분배 투자금:</span> 한 옵션이 적중했을 때 얻는 지급금이 모든 옵션에서 동일하도록 총 투자금을 배분한 금액입니다.
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <p className="text-[11px]">
                <strong className="text-foreground">성공을 위한 팁:</strong> 양방 베팅은 소수점 단위의 미세한 배당 차이로 수익률이 극명하게 달라집니다. 
                따라서 마진(수수료)이 거의 없는 **피나클**과 같은 프로 베터용 스포츠북을 한 축으로 설정하는 것이 가장 유리합니다.
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic ROI Status Table */}
        <div className="glass-card rounded-2xl p-6 border-white/[0.04] shadow-xl">
          <h3 className="text-sm font-bold text-foreground mb-3">예제 조건 시뮬레이션</h3>
          <div className="space-y-3 text-xs">
            <p className="text-muted-foreground leading-normal">
              아래 예시 배당률을 대입하여 계산기의 반응을 테스트해보세요.
            </p>
            <div className="bg-white/5 rounded-xl p-3 space-y-2 border border-white/5">
              <div className="flex justify-between">
                <span className="text-foreground font-medium">야구 경기 (2-Way)</span>
                <span className="text-emerald-400 font-bold">ROI +2.44%</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>사이트 A: 2.10</span>
                <span>사이트 B: 2.10</span>
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 space-y-2 border border-white/5">
              <div className="flex justify-between">
                <span className="text-foreground font-medium">축구 경기 (3-Way)</span>
                <span className="text-emerald-400 font-bold">ROI +3.85%</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>승: 3.50</span>
                <span>무: 3.50</span>
                <span>패: 3.50</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
