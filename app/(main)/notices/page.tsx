"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Bell, AlertTriangle, Wrench, FileText, Shield,
  Clock, ChevronRight, Pin, Megaphone, XCircle, Info
} from "lucide-react";
import { cn } from "@/lib/utils";

const TYPE_CONFIG: Record<string, { icon: any; color: string; bgColor: string; label: string }> = {
  scam: { icon: Shield, color: "text-red-400", bgColor: "bg-red-500/15", label: "사기주의" },
  maintenance: { icon: Wrench, color: "text-[hsl(var(--gold))]", bgColor: "bg-[hsl(var(--gold))]/15", label: "점검" },
  outage: { icon: XCircle, color: "text-orange-400", bgColor: "bg-orange-500/15", label: "장애" },
  policy: { icon: FileText, color: "text-primary", bgColor: "bg-primary/15", label: "정책" },
  default: { icon: Info, color: "text-muted-foreground", bgColor: "bg-white/5", label: "공지" }
};

export default function NoticesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <NoticeContent />
    </Suspense>
  );
}

function NoticeContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get("cat") || "all";
  const [activeCat, setActiveCat] = useState(initialCat);
  const [notices, setNotices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cat = searchParams.get("cat");
    if (cat) setActiveCat(cat);

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [postsRes, catsRes] = await Promise.all([
          fetch("/api/posts?category=notices"),
          fetch("/api/admin/categories?type=notices")
        ]);
        const postsData = await postsRes.json();
        const catsData = await catsRes.json();
        
        if (postsData.success) setNotices(postsData.posts);
        if (catsData.success) setCategories(catsData.categories);
      } catch (err) {
        console.error("Failed to fetch notices", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [searchParams]);

  const filtered = activeCat === "all" 
    ? notices 
    : notices.filter(n => n.tags === activeCat);

  const pinned = filtered.filter(n => n.pinned);
  const regular = filtered.filter(n => !n.pinned);

  return (
    <div className="mesh-gradient min-h-screen">
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <Link href="/" className="hover:text-primary transition-colors">홈</Link>
          <span>/</span>
          <span className="text-foreground font-bold">공지/이슈</span>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter">공지/이슈</h1>
          <p className="text-muted-foreground mt-1">점검 안내, 사기주의, 장애 보고, 정책 변경 등</p>
        </div>

        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveCat("all")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
              activeCat === "all"
                ? "bg-primary text-white shadow-[0_0_16px_rgba(59,130,246,0.3)]"
                : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 border border-white/[0.06]"
            )}
          >
            <Bell className="w-3.5 h-3.5" />
            전체
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.name)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap border",
                activeCat === cat.name
                  ? "bg-primary/20 border-primary/40 text-primary"
                  : "bg-white/5 border-white/[0.06] text-muted-foreground hover:border-white/20"
              )}
            >
              <Bell className="w-3.5 h-3.5 opacity-50" />
              {cat.name}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="py-20 text-center animate-pulse text-muted-foreground font-bold">로딩 중...</div>
        ) : (
          <div className="max-w-3xl space-y-6">
            {pinned.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  <Pin className="w-3 h-3" /> 고정 공지
                </div>
                {pinned.map(notice => {
                  const config = TYPE_CONFIG[notice.tags] || TYPE_CONFIG.default;
                  return (
                    <div key={notice.id} className={cn("glass-card rounded-xl overflow-hidden border-l-4 border-l-primary")}>
                      <button
                        onClick={() => setExpandedId(expandedId === notice.id ? null : notice.id)}
                        className="w-full p-5 text-left flex items-center gap-4 hover:bg-white/[0.02] transition-colors"
                      >
                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", config.bgColor)}>
                          <config.icon className={cn("w-5 h-5", config.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn("badge text-[8px]", config.bgColor, config.color)}>{notice.tags || "공지"}</span>
                            <span className="badge-primary text-[8px]"><Pin className="w-2 h-2" />고정</span>
                          </div>
                          <h3 className="font-bold text-sm">{notice.title}</h3>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[10px] text-muted-foreground">{new Date(notice.createdAt).toLocaleDateString()}</span>
                          <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform", expandedId === notice.id && "rotate-90")} />
                        </div>
                      </button>
                      {expandedId === notice.id && (
                        <div className="px-5 pb-5 pl-[76px] animate-fade-in">
                          <div className="text-sm text-muted-foreground leading-relaxed prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: notice.content }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="space-y-3">
              {regular.length > 0 ? (
                regular.map(notice => {
                  const config = TYPE_CONFIG[notice.tags] || TYPE_CONFIG.default;
                  return (
                    <div key={notice.id} className="glass-card rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedId(expandedId === notice.id ? null : notice.id)}
                        className="w-full p-5 text-left flex items-center gap-4 hover:bg-white/[0.02] transition-colors"
                      >
                        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", config.bgColor)}>
                          <config.icon className={cn("w-4 h-4", config.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={cn("text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded", config.bgColor, config.color)}>{notice.tags || "공지"}</span>
                          </div>
                          <h3 className="font-bold text-sm">{notice.title}</h3>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[10px] text-muted-foreground hidden sm:block">{new Date(notice.createdAt).toLocaleDateString()}</span>
                          <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform", expandedId === notice.id && "rotate-90")} />
                        </div>
                      </button>
                      {expandedId === notice.id && (
                        <div className="px-5 pb-5 pl-[68px] animate-fade-in">
                          <div className="text-sm text-muted-foreground leading-relaxed prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: notice.content }} />
                        </div>
                      )}
                    </div>
                  )
                })
              ) : (
                <p className="text-muted-foreground text-sm py-10">등록된 공지사항이 없습니다.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
