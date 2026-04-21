'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Lock, Mail, UserCircle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    email: '',
    referralCode: '',
    agreeTerms: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: formData.userId,
          password: formData.password,
          nickname: formData.nickname,
          email: formData.email,
          referralCode: formData.referralCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '회원가입 중 오류가 발생했습니다.');
      }
      
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 mesh-gradient">
        <div className="glass-card max-w-md w-full p-8 rounded-3xl text-center space-y-6 animate-fade-in-up">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-glow">회원가입 완료!</h1>
            <p className="text-muted-foreground">
              피나클 커뮤니티의 회원이 되신 것을 환영합니다.<br />
              이제 모든 서비스를 이용하실 수 있습니다.
            </p>
          </div>
          <Link 
            href="/login" 
            className="btn-primary w-full inline-flex items-center justify-center gap-2"
          >
            로그인하러 가기
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 mesh-gradient">
      <div className="glass-card max-w-lg w-full p-8 rounded-3xl space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-glow">
            CREATE ACCOUNT
          </h1>
          <p className="text-muted-foreground">
            피나클 커뮤니티의 프리미엄 서비스를 시작하세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 stagger-children">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-medium animate-fade-in flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
          {/* User ID */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-primary uppercase tracking-widest ml-1">
              User ID
            </label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                required
                type="text"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                placeholder="아이디를 입력하세요"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-medium"
              />
            </div>
          </div>

          {/* Nickname */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-primary uppercase tracking-widest ml-1">
              Nickname
            </label>
            <div className="relative group">
              <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                required
                type="text"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                placeholder="사용하실 닉네임을 입력하세요"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-medium"
              />
            </div>
          </div>

          {/* Password Group */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-primary uppercase tracking-widest ml-1">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  required
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="비밀번호"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-medium"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-primary uppercase tracking-widest ml-1">
                Confirm
              </label>
              <div className="relative group">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  required
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="비밀번호 확인"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-primary uppercase tracking-widest ml-1">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-medium"
              />
            </div>
          </div>

          {/* Referral Code */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-primary uppercase tracking-widest ml-1">
              Referral Code (Optional)
            </label>
            <input
              type="text"
              name="referralCode"
              value={formData.referralCode}
              onChange={handleChange}
              placeholder="추천인 코드가 있다면 입력하세요"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-medium"
            />
          </div>

          {/* Terms */}
          <label className="flex items-center gap-3 cursor-pointer group select-none">
            <div className="relative flex items-center justify-center">
              <input
                required
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="peer absolute opacity-0 cursor-pointer w-full h-full"
              />
              <div className="w-5 h-5 border-2 border-white/20 rounded peer-checked:border-primary peer-checked:bg-primary transition-all flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
            </div>
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              <span className="text-primary font-bold underline underline-offset-4">서비스 이용약관</span> 및{' '}
              <span className="text-primary font-bold underline underline-offset-4">개인정보 처리방침</span>에 동의합니다.
            </span>
          </label>

          {/* Submit Button */}
          <button
            disabled={isLoading || !formData.agreeTerms}
            type="submit"
            className={cn(
              "btn-primary w-full py-4 flex items-center justify-center gap-2 mt-4",
              (isLoading || !formData.agreeTerms) && "opacity-50 cursor-not-allowed transform-none"
            )}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                회원가입 완료
                <ArrowRight className="w-4 h-4 font-bold" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="text-primary font-bold hover:underline underline-offset-4">
            로그인하기
          </Link>
        </p>
      </div>
    </div>
  );
}
