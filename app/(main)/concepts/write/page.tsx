'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  PenLine, X, Check, ChevronLeft, Hash, 
  Info, Loader2, AlertTriangle, Image as ImageIcon, Send,
  History, Shield, Zap, Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

const TEMPLATES = [
  {
    id: "report",
    label: "📊 월간 베팅 리포트",
    content: `[이번 달 베팅 리포트]\n\n1. 총 손익 및 ROI (투자 수익률):\n- 총 베팅 금액: \n- 총 당첨 금액: \n- 순수익: \n- ROI (%): \n\n2. 주요 성공 요인 (Best Picks):\n- (예: 특정 리그 언더오버 마켓 적중률 우수)\n\n3. 주요 실패 요인 (Worst Picks):\n- (예: 감정적인 라이브 추격 베팅 실패)\n\n4. 다음 달 목표 및 전략 수정:\n- \n`
  },
  {
    id: "mistake",
    label: "🧠 나의 베팅 실수 복기",
    content: `[나의 주요 베팅 실수 복기]\n\n1. 실수의 상황 (언제, 어떤 경기에서?):\n- \n\n2. 실수의 원인 (왜 그런 선택을 했는가?):\n- (예: 본전 생각에 무리한 다폴더, 잃고 나서의 분노 베팅 등)\n\n3. 결과 및 손실 규모:\n- \n\n4. 향후 재발 방지 대책:\n- \n`
  }
];

