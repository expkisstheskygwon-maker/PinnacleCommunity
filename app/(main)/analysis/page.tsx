"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import ColumnTab from "./ColumnTab";
import AiAnalysisTab from "./AiAnalysisTab";

function AnalysisPageContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "column" ? "column" : "analysis";
  const [activeTab, setActiveTab] = useState<"analysis" | "column">(initialTab);

  return (
    <div className="mesh-gradient min-h-screen">
      <div className="container mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <Link href="/" className="hover:text-primary transition-colors">홈</Link>
          <span>/</span>
          <span className="text-foreground font-bold">분석/칼럼</span>
        </div>

        {/* Top Header & Tab Switcher */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter">
              {activeTab === "analysis" ? "AI 스포츠 분석" : "스포츠 칼럼"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {activeTab === "analysis" 
                ? "데이터와 통계를 기반으로 한 인공지능 매치업 예측" 
                : "전문가의 배당 분석, 전략 가이드, 라인 변동 인사이트"}
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
              onClick={() => setActiveTab("column")}
              className={cn(
                "px-6 py-3 rounded-xl text-sm font-bold transition-all",
                activeTab === "column"
                  ? "bg-primary text-white shadow-[0_0_16px_rgba(59,130,246,0.3)]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              스포츠 칼럼
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === "analysis" ? <AiAnalysisTab /> : <ColumnTab />}
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
