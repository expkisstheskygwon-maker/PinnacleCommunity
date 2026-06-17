"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { 
  Calculator, ArrowRightLeft, Percent, 
  ChevronRight, Info, ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

// Sub-calculators
import MarginCalc from "@/components/calculator/MarginCalc";
import ArbitrageCalc from "@/components/calculator/ArbitrageCalc";
import BetCalc from "@/components/calculator/BetCalc";
import OddsConverter from "@/components/calculator/OddsConverter";

type TabType = "margin" | "arbitrage" | "betting" | "converter";

function CalculatorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Active tab state
  const [activeTab, setActiveTab] = useState<TabType>("margin");

  // Sync tab with URL query param '?tab=...'
  useEffect(() => {
    const tabParam = searchParams.get("tab") as TabType;
    if (tabParam && ["margin", "arbitrage", "betting", "converter"].includes(tabParam)) {
      setActiveTab(tabParam);
    } else {
      setActiveTab("margin");
    }
  }, [searchParams]);

  // Set active tab and update URL query params
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    
    // Smooth scroll to top when tab changes
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Tab configurations
  const tabConfig = [
    { id: "margin" as const, label: "배당 및 마진율", icon: Percent, desc: "북메이커 수수료 측정 및 공정 확률 분석" },
    { id: "arbitrage" as const, label: "차익 거래 (양방)", icon: ArrowRightLeft, desc: "배당률 격차를 이용한 무위험 고정 수익 계산" },
    { id: "betting" as const, label: "베팅 시뮬레이터", icon: Calculator, desc: "싱글 / 멀티 / 시스템 조합베팅 당첨금 시뮬레이션" },
    { id: "converter" as const, label: "배당률 변환기", icon: ArrowRightLeft, desc: "소수식, 미국식, 분수식 및 임의 확률 실시간 변환" },
  ];

  return (
    <div className="mesh-gradient min-h-screen">
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary transition-colors">홈</Link>
          <span>/</span>
          <Link href="/concepts" className="hover:text-primary transition-colors">개념 탑재</Link>
          <span>/</span>
          <span className="text-foreground font-bold">스마트 베팅 계산기</span>
        </div>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-3">
            <Calculator className="w-4 h-4" /> 스마트 베팅 리소스
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tighter mb-3">
            스마트 베팅 <span className="text-primary italic">계산기 허브</span>
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            마진율 산출부터 무위험 차익 거래(양방), 조합베팅 시뮬레이션, 배당률 포맷 변환까지 
            합리적인 베팅 전략을 수립하기 위한 수학적 도구들을 한눈에 활용하세요.
          </p>
        </div>

        {/* Tab Selection Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8 bg-secondary/20 p-1.5 border border-white/5 rounded-2xl">
          {tabConfig.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "flex flex-col items-center justify-center py-3 px-2 rounded-xl text-center transition-all relative",
                  isActive 
                    ? "bg-primary text-white shadow-lg shadow-primary/20 font-bold" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.02]"
                )}
              >
                <Icon className={cn("w-4 h-4 mb-1.5", isActive ? "text-white" : "text-primary")} />
                <span className="text-xs tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Calculator Component Container */}
        <div className="min-h-[400px] transition-all duration-300">
          {activeTab === "margin" && <MarginCalc />}
          {activeTab === "arbitrage" && <ArbitrageCalc />}
          {activeTab === "betting" && <BetCalc />}
          {activeTab === "converter" && <OddsConverter />}
        </div>

        {/* Other Tools Section (Integrated into Tab Switcher) */}
        <div className="mt-16 pt-8 border-t border-white/5">
          <h2 className="text-lg font-bold text-foreground text-center mb-6">베팅에 도움이 되는 기타 도구</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tabConfig
              .filter(t => t.id !== activeTab) // Show other calculators
              .slice(0, 3) // Take max 3
              .map((tab) => {
                const Icon = tab.icon;
                return (
                  <div 
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className="glass-card-hover rounded-2xl p-5 flex items-start gap-4 cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground mb-1 group-hover:text-primary transition-colors flex items-center gap-1">
                        {tab.label} <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all" />
                      </h4>
                      <p className="text-xs text-muted-foreground leading-normal">
                        {tab.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function CalculatorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-muted-foreground">계산기 허브 불러오는 중...</span>
        </div>
      </div>
    }>
      <CalculatorContent />
    </Suspense>
  );
}
