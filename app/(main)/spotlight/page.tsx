"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  Star, CheckCircle2, ThumbsUp, MessageSquare, Filter,
  ChevronDown, PenLine, ArrowUpDown, Clock, TrendingUp,
  Headphones, CreditCard, UserPlus, Swords, Eye, Zap, Flame, Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SpotlightPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SpotlightContent />
    </Suspense>
  );
}

function SpotlightContent() {
  const [activeCat, setActiveCat] = useState("all");
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cat = searchParams.get('cat');
    if (cat) setActiveCat(cat);

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [postsRes, catsRes] = await Promise.all([
          fetch(`/api/posts?category=spotlight&limit=20`),
          fetch(`/api/admin/categories?type=spotlight`)
        ]);
        
        const postsData = await postsRes.json();
        const catsData = await catsRes.json();
        
        if (postsData.success) setPosts(postsData.posts);
        if (catsData.success) setCategories(catsData.categories);
      } catch (err) {
        console.error("Failed to fetch spotlight data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = activeCat === "all" 
    ? posts 
    : posts.filter(p => p.tags === activeCat); // subCategory is stored in tags column

  return (
    <div className="mesh-gradient min-h-screen">
      <div className="container mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <Link href="/" className="hover:text-primary transition-colors">홈</Link>
          <span>/</span>
          <span className="text-foreground font-bold">스포트라이트</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter">스포트라이트</h1>
            <p className="text-muted-foreground mt-1">전문가들이 선별한 프리미엄 베팅 인사이트</p>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <button
            onClick={() => setActiveCat("all")}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-bold transition-all",
              activeCat === "all"
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "bg-white/5 text-muted-foreground hover:bg-white/10"
            )}
          >
            전체
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.name)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-bold transition-all border",
                activeCat === cat.name
                  ? "bg-primary/20 border-primary/40 text-primary"
                  : "bg-white/5 border-white/[0.06] text-muted-foreground hover:border-white/20"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Content List */}
        {isLoading ? (
          <div className="py-20 text-center animate-pulse text-muted-foreground font-bold">
            콘텐츠를 불러오는 중...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.length > 0 ? (
              filtered.map(post => (
                <Link 
                  href={`/spotlight/${post.id}`} 
                  key={post.id} 
                  className="glass-card rounded-2xl overflow-hidden hover:bg-white/[0.02] transition-all group flex flex-col h-full"
                >
                  {post.image ? (
                    <div className="aspect-video w-full overflow-hidden relative">
                      <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-4 left-4">
                        <span className="bg-primary px-3 py-1 rounded-lg text-[10px] font-black text-white uppercase tracking-wider">
                          {post.tags || "Spotlight"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video w-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center p-8 relative">
                      <Zap className="w-16 h-16 text-primary/30" />
                      <div className="absolute top-4 left-4">
                        <span className="bg-primary px-3 py-1 rounded-lg text-[10px] font-black text-white uppercase tracking-wider">
                          {post.tags || "Spotlight"}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="p-6 flex-1 flex flex-col space-y-4">
                    <div className="space-y-2 flex-1">
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors leading-tight line-clamp-2">{post.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {post.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-white/[0.04] text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(post.createdAt).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {post.views || 0}</span>
                      </div>
                      <span className="font-bold text-primary flex items-center gap-1">
                        자세히 보기 <ArrowUpDown className="w-3 h-3 rotate-90" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-20 text-center glass-card rounded-2xl space-y-4">
                <Star className="w-12 h-12 text-muted-foreground/20 mx-auto" />
                <p className="text-muted-foreground">등록된 스포트라이트 콘텐츠가 없습니다.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
