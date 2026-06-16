"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft, Clock, Eye, ThumbsUp, MessageSquare,
  Share2, AlertTriangle, Loader2, Star, Award, Heart
} from "lucide-react";
import { cn } from "@/lib/utils";

// Helper to convert plain text or basic markdown to HTML, preserving newlines
const formatContent = (text: string) => {
  if (!text) return "";
  
  // If it already contains HTML tags, render it as-is
  if (/<[a-z][\s\S]*>/i.test(text)) {
    return text;
  }
  
  // Otherwise, escape and convert markdown and newlines
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
    
  // Convert basic markdown tags
  html = html.replace(/^### (.*?)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.*?)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.*?)$/gm, "<h1>$1</h1>");
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__(.*?)__/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/_(.*?)_/g, "<em>$1</em>");
  html = html.replace(/`(.*?)`/g, "<code>$1</code>");
  html = html.replace(/^&gt; (.*?)$/gm, "<blockquote>$1</blockquote>");
  html = html.replace(/^\s*[-*+]\s+(.*?)$/gm, "<li>$1</li>");
  html = html.replace(/^\s*\d+\.\s+(.*?)$/gm, "<li>$1</li>");
  
  // Convert newlines to <br />
  html = html.replace(/\n/g, "<br />");
  
  return html;
};

