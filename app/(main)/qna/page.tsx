"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/useLanguage";
import {
  HelpCircle, CheckCircle2, MessageSquare, Clock, ChevronRight,
  UserPlus, CreditCard, BarChart3, Shield, ThumbsUp, Eye, PenLine
} from "lucide-react";
import { cn } from "@/lib/utils";

const FAQ_ITEMS = [
  { id: 1, question: "피나클은 한국에서 합법인가요?", answer: "피나클은 큐라소 라이선스를 보유한 해외 합법 사이트입니다. 한국 국내법상 해외 베팅 사이트 이용에 대한 법적 판단은 변호사와 상담하시기 바랍니다.", category: "가입/인증" },
  { id: 2, question: "입금은 어떤 방법으로 하나요?", answer: "암호화폐(비트코인, 이더리움 등), Skrill, Neteller 등의 결제 수단을 지원합니다. 국내 은행 직접 이체는 지원되지 않습니다.", category: "결제/입출금" },
  { id: 3, question: "배당 제한(limit)을 받을 수 있나요?", answer: "피나클은 '위너 환영(Winners Welcome)' 정책으로 유명하며, 타 사이트 대비 배당 제한이 거의 없습니다. 다만 극단적인 아비트라지 행위 등은 제한될 수 있습니다.", category: "배당/정산" },
  { id: 4, question: "2FA(이중인증) 설정은 어떻게 하나요?", answer: "마이 계정 > 보안 설정에서 Google Authenticator 또는 Authy 앱을 연동할 수 있습니다. 설정 시 백업 코드를 반드시 저장해 두세요.", category: "계정/보안" },
];

export default function QnAPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <QnAContent />
    </Suspense>
  );
}

