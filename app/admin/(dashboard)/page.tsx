"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield, Users, FileText, BarChart3, Bell, BookOpen, HelpCircle,
  TrendingUp, LogOut, Home, ChevronRight, Search, Plus, Edit, Trash2,
  Eye, ToggleLeft, ToggleRight, MessageSquare, AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const SIDEBAR_ITEMS = [
  { id: "dashboard", label: "대시보드", icon: BarChart3 },
  { id: "members", label: "회원 관리", icon: Users },
  { id: "community", label: "커뮤니티 관리", icon: MessageSquare },
  { id: "guide", label: "가이드 작성", icon: BookOpen },
  { id: "qna", label: "Q&A 관리", icon: HelpCircle },
  { id: "notices", label: "공지/이슈 작성", icon: Bell },
  { id: "analysis", label: "분석/칼럼 작성", icon: TrendingUp },
];

// --- 더미 데이터 ---
const DUMMY_MEMBERS = [
  { id: 1, nickname: "베팅왕", userId: "betking99", joinDate: "2026-04-10", status: "active", posts: 23 },
  { id: 2, nickname: "축구매니아", userId: "soccerfan", joinDate: "2026-04-12", status: "active", posts: 15 },
  { id: 3, nickname: "신규유저", userId: "newbie01", joinDate: "2026-04-25", status: "active", posts: 1 },
  { id: 4, nickname: "스팸봇", userId: "spammer", joinDate: "2026-04-20", status: "banned", posts: 0 },
];

const DUMMY_POSTS = [
  { id: 1, title: "자유게시판 첫 글입니다", author: "베팅왕", cat: "자유", date: "2026-04-27", views: 120, status: "public" },
  { id: 2, title: "EPL 경기 토론", author: "축구매니아", cat: "토론", date: "2026-04-26", views: 85, status: "public" },
  { id: 3, title: "광고성 게시물", author: "스팸봇", cat: "자유", date: "2026-04-25", views: 3, status: "hidden" },
];

const STATS = [
  { label: "총 회원", value: "1,247", change: "+23", icon: Users, color: "text-blue-400" },
  { label: "오늘 방문", value: "342", change: "+12%", icon: Eye, color: "text-emerald-400" },
  { label: "총 게시글", value: "3,891", change: "+47", icon: FileText, color: "text-purple-400" },
  { label: "신고 접수", value: "5", change: "-2", icon: AlertTriangle, color: "text-red-400" },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex bg-[hsl(222.2,84%,3%)]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/[0.06] bg-background/60 backdrop-blur-xl flex flex-col shrink-0">
        <div className="p-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-br from-red-500 to-orange-500 p-2 rounded-xl shadow-[0_0_16px_rgba(239,68,68,0.3)]">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-black text-sm tracking-tight block">관리자 패널</span>
              <span className="text-[9px] uppercase tracking-[0.15em] text-red-400 font-bold">Admin Panel</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {SIDEBAR_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left",
                activeTab === item.id
                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/[0.06] space-y-2">
          <Link href="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
            <Home className="w-4 h-4" /> 사이트로 돌아가기
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut className="w-4 h-4" /> 로그아웃
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Dashboard */}
          {activeTab === "dashboard" && <DashboardView />}
          {activeTab === "members" && <MembersView search={searchQuery} setSearch={setSearchQuery} />}
          {activeTab === "community" && <CommunityView />}
          {activeTab === "guide" && <PostEditorView category="가이드" />}
          {activeTab === "qna" && <PostEditorView category="Q&A" />}
          {activeTab === "notices" && <PostEditorView category="공지/이슈" />}
          {activeTab === "analysis" && <PostEditorView category="분석/칼럼" />}
        </div>
      </main>
    </div>
  );
}

/* ============ Sub Views ============ */