export default function ConceptsWritePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    category: 'fails',
    content: '',
    tags: '',
    image: '',
  });

  const [betLog, setBetLog] = useState({
    match: '',
    odds: '',
    stake: '',
    result: 'win'
  });

  const isBetLogCategory = formData.category === 'review' || formData.category === 'strategy' || formData.category === 'fails' || formData.category === 'experiments';

  const calculateNetProfit = () => {
    const oddsNum = parseFloat(betLog.odds) || 0;
    const stakeNum = parseFloat(betLog.stake) || 0;
    
    if (oddsNum <= 0 || stakeNum <= 0) return 0;
    
    switch (betLog.result) {
      case 'win':
        return Math.round(stakeNum * (oddsNum - 1));
      case 'lose':
        return -Math.round(stakeNum);
      case 'half-win':
        return Math.round(stakeNum * (oddsNum - 1) * 0.5);
      case 'half-lose':
        return -Math.round(stakeNum * 0.5);
      case 'void':
      default:
        return 0;
    }
  };

  const searchParams = useSearchParams();
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
          
          const qCat = searchParams.get('category');
          if (qCat && mapped.find((c: any) => c.id === qCat)) {
            setFormData(prev => ({ ...prev, category: qCat }));
          } else if (mapped.length > 0) {
            setFormData(prev => ({ ...prev, category: mapped[0].id }));
          }
        }
      } catch (e) {
        console.error("Failed to fetch concepts categories:", e);
      }
    };
    fetchCats();
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('이미지 크기는 5MB 이하여야 합니다.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
        if (error) setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('제목과 내용을 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    let finalContent = formData.content;
    if (isBetLogCategory && betLog.match && betLog.odds && betLog.stake) {
      const net = calculateNetProfit();
      const logTag = `[BETLOG:${JSON.stringify({
        match: betLog.match,
        odds: parseFloat(betLog.odds),
        stake: parseFloat(betLog.stake),
        result: betLog.result,
        net: net
      })}]`;
      finalContent = logTag + "\n" + finalContent;
    }

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          content: finalContent
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '글 저장 중 오류가 발생했습니다.');
      }

      router.push(`/concepts?cat=${formData.category}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mesh-gradient min-h-screen">
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-[hsl(var(--gold))]" /> 개념 탑재 글 작성
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">나의 베팅 경험과 전략을 기록하세요.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 animate-shake">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Category Picker - Only Concept Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {dynCategories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-2xl border transition-all relative overflow-hidden group",
                  formData.category === cat.id
                    ? "bg-primary/10 border-primary shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                    : "bg-white/5 border-white/5 hover:border-white/20"
                )}
              >
                <cat.icon className={cn(
                  "w-6 h-6 mb-2 transition-transform duration-500 group-hover:scale-110",
                  formData.category === cat.id ? "text-primary" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "text-xs font-black tracking-widest",
                  formData.category === cat.id ? "text-primary" : "text-muted-foreground"
                )}>{cat.label}</span>
                <span className="text-[9px] text-muted-foreground/50 mt-1">{cat.desc}</span>
                {formData.category === cat.id && (
                  <div className="absolute top-1.5 right-1.5">
                    <Check className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="glass-card rounded-3xl p-6 md:p-8 space-y-6 border-white/10">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Title</label>
              <input
                required
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="제목을 입력하세요"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-primary/50 focus:bg-white/10 transition-all text-lg font-bold placeholder:text-muted-foreground/30"
              />
            </div>

            {/* Interactive Bet Logger */}
            {isBetLogCategory && (
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">Interactive Bet Logger (베팅 결과 기록기)</span>
                  <span className="text-[10px] text-muted-foreground/60">본문 글 상단에 성과 카드로 자동 박제됩니다.</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1.5 col-span-1 md:col-span-2">
                    <label className="text-[10px] text-muted-foreground font-bold">대상 경기 / 베팅 팀</label>
                    <input
                      type="text"
                      placeholder="예: 레알 마드리드 승"
                      value={betLog.match}
                      onChange={(e) => setBetLog(prev => ({ ...prev, match: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 outline-none focus:border-primary/50 text-sm placeholder:text-muted-foreground/30 font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-muted-foreground font-bold">배당률 (Odds)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="1.95"
                      value={betLog.odds}
                      onChange={(e) => setBetLog(prev => ({ ...prev, odds: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 outline-none focus:border-primary/50 text-sm font-mono placeholder:text-muted-foreground/30 font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-muted-foreground font-bold">베팅 금액 (Stake)</label>
                    <input
                      type="number"
                      placeholder="100000"
                      value={betLog.stake}
                      onChange={(e) => setBetLog(prev => ({ ...prev, stake: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 outline-none focus:border-primary/50 text-sm font-mono placeholder:text-muted-foreground/30 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-muted-foreground font-bold">베팅 결과</label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: 'win', label: '적중' },
                        { id: 'lose', label: '미적중' },
                        { id: 'void', label: '적특/무효' },
                        { id: 'half-win', label: '절반 적중' },
                        { id: 'half-lose', label: '절반 미적중' }
                      ].map(resItem => (
                        <button
                          key={resItem.id}
                          type="button"
                          onClick={() => setBetLog(prev => ({ ...prev, result: resItem.id }))}
                          className={cn(
                            "px-3 py-1.5 rounded-lg border text-xs font-bold transition-all",
                            betLog.result === resItem.id
                              ? resItem.id === 'win' || resItem.id === 'half-win'
                                ? "bg-emerald-500 text-white border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                                : resItem.id === 'lose' || resItem.id === 'half-lose'
                                  ? "bg-red-500 text-white border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.3)]"
                                  : "bg-white text-black border-white"
                              : "bg-white/5 text-muted-foreground border-white/5 hover:bg-white/10"
                          )}
                        >
                          {resItem.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-3 pt-3 md:pt-0">
                    <div className="text-right">
                      <span className="text-[9px] text-muted-foreground uppercase tracking-widest block">Expected Net Profit</span>
                      <span className={cn(
                        "text-lg font-mono font-black",
                        calculateNetProfit() > 0 ? "text-emerald-400" : calculateNetProfit() < 0 ? "text-red-400" : "text-muted-foreground"
                      )}>
                        {calculateNetProfit() > 0 ? "+" : ""}{calculateNetProfit().toLocaleString()}원
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Content Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest">Content</label>
                <div className="flex gap-2">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 text-xs font-bold"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">이미지 첨부</span>
                  </button>
                </div>
              </div>
              
              {/* Templates */}
              <div className="flex flex-wrap gap-2 mb-3 ml-1">
                <span className="text-[10px] text-muted-foreground py-1">글쓰기 템플릿:</span>
                {TEMPLATES.map(tpl => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => {
                      if (formData.content && !confirm("현재 작성된 내용 아래에 템플릿을 추가하시겠습니까?")) return;
                      setFormData(prev => ({ 
                        ...prev, 
                        content: prev.content ? prev.content + "\n\n" + tpl.content : tpl.content 
                      }));
                    }}
                    className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-[10px] font-bold text-foreground flex items-center gap-1"
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
              
              {/* Image Preview */}
              {formData.image && (
                <div className="relative inline-block mb-3 animate-fade-in group">
                  <img 
                    src={formData.image} 
                    alt="첨부 이미지 미리보기" 
                    className="max-h-64 rounded-xl border border-white/10 object-contain bg-black/20"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500/80 text-white rounded-lg backdrop-blur-sm transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <textarea
                required
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="내용을 입력하세요 (팁: 베팅 분석 내용이나 경기 결과를 포함하면 좋습니다)"
                rows={12}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-primary/50 focus:bg-white/10 transition-all text-[15px] leading-relaxed resize-none placeholder:text-muted-foreground/30 font-medium"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Tags (Comma separated)</label>
              <div className="relative group">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="복기, ROI, 전략 (쉼표로 구분)"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-6 outline-none focus:border-primary/50 focus:bg-white/10 transition-all text-sm font-medium"
                />
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-[hsl(var(--gold))]/5 border border-[hsl(var(--gold))]/10 rounded-2xl p-4 flex gap-3">
            <Lightbulb className="w-5 h-5 text-[hsl(var(--gold))] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-[hsl(var(--gold))]">개념 탑재 안내</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                베팅 결과 기록기에 입력하신 정보는 글 상단에 시각적 카드로 자동 생성됩니다. <br />
                정확한 배당률과 금액을 입력해 주시면 통계 집계에 활용됩니다.
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-4 px-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all font-bold text-sm"
            >
              취소
            </button>
            <button
              disabled={isLoading}
              type="submit"
              className="flex-[2] btn-primary py-4 px-6 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  글 등록하기
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
