"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Zap, Shield, Trophy, Heart, Award, ArrowUpRight, 
  HelpCircle, Clock, Check, AlertCircle, ShoppingBag, Gift
} from 'lucide-react';
import { cn } from '@/lib/utils';

const COLORS = [
  { id: 'gold', label: '골드 네온', class: 'text-amber-400 font-black shadow-[0_0_12px_rgba(251,191,36,0.3)]', value: 'text-amber-400' },
  { id: 'cyan', label: '사이언 블루', class: 'text-cyan-400 font-black shadow-[0_0_12px_rgba(34,211,238,0.3)]', value: 'text-cyan-400' },
  { id: 'pink', label: '핫 핑크', class: 'text-pink-500 font-black shadow-[0_0_12px_rgba(236,72,153,0.3)]', value: 'text-pink-500' },
  { id: 'green', label: '에메랄드 그린', class: 'text-emerald-400 font-black shadow-[0_0_12px_rgba(52,211,153,0.3)]', value: 'text-emerald-400' },
  { id: 'purple', label: '네온 퍼플', class: 'text-purple-400 font-black shadow-[0_0_12px_rgba(192,132,252,0.3)]', value: 'text-purple-400' },
];

export default function PointShopPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recharging, setRecharging] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('text-amber-400');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
      } else {
        // Not logged in -> redirect or show placeholder
        setProfile(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const showToast = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleRecharge = async () => {
    if (recharging) return;
    setRecharging(true);
    try {
      const res = await fetch('/api/user/recharge', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('success', data.message);
        fetchProfile();
        router.refresh();
      } else {
        showToast('error', data.error);
      }
    } catch (err) {
      showToast('error', '충전 요청 중 오류가 발생했습니다.');
    } finally {
      setRecharging(false);
    }
  };

  const handleBuyItem = async (itemType: string, colorValue?: string) => {
    if (purchasing) return;
    setPurchasing(itemType);
    try {
      const res = await fetch('/api/shop/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemType, colorValue })
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', data.message);
        fetchProfile();
        router.refresh();
      } else {
        showToast('error', data.error);
      }
    } catch (err) {
      showToast('error', '구매 요청 중 오류가 발생했습니다.');
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <div className="mesh-gradient min-h-screen flex flex-col items-center justify-center p-20 space-y-4">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground animate-pulse">상점 로딩 중...</p>
      </div>
    );
  }

  const userPoints = profile?.points || 0;
  const isEligibleForRecharge = userPoints < 1000;

  return (
    <div className="mesh-gradient min-h-screen pb-20">
      <div className="container mx-auto px-4 py-10 max-w-6xl">
        
        {/* Toast Notification */}
        {message && (
          <div className={cn(
            "fixed top-20 right-4 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-top-5 duration-300",
            message.type === 'success' 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
              : "bg-red-500/10 border-red-500/20 text-red-400"
          )}>
            {message.type === 'success' ? <Check className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <span className="text-sm font-bold">{message.text}</span>
          </div>
        )}

        {/* Header */}
        <div className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2 justify-center md:justify-start text-xs text-primary font-bold uppercase tracking-widest mb-1.5">
              <ShoppingBag className="w-4 h-4" />
              <span>Pinnacle Point Shop</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">포인트 상점</h1>
            <p className="text-sm text-muted-foreground mt-2 font-medium">활동하고 가상 배팅으로 모은 포인트를 유니크한 아이템과 특별 혜택으로 교환해보세요!</p>
          </div>

          {profile ? (
            <div className="glass-card rounded-[24px] px-6 py-4 border-white/[0.08] flex items-center gap-4 self-center md:self-auto shadow-2xl">
              <div className="bg-[hsl(var(--gold))]/10 p-3 rounded-2xl border border-[hsl(var(--gold))]/20">
                <Zap className="w-6 h-6 text-[hsl(var(--gold))] fill-current animate-pulse" />
              </div>
              <div className="text-left leading-tight">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">나의 보유 포인트</p>
                <p className="text-2xl font-black font-mono text-[hsl(var(--gold))]">{userPoints.toLocaleString()} <span className="text-xs font-bold text-muted-foreground/80">VP</span></p>
              </div>
            </div>
          ) : (
            <Link href="/login" className="btn-primary py-3 px-8 self-center md:self-auto text-sm font-bold flex items-center gap-2">
              로그인 후 상점 이용 가능
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Items Area */}
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-xl font-black tracking-tight flex items-center gap-2"><Trophy className="w-5 h-5 text-primary" /> 가상 배팅 보조 카드</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Item 1: Odds Booster */}
              <div className="glass-card rounded-[32px] p-6 border-white/[0.05] hover:border-primary/30 transition-all flex flex-col justify-between group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <ArrowUpRight className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-black group-hover:text-primary transition-colors">배당 부스터 (+10%)</h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    가상 배팅 슬립 작성 시 이 카드를 적용하면, 배팅이 적중했을 때 <strong>최종 당첨금의 10%를 보너스 포인트</strong>로 가산하여 지급합니다.
                  </p>
                </div>
                
                <div className="mt-8 pt-5 border-t border-white/[0.04] flex items-center justify-between">
                  <div className="font-mono">
                    <span className="text-lg font-black text-[hsl(var(--gold))]">2,000</span> <span className="text-[10px] text-muted-foreground font-bold">VP</span>
                  </div>
                  <button
                    disabled={!profile || userPoints < 2000 || purchasing === 'odds_booster'}
                    onClick={() => handleBuyItem('odds_booster')}
                    className="btn-primary px-5 py-2.5 text-xs font-bold rounded-xl disabled:opacity-40"
                  >
                    {purchasing === 'odds_booster' ? '구매 중...' : '아이템 구매'}
                  </button>
                </div>
              </div>

              {/* Item 2: Bet Insurance */}
              <div className="glass-card rounded-[32px] p-6 border-white/[0.05] hover:border-emerald-500/30 transition-all flex flex-col justify-between group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
                
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Shield className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-black group-hover:text-emerald-400 transition-colors">배팅 보험 카드 (50%)</h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    가상 배팅 시 이 카드를 사용하면, 배팅이 아쉽게 미적중하더라도 <strong>베팅 금액의 50%를 안전하게 포인트로 환급</strong>받을 수 있습니다.
                  </p>
                </div>
                
                <div className="mt-8 pt-5 border-t border-white/[0.04] flex items-center justify-between">
                  <div className="font-mono">
                    <span className="text-lg font-black text-[hsl(var(--gold))]">1,500</span> <span className="text-[10px] text-muted-foreground font-bold">VP</span>
                  </div>
                  <button
                    disabled={!profile || userPoints < 1500 || purchasing === 'bet_insurance'}
                    onClick={() => handleBuyItem('bet_insurance')}
                    className="btn-primary px-5 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/10 disabled:opacity-40"
                  >
                    {purchasing === 'bet_insurance' ? '구매 중...' : '아이템 구매'}
                  </button>
                </div>
              </div>

            </div>

            {/* Nickname Customization */}
            <div className="pt-4">
              <h2 className="text-xl font-black tracking-tight flex items-center gap-2 mb-6"><Award className="w-5 h-5 text-amber-400" /> 커뮤니티 전용 효과</h2>
              
              <div className="glass-card rounded-[32px] p-6 border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-3 max-w-md">
                  <span className="text-[9px] font-black tracking-widest text-primary uppercase bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">유니크 이펙트</span>
                  <h3 className="text-lg font-black">닉네임 네온 컬러 변경</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    커뮤니티(자유게시판, 댓글) 및 헤더 영역에서 회원님의 닉네임을 아름다운 네온 불빛 스타일로 강조합니다. (적용 시 30일 동안 유지됩니다.)
                  </p>
                  
                  {/* Color Selector */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {COLORS.map(color => (
                      <button
                        key={color.id}
                        onClick={() => setSelectedColor(color.value)}
                        className={cn(
                          "px-3 py-2 rounded-xl border text-xs font-black transition-all",
                          selectedColor === color.value 
                            ? "bg-white/10 border-primary shadow-lg" 
                            : "bg-white/5 border-white/[0.06] hover:bg-white/10 opacity-70"
                        )}
                      >
                        <span className={color.class}>{color.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-center md:items-end justify-center shrink-0 w-full md:w-auto p-6 bg-black/40 rounded-2xl border border-white/5 md:min-w-[200px]">
                  <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-wider mb-1">프리뷰</p>
                  <div className="h-10 flex items-center justify-center px-4 bg-white/5 rounded-xl border border-white/5 mb-4">
                    <span className={COLORS.find(c => c.value === selectedColor)?.class}>{profile?.nickname || '닉네임 예시'}</span>
                  </div>
                  <div className="font-mono text-center md:text-right mb-4">
                    <span className="text-xl font-black text-[hsl(var(--gold))]">5,000</span> <span className="text-[10px] text-muted-foreground font-bold">VP</span>
                  </div>
                  <button
                    disabled={!profile || userPoints < 5000 || purchasing === 'color_tag'}
                    onClick={() => handleBuyItem('color_tag', selectedColor)}
                    className="w-full btn-primary py-2.5 px-6 text-xs font-bold rounded-xl disabled:opacity-40"
                  >
                    {purchasing === 'color_tag' ? '적용 중...' : '구매 및 즉시 적용'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Area: Point Recharge & Guides */}
          <div className="space-y-8">
            
            {/* Daily Recharge Widget */}
            <div className="glass-card rounded-[32px] p-6 border-white/[0.05] relative overflow-hidden flex flex-col justify-between shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[hsl(var(--gold))]/5 rounded-full blur-3xl" />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-base flex items-center gap-2"><Zap className="w-5 h-5 text-[hsl(var(--gold))] fill-current" /> 무료 포인트 충전</h3>
                  <span className="text-[9px] font-black bg-[hsl(var(--gold))]/10 border border-[hsl(var(--gold))]/20 text-[hsl(var(--gold))] px-2 py-0.5 rounded uppercase">일 1회 가능</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  포인트를 전부 소진하셨나요? 보유하고 계신 포인트가 <strong>1,000 VP 미만</strong>일 때, 하루에 한 번 무료로 <strong>5,000 VP</strong>를 지급받으실 수 있습니다.
                </p>
                
                <div className="bg-black/30 p-4 rounded-2xl border border-white/5 text-[11px] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">나의 포인트</span>
                    <span className="font-bold">{userPoints.toLocaleString()} VP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">충전 금액</span>
                    <span className="font-bold text-primary">+5,000 VP</span>
                  </div>
                  <div className="h-px bg-white/5 my-2" />
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold">충전 후 포인트</span>
                    <span className="font-black text-[hsl(var(--gold))]">{(userPoints + (isEligibleForRecharge ? 5000 : 0)).toLocaleString()} VP</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  disabled={!profile || !isEligibleForRecharge || recharging}
                  onClick={handleRecharge}
                  className={cn(
                    "w-full py-3 text-xs font-bold rounded-2xl shadow-lg transition-all",
                    isEligibleForRecharge 
                      ? "bg-gradient-to-r from-[hsl(var(--gold))] to-amber-500 text-black shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98]" 
                      : "bg-white/5 border border-white/10 text-muted-foreground/40 cursor-not-allowed"
                  )}
                >
                  {recharging ? '충전 요청 중...' : isEligibleForRecharge ? '5,000 VP 충전하기' : '포인트 1,000 미만 시 충전 가능'}
                </button>
              </div>
            </div>

            {/* Guides / Raffle Info */}
            <div className="glass-card rounded-[32px] p-6 border-white/[0.05] space-y-4">
              <h4 className="font-black text-sm flex items-center gap-2 text-rose-400"><Gift className="w-4.5 h-4.5" /> 포인트 획득 가이드</h4>
              <div className="space-y-3 text-[11px] leading-relaxed text-muted-foreground">
                <div className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <p><strong>가상 배팅 적중</strong>: 실시간 경기에 가상 배팅하여 적중하면 배당률에 비례한 당첨 포인트를 획득합니다.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <p><strong>일일 출석 체크</strong>: 출석체크 보드로 이동하여 매일 <strong>100 VP</strong>를 무료로 획득할 수 있습니다.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <p><strong>커뮤니티 활동</strong>: 분석 글 작성 시 <strong>50 VP</strong>, 댓글 작성 시 <strong>10 VP</strong>, 그리고 추천을 받으면 <strong>20 VP</strong>가 추가로 지급됩니다.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <p><strong>프리미엄 픽 판매</strong>: 경기 예상 분석 글을 유료 픽으로 잠금 설정하여 판매할 시, 구매액의 <strong>70%</strong>가 닉네임 지갑으로 자동 적립됩니다.</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
