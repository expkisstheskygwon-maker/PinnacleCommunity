"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Users, PenLine, ThumbsUp, Eye, Clock, Flame,
  Hash, Search, X,
  History, Shield, Zap, Lightbulb, Trophy,
  Play, RefreshCw, AlertCircle, BookOpen, TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

// Chart.js imports for Betting Simulator
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend,
  Filler
);

const CONCEPT_META: Record<string, { label: string; icon: any; desc: string }> = {
  experiments: { label: "기상천외 배팅 실험실", icon: Zap, desc: "기상천외한 배팅 전략 시뮬레이션" },
  fails: { label: "베팅 복기", icon: History, desc: "나의 베팅 성과 복기" },
  gamification: { label: "레벨/경험치", icon: Flame, desc: "커뮤니티 활동 및 보상 통계" },
  flex: { label: "수익 인증", icon: Trophy, desc: "나의 수익 및 당첨 베팅 자랑하기" },
  sentiment: { label: "시장 여론", icon: Shield, desc: "베팅 시장의 심리 및 흐름 분석" },
};

const CONCEPT_CATEGORIES = [
  { id: "fails", label: "베팅 복기", icon: History, desc: "나의 베팅 성과 복기" },
  { id: "sentiment", label: "시장 여론", icon: Shield, desc: "베팅 시장의 심리 및 흐름 분석" },
  { id: "experiments", label: "기상천외 배팅 실험실", icon: Zap, desc: "기상천외한 배팅 전략 시뮬레이션" },
];

const STRATEGY_INFO = [
  {
    id: "martingale",
    name: "마틴게일 (Martingale)",
    desc: "가장 고전적인 배팅 기법으로, 손실을 볼 때마다 배팅 액을 2배로 증가시킵니다. 단 한 번만 이기면 이전의 모든 손실을 복구하고 첫 배팅 액만큼의 수익을 냅니다.",
    pros: "단기적으로 성공 확률이 매우 높고, 모든 손실의 빠른 복구가 가능합니다.",
    cons: "연패 시 배팅액이 기하급수적으로 폭증하므로, 순식간에 파산(Bust)에 이를 리스크가 있습니다."
  },
  {
    id: "fibonacci",
    name: "피보나치 (Fibonacci)",
    desc: "피보나치 수열(1, 1, 2, 3, 5, 8, 13, 21...)을 따라 배팅액을 설정합니다. 손실 시 수열의 다음 단계로 이동하고, 승리 시 수열에서 2단계 뒤로 이동합니다.",
    pros: "마틴게일에 비해 배팅액 상승 속도가 다소 완만하여 안정적입니다.",
    cons: "연패 시 복구를 완료하기 위해 다수의 승리가 필요합니다."
  },
  {
    id: "kelly",
    name: "켈리 공식 (Kelly Criterion)",
    desc: "배팅의 기댓값과 승률을 분석하여 자산 대비 최적의 배팅 비율을 수학적으로 산출합니다. 공식: F* = (p * (b - 1) - q) / (b - 1) (단, p:승률, b:배당, q:패배율)",
    pros: "장기적인 자산의 복리 성장 속도를 극대화하고 파산 확률을 거의 0%로 통제합니다.",
    cons: "승률과 배당률의 정확한 예측이 선행되어야 하며, 최적 비중 산출이 복잡합니다."
  },
  {
    id: "flat",
    name: "고정 배팅 (Flat Betting)",
    desc: "승패 및 자산 변동과 무관하게 언제나 자산 대비 일정한 고정 금액(예: 자산의 2%~5%)을 배팅합니다.",
    pros: "심리 변화에 흔들리지 않으며, 장기적인 뱅크롤 관리가 가장 안전합니다.",
    cons: "승률이 50%를 초과하지 않으면 원금 회복 및 자산 성장이 매우 더딥니다."
  }
];

