'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  PenLine, ThumbsUp, Eye, Clock, Flame,
  Hash, Search, X, AlertTriangle, Trophy, Star,
  MessageSquare, Lightbulb, User, Loader2, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

const CONCEPT_CATEGORIES = [
  { id: "experiments", label: "기상천외 베팅 실험실", icon: Flame, desc: "나만의 엉뚱한 베팅 실험 연재" },
  { id: "fails", label: "멘붕 & 유쾌한 실패담", icon: AlertTriangle, desc: "낙첨 실수담 공유와 위로" },
  { id: "gamification", label: "룰렛 & 리더보드", icon: Trophy, desc: "실시간 랭킹과 룰렛 휠" },
  { id: "flex", label: "슬롯/미니게임 자랑", icon: Star, desc: "화려한 잭팟 이미지 갤러리" },
  { id: "sentiment", label: "실시간 찐팬 응원방", icon: MessageSquare, desc: "감성 이모지 기반 실시간 피드" },
];

// Custom Roulette Component
function RouletteWheel({ onSpinComplete }: { onSpinComplete: (points: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<string | null>(null);
  const [error, setError] = useState("");
  const currentAngle = useRef(0);

  const sectors = [
    { label: "50 VP", color: "#3B82F6" },   // Blue
    { label: "100 VP", color: "#10B981" },  // Emerald
    { label: "200 VP", color: "#8B5CF6" },  // Purple
    { label: "500 VP", color: "#F59E0B" },  // Amber
    { label: "1000 VP", color: "#EF4444" }, // Red
    { label: "꽝", color: "#4B5563" }       // Gray
  ];

  const draw = (angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const radius = width / 2;
    const arc = Math.PI / 3; // 60 degrees in radians

    ctx.clearRect(0, 0, width, height);

    // Draw Outer Shadow / Ring
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(radius, radius, radius - 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#1F2937';
    ctx.fill();
    ctx.shadowBlur = 0; // Reset shadow

    // Draw sectors
    sectors.forEach((sector, i) => {
      const angleStart = angle + i * arc;
      const angleEnd = angleStart + arc;

      ctx.beginPath();
      ctx.moveTo(radius, radius);
      ctx.arc(radius, radius, radius - 15, angleStart, angleEnd);
      ctx.fillStyle = sector.color;
      ctx.fill();

      // Draw Sector border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw labels
      ctx.save();
      ctx.translate(radius, radius);
      ctx.rotate(angleStart + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(sector.label, radius - 35, 5);
      ctx.restore();
    });

    // Draw Center Circle
    ctx.beginPath();
    ctx.arc(radius, radius, 25, 0, 2 * Math.PI);
    ctx.fillStyle = '#111827';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center Gold Pin
    ctx.beginPath();
    ctx.arc(radius, radius, 8, 0, 2 * Math.PI);
    ctx.fillStyle = 'hsl(var(--gold))';
    ctx.fill();
  };

  useEffect(() => {
    draw(currentAngle.current);
  }, []);

  const handleSpin = async () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSpinResult(null);
    setError("");

    try {
      const res = await fetch('/api/concepts/roulette', {
        method: 'POST'
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '룰렛 스핀 중 오류가 발생했습니다.');
      }

      const targetAngle = (data.angle * Math.PI) / 180;
      const startAngle = currentAngle.current;
      const totalSpin = targetAngle;
      const duration = 4000; // 4 seconds spin
      const startTime = performance.now();

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing out cubic: 1 - (1 - x)^3
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentSpinAngle = startAngle + easeOut * totalSpin;

        draw(currentSpinAngle);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          currentAngle.current = currentSpinAngle % (2 * Math.PI);
          setIsSpinning(false);
          setSpinResult(data.label);
          onSpinComplete(data.newPoints);
        }
      };

      requestAnimationFrame(animate);
    } catch (err: any) {
      setError(err.message);
      setIsSpinning(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-6 relative">
      {/* Top pointer */}
      <div className="absolute top-4 z-10 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
      
      <div className="relative">
        <canvas ref={canvasRef} width={260} height={260} className="rounded-full shadow-[0_0_30px_rgba(59,130,246,0.2)] border-4 border-white/5" />
      </div>

      <button
        onClick={handleSpin}
        disabled={isSpinning}
        className={cn(
          "btn-primary text-xs font-black tracking-widest px-8 py-3 rounded-full mt-6 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 uppercase",
          isSpinning && "animate-pulse"
        )}
      >
        {isSpinning ? "스피닝..." : "룰렛 돌리기 (100 VP)"}
      </button>

      {error && (
        <span className="text-[11px] text-red-400 font-bold mt-3 animate-shake flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5" />
          {error}
        </span>
      )}

      {spinResult && (
        <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black rounded-xl px-6 py-2.5 text-center text-sm shadow-[0_0_15px_rgba(16,185,129,0.15)] animate-fade-in flex items-center gap-2">
          <Sparkles className="w-4 h-4 animate-bounce" />
          <span>축하합니다! 룰렛 결과: <strong className="text-white text-base ml-1">{spinResult}</strong> 획득!</span>
        </div>
      )}
    </div>
  );
}

export default function ConceptsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [userPoints, setUserPoints] = useState<number | null>(null);

  // Gamification leaderboards
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(false);

  // Sentiment analytics & composer
  const [sentimentStats, setSentimentStats] = useState<any>({ percentages: { '🔥': 25, '😭': 25, '🎉': 25, '🤬': 25 }, total: 0 });
  const [liveOpinion, setLiveOpinion] = useState("");
  const [opinionSentiment, setOpinionSentiment] = useState("🔥");
  const [isSubmittingOpinion, setIsSubmittingOpinion] = useState(false);

  const activeCat = searchParams.get("cat") || "experiments";
  const currentSearch = searchParams.get("search") || "";

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetch('/api/user/profile');
        const data = await res.json();
        if (data.success && data.profile) {
          setUserPoints(data.profile.points || 0);
        }
      } catch (err) {
        console.error("Failed to fetch user profile", err);
      }
    };
    fetchUserProfile();
  }, []);

  useEffect(() => {
    setSearchQuery(currentSearch);
  }, [currentSearch]);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const url = new URL("/api/posts", window.location.origin);
      url.searchParams.set("category", activeCat);
      url.searchParams.set("limit", activeCat === 'sentiment' ? '25' : '10'); // Fetch more for live feed
      if (currentSearch) url.searchParams.set("search", currentSearch);
      
      const response = await fetch(url.toString());
      const data = await response.json();
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSentimentStats = async () => {
    try {
      const res = await fetch('/api/concepts/sentiment');
      const data = await res.json();
      if (data.success) {
        setSentimentStats(data);
      }
    } catch (err) {
      console.error("Failed to load sentiment statistics", err);
    }
  };

  const fetchLeaderboard = async () => {
    setIsLeaderboardLoading(true);
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      if (data.success) {
        setLeaderboard(data.leaderboard || []);
      }
    } catch (err) {
      console.error("Failed to load leaderboard", err);
    } finally {
      setIsLeaderboardLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();

    if (activeCat === 'gamification') {
      fetchLeaderboard();
    } else if (activeCat === 'sentiment') {
      fetchSentimentStats();
    }
  }, [activeCat, currentSearch]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery) {
      params.set("search", searchQuery);
    } else {
      params.delete("search");
    }
    router.push(`/concepts?${params.toString()}`);
  };

  const handleTagClick = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("search", `#${tag}`);
    router.push(`/concepts?${params.toString()}`);
  };

  const setActiveCat = (catId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("cat", catId);
    params.delete("search");
    router.push(`/concepts?${params.toString()}`);
  };

  // Submit fast opinion (live fan feed)
  const handleOpinionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveOpinion.trim()) return;
    if (liveOpinion.length > 100) return;

    setIsSubmittingOpinion(true);
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `응원 피드: ${liveOpinion.substring(0, 15)}...`,
          content: liveOpinion,
          category: 'sentiment',
          sentiment: opinionSentiment
        }),
      });

      if (response.ok) {
        setLiveOpinion("");
        fetchPosts();
        fetchSentimentStats();
        router.refresh();
      }
    } catch (error) {
      console.error("Opinion submit error:", error);
    } finally {
      setIsSubmittingOpinion(false);
    }
  };

  return (
    <div className="mesh-gradient min-h-screen">
      <div className="container mx-auto px-4 py-10">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <Link href="/" className="hover:text-primary transition-colors">홈</Link>
          <span>/</span>
          <span className="hover:text-primary transition-colors cursor-pointer" onClick={() => router.push('/concepts')}>개념 탑재</span>
          <span>/</span>
          <span className="text-foreground font-bold">
            {CONCEPT_CATEGORIES.find(c => c.id === activeCat)?.label || "기상천외 베팅 실험실"}
          </span>
        </div>

        {/* Header Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter flex items-center gap-2">
              <Lightbulb className="w-8 h-8 text-[hsl(var(--gold))] animate-pulse" /> 개념 탑재 (2.0 업그레이드)
            </h1>
            <p className="text-muted-foreground mt-1">도파민 폭발! 커뮤니티 흥미 위주의 다양한 게이미피케이션 및 엔터테인먼트 라운지</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {activeCat !== 'gamification' && (
              <form onSubmit={handleSearch} className="relative w-full sm:w-80">
                <input 
                  ref={searchInputRef}
                  type="text"
                  placeholder="검색어 또는 #해시태그 입력..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-all"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                {searchQuery && (
                  <button 
                    type="button"
                    onClick={() => { setSearchQuery(""); router.push(`/concepts?cat=${activeCat}`); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                )}
              </form>
            )}
            
            {/* Hide compose button for gamification (roulette page) */}
            {activeCat !== 'gamification' && activeCat !== 'sentiment' && (
              <Link href={`/concepts/write?category=${activeCat}`} className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center whitespace-nowrap">
                <PenLine className="w-4 h-4" /> 글쓰기
              </Link>
            )}
          </div>
        </div>

        {/* Categories Tab Selector */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {CONCEPT_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
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

        {/* --- 1. LIVE SENTIMENT TOP DASHBOARD --- */}
        {activeCat === 'sentiment' && (
          <div className="glass-card rounded-3xl p-6 mb-8 border-white/10 relative overflow-hidden animate-fade-in">
            <div className="absolute -right-24 -top-24 w-48 h-48 rounded-full bg-primary/10 blur-[80px]" />
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="w-full lg:w-1/3">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 block">LIVE Sentiment thermometer</span>
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  찐팬 응원 감성 분석계 🌡️
                </h2>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">최근 50개 응원 글들의 감정 통계를 취합하여 현재 커뮤니티의 전체 분위기를 실시간으로 나타냅니다.</p>
              </div>
              
              <div className="w-full lg:w-2/3 flex flex-col gap-4">
                {/* Sentiment thermometer progress bar */}
                <div className="flex h-6 rounded-full overflow-hidden border border-white/5 shadow-inner">
                  <div className="bg-red-500 flex items-center justify-center text-[10px] font-black transition-all" style={{ width: `${sentimentStats.percentages['🔥']}%` }}>
                    {sentimentStats.percentages['🔥'] > 10 && `🔥 ${sentimentStats.percentages['🔥']}%`}
                  </div>
                  <div className="bg-emerald-500 flex items-center justify-center text-[10px] font-black transition-all" style={{ width: `${sentimentStats.percentages['🎉']}%` }}>
                    {sentimentStats.percentages['🎉'] > 10 && `🎉 ${sentimentStats.percentages['🎉']}%`}
                  </div>
                  <div className="bg-blue-500 flex items-center justify-center text-[10px] font-black transition-all" style={{ width: `${sentimentStats.percentages['😭']}%` }}>
                    {sentimentStats.percentages['😭'] > 10 && `😭 ${sentimentStats.percentages['😭']}%`}
                  </div>
                  <div className="bg-gray-600 flex items-center justify-center text-[10px] font-black transition-all" style={{ width: `${sentimentStats.percentages['🤬']}%` }}>
                    {sentimentStats.percentages['🤬'] > 10 && `🤬 ${sentimentStats.percentages['🤬']}%`}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl py-2">
                    <span className="text-sm block">🔥 환희/열정</span>
                    <span className="text-lg font-black font-mono text-red-400">{sentimentStats.percentages['🔥']}%</span>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl py-2">
                    <span className="text-sm block">🎉 축하/기쁨</span>
                    <span className="text-lg font-black font-mono text-emerald-400">{sentimentStats.percentages['🎉']}%</span>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl py-2">
                    <span className="text-sm block">😭 눈물/아쉬움</span>
                    <span className="text-lg font-black font-mono text-blue-400">{sentimentStats.percentages['😭']}%</span>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl py-2">
                    <span className="text-sm block">🤬 분노/폭발</span>
                    <span className="text-lg font-black font-mono text-gray-400">{sentimentStats.percentages['🤬']}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Grid View */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* LEFT CONTENT AREA */}
          <div className="xl:col-span-8">

            {/* A. 룰렛 & 리더보드 (GAMIFICATION VIEW) */}
            {activeCat === 'gamification' && (
              <div className="space-y-8 animate-fade-in">
                {/* Roulette Wheel card */}
                <div className="glass-card rounded-3xl p-6 border-white/10 flex flex-col items-center text-center relative overflow-hidden bg-gradient-to-br from-primary/5 via-transparent to-transparent">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
                  <div className="max-w-md space-y-1 mb-4">
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">VP Roulette Minigame</span>
                    <h2 className="text-2xl font-black">행운의 포인트 룰렛 휠 🎡</h2>
                    <p className="text-xs text-muted-foreground">1회 도전 시 100 VP가 소모되며 최대 1000 VP 잭팟을 노릴 수 있습니다.</p>
                  </div>

                  <RouletteWheel onSpinComplete={(newPoints) => {
                    // Refresh parent profile states (header points)
                    setUserPoints(newPoints);
                    router.refresh();
                  }} />
                </div>

                {/* ROI Leaderboards */}
                <div className="glass-card rounded-3xl p-6 border-white/10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2.5">
                      <div className="bg-yellow-500/10 p-2 rounded-xl border border-yellow-500/20">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">실시간 수익률 랭킹 (ROI 리더보드)</h3>
                        <p className="text-[10px] text-muted-foreground">누적 베팅 분석 성과가 가장 좋은 상위 유저들 목록입니다.</p>
                      </div>
                    </div>
                  </div>

                  {isLeaderboardLoading ? (
                    <div className="flex flex-col items-center py-10 gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground">리더보드 로딩 중...</span>
                    </div>
                  ) : leaderboard.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/5 text-muted-foreground text-xs uppercase tracking-wider font-bold">
                            <th className="py-3 px-4">순위</th>
                            <th className="py-3 px-4">닉네임</th>
                            <th className="py-3 px-4">등급</th>
                            <th className="py-3 px-4">총 베팅</th>
                            <th className="py-3 px-4">승률</th>
                            <th className="py-3 px-4 text-right">수익률 (ROI)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leaderboard.map((user, index) => (
                            <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                              <td className="py-4 px-4 font-mono font-black text-sm">
                                {index + 1 === 1 ? (
                                  <span className="text-yellow-400 flex items-center gap-1">🥇 1위</span>
                                ) : index + 1 === 2 ? (
                                  <span className="text-gray-300 flex items-center gap-1">🥈 2위</span>
                                ) : index + 1 === 3 ? (
                                  <span className="text-amber-600 flex items-center gap-1">🥉 3위</span>
                                ) : (
                                  `${index + 1}위`
                                )}
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-md bg-white/5 overflow-hidden flex items-center justify-center text-[10px] font-bold">
                                    {user.avatar ? <img src={user.avatar} className="object-cover" /> : user.nickname[0]}
                                  </div>
                                  <span className="font-bold">{user.nickname}</span>
                                </div>
                              </td>
                              <td className="py-4 px-4 font-semibold text-xs text-muted-foreground">Lv.{user.level || 1}</td>
                              <td className="py-4 px-4 font-mono text-xs">{user.totalBets}회</td>
                              <td className="py-4 px-4 font-mono text-xs text-emerald-400 font-bold">{Math.round(user.winRate)}%</td>
                              <td className="py-4 px-4 font-mono text-right font-black text-emerald-400">
                                +{Math.round(user.roi)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-10 text-center text-xs text-muted-foreground">베팅 성과 정보가 충분치 않습니다.</div>
                  )}
                </div>
              </div>
            )}

            {/* B. 슬롯/미니게임 자랑 라운지 (PIN TEREST LAYOUT) */}
            {activeCat === 'flex' && (
              <div className="animate-fade-in">
                {isLoading ? (
                  <div className="columns-2 md:columns-3 gap-4 space-y-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="bg-white/5 border border-white/5 rounded-xl aspect-[3/4] animate-pulse" />
                    ))}
                  </div>
                ) : posts.length > 0 ? (
                  <div className="columns-2 md:columns-3 gap-4 space-y-4">
                    {posts.map((post) => (
                      <Link key={post.id} href={`/community/${post.id}`} className="break-inside-avoid block group relative rounded-2xl overflow-hidden border border-white/5 bg-white/[0.02] hover:border-primary/20 transition-all hover:-translate-y-1 hover:shadow-2xl">
                        {post.image ? (
                          <img src={post.image} className="w-full object-cover max-h-96" alt={post.title} />
                        ) : (
                          <div className="aspect-video bg-white/5 flex items-center justify-center text-xs text-muted-foreground">이미지 없음</div>
                        )}
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 backdrop-blur-[2px]">
                          <h4 className="font-bold text-sm text-white line-clamp-2 leading-snug mb-1">{post.title}</h4>
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-2">
                            <span className="font-bold text-white flex items-center gap-1"><User className="w-3 h-3" /> {post.author}</span>
                            <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {post.likes}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="glass-card rounded-xl p-10 text-center space-y-3">
                    <p className="font-bold">등록된 자랑 사진이 없습니다.</p>
                    <Link href={`/concepts/write?category=flex`} className="btn-primary inline-flex text-xs py-2.5 px-4 mx-auto">첫 슬롯 대박인증 올리기</Link>
                  </div>
                )}
              </div>
            )}

            {/* C. 실시간 찐팬 감성 응원방 (LIVE CONCISE CHAT FEED & COMPOSE) */}
            {activeCat === 'sentiment' && (
              <div className="space-y-6 animate-fade-in">
                {/* opinion compose box */}
                <form onSubmit={handleOpinionSubmit} className="glass-card rounded-3xl p-5 border-white/10 space-y-4 bg-gradient-to-br from-white/[0.01] to-transparent">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-primary uppercase tracking-widest">⚡ 찐팬 실시간 100자 의견 작성</label>
                    <span className="text-[10px] text-muted-foreground/60">{liveOpinion.length}/100자</span>
                  </div>

                  <div className="flex gap-3">
                    <textarea
                      required
                      value={liveOpinion}
                      onChange={(e) => setLiveOpinion(e.target.value.substring(0, 100))}
                      placeholder="경기 실시간 응원글이나 뜨거운 한 줄 감상을 전송해보세요..."
                      rows={2}
                      className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-3.5 px-5 outline-none focus:border-primary/50 focus:bg-white/10 transition-all text-sm leading-relaxed resize-none"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2 py-1.5 rounded-xl">
                      <span className="text-[9px] font-black text-muted-foreground uppercase mr-1">감정:</span>
                      {['🔥', '😭', '🎉', '🤬'].map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setOpinionSentiment(emoji)}
                          className={cn(
                            "w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all",
                            opinionSentiment === emoji ? "bg-primary text-white scale-110 shadow" : "hover:bg-white/10"
                          )}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingOpinion || !liveOpinion.trim()}
                      className="btn-primary text-xs font-black tracking-widest px-6 py-2.5 rounded-xl flex items-center gap-1.5 disabled:opacity-50 w-full sm:w-auto justify-center"
                    >
                      {isSubmittingOpinion ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PenLine className="w-3.5 h-3.5" />}
                      전송하기
                    </button>
                  </div>
                </form>

                {/* short opinion feed lists */}
                <div className="space-y-3">
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="glass-card rounded-xl p-4 animate-pulse h-16 bg-white/5" />
                    ))
                  ) : posts.length > 0 ? (
                    posts.map((post) => (
                      <div key={post.id} className="glass-card rounded-xl p-4 border-white/5 flex gap-3.5 items-center bg-white/[0.01]">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg shadow-inner">
                          {post.sentiment || '🔥'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground leading-snug break-all">{post.content}</p>
                          <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1">
                            <span className="font-bold text-primary">{post.author}</span>
                            <span>Lv.{post.level || 1}</span>
                            <span>{new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center text-xs text-muted-foreground">실시간 응원 피드가 비어 있습니다.</div>
                  )}
                </div>
              </div>
            )}

            {/* D. 기상천외 베팅 실험실 & 멘붕 실패담 (POST GRID LISTS) */}
            {(activeCat === 'experiments' || activeCat === 'fails') && (
              <div className="space-y-4">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="glass-card rounded-2xl p-5 animate-pulse bg-white/5 h-28" />
                  ))
                ) : posts.length > 0 ? (
                  posts.map((post) => {
                    let expMeta = null;
                    if (post.experiment_meta) {
                      try {
                        expMeta = JSON.parse(post.experiment_meta);
                      } catch (e) {
                        console.error(e);
                      }
                    }

                    return (
                      <Link key={post.id} href={`/community/${post.id}`}>
                        <div className={cn(
                          "glass-card rounded-2xl p-5 hover:bg-white/[0.03] transition-all hover:scale-[1.01] hover:shadow-2xl border-white/5 hover:border-primary/20 cursor-pointer group mb-4",
                          activeCat === 'fails' && "bg-gradient-to-br from-red-500/[0.01] via-transparent to-transparent"
                        )}>
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 overflow-hidden flex items-center justify-center font-bold text-primary text-lg shrink-0 group-hover:scale-105 transition-transform">
                              {post.authorAvatar ? (
                                <img src={post.authorAvatar} className="w-full h-full object-cover" />
                              ) : (
                                post.author[0]
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span className="text-[9px] font-black bg-white/5 px-2 py-0.5 rounded-md uppercase tracking-wider text-muted-foreground">
                                  {CONCEPT_CATEGORIES.find(c => c.id === post.category)?.label || post.category}
                                </span>
                                {activeCat === 'experiments' && expMeta && (
                                  <span className={cn(
                                    "text-[9px] font-mono font-black px-2 py-0.5 rounded-md",
                                    parseFloat(expMeta.roi) >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                                  )}>
                                    ROI: {parseFloat(expMeta.roi) >= 0 ? "+" : ""}{expMeta.roi}%
                                  </span>
                                )}
                                {activeCat === 'fails' && (post.likes >= 5) && (
                                  <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center gap-1">
                                    🎁 위로 완료
                                  </span>
                                )}
                              </div>

                              <div className="flex items-start justify-between gap-4">
                                <h3 className="font-bold text-[15px] leading-snug group-hover:text-primary transition-colors mb-2 flex-1">
                                  {post.title}
                                </h3>
                                {post.image && (
                                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/5 bg-white/5">
                                    <img src={post.image} className="w-full h-full object-cover" />
                                  </div>
                                )}
                              </div>

                              {/* Progress bar for Betting experiments */}
                              {activeCat === 'experiments' && expMeta && (
                                <div className="mb-3.5 space-y-1 bg-white/[0.02] border border-white/5 rounded-xl p-3">
                                  <div className="flex justify-between text-[10px] text-muted-foreground">
                                    <span>실험 가설: <strong>{expMeta.hypothesis}</strong></span>
                                    <span>진행도: <strong>{expMeta.currentRound} / {expMeta.totalRounds} 회차</strong></span>
                                  </div>
                                  <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden">
                                    <div className="bg-primary h-full transition-all" style={{ width: `${(expMeta.currentRound / expMeta.totalRounds) * 100}%` }} />
                                  </div>
                                </div>
                              )}

                              {/* Comfort level bar for Fails */}
                              {activeCat === 'fails' && (
                                <div className="mb-3.5 flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl p-3 text-[10px]">
                                  <span className="text-muted-foreground">😭 위로(추천) 게이지:</span>
                                  <div className="flex-1 max-w-xs bg-white/5 h-2 rounded-full overflow-hidden">
                                    <div className="bg-blue-500 h-full transition-all" style={{ width: `${Math.min((post.likes / 5) * 100, 100)}%` }} />
                                  </div>
                                  <span className="font-bold text-blue-400 font-mono">{post.likes} / 5</span>
                                </div>
                              )}

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-black text-foreground">{post.author}</span>
                                  <span className="text-muted-foreground/40 font-bold">Lv.{post.level || 1}</span>
                                </div>
                                <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{new Date(post.createdAt).toLocaleDateString()}</span>
                                <span className="flex items-center gap-1"><Eye className="w-2.5 h-2.5" />{post.views.toLocaleString()}</span>
                                <span className="flex items-center gap-1">
                                  <ThumbsUp className="w-2.5 h-2.5" />
                                  {activeCat === 'fails' ? `위로하기 ${post.likes}` : post.likes}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <div className="glass-card rounded-xl p-10 text-center space-y-4">
                    <p className="font-bold">등록된 게시글이 없습니다.</p>
                    <Link href={`/concepts/write?category=${activeCat}`} className="btn-primary inline-flex text-xs py-2.5 px-4 mx-auto">첫 실험/사연 작성하기</Link>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* RIGHT ASIDE SIDEBAR */}
          <aside className="xl:col-span-4 space-y-6">
            
            {/* User Points Sync Card */}
            <div className="glass-card rounded-3xl p-6 bg-gradient-to-br from-[hsl(var(--gold))]/[0.06] to-transparent border-white/10 text-center relative overflow-hidden">
              <div className="absolute -left-12 -bottom-12 w-24 h-24 bg-[hsl(var(--gold))]/10 rounded-full blur-xl pointer-events-none" />
              <Trophy className="w-8 h-8 text-[hsl(var(--gold))] mx-auto mb-3 animate-bounce" />
              <h4 className="font-bold text-sm mb-1 uppercase tracking-wider text-muted-foreground">My Points</h4>
              <p className="text-xs text-muted-foreground mb-4">현재 나의 활동 가용 VP 현황</p>
              <span className="text-2xl font-black font-mono text-[hsl(var(--gold))] drop-shadow-[0_0_12px_rgba(250,204,21,0.2)]">
                {userPoints !== null ? `${userPoints.toLocaleString()} VP` : "로그인 후 확인 가능"}
              </span>
            </div>

            {/* Hot Experiments Carousel Sidebar Widget */}
            <div className="glass-card rounded-2xl p-5 border-white/5">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-4 h-4 text-red-500" />
                <h3 className="font-bold text-sm">실시간 핫이슈 실험실</h3>
              </div>
              <div className="text-xs text-muted-foreground space-y-3.5">
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer">
                  <span className="font-mono text-[10px] text-primary font-bold">ROI +128.5% 🔥</span>
                  <p className="font-bold mt-1 leading-snug text-white">100달러로 EPL 역배당 팀만 걸어본다</p>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer">
                  <span className="font-mono text-[10px] text-primary font-bold">ROI +84.2%</span>
                  <p className="font-bold mt-1 leading-snug text-white">홈팀 무승부 마틴게일 베팅 기법 7차전</p>
                </div>
              </div>
            </div>

            {/* Popular Tags List */}
            {activeCat !== 'gamification' && (
              <div className="glass-card rounded-2xl p-5 border-white/5">
                <div className="flex items-center gap-2 mb-4">
                  <Hash className="w-4 h-4 text-primary" />
                  <h3 className="font-bold text-sm">인기 해시태그</h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {["EPL", "슬롯대박", "무지성베팅", "낙첨인증", "위로포인트", "룰렛잭팟", "수익률", "역배당", "마틴게일"].map(tag => (
                    <button 
                      key={tag} 
                      onClick={() => handleTagClick(tag)}
                      className={cn(
                        "text-[11px] px-2.5 py-1.5 rounded-full transition-all font-semibold border",
                        currentSearch === `#${tag}` 
                          ? "bg-primary/20 text-primary border-primary/30"
                          : "bg-white/5 text-muted-foreground hover:text-primary hover:bg-primary/10 border-white/[0.04] hover:border-primary/20"
                      )}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Floating write guide CTA */}
            {activeCat !== 'gamification' && activeCat !== 'sentiment' && (
              <div className="glass-card rounded-2xl p-5 border-white/5 text-center">
                <Sparkles className="w-6 h-6 text-[hsl(var(--gold))] mx-auto mb-2.5" />
                <h4 className="font-bold text-sm mb-1 text-white">나도 실험/사연 올리기</h4>
                <p className="text-[10px] text-muted-foreground mb-4">재밌는 베팅 실험이나 멘붕 낙첨 썰을 공유하고 혜택을 받으세요.</p>
                <Link href={`/concepts/write?category=${activeCat}`} className="btn-primary w-full text-xs py-2.5 block font-black uppercase tracking-wider">글쓰기 시작</Link>
              </div>
            )}

          </aside>

        </div>
      </div>
    </div>
  );
}
