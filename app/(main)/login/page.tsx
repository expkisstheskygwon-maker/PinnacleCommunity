'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Lock, ArrowRight, LogIn, Github, Chrome, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    rememberMe: false,
  });

  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: formData.userId,
          password: formData.password,
        }),
      });

      const data = (await response.json()) as any;

      if (!response.ok) {
        throw new Error(data.error || '로그인 중 오류가 발생했습니다.');
      }
      
      // Success! Refresh or redirect
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 mesh-gradient">
      <div className="glass-card max-w-md w-full p-8 rounded-3xl space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20 animate-float">
            <LogIn className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-glow">
            WELCOME BACK
          </h1>
          <p className="text-muted-foreground">
            피나클 커뮤니티에 다시 오신 것을 환영합니다
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

          {/* Password */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-bold text-primary uppercase tracking-widest">
                Password
              </label>
              <Link href="/forgot-password" hidden className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider">
                Forgot?
              </Link>
            </div>
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

          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-2 cursor-pointer group select-none">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="hidden peer"
              />
              <div className="w-4 h-4 border-2 border-white/20 rounded peer-checked:border-primary peer-checked:bg-primary transition-all flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
              <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-wider">Remember Me</span>
            </label>
            <Link href="/find-account" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider">
              계정 찾기
            </Link>
          </div>

          {/* Submit Button */}
          <button
            disabled={isLoading}
            type="submit"
            className={cn(
              "btn-primary w-full py-4 flex items-center justify-center gap-2 mt-4",
              isLoading && "opacity-50 cursor-not-allowed transform-none"
            )}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                로그인
                <ArrowRight className="w-4 h-4 font-bold" />
              </>
            )}
          </button>
        </form>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-secondary/20 px-2 text-muted-foreground backdrop-blur-sm">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 stagger-children">
          <button className="btn-outline flex items-center justify-center gap-2 py-3">
            <Chrome className="w-4 h-4" />
            Google
          </button>
          <button className="btn-outline flex items-center justify-center gap-2 py-3">
            <Github className="w-4 h-4" />
            GitHub
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          아직 계정이 없으신가요?{' '}
          <Link href="/register" className="text-primary font-bold hover:underline underline-offset-4 transition-all">
            회원가입하기
          </Link>
        </p>
      </div>
    </div>
  );
}