function QnAContent() {
  const { lang } = useLanguage();
  const searchParams = useSearchParams();
  const initialCat = searchParams.get("cat") || "all";
  const [activeCat, setActiveCat] = useState(initialCat);
  const [categories, setCategories] = useState<any[]>([]);
  const [showFAQ, setShowFAQ] = useState(true);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  // Dynamic Q&A State
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoadingQna, setIsLoadingQna] = useState(true);
  const [expandedUserQna, setExpandedUserQna] = useState<number | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mainMenuDesc, setMainMenuDesc] = useState<string>("자주 묻는 질문과 사용자 질문답변");

  const fetchQuestions = async () => {
    setIsLoadingQna(true);
    try {
      const res = await fetch("/api/inquiries?type=public");
      const data = await res.json();
      if (data.success) {
        setQuestions(data.inquiries);
      }
    } catch (err) {
      console.error("Failed to fetch user QnA", err);
    } finally {
      setIsLoadingQna(false);
    }
  };

  useEffect(() => {
    setIsLoggedIn(document.cookie.includes("auth_session"));
    fetchQuestions();
  }, []);

  useEffect(() => {
    const cat = searchParams.get("cat");
    if (cat) setActiveCat(cat);

    const fetchCategories = async () => {
      try {
        const [res, menusRes] = await Promise.all([
          fetch("/api/admin/categories?type=qna"),
          fetch("/api/menus")
        ]);
        const data = await res.json();
        const menusData = await menusRes.json();
        
        if (menusData.success) {
          const menu = menusData.menus.find((m: any) => m.menuId === "qna" || m.href === "/qna");
          if (menu && menu.description) {
            setMainMenuDesc(menu.description);
          }
        }

        if (data.success) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error("Failed to fetch QnA categories", err);
      }
    };
    fetchCategories();
  }, [searchParams]);

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }
    if (!isLoggedIn && !email.trim()) {
      alert("이메일 주소를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, email }),
      });
      const data = await res.json();
      if (data.success) {
        alert("질문이 성공적으로 접수되었습니다. 관리자 답변 후 노출됩니다.");
        setTitle("");
        setContent("");
        setEmail("");
        setIsModalOpen(false);
        fetchQuestions();
      } else {
        alert(data.error || "질문 등록 중 오류가 발생했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("서버 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFAQ = activeCat === "all" ? FAQ_ITEMS : FAQ_ITEMS.filter(f => f.category === activeCat);
  const filteredQuestions = questions; // Show all inquiries under Q&A

  return (
    <div className="mesh-gradient min-h-screen">
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <Link href="/" className="hover:text-primary transition-colors">홈</Link>
          <span>/</span>
          <span className="text-foreground font-bold">Q&A</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter">Q&A</h1>
            <p className="text-muted-foreground mt-1">{mainMenuDesc}</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 w-fit">
            <PenLine className="w-4 h-4" /> 질문하기
          </button>
        </div>

        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveCat("all")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
              activeCat === "all"
                ? "bg-primary text-white shadow-[0_0_16px_rgba(59,130,246,0.3)]"
                : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 border border-white/[0.06]"
            )}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            {lang === "ko" ? "전체" : "All"}
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.name)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap border",
                activeCat === cat.name
                  ? "bg-primary/20 border-primary/40 text-primary"
                  : "bg-white/5 border-white/[0.06] text-muted-foreground hover:border-white/20"
              )}
            >
              <HelpCircle className="w-3.5 h-3.5 opacity-50" />
              {lang === "ko" ? cat.name : (cat.nameEn || cat.name)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl w-fit mb-8 border border-white/[0.06]">
          <button
            onClick={() => setShowFAQ(true)}
            className={cn("px-6 py-2.5 rounded-lg text-sm font-bold transition-all", showFAQ ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground")}
          >
            {lang === "ko" ? "공식 FAQ" : "Official FAQ"}
          </button>
          <button
            onClick={() => setShowFAQ(false)}
            className={cn("px-6 py-2.5 rounded-lg text-sm font-bold transition-all", !showFAQ ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground")}
          >
            {lang === "ko" ? "사용자 Q&A" : "User Q&A"}
          </button>
        </div>

        {showFAQ ? (
          <div className="space-y-3 max-w-3xl">
            {filteredFAQ.length > 0 ? (
              filteredFAQ.map(faq => (
                <div key={faq.id} className="glass-card rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <HelpCircle className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-bold text-sm group-hover:text-primary transition-colors">{faq.question}</span>
                    </div>
                    <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform shrink-0 ml-4", expandedFAQ === faq.id && "rotate-90")} />
                  </button>
                  {expandedFAQ === faq.id && (
                    <div className="px-5 pb-5 pl-16 animate-fade-in">
                      <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm py-10">해당 카테고리에 등록된 FAQ가 없습니다.</p>
            )}
          </div>
        ) : (
          <div className="space-y-3 max-w-3xl">
            {isLoadingQna ? (
              <div className="text-center py-10 text-muted-foreground animate-pulse font-bold">로딩 중...</div>
            ) : filteredQuestions.length > 0 ? (
              filteredQuestions.map(q => {
                const isSolved = q.status === "answered";
                const isExpanded = expandedUserQna === q.id;
                const authorDisplay = q.userNickname || q.email || "손님";
                return (
                  <div key={q.id} className="glass-card rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedUserQna(isExpanded ? null : q.id)}
                      className="w-full flex items-start gap-4 p-5 text-left hover:bg-white/[0.02] transition-colors group"
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                        isSolved ? "bg-emerald-500/15" : "bg-[hsl(var(--gold))]/15"
                      )}>
                        {isSolved
                          ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          : <HelpCircle className="w-4 h-4 text-[hsl(var(--gold))]" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {isSolved
                            ? <span className="badge-success text-[8px]">해결됨</span>
                            : <span className="badge-gold text-[8px]">미해결</span>
                          }
                          <span className="text-[10px] text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded font-bold">
                            사용자 Q&A
                          </span>
                        </div>
                        <h3 className="font-bold text-sm group-hover:text-primary transition-colors mb-2">{q.title}</h3>
                        
                        <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                          <span>{authorDisplay}</span>
                          <span>{new Date(q.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform shrink-0 ml-4 mt-2", isExpanded && "rotate-90")} />
                    </button>

                    {isExpanded && (
                      <div className="px-5 pb-5 pl-16 border-t border-white/[0.04] bg-white/[0.01] pt-4 animate-fade-in">
                        <div className="mb-4">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block mb-1">질문 내용</span>
                          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{q.content}</p>
                        </div>
                        {isSolved ? (
                          <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                            <span className="text-[10px] uppercase font-black text-primary tracking-widest block mb-1">관리자 답변</span>
                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{q.answer}</p>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">답변을 기다리고 있는 질문입니다.</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-muted-foreground text-sm py-10">등록된 사용자 질문이 없습니다.</p>
            )}
          </div>
        )}
      </div>

      {/* Write Question Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#101424] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-in">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-black text-lg">질문하기</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">자유롭게 궁금한 점을 질문해 보세요</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-white p-2 hover:bg-white/5 rounded-xl transition-all">✕</button>
            </div>
            <form onSubmit={handleSubmitQuestion}>
              <div className="p-6 space-y-4">
                {!isLoggedIn && (
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">이메일 주소</label>
                    <input
                      type="email"
                      required
                      placeholder="답변 알림을 받을 이메일 주소를 입력해 주세요"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>
                )}
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">질문 제목</label>
                  <input
                    type="text"
                    required
                    placeholder="질문 제목을 입력해 주세요"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-all font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">질문 내용</label>
                  <textarea
                    required
                    rows={6}
                    placeholder="상세한 질문 내용을 입력해 주세요"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-all resize-none"
                  />
                </div>
              </div>
              <div className="p-5 border-t border-white/10 flex justify-end gap-2 bg-black/20">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:bg-white/5 transition-colors">취소</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all">
                  {isSubmitting ? "등록 중..." : "등록하기"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
