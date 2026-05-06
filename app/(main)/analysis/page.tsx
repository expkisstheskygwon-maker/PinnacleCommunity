"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  BarChart3, Microscope, TrendingUp, BookOpen, Shield,
  Calendar, Users, MessageSquare, Eye, ChevronRight, Star,
  FileText, Target, Award
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "all", label: "전체" },
  { id: "beginner", label: "초보 가이드" },
  { id: "odds", label: "배당 이해" },
  { id: "line", label: "라인 변동" },
  { id: "strategy", label: "전략/리스크" },
];

const ARTICLES = [
  { id: 1, title: "아시안핸디캡 완전정복: -0.5와 -0.75의 차이", author: "ProBettor", category: "배당 이해", date: "2026-04-19", views: 2300, comments: 56, premium: true, summary: "아시안핸디캡의 가장 혼란스러운 부분인 쿼터 라인에 대한 심층 분석. 정산 방식부터 실전 활용법까지 다룹니다." },
  { id: 2, title: "EPL 2025-26 시즌 배당 트렌드 분석", author: "DataWiz", category: "라인 변동", date: "2026-04-18", views: 1890, comments: 34, premium: true, summary: "올 시즌 EPL 배당 변동 패턴 분석. 빅6 홈 경기 오프닝 대비 클로징 라인 변화율 수치 포함." },
  { id: 3, title: "피나클이 높은 배당을 제공할 수 있는 이유", author: "가이드마스터", category: "초보 가이드", date: "2026-04-17", views: 3500, comments: 45, premium: false, summary: "피나클의 '위너 환영' 정책, 낮은 마진 구조, 그리고 경쟁 사이트 대비 배당 차이가 어디서 오는지 설명합니다." },
  { id: 4, title: "라이브 베팅에서 살아남기: 실시간 배당 읽는 법", author: "LiveKing", category: "전략/리스크", date: "2026-04-16", views: 1240, comments: 28, premium: false, summary: "라이브 베팅에서 배당 변동 속도를 활용해 가치 있는 진입점을 찾는 실전 전략 가이드입니다." },
  { id: 5, title: "오버/언더 시장 분석: 통계로 보는 골 수 예측", author: "StatsBetter", category: "배당 이해", date: "2026-04-15", views: 980, comments: 19, premium: false, summary: "xG, 슈팅 데이터, 수비 안정성 등 핵심 지표를 활용한 오버/언더 시장 접근법." },
  { id: 6, title: "배팅 뱅크롤 관리: 켈리 기준법 실전 적용", author: "ProBettor", category: "전략/리스크", date: "2026-04-14", views: 1560, comments: 41, premium: true, summary: "풀 켈리, 하프 켈리, 쿼터 켈리의 차이와 실전에서의 수익률 비교 시뮬레이션 결과." },
];

function AnalysisContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get("cat") || "all";
  const [activeCat, setActiveCat] = useState(initialCat);
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sync state with URL parameter if it changes
  useEffect(() => {
    const cat = searchParams.get("cat");
    if (cat) {
      setActiveCat(cat);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/posts?category=analysis");
        const data = await res.json();
        if (data.success && data.posts) {
          // Normalize data
          const formatted = data.posts.map((p: any) => ({
            id: p.id,
            title: p.title,
            author: p.author || '관리자',
            category: p.tags || '기타', // subCategory is saved in tags
            date: new Date(p.createdAt || Date.now()).toISOString().split('T')[0],
            views: p.views || 0,
            comments: p.commentsCount || 0,
            premium: false, // Could be determined by tags or specific DB field
            summary: p.content ? p.content.substring(0, 100).replace(/<[^>]+>/g, '') + '...' : '내용이 없습니다.'
          }));
          setArticles(formatted);
        }
      } catch (err) {
        console.error("Failed to fetch analysis articles", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const filtered = activeCat === "all" 
    ? articles 
    : articles.filter(a => a.category === CATEGORIES.find(c => c.id === activeCat)?.label);

  return (
    <div className="mesh-gradient min-h-screen">
      <div className="container mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <Link href="/" className="hover:text-primary transition-colors">홈</Link>
          <span>/</span>
          <span className="text-foreground font-bold">분석/칼럼</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter">분석/칼럼</h1>
          <p className="text-muted-foreground mt-1">전문가의 배당 분석, 전략 가이드, 라인 변동 인사이트</p>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                activeCat === cat.id
                  ? "bg-primary text-white shadow-[0_0_16px_rgba(59,130,246,0.3)]"
                  : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 border border-white/[0.06]"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        {isLoading ? (
          <div className="py-20 text-center text-muted-foreground animate-pulse">
            게시글을 불러오는 중입니다...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            등록된 분석/칼럼 게시글이 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(article => (
              <Link href={`/community/post/${article.id}`} key={article.id} className="glass-card-hover rounded-2xl overflow-hidden cursor-pointer group block">
              {/* Card Top */}
              <div className="h-44 bg-gradient-to-br from-primary/15 to-secondary/30 relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
                <Microscope className="w-14 h-14 text-primary/25 group-hover:scale-110 transition-transform duration-500" />
                {article.premium && (
                  <div className="absolute top-4 right-4 badge-gold">
                    <Award className="w-3 h-3" /> Premium
                  </div>
                )}
                <div className="absolute bottom-4 left-4 badge-primary">{article.category}</div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-3">
                <h3 className="font-bold text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">{article.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{article.summary}</p>
                <div className="flex items-center justify-between pt-4 border-t border-white/[0.04] text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary">{article.author[0]}</div>
                    <span className="font-bold">{article.author}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{article.date.slice(5)}</span>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{article.views.toLocaleString()}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{article.comments}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>}>
      <AnalysisContent />
    </Suspense>
  );
}
