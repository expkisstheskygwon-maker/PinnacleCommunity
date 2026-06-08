'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  PenLine, X, Check, ChevronLeft, Hash, 
  Info, Loader2, AlertTriangle, Image as ImageIcon, Send,
  BarChart3, Trophy, Star, MessageSquare, Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CONCEPT_CATEGORIES = [
  { id: "experiments", label: "기상천외 베팅 실험실", icon: BarChart3, desc: "나만의 엉뚱한 베팅 실험 연재" },
  { id: "fails", label: "멘붕 & 유쾌한 실패담", icon: AlertTriangle, desc: "낙첨 실수담 공유와 위로" },
  { id: "gamification", label: "룰렛 & 리더보드", icon: Trophy, desc: "실시간 랭킹과 룰렛 휠" },
  { id: "flex", label: "슬롯/미니게임 자랑", icon: Star, desc: "화려한 잭팟 이미지 갤러리" },
  { id: "sentiment", label: "실시간 찐팬 응원방", icon: MessageSquare, desc: "감성 이모지 기반 실시간 피드" },
];

const TEMPLATES = [
  {
    id: "experiment_temp",
    label: "🧪 베팅 실험 템플릿",
    content: `[실험 정보 및 진행 상황]\n\n1. 이번 회차 베팅 내역:\n- \n\n2. 이번 회차 수익률:\n- \n\n3. 실험 진행 총평:\n- (예: 무지성 마틴게일은 결국 파멸로 이어지는 중입니다.)\n`
  },
  {
    id: "fail_temp",
    label: "😭 멘붕 낙첨 템플릿",
    content: `[멘탈 붕괴 사연]\n\n1. 경기 정보 및 베팅 폴더:\n- \n\n2. 낙첨 원흉 (부러진 1경기):\n- (예: 93분 극장골 먹혀서 무승부 엔딩...)\n\n3. 현재 심정:\n- (예: 마누라 몰래 한 건데 한 달 동안 라면만 먹게 생겼습니다.)\n`
  }
];