function DashboardView() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black tracking-tight">대시보드</h1>
        <p className="text-sm text-muted-foreground mt-1">피나클 커뮤니티 운영 현황</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(s => (
          <div key={s.label} className="glass-card rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{s.label}</span>
              <s.icon className={cn("w-4 h-4", s.color)} />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-black">{s.value}</span>
              <span className={cn("text-xs font-bold mb-0.5", s.change.startsWith("+") ? "text-emerald-400" : "text-red-400")}>{s.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">최근 활동</h2>
        <div className="space-y-3">
          {[
            { text: "새 회원 가입: newbie01", time: "10분 전", type: "user" },
            { text: "게시글 신고 접수: 광고성 게시물", time: "25분 전", type: "report" },
            { text: "공지사항 발행: 서버 점검 안내", time: "1시간 전", type: "notice" },
            { text: "회원 차단: spammer", time: "2시간 전", type: "ban" },
          ].map((a, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
              <span className="text-sm">{a.text}</span>
              <span className="text-[10px] text-muted-foreground">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MembersView({ search, setSearch }: { search: string; setSearch: (v: string) => void }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">회원 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">등록된 회원을 조회하고 관리합니다</p>
        </div>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="회원 검색..." className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-all" />
      </div>
      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] text-muted-foreground uppercase tracking-widest border-b border-white/[0.06] bg-white/[0.02]">
              <th className="text-left px-5 py-4 font-bold">닉네임</th>
              <th className="text-left px-3 py-4 font-bold">아이디</th>
              <th className="text-center px-3 py-4 font-bold">가입일</th>
              <th className="text-center px-3 py-4 font-bold">게시글</th>
              <th className="text-center px-3 py-4 font-bold">상태</th>
              <th className="text-right px-5 py-4 font-bold">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {DUMMY_MEMBERS.filter(m => !search || m.nickname.includes(search) || m.userId.includes(search)).map(m => (
              <tr key={m.id} className="hover:bg-white/[0.03] transition-colors">
                <td className="px-5 py-4 font-bold">{m.nickname}</td>
                <td className="px-3 py-4 text-muted-foreground">{m.userId}</td>
                <td className="px-3 py-4 text-center text-muted-foreground text-xs">{m.joinDate}</td>
                <td className="px-3 py-4 text-center">{m.posts}</td>
                <td className="px-3 py-4 text-center">
                  <span className={cn("text-[10px] font-bold px-2 py-1 rounded border", m.status === "active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20")}>
                    {m.status === "active" ? "정상" : "차단"}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CommunityView() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black tracking-tight">커뮤니티 관리</h1>
        <p className="text-sm text-muted-foreground mt-1">게시글 및 댓글을 관리합니다</p>
      </div>
      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] text-muted-foreground uppercase tracking-widest border-b border-white/[0.06] bg-white/[0.02]">
              <th className="text-left px-5 py-4 font-bold">제목</th>
              <th className="text-left px-3 py-4 font-bold">작성자</th>
              <th className="text-center px-3 py-4 font-bold">카테고리</th>
              <th className="text-center px-3 py-4 font-bold">조회</th>
              <th className="text-center px-3 py-4 font-bold">상태</th>
              <th className="text-right px-5 py-4 font-bold">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {DUMMY_POSTS.map(p => (
              <tr key={p.id} className="hover:bg-white/[0.03] transition-colors">
                <td className="px-5 py-4 font-bold">{p.title}</td>
                <td className="px-3 py-4 text-muted-foreground">{p.author}</td>
                <td className="px-3 py-4 text-center"><span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">{p.cat}</span></td>
                <td className="px-3 py-4 text-center text-muted-foreground">{p.views}</td>
                <td className="px-3 py-4 text-center">
                  <span className={cn("text-[10px] font-bold px-2 py-1 rounded border", p.status === "public" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20")}>
                    {p.status === "public" ? "공개" : "숨김"}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PostEditorView({ category }: { category: string }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black tracking-tight">{category} 작성</h1>
        <p className="text-sm text-muted-foreground mt-1">새로운 {category} 콘텐츠를 작성합니다 (관리자 전용)</p>
      </div>
      <div className="glass-card rounded-2xl p-6 space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">제목</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder={`${category} 제목을 입력하세요`} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-all" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">카테고리</label>
          <div className="flex items-center gap-2 flex-wrap">
            {category === "가이드" && ["가입 가이드", "입출금 가이드", "배팅 가이드", "기타"].map(c => (
              <button key={c} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-white/10 bg-white/5 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all">{c}</button>
            ))}
            {category === "Q&A" && ["가입/인증", "결제/입출금", "배당/정산", "계정/보안"].map(c => (
              <button key={c} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-white/10 bg-white/5 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all">{c}</button>
            ))}
            {category === "공지/이슈" && ["점검 공지", "사기주의", "장애/지연", "정책 변경"].map(c => (
              <button key={c} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-white/10 bg-white/5 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all">{c}</button>
            ))}
            {category === "분석/칼럼" && ["초보 가이드", "배당 이해", "라인 변동", "전략/리스크"].map(c => (
              <button key={c} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-white/10 bg-white/5 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all">{c}</button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">본문</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} rows={14} placeholder="내용을 입력하세요..." className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-all resize-none" />
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <button className="btn-outline py-2.5 px-6 text-xs">임시 저장</button>
          <button className="py-2.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-red-500 to-orange-500 text-white hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <span className="flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> 발행하기</span>
          </button>
        </div>
      </div>
    </div>
  );
}
