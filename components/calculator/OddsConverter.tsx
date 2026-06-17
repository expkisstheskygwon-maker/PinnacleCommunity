"use client";

import { useState, useEffect } from "react";
import { Percent, Trash2, Info, ShieldCheck, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OddsConverter() {
  const [decimal, setDecimal] = useState<string>("2.00");
  const [american, setAmerican] = useState<string>("+100");
  const [fractional, setFractional] = useState<string>("1/1");
  const [probability, setProbability] = useState<string>("50.00");

  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Copy to clipboard helper
  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 1500);
  };

  // Convert decimal to fraction (Stern-Brocot or continued fraction approximation)
  const decimalToFraction = (dec: number): string => {
    const val = dec - 1;
    if (val <= 0) return "0/1";
    
    // Quick lookups for standard betting odds fractions
    const standardFractions: { [key: number]: string } = {
      0.1: "1/10", 0.15: "3/20", 0.2: "1/5", 0.25: "1/4", 0.3: "3/10", 0.3333: "1/3",
      0.4: "2/5", 0.5: "1/2", 0.5333: "8/15", 0.5714: "4/7", 0.6: "3/5", 0.6154: "8/13",
      0.625: "5/8", 0.6667: "2/3", 0.7: "7/10", 0.7273: "8/11", 0.75: "3/4", 0.8: "4/5",
      0.8333: "5/6", 0.9091: "10/11", 1.0: "1/1", 1.1: "11/10", 1.2: "6/5", 1.25: "5/4",
      1.3: "13/10", 1.3333: "4/3", 1.375: "11/8", 1.4: "7/5", 1.5: "3/2", 1.6: "8/5",
      1.625: "13/8", 1.6667: "5/3", 1.75: "7/4", 1.8: "9/5", 1.91: "10/11", 2.0: "2/1",
      2.1: "11/5", 2.2: "6/5", 2.25: "5/4", 2.375: "11/8", 2.5: "5/2", 2.625: "13/8",
      2.75: "7/4", 3.0: "3/1", 3.25: "9/4", 3.5: "5/2", 4.0: "4/1", 4.5: "7/2",
      5.0: "5/1", 6.0: "6/1", 7.0: "7/1", 8.0: "8/1", 9.0: "9/1", 10.0: "10/1"
    };

    // Find closest within a small threshold
    for (const key of Object.keys(standardFractions)) {
      const numericKey = parseFloat(key);
      if (Math.abs(val - numericKey) < 0.015) {
        return standardFractions[numericKey];
      }
    }

    // Continued fraction fallback
    const tolerance = 1.0e-4;
    let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
    let b = val;
    do {
      const a = Math.floor(b);
      const aux = h1; h1 = a * h1 + h2; h2 = aux;
      const aux2 = k1; k1 = a * k1 + k2; k2 = aux2;
      b = 1 / (b - a);
    } while (Math.abs(val - h1 / k1) > val * tolerance && k1 < 100);
    
    return `${h1}/${k1}`;
  };

  // Parse fractional string e.g. "5/2" to float 2.5
  const fractionToDecimal = (fracStr: string): number => {
    const parts = fracStr.split("/");
    if (parts.length !== 2) return 0;
    const num = parseFloat(parts[0]);
    const den = parseFloat(parts[1]);
    if (isNaN(num) || isNaN(den) || den === 0) return 0;
    return (num / den) + 1;
  };

  // Major update handlers
  const handleDecimalChange = (val: string) => {
    setDecimal(val);
    const dec = parseFloat(val);
    if (isNaN(dec) || dec <= 1.0) {
      setAmerican("");
      setFractional("");
      setProbability("");
      return;
    }

    // Calc American
    let am = "";
    if (dec >= 2.0) {
      am = `+${Math.round((dec - 1) * 100)}`;
    } else {
      am = `${Math.round(-100 / (dec - 1))}`;
    }
    setAmerican(am);

    // Calc Fractional
    setFractional(decimalToFraction(dec));

    // Calc Probability
    setProbability(((1 / dec) * 100).toFixed(2));
  };

  const handleAmericanChange = (val: string) => {
    setAmerican(val);
    const am = parseInt(val.replace("+", ""));
    if (isNaN(am) || am === 0 || am > -100 && am < 100) {
      setDecimal("");
      setFractional("");
      setProbability("");
      return;
    }

    // Calc Decimal
    let dec = 0;
    if (am > 0) {
      dec = 1 + (am / 100);
    } else {
      dec = 1 + (100 / Math.abs(am));
    }
    setDecimal(dec.toFixed(2));

    // Calc Fractional
    setFractional(decimalToFraction(dec));

    // Calc Probability
    setProbability(((1 / dec) * 100).toFixed(2));
  };

  const handleFractionalChange = (val: string) => {
    setFractional(val);
    if (!val.includes("/")) {
      setDecimal("");
      setAmerican("");
      setProbability("");
      return;
    }

    const dec = fractionToDecimal(val);
    if (dec <= 1.0) return;

    setDecimal(dec.toFixed(2));

    // Calc American
    let am = "";
    if (dec >= 2.0) {
      am = `+${Math.round((dec - 1) * 100)}`;
    } else {
      am = `${Math.round(-100 / (dec - 1))}`;
    }
    setAmerican(am);

    // Calc Probability
    setProbability(((1 / dec) * 100).toFixed(2));
  };

  const handleProbabilityChange = (val: string) => {
    setProbability(val);
    const prob = parseFloat(val);
    if (isNaN(prob) || prob <= 0 || prob >= 100) {
      setDecimal("");
      setAmerican("");
      setFractional("");
      return;
    }

    // Calc Decimal
    const dec = 100 / prob;
    setDecimal(dec.toFixed(2));

    // Calc American
    let am = "";
    if (dec >= 2.0) {
      am = `+${Math.round((dec - 1) * 100)}`;
    } else {
      am = `${Math.round(-100 / (dec - 1))}`;
    }
    setAmerican(am);

    // Calc Fractional
    setFractional(decimalToFraction(dec));
  };

  const handleClear = () => {
    setDecimal("");
    setAmerican("");
    setFractional("");
    setProbability("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Left Column: Calculator Card */}
      <div className="lg:col-span-2 glass-card rounded-2xl p-6 md:p-8 border-white/[0.04] shadow-2xl relative overflow-hidden">
        
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
        
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-foreground">실시간 배당 변환기</h3>
            <span className="text-xs text-muted-foreground/60 italic">하나의 값을 변경하면 즉시 전체가 동기화됩니다.</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Decimal Odds */}
            <div className="space-y-2 relative">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">소수식 배당률 (Decimal)</label>
                <button 
                  type="button" 
                  onClick={() => handleCopy(decimal, "decimal")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copiedField === "decimal" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <input
                type="text"
                value={decimal}
                onChange={(e) => handleDecimalChange(e.target.value)}
                placeholder="예: 2.00"
                className="w-full bg-secondary/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            {/* American Odds */}
            <div className="space-y-2 relative">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">미국식 배당률 (American)</label>
                <button 
                  type="button" 
                  onClick={() => handleCopy(american, "american")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copiedField === "american" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <input
                type="text"
                value={american}
                onChange={(e) => handleAmericanChange(e.target.value)}
                placeholder="예: -110 또는 +100"
                className="w-full bg-secondary/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            {/* Fractional Odds */}
            <div className="space-y-2 relative">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">분수식 배당률 (Fractional)</label>
                <button 
                  type="button" 
                  onClick={() => handleCopy(fractional, "fractional")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copiedField === "fractional" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <input
                type="text"
                value={fractional}
                onChange={(e) => handleFractionalChange(e.target.value)}
                placeholder="예: 1/1 또는 10/11"
                className="w-full bg-secondary/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            {/* Implied Probability */}
            <div className="space-y-2 relative">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">임의의 당첨 확률 (Implied Prob.)</label>
                <button 
                  type="button" 
                  onClick={() => handleCopy(probability + "%", "probability")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copiedField === "probability" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={probability}
                  onChange={(e) => handleProbabilityChange(e.target.value)}
                  placeholder="예: 50.00"
                  className="w-full bg-secondary/40 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">%</span>
              </div>
            </div>
          </div>

          {/* Clear Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-red-400 transition-colors py-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> 모든 값 초기화
            </button>
          </div>

        </div>
      </div>

      {/* Right Column: Educational Card */}
      <div className="space-y-6">
        
        {/* Guide Card */}
        <div className="glass-card rounded-2xl p-6 border-white/[0.04] shadow-xl">
          <h2 className="text-base font-bold flex items-center gap-2 mb-4 text-glow">
            <Info className="w-4 h-4 text-primary" /> 각 배당률 포맷 이해하기
          </h2>
          
          <div className="space-y-4 text-xs text-muted-foreground leading-relaxed">
            <div>
              <h4 className="font-bold text-foreground mb-1">1. 소수식 (Decimal)</h4>
              <p>
                한국, 유럽 등지에서 가장 널리 쓰이는 표준 방식입니다. 
                배팅 시 돌려받을 총 원금 및 수익이 포함된 배수를 나타냅니다. 
                예를 들어 배당률 2.00에 10달러를 걸면 총 20달러가 반환됩니다.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-1">2. 미국식 (American)</h4>
              <p>
                `+`와 `-` 기호를 이용해 금액을 계산합니다.<br />
                <span className="text-foreground font-semibold">양수 (+):</span> 100달러를 배팅했을 때 얻을 수 있는 순수익을 나타냅니다. (+150 $\rightarrow$ 100달러 배팅 시 150달러 순수익)<br />
                <span className="text-foreground font-semibold">음수 (-):</span> 100달러의 순수익을 얻기 위해 배팅해야 하는 원금을 나타냅니다. (-110 $\rightarrow$ 110달러 배팅 시 100달러 순수익)
              </p>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-1">3. 분수식 (Fractional)</h4>
              <p>
                영국 및 전통적인 경마 업계에서 사용됩니다. 
                순수하게 창출될 배팅 원금 대비 수익금 비율을 나타냅니다. 
                예를 들어 4/1 배당은 1달러를 걸면 4달러의 순수익을 준다는 의미입니다.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-1">4. 임의 확률 (Implied Probability)</h4>
              <p>
                책정된 배당률이 수학적으로 역산해 나타내는 당첨 가능 확률입니다. 
                수수료(마진)가 제거되지 않은 상태의 확률값입니다.
              </p>
            </div>
          </div>
        </div>

        {/* Info tip */}
        <div className="glass-card rounded-2xl p-6 border-white/[0.04] shadow-xl">
          <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> 편리한 팁
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            원하는 필드의 우측 상단에 위치한 **복사 아이콘**을 클릭하면, 변환 결과를 소수점 그대로 클립보드에 즉시 저장할 수 있습니다. 
            타 사이트와의 배당률 비교 시 복사-붙여넣기를 유용하게 활용해보세요.
          </p>
        </div>
      </div>
    </div>
  );
}
