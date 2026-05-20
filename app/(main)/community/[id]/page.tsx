'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ChevronLeft, Clock, Eye, ThumbsUp, MessageSquare, 
  Share2, AlertTriangle, Loader2, User as UserIcon,
  Award, Hash, Heart, MoreVertical, Flag, Target, Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

const parseBetLog = (content: string) => {
  if (!content) return { cleanContent: '', betData: null };
  
  const match = content.match(/\[BETLOG:(\{.*?\})\]/);
  if (match) {
    try {
      const betData = JSON.parse(match[1]);
      const cleanContent = content.replace(match[0], '').trim();
      return { cleanContent, betData };
    } catch (err) {
      console.error("Failed to parse bet log", err);
    }
  }
  return { cleanContent: content, betData: null };
};

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [commentContent, setCommentContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);
  
  const { cleanContent, betData } = parseBetLog(post?.content || '');

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

    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/posts/${params.id}/comments`);
        const data = await response.json();
        if (data.success) {
          setComments(data.comments);
        }
      } catch (err) {
        console.error("Failed to fetch comments", err);
      }
    };

    if (params.id) {
      fetchPost();
      fetchComments();
    }
  }, [params.id]);

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      const res = await fetch(`/api/posts/${params.id}/like`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setPost((prev: any) => ({
          ...prev,
          likes: data.liked ? prev.likes + 1 : prev.likes - 1,
          isLiked: data.liked
        }));
        if (data.liked) {
          setSubmitMessage('게시글을 추천했습니다! 작성자에게 10포인트가 전달됩니다.');
          setTimeout(() => setSubmitMessage(''), 3000);
        }
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('추천 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLiking(false);
    }
  };

  const handleFavorite = async () => {
    if (isFavoriting) return;
    setIsFavoriting(true);
    try {
      const res = await fetch(`/api/posts/${params.id}/favorite`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setPost((prev: any) => ({
          ...prev,
          isFavorited: data.favorited
        }));
        setSubmitMessage(data.favorited ? '관심글로 등록되었습니다.' : '관심글에서 해제되었습니다.');
        setTimeout(() => setSubmitMessage(''), 3000);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('관심글 처리 중 오류가 발생했습니다.');
    } finally {
      setIsFavoriting(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch(`/api/posts/${params.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentContent })
      });

      const data = await response.json();

      if (data.success) {
        setCommentContent('');
        setSubmitMessage('댓글 작성 완료! +5포인트 적립');
        
        // Refresh comments
        const res = await fetch(`/api/posts/${params.id}/comments`);
        const refreshData = await res.json();
        if (refreshData.success) setComments(refreshData.comments);

        // Hide message after 3s
        setTimeout(() => setSubmitMessage(''), 3000);
      } else {
        alert(data.error || '댓글 등록에 실패했습니다.');
      }
    } catch (err) {
      console.error('Comment submission error:', err);
      alert('서버 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
                
                {post.authorId === 0 ? (
                  <h1 className="text-2xl md:text-4xl font-black tracking-tight leading-tight mb-6" dangerouslySetInnerHTML={{ __html: post.title }} />
                ) : (
                  <h1 className="text-2xl md:text-4xl font-black tracking-tight leading-tight mb-6">
                    {post.title}
                  </h1>
                )}

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
 
                {/* Bet Summary Card (Parsed from [BETLOG:...]) */}
                {betData && (
                  <div className={cn(
                    "relative overflow-hidden border rounded-3xl p-6 md:p-8 transition-all duration-500",
                    (betData.result === 'win' || betData.result === 'half-win')
                      ? "bg-emerald-500/5 border-emerald-500/30 shadow-[0_0_24px_rgba(16,185,129,0.08)]"
                      : (betData.result === 'lose' || betData.result === 'half-lose')
                        ? "bg-red-500/5 border-red-500/30 shadow-[0_0_24px_rgba(239,68,68,0.08)]"
                        : "bg-white/[0.02] border-white/10"
                  )}>
                    {/* Glowing Accent */}
                    <div className={cn(
                      "absolute -right-20 -top-20 w-40 h-40 rounded-full blur-[60px] pointer-events-none",
                      (betData.result === 'win' || betData.result === 'half-win') ? "bg-emerald-500/10" : (betData.result === 'lose' || betData.result === 'half-lose') ? "bg-red-500/10" : "bg-white/5"
                    )} />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                      {/* Left: Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md",
                            (betData.result === 'win' || betData.result === 'half-win')
                              ? "bg-emerald-500/15 text-emerald-400"
                              : (betData.result === 'lose' || betData.result === 'half-lose')
                                ? "bg-red-500/15 text-red-400"
                                : "bg-white/10 text-muted-foreground"
                          )}>
                            {
                              betData.result === 'win' ? 'WIN (적중)' :
                              betData.result === 'lose' ? 'LOSE (미적중)' :
                              betData.result === 'half-win' ? 'HALF-WIN (절반 적중)' :
                              betData.result === 'half-lose' ? 'HALF-LOSE (절반 미적중)' : 'VOID (적특/무효)'
                            }
                          </span>
                          <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Verified Bet Record</span>
                        </div>
                        <h3 className="text-xl md:text-2xl font-black tracking-tight">{betData.match}</h3>
                      </div>

                      {/* Right: Stats Grid */}
                      <div className="flex flex-wrap items-center gap-6 md:gap-10">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-widest mb-1">Odds</span>
                          <span className="text-lg font-mono font-black text-[hsl(var(--gold))]">{betData.odds.toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-widest mb-1">Stake</span>
                          <span className="text-lg font-mono font-black text-foreground">{betData.stake.toLocaleString()}원</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-widest mb-1">Net Profit</span>
                          <span className={cn(
                            "text-xl font-mono font-black",
                            betData.net > 0 ? "text-emerald-400" : betData.net < 0 ? "text-red-400" : "text-muted-foreground"
                          )}>
                            {betData.net > 0 ? "+" : ""}{betData.net.toLocaleString()}원
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="text-base md:text-lg leading-relaxed whitespace-pre-wrap font-medium opacity-90">
                  {cleanContent}
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
                <button 
                  onClick={handleLike}
                  disabled={isLiking}
                  className={cn(
                    "flex items-center gap-2 px-8 py-3 rounded-2xl transition-all border group",
                    post.isLiked 
                      ? "bg-primary text-white border-primary shadow-[0_0_20px_rgba(59,130,246,0.3)]" 
                      : "bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                  )}
                >
                  <ThumbsUp className={cn("w-5 h-5 transition-transform", post.isLiked ? "scale-110" : "group-hover:scale-110")} />
                  <span className="font-bold">{post.isLiked ? '추천함' : '추천'} {post.likes}</span>
                </button>
                <button 
                  onClick={handleFavorite}
                  disabled={isFavoriting}
                  className={cn(
                    "flex items-center gap-2 px-8 py-3 rounded-2xl transition-all border group",
                    post.isFavorited
                      ? "bg-red-500 text-white border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                      : "bg-white/5 hover:bg-white/10 text-muted-foreground border-white/10"
                  )}
                >
                  <Heart className={cn("w-5 h-5 transition-transform", post.isFavorited ? "scale-110 fill-current" : "group-hover:scale-110 text-red-500")} />
                  <span className="font-bold">{post.isFavorited ? '관심글 해제' : '관심글'}</span>
                </button>
              </div>
            </div>

            {/* Comments Section */}
            <div className="glass-card rounded-3xl p-6 md:p-8 space-y-6 border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold">댓글 <span className="text-primary">{comments.length}</span></h3>
                </div>
              </div>

              {/* Comment Input */}
              <div className="space-y-4">
                <div className="relative">
                  <textarea 
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="매너 있는 댓글은 커뮤니티를 따뜻하게 만듭니다. (작성 시 5포인트 적립)"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-primary/50 transition-all min-h-[100px] resize-none"
                  />
                  <button 
                    onClick={handleCommentSubmit}
                    disabled={isSubmitting || !commentContent.trim()}
                    className="absolute bottom-4 right-4 btn-primary py-1.5 px-5 text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <MessageSquare className="w-3 h-3" />}
                    등록하기
                  </button>
                </div>
                {submitMessage && (
                  <div className="animate-fade-in flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 p-2 rounded-xl border border-primary/20">
                    <Star className="w-3 h-3 fill-current" />
                    {submitMessage}
                  </div>
                )}
              </div>

              {/* Comment List */}
              <div className="space-y-6 pt-6 border-t border-white/5">
                {comments.length > 0 ? (
                  comments.map((comment: any) => (
                    <div key={comment.id} className="flex gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5 overflow-hidden">
                        {comment.authorAvatar ? (
                          <img src={comment.authorAvatar} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-bold text-muted-foreground">{comment.author[0]}</span>
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">{comment.author}</span>
                            <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-muted-foreground">Lv.{comment.authorLevel || 1}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground/40">{new Date(comment.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center space-y-3">
                    <MessageSquare className="w-10 h-10 text-white/5 mx-auto" />
                    <p className="text-sm text-muted-foreground">첫 번째 댓글을 남겨보세요!</p>
                  </div>
                )}
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
