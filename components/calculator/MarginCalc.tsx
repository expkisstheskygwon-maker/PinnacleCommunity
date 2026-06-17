"use client";

import { useState } from "react";
import { Calculator, Trash2, Info, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MarginCalc() {
  const [oddsFormat, setOddsFormat] = useState<"american" | "decimal">("american");
  const [marketType, setMarketType] = useState<"2way" | "3way">("2way");
  
  const [option1, setOption1] = useState<string>("");
  const [option2, setOption2] = useState<string>("");
  const [option3, setOption3] = useState<string>("");
  const [stake, setStake] = useState<number>(100);

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

  // Calculate bookmaker implied probability
  const getBookmakerProb = (decimalOdds: number): number => {
    if (decimalOdds <= 1.0) return 0;
    return 1 / decimalOdds;
  };

  // Compute values
  const d1 = parseToDecimal(option1, oddsFormat);
  const d2 = parseToDecimal(option2, oddsFormat);
  const d3 = marketType === "3way" ? parseToDecimal(option3, oddsFormat) : 0;

  const p1 = getBookmakerProb(d1);
  const p2 = getBookmakerProb(d2);
  const p3 = marketType === "3way" ? getBookmakerProb(d3) : 0;

  const totalProb = p1 + p2 + p3;
  const margin = totalProb > 0 ? (totalProb - 1) * 100 : 0;

  // Fair probabilities (removing vig/margin)
  const fair1 = totalProb > 0 ? (p1 / totalProb) * 100 : 0;
  const fair2 = totalProb > 0 ? (p2 / totalProb) * 100 : 0;
  const fair3 = totalProb > 0 ? (p3 / totalProb) * 100 : 0;

  // Payouts based on stake
  const payout1 = d1 > 0 ? stake * d1 : 0;
  const payout2 = d2 > 0 ? stake * d2 : 0;
  const payout3 = d3 > 0 ? stake * d3 : 0;

  // Margin classification for color coding
  const getMarginColor = (m: number) => {
    if (m === 0) return "text-muted-foreground border-white/10";
    if (m <= 3.0) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/5";
    if (m <= 6.0) return "text-yellow-400 border-yellow-500/30 bg-yellow-500/5";
    return "text-red-400 border-red-500/30 bg-red-500/5";
  };

  const getMarginText = (m: number) => {
    if (m === 0) return "배당률을 입력해주세요.";
    if (m <= 3.0) return "최상급 조건 (피나클 수준의 매우 낮은 수수료)";
    if (m <= 6.0) return "일반적인 수준 (평균적인 온라인 북메이커)";
    return "주의 요망 (북메이커의 마진 수수료가 과도하게 높은 수준)";
  };

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
                <option value="american" className="bg-background">미국식 (American)</option>
                <option value="decimal" className="bg-background">소수식 (Decimal)</option>
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
                  경기 승자 (2-Way)
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
                  경기 결과 (3-Way)
                </button>
              </div>
            </div>
          </div>

          {/* Stake Field */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                가상 베팅 금액 (지급금 기준)
              </label>
              <span className="text-xs font-bold text-primary">${stake.toLocaleString()}</span>
            </div>
            <input
              type="number"
              min="1"
              value={stake === 0 ? "" : stake}
              onChange={(e) => setStake(Math.max(0, parseInt(e.target.value) || 0))}
              placeholder="배팅 금액 입력"
              className="w-full bg-secondary/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-semibold text-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          <div className="section-divider" />

          {/* Option 1 Inputs & Results */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-foreground">옵션 1 배당률</label>
              <span className="text-[11px] text-muted-foreground/60 italic">
                {oddsFormat === "american" ? "예: -110 또는 +150" : "예: 1.91 또는 2.50"}
              </span>
            </div>
            <input
              type="text"
              value={option1}
              onChange={(e) => setOption1(e.target.value)}
              placeholder={oddsFormat === "american" ? "배당률 입력 (예: -110)" : "배당률 입력 (예: 1.91)"}
              className="w-full bg-secondary/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-semibold text-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
            
            {/* Calculations Row */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-secondary/20 border border-white/5 rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">북메이커</p>
                <p className="text-sm font-black text-foreground">
                  {totalProb > 0 && p1 > 0 ? `${(p1 * 100).toFixed(1)}%` : "0.0%"}
                </p>
              </div>
              <div className="bg-secondary/20 border border-white/5 rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">페어 (공정)</p>
                <p className="text-sm font-black text-primary">
                  {totalProb > 0 && fair1 > 0 ? `${fair1.toFixed(2)}%` : "0.00%"}
                </p>
              </div>
              <div className="bg-secondary/20 border border-white/5 rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">지급금</p>
                <p className="text-sm font-black text-emerald-400">
                  ${payout1 > 0 ? payout1.toFixed(2) : "0.00"}
                </p>
              </div>
            </div>
          </div>

          {/* Option 2 Inputs & Results */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-foreground block">옵션 2 배당률</label>
            <input
              type="text"
              value={option2}
              onChange={(e) => setOption2(e.target.value)}
              placeholder={oddsFormat === "american" ? "배당률 입력 (예: +110)" : "배당률 입력 (예: 2.10)"}
              className="w-full bg-secondary/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-semibold text-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
            
            {/* Calculations Row */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-secondary/20 border border-white/5 rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">북메이커</p>
                <p className="text-sm font-black text-foreground">
                  {totalProb > 0 && p2 > 0 ? `${(p2 * 100).toFixed(1)}%` : "0.0%"}
                </p>
              </div>
              <div className="bg-secondary/20 border border-white/5 rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">페어 (공정)</p>
                <p className="text-sm font-black text-primary">
                  {totalProb > 0 && fair2 > 0 ? `${fair2.toFixed(2)}%` : "0.00%"}
                </p>
              </div>
              <div className="bg-secondary/20 border border-white/5 rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">지급금</p>
                <p className="text-sm font-black text-emerald-400">
                  ${payout2 > 0 ? payout2.toFixed(2) : "0.00"}
                </p>
              </div>
            </div>
          </div>

          {/* Option 3 Inputs & Results (3-Way) */}
          {marketType === "3way" && (
            <div className="space-y-3 animate-scale-in">
              <label className="text-sm font-bold text-foreground block">옵션 3 배당률 (무승부 등)</label>
              <input
                type="text"
                value={option3}
                onChange={(e) => setOption3(e.target.value)}
                placeholder={oddsFormat === "american" ? "배당률 입력 (예: +250)" : "배당률 입력 (예: 3.50)"}
                className="w-full bg-secondary/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-semibold text-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
              
              {/* Calculations Row */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-secondary/20 border border-white/5 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">북메이커</p>
                  <p className="text-sm font-black text-foreground">
                    {totalProb > 0 && p3 > 0 ? `${(p3 * 100).toFixed(1)}%` : "0.0%"}
                  </p>
                </div>
                <div className="bg-secondary/20 border border-white/5 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">페어 (공정)</p>
                  <p className="text-sm font-black text-primary">
                    {totalProb > 0 && fair3 > 0 ? `${fair3.toFixed(2)}%` : "0.00%"}
                  </p>
                </div>
                <div className="bg-secondary/20 border border-white/5 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">지급금</p>
                  <p className="text-sm font-black text-emerald-400">
                    ${payout3 > 0 ? payout3.toFixed(2) : "0.00"}
                  </p>
                </div>
              </div>
            </div>
          )}

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

          {/* Margin Result Container */}
          <div className={cn(
            "border rounded-2xl p-5 md:p-6 transition-all duration-300",
            getMarginColor(margin)
          )}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">산출된 마진 (Margin)</h3>
                <p className="text-sm font-semibold opacity-90 leading-tight">
                  {getMarginText(margin)}
                </p>
              </div>
              <div className="text-left md:text-right shrink-0">
                <span className="text-3xl font-black tracking-tight">
                  {margin > 0 ? `${margin.toFixed(2)}%` : "0.00%"}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Right Column: Educational Card */}
      <div className="space-y-6">
        
        {/* Guide Card */}
        <div className="glass-card rounded-2xl p-6 border-white/[0.04] shadow-xl">
          <h2 className="text-base font-bold flex items-center gap-2 mb-4 text-glow">
            <Info className="w-4 h-4 text-primary" /> 용어 및 결과를 읽는 방법
          </h2>
          
          <div className="space-y-4 text-xs text-muted-foreground leading-relaxed">
            <div>
              <h4 className="font-bold text-foreground mb-1">1. 마진 (Margin) 이란?</h4>
              <p>
                북메이커(배팅 회사)가 책정한 배당률에 포함시킨 수수료(과충전 비율)입니다. 
                공정한 시장의 전체 확률 합은 100%이지만, 북메이커는 100%를 초과하도록 배당률을 낮춥니다. 
                초과된 백분율이 마진(수수료)입니다.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-1">2. 북메이커 확률 vs 페어 확률</h4>
              <p>
                <span className="text-foreground font-semibold">북메이커 확률:</span> 수수료가 포함된 겉보기 확률(1 / 배당률)입니다.<br />
                <span className="text-foreground font-semibold">페어 (Fair) 확률:</span> 수수료를 수학적으로 완전히 제거한 뒤, 각 선택지가 갖는 **순수한 실제 당첨 확률**입니다.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-1">3. 지급금 (Payout)</h4>
              <p>
                입력하신 배당률에 가상 베팅 금액을 배팅하여 성공했을 시 돌려받게 되는 총 금액(원금 + 수익금)입니다. 
                수수료(마진)가 높을수록 배당률이 내려가므로 지급금도 함께 줄어들게 됩니다.
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <p className="text-[11px]">
                <strong className="text-foreground">피나클의 강점:</strong> 일반적인 사이트는 마진이 5% ~ 10%에 달하지만, 
                피나클은 보통 1.5% ~ 3% 수준의 최저 마진을 고수하여 전세계 베터들에게 가장 높은 지급금을 돌려줍니다.
              </p>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="glass-card rounded-2xl p-6 border-white/[0.04] shadow-xl">
          <h3 className="text-sm font-bold text-foreground mb-3">마진율 비교 가이드</h3>
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
              <span className="text-emerald-400 font-bold">1.0% - 3.0%</span>
              <span className="text-foreground font-semibold">매우 우수 (피나클 등)</span>
            </div>
            <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
              <span className="text-yellow-400 font-bold">3.1% - 5.0%</span>
              <span className="text-foreground font-semibold">양호 (메이저 스포츠북)</span>
            </div>
            <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
              <span className="text-orange-400 font-bold">5.1% - 8.0%</span>
              <span className="text-muted-foreground">보통 (일반 해외 사이트)</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-red-400 font-bold">8.1% 이상</span>
              <span className="text-muted-foreground">주의 (수수료 과다 책정)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