export default function ConceptsWritePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    category: 'experiments',
    content: '',
    tags: '',
    image: '',
  });

  // Category-specific fields
  const [expData, setExpData] = useState({
    hypothesis: '',
    target: '',
    totalRounds: 10,
    currentRound: 1,
    roi: 0
  });

  const [selectedSentiment, setSelectedSentiment] = useState('🔥');

  const searchParams = useSearchParams();

  useEffect(() => {
    const qCat = searchParams.get('category');
    if (qCat && CONCEPT_CATEGORIES.find(c => c.id === qCat)) {
      setFormData(prev => ({ ...prev, category: qCat }));
    }
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
    if (!formData.title.trim() && formData.category !== 'sentiment') {
      setError('제목을 입력해주세요.');
      return;
    }
    if (!formData.content.trim()) {
      setError('내용을 입력해주세요.');
      return;
    }

    if (formData.category === 'flex' && !formData.image) {
      setError('슬롯/미니게임 자랑 라운지는 스크린샷 이미지 첨부가 필수입니다.');
      return;
    }

    if (formData.category === 'sentiment' && formData.content.length > 100) {
      setError('실시간 응원방 글은 100자 이하로 작성해야 합니다.');
      return;
    }

    setIsLoading(true);
    setError('');

    // Prepare payload
    const payload: any = {
      title: formData.category === 'sentiment' ? `응원 피드: ${formData.content.substring(0, 15)}...` : formData.title,
      content: formData.content,
      category: formData.category,
      tags: formData.tags,
      image: formData.image,
    };

    if (formData.category === 'experiments') {
      payload.experiment_meta = JSON.stringify(expData);
    }

    if (formData.category === 'sentiment') {
      payload.sentiment = selectedSentiment;
    }

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
              type="button"
              onClick={() => router.back()}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-[hsl(var(--gold))]" /> 개념 탑재 업그레이드 글 작성
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">새롭게 신설된 가볍고 재밌는 카테고리에 글을 작성해보세요.</p>
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

          {/* Category Picker */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
            {CONCEPT_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                className={cn(
                  "flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all relative overflow-hidden group text-center",
                  formData.category === cat.id
                    ? "bg-primary/10 border-primary shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                    : "bg-white/5 border-white/5 hover:border-white/20"
                )}
              >
                <cat.icon className={cn(
                  "w-5 h-5 mb-1.5 transition-transform duration-500 group-hover:scale-110",
                  formData.category === cat.id ? "text-primary" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "text-[10px] font-black tracking-tight leading-tight",
                  formData.category === cat.id ? "text-primary" : "text-muted-foreground"
                )}>{cat.label}</span>
                {formData.category === cat.id && (
                  <div className="absolute top-1 right-1">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="glass-card rounded-3xl p-6 md:p-8 space-y-6 border-white/10">
            {/* Category-Specific Form Fields */}

            {/* Title - Hidden for Sentiment 응원방 */}
            {formData.category !== 'sentiment' && (
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
            )}

            {/* 1. Betting Lab Experiments Specific Meta Form */}
            {formData.category === 'experiments' && (
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">🧪 실험 메타데이터 설정</span>
                  <span className="text-[10px] text-muted-foreground/60">글 상단에 연재 현황으로 표시됩니다.</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-muted-foreground font-bold">실험 가설 (Hypothesis)</label>
                    <input
                      type="text"
                      required
                      placeholder="예: 10경기 연속 홈팀 무승부 베팅 시 수익률"
                      value={expData.hypothesis}
                      onChange={(e) => setExpData(prev => ({ ...prev, hypothesis: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 outline-none focus:border-primary/50 text-sm font-bold placeholder:text-muted-foreground/30"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-muted-foreground font-bold">실험 대상 리그/팀 (Target)</label>
                    <input
                      type="text"
                      required
                      placeholder="예: K리그 무승부"
                      value={expData.target}
                      onChange={(e) => setExpData(prev => ({ ...prev, target: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 outline-none focus:border-primary/50 text-sm font-bold placeholder:text-muted-foreground/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-muted-foreground font-bold">목표 회차 (Total Rounds)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={expData.totalRounds}
                      onChange={(e) => setExpData(prev => ({ ...prev, totalRounds: parseInt(e.target.value) || 10 }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 outline-none focus:border-primary/50 text-sm font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-muted-foreground font-bold">현재 진행 회차 (Current Round)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={expData.currentRound}
                      onChange={(e) => setExpData(prev => ({ ...prev, currentRound: parseInt(e.target.value) || 1 }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 outline-none focus:border-primary/50 text-sm font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-muted-foreground font-bold">누적 수익률 (Cumulative ROI, %)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={expData.roi}
                      onChange={(e) => setExpData(prev => ({ ...prev, roi: parseFloat(e.target.value) || 0 }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 outline-none focus:border-primary/50 text-sm font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. Sentiment Live Feed Specific emoji picker */}
            {formData.category === 'sentiment' && (
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">😀 실시간 나의 감성 선택</span>
                  <span className="text-[10px] text-muted-foreground/60">피드 상단 응원 분석계에 실시간 반영됩니다.</span>
                </div>
                
                <div className="flex gap-4 items-center justify-center py-2">
                  {[
                    { emoji: '🔥', label: '환희/열정' },
                    { emoji: '😭', label: '눈물/절망' },
                    { emoji: '🎉', label: '축하/기쁨' },
                    { emoji: '🤬', label: '분노/폭발' }
                  ].map(item => (
                    <button
                      key={item.emoji}
                      type="button"
                      onClick={() => setSelectedSentiment(item.emoji)}
                      className={cn(
                        "w-16 h-16 rounded-2xl border text-2xl flex flex-col items-center justify-center transition-all",
                        selectedSentiment === item.emoji
                          ? "bg-primary/20 border-primary scale-110 shadow-lg"
                          : "bg-white/5 border-white/5 hover:scale-105"
                      )}
                    >
                      <span>{item.emoji}</span>
                      <span className="text-[8px] mt-1 text-muted-foreground font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Content Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest">
                  {formData.category === 'sentiment' ? 'Short Post (max 100 chars)' : 'Content'}
                </label>
                <div className="flex gap-2">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  {/* Image upload highlighted for Casino Flex */}
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "p-1.5 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-1.5 text-xs font-bold",
                      formData.category === 'flex' ? "text-emerald-400 border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 px-2.5" : "text-muted-foreground hover:text-primary"
                    )}
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>이미지 첨부 {formData.category === 'flex' && '(필수)'}</span>
                  </button>
                </div>
              </div>
              
              {/* Templates (Only shown when templates exist and category is not sentiment) */}
              {formData.category !== 'sentiment' && (
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
              )}
              
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
                maxLength={formData.category === 'sentiment' ? 100 : undefined}
                placeholder={
                  formData.category === 'sentiment' 
                    ? "오늘 경기에 대한 화끈한 감정 한마디! (최대 100자 작성 가능)" 
                    : formData.category === 'flex'
                      ? "잭팟을 기록한 화려한 당첨 배율이나 후기를 자유롭게 적어주세요. 이미지 첨부 필수!"
                      : "내용을 입력하세요..."
                }
                rows={formData.category === 'sentiment' ? 4 : 12}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-primary/50 focus:bg-white/10 transition-all text-[15px] leading-relaxed resize-none placeholder:text-muted-foreground/30 font-medium"
              />
              
              {/* Sentiment Character Counter */}
              {formData.category === 'sentiment' && (
                <div className="flex justify-end text-[10px] text-muted-foreground mr-1">
                  <span>{formData.content.length} / 100 자</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {formData.category !== 'sentiment' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Tags (Comma separated)</label>
                <div className="relative group">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="베팅실험, 낙첨, 잭팟 (쉼표로 구분)"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-6 outline-none focus:border-primary/50 focus:bg-white/10 transition-all text-sm font-medium"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Info Card */}
          <div className="bg-[hsl(var(--gold))]/5 border border-[hsl(var(--gold))]/10 rounded-2xl p-4 flex gap-3">
            <Lightbulb className="w-5 h-5 text-[hsl(var(--gold))] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-[hsl(var(--gold))]">
                {formData.category === 'fails' ? 'Comfort Point 안내' : '개념 탑재 엔터테인먼트 라운지'}
              </p>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                {formData.category === 'fails' 
                  ? "낙첨 실수담에 많은 회원들이 추천(위로)을 주어 5개 이상 달성되면 보상으로 작성자에게 +100 VP가 지급됩니다." 
                  : "올바르고 활발한 커뮤니티 문화를 지켜주세요. 커뮤니티 활동점수(+20)와 포인트(+50 VP)가 기본 적립됩니다."}
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
