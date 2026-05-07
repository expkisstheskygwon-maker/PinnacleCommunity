'use client';

import React, { useState, useRef } from 'react';
import { 
  Settings, Award, FileText, MessageSquare, Star, Heart, Trophy, 
  Camera, X, Check, Loader2, User as UserIcon, LogOut 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface ProfileSectionProps {
  user: any;
  profile: any;
}

export default function ProfileSection({ user, profile }: ProfileSectionProps) {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    nickname: user.nickname,
    email: user.email,
    password: '',
    confirmPassword: '',
    avatar: user.avatar || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('이미지 크기는 2MB 이하여야 합니다.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: formData.nickname,
          email: formData.email,
          password: formData.password,
          avatar: formData.avatar,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '업데이트 중 오류가 발생했습니다.');
      }

      setSuccess('프로필이 성공적으로 업데이트되었습니다.');
      setTimeout(() => {
        setIsEditModalOpen(false);
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Profile Card */}
      <div className="glass-card rounded-2xl p-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-primary/15 to-transparent" />
        <div className="relative z-10">
          <div className="relative w-24 h-24 mx-auto mb-4 group">
            {formData.avatar ? (
              <img 
                src={formData.avatar} 
                alt={formData.nickname} 
                className="w-full h-full rounded-2xl object-cover border-2 border-primary/20"
              />
            ) : (
              <div className="w-full h-full rounded-2xl bg-primary/20 flex items-center justify-center text-4xl font-black text-primary border-2 border-primary/20">
                {formData.nickname[0]}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-background border border-white/10 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-[10px] font-black text-primary">Lv.{profile.level}</span>
            </div>
          </div>
          
          <h2 className="text-2xl font-black text-glow">{formData.nickname}</h2>
          <div className="flex items-center justify-center gap-2 mt-1.5">
            <span className="badge-primary text-[10px] py-0.5 px-2">
              <Award className="w-3 h-3" /> {profile.badge}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 opacity-60">가입일: {profile.joined}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          {[
            { label: "게시글", value: profile.postCount, icon: FileText, color: "text-primary" },
            { label: "댓글", value: profile.commentCount, icon: MessageSquare, color: "text-emerald-400" },
            { label: "스포트라이트", value: profile.reviewCount, icon: Star, color: "text-[hsl(var(--gold))]" },
            { label: "받은 추천", value: profile.likeReceived, icon: Heart, color: "text-red-400" },
          ].map(stat => (
            <div key={stat.label} className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.04] hover:bg-white/[0.05] transition-colors group cursor-default">
              <stat.icon className={cn("w-4 h-4 mx-auto mb-1 opacity-70 group-hover:opacity-100 transition-opacity", stat.color)} />
              <p className={cn("text-lg font-black", stat.color)}>{stat.value}</p>
              <p className="text-[9px] text-muted-foreground font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Activity Score */}
        <div className="mt-6 bg-gradient-to-br from-primary/10 via-transparent to-transparent rounded-xl p-4 border border-primary/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5 text-[hsl(var(--gold))]" /> 활동 점수</span>
            <span className="text-base font-black text-primary">{profile.score.toLocaleString()}</span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-primary/40 rounded-full" style={{ width: "62%" }} />
          </div>
          <div className="flex justify-between mt-1.5 text-[9px] text-muted-foreground/60 font-medium">
            <span>다음 레벨까지 150점</span>
            <span>Lv.16</span>
          </div>
        </div>

        <button 
          onClick={() => setIsEditModalOpen(true)}
          className="mt-5 w-full btn-outline text-xs py-3 flex items-center justify-center gap-2 rounded-xl group"
        >
          <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" /> 
          프로필 설정
        </button>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-lg rounded-3xl overflow-hidden animate-scale-in border-white/10 shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">프로필 설정</h3>
                  <p className="text-[10px] text-muted-foreground">개인정보 및 아바타를 수정할 수 있습니다.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-primary/30 bg-primary/5 transition-all group-hover:border-primary/60">
                    {formData.avatar ? (
                      <img 
                        src={formData.avatar} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary/40">
                        <UserIcon className="w-10 h-10" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">이미지 형식: JPG, PNG (최대 2MB)</p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-xs font-medium flex items-center gap-2">
                  <X className="w-4 h-4" /> {error}
                </div>
              )}

              {success && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl text-xs font-medium flex items-center gap-2">
                  <Check className="w-4 h-4" /> {success}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nickname */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-primary uppercase tracking-widest ml-1">Nickname</label>
                  <input
                    required
                    type="text"
                    name="nickname"
                    value={formData.nickname}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 outline-none focus:border-primary/50 transition-all text-sm font-medium"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-primary uppercase tracking-widest ml-1">Email</label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 outline-none focus:border-primary/50 transition-all text-sm font-medium"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-primary uppercase tracking-widest ml-1">New Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="변경시에만 입력"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 outline-none focus:border-primary/50 transition-all text-sm font-medium"
                  />
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-primary uppercase tracking-widest ml-1">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="비밀번호 확인"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 outline-none focus:border-primary/50 transition-all text-sm font-medium"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-sm font-bold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-[2] btn-primary py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-bold disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> 저장하기</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
