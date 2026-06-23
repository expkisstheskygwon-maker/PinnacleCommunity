"use client";

import { useState } from "react";
import Link from "next/link";
import { Trophy, Shield, Mail, MessageCircle } from "lucide-react";
import ContactModal from "@/components/modals/ContactModal";

interface FooterProps {
  description?: string;
  copyright?: string;
  isLoggedIn?: boolean;
}

export default function Footer({ description, copyright, isLoggedIn = false }: FooterProps) {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  return (
    <>
    <footer className="border-t border-white/[0.04] bg-background/80 mt-auto relative">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="bg-gradient-to-br from-primary to-primary/60 p-2 rounded-xl shadow-[0_0_16px_rgba(59,130,246,0.2)]">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-black text-lg tracking-tight">피나클 커뮤니티</span>
                <p className="text-[9px] uppercase tracking-[0.2em] text-primary font-bold">Information Hub</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm whitespace-pre-wrap">
              {description || "피나클 사용자를 위한 정보 허브. 가입부터 배당 분석까지, 신뢰할 수 있는 정보와 실사용자 경험을 한곳에서 제공합니다."}
            </p>
            <div className="flex items-center gap-3">
              <div className="badge-success">
                <Shield className="w-3 h-3" />
                검증된 정보
              </div>
              <div className="badge-primary">
                <MessageCircle className="w-3 h-3" />
                커뮤니티 운영
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">정보</h4>
            <div className="space-y-2.5">
              {[
                { href: "/odds", label: "배당/경기" },
                { href: "/analysis", label: "분석/결과" },
                { href: "/concepts", label: "개념 탑재" },
                { href: "/guide", label: "가이드" },
              ].map(l => (
                <Link key={l.href} href={l.href} className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Community */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">커뮤니티</h4>
            <div className="space-y-2.5">
              {[
                { href: "/community", label: "커뮤니티" },
                { href: "/spotlight", label: "스포트라이트" },
                { href: "/qna", label: "Q&A" },
                { href: "/notices", label: "공지/이슈" },
              ].map(l => (
                <Link key={l.href} href={l.href} className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">지원</h4>
            <div className="space-y-2.5">
              {[
                { href: "/policies/scam", label: "사기주의 안내" },
                { href: "/policies/terms", label: "이용약관" },
                { href: "/policies/privacy", label: "개인정보처리방침" },
              ].map(l => (
                <Link key={l.href} href={l.href} className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  {l.label}
                </Link>
              ))}
              <button onClick={() => setIsContactModalOpen(true)} className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                문의하기
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            {copyright || "© 2026 피나클 커뮤니티. 본 사이트는 피나클(Pinnacle) 공식 사이트가 아닙니다. 독립적인 사용자 커뮤니티입니다."}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/policies/terms" className="hover:text-primary transition-colors">이용약관</Link>
            <Link href="/policies/privacy" className="hover:text-primary transition-colors">개인정보</Link>
            <button onClick={() => setIsContactModalOpen(true)} className="hover:text-primary transition-colors flex items-center gap-1">
              <Mail className="w-3 h-3" /> 문의
            </button>
          </div>
        </div>
      </div>

      {/* Admin Floating Button (Temporary) */}
      <Link 
        href="/admin/login" 
        className="fixed bottom-6 right-6 z-[60] group"
        title="관리자 로그인"
      >
        <div className="flex items-center gap-2 px-4 py-2.5 glass-card rounded-full border-red-500/20 bg-red-500/10 hover:bg-red-500/20 transition-all hover:scale-105 active:scale-95 group-hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]">
          <Shield className="w-4 h-4 text-red-400" />
          <span className="text-[11px] font-black text-red-400 uppercase tracking-tighter">Admin</span>
        </div>
      </Link>
    </footer>
      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
        isLoggedIn={isLoggedIn}
      />
    </>
  );
}