export default function SpotlightDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [commentContent, setCommentContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [isLiking, setIsLiking] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${params.id}`);
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || "콘텐츠를 불러오는 데 실패했습니다.");
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
      const res = await fetch(`/api/posts/${params.id}/like`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setPost((prev: any) => ({
          ...prev,
          likes: data.liked ? prev.likes + 1 : prev.likes - 1,
          isLiked: data.liked
        }));
        if (data.liked) {
          setSubmitMessage("추천 완료! 작성자에게 포인트가 전달됩니다.");
          setTimeout(() => setSubmitMessage(""), 3000);
        }
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("추천 처리 중 오류가 발생했습니다.");
    } finally {
      setIsLiking(false);
    }
  };

  const handleFavorite = async () => {
    if (isFavoriting) return;
    setIsFavoriting(true);
    try {
      const res = await fetch(`/api/posts/${params.id}/favorite`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setPost((prev: any) => ({
          ...prev,
          isFavorited: data.favorited
        }));
        setSubmitMessage(data.favorited ? "관심 콘텐츠로 등록되었습니다." : "관심 콘텐츠에서 해제되었습니다.");
        setTimeout(() => setSubmitMessage(""), 3000);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("관심 등록 처리 중 오류가 발생했습니다.");
    } finally {
      setIsFavoriting(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentContent.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const response = await fetch(`/api/posts/${params.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentContent })
      });

      const data = await response.json();

      if (data.success) {
        setCommentContent("");
        setSubmitMessage("댓글 작성 완료! +5포인트 적립");
        
        // Refresh comments
        const res = await fetch(`/api/posts/${params.id}/comments`);
        const refreshData = await res.json();
        if (refreshData.success) setComments(refreshData.comments);

        setTimeout(() => setSubmitMessage(""), 3000);
      } else {
        alert(data.error || "댓글 등록에 실패했습니다.");
      }
    } catch (err) {
      console.error("Comment submission error:", err);
      alert("서버 오류가 발생했습니다.");
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
          <p className="text-muted-foreground">{error || "게시글을 찾을 수 없습니다."}</p>
          <button onClick={() => router.push("/spotlight")} className="btn-primary w-full py-3">목록으로 돌아가기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mesh-gradient min-h-screen">
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        {/* Navigation & Breadcrumbs */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/spotlight")}
            className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            스포트라이트 목록
          </button>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-primary">홈</Link>
            <span>/</span>
            <Link href="/spotlight" className="hover:text-primary">스포트라이트</Link>
            <span>/</span>
            <span className="text-foreground font-bold">상세 내용</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Article Section */}
          <article className="lg:col-span-8 space-y-6">
            
            {/* Main Article Card */}
            <div className="glass-card rounded-3xl overflow-hidden border-white/10 shadow-2xl">
              
              {/* Top Image if exists */}
              {post.image && (
                <div className="w-full aspect-[21/9] overflow-hidden border-b border-white/5">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Title & Info */}
              <div className="p-6 md:p-8 border-b border-white/5 bg-white/[0.01]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="badge-primary text-[10px] font-black tracking-wide">
                    {post.tags || "스포트라이트"}
                  </span>
                </div>
                
                {post.authorId === 0 ? (
                  <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-4 text-foreground leading-tight" dangerouslySetInnerHTML={{ __html: post.title }} />
                ) : (
                  <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-4 text-foreground leading-tight">{post.title}</h1>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" /> {(post.views || 0).toLocaleString()} 회
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Rich HTML Content Body */}
              <div className="p-6 md:p-8">
                <div 
                  className="text-base md:text-lg leading-relaxed font-medium opacity-90 prose prose-invert max-w-none break-all" 
                  dangerouslySetInnerHTML={{ __html: formatContent(post.content) }} 
                />
              </div>

              {/* Actions: Likes & Favorites */}
              <div className="p-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-center gap-4">
                <button 
                  onClick={handleLike}
                  disabled={isLiking}
                  className={cn(
                    "flex items-center gap-2 px-8 py-3 rounded-2xl transition-all border group text-sm",
                    post.isLiked 
                      ? "bg-primary text-white border-primary shadow-[0_0_20px_rgba(59,130,246,0.3)]" 
                      : "bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                  )}
                >
                  <ThumbsUp className={cn("w-4 h-4 transition-transform", post.isLiked ? "scale-110" : "group-hover:scale-110")} />
                  <span className="font-bold">{post.isLiked ? "추천 완료" : "콘텐츠 추천"} {post.likes}</span>
                </button>
                <button 
                  onClick={handleFavorite}
                  disabled={isFavoriting}
                  className={cn(
                    "flex items-center gap-2 px-8 py-3 rounded-2xl transition-all border group text-sm",
                    post.isFavorited
                      ? "bg-red-500 text-white border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                      : "bg-white/5 hover:bg-white/10 text-muted-foreground border-white/10"
                  )}
                >
                  <Heart className={cn("w-4 h-4 transition-transform", post.isFavorited ? "scale-110 fill-current" : "group-hover:scale-110 text-red-500")} />
                  <span className="font-bold">{post.isFavorited ? "보관함 해제" : "콘텐츠 저장"}</span>
                </button>
              </div>

            </div>

            {/* Comments Area */}
            <div className="glass-card rounded-3xl p-6 md:p-8 space-y-6 border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold">댓글 <span className="text-primary">{comments.length}</span></h3>
                </div>
              </div>

              {/* Input Form */}
              <div className="space-y-4">
                <div className="relative">
                  <textarea 
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="콘텐츠에 대한 생각이나 분석 후기를 남겨주세요! (작성 시 5포인트 적립)"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-primary/50 transition-all min-h-[100px] resize-none"
                  />
                  <button 
                    onClick={handleCommentSubmit}
                    disabled={isSubmitting || !commentContent.trim()}
                    className="absolute bottom-4 right-4 btn-primary py-1.5 px-5 text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <MessageSquare className="w-3 h-3" />}
                    등록
                  </button>
                </div>
                {submitMessage && (
                  <div className="animate-fade-in flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 p-2 rounded-xl border border-primary/20">
                    <Star className="w-3 h-3 fill-current" />
                    {submitMessage}
                  </div>
                )}
              </div>

              {/* Comment Listings */}
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
                  <div className="py-8 text-center space-y-2">
                    <MessageSquare className="w-8 h-8 text-white/5 mx-auto" />
                    <p className="text-sm text-muted-foreground">첫 번째 댓글을 작성해보세요!</p>
                  </div>
                )}
              </div>

            </div>
          </article>

          {/* Sidebar Section */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="glass-card rounded-3xl p-6 bg-gradient-to-br from-primary/10 to-transparent border-white/10">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-glow" /> 작성자 정보
              </h3>
              <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-2xl bg-primary/20 mx-auto border-2 border-primary/20 flex items-center justify-center text-3xl font-black text-primary overflow-hidden">
                  {post.authorAvatar ? (
                    <img src={post.authorAvatar} className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    post.author[0]
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-foreground">{post.author}</h4>
                  <p className="text-xs text-muted-foreground mt-1">공식 운영 및 분석 전문가</p>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-xs text-muted-foreground leading-normal text-left">
                  피나클 공식 배당 정보와 가이드라인을 기반으로 최상의 분석 칼럼을 보장합니다.
                </div>
              </div>
            </div>
          </aside>
        </div>

      </div>
    </div>
  );
}
