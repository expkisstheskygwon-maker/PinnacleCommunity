"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell, AlertTriangle, Wrench, FileText, Shield,
  Clock, ChevronRight, Pin, Megaphone, XCircle, Info
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "all", label: "전체", icon: Bell },
  { id: "maintenance", label: "점검 공지", icon: Wrench },
  { id: "scam", label: "사기주의", icon: Shield },
  { id: "outage", label: "장애/지연", icon: XCircle },
  { id: "policy", label: "정책 변경", icon: FileText },
];

const NOTICES = [
  { id: 1, type: "scam", title: "피나클 공식 대리점 사칭 텔레그램 채널 주의", content: "최근 '피나클 공식 대리점', '피나클 VIP 에이전트'를 사칭하는 텔레그램 채널이 다수 발견되었습니다. 피나클은 대리점/에이전트 제도를 운영하지 않습니다. 해당 채널에서 입금을 유도할 경우 100% 사기입니다.", date: "2026-04-20", pinned: true, urgent: true },
  { id: 2, type: "maintenance", title: "4/21(월) 새벽 2:00-4:00 서버 정기점검", content: "서비스 안정성 향상을 위한 정기 점검이 진행됩니다. 점검 시간 동안 사이트 접속 및 베팅이 불가합니다. 라이브 베팅 중인 건은 점검 시작 전 정산됩니다.", date: "2026-04-19", pinned: true, urgent: false },
  { id: 3, type: "policy", title: "KYC 인증 절차 변경 안내 (5월 적용)", content: "2026년 5월부터 KYC 인증 시 셀카 촬영이 추가됩니다. 기존 인증 완료 유저는 재인증 불필요. 신규 가입자부터 적용됩니다.", date: "2026-04-18", pinned: false, urgent: false },
  { id: 4, type: "scam", title: "가짜 피나클 도메인 목록 업데이트", content: "pinnac1e.com, pinnakle.com, pinnacle-korea.com 등 유사 도메인이 확인되었습니다. 공식 도메인은 pinnacle.com 뿐입니다. 의심 사이트 발견 시 즉시 신고해 주세요.", date: "2026-04-17", pinned: false, urgent: true },
  { id: 5, type: "outage", title: "4/16 오후 라이브 베팅 지연 안내", content: "4/16 오후 3-5시 사이 라이브 베팅 배당 업데이트 지연이 있었습니다. 현재 정상 복구되었으며, 해당 시간 베팅 건은 정상 처리되었습니다.", date: "2026-04-16", pinned: false, urgent: false },
  { id: 6, type: "policy", title: "최소 출금 금액 변경 안내", content: "암호화폐 출금 최소 금액이 20 USD에서 15 USD로 변경되었습니다. 전자지갑 출금 최소 금액은 기존과 동일합니다.", date: "2026-04-15", pinned: false, urgent: false },
  { id: 7, type: "maintenance", title: "4/14 e스포츠 섹션 업데이트 완료", content: "e스포츠 베팅 인터페이스가 업데이트되었습니다. 맵별 베팅, 라이브 스코어 표시 개선, 모바일 최적화가 포함됩니다.", date: "2026-04-14", pinned: false, urgent: false },
];

const TYPE_CONFIG: Record<string, { icon: any; color: string; bgColor: string; label: string }> = {
  scam: { icon: Shield, color: "text-red-400", bgColor: "bg-red-500/15", label: "사기주의" },
  maintenance: { icon: Wrench, color: "text-[hsl(var(--gold))]", bgColor: "bg-[hsl(var(--gold))]/15", label: "점검" },
  outage: { icon: XCircle, color: "text-orange-400", bgColor: "bg-orange-500/15", label: "장애" },
  policy: { icon: FileText, color: "text-primary", bgColor: "bg-primary/15", label: "정책" },
};

export default function NoticesPage() {
  const [activeCat, setActiveCat] = useState("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = activeCat === "all" ? NOTICES : NOTICES.filter(n => n.type === activeCat);
  const pinned = filtered.filter(n => n.pinned);
  const regular = filtered.filter(n => !n.pinned);

  return (
    <div className="mesh-gradient min-h-screen">
      <div className="container mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <Link href="/" className="hover:text-primary transition-colors">홈</Link>
          <span>/</span>
          <span className="text-foreground font-bold">공지/이슈</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter">공지/이슈</h1>
          <p className="text-muted-foreground mt-1">점검 안내, 사기주의, 장애 보고, 정책 변경 등</p>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                activeCat === cat.id
                  ? "bg-primary text-white shadow-[0_0_16px_rgba(59,130,246,0.3)]"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10 border border-white/[0.06]"
              )}
            >
              <cat.icon className="w-3.5 h-3.5" />
              {cat.label}
            </button>
          ))}
        </div>

        <div className="max-w-3xl space-y-6">
          {/* Pinned */}
          {pinned.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                <Pin className="w-3 h-3" /> 고정 공지
              </div>
              {pinned.map(notice => {
                const config = TYPE_CONFIG[notice.type];
                return (
                  <div key={notice.id}
                    className={cn("glass-card rounded-xl overflow-hidden border-l-4", notice.urgent ? "border-l-red-500" : "border-l-primary")}
                  >
                    <button
                      onClick={() => setExpandedId(expandedId === notice.id ? null : notice.id)}
                      className="w-full p-5 text-left flex items-center gap-4 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", config.bgColor)}>
                        <config.icon className={cn("w-5 h-5", config.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn("badge text-[8px]", config.bgColor, config.color, `border-${config.color}/20`)}>{config.label}</span>
                          {notice.urgent && <span className="badge-danger text-[8px]">긴급</span>}
                          <span className="badge-primary text-[8px]"><Pin className="w-2 h-2" />고정</span>
                        </div>
                        <h3 className="font-bold text-sm">{notice.title}</h3>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[10px] text-muted-foreground">{notice.date}</span>
                        <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform", expandedId === notice.id && "rotate-90")} />
                      </div>
                    </button>
                    {expandedId === notice.id && (
                      <div className="px-5 pb-5 pl-[76px] animate-fade-in">
                        <p className="text-sm text-muted-foreground leading-relaxed">{notice.content}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Regular */}
          <div className="space-y-3">
            {pinned.length > 0 && regular.length > 0 && (
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest pt-4">
                <Megaphone className="w-3 h-3" /> 일반 공지
              </div>
            )}
            {regular.map(notice => {
              const config = TYPE_CONFIG[notice.type];
              return (
                <div key={notice.id} className="glass-card rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedId(expandedId === notice.id ? null : notice.id)}
                    className="w-full p-5 text-left flex items-center gap-4 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", config.bgColor)}>
                      <config.icon className={cn("w-4 h-4", config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn("text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded", config.bgColor, config.color)}>{config.label}</span>
                        {notice.urgent && <span className="badge-danger text-[8px]">긴급</span>}
                      </div>
                      <h3 className="font-bold text-sm">{notice.title}</h3>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] text-muted-foreground hidden sm:block">{notice.date}</span>
                      <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform", expandedId === notice.id && "rotate-90")} />
                    </div>
                  </button>
                  {expandedId === notice.id && (
                    <div className="px-5 pb-5 pl-[68px] animate-fade-in">
                      <p className="text-sm text-muted-foreground leading-relaxed">{notice.content}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
