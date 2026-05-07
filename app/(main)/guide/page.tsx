"use client";

import Link from "next/link";
import {
  BookOpen, FileText, Shield, CreditCard, UserPlus,
  ChevronRight, Clock, Eye, CheckCircle2, Zap,
  AlertTriangle, Key, Smartphone, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const GUIDE_SECTIONS = [
  {
    id: "signup",
    title: "가입 가이드",
    icon: UserPlus,
    color: "text-primary",
    bgColor: "bg-primary/10",
    description: "피나클 계정 생성부터 KYC 인증까지",
    steps: [
      { title: "피나클 공식 사이트 접속", detail: "pinnacle.com에 접속하여 '회원가입' 버튼 클릭" },
      { title: "기본 정보 입력", detail: "이메일, 비밀번호, 국가, 통화(USD/EUR 권장) 선택" },
      { title: "이메일 인증 완료", detail: "가입 이메일로 발송된 인증 링크 클릭" },
      { title: "KYC 본인인증", detail: "여권 또는 신분증 사본 + 주소 증빙 서류 제출 (처리 1-3일)" },
      { title: "가입 완료!", detail: "인증 승인 후 입금 및 베팅 가능" },
    ],
    tips: ["여권 인증이 가장 빠릅니다 (보통 24시간 내)", "가입 시 통화는 변경 불가하므로 신중히 선택하세요", "만 18세 이상만 가입 가능합니다"],
  },
  {
    id: "deposit",
    title: "입금 가이드",
    icon: CreditCard,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    description: "지원되는 입금 방법과 처리 시간",
    steps: [
      { title: "입금 방법 선택", detail: "암호화폐(BTC, ETH), Skrill, Neteller, ecoPayz 중 선택" },
      { title: "금액 입력", detail: "최소 입금 금액: 약 10 USD (결제 수단에 따라 상이)" },
      { title: "결제 진행", detail: "선택한 방법의 안내에 따라 송금/결제" },
      { title: "잔액 확인", detail: "암호화폐: 10-30분 / 전자지갑: 즉시 반영" },
    ],
    tips: ["암호화폐 입금이 가장 빠르고 수수료가 적습니다", "첫 입금 전 KYC 인증이 완료되어야 합니다", "입금 통화와 계정 통화가 다르면 환전 수수료 발생"],
  },
  {
    id: "withdraw",
    title: "출금 가이드",
    icon: Zap,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    description: "출금 신청부터 받기까지",
    steps: [
      { title: "출금 메뉴 접속", detail: "마이 계정 > 출금에서 출금 방법 선택" },
      { title: "금액 및 정보 입력", detail: "출금 금액과 수령 정보(지갑 주소 등) 입력" },
      { title: "보안 인증", detail: "2FA 코드 또는 이메일 인증 완료" },
      { title: "처리 대기", detail: "보통 1-24시간 내 처리 (고액은 추가 심사 가능)" },
    ],
    tips: ["입금과 동일한 방법으로 출금해야 합니다", "첫 출금 시 추가 신분 확인이 필요할 수 있습니다", "주말·공휴일에는 처리가 지연될 수 있습니다"],
  },
  {
    id: "security",
    title: "계정 보안",
    icon: Shield,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    description: "2FA 설정, 비밀번호 관리, 보안 팁",
    steps: [
      { title: "2FA 활성화", detail: "Google Authenticator 또는 Authy 앱 설치 후 연동" },
      { title: "강력한 비밀번호 설정", detail: "영문+숫자+특수문자 조합, 12자 이상 권장" },
      { title: "로그인 알림 설정", detail: "새 기기/IP에서 로그인 시 이메일 알림 받기" },
      { title: "백업 코드 저장", detail: "2FA 분실 대비 백업 코드를 안전한 곳에 보관" },
    ],
    tips: ["절대 비밀번호를 타인과 공유하지 마세요", "공용 Wi-Fi에서는 VPN 사용을 권장합니다", "피나클은 절대 비밀번호를 묻지 않습니다 (피싱 주의)"],
  },
];

export default function GuidePage() {
  return (
    <div className="mesh-gradient min-h-screen">
      <div className="container mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <Link href="/" className="hover:text-primary transition-colors">홈</Link>
          <span>/</span>
          <span className="text-foreground font-bold">가이드</span>
        </div>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-4">
            <BookOpen className="w-4 h-4" /> 초보자 필수 가이드
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-3">
            피나클 <span className="text-primary italic">시작하기</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            가입부터 입출금, 계정 보안까지. 피나클 이용에 필요한 모든 것을 안내합니다.
          </p>
        </div>

        {/* Quick Jump */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12 max-w-3xl mx-auto">
          {GUIDE_SECTIONS.map(section => (
            <a key={section.id} href={`#${section.id}`} className="glass-card-hover rounded-xl p-4 text-center cursor-pointer group">
              <div className={cn("w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center group-hover:scale-110 transition-transform", section.bgColor)}>
                <section.icon className={cn("w-5 h-5", section.color)} />
              </div>
              <p className="text-sm font-bold">{section.title}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{section.description.split("부터")[0]}</p>
            </a>
          ))}
        </div>

        {/* Guide Sections */}
        <div className="space-y-16 max-w-4xl mx-auto">
          {GUIDE_SECTIONS.map((section, sIdx) => (
            <section key={section.id} id={section.id} className="scroll-mt-32">
              {/* Section Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", section.bgColor)}>
                  <section.icon className={cn("w-6 h-6", section.color)} />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight">{section.title}</h2>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-0 mb-8">
                {section.steps.map((step, idx) => (
                  <div key={idx} className="flex gap-4 group">
                    {/* Timeline */}
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 shrink-0 z-10",
                        idx === section.steps.length - 1
                          ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                          : "bg-primary/10 border-primary/20 text-primary"
                      )}>
                        {idx === section.steps.length - 1 ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      {idx < section.steps.length - 1 && (
                        <div className="w-0.5 h-full bg-white/[0.06] min-h-[40px]" />
                      )}
                    </div>
                    {/* Content */}
                    <div className="pb-8 flex-1">
                      <h4 className="font-bold text-sm mb-1">{step.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tips */}
              <div className="glass-card rounded-xl p-5 border-[hsl(var(--gold))]/10 bg-[hsl(var(--gold))]/[0.02]">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-[hsl(var(--gold))]" />
                  <span className="text-sm font-bold text-[hsl(var(--gold))]">팁 & 주의사항</span>
                </div>
                <ul className="space-y-2">
                  {section.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <ChevronRight className="w-3 h-3 text-[hsl(var(--gold))] mt-0.5 shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 glass-card rounded-2xl p-10 max-w-2xl mx-auto bg-gradient-to-br from-primary/[0.05] to-transparent">
          <h3 className="text-xl font-black mb-2">더 궁금한 점이 있으신가요?</h3>
          <p className="text-sm text-muted-foreground mb-6">Q&A 게시판에서 질문하시거나, 다른 사용자의 경험을 확인하세요.</p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/qna" className="btn-primary flex items-center gap-2">
              Q&A 바로가기 <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/spotlight" className="btn-outline flex items-center gap-2">
              스포트라이트 보기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
