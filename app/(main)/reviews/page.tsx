"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Star, CheckCircle2, ThumbsUp, MessageSquare, Filter,
  ChevronDown, PenLine, ArrowUpDown, Clock, TrendingUp,
  Headphones, CreditCard, UserPlus, Swords,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "all", label: "전체", icon: Star },
  { id: "signup", label: "가입 후기", icon: UserPlus },
  { id: "deposit", label: "입금/출금", icon: CreditCard },
  { id: "support", label: "고객센터", icon: Headphones },
  { id: "sports", label: "종목별", icon: Swords },
];

const REVIEWS = [
  { id: 1, author: "축구매니아", sport: "축구", category: "sports", rating: 4.5, title: "EPL 배당이 확실히 높습니다", content: "타 사이트 대비 항상 2-3% 높은 배당을 확인했습니다. 특히 1X2 시장에서 차이가 큽니다. 다만 일부 비인기 리그의 경우 라인업이 좀 늦게 올라오는 점은 아쉽습니다.", date: "2026-04-20", verified: true, likes: 34, comments: 8, tags: ["배당 만족", "EPL", "축구"], oddsRating: 5, withdrawRating: 4, supportRating: 4 },
  { id: 2, author: "뉴비", sport: "종합", category: "signup", rating: 3.5, title: "가입은 쉬운데 KYC가 좀 번거로움", content: "가입 자체는 5분이면 되는데, 신분증 인증에 이틀 걸렸습니다. 여권으로 하니까 하루 만에 됐어요. 다음부터는 여권 추천합니다.", date: "2026-04-19", verified: true, likes: 22, comments: 12, tags: ["가입", "KYC", "인증"], oddsRating: 0, withdrawRating: 0, supportRating: 3 },
  { id: 3, author: "글로벌배터", sport: "e스포츠", category: "sports", rating: 5, title: "LoL 배당은 피나클이 최고", content: "LCK 경기 라인업이 가장 풍부하고, 라이브 베팅도 빠릅니다. 맵 핸디캡, 킬 오버언더 등 세부 시장도 잘 갖춰져 있어서 만족합니다.", date: "2026-04-18", verified: false, likes: 45, comments: 15, tags: ["LOL", "LCK", "e스포츠"], oddsRating: 5, withdrawRating: 4, supportRating: 4 },
  { id: 4, author: "빠른출금", sport: "야구", category: "deposit", rating: 4, title: "출금 3시간 만에 완료", content: "주말에 신청했는데 3시간 만에 은행 계좌로 입금됐습니다. 타 사이트는 보통 1-2일 걸리는데 확실히 빠릅니다. 10만 원 이상은 신분증 재인증이 필요할 수 있습니다.", date: "2026-04-17", verified: true, likes: 67, comments: 23, tags: ["출금", "은행이체", "빠름"], oddsRating: 4, withdrawRating: 5, supportRating: 4 },
  { id: 5, author: "CS테스터", sport: "종합", category: "support", rating: 3, title: "라이브 채팅 응답은 빠른데 이메일은 느림", content: "라이브 채팅은 대기 2-3분이면 연결됩니다. 한국어 지원도 기본 수준은 합니다. 하지만 복잡한 문의 사항은 이메일로 넘어가는데, 답변에 2-3일 걸립니다.", date: "2026-04-16", verified: true, likes: 18, comments: 9, tags: ["고객센터", "라이브챗", "이메일"], oddsRating: 0, withdrawRating: 0, supportRating: 3 },
  { id: 6, author: "야구덕후", sport: "야구", category: "sports", rating: 4, title: "KBO 경기 배당이 올라왔습니다", content: "작년까지는 KBO 라인업이 부실했는데, 올해는 전 경기 오픈합니다. NPB, MLB도 기본이고, 핸디캡/오버언더 시장 모두 다 갖춰져 있습니다.", date: "2026-04-15", verified: false, likes: 29, comments: 7, tags: ["KBO", "야구", "배당"], oddsRating: 4, withdrawRating: 4, supportRating: 3 },
];

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={cn("w-3.5 h-3.5", i <= rating ? "text-[hsl(var(--gold))] fill-[hsl(var(--gold))]" : i - 0.5 <= rating ? "text-[hsl(var(--gold))]" : "text-white/10")} />
      ))}
      <span className="ml-1 text-xs font-bold text-[hsl(var(--gold))]">{rating}</span>
    </div>
  );
}

