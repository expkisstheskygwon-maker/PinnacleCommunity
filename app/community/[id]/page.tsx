'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ChevronLeft, Clock, Eye, ThumbsUp, MessageSquare, 
  Share2, AlertTriangle, Loader2, User as UserIcon,
  Award, Hash, Heart, MoreVertical, Flag
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${params.id}`);
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error);
        }
        
        setPost(data.post);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchPost();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="mesh-gradient min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="mesh-gradient min-h-screen flex flex-col items-center justify-center p-4">
        <div className="glass-card p-10 rounded-3xl text-center space-y-4 max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold">오류가 발생했습니다</h2>
          <p className="text-muted-foreground">{error || '게시글을 찾을 수 없습니다.'}</p>
          <button onClick={() => router.back()} className="btn-primary w-full py-3">뒤로 가기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mesh-gradient min-h-screen">
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            목록으로 돌아가기
          </button>
          <div className="flex items-center gap-2">
            <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
              <Share2 className="w-4 h-4 text-muted-foreground" />
            </button>
            <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
              <Flag className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <article className="lg:col-span-8 space-y-6">
            <div className="glass-card rounded-3xl overflow-hidden border-white/10">
              {/* Post Header */}
              <div className="p-6 md:p-8 border-b border-white/5 bg-white/[0.01]">
                <div className="flex items-center gap-2 mb-4">
                  <span className="badge-primary text-[10px] uppercase font-black px-2.5 py-1">
                    {post.category}
                  </span>
                  <div className="h-4 w-px bg-white/10 mx-1" />
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {new Date(post.createdAt).toLocaleString()}
                  </span>
                </div>
                
                <h1 className="text-2xl md:text-4xl font-black tracking-tight leading-tight mb-6">
                  {post.title}
                </h1>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/20">
                      {post.authorAvatar ? (
                        <img src={post.authorAvatar} className="w-full h-full object-cover" alt={post.author} />
                      ) : (
                        <span className="text-lg font-bold text-primary">{post.author[0]}</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold">{post.author}</span>
                        <span className="badge-primary text-[8px] py-0.5 px-1.5"><Award className="w-2.5 h-2.5" /> Lv.{post.authorLevel || 1}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground opacity-60">작성한 글 보기</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4 opacity-50" />
                      <span className="text-xs font-bold">{post.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ThumbsUp className="w-4 h-4 opacity-50" />
                      <span className="text-xs font-bold">{post.likes}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Post Body */}
              <div className="p-6 md:p-8 space-y-8">
                {post.image && (
                  <div className="rounded-2xl overflow-hidden border border-white/5 bg-black/20">
                    <img src={post.image} className="w-full h-auto object-contain max-h-[600px] mx-auto" alt="Attached Image" />
                  </div>
                )}
                
                <div className="text-base md:text-lg leading-relaxed whitespace-pre-wrap font-medium opacity-90">
                  {post.content}
                </div>

                {/* Tags */}
                {post.tags && (
                  <div className="flex flex-wrap gap-2 pt-6 border-t border-white/5">
                    {post.tags.split(',').map((tag: string) => (
                      <span key={tag} className="text-xs bg-white/5 text-muted-foreground px-3 py-1.5 rounded-full hover:text-primary hover:bg-primary/10 transition-all cursor-pointer">
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div className="p-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-center gap-4">
                <button className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-primary/10 hover:bg-primary/20 text-primary transition-all border border-primary/20 group">
                  <ThumbsUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-bold">추천 {post.likes}</span>
                </button>
                <button className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-muted-foreground transition-all border border-white/10 group">
                  <Heart className="w-5 h-5 group-hover:scale-110 transition-transform text-red-500" />
                  <span className="font-bold">관심글</span>
                </button>
              </div>
            </div>

            {/* Comments Placeholder */}
            <div className="glass-card rounded-3xl p-6 md:p-8 space-y-6 border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold">댓글 <span className="text-primary">0</span></h3>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5">
                <p className="text-sm text-muted-foreground">댓글 기능은 곧 업데이트 예정입니다.</p>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="glass-card rounded-3xl p-6 bg-gradient-to-br from-primary/10 to-transparent border-white/10">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-[hsl(var(--gold))]" /> 작성자 정보
              </h3>
              <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-2xl bg-primary/20 mx-auto border-2 border-primary/20 flex items-center justify-center text-3xl font-black text-primary">
                  {post.authorAvatar ? <img src={post.authorAvatar} className="w-full h-full object-cover rounded-2xl" /> : post.author[0]}
                </div>
                <div>
                  <h4 className="text-lg font-bold">{post.author}</h4>
                  <p className="text-xs text-muted-foreground">활동 점수: 1,240점</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                    <p className="text-[10px] text-muted-foreground">게시글</p>
                    <p className="font-bold">24</p>
                  </div>
                  <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                    <p className="text-[10px] text-muted-foreground">댓글</p>
                    <p className="font-bold">156</p>
                  </div>
                </div>
                <button className="w-full btn-outline py-2.5 text-xs">팔로우 하기</button>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-6 border-white/10">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" /> 오늘의 추천 픽
              </h3>
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                    <p className="text-[10px] text-primary font-bold mb-1 uppercase tracking-widest">EPL</p>
                    <h5 className="text-xs font-bold truncate group-hover:text-primary transition-colors">아스널 vs 첼시 분석</h5>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
