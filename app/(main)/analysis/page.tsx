"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import PredictionResultTab from "./PredictionResultTab";
import AiAnalysisTab from "./AiAnalysisTab";

function AnalysisPageContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "result" ? "result" : "analysis";
  const [activeTab, setActiveTab] = useState<"analysis" | "result">(initialTab);

  return (
    <div className="mesh-gradient min-h-screen">
      <div className="container mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <Link href="/" className="hover:text-primary transition-colors">홈</Link>
          <span>/</span>
          <span className="text-foreground font-bold">분석/결과</span>
        </div>

        {/* Top Header & Tab Switcher */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter">
              {activeTab === "analysis" ? "AI 스포츠 분석" : "AI 예측 결과 리뷰"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {activeTab === "analysis" 
                ? "데이터와 통계를 기반으로 한 인공지능 매치업 예측" 
                : "과거 AI 분석 예측의 실제 적중률 및 결과 대조"}
            </p>
          </div>

          <div className="flex items-center bg-white/5 p-1 rounded-2xl border border-white/10 shrink-0">
            <button
              onClick={() => setActiveTab("analysis")}
              className={cn(
                "px-6 py-3 rounded-xl text-sm font-bold transition-all",
                activeTab === "analysis"
                  ? "bg-primary text-white shadow-[0_0_16px_rgba(59,130,246,0.3)]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              스포츠 분석
            </button>
            <button
              onClick={() => setActiveTab("result")}
              className={cn(
                "px-6 py-3 rounded-xl text-sm font-bold transition-all",
                activeTab === "result"
                  ? "bg-emerald-500 text-white shadow-[0_0_16px_rgba(16,185,129,0.3)]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              예측/결과
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === "analysis" ? <AiAnalysisTab /> : <PredictionResultTab />}
        </div>
      </div>
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>}>
      <AnalysisPageContent />
    </Suspense>
  );
}