function MiniBar({ label, value }: { label: string; value: number }) {
  if (value === 0) return null;
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <span className="text-muted-foreground w-14 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${value * 20}%` }} />
      </div>
      <span className="text-primary font-bold w-4 text-right">{value}</span>
    </div>
  );
}

export default function ReviewsPage() {
  const [activeCat, setActiveCat] = useState("all");
  const [sortBy, setSortBy] = useState<"latest" | "likes" | "rating">("latest");

  let filtered = activeCat === "all" ? REVIEWS : REVIEWS.filter(r => r.category === activeCat);
  if (sortBy === "likes") filtered = [...filtered].sort((a, b) => b.likes - a.likes);
  if (sortBy === "rating") filtered = [...filtered].sort((a, b) => b.rating - a.rating);

  return (
    <div className="mesh-gradient min-h-screen">
      <div className="container mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <Link href="/" className="hover:text-primary transition-colors">홈</Link>
          <span>/</span>
          <span className="text-foreground font-bold">후기</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter">실사용 후기</h1>
            <p className="text-muted-foreground mt-1">피나클 사용자들의 실제 경험을 확인하세요</p>
          </div>
          <button className="btn-primary flex items-center gap-2 w-fit">
            <PenLine className="w-4 h-4" /> 후기 작성하기
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "전체 후기", value: "847건", icon: Star, color: "text-[hsl(var(--gold))]" },
            { label: "평균 평점", value: "4.1", icon: TrendingUp, color: "text-primary" },
            { label: "검증된 후기", value: "623건", icon: CheckCircle2, color: "text-emerald-400" },
            { label: "이번 주 등록", value: "34건", icon: Clock, color: "text-purple-400" },
          ].map(s => (
            <div key={s.label} className="stat-card rounded-xl">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-semibold">
                <s.icon className={cn("w-3.5 h-3.5", s.color)} />
                {s.label}
              </div>
              <span className={cn("text-2xl font-black", s.color)}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                  activeCat === cat.id
                    ? "bg-primary text-white shadow-[0_0_16px_rgba(59,130,246,0.3)]"
                    : "bg-white/5 text-muted-foreground hover:bg-white/10 border border-white/[0.06]"
                )}
              >
                <cat.icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {(["latest", "likes", "rating"] as const).map(s => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  sortBy === s ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {s === "latest" ? "최신순" : s === "likes" ? "추천순" : "평점순"}
              </button>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filtered.map(review => (
            <div key={review.id} className="glass-card rounded-2xl p-6 hover:bg-white/[0.02] transition-colors cursor-pointer group space-y-4">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary text-lg group-hover:scale-105 transition-transform">
                    {review.author[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold group-hover:text-primary transition-colors">{review.author}</span>
                      {review.verified && <span className="badge-success text-[8px]"><CheckCircle2 className="w-2.5 h-2.5" />검증</span>}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>{review.date}</span>
                      <span>•</span>
                      <span>{review.sport}</span>
                    </div>
                  </div>
                </div>
                <StarDisplay rating={review.rating} />
              </div>

              {/* Content */}
              <div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{review.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{review.content}</p>
              </div>

              {/* Rating Bars */}
              {(review.oddsRating > 0 || review.withdrawRating > 0 || review.supportRating > 0) && (
                <div className="bg-white/[0.02] rounded-xl p-4 space-y-2">
                  <MiniBar label="배당" value={review.oddsRating} />
                  <MiniBar label="입출금" value={review.withdrawRating} />
                  <MiniBar label="고객센터" value={review.supportRating} />
                </div>
              )}

              {/* Tags & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.04]">
                <div className="flex flex-wrap gap-1.5">
                  {review.tags.map(tag => (
                    <span key={tag} className="text-[10px] bg-white/5 text-muted-foreground px-2 py-0.5 rounded-full font-medium">#{tag}</span>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
                    <ThumbsUp className="w-3.5 h-3.5" /> {review.likes}
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
                    <MessageSquare className="w-3.5 h-3.5" /> {review.comments}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