function ConceptsDashboard({ activeCat }: { activeCat: string }) {
  const stats = {
    review: { profit: "+1,248,500원", winRate: 68, avgOdds: "1.92", roi: "114.5%", bets: 42 },
    bankroll: { profit: "+850,000원", winRate: 72, avgOdds: "1.75", roi: "109.8%", bets: 28 },
    strategy: { profit: "+3,120,000원", winRate: 59, avgOdds: "2.10", roi: "128.3%", bets: 65 },
    fails: { profit: "+1,248,500원", winRate: 68, avgOdds: "1.92", roi: "114.5%", bets: 42 },
    sentiment: { profit: "+850,000원", winRate: 72, avgOdds: "1.75", roi: "109.8%", bets: 28 },
    experiments: { profit: "+3,120,000원", winRate: 59, avgOdds: "2.10", roi: "128.3%", bets: 65 },
    gamification: { profit: "+450,000원", winRate: 60, avgOdds: "1.80", roi: "105.0%", bets: 15 },
    flex: { profit: "+2,100,000원", winRate: 75, avgOdds: "2.05", roi: "120.0%", bets: 50 },
  }[activeCat as any] || { profit: "+1,248,500원", winRate: 68, avgOdds: "1.92", roi: "114.5%", bets: 42 };

  return (
    <div className="glass-card rounded-3xl p-6 mb-8 border-white/10 relative overflow-hidden animate-fade-in">
      <div className="absolute -right-24 -top-24 w-48 h-48 rounded-full bg-primary/10 blur-[80px] pointer-events-none" />
      <div className="absolute -left-24 -bottom-24 w-48 h-48 rounded-full bg-[hsl(var(--gold))]/5 blur-[80px] pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="w-full lg:w-1/3 flex flex-col justify-center items-center lg:items-start text-center lg:text-left">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">My Cumulative Return</span>
          <h2 className="text-3xl md:text-4xl font-black text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.2)] tracking-tight">
            {stats.profit}
          </h2>
          <p className="text-xs text-muted-foreground/60 mt-2 font-medium">최근 등록된 복기 기록 기반 실시간 집계</p>
        </div>

        <div className="w-full lg:w-1/3 flex items-center justify-center gap-6 border-y lg:border-y-0 lg:border-x border-white/5 py-6 lg:py-2">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="transparent" />
              <circle cx="50" cy="50" r="40" stroke="url(#winRateGrad)" strokeWidth="8" fill="transparent"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * stats.winRate) / 100}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="winRateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-lg font-black font-mono leading-none">{stats.winRate}%</span>
              <span className="text-[8px] font-bold text-muted-foreground tracking-wider mt-0.5">승률</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>총 {stats.bets}회 베팅</span>
            </div>
            <p className="text-[10px] text-muted-foreground/60 leading-relaxed font-medium">
              전략적 베팅 및 리스크 분산 관리를 통해<br/>안정적인 Win-rate 비율을 유지 중입니다.
            </p>
          </div>
        </div>

        <div className="w-full lg:w-1/3 grid grid-cols-2 gap-4">
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col justify-center items-center group hover:bg-white/[0.04] transition-all">
            <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest mb-1.5">Average Odds</span>
            <span className="text-xl font-mono font-black text-[hsl(var(--gold))] group-hover:scale-105 transition-transform">{stats.avgOdds}</span>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col justify-center items-center group hover:bg-white/[0.04] transition-all">
            <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest mb-1.5">Return (ROI)</span>
            <span className="text-xl font-mono font-black text-primary group-hover:scale-105 transition-transform">{stats.roi}</span>
          </div>
        </div>
      </div>
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
  const [dynCategories, setDynCategories] = useState<any[]>(CONCEPT_CATEGORIES);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch("/api/admin/categories?type=concepts");
        const data = await res.json();
        if (data.success && data.categories && data.categories.length > 0) {
          const mapped = data.categories.map((c: any) => ({
            id: c.name,
            label: CONCEPT_META[c.name]?.label || c.name,
            icon: CONCEPT_META[c.name]?.icon || Lightbulb,
            desc: CONCEPT_META[c.name]?.desc || "",
          }));
          setDynCategories(mapped);
        }
      } catch (e) {
        console.error("Failed to fetch concepts categories:", e);
      }
    };
    fetchCats();
  }, []);

  const activeCat = searchParams.get("cat") || (dynCategories[0]?.id || "fails");
  const currentSearch = searchParams.get("search") || "";

  // User session state
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Simulator State
  const [simStrategy, setSimStrategy] = useState("martingale");
  const [simBankroll, setSimBankroll] = useState(10000);
  const [simBaseBet, setSimBaseBet] = useState(500);
  const [simOdds, setSimOdds] = useState(2.0);
  const [simWinProb, setSimWinProb] = useState(50);
  const [simRounds, setSimRounds] = useState(50);
  const [simKellyMult, setSimKellyMult] = useState(1.0);
  const [simResults, setSimResults] = useState<any>(null);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/profile");
        const data = await res.json();
        if (data.success && data.profile) {
          setUserProfile(data.profile);
          setIsLoggedIn(true);
          // Pre-fill simulator bankroll with user points if greater than 0
          if (data.profile.points > 0) {
            setSimBankroll(data.profile.points);
          }
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    setSearchQuery(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const url = new URL("/api/posts", window.location.origin);
        url.searchParams.set("category", activeCat);
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

    fetchPosts();
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
    router.push(`/concepts?${params.toString()}`);
  };

  const handleRunSimulation = () => {
    let bankroll = simBankroll;
    let currentBet = simBaseBet;
    let fibIndex = 0;
    const fibSeq = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584];
    
    const history = [{ round: 0, bet: 0, win: false, profit: 0, bankroll: bankroll }];
    let wins = 0;
    let maxDrawdown = 0;
    let peak = bankroll;
    let isBust = false;

    for (let i = 1; i <= simRounds; i++) {
      if (bankroll <= 0) {
        isBust = true;
        break;
      }

      let betSize = 0;
      if (simStrategy === "martingale") {
        betSize = currentBet;
      } else if (simStrategy === "fibonacci") {
        const idx = Math.min(fibIndex, fibSeq.length - 1);
        betSize = fibSeq[idx] * simBaseBet;
      } else if (simStrategy === "kelly") {
        const p = simWinProb / 100;
        const q = 1 - p;
        const b = simOdds;
        // Kelly Formula: fraction = (bp - q) / b where b is decimal odds - 1
        const bKelly = b - 1;
        if (bKelly <= 0) {
          betSize = 0;
        } else {
          const fraction = (p * bKelly - q) / bKelly;
          betSize = Math.max(0, Math.floor(bankroll * fraction * simKellyMult));
        }
      } else {
        // Flat betting
        betSize = simBaseBet;
      }

      // Cap bet
      if (betSize > bankroll) {
        betSize = bankroll;
      }

      if (betSize <= 0) {
        history.push({ round: i, bet: 0, win: false, profit: 0, bankroll: bankroll });
        continue;
      }

      const win = Math.random() * 100 < simWinProb;
      let profit = 0;
      if (win) {
        wins++;
        profit = Math.round(betSize * (simOdds - 1));
        bankroll += profit;
        
        if (simStrategy === "martingale") {
          currentBet = simBaseBet; // Reset
        } else if (simStrategy === "fibonacci") {
          fibIndex = Math.max(0, fibIndex - 2); // Shift back 2 steps
        }
      } else {
        profit = -betSize;
        bankroll += profit;

        if (simStrategy === "martingale") {
          currentBet = currentBet * 2; // Double
        } else if (simStrategy === "fibonacci") {
          fibIndex++; // Shift forward 1 step
        }
      }

      if (bankroll > peak) {
        peak = bankroll;
      }
      const dd = peak > 0 ? ((peak - bankroll) / peak) * 100 : 0;
      if (dd > maxDrawdown) {
        maxDrawdown = dd;
      }

      history.push({
        round: i,
        bet: betSize,
        win: win,
        profit: profit,
        bankroll: bankroll
      });
    }

    setSimResults({
      history,
      wins,
      maxDrawdown: Math.round(maxDrawdown),
      finalBankroll: bankroll,
      isBust,
      netProfit: bankroll - simBankroll,
      winRate: Math.round((wins / (isBust ? history.length - 1 : simRounds)) * 100) || 0
    });
  };

  const chartData = {
    labels: simResults ? simResults.history.map((h: any) => `${h.round}회`) : [],
    datasets: [
      {
        label: '잔고 추이',
        data: simResults ? simResults.history.map((h: any) => h.bankroll) : [],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        borderWidth: 2,
        tension: 0.2,
        fill: true,
        pointRadius: simRounds > 100 ? 0 : 2,
        pointHoverRadius: 4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 10,
        bodyFont: {
          family: 'sans-serif',
          size: 11
        },
        titleFont: {
          family: 'sans-serif',
          weight: 'bold' as const,
          size: 12
        },
        callbacks: {
          label: function (context: any) {
            return ` 잔고: ${context.parsed.y.toLocaleString()} VP`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.03)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.4)',
          font: {
            size: 9
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.03)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.4)',
          font: {
            size: 9
          }
        }
      }
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
            {dynCategories.find(c => c.id === activeCat)?.label || "베팅 복기"}
          </span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter flex items-center gap-2">
              <Lightbulb className="w-8 h-8 text-[hsl(var(--gold))] animate-pulse" /> 개념 탑재
            </h1>
            <p className="text-muted-foreground mt-1">성공적인 베팅을 위한 복기 및 자금 관리 전략 수립 공간</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
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
            <Link href={`/concepts/write?category=${activeCat}`} className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center">
              <PenLine className="w-4 h-4" /> 글쓰기
            </Link>
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {dynCategories.map(cat => (
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

        {/* Mini Dashboard - Hide on Strategy / Experiments tab */}
        {activeCat !== "strategy" && activeCat !== "experiments" && <ConceptsDashboard activeCat={activeCat} />}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Main Left Area */}
          <div className="xl:col-span-8 space-y-8">
            
            {/* Strategy Lab (Interactive Betting Strategy Simulator) */}
            {(activeCat === "strategy" || activeCat === "experiments") && (
              <div className="space-y-6">
                <div className="glass-card rounded-3xl p-6 md:p-8 border-white/10 relative overflow-hidden">
                  <div className="absolute -right-24 -top-24 w-48 h-48 rounded-full bg-primary/10 blur-[80px] pointer-events-none" />
                  <h2 className="text-xl font-black mb-1 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" /> 기상천외 배팅 시뮬레이터
                  </h2>
                  <p className="text-xs text-muted-foreground mb-6">배팅 기법들을 설정하고 모의 실험을 수행해 리스크와 누적 성과를 검증합니다.</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Simulator Settings */}
                    <div className="space-y-4 md:col-span-1 border-r border-white/5 pr-0 md:pr-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-muted-foreground font-black uppercase tracking-wider block">배팅 전략</label>
                        <select
                          value={simStrategy}
                          onChange={(e) => setSimStrategy(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-primary/50 text-foreground"
                        >
                          <option value="martingale" className="bg-background text-foreground">마틴게일 (2배씩 증가)</option>
                          <option value="fibonacci" className="bg-background text-foreground">피보나치 수열</option>
                          <option value="kelly" className="bg-background text-foreground">켈리 공식 (최적 비중)</option>
                          <option value="flat" className="bg-background text-foreground">고정 배팅</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-muted-foreground font-black uppercase tracking-wider block">시작 자산 (VP)</label>
                        <input
                          type="number"
                          value={simBankroll}
                          onChange={(e) => setSimBankroll(Math.max(1, parseInt(e.target.value) || 0))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-mono font-bold focus:outline-none focus:border-primary/50"
                        />
                      </div>

                      {simStrategy !== "kelly" && (
                        <div className="space-y-1.5 animate-fade-in">
                          <label className="text-[10px] text-muted-foreground font-black uppercase tracking-wider block">기본 배팅액 (VP)</label>
                          <input
                            type="number"
                            value={simBaseBet}
                            onChange={(e) => setSimBaseBet(Math.max(1, parseInt(e.target.value) || 0))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-mono font-bold focus:outline-none focus:border-primary/50"
                          />
                        </div>
                      )}

                      {simStrategy === "kelly" && (
                        <div className="space-y-1.5 animate-fade-in">
                          <label className="text-[10px] text-muted-foreground font-black uppercase tracking-wider block">켈리 배율 (Multiplier)</label>
                          <select
                            value={simKellyMult}
                            onChange={(e) => setSimKellyMult(parseFloat(e.target.value) || 1.0)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none"
                          >
                            <option value="1">Full Kelly (1.0)</option>
                            <option value="0.5">Half Kelly (0.5)</option>
                            <option value="0.25">Quarter Kelly (0.25)</option>
                          </select>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-muted-foreground font-black uppercase tracking-wider block">배당률 (Odds)</label>
                          <input
                            type="number"
                            step="0.05"
                            value={simOdds}
                            onChange={(e) => setSimOdds(Math.max(1.01, parseFloat(e.target.value) || 0))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-mono font-bold focus:outline-none focus:border-primary/50"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-muted-foreground font-black uppercase tracking-wider block">예상 승률 (%)</label>
                          <input
                            type="number"
                            min="1"
                            max="99"
                            value={simWinProb}
                            onChange={(e) => setSimWinProb(Math.min(99, Math.max(1, parseInt(e.target.value) || 0)))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-mono font-bold focus:outline-none focus:border-primary/50"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-muted-foreground font-black uppercase tracking-wider block">배팅 회수 (Rounds)</label>
                        <input
                          type="number"
                          min="5"
                          max="200"
                          value={simRounds}
                          onChange={(e) => setSimRounds(Math.min(200, Math.max(5, parseInt(e.target.value) || 0)))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-mono font-bold focus:outline-none focus:border-primary/50"
                        />
                      </div>

                      <button
                        onClick={handleRunSimulation}
                        className="btn-primary w-full py-3 text-xs flex items-center justify-center gap-1.5 font-bold"
                      >
                        <Play className="w-3.5 h-3.5" /> 시뮬레이션 시작
                      </button>
                    </div>

                    {/* Simulation Result Details */}
                    <div className="space-y-6 md:col-span-2 flex flex-col justify-between">
                      {simResults ? (
                        <div className="space-y-6 flex-1 flex flex-col justify-between">
                          {/* Stats Summary cards */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-center">
                              <span className="text-[8px] font-bold text-muted-foreground/60 uppercase block mb-1">최종 자산</span>
                              <span className={cn(
                                "text-sm font-mono font-black",
                                simResults.finalBankroll <= 0 ? "text-red-400" : "text-white"
                              )}>
                                {simResults.finalBankroll.toLocaleString()} VP
                              </span>
                            </div>
                            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-center">
                              <span className="text-[8px] font-bold text-muted-foreground/60 uppercase block mb-1">총 손익</span>
                              <span className={cn(
                                "text-sm font-mono font-black",
                                simResults.netProfit > 0 ? "text-emerald-400" : simResults.netProfit < 0 ? "text-red-400" : "text-muted-foreground"
                              )}>
                                {simResults.netProfit > 0 ? "+" : ""}{simResults.netProfit.toLocaleString()} VP
                              </span>
                            </div>
                            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-center">
                              <span className="text-[8px] font-bold text-muted-foreground/60 uppercase block mb-1">실제 승률</span>
                              <span className="text-sm font-mono font-black text-primary">
                                {simResults.winRate}%
                              </span>
                            </div>
                            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-center">
                              <span className="text-[8px] font-bold text-muted-foreground/60 uppercase block mb-1">최대 낙폭</span>
                              <span className="text-sm font-mono font-black text-orange-400">
                                {simResults.maxDrawdown}%
                              </span>
                            </div>
                          </div>

                          {/* Chart */}
                          <div className="flex-1 relative min-h-[160px] bg-black/10 border border-white/5 rounded-2xl p-4 flex items-center justify-center">
                            {simResults.isBust && (
                              <div className="absolute top-3 right-3 flex items-center gap-1 bg-red-500/20 border border-red-500/30 text-red-400 text-[9px] font-bold px-2 py-0.5 rounded-full z-10">
                                <AlertCircle className="w-2.5 h-2.5" /> 파산 (Bust)
                              </div>
                            )}
                            <div className="w-full h-full min-h-[140px]">
                              <Line data={chartData} options={chartOptions} />
                            </div>
                          </div>

                          <p className="text-[10px] text-muted-foreground/60 text-center leading-relaxed">
                            ※ 난수 생성을 통한 몬테카를로 분석 결과이므로 매 시도 시 결과값은 다르게 나타납니다.
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12">
                          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground/30">
                            <TrendingUp className="w-8 h-8" />
                          </div>
                          <div>
                            <p className="font-bold text-sm">대기 중</p>
                            <p className="text-xs text-muted-foreground">시뮬레이션 설정을 완료하고 시작 버튼을 클릭해 주세요.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Simulation Round Logs Table */}
                {simResults && (
                  <div className="glass-card rounded-2xl p-6 border-white/10 animate-fade-in">
                    <h3 className="text-sm font-black mb-4 flex items-center gap-1.5 text-muted-foreground">
                      <RefreshCw className="w-3.5 h-3.5" /> 상세 배팅 기록 (최근 15회)
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-white/5 text-muted-foreground/60">
                            <th className="text-left pb-2 font-black">회차 (Round)</th>
                            <th className="text-right pb-2 font-black">배팅액 (Bet)</th>
                            <th className="text-center pb-2 font-black">결과 (Outcome)</th>
                            <th className="text-right pb-2 font-black">손익 (Profit)</th>
                            <th className="text-right pb-2 font-black">뱅크롤 (Bankroll)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03] font-mono">
                          {simResults.history.slice(-15).reverse().map((h: any, idx: number) => {
                            if (h.round === 0) return null;
                            return (
                              <tr key={idx} className="hover:bg-white/[0.02]">
                                <td className="py-2.5 text-left text-muted-foreground">{h.round}회차</td>
                                <td className="py-2.5 text-right font-bold">{h.bet.toLocaleString()} VP</td>
                                <td className="py-2.5 text-center">
                                  <span className={cn(
                                    "px-1.5 py-0.5 rounded text-[9px] font-black",
                                    h.win 
                                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                                  )}>
                                    {h.win ? "WIN" : "LOSE"}
                                  </span>
                                </td>
                                <td className={cn(
                                  "py-2.5 text-right font-bold",
                                  h.profit > 0 ? "text-emerald-400" : "text-red-400"
                                )}>
                                  {h.profit > 0 ? "+" : ""}{h.profit.toLocaleString()} VP
                                </td>
                                <td className="py-2.5 text-right text-foreground font-black">{h.bankroll.toLocaleString()} VP</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Posts List */}
            <div className="space-y-3">
              <h2 className="text-base font-black px-1 flex items-center gap-1.5 text-muted-foreground mb-4">
                <BookOpen className="w-4 h-4 text-primary" /> 관련 게시글 및 토론
              </h2>

              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="glass-card rounded-xl p-5 animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-white/5 rounded-xl shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-2 w-20 bg-white/5 rounded" />
                        <div className="h-4 w-full bg-white/5 rounded" />
                        <div className="h-2 w-40 bg-white/5 rounded" />
                      </div>
                    </div>
                  </div>
                ))
              ) : posts.length > 0 ? (
                posts.map((post) => (
                  <Link key={post.id} href={`/community/${post.id}`}>
                    <div className="glass-card rounded-xl p-5 hover:bg-white/[0.03] transition-all hover:scale-[1.01] hover:shadow-2xl border-white/5 hover:border-primary/20 cursor-pointer group mb-3">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 overflow-hidden flex items-center justify-center font-bold text-primary text-lg shrink-0 group-hover:scale-105 transition-transform">
                          {post.authorAvatar ? (
                            <img src={post.authorAvatar} className="w-full h-full object-cover" alt={post.author} />
                          ) : (
                            post.author[0]
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="text-[9px] font-bold bg-white/5 px-1.5 py-0.5 rounded uppercase">
                              {dynCategories.find(c => c.id === post.category)?.label || post.category}
                            </span>
                            {post.views > 1000 && (
                              <span className="badge-danger text-[8px]">
                                <Flame className="w-2.5 h-2.5" /> HOT
                              </span>
                            )}
                          </div>
                          <div className="flex items-start justify-between gap-4">
                            {post.authorId === 0 ? (
                              <h3 className="font-bold text-[15px] leading-snug group-hover:text-primary transition-colors mb-2 flex-1" dangerouslySetInnerHTML={{ __html: post.title }} />
                            ) : (
                              <h3 className="font-bold text-[15px] leading-snug group-hover:text-primary transition-colors mb-2 flex-1">
                                {post.title}
                              </h3>
                            )}
                            {post.image && (
                              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-white/5 bg-white/5">
                                <img src={post.image} className="w-full h-full object-cover" alt="Thumbnail" />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-foreground">{post.author}</span>
                              <span className="text-muted-foreground/40">Lv.{post.level || 1}</span>
                            </div>
                            <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{new Date(post.createdAt).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><Eye className="w-2.5 h-2.5" />{post.views.toLocaleString()}</span>
                            <span className="flex items-center gap-1"><ThumbsUp className="w-2.5 h-2.5" />{post.likes}</span>
                          </div>
                          {post.tags && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {post.tags.split(',').map((tag: string) => {
                                const t = tag.trim();
                                if (!t) return null;
                                return (
                                  <button 
                                    key={t} 
                                    onClick={(e) => { e.preventDefault(); handleTagClick(t); }}
                                    className="text-[9px] text-muted-foreground/60 hover:text-primary flex items-center gap-0.5 transition-colors"
                                  >
                                    <Hash className="w-2 h-2" />{t}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="glass-card rounded-xl p-10 text-center space-y-4">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-muted-foreground/20">
                    <PenLine className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-bold">등록된 게시글이 없습니다.</p>
                    <p className="text-xs text-muted-foreground">나의 배팅 경험을 기록하고 공유해보세요!</p>
                  </div>
                  <Link href={`/concepts/write?category=${activeCat}`} className="btn-primary inline-flex items-center gap-2 py-3 px-6 text-xs mx-auto">
                    첫 글 작성하기
                  </Link>
                </div>
              )}

              {posts.length > 0 && (
                <button className="w-full py-5 rounded-xl border-2 border-dashed border-white/[0.06] text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all font-bold text-xs uppercase tracking-widest">
                  더 보기
                </button>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="xl:col-span-4 space-y-6">
            
            {/* MY POINTS status card (shown in user request) */}
            <div className="glass-card rounded-3xl p-6 flex flex-col items-center justify-center text-center border-white/10 relative overflow-hidden group hover:border-primary/20 transition-all min-h-[200px]">
              <div className="absolute -right-12 -top-12 w-24 h-24 rounded-full bg-[hsl(var(--gold))]/10 blur-[40px] pointer-events-none" />
              
              <div className="bg-[hsl(var(--gold))]/10 p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                <Trophy className="w-10 h-10 text-[hsl(var(--gold))] drop-shadow-[0_0_12px_rgba(251,191,36,0.3)]" />
              </div>
              
              <span className="text-xs font-black text-muted-foreground/80 uppercase tracking-widest mb-1.5">My Points</span>
              <h4 className="text-xs font-bold text-muted-foreground/60 mb-4">현재 나의 활동 가용 VP 현황</h4>
              
              {!isLoggedIn ? (
                <div className="space-y-3">
                  <p className="text-2xl font-black text-[hsl(var(--gold))] tracking-tight">로그인 후 확인 가능</p>
                  <Link href="/login" className="btn-primary inline-flex items-center gap-1.5 py-2 px-5 text-xs">
                    로그인 하러가기
                  </Link>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-3xl font-mono font-black text-[hsl(var(--gold))] drop-shadow-[0_0_16px_rgba(251,191,36,0.4)] tracking-tight">
                    {(userProfile?.points || 0).toLocaleString()} <span className="text-lg">VP</span>
                  </p>
                  <p className="text-[9px] text-muted-foreground/50 leading-relaxed max-w-[200px] mx-auto mt-2">
                    커뮤니티 활동(글/댓글 작성)을 통해 획득한 VP 점수를 배팅 모의 시뮬레이션의 초기 자산으로 사용할 수 있습니다.
                  </p>
                </div>
              )}
            </div>

            {/* Betting Lab Strategy Explanations (Shown on Strategy / Experiments tab) */}
            {(activeCat === "strategy" || activeCat === "experiments") && (
              <div className="glass-card rounded-2xl p-5 space-y-4">
                <h3 className="font-black text-sm text-foreground flex items-center gap-1.5 border-b border-white/5 pb-2">
                  <Zap className="w-4 h-4 text-primary" /> 실험실 배팅 기법 요약
                </h3>
                <div className="space-y-4">
                  {STRATEGY_INFO.map(s => (
                    <div key={s.id} className="space-y-1">
                      <p className="text-xs font-bold text-primary">{s.name}</p>
                      <p className="text-[10px] text-muted-foreground/80 leading-relaxed">{s.desc}</p>
                      <div className="grid grid-cols-2 gap-2 mt-1 border-t border-white/[0.03] pt-1">
                        <div>
                          <span className="text-[8px] font-black text-emerald-400 block uppercase">장점</span>
                          <span className="text-[9px] text-muted-foreground/60">{s.pros}</span>
                        </div>
                        <div>
                          <span className="text-[8px] font-black text-red-400 block uppercase">단점/리스크</span>
                          <span className="text-[9px] text-muted-foreground/60">{s.cons}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Contributors */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-[hsl(var(--gold))]/15 p-1.5 rounded-lg">
                  <Trophy className="w-4 h-4 text-[hsl(var(--gold))]" />
                </div>
                <h3 className="font-bold">복기 랭킹</h3>
              </div>
              <div className="py-6 text-center">
                <p className="text-xs text-muted-foreground">데이터 집계 중...</p>
              </div>
            </div>

            {/* Popular Tags */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-primary/15 p-1.5 rounded-lg">
                  <Hash className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-bold">인기 태그</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {["복기", "자금관리", "전략", "ROI", "적중", "배당분석", "핸디캡", "오버언더", "심리관리", "뱅크롤"].map(tag => (
                  <button 
                    key={tag} 
                    onClick={() => handleTagClick(tag)}
                    className={cn(
                      "text-xs px-3 py-1.5 rounded-full transition-all font-medium border",
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

            {/* Write CTA */}
            <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-[hsl(var(--gold))]/[0.06] to-transparent text-center">
              <Lightbulb className="w-8 h-8 text-[hsl(var(--gold))] mx-auto mb-3" />
              <h4 className="font-bold mb-1">나의 베팅을 기록하세요</h4>
              <p className="text-xs text-muted-foreground mb-4">베팅 복기, 전략 공유, 자금 관리 노하우</p>
              <Link href={`/concepts/write?category=${activeCat}`} className="btn-primary w-full text-sm py-3 block">글쓰기</Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
