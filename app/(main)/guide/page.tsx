"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  BookOpen, FileText, Shield, CreditCard, UserPlus,
  ChevronRight, Clock, Eye, CheckCircle2, Zap,
  AlertTriangle, Key, Smartphone, ArrowRight, Info
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function GuidePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <GuideContent />
    </Suspense>
  );
}

function GuideContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get("cat") || "all";
  const [activeCat, setActiveCat] = useState(initialCat);
  const [guides, setGuides] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cat = searchParams.get("cat");
    if (cat) setActiveCat(cat);

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [postsRes, catsRes] = await Promise.all([
          fetch("/api/posts?category=guide"),
          fetch("/api/admin/categories?type=guide")
        ]);
        const postsData = await postsRes.json();
        const catsData = await catsRes.json();
        
        if (postsData.success) setGuides(postsData.posts);
        if (catsData.success) setCategories(catsData.categories);
      } catch (err) {
        console.error("Failed to fetch guides", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [searchParams]);

  const filtered = activeCat === "all" 
    ? guides 
    : guides.filter(g => g.tags === activeCat);

  return (
    <div className="mesh-gradient min-h-screen">
      <div className="container mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <Link href="/" className="hover:text-primary transition-colors">홈</Link>
          <span>/</span>
          <span className="text-foreground font-bold">가이드</span>
        </div>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-4">
            <BookOpen className="w-4 h-4" /> 초보자 필수 가이드
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-3">
            피나클 <span className="text-primary italic">이용 가이드</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            가입부터 입출금, 계정 보안까지. 피나클 이용에 필요한 모든 것을 안내합니다.
          </p>
        </div>

        {/* Dynamic Categories */}
        <div className="flex items-center justify-center gap-2 mb-12 overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => setActiveCat("all")}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap border",
              activeCat === "all"
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                : "bg-white/5 text-muted-foreground border-white/10 hover:border-white/20"
            )}
          >
            전체 가이드
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.name)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap border",
                activeCat === cat.name
                  ? "bg-primary/15 border-primary/40 text-primary"
                  : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Guide Content */}
        {isLoading ? (
          <div className="py-20 text-center animate-pulse text-muted-foreground font-bold">가이드를 불러오는 중...</div>
        ) : (
          <div className="space-y-20 max-w-4xl mx-auto">
            {filtered.length > 0 ? (
              filtered.map((guide, idx) => (
                <section key={guide.id} className="scroll-mt-32 animate-fade-in">
                  {/* Section Header */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                      <FileText className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black tracking-tight">{guide.title}</h2>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(guide.createdAt).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {guide.views || 0}</span>
                        <span className="bg-primary/20 text-primary px-2 py-0.5 rounded font-bold uppercase tracking-wider">{guide.tags || "General"}</span>
                      </div>
                    </div>
                  </div>

                  {/* HTML Content */}
                  <div 
                    className="glass-card rounded-2xl p-8 md:p-12 prose prose-invert prose-primary max-w-none shadow-2xl border-white/[0.03]"
                    dangerouslySetInnerHTML={{ __html: guide.content }}
                  />
                  
                  {/* Footer Decoration */}
                  <div className="mt-8 flex items-center gap-4 opacity-20">
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-primary" />
                    <BookOpen className="w-4 h-4 text-primary" />
                    <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-primary" />
                  </div>
                </section>
              ))
            ) : (
              <div className="py-20 text-center glass-card rounded-2xl border-white/[0.05] space-y-4">
                <Info className="w-12 h-12 text-muted-foreground/20 mx-auto" />
                <p className="text-muted-foreground">해당 카테고리에 등록된 가이드가 없습니다.</p>
                <Link href="/guide" onClick={() => setActiveCat("all")} className="text-primary text-sm font-bold hover:underline">전체 가이드 보기</Link>
              </div>
            )}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center mt-20 glass-card rounded-3xl p-10 max-w-2xl mx-auto bg-gradient-to-br from-primary/[0.08] to-transparent border-primary/10 shadow-2xl">
          <h3 className="text-2xl font-black mb-2 tracking-tighter">더 궁금한 점이 있으신가요?</h3>
          <p className="text-sm text-muted-foreground mb-8">Q&A 게시판에서 질문하시거나, 전문가의 스포트라이트를 확인하세요.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/qna" className="btn-primary py-3 px-8 flex items-center gap-2 rounded-xl text-sm shadow-xl shadow-primary/20">
              Q&A 바로가기 <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/spotlight" className="btn-outline py-3 px-8 flex items-center gap-2 rounded-xl text-sm border-white/10 hover:bg-white/5 transition-all">
              스포트라이트 보기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
