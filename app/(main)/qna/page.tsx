"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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

const USER_QUESTIONS = [
  { id: 1, question: "피나클 가입 시 VPN이 필요한가요?", author: "뉴비질문", date: "2026-04-20", answers: 12, solved: true, category: "가입/인증", views: 345, topAnswer: "가입 시에는 VPN 없이도 가능하지만, 접속 지역에 따라 필요할 수 있습니다. 일반적으로 Chrome 확장 프로그램 형태의 VPN이면 충분합니다." },
  { id: 2, question: "출금 신청 후 48시간 넘게 처리 안 됩니다", author: "출금대기", date: "2026-04-19", answers: 8, solved: false, category: "결제/입출금", views: 234, topAnswer: "" },
  { id: 3, question: "아시안핸디캡 정산 기준이 궁금합니다", author: "핸디초보", date: "2026-04-18", answers: 15, solved: true, category: "배당/정산", views: 567, topAnswer: "아시안핸디캡은 경기 결과에 핸디캡을 적용한 후 승패를 판단합니다. 예를 들어 -0.5는 해당 팀이 1골 이상 이겨야 당첨됩니다." },
];

export default function QnAPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <QnAContent />
    </Suspense>
  );
}

function QnAContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get("cat") || "all";
  const [activeCat, setActiveCat] = useState(initialCat);
  const [categories, setCategories] = useState<any[]>([]);
  const [showFAQ, setShowFAQ] = useState(true);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  useEffect(() => {
    const cat = searchParams.get("cat");
    if (cat) setActiveCat(cat);

    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/admin/categories?type=qna");
        const data = await res.json();
        if (data.success) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error("Failed to fetch QnA categories", err);
      }
    };
    fetchCategories();
  }, [searchParams]);

  const filteredFAQ = activeCat === "all" ? FAQ_ITEMS : FAQ_ITEMS.filter(f => f.category === activeCat);
  const filteredQuestions = activeCat === "all" ? USER_QUESTIONS : USER_QUESTIONS.filter(q => q.category === activeCat);

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
            <p className="text-muted-foreground mt-1">자주 묻는 질문과 사용자 질문답변</p>
          </div>
          <button className="btn-primary flex items-center gap-2 w-fit">
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
            전체
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
              {cat.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl w-fit mb-8 border border-white/[0.06]">
          <button
            onClick={() => setShowFAQ(true)}
            className={cn("px-6 py-2.5 rounded-lg text-sm font-bold transition-all", showFAQ ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground")}
          >
            공식 FAQ
          </button>
          <button
            onClick={() => setShowFAQ(false)}
            className={cn("px-6 py-2.5 rounded-lg text-sm font-bold transition-all", !showFAQ ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground")}
          >
            사용자 Q&A
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
          <div className="space-y-3">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map(q => (
                <div key={q.id} className="glass-card rounded-xl p-5 hover:bg-white/[0.02] transition-colors cursor-pointer group">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                      q.solved ? "bg-emerald-500/15" : "bg-[hsl(var(--gold))]/15"
                    )}>
                      {q.solved
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        : <HelpCircle className="w-4 h-4 text-[hsl(var(--gold))]" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {q.solved
                          ? <span className="badge-success text-[8px]">해결됨</span>
                          : <span className="badge-gold text-[8px]">미해결</span>
                        }
                        <span className="text-[10px] text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded font-bold">
                          {q.category}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm group-hover:text-primary transition-colors mb-2">{q.question}</h3>
                      {q.topAnswer && (
                        <div className="bg-white/[0.03] rounded-lg p-3 mb-3 border-l-2 border-primary/30">
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{q.topAnswer}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                        <span>{q.author}</span>
                        <span>{q.date}</span>
                        <span className="flex items-center gap-1"><MessageSquare className="w-2.5 h-2.5" />답변 {q.answers}</span>
                        <span className="flex items-center gap-1"><Eye className="w-2.5 h-2.5" />{q.views}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm py-10">해당 카테고리에 등록된 질문이 없습니다.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
