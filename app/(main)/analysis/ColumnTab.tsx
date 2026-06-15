"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Microscope, Calendar, Eye, MessageSquare, Award } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ColumnTab() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get("cat") || "all";
  const [activeCat, setActiveCat] = useState(initialCat);
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cat = searchParams.get("cat");
    if (cat) setActiveCat(cat);
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [postsRes, catsRes] = await Promise.all([
          fetch("/api/posts?category=analysis"),
          fetch("/api/admin/categories?type=analysis")
        ]);
        
        const postsData = await postsRes.json();
        const catsData = await catsRes.json();
        
        if (postsData.success && postsData.posts) {
          const formatted = postsData.posts.map((p: any) => ({
            id: p.id,
            title: p.title,
            author: p.author || '관리자',
            category: p.tags || '기타',
            date: new Date(p.createdAt || Date.now()).toISOString().split('T')[0],
            views: p.views || 0,
            comments: p.commentsCount || 0,
            premium: false,
            summary: p.content ? p.content.substring(0, 100).replace(/<[^>]+>/g, '') + '...' : '내용이 없습니다.'
          }));
          setArticles(formatted);
        }
        
        if (catsData.success) {
          setCategories(catsData.categories);
        }
      } catch (err) {
        console.error("Failed to fetch analysis data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = activeCat === "all" 
    ? articles 
    : articles.filter(a => a.category === activeCat);

  return (
    <div>
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 mt-4">
        <button
          onClick={() => setActiveCat("all")}
          className={cn(
            "px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
            activeCat === "all"
              ? "bg-primary text-white shadow-[0_0_16px_rgba(59,130,246,0.3)]"
              : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 border border-white/[0.06]"
          )}
        >
          전체
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCat(cat.name)}
            className={cn(
              "px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap border",
              activeCat === cat.name
                ? "bg-primary/20 border-primary/40 text-primary"
                : "bg-white/5 border-white/[0.06] text-muted-foreground hover:border-white/20"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

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
            <Link href={`/community/${article.id}`} key={article.id} className="glass-card-hover rounded-2xl overflow-hidden cursor-pointer group block">
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
  );
}
