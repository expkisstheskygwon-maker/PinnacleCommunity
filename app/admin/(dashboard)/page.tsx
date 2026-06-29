"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Shield, Users, FileText, BarChart3, Bell, BookOpen, HelpCircle,
  TrendingUp, LogOut, Home, ChevronRight, Search, Plus, Edit, Trash2,
  Eye, EyeOff, ToggleLeft, ToggleRight, MessageSquare, AlertTriangle, Upload, 
  Image as ImageIcon, Star, Info, X, Settings, Download, FileSpreadsheet, Gavel, Award, Layers, Sparkles,
  ArrowUp, ArrowDown, Check
} from "lucide-react";
import Link from "next/link";
import { cn, formatContent } from "@/lib/utils";
import DummyGeneratorView from "./DummyGeneratorView";

const SIDEBAR_ITEMS = [
  { id: "dashboard", label: "대시보드", icon: BarChart3 },
  { id: "members", label: "회원 관리", icon: Users },
  { id: "community", label: "커뮤니티 관리", icon: FileText },
  { id: "dummy-generator", label: "더미글 생성기", icon: Sparkles },
  { id: "inquiries", label: "1:1 문의 관리", icon: MessageSquare },
  { id: "content", label: "콘텐츠 작성", icon: BookOpen },
  { id: "qna", label: "Q&A 관리", icon: HelpCircle },
  { id: "categories", label: "카테고리 관리", icon: Layers },
  { id: "policies", label: "정책 관리", icon: Gavel },
  { id: "settings", label: "사이트 설정", icon: Settings },
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
          {activeTab === "dummy-generator" && <DummyGeneratorView />}
          {activeTab === "inquiries" && <InquiriesView />}
          {activeTab === "content" && <ContentEditorTabsView />}
          {activeTab === "qna" && <QnaAdminTabsView />}
          {activeTab === "categories" && <CategoryManagementView />}
          {activeTab === "policies" && <PolicyManagementView />}
          {activeTab === "settings" && <SettingsView setActiveTab={setActiveTab} />}
        </div>
      </main>
    </div>
  );
}

/* ============ Sub Views ============ */

function ContentEditorTabsView() {
  const [activeMenuId, setActiveMenuId] = useState<string>("notices");
  const [activeMenuLabel, setActiveMenuLabel] = useState<string>("공지/이슈");
  const [writeableMenus, setWriteableMenus] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWriteableMenus = async () => {
      try {
        const res = await fetch("/api/menus");
        const data = await res.json();
        if (data.success && data.menus) {
          // Filter menus where isAdminWrite === 1
          const filtered = data.menus.filter((m: any) => m.isAdminWrite === 1);
          setWriteableMenus(filtered);
          if (filtered.length > 0) {
            const hasActive = filtered.some((m: any) => m.menuId === activeMenuId);
            if (!hasActive) {
              setActiveMenuId(filtered[0].menuId);
              setActiveMenuLabel(filtered[0].label);
            }
          }
        }
      } catch (e) {
        console.error("Failed to fetch menus for editor:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWriteableMenus();
  }, []);

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "Home": return Home;
      case "TrendingUp": return TrendingUp;
      case "BarChart3": return BarChart3;
      case "Star": return Star;
      case "Lightbulb": return HelpCircle;
      case "Users": return Users;
      case "BookOpen": return BookOpen;
      case "Bell": return Bell;
      case "HelpCircle": return HelpCircle;
      default: return BookOpen;
    }
  };

  if (isLoading) {
    return <div className="text-center py-20 text-muted-foreground animate-pulse font-bold text-sm">로딩 중...</div>;
  }

  if (writeableMenus.length === 0) {
    return (
      <div className="glass-card p-10 rounded-3xl text-center space-y-4 max-w-md mx-auto">
        <Info className="w-12 h-12 text-primary mx-auto opacity-45" />
        <h3 className="text-lg font-bold">콘텐츠 등록 가능한 메뉴가 없습니다</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          '카테고리 관리' 메뉴의 '메인 메뉴 및 순서 관리'에서 원하는 메뉴를 '관리자 전용 작성 콘텐츠 메뉴'로 설정해 주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl w-fit flex-wrap">
        {writeableMenus.map(menu => {
          const IconComp = getIconComponent(menu.icon);
          return (
            <button
              key={menu.menuId}
              onClick={() => {
                setActiveMenuId(menu.menuId);
                setActiveMenuLabel(menu.label);
              }}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                activeMenuId === menu.menuId 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:bg-white/10 hover:text-foreground"
              )}
            >
              <IconComp className="w-4 h-4" />
              {menu.label}
            </button>
          );
        })}
      </div>
      
      <PostEditorView key={activeMenuId} categoryName={activeMenuLabel} categoryType={activeMenuId} />
    </div>
  );
}

function DashboardView() {
  const [stats, setStats] = useState<any>({ totalUsers: 0, totalPosts: 0, todayJoined: 0 });
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/dashboard');
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
          setActivities(data.activities);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const displayStats = [
    { label: "총 회원", value: stats.totalUsers.toLocaleString(), change: "", icon: Users, color: "text-blue-400" },
    { label: "오늘 가입", value: stats.todayJoined.toLocaleString(), change: "", icon: Eye, color: "text-emerald-400" },
    { label: "총 게시글", value: stats.totalPosts.toLocaleString(), change: "", icon: FileText, color: "text-purple-400" },
    { label: "신고 접수", value: "0", change: "", icon: AlertTriangle, color: "text-red-400" }, // Mock for now
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black tracking-tight">대시보드</h1>
        <p className="text-sm text-muted-foreground mt-1">피나클 커뮤니티 운영 현황</p>
      </div>
      
      {isLoading ? (
        <div className="py-10 text-center text-muted-foreground text-sm font-bold animate-pulse">
          데이터를 불러오는 중...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayStats.map(s => (
              <div key={s.label} className="glass-card rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{s.label}</span>
                  <s.icon className={cn("w-4 h-4", s.color)} />
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-black">{s.value}</span>
                  {s.change && (
                    <span className={cn("text-xs font-bold mb-0.5", s.change.startsWith("+") ? "text-emerald-400" : "text-red-400")}>{s.change}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">최근 활동</h2>
            <div className="space-y-3">
              {activities.length > 0 ? activities.map((a, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                  <span className="text-sm">{a.text}</span>
                  <span className="text-[10px] text-muted-foreground">{a.timeStr}</span>
                </div>
              )) : (
                <div className="text-sm text-muted-foreground py-2">최근 활동이 없습니다.</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MembersView({ search, setSearch }: { search: string; setSearch: (v: string) => void }) {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editUser, setEditUser] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ status: 'active', points: 0, attendanceCount: 0 });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteForm, setDeleteForm] = useState({
    deleteType: 'range', // 'all', 'range', 'date'
    startId: '',
    endId: '',
    startDate: '',
    endDate: ''
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        alert(data.error || "회원 목록을 불러오지 못했습니다.");
      }
    } catch (e) {
      console.error(e);
      alert("오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user: any) => {
    setEditUser(user);
    setEditForm({
      status: user.status || 'active',
      points: user.points || 0,
      attendanceCount: user.attendanceCount || 0
    });
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editUser.id,
          ...editForm
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("회원 정보가 수정되었습니다.");
        setEditUser(null);
        fetchUsers();
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
      alert("오류가 발생했습니다.");
    }
  };

  const handleBulkDeleteSubmit = async () => {
    let confirmMsg = "정말 회원들을 삭제하시겠습니까?";
    if (deleteForm.deleteType === 'all') {
      confirmMsg = "[⚠️경고] 정말 모든 회원을 삭제하시겠습니까? 전체 삭제는 복구 불가능하며, 회원들이 작성한 게시글/댓글/기타 활동 정보도 모두 함께 삭제됩니다.";
    } else if (deleteForm.deleteType === 'range') {
      confirmMsg = `ID ${deleteForm.startId} ~ ${deleteForm.endId} 구간의 회원을 삭제하시겠습니까? 관련 게시글/댓글도 함께 삭제됩니다.`;
    } else if (deleteForm.deleteType === 'date') {
      confirmMsg = `${deleteForm.startDate} ~ ${deleteForm.endDate} 기간 내에 가입한 회원을 삭제하시겠습니까? 관련 게시글/댓글도 함께 삭제됩니다.`;
    }

    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch('/api/admin/users/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deleteForm)
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message + ` (${data.count}명의 회원 삭제됨)`);
        setIsDeleteModalOpen(false);
        fetchUsers();
      } else {
        alert(data.error || "삭제에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
      alert("오류가 발생했습니다.");
    }
  };

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'active': return { label: '정상', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'suspended': return { label: '정지', className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' };
      case 'blocked': return { label: '차단', className: 'bg-red-500/10 text-red-400 border-red-500/20' };
      case 'vip': return { label: 'VIP', className: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
      default: return { label: '정상', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">회원 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">등록된 회원을 조회하고 관리합니다</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchUsers} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold transition-all">
            새로고침
          </button>
          <button 
            onClick={() => {
              setDeleteForm({
                deleteType: 'range',
                startId: '',
                endId: '',
                startDate: '',
                endDate: ''
              });
              setIsDeleteModalOpen(true);
            }} 
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold hover:bg-red-500/20 transition-all"
          >
            <Trash2 className="w-4 h-4" /> 대량 삭제
          </button>
        </div>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="회원 검색..." className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-all" />
      </div>
      
      {isLoading ? (
        <div className="py-10 text-center text-muted-foreground text-sm font-bold animate-pulse">
          데이터를 불러오는 중...
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] text-muted-foreground uppercase tracking-widest border-b border-white/[0.06] bg-white/[0.02]">
                <th className="text-left px-5 py-4 font-bold">닉네임</th>
                <th className="text-left px-3 py-4 font-bold">아이디</th>
                <th className="text-center px-3 py-4 font-bold">가입일</th>
                <th className="text-center px-3 py-4 font-bold">게시글</th>
                <th className="text-center px-3 py-4 font-bold">포인트</th>
                <th className="text-center px-3 py-4 font-bold">출석</th>
                <th className="text-center px-3 py-4 font-bold">상태</th>
                <th className="text-right px-5 py-4 font-bold">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {users.filter(m => !search || m.nickname.includes(search) || m.userId.includes(search)).map(m => {
                const statusInfo = getStatusDisplay(m.status);
                return (
                  <tr key={m.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="px-5 py-4 font-bold">{m.nickname}</td>
                    <td className="px-3 py-4 text-muted-foreground">{m.userId}</td>
                    <td className="px-3 py-4 text-center text-muted-foreground text-xs">{new Date(m.joinDate).toISOString().split('T')[0]}</td>
                    <td className="px-3 py-4 text-center">{m.postsCount || 0}</td>
                    <td className="px-3 py-4 text-center font-bold text-blue-400">{m.points || 0}</td>
                    <td className="px-3 py-4 text-center text-emerald-400 font-bold">{m.attendanceCount || 0}</td>
                    <td className="px-3 py-4 text-center">
                      <span className={cn("text-[10px] font-bold px-2 py-1 rounded border", statusInfo.className)}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(m)} className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-muted-foreground text-sm">
                    등록된 회원이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-black text-lg">회원 정보 수정</h3>
              <button onClick={() => setEditUser(null)} className="text-muted-foreground hover:text-white p-1">✕</button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">회원 아이디 / 닉네임</label>
                <div className="px-4 py-3 bg-white/5 rounded-xl text-sm font-bold text-white/50 border border-white/5">
                  {editUser.userId} / {editUser.nickname}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">포인트</label>
                  <input 
                    type="number" 
                    value={editForm.points} 
                    onChange={e => setEditForm({...editForm, points: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-all text-blue-400 font-bold"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">자주 접속/활동 보상 지급 가능</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">출석 횟수</label>
                  <input 
                    type="number" 
                    value={editForm.attendanceCount} 
                    onChange={e => setEditForm({...editForm, attendanceCount: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-all text-emerald-400 font-bold"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">출석체크 기능용 누적 카운트</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">회원 자격 (상태)</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: 'active', label: '정상 회원 (기본)', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' },
                    { val: 'vip', label: 'VIP 회원 (우수)', color: 'border-purple-500/30 text-purple-400 bg-purple-500/10' },
                    { val: 'suspended', label: '활동 중단 (강제)', color: 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10' },
                    { val: 'blocked', label: '영구 차단 (블럭)', color: 'border-red-500/30 text-red-400 bg-red-500/10' }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => setEditForm({...editForm, status: opt.val})}
                      className={cn(
                        "px-3 py-2.5 rounded-xl text-xs font-bold border transition-all text-center",
                        editForm.status === opt.val 
                          ? opt.color 
                          : "border-white/10 bg-white/5 hover:bg-white/10 text-muted-foreground"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-white/10 flex justify-end gap-2 bg-black/20">
              <button onClick={() => setEditUser(null)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:bg-white/5 transition-colors">취소</button>
              <button onClick={handleSaveEdit} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(239,68,68,0.2)]">저장하기</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in animate-duration-200">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-black text-lg text-red-400 flex items-center gap-2">
                <Trash2 className="w-5 h-5" /> 회원 대량 삭제
              </h3>
              <button onClick={() => setIsDeleteModalOpen(false)} className="text-muted-foreground hover:text-white p-1">✕</button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">삭제 범위 설정</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 'range', label: 'ID 구간' },
                    { val: 'date', label: '가입 기간' },
                    { val: 'all', label: '전체 삭제' }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => setDeleteForm({ ...deleteForm, deleteType: opt.val })}
                      className={cn(
                        "px-3 py-2.5 rounded-xl text-xs font-bold border transition-all text-center",
                        deleteForm.deleteType === opt.val
                          ? "border-red-500/30 text-red-400 bg-red-500/10"
                          : "border-white/10 bg-white/5 hover:bg-white/10 text-muted-foreground"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {deleteForm.deleteType === 'range' && (
                <div className="grid grid-cols-2 gap-4 animate-fade-in animate-duration-200">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">시작 ID</label>
                    <input
                      type="number"
                      placeholder="예: 101"
                      value={deleteForm.startId}
                      onChange={e => setDeleteForm({ ...deleteForm, startId: e.target.value })}
                      className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-red-500/50 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">종료 ID</label>
                    <input
                      type="number"
                      placeholder="예: 200"
                      value={deleteForm.endId}
                      onChange={e => setDeleteForm({ ...deleteForm, endId: e.target.value })}
                      className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-red-500/50 text-white font-bold"
                    />
                  </div>
                </div>
              )}

              {deleteForm.deleteType === 'date' && (
                <div className="grid grid-cols-2 gap-4 animate-fade-in animate-duration-200">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">가입 시작일</label>
                    <input
                      type="date"
                      value={deleteForm.startDate}
                      onChange={e => setDeleteForm({ ...deleteForm, startDate: e.target.value })}
                      className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-red-500/50 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">가입 종료일</label>
                    <input
                      type="date"
                      value={deleteForm.endDate}
                      onChange={e => setDeleteForm({ ...deleteForm, endDate: e.target.value })}
                      className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-red-500/50 text-white"
                    />
                  </div>
                </div>
              )}

              <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 text-xs text-red-400 font-bold leading-relaxed space-y-1">
                <p>⚠️ 주의사항</p>
                <ul className="list-disc list-inside pl-1 text-[11px] font-normal text-red-400/80">
                  <li>선택한 범위 내의 모든 회원 정보가 영구적으로 삭제됩니다.</li>
                  <li>해당 회원이 작성한 게시글, 댓글, 포인트 및 활동 이력 또한 전부 삭제됩니다.</li>
                  <li>삭제된 데이터는 복구할 수 없습니다. 신중히 실행해 주세요.</li>
                </ul>
              </div>
            </div>

            <div className="p-5 border-t border-white/10 flex justify-end gap-2 bg-black/20">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:bg-white/5 transition-colors">취소</button>
              <button 
                onClick={handleBulkDeleteSubmit} 
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-red-500 text-white hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(239,68,68,0.2)]"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CommunityView() {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeTag, setActiveTag] = useState<string>("all");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [isCatManageModalOpen, setIsCatManageModalOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [deleteForm, setDeleteForm] = useState({
    deleteType: 'range', // 'all', 'range', 'date'
    startId: '',
    endId: '',
    startDate: '',
    endDate: '',
    category: 'all'
  });

  const [bulkEditForm, setBulkEditForm] = useState({
    editType: 'range', // 'all', 'range', 'date'
    startId: '',
    endId: '',
    startDate: '',
    endDate: '',
    category: 'all',
    modifyViews: true,
    viewsMin: '1',
    viewsMax: '100',
    modifyLikes: false,
    likesMin: '0',
    likesMax: '10'
  });

  const [individualEditForm, setIndividualEditForm] = useState({
    views: 0,
    likes: 0,
    title: "",
    content: "",
    image: null as string | null
  });

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/posts');
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts);
      } else {
        alert(data.error || "게시글 목록을 불러오지 못했습니다.");
      }
    } catch (e) {
      console.error(e);
      alert("오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCommunityCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories?type=community');
      const data = await res.json();
      if (data.success && data.categories && data.categories.length > 0) {
        setCategories(data.categories.map((c: any) => c.name));
      } else {
        setCategories(["free", "match", "picks", "events"]);
      }
    } catch (e) {
      console.error(e);
      setCategories(["free", "match", "picks", "events"]);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchCommunityCategories();
  }, []);

  useEffect(() => {
    if (expandedPostId !== null) {
      const post = posts.find(p => p.id === expandedPostId);
      if (post) {
        setIndividualEditForm({
          views: post.views || 0,
          likes: post.likes || 0,
          title: post.title || "",
          content: post.content || "",
          image: post.image || null
        });
      }
    }
  }, [expandedPostId, posts]);

  const handleToggleStatus = async (postId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'public' ? 'hidden' : 'public';
    try {
      const res = await fetch('/api/admin/posts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchPosts();
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
      alert("상태 변경 중 오류가 발생했습니다.");
    }
  };

  const handleDelete = async (postId: number) => {
    if (!confirm("정말 이 게시글을 삭제하시겠습니까? 복구할 수 없습니다.")) return;
    try {
      const res = await fetch(`/api/admin/posts?id=${postId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchPosts();
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleBulkDeleteSubmit = async () => {
    let confirmMsg = "정말 삭제하시겠습니까?";
    if (deleteForm.deleteType === 'all') {
      confirmMsg = `[⚠️경고] 카테고리 [${deleteForm.category}] 내의 모든 게시글을 삭제하시겠습니까? 전체 삭제는 복구 불가능합니다.`;
    } else if (deleteForm.deleteType === 'range') {
      confirmMsg = `ID ${deleteForm.startId} ~ ${deleteForm.endId} 구간의 게시글을 삭제하시겠습니까?`;
    } else if (deleteForm.deleteType === 'date') {
      confirmMsg = `${deleteForm.startDate} ~ ${deleteForm.endDate} 기간 내의 게시글을 삭제하시겠습니까?`;
    }

    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch('/api/admin/posts/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deleteForm)
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message + ` (${data.count}개의 게시글 삭제됨)`);
        setIsDeleteModalOpen(false);
        fetchPosts();
      } else {
        alert(data.error || "삭제에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
      alert("오류가 발생했습니다.");
    }
  };

  const handleBulkEditSubmit = async () => {
    if (!bulkEditForm.modifyViews && !bulkEditForm.modifyLikes) {
      alert("조회수나 추천수 수정 옵션 중 최소 하나는 선택해야 합니다.");
      return;
    }

    let confirmMsg = "조회수/추천수를 일괄 수정하시겠습니까?";
    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch('/api/admin/posts/bulk-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bulkEditForm)
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message + ` (${data.count}개의 게시글 수정됨)`);
        setIsBulkEditModalOpen(false);
        fetchPosts();
      } else {
        alert(data.error || "수정에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
      alert("오류가 발생했습니다.");
    }
  };

  const handleIndividualEditSubmit = async (postId: number) => {
    try {
      const res = await fetch('/api/admin/posts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          title: individualEditForm.title,
          content: individualEditForm.content,
          image: individualEditForm.image,
          views: individualEditForm.views,
          likes: individualEditForm.likes
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("성공적으로 수정되었습니다.");
        fetchPosts();
      } else {
        alert(data.error || "수정에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
      alert("오류가 발생했습니다.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">커뮤니티 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">게시글 및 댓글을 관리합니다</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {activeCategory !== "all" ? (
            <>
              <button
                onClick={() => {
                  const csvContent = "category,title,content,subCategory,image\n\"" + activeCategory + "\",\"샘플 제목\",\"<p>본문 내용</p>\",\"일반\",\"\"";
                  const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.setAttribute("href", url);
                  link.setAttribute("download", `sample_bulk_upload_${activeCategory}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all"
              >
                <Download className="w-4 h-4" /> 양식 다운로드
              </button>
              
              <div className="relative">
                <input
                  type="file"
                  accept=".csv,.json"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    const reader = new FileReader();
                    reader.onload = async (event) => {
                      const text = event.target?.result as string;
                      let parsed: any[] = [];
                      if (file.name.toLowerCase().endsWith('.json')) {
                        try {
                          const json = JSON.parse(text);
                          parsed = Array.isArray(json) ? json : [json];
                        } catch (e) {
                          alert("JSON 형식이 올바르지 않습니다.");
                          return;
                        }
                      } else {
                        parsed = parseCSV(text);
                      }
                      if (parsed.length === 0) {
                        alert("데이터가 없거나 형식이 잘못되었습니다.");
                        return;
                      }
                      
                      if (!confirm(`${parsed.length}개의 게시글을 일괄 업로드하시겠습니까?`)) return;
                      
                      setIsUploading(true);
                      try {
                        const res = await fetch('/api/admin/posts/bulk', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ posts: parsed, category: activeCategory })
                        });
                        const data = await res.json();
                        if (data.success) {
                          alert(data.message);
                          fetchPosts();
                        } else {
                          alert(data.error);
                        }
                      } catch (err) {
                        alert("업로드 중 오류가 발생했습니다.");
                      } finally {
                        setIsUploading(false);
                        e.target.value = '';
                      }
                    };
                    reader.readAsText(file);
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <button disabled={isUploading} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-all">
                  {isUploading ? <Upload className="w-4 h-4 animate-bounce" /> : <Upload className="w-4 h-4" />} 
                  {isUploading ? "업로드 중..." : "CSV/JSON 업로드"}
                </button>
              </div>
            </>
          ) : (
            <span className="text-xs text-muted-foreground bg-white/5 border border-white/10 rounded-xl px-4 py-2 font-bold">
              💡 일괄 업로드하려면 아래 탭에서 특정 카테고리를 먼저 선택해주세요.
            </span>
          )}

          <button onClick={fetchPosts} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all ml-2">
            새로고침
          </button>
          
          <button 
            onClick={() => {
              setDeleteForm({
                deleteType: 'range',
                startId: '',
                endId: '',
                startDate: '',
                endDate: '',
                category: activeCategory
              });
              setIsDeleteModalOpen(true);
            }} 
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all ml-2"
          >
            <Trash2 className="w-3.5 h-3.5" /> 대량 삭제
          </button>

          <button 
            onClick={() => {
              setBulkEditForm({
                editType: 'range',
                startId: '',
                endId: '',
                startDate: '',
                endDate: '',
                category: activeCategory,
                modifyViews: true,
                viewsMin: '1',
                viewsMax: '100',
                modifyLikes: false,
                likesMin: '0',
                likesMax: '10'
              });
              setIsBulkEditModalOpen(true);
            }} 
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold hover:bg-primary/20 transition-all ml-2"
          >
            <Edit className="w-3.5 h-3.5" /> 조회/추천 일괄 수정
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      {!isLoading && (posts.length > 0 || categories.length > 0) && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => { setActiveCategory("all"); setActiveTag("all"); }}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                activeCategory === "all" ? "bg-primary text-white shadow-[0_0_16px_rgba(59,130,246,0.3)]" : "bg-white/5 text-muted-foreground hover:bg-white/10"
              )}
            >
              전체 보기
            </button>
            {Array.from(new Set([
              ...categories,
              ...posts.map(p => p.category)
            ])).filter(Boolean).map(cat => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setActiveTag("all"); }}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                  activeCategory === cat ? "bg-primary text-white shadow-[0_0_16px_rgba(59,130,246,0.3)]" : "bg-white/5 text-muted-foreground hover:bg-white/10"
                )}
              >
                {cat}
              </button>
            ))}

            <button
              onClick={() => setIsCatManageModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-bold hover:bg-primary/20 transition-all ml-auto"
            >
              <Settings className="w-4 h-4" /> 카테고리 설정
            </button>
          </div>

          {activeCategory !== "all" && Array.from(new Set(posts.filter(p => p.category === activeCategory).map(p => p.tags).filter(Boolean))).length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 pl-2 border-l-2 border-primary/30">
              <button
                onClick={() => setActiveTag("all")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                  activeTag === "all" ? "bg-primary/20 text-primary border border-primary/30" : "bg-white/5 text-muted-foreground hover:bg-white/10 border border-transparent"
                )}
              >
                소분류 전체
              </button>
              {Array.from(new Set(posts.filter(p => p.category === activeCategory).map(p => p.tags).filter(Boolean))).map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag as string)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                    activeTag === tag ? "bg-primary/20 text-primary border border-primary/30" : "bg-white/5 text-muted-foreground hover:bg-white/10 border border-transparent"
                  )}
                >
                  {tag as string}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="py-10 text-center text-muted-foreground text-sm font-bold animate-pulse">
          게시글을 불러오는 중...
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] text-muted-foreground uppercase tracking-widest border-b border-white/[0.06] bg-white/[0.02]">
                <th className="text-left px-5 py-4 font-bold">제목</th>
                <th className="text-left px-3 py-4 font-bold">작성자</th>
                <th className="text-center px-3 py-4 font-bold">카테고리</th>
                <th className="text-center px-3 py-4 font-bold">조회 / 추천</th>
                <th className="text-center px-3 py-4 font-bold">작성일</th>
                <th className="text-center px-3 py-4 font-bold">상태</th>
                <th className="text-right px-5 py-4 font-bold">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {(() => {
                const filteredPosts = posts.filter(p => {
                  if (activeCategory !== "all" && p.category !== activeCategory) return false;
                  if (activeCategory !== "all" && activeTag !== "all" && p.tags !== activeTag) return false;
                  return true;
                });

                if (filteredPosts.length === 0) {
                  return (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-muted-foreground text-sm">
                        해당 분류에 등록된 게시글이 없습니다.
                      </td>
                    </tr>
                  );
                }

                return filteredPosts.map(p => (
                  <React.Fragment key={p.id}>
                    <tr 
                      onClick={() => setExpandedPostId(expandedPostId === p.id ? null : p.id)}
                      className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                    >
                      <td className="px-5 py-4 font-bold max-w-[200px] truncate group-hover:text-primary transition-colors" title={p.title}>
                        {p.authorId === 0 ? <span dangerouslySetInnerHTML={{ __html: p.title }} /> : p.title}
                      </td>
                      <td className="px-3 py-4 text-muted-foreground">{p.author}</td>
                      <td className="px-3 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                            {p.category}
                          </span>
                          {p.tags && (
                            <span className="text-[9px] font-bold text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
                              {p.tags}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-4 text-center text-muted-foreground">{p.views || 0} / {p.likes || 0}</td>
                      <td className="px-3 py-4 text-center text-muted-foreground text-xs">
                        {p.date ? new Date(p.date).toISOString().split('T')[0] : '-'}
                      </td>
                      <td className="px-3 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => handleToggleStatus(p.id, p.status || 'public')}
                          className={cn("text-[10px] font-bold px-2 py-1 rounded border hover:opacity-80 transition-opacity", 
                            (!p.status || p.status === "public") 
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                          )}
                        >
                          {(!p.status || p.status === "public") ? "공개" : "숨김"}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors" title="삭제">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedPostId === p.id && (
                      <tr className="bg-white/[0.01]">
                        <td colSpan={7} className="px-5 py-4 border-t border-white/[0.02]">
                          <div className="p-6 bg-black/40 rounded-2xl border border-white/5 space-y-6 max-h-[700px] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between border-b border-white/5 pb-3">
                              <h4 className="font-black text-sm text-primary flex items-center gap-2">
                                <Edit className="w-4 h-4" /> 게시글 상세 및 수정
                              </h4>
                              <span className="text-[10px] text-muted-foreground font-mono">게시글 ID: {p.id}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Left side: Text inputs */}
                              <div className="space-y-4">
                                <div className="space-y-1.5">
                                  <label className="text-[10px] text-muted-foreground font-black uppercase tracking-wider block">제목</label>
                                  <input 
                                    type="text" 
                                    value={individualEditForm.title}
                                    onChange={e => setIndividualEditForm({ ...individualEditForm, title: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white font-bold focus:outline-none focus:border-primary/50"
                                    placeholder="게시글 제목"
                                  />
                                </div>

                                <div className="space-y-1.5">
                                  <label className="text-[10px] text-muted-foreground font-black uppercase tracking-wider block">내용</label>
                                  <textarea 
                                    value={individualEditForm.content}
                                    onChange={e => setIndividualEditForm({ ...individualEditForm, content: e.target.value })}
                                    rows={8}
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-primary/50 font-medium leading-relaxed"
                                    placeholder="본문 내용을 입력하세요 (HTML 태그 지원)"
                                  />
                                </div>
                              </div>

                              {/* Right side: Image, Stats and Actions */}
                              <div className="space-y-4">
                                <div className="space-y-1.5">
                                  <label className="text-[10px] text-muted-foreground font-black uppercase tracking-wider block">첨부 이미지</label>
                                  <div className="relative group">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const reader = new FileReader();
                                          reader.onloadend = () => {
                                            setIndividualEditForm(prev => ({ ...prev, image: reader.result as string }));
                                          };
                                          reader.readAsDataURL(file);
                                        }
                                      }}
                                      className="hidden"
                                      id={`image-upload-detail-${p.id}`}
                                    />
                                    <label
                                      htmlFor={`image-upload-detail-${p.id}`}
                                      className="cursor-pointer block w-full aspect-video bg-white/5 border border-dashed border-white/20 rounded-xl overflow-hidden hover:bg-white/10 transition-all flex flex-col items-center justify-center relative"
                                    >
                                      {individualEditForm.image ? (
                                        <>
                                          <img src={individualEditForm.image} alt="Preview" className="w-full h-full object-contain" />
                                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <Upload className="w-5 h-5 text-white" />
                                            <span className="text-[10px] text-white font-bold">이미지 변경</span>
                                          </div>
                                        </>
                                      ) : (
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                          <ImageIcon className="w-6 h-6 opacity-40" />
                                          <span className="text-[10px] font-bold">이미지 업로드 (선택)</span>
                                        </div>
                                      )}
                                    </label>
                                    {individualEditForm.image && (
                                      <button
                                        type="button"
                                        onClick={() => setIndividualEditForm(prev => ({ ...prev, image: null }))}
                                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-all z-10"
                                        title="이미지 삭제"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1.5">
                                    <label className="text-[10px] text-muted-foreground font-black block font-bold">조회수</label>
                                    <input 
                                      type="number" 
                                      value={individualEditForm.views}
                                      onChange={e => setIndividualEditForm({ ...individualEditForm, views: parseInt(e.target.value) || 0 })}
                                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white font-bold focus:outline-none focus:border-primary/50"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-[10px] text-muted-foreground font-black block font-bold">추천수</label>
                                    <input 
                                      type="number" 
                                      value={individualEditForm.likes}
                                      onChange={e => setIndividualEditForm({ ...individualEditForm, likes: parseInt(e.target.value) || 0 })}
                                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white font-bold focus:outline-none focus:border-primary/50"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
                              <button 
                                onClick={() => setExpandedPostId(null)}
                                className="px-5 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:bg-white/5 transition-colors border border-white/10 bg-white/[0.02]"
                              >
                                취소
                              </button>
                              <button 
                                onClick={() => handleIndividualEditSubmit(p.id)}
                                className="px-6 py-2.5 bg-primary hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                              >
                                수정 완료
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ));
              })()}
            </tbody>
          </table>
        </div>
      )}
      {/* Bulk Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in animate-duration-200">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-black text-lg text-red-400 flex items-center gap-2">
                <Trash2 className="w-5 h-5" /> 게시글 대량 삭제
              </h3>
              <button onClick={() => setIsDeleteModalOpen(false)} className="text-muted-foreground hover:text-white p-1">✕</button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">삭제 대상 카테고리</label>
                <select
                  value={deleteForm.category}
                  onChange={e => setDeleteForm({ ...deleteForm, category: e.target.value })}
                  className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 text-white font-bold"
                >
                  <option value="all">전체 카테고리</option>
                  <option value="free">자유게시판 (free)</option>
                  <option value="analysis">분석/결과 (analysis)</option>
                  <option value="guide">가입/입출금 가이드 (guide)</option>
                  <option value="qna">Q&A (qna)</option>
                  <option value="notices">공지사항 (notices)</option>
                  <option value="spotlight">스포트라이트 (spotlight)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">삭제 범위 설정</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 'range', label: 'ID 구간' },
                    { val: 'date', label: '날짜 기간' },
                    { val: 'all', label: '전체 삭제' }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => setDeleteForm({ ...deleteForm, deleteType: opt.val })}
                      className={cn(
                        "px-3 py-2.5 rounded-xl text-xs font-bold border transition-all text-center",
                        deleteForm.deleteType === opt.val
                          ? "border-red-500/30 text-red-400 bg-red-500/10"
                          : "border-white/10 bg-white/5 hover:bg-white/10 text-muted-foreground"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {deleteForm.deleteType === 'range' && (
                <div className="grid grid-cols-2 gap-4 animate-fade-in animate-duration-200">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">시작 ID</label>
                    <input
                      type="number"
                      placeholder="예: 101"
                      value={deleteForm.startId}
                      onChange={e => setDeleteForm({ ...deleteForm, startId: e.target.value })}
                      className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-red-500/50 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">종료 ID</label>
                    <input
                      type="number"
                      placeholder="예: 200"
                      value={deleteForm.endId}
                      onChange={e => setDeleteForm({ ...deleteForm, endId: e.target.value })}
                      className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-red-500/50 text-white font-bold"
                    />
                  </div>
                </div>
              )}

              {deleteForm.deleteType === 'date' && (
                <div className="grid grid-cols-2 gap-4 animate-fade-in animate-duration-200">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">시작일</label>
                    <input
                      type="date"
                      value={deleteForm.startDate}
                      onChange={e => setDeleteForm({ ...deleteForm, startDate: e.target.value })}
                      className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-red-500/50 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">종료일</label>
                    <input
                      type="date"
                      value={deleteForm.endDate}
                      onChange={e => setDeleteForm({ ...deleteForm, endDate: e.target.value })}
                      className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-red-500/50 text-white"
                    />
                  </div>
                </div>
              )}

              <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 text-xs text-red-400 font-bold leading-relaxed space-y-1">
                <p>⚠️ 주의사항</p>
                <ul className="list-disc list-inside pl-1 text-[11px] font-normal text-red-400/80">
                  <li>선택한 범위 내의 모든 게시글과 연관된 댓글이 영구적으로 삭제됩니다.</li>
                  <li>삭제된 데이터는 복구할 수 없습니다. 신중히 실행해 주세요.</li>
                </ul>
              </div>
            </div>

            <div className="p-5 border-t border-white/10 flex justify-end gap-2 bg-black/20">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:bg-white/5 transition-colors">취소</button>
              <button 
                onClick={handleBulkDeleteSubmit} 
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.2)]"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Bulk Edit views/likes Modal */}
      {isBulkEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in animate-duration-200">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-black text-lg text-primary flex items-center gap-2">
                <Edit className="w-5 h-5" /> 조회수/추천수 일괄 수정
              </h3>
              <button onClick={() => setIsBulkEditModalOpen(false)} className="text-muted-foreground hover:text-white p-1">✕</button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">수정 대상 카테고리</label>
                <select
                  value={bulkEditForm.category}
                  onChange={e => setBulkEditForm({ ...bulkEditForm, category: e.target.value })}
                  className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 text-white font-bold"
                >
                  <option value="all">전체 카테고리</option>
                  <option value="free">자유게시판 (free)</option>
                  <option value="analysis">분석/결과 (analysis)</option>
                  <option value="guide">가입/입출금 가이드 (guide)</option>
                  <option value="qna">Q&A (qna)</option>
                  <option value="notices">공지사항 (notices)</option>
                  <option value="spotlight">스포트라이트 (spotlight)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">수정 범위 설정</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { val: 'range', label: 'ID 구간' },
                    { val: 'date', label: '날짜 기간' },
                    { val: 'category', label: '카테고리' },
                    { val: 'all', label: '전체 적용' }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setBulkEditForm({ ...bulkEditForm, editType: opt.val })}
                      className={cn(
                        "px-2 py-2.5 rounded-xl text-[11px] font-bold border transition-all text-center",
                        bulkEditForm.editType === opt.val
                          ? "border-primary/30 text-primary bg-primary/10"
                          : "border-white/10 bg-white/5 hover:bg-white/10 text-muted-foreground"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {bulkEditForm.editType === 'range' && (
                <div className="grid grid-cols-2 gap-4 animate-fade-in animate-duration-200">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">시작 ID</label>
                    <input
                      type="number"
                      placeholder="예: 101"
                      value={bulkEditForm.startId}
                      onChange={e => setBulkEditForm({ ...bulkEditForm, startId: e.target.value })}
                      className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">종료 ID</label>
                    <input
                      type="number"
                      placeholder="예: 200"
                      value={bulkEditForm.endId}
                      onChange={e => setBulkEditForm({ ...bulkEditForm, endId: e.target.value })}
                      className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 text-white font-bold"
                    />
                  </div>
                </div>
              )}

              {bulkEditForm.editType === 'date' && (
                <div className="grid grid-cols-2 gap-4 animate-fade-in animate-duration-200">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">시작일</label>
                    <input
                      type="date"
                      value={bulkEditForm.startDate}
                      onChange={e => setBulkEditForm({ ...bulkEditForm, startDate: e.target.value })}
                      className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">종료일</label>
                    <input
                      type="date"
                      value={bulkEditForm.endDate}
                      onChange={e => setBulkEditForm({ ...bulkEditForm, endDate: e.target.value })}
                      className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 text-white"
                    />
                  </div>
                </div>
              )}

              {/* View/Like settings */}
              <div className="space-y-4 pt-2 border-t border-white/5">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={bulkEditForm.modifyViews}
                      onChange={e => setBulkEditForm({ ...bulkEditForm, modifyViews: e.target.checked })}
                      className="rounded border-white/10 bg-black/20 text-primary focus:ring-primary/50"
                    />
                    <span className="text-xs font-bold text-white">조회수 일괄 변경</span>
                  </label>
                  
                  {bulkEditForm.modifyViews && (
                    <div className="grid grid-cols-2 gap-4 pl-6 animate-fade-in">
                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-1">최소값</label>
                        <input 
                          type="number"
                          value={bulkEditForm.viewsMin}
                          onChange={e => setBulkEditForm({ ...bulkEditForm, viewsMin: e.target.value })}
                          className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-1">최대값</label>
                        <input 
                          type="number"
                          value={bulkEditForm.viewsMax}
                          onChange={e => setBulkEditForm({ ...bulkEditForm, viewsMax: e.target.value })}
                          className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-xs text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={bulkEditForm.modifyLikes}
                      onChange={e => setBulkEditForm({ ...bulkEditForm, modifyLikes: e.target.checked })}
                      className="rounded border-white/10 bg-black/20 text-primary focus:ring-primary/50"
                    />
                    <span className="text-xs font-bold text-white">추천수 일괄 변경</span>
                  </label>

                  {bulkEditForm.modifyLikes && (
                    <div className="grid grid-cols-2 gap-4 pl-6 animate-fade-in">
                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-1">최소값</label>
                        <input 
                          type="number"
                          value={bulkEditForm.likesMin}
                          onChange={e => setBulkEditForm({ ...bulkEditForm, likesMin: e.target.value })}
                          className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-1">최대값</label>
                        <input 
                          type="number"
                          value={bulkEditForm.likesMax}
                          onChange={e => setBulkEditForm({ ...bulkEditForm, likesMax: e.target.value })}
                          className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-xs text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-5 border-t border-white/10 flex justify-end gap-2 bg-black/20">
              <button onClick={() => setIsBulkEditModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:bg-white/5 transition-colors">취소</button>
              <button 
                onClick={handleBulkEditSubmit} 
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:opacity-90 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.2)]"
              >
                적용하기
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Category Management Modal */}
      {isCatManageModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-in">
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div>
                <h3 className="font-black text-lg">커뮤니티 카테고리 관리</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">자유게시판, 가이드 등 커뮤니티의 카테고리를 생성/삭제/관리합니다.</p>
              </div>
              <button 
                onClick={() => {
                  setIsCatManageModalOpen(false);
                  fetchCommunityCategories();
                }} 
                className="text-muted-foreground hover:text-white p-2 hover:bg-white/5 rounded-xl transition-all"
              >
                ✕
              </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <CategoryManagementView initialType="community" hideHeader={true} />
            </div>
            <div className="p-4 border-t border-white/10 flex justify-end bg-black/20">
              <button 
                onClick={() => {
                  setIsCatManageModalOpen(false);
                  fetchCommunityCategories();
                }} 
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const parseCSV = (csvText: string) => {
  const lines: string[][] = [];
  let currentLine: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentLine.push(currentField);
        currentField = '';
      } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
        currentLine.push(currentField);
        lines.push(currentLine);
        currentLine = [];
        currentField = '';
        if (char === '\r') i++;
      } else {
        currentField += char;
      }
    }
  }
  if (currentField || currentLine.length > 0) {
    currentLine.push(currentField);
    lines.push(currentLine);
  }

  if (lines.length < 2) return [];
  const headers = lines[0].map(h => h.trim().toLowerCase());
  return lines.slice(1).map(row => {
    const obj: any = {};
    headers.forEach((h, i) => { obj[h] = row[i] || ''; });
    return obj;
  }).filter(row => row.title && row.content); // Filter out empty or invalid rows
};

function PostEditorView({ categoryName, categoryType }: { categoryName: string; categoryType: string }) {
  const [activeSubTab, setActiveSubTab] = useState<"write" | "manage">("write");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [isHtml, setIsHtml] = useState(false);
  
  // Edit state
  const [editPostId, setEditPostId] = useState<number | null>(null);
  
  // Posts for management
  const [posts, setPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);

  const type = categoryType;
  const [subOptions, setSubOptions] = useState<any[]>([]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch(`/api/admin/categories?type=${type}`);
        const data = await res.json();
        if (data.success) {
          setSubOptions(data.categories);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchCats();
  }, [type, isManageModalOpen]);

  const fetchCategoryPosts = async () => {
    setPostsLoading(true);
    try {
      const res = await fetch("/api/admin/posts");
      const data = await res.json();
      if (data.success) {
        const filtered = data.posts.filter((p: any) => p.category === type);
        setPosts(filtered);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === "manage") {
      fetchCategoryPosts();
    }
  }, [activeSubTab, type]);

  const handlePublish = async () => {
    if (!title || !content) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    try {
      setIsPublishing(true);
      const url = "/api/admin/posts";
      const method = editPostId ? "PATCH" : "POST";
      
      const payload = {
        postId: editPostId || undefined,
        title,
        content,
        category: type,
        subCategory: subCategory || undefined,
        image: imageBase64 || undefined,
        isHtml: isHtml ? 1 : 0
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(editPostId ? "게시글이 성공적으로 수정되었습니다." : "게시글이 성공적으로 발행되었습니다.");
        setTitle("");
        setContent("");
        setSubCategory("");
        setImageBase64("");
        setEditPostId(null);
        if (editPostId) {
          setActiveSubTab("manage");
        }
      } else {
        const data = await response.json();
        alert(`오류: ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("서버 통신 중 오류가 발생했습니다.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleEditClick = (post: any) => {
    setEditPostId(post.id);
    setTitle(post.title);
    setContent(post.content);
    setSubCategory(post.tags || "");
    setImageBase64(post.image || "");
    setIsHtml(post.isHtml === 1);
    setActiveSubTab("write");
  };

  const handleDeleteClick = async (postId: number) => {
    if (!confirm("정말 이 게시글을 삭제하시겠습니까? 관련 댓글 정보도 함께 지워집니다.")) return;
    try {
      const res = await fetch(`/api/admin/posts?id=${postId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        alert("게시글이 삭제되었습니다.");
        fetchCategoryPosts();
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleCancelEdit = () => {
    setEditPostId(null);
    setTitle("");
    setContent("");
    setSubCategory("");
    setImageBase64("");
    setIsHtml(false);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">{categoryName} 콘텐츠 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {categoryName} 메뉴의 게시글을 작성, 수정 또는 삭제합니다.
          </p>
        </div>
        
        {activeSubTab === "write" && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPreview(!isPreview)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5",
                isPreview ? "bg-primary text-white border-primary" : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
              )}
            >
              {isPreview ? <Edit className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              {isPreview ? "에디터" : "미리보기"}
            </button>
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="btn-primary py-2 px-8 text-xs flex items-center gap-2"
            >
              {isPublishing ? <Plus className="w-3.5 h-3.5" /> : null}
              {isPublishing ? "발행 중..." : editPostId ? "수정 완료" : "발행하기"}
            </button>
            {editPostId && (
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold transition-all"
              >
                수정 취소
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-4 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveSubTab("write")}
          className={cn(
            "text-xs font-bold pb-2 px-1 border-b-2 transition-all",
            activeSubTab === "write" 
              ? "border-primary text-primary font-black" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {editPostId ? "콘텐츠 수정" : "새 콘텐츠 작성"}
        </button>
        <button
          onClick={() => setActiveSubTab("manage")}
          className={cn(
            "text-xs font-bold pb-2 px-1 border-b-2 transition-all",
            activeSubTab === "manage" 
              ? "border-primary text-primary font-black" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          기존 등록글 관리
        </button>
      </div>

      {activeSubTab === "manage" ? (
        <div className="glass-card rounded-2xl overflow-hidden">
          {postsLoading ? (
            <div className="py-20 text-center animate-pulse text-muted-foreground font-bold">
              콘텐츠 목록을 불러오는 중...
            </div>
          ) : posts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] text-muted-foreground uppercase tracking-widest border-b border-white/[0.06] bg-white/[0.02]">
                    <th className="text-left px-5 py-4 font-bold">제목</th>
                    <th className="text-left px-3 py-4 font-bold">세부 카테고리</th>
                    <th className="text-center px-3 py-4 font-bold">조회수</th>
                    <th className="text-center px-3 py-4 font-bold">작성일</th>
                    <th className="text-right px-5 py-4 font-bold">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {posts.map(p => (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4 font-bold truncate max-w-[300px]" title={p.title}>
                        <span dangerouslySetInnerHTML={{ __html: p.title }} />
                      </td>
                      <td className="px-3 py-4">
                        {p.tags ? (
                          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                            {p.tags}
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground italic">없음</span>
                        )}
                      </td>
                      <td className="px-3 py-4 text-center text-muted-foreground">
                        {(p.views || 0).toLocaleString()}
                      </td>
                      <td className="px-3 py-4 text-center text-muted-foreground text-xs">
                        {p.date ? new Date(p.date).toISOString().split('T')[0] : "-"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(p)}
                            className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                            title="수정"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(p.id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-all"
                            title="삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-20 text-center text-muted-foreground">
              등록된 게시글이 없습니다.
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Bulk Upload Section */}
          <div className="glass-card rounded-2xl p-6 border-dashed border-white/10 bg-white/[0.01] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-black">대량 게시글 업로드</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">CSV 파일을 업로드하여 여러 개의 {categoryName} 게시글을 한 번에 등록합니다.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const csvContent = "title,content,subCategory,image\n\"샘플 제목 1\",\"<p>HTML 내용이 들어갈 수 있습니다.</p>\",\"분류1\",\"https://example.com/image1.jpg\"\n\"샘플 제목 2\",\"<p>두 번째 글 내용입니다.</p>\",\"분류2\",";
                  const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.setAttribute("href", url);
                  link.setAttribute("download", `sample_bulk_upload_${type}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] font-bold hover:bg-white/10 transition-all"
              >
                <Download className="w-3.5 h-3.5" /> 샘플 파일 다운로드
              </button>
              <div className="relative">
                <input
                  type="file"
                  accept=".csv,.json"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    const reader = new FileReader();
                    reader.onload = async (event) => {
                      const text = event.target?.result as string;
                      let parsed: any[] = [];
                      if (file.name.toLowerCase().endsWith('.json')) {
                        try {
                          const json = JSON.parse(text);
                          parsed = Array.isArray(json) ? json : [json];
                        } catch (e) {
                          alert("JSON 형식이 올바르지 않습니다.");
                          return;
                        }
                      } else {
                        parsed = parseCSV(text);
                      }
                      if (parsed.length === 0) {
                        alert("데이터가 없거나 형식이 잘못되었습니다.");
                        return;
                      }
                      
                      if (!confirm(`${parsed.length}개의 게시글을 업로드하시겠습니까?`)) return;
                      
                      setIsPublishing(true);
                      try {
                        const res = await fetch('/api/admin/posts/bulk', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ posts: parsed, category: type })
                        });
                        const data = await res.json();
                        if (data.success) {
                          alert(data.message);
                        } else {
                          alert(data.error);
                        }
                      } catch (err) {
                        alert("업로드 중 오류가 발생했습니다.");
                      } finally {
                        setIsPublishing(false);
                        e.target.value = '';
                      }
                    };
                    reader.readAsText(file);
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 text-white text-[11px] font-black hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">
                  <Upload className="w-3.5 h-3.5" /> CSV/JSON 파일 업로드
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="glass-card rounded-2xl p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">제목</label>
                  <input 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    placeholder={`${categoryName} 제목을 입력하세요`} 
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-all" 
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <div className="flex items-center gap-4">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">본문 {isPreview && "(미리보기)"}</label>
                      <label className="text-xs font-bold text-muted-foreground cursor-pointer flex items-center gap-1.5 select-none">
                        <input
                          type="checkbox"
                          checked={isHtml}
                          onChange={e => setIsHtml(e.target.checked)}
                          className="rounded border-white/10 bg-white/5 text-primary focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                        />
                        <span>HTML 형식으로 작성</span>
                      </label>
                    </div>
                    {!isPreview && (
                      <span className="text-[10px] text-muted-foreground italic">
                        {isHtml ? "* HTML 태그가 그대로 렌더링됩니다." : "* 마크다운 기법 및 일반 텍스트 줄바꿈이 자동 지원됩니다."}
                      </span>
                    )}
                  </div>
                  {isPreview ? (
                    <div 
                      className="w-full min-h-[500px] bg-white/[0.02] border border-white/10 rounded-xl px-6 py-6 prose prose-invert prose-sm max-w-none overflow-y-auto"
                      dangerouslySetInnerHTML={{ __html: isHtml ? content : formatContent(content) || "<p class='text-muted-foreground italic text-center py-20'>내용이 없습니다.</p>" }}
                    />
                  ) : (
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="내용을 입력하세요..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-primary/50 transition-all min-h-[500px] font-mono leading-relaxed"
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="glass-card rounded-2xl p-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">세부 카테고리</label>
                    <button 
                      onClick={() => setIsManageModalOpen(true)}
                      className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-lg"
                    >
                      <Edit className="w-2.5 h-2.5" /> 관리
                    </button>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {subOptions.length > 0 ? (
                      subOptions.map(c => (
                        <button 
                          key={c.id} 
                          onClick={() => setSubCategory(c.name)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                            subCategory === c.name 
                              ? (c.name === "사기주의" ? "bg-red-500/20 text-red-400 border-red-500/50" : "bg-primary/20 text-primary border-primary/50")
                              : (c.name === "사기주의" ? "border-red-500/20 bg-red-500/5 text-red-400/70 hover:bg-red-500/10 hover:text-red-400" : "border-white/10 bg-white/5 hover:bg-primary/10 hover:text-primary hover:border-primary/20")
                          )}
                        >
                          {c.name}
                        </button>
                      ))
                    ) : (
                      <p className="text-[10px] text-muted-foreground py-1 italic">등록된 카테고리가 없습니다.</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">대표 이미지</label>
                  <div className="relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setImageBase64(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer block w-full aspect-video bg-white/5 border border-dashed border-white/20 rounded-xl overflow-hidden hover:bg-white/10 transition-all flex flex-col items-center justify-center"
                    >
                      {imageBase64 ? (
                        <img src={imageBase64} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Star className="w-5 h-5 opacity-20" />
                          <span className="text-[10px] font-bold">대표 이미지 선택</span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="glass-card p-6 rounded-2xl bg-primary/[0.03] border-primary/10">
                <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Info className="w-3 h-3" /> 관리자 팁
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {categoryName} 메뉴는 HTML을 직접 입력하거나 일반 글자 및 마크다운 표기로 작성할 수 있습니다. 줄바꿈이 정상적으로 표시됩니다.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {isManageModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-in">
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div>
                <h3 className="font-black text-lg">{categoryName} 카테고리 관리</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">글 작성 시 선택 가능한 세부 분류를 관리합니다</p>
              </div>
              <button onClick={() => setIsManageModalOpen(false)} className="text-muted-foreground hover:text-white p-2 hover:bg-white/5 rounded-xl transition-all">✕</button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <CategoryManagementView initialType={type} hideHeader={true} />
            </div>
            <div className="p-4 border-t border-white/10 flex justify-end bg-black/20">
              <button onClick={() => setIsManageModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all">닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function CategoryManagementView({ initialType, hideHeader }: { initialType?: string; hideHeader?: boolean }) {
  const [categories, setCategories] = useState<any[]>([]);
  const [activeType, setActiveType] = useState(initialType || "notices");
  const [isLoading, setIsLoading] = useState(true);
  const [newCatName, setNewCatName] = useState("");
  const [newCatNameEn, setNewCatNameEn] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editNameEn, setEditNameEn] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [editDesc, setEditDesc] = useState("");

  // Menu types state
  const [menuTypes, setMenuTypes] = useState<any[]>([]);
  const [isMenuMode, setIsMenuMode] = useState(false);
  const [menuIsLoading, setMenuIsLoading] = useState(true);

  // New menu form state
  const [newMenuId, setNewMenuId] = useState("");
  const [newMenuLabel, setNewMenuLabel] = useState("");
  const [newMenuLabelEn, setNewMenuLabelEn] = useState("");
  const [newMenuIcon, setNewMenuIcon] = useState("HelpCircle");
  const [newMenuHref, setNewMenuHref] = useState("");
  const [newMenuDesc, setNewMenuDesc] = useState("");
  const [newMenuIsAdminWrite, setNewMenuIsAdminWrite] = useState(false);

  // Edit menu form state
  const [editingMenuId, setEditingMenuId] = useState<number | null>(null);
  const [editMenuIdStr, setEditMenuIdStr] = useState("");
  const [editMenuLabel, setEditMenuLabel] = useState("");
  const [editMenuLabelEn, setEditMenuLabelEn] = useState("");
  const [editMenuIcon, setEditMenuIcon] = useState("HelpCircle");
  const [editMenuHref, setEditMenuHref] = useState("");
  const [editMenuDesc, setEditMenuDesc] = useState("");
  const [editMenuIsAdminWrite, setEditMenuIsAdminWrite] = useState(false);

  const fetchMenuTypes = async () => {
    setMenuIsLoading(true);
    try {
      const res = await fetch('/api/menus');
      const data = await res.json();
      if (data.success && data.menus && data.menus.length > 0) {
        setMenuTypes(data.menus);
        if (!initialType) {
          const exists = data.menus.some((m: any) => m.menuId === activeType);
          if (!exists) {
            setActiveType(data.menus[0].menuId);
          }
        }
      } else {
        // Fallback to static default menus if DB table is empty or error occurs
        const DEFAULT_TYPES = [
          { menuId: "analysis", label: "분석/결과", labelEn: "Prediction/Result", icon: "BarChart3", href: "/analysis", sortOrder: 30, isAdminWrite: 0 },
          { menuId: "spotlight", label: "스포트라이트", labelEn: "Spotlight", icon: "Star", href: "/spotlight", sortOrder: 40, isAdminWrite: 1 },
          { menuId: "concepts", label: "개념 탑재", labelEn: "Concepts", icon: "Lightbulb", href: "/concepts", sortOrder: 50, isAdminWrite: 0 },
          { menuId: "community", label: "커뮤니티", labelEn: "Forum", icon: "Users", href: "/community", sortOrder: 60, isAdminWrite: 0 },
          { menuId: "guide", label: "가이드", labelEn: "Guide", icon: "BookOpen", href: "/guide", sortOrder: 70, isAdminWrite: 1 },
          { menuId: "qna", label: "Q&A", labelEn: "Q&A", icon: "HelpCircle", href: "/qna", sortOrder: 75, isAdminWrite: 0 },
          { menuId: "notices", label: "공지/이슈", labelEn: "Notices", icon: "Bell", href: "/notices", sortOrder: 80, isAdminWrite: 1 }
        ];
        setMenuTypes(DEFAULT_TYPES);
        if (!initialType && !DEFAULT_TYPES.some((m: any) => m.menuId === activeType)) {
          setActiveType(DEFAULT_TYPES[0].menuId);
        }
      }
    } catch (e) {
      console.error(e);
      // Fallback in case of fetch errors
      const DEFAULT_TYPES = [
        { menuId: "analysis", label: "분석/결과", labelEn: "Prediction/Result", icon: "BarChart3", href: "/analysis", sortOrder: 30, isAdminWrite: 0 },
        { menuId: "spotlight", label: "스포트라이트", labelEn: "Spotlight", icon: "Star", href: "/spotlight", sortOrder: 40, isAdminWrite: 1 },
        { menuId: "concepts", label: "개념 탑재", labelEn: "Concepts", icon: "Lightbulb", href: "/concepts", sortOrder: 50, isAdminWrite: 0 },
        { menuId: "community", label: "커뮤니티", labelEn: "Forum", icon: "Users", href: "/community", sortOrder: 60, isAdminWrite: 0 },
        { menuId: "guide", label: "가이드", labelEn: "Guide", icon: "BookOpen", href: "/guide", sortOrder: 70, isAdminWrite: 1 },
        { menuId: "qna", label: "Q&A", labelEn: "Q&A", icon: "HelpCircle", href: "/qna", sortOrder: 75, isAdminWrite: 0 },
        { menuId: "notices", label: "공지/이슈", labelEn: "Notices", icon: "Bell", href: "/notices", sortOrder: 80, isAdminWrite: 1 }
      ];
      setMenuTypes(DEFAULT_TYPES);
      if (!initialType && !DEFAULT_TYPES.some((m: any) => m.menuId === activeType)) {
        setActiveType(DEFAULT_TYPES[0].menuId);
      }
    } finally {
      setMenuIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/categories?type=${activeType}`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuTypes();
  }, []);

  useEffect(() => {
    if (activeType && !isMenuMode) {
      fetchCategories();
    }
  }, [activeType, isMenuMode]);

  const handleAdd = async () => {
    if (!newCatName) return;
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: activeType, name: newCatName, nameEn: newCatNameEn, description: newCatDesc }),
      });
      const data = await res.json();
      if (data.success) {
        setNewCatName("");
        setNewCatNameEn("");
        setNewCatDesc("");
        fetchCategories();
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editName) return;
    try {
      const res = await fetch("/api/admin/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: editName, nameEn: editNameEn, description: editDesc }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingId(null);
        fetchCategories();
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말 이 카테고리를 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchCategories();
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleInitializeDefaultMenus = async () => {
    if (!confirm("기본 메뉴 데이터를 데이터베이스에 초기화(생성)하시겠습니까?\n이 작업은 D1 데이터베이스의 main_menus 테이블에 기본 메뉴 데이터를 등록합니다.")) return;
    try {
      const defaultMenus = [
        { menuId: 'home', label: '홈', labelEn: 'Home', icon: 'Home', href: '/', sortOrder: 10, isAdminWrite: 0 },
        { menuId: 'odds', label: '배당/경기', labelEn: 'Odds', icon: 'TrendingUp', href: '/odds', sortOrder: 20, isAdminWrite: 0 },
        { menuId: 'virtual-betting', label: '가상 배팅', labelEn: 'Virtual Bet', icon: 'Trophy', href: '/virtual-betting', sortOrder: 25, isAdminWrite: 0 },
        { menuId: 'analysis', label: '분석/결과', labelEn: 'Prediction/Result', icon: 'BarChart3', href: '/analysis', sortOrder: 30, isAdminWrite: 0 },
        { menuId: 'spotlight', label: '스포트라이트', labelEn: 'Spotlight', icon: 'Star', href: '/spotlight', sortOrder: 40, isAdminWrite: 1 },
        { menuId: 'concepts', label: '개념 탑재', labelEn: 'Concepts', icon: 'Lightbulb', href: '/concepts', sortOrder: 50, isAdminWrite: 0 },
        { menuId: 'community', label: '커뮤니티', labelEn: 'Forum', icon: 'Users', href: '/community', sortOrder: 60, isAdminWrite: 0 },
        { menuId: 'point-shop', label: '포인트 상점', labelEn: 'Point Shop', icon: 'Zap', href: '/point-shop', sortOrder: 65, isAdminWrite: 0 },
        { menuId: 'guide', label: '가이드', labelEn: 'Guide', icon: 'BookOpen', href: '/guide', sortOrder: 70, isAdminWrite: 1 },
        { menuId: 'qna', label: 'Q&A', labelEn: 'Q&A', icon: 'HelpCircle', href: '/qna', sortOrder: 75, isAdminWrite: 0 },
        { menuId: 'notices', label: '공지/이슈', labelEn: 'Notices', icon: 'Bell', href: '/notices', sortOrder: 80, isAdminWrite: 1 },
        { menuId: 'mypage', label: '마이페이지', labelEn: 'My Page', icon: 'User', href: '/mypage', sortOrder: 90, isAdminWrite: 0 }
      ];

      for (const menu of defaultMenus) {
        await fetch("/api/admin/menus", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(menu),
        });
      }
      alert("기본 메뉴 데이터가 데이터베이스에 성공적으로 초기화되었습니다.");
      fetchMenuTypes();
    } catch (e) {
      console.error(e);
      alert("초기화 도중 오류가 발생했습니다. D1 데이터베이스에 main_menus 테이블이 정상적으로 생성되었는지 확인해 주세요.");
    }
  };

  const handleAddMenu = async () => {
    if (!newMenuId || !newMenuLabel || !newMenuLabelEn || !newMenuIcon || !newMenuHref) {
      alert("모든 필수 항목을 입력해주세요.");
      return;
    }
    try {
      const nextSortOrder = menuTypes.length > 0 
        ? Math.max(...menuTypes.map((m: any) => m.sortOrder || 0)) + 10 
        : 10;

      const res = await fetch("/api/admin/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menuId: newMenuId,
          label: newMenuLabel,
          labelEn: newMenuLabelEn,
          icon: newMenuIcon,
          href: newMenuHref,
          sortOrder: nextSortOrder,
          description: newMenuDesc,
          isAdminWrite: newMenuIsAdminWrite
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewMenuId("");
        setNewMenuLabel("");
        setNewMenuLabelEn("");
        setNewMenuIcon("HelpCircle");
        setNewMenuHref("");
        setNewMenuDesc("");
        setNewMenuIsAdminWrite(false);
        fetchMenuTypes();
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateMenu = async (id: number) => {
    if (!editMenuIdStr || !editMenuLabel || !editMenuLabelEn || !editMenuIcon || !editMenuHref) {
      alert("모든 필수 항목을 입력해 주세요.");
      return;
    }
    try {
      const res = await fetch("/api/admin/menus", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          menuId: editMenuIdStr,
          label: editMenuLabel,
          labelEn: editMenuLabelEn,
          icon: editMenuIcon,
          href: editMenuHref,
          description: editMenuDesc,
          isAdminWrite: editMenuIsAdminWrite
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingMenuId(null);
        fetchMenuTypes();
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteMenu = async (id: number) => {
    if (!confirm("정말 이 메뉴(게시판)를 삭제하시겠습니까?\n삭제 시 헤더 네비게이션에서 제외되며 복구할 수 없습니다.")) return;
    try {
      const res = await fetch(`/api/admin/menus?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchMenuTypes();
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleMenuVisibility = async (id: number, currentHidden: boolean) => {
    try {
      const res = await fetch("/api/admin/menus", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          isHidden: !currentHidden
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchMenuTypes();
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMoveMenu = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= menuTypes.length) return;

    const updatedMenus = [...menuTypes];
    const tempOrder = updatedMenus[index].sortOrder;
    updatedMenus[index].sortOrder = updatedMenus[targetIndex].sortOrder;
    updatedMenus[targetIndex].sortOrder = tempOrder;

    updatedMenus.sort((a, b) => a.sortOrder - b.sortOrder);
    setMenuTypes(updatedMenus);

    try {
      const res = await fetch('/api/admin/menus', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menus: updatedMenus.map(m => ({ id: m.id, sortOrder: m.sortOrder }))
        })
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.error);
        fetchMenuTypes();
      }
    } catch (e) {
      console.error(e);
      fetchMenuTypes();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {!hideHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight">카테고리 관리</h1>
            <p className="text-sm text-muted-foreground mt-1">각 메뉴별 세부 카테고리와 메인 메뉴 목록을 관리합니다</p>
          </div>
          
          {!hideHeader && (
            <button
              onClick={() => setIsMenuMode(prev => !prev)}
              className={cn(
                "self-start sm:self-auto px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl border transition-all flex items-center gap-1.5",
                isMenuMode 
                  ? "bg-primary/20 text-primary border-primary/30 shadow-[0_0_12px_rgba(239,68,68,0.2)]" 
                  : "bg-white/5 text-muted-foreground border-white/10 hover:text-foreground hover:bg-white/10"
              )}
            >
              <Settings className="w-3.5 h-3.5 animate-spin-slow" />
              <span>{isMenuMode ? "카테고리 관리로 돌아가기" : "메인 메뉴 및 순서 관리"}</span>
            </button>
          )}
        </div>
      )}

      {/* Main Menu Management Mode */}
      {isMenuMode ? (
        <div className="space-y-6">
          {/* Add Menu Form */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-primary flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span>새 메인 메뉴 추가</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              <input
                value={newMenuId}
                onChange={e => setNewMenuId(e.target.value)}
                placeholder="메뉴 ID (예: custom)"
                className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-all"
              />
              <input
                value={newMenuLabel}
                onChange={e => setNewMenuLabel(e.target.value)}
                placeholder="한글 라벨 (예: 자유게시판)"
                className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-all"
              />
              <input
                value={newMenuLabelEn}
                onChange={e => setNewMenuLabelEn(e.target.value)}
                placeholder="영어 라벨 (예: Free Board)"
                className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-all"
              />
              <select
                value={newMenuIcon}
                onChange={e => setNewMenuIcon(e.target.value)}
                className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-all text-muted-foreground"
              >
                <option value="Home" className="bg-neutral-900">Home (홈)</option>
                <option value="TrendingUp" className="bg-neutral-900">TrendingUp (배당)</option>
                <option value="BarChart3" className="bg-neutral-900">BarChart3 (분석)</option>
                <option value="Star" className="bg-neutral-900">Star (스포트라이트)</option>
                <option value="Lightbulb" className="bg-neutral-900">Lightbulb (개념 탑재)</option>
                <option value="Users" className="bg-neutral-900">Users (커뮤니티)</option>
                <option value="BookOpen" className="bg-neutral-900">BookOpen (가이드)</option>
                <option value="Bell" className="bg-neutral-900">Bell (공지)</option>
                <option value="HelpCircle" className="bg-neutral-900">HelpCircle (Q&A)</option>
                <option value="Trophy" className="bg-neutral-900">Trophy (트로피)</option>
                <option value="Shield" className="bg-neutral-900">Shield (방패)</option>
                <option value="Zap" className="bg-neutral-900">Zap (번개)</option>
                <option value="Flame" className="bg-neutral-900">Flame (불꽃)</option>
              </select>
              <input
                value={newMenuHref}
                onChange={e => setNewMenuHref(e.target.value)}
                placeholder="경로 (예: /custom)"
                className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-all"
              />
              <input
                value={newMenuDesc}
                onChange={e => setNewMenuDesc(e.target.value)}
                placeholder="게시판 설명 (메인 메뉴 표출용)"
                className="col-span-1 md:col-span-3 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
              <div className="flex items-center gap-2 ml-1">
                <label className="text-xs font-bold text-muted-foreground cursor-pointer flex items-center gap-2 select-none">
                  <input
                    type="checkbox"
                    checked={newMenuIsAdminWrite}
                    onChange={e => setNewMenuIsAdminWrite(e.target.checked)}
                    className="rounded border-white/10 bg-white/5 text-primary focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <span>관리자 전용 작성 콘텐츠 메뉴로 설정 (예: 공지사항, 가이드 등)</span>
                </label>
              </div>
              <button
                onClick={handleAddMenu}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.2)] self-end sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>메뉴 추가</span>
              </button>
            </div>
          </div>

          {/* Menu List */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-muted-foreground">메인 메뉴 목록 및 순서 관리</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleInitializeDefaultMenus}
                  className="px-3 py-1 bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground text-[10px] font-bold rounded border border-white/10 transition-all animate-pulse hover:animate-none"
                >
                  기본 메뉴 데이터 초기화
                </button>
                <span className="text-[10px] text-muted-foreground bg-white/5 px-2.5 py-1 rounded-md border border-white/5">정렬 순서(sortOrder) 기준 정렬됨</span>
              </div>
            </div>

            {menuIsLoading ? (
              <div className="text-center py-10 text-muted-foreground animate-pulse">불러오는 중...</div>
            ) : (
              <div className="space-y-3">
                {menuTypes.map((m, idx) => (
                  <div key={m.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:bg-white/[0.04] transition-all group gap-4">
                    {editingMenuId === m.id ? (
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
                        <input
                          value={editMenuIdStr}
                          onChange={e => setEditMenuIdStr(e.target.value)}
                          className="px-3 py-1.5 bg-black/40 border border-primary/30 rounded-lg text-xs focus:outline-none text-foreground"
                          placeholder="메뉴 ID"
                        />
                        <input
                          value={editMenuLabel}
                          onChange={e => setEditMenuLabel(e.target.value)}
                          className="px-3 py-1.5 bg-black/40 border border-primary/30 rounded-lg text-xs focus:outline-none text-foreground"
                          placeholder="한글 라벨"
                        />
                        <input
                          value={editMenuLabelEn}
                          onChange={e => setEditMenuLabelEn(e.target.value)}
                          className="px-3 py-1.5 bg-black/40 border border-primary/30 rounded-lg text-xs focus:outline-none text-foreground"
                          placeholder="영어 라벨"
                        />
                        <select
                          value={editMenuIcon}
                          onChange={e => setEditMenuIcon(e.target.value)}
                          className="px-3 py-1.5 bg-black/40 border border-primary/30 rounded-lg text-xs focus:outline-none text-muted-foreground"
                        >
                          <option value="Home">Home</option>
                          <option value="TrendingUp">TrendingUp</option>
                          <option value="BarChart3">BarChart3</option>
                          <option value="Star">Star</option>
                          <option value="Lightbulb">Lightbulb</option>
                          <option value="Users">Users</option>
                          <option value="BookOpen">BookOpen</option>
                          <option value="Bell">Bell</option>
                          <option value="HelpCircle">HelpCircle</option>
                          <option value="Trophy">Trophy</option>
                          <option value="Shield">Shield</option>
                          <option value="Zap">Zap</option>
                          <option value="Flame">Flame</option>
                        </select>
                        <input
                          value={editMenuHref}
                          onChange={e => setEditMenuHref(e.target.value)}
                          className="px-3 py-1.5 bg-black/40 border border-primary/30 rounded-lg text-xs focus:outline-none text-foreground"
                          placeholder="경로"
                        />
                        <input
                          value={editMenuDesc}
                          onChange={e => setEditMenuDesc(e.target.value)}
                          className="col-span-1 sm:col-span-2 md:col-span-5 px-3 py-1.5 bg-black/40 border border-primary/30 rounded-lg text-xs focus:outline-none text-foreground mt-1"
                          placeholder="메인 메뉴 설명"
                        />
                        <div className="col-span-1 sm:col-span-2 md:col-span-5 flex items-center gap-2 mt-1 ml-1">
                          <label className="text-[11px] font-bold text-muted-foreground cursor-pointer flex items-center gap-1.5 select-none">
                            <input
                              type="checkbox"
                              checked={editMenuIsAdminWrite}
                              onChange={e => setEditMenuIsAdminWrite(e.target.checked)}
                              className="rounded border-white/10 bg-white/5 text-primary focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                            />
                            <span>관리자 전용 작성 콘텐츠 메뉴로 설정</span>
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-black">
                          {idx + 1}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 flex-1">
                          <div>
                            <span className="text-[10px] text-muted-foreground/60 block font-bold">한글 라벨 (ID)</span>
                            <span className="text-sm font-bold text-foreground flex items-center gap-1.5 flex-wrap">
                              {m.label} 
                              <span className="text-xs text-muted-foreground">({m.menuId})</span>
                              {m.isHidden === 1 && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/20">
                                  숨김
                                </span>
                              )}
                              {m.isAdminWrite === 1 && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                                  관리자 전용 작성
                                </span>
                              )}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground/60 block font-bold">영어 라벨 (아이콘)</span>
                            <span className="text-xs font-bold text-muted-foreground">{m.labelEn} <span className="text-[10px] text-primary/80">({m.icon})</span></span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-[10px] text-muted-foreground/60 block font-bold">링크 경로</span>
                            <span className="text-xs font-mono text-muted-foreground/80">{m.href}</span>
                          </div>
                          {m.description && (
                            <div className="col-span-2 md:col-span-4 mt-1">
                              <span className="text-[10px] text-muted-foreground/60 block font-bold">설명</span>
                              <span className="text-xs text-muted-foreground/80">{m.description}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {/* Order Buttons */}
                      {!editingMenuId && (
                        <div className="flex items-center bg-white/5 rounded-lg border border-white/10 p-0.5">
                          <button
                            disabled={idx === 0}
                            onClick={() => handleMoveMenu(idx, 'up')}
                            className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:hover:text-muted-foreground transition-all"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <div className="w-px h-3 bg-white/10" />
                          <button
                            disabled={idx === menuTypes.length - 1}
                            onClick={() => handleMoveMenu(idx, 'down')}
                            className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:hover:text-muted-foreground transition-all"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1">
                        {editingMenuId === m.id ? (
                          <>
                            <button
                              onClick={() => handleUpdateMenu(m.id)}
                              className="p-2 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-all"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingMenuId(null)}
                              className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleToggleMenuVisibility(m.id, m.isHidden === 1)}
                              title={m.isHidden === 1 ? "메인 사이트에 표시하기" : "메인 사이트에서 숨기기"}
                              className={cn(
                                "p-2 rounded-lg transition-all",
                                m.isHidden === 1
                                  ? "text-orange-400 hover:bg-orange-400/10"
                                  : "text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10"
                              )}
                            >
                              {m.isHidden === 1 ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => {
                                setEditingMenuId(m.id);
                                setEditMenuIdStr(m.menuId);
                                setEditMenuLabel(m.label);
                                setEditMenuLabelEn(m.labelEn);
                                setEditMenuIcon(m.icon);
                                setEditMenuHref(m.href);
                                setEditMenuDesc(m.description || "");
                                setEditMenuIsAdminWrite(m.isAdminWrite === 1);
                              }}
                              className="p-2 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-all"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteMenu(m.id)}
                              className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {menuTypes.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground text-sm">등록된 메뉴가 없습니다.</div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Subcategory Management Mode */
        <div className="space-y-6">
          {!hideHeader && (
            <div className="flex items-center gap-2 border-b border-white/[0.06] pb-1 overflow-x-auto whitespace-nowrap">
              {menuTypes.map(t => (
                <button
                  key={t.menuId}
                  onClick={() => setActiveType(t.menuId)}
                  className={cn(
                    "px-4 py-2 text-sm font-bold transition-all relative shrink-0",
                    activeType === t.menuId ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t.label}
                  {activeType === t.menuId && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="glass-card rounded-2xl p-6 space-y-6">
            <div className="flex gap-2">
              <div className="flex-1 flex flex-col sm:flex-row gap-2">
                <input
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  placeholder="새 카테고리 이름 (한글)..."
                  className="w-full sm:w-1/4 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-all"
                  onKeyDown={e => e.key === "Enter" && handleAdd()}
                />
                <input
                  value={newCatNameEn}
                  onChange={e => setNewCatNameEn(e.target.value)}
                  placeholder="영문 이름 (예: Free Board)..."
                  className="w-full sm:w-1/4 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-all"
                  onKeyDown={e => e.key === "Enter" && handleAdd()}
                />
                <input
                  value={newCatDesc}
                  onChange={e => setNewCatDesc(e.target.value)}
                  placeholder="게시판 성격/설명 (선택, AI 활용 목적 등)..."
                  className="w-full sm:w-2/4 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-all"
                  onKeyDown={e => e.key === "Enter" && handleAdd()}
                />
              </div>
              <button
                onClick={handleAdd}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)]"
              >
                추가
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-10 text-muted-foreground animate-pulse">불러오는 중...</div>
            ) : (
              <div className="space-y-2">
                {categories.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:bg-white/[0.04] transition-all group">
                    {editingId === cat.id ? (
                      <div className="flex-1 flex flex-col sm:flex-row gap-2 pr-4">
                        <input
                          autoFocus
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          placeholder="카테고리 한글명"
                          className="w-full sm:w-1/4 px-3 py-1.5 bg-black/40 border border-primary/30 rounded-lg text-sm focus:outline-none text-foreground"
                          onKeyDown={e => {
                            if (e.key === "Enter") handleUpdate(cat.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                        />
                        <input
                          value={editNameEn}
                          onChange={e => setEditNameEn(e.target.value)}
                          placeholder="카테고리 영문명"
                          className="w-full sm:w-1/4 px-3 py-1.5 bg-black/40 border border-primary/30 rounded-lg text-sm focus:outline-none text-foreground"
                          onKeyDown={e => {
                            if (e.key === "Enter") handleUpdate(cat.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                        />
                        <input
                          value={editDesc}
                          onChange={e => setEditDesc(e.target.value)}
                          placeholder="설명"
                          className="w-full sm:w-2/4 px-3 py-1.5 bg-black/40 border border-primary/30 rounded-lg text-sm focus:outline-none text-foreground"
                          onKeyDown={e => {
                            if (e.key === "Enter") handleUpdate(cat.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <span className={cn("font-bold text-sm flex items-center gap-2", cat.name === "사기주의" && "text-red-400")}>
                          <span>{cat.name}</span>
                          {cat.nameEn && <span className="text-xs text-muted-foreground font-normal">({cat.nameEn})</span>}
                          {cat.name === "사기주의" && <span className="text-[10px] bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 uppercase font-black">고정</span>}
                        </span>
                        {cat.description && (
                          <span className="text-xs text-muted-foreground mt-0.5">
                            {cat.description}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {editingId === cat.id ? (
                        <>
                          <button onClick={() => handleUpdate(cat.id)} className="p-1.5 text-emerald-400 hover:bg-emerald-400/10 rounded-lg"><Plus className="w-4 h-4" /></button>
                          <button onClick={() => setEditingId(null)} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg"><LogOut className="w-4 h-4 rotate-180" /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditingId(cat.id); setEditName(cat.name); setEditNameEn(cat.nameEn || ""); setEditDesc(cat.description || ""); }} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-all"><Edit className="w-3.5 h-3.5" /></button>
                          {cat.name !== "사기주의" && (
                            <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {categories.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground text-sm">등록된 카테고리가 없습니다.</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface PopupSetting {
  id: number;
  isActive: boolean;
  title: string;
  htmlContent: string;
  image: string;
  linkUrl: string;
  position: 'top-left' | 'top-center' | 'top-right' | 'center' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

const DEFAULT_POPUPS: PopupSetting[] = Array.from({ length: 5 }, (_, i) => ({
  id: i + 1,
  isActive: false,
  title: `팝업창 #${i + 1}`,
  htmlContent: "",
  image: "",
  linkUrl: "",
  position: "center"
}));

function SettingsView({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [settings, setSettings] = useState({
    top_bar_message: "",
    top_bar_message_en: "",
    footer_description: "",
    footer_copyright: "",
    trust_stat_1_label: "활성 회원",
    trust_stat_1_value: "12,847",
    trust_stat_2_label: "오늘 경기",
    trust_stat_2_value: "319개",
    trust_stat_3_label: "평균 평점",
    trust_stat_3_value: "4.3 / 5",
    trust_stat_4_label: "오늘 게시글",
    trust_stat_4_value: "234건",
    community_prefixes: ""
  });
  const [leaderboardUsers, setLeaderboardUsers] = useState<any[]>([
    { rank: 1, nickname: "ProBettor", badge: "Expert", points: 2840, streak: 12 },
    { rank: 2, nickname: "분석왕", badge: "MVP", points: 2650, streak: 8 },
    { rank: 3, nickname: "DataWiz", badge: "Expert", points: 2420, streak: 15 },
    { rank: 4, nickname: "e스포츠매니아", badge: "Analyst", points: 1980, streak: 6 },
    { rank: 5, nickname: "야구덕후", badge: "Streak", points: 1750, streak: 10 }
  ]);
  const [popularTags, setPopularTags] = useState<string>(
    "EPL, K리그, LCK, KBO, MLB, 배당분석, 핸디캡, 라이브, 오버언더, 축구, 야구, e스포츠, 전략, 피나클"
  );
  const [popups, setPopups] = useState<PopupSetting[]>(DEFAULT_POPUPS);
  const [activePopupIndex, setActivePopupIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.success) {
          setSettings(prev => ({
            ...prev,
            ...data.settings
          }));

          if (data.settings.popups) {
            try {
              const parsed = JSON.parse(data.settings.popups);
              if (Array.isArray(parsed)) {
                const merged = DEFAULT_POPUPS.map(def => {
                  const found = parsed.find((p: any) => p.id === def.id);
                  return found ? { ...def, ...found } : def;
                });
                setPopups(merged);
              }
            } catch (e) {
              console.error("Failed to parse popups setting:", e);
            }
          }

          if (data.settings.leaderboard_users) {
            try {
              const parsed = JSON.parse(data.settings.leaderboard_users);
              if (Array.isArray(parsed)) {
                setLeaderboardUsers(parsed);
              }
            } catch (e) {
              console.error("Failed to parse leaderboard_users setting:", e);
            }
          }

          if (data.settings.popular_tags) {
            setPopularTags(data.settings.popular_tags);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          popups: JSON.stringify(popups),
          leaderboard_users: JSON.stringify(leaderboardUsers),
          popular_tags: popularTags
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("설정이 저장되었습니다.");
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="py-10 text-center animate-pulse font-bold text-muted-foreground">불러오는 중...</div>;

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-black tracking-tight">사이트 설정</h1>
        <p className="text-sm text-muted-foreground mt-1">사이트 전반의 문구 및 설정을 관리합니다</p>
      </div>

      <div className="glass-card rounded-3xl p-8 space-y-8">
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="bg-primary/10 p-2 rounded-xl">
              <Info className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold">상단 바 문구 설정</h3>
              <p className="text-xs text-muted-foreground">헤더 상단에 표시되는 안내 문구를 수정합니다</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">한국어 문구</label>
              <textarea 
                value={settings.top_bar_message}
                onChange={e => setSettings({...settings, top_bar_message: e.target.value})}
                placeholder="한국어 문구를 입력하세요"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-primary/50 transition-all min-h-[80px] resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">영어 문구 (English)</label>
              <textarea 
                value={settings.top_bar_message_en}
                onChange={e => setSettings({...settings, top_bar_message_en: e.target.value})}
                placeholder="English message here"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-primary/50 transition-all min-h-[80px] resize-none"
              />
            </div>
          </div>
        </div>
        <div className="space-y-6 pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="bg-emerald-500/10 p-2 rounded-xl">
              <FileText className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold">푸터(Footer) 정보 설정</h3>
              <p className="text-xs text-muted-foreground">사이트 하단에 표시되는 브랜드 설명과 카피라이트를 수정합니다</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">푸터 설명 문구</label>
              <textarea 
                value={settings.footer_description}
                onChange={e => setSettings({...settings, footer_description: e.target.value})}
                placeholder="푸터 설명 문구를 입력하세요"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-primary/50 transition-all min-h-[100px] resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">카피라이트 (Copyright)</label>
              <input 
                value={settings.footer_copyright}
                onChange={e => setSettings({...settings, footer_copyright: e.target.value})}
                placeholder="© 2026 피나클 커뮤니티..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>
          </div>
        </div>
        <div className="space-y-6 pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="bg-primary/10 p-2 rounded-xl">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold">커뮤니티 말머리 설정</h3>
              <p className="text-xs text-muted-foreground">유저들이 커뮤니티 게시글을 작성할 때 선택할 수 있는 말머리를 등록합니다</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">커뮤니티 말머리 목록 (쉼표로 구분)</label>
              <input 
                value={settings.community_prefixes || ""}
                onChange={e => setSettings({...settings, community_prefixes: e.target.value})}
                placeholder="예: [잡담], [수다], [정보], [질문]"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-all"
              />
              <p className="text-[10px] text-muted-foreground mt-1">입력된 말머리는 유저 글쓰기 화면에서 버튼 형식으로 제공됩니다.</p>
            </div>
          </div>
        </div>
        <div className="space-y-6 pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="bg-blue-500/10 p-2 rounded-xl">
              <Award className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold">메인 페이지 신뢰 지표 설정</h3>
              <p className="text-xs text-muted-foreground">메인 히어로 섹션 아래 4개의 통계 지표를 수정합니다</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                    {num}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">지표 {num}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">라벨 (이름)</label>
                    <input 
                      value={(settings as any)[`trust_stat_${num}_label`]}
                      onChange={e => setSettings({...settings, [`trust_stat_${num}_label`]: e.target.value})}
                      placeholder="활성 회원"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">수치 (값)</label>
                    <input 
                      value={(settings as any)[`trust_stat_${num}_value`]}
                      onChange={e => setSettings({...settings, [`trust_stat_${num}_value`]: e.target.value})}
                      placeholder="12,847"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50 transition-all font-bold text-blue-400"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6 pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="bg-primary/10 p-2 rounded-xl">
              <Layers className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold">사이트 팝업창 설정</h3>
              <p className="text-xs text-muted-foreground">사이트 메인화면/전체화면에 표시될 팝업을 설정합니다 (최대 5개)</p>
            </div>
          </div>

          {/* Popup Index Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-white/[0.04] pb-2">
            {popups.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePopupIndex(idx)}
                className={cn(
                  "px-4 py-2 text-xs font-black rounded-lg transition-all border flex items-center gap-2",
                  activePopupIndex === idx
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"
                )}
              >
                <span>#{p.id} {p.title || `팝업 ${p.id}`}</span>
                {p.isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
              </button>
            ))}
          </div>

          {/* Active Popup Settings Form */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title & Position */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">활성화 여부</label>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...popups];
                      updated[activePopupIndex].isActive = !updated[activePopupIndex].isActive;
                      setPopups(updated);
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-black border transition-all",
                      popups[activePopupIndex].isActive
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : "bg-white/5 border-white/10 text-muted-foreground"
                    )}
                  >
                    {popups[activePopupIndex].isActive ? "활성화 됨" : "비활성화 됨"}
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">팝업 제목</label>
                  <input
                    value={popups[activePopupIndex].title}
                    onChange={e => {
                      const updated = [...popups];
                      updated[activePopupIndex].title = e.target.value;
                      setPopups(updated);
                    }}
                    placeholder="팝업 제목 (관리용)"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-all font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">클릭 이동 링크 (URL)</label>
                  <input
                    value={popups[activePopupIndex].linkUrl}
                    onChange={e => {
                      const updated = [...popups];
                      updated[activePopupIndex].linkUrl = e.target.value;
                      setPopups(updated);
                    }}
                    placeholder="https://example.com (생략 시 링크 미제공)"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">화면 노출 위치 (Position)</label>
                  <select
                    value={popups[activePopupIndex].position}
                    onChange={e => {
                      const updated = [...popups];
                      updated[activePopupIndex].position = e.target.value as any;
                      setPopups(updated);
                    }}
                    className="w-full bg-[#181d2a] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-all text-foreground font-bold"
                  >
                    <option value="center">중앙 화면 (Center)</option>
                    <option value="top-left">좌측 상단 (Top-Left)</option>
                    <option value="top-center">중앙 상단 (Top-Center)</option>
                    <option value="top-right">우측 상단 (Top-Right)</option>
                    <option value="bottom-left">좌측 하단 (Bottom-Left)</option>
                    <option value="bottom-center">중앙 하단 (Bottom-Center)</option>
                    <option value="bottom-right">우측 하단 (Bottom-Right)</option>
                  </select>
                </div>
              </div>

              {/* Image upload */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">팝업 이미지</label>
                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 2 * 1024 * 1024) {
                          alert("이미지 크기는 2MB 이하여야 합니다.");
                          return;
                        }
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const updated = [...popups];
                          updated[activePopupIndex].image = reader.result as string;
                          setPopups(updated);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                    id={`popup-image-upload-${popups[activePopupIndex].id}`}
                  />
                  <label
                    htmlFor={`popup-image-upload-${popups[activePopupIndex].id}`}
                    className="cursor-pointer block w-full aspect-video bg-white/5 border border-dashed border-white/20 rounded-xl overflow-hidden hover:bg-white/10 transition-all flex flex-col items-center justify-center relative"
                  >
                    {popups[activePopupIndex].image ? (
                      <>
                        <img src={popups[activePopupIndex].image} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const updated = [...popups];
                            updated[activePopupIndex].image = "";
                            setPopups(updated);
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500/80 text-white rounded-lg transition-colors"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Upload className="w-5 h-5 opacity-20" />
                        <span className="text-[10px] font-bold">이미지 선택 (R2 업로드)</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* HTML Editor */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">HTML 내용 (텍스트/공지사항 대체 가능)</label>
              <textarea
                value={popups[activePopupIndex].htmlContent}
                onChange={e => {
                  const updated = [...popups];
                  updated[activePopupIndex].htmlContent = e.target.value;
                  setPopups(updated);
                }}
                rows={5}
                placeholder="<div style='padding: 10px; text-align: center;'>공지사항 내용 등 자유롭게 작성 가능</div>"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-primary/50 transition-all font-mono leading-relaxed resize-none"
              />
            </div>
          </div>
        </div>

        {/* 활동 랭킹 및 인기 태그 설정 */}
        <div className="space-y-6 pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="bg-yellow-500/10 p-2 rounded-xl">
              <TrendingUp className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <h3 className="font-bold">활동 랭킹 설정</h3>
              <p className="text-xs text-muted-foreground">우측 사이드바 또는 리더보드에 표시될 활동 랭킹 유저 목록을 직접 관리합니다.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-[10px] text-muted-foreground uppercase tracking-widest border-b border-white/[0.06] bg-white/[0.02]">
                    <th className="px-4 py-3 font-bold text-center w-16">순위</th>
                    <th className="px-4 py-3 font-bold">닉네임</th>
                    <th className="px-4 py-3 font-bold w-36">뱃지</th>
                    <th className="px-4 py-3 font-bold w-36">활동 점수</th>
                    <th className="px-4 py-3 font-bold w-36">연승 횟수</th>
                    <th className="px-4 py-3 font-bold text-center w-16">삭제</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {leaderboardUsers.map((user, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.01]">
                      <td className="px-4 py-2 text-center">
                        <input 
                          type="number"
                          value={user.rank}
                          onChange={e => {
                            const updated = [...leaderboardUsers];
                            updated[idx].rank = parseInt(e.target.value) || (idx + 1);
                            setLeaderboardUsers(updated);
                          }}
                          className="w-12 text-center bg-black/20 border border-white/10 rounded-lg p-1.5 text-xs text-white"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input 
                          type="text"
                          value={user.nickname}
                          onChange={e => {
                            const updated = [...leaderboardUsers];
                            updated[idx].nickname = e.target.value;
                            setLeaderboardUsers(updated);
                          }}
                          placeholder="닉네임"
                          className="w-full bg-black/20 border border-white/10 rounded-lg p-1.5 text-xs text-white"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <select
                          value={user.badge}
                          onChange={e => {
                            const updated = [...leaderboardUsers];
                            updated[idx].badge = e.target.value;
                            setLeaderboardUsers(updated);
                          }}
                          className="bg-black/20 border border-white/10 rounded-lg p-1.5 text-xs text-white w-full"
                        >
                          <option value="Expert">Expert</option>
                          <option value="MVP">MVP</option>
                          <option value="Analyst">Analyst</option>
                          <option value="Streak">Streak</option>
                          <option value="None">뱃지 없음</option>
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input 
                          type="number"
                          value={user.points}
                          onChange={e => {
                            const updated = [...leaderboardUsers];
                            updated[idx].points = parseInt(e.target.value) || 0;
                            setLeaderboardUsers(updated);
                          }}
                          className="w-full bg-black/20 border border-white/10 rounded-lg p-1.5 text-xs text-white"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input 
                          type="number"
                          value={user.streak}
                          onChange={e => {
                            const updated = [...leaderboardUsers];
                            updated[idx].streak = parseInt(e.target.value) || 0;
                            setLeaderboardUsers(updated);
                          }}
                          className="w-full bg-black/20 border border-white/10 rounded-lg p-1.5 text-xs text-white"
                        />
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button 
                          type="button"
                          onClick={() => {
                            const updated = leaderboardUsers.filter((_, i) => i !== idx);
                            setLeaderboardUsers(updated);
                          }}
                          className="p-1 text-red-400 hover:bg-red-500/10 rounded text-xs"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={() => {
                setLeaderboardUsers([
                  ...leaderboardUsers,
                  { rank: leaderboardUsers.length + 1, nickname: "", badge: "None", points: 0, streak: 0 }
                ]);
              }}
              className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-white rounded-xl transition-all"
            >
              + 랭킹 유저 추가
            </button>
          </div>
        </div>

        <div className="space-y-6 pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="bg-blue-500/10 p-2 rounded-xl">
              <Search className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold">인기 태그 설정</h3>
              <p className="text-xs text-muted-foreground">우측 사이드바에 표시될 인기 태그 목록을 쉼표로 구분하여 관리합니다.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">인기 태그 목록 (쉼표로 구분)</label>
              <textarea 
                value={popularTags}
                onChange={e => setPopularTags(e.target.value)}
                placeholder="EPL, K리그, LCK, KBO..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-primary/50 transition-all min-h-[80px]"
              />
              <p className="text-[10px] text-muted-foreground mt-1">태그 적용 시각적 피드백 미리보기:</p>
              <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-black/20 border border-white/5 mt-2">
                {popularTags.split(",").map(t => t.trim()).filter(Boolean).map((tag, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold rounded-lg">
                    #{tag}
                  </span>
                ))}
                {popularTags.split(",").map(t => t.trim()).filter(Boolean).length === 0 && (
                  <span className="text-xs text-muted-foreground italic">입력된 태그가 없습니다.</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary py-3 px-10 flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <Plus className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
}

function InquiriesView() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInquiries = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/inquiries');
      const data = await res.json();
      if (data.success) {
        setInquiries(data.inquiries);
      } else {
        alert(data.error || "문의 내역을 불러오지 못했습니다.");
      }
    } catch (e) {
      console.error(e);
      alert("오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleOpenReply = (inquiry: any) => {
    setSelectedInquiry(inquiry);
    setAnswer(inquiry.answer || "");
  };

  const handleSubmitReply = async () => {
    if (!answer.trim()) {
      alert("답변 내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedInquiry.id, answer })
      });
      const data = await res.json();
      if (data.success) {
        alert("답변이 등록되었습니다.");
        setSelectedInquiry(null);
        fetchInquiries();
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
      alert("답변 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">1:1 문의 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">사용자들의 1:1 문의를 확인하고 답변합니다</p>
        </div>
        <button onClick={fetchInquiries} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold transition-all">
          새로고침
        </button>
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-muted-foreground text-sm font-bold animate-pulse">
          문의 내역을 불러오는 중...
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] text-muted-foreground uppercase tracking-widest border-b border-white/[0.06] bg-white/[0.02]">
                <th className="text-left px-5 py-4 font-bold">상태</th>
                <th className="text-left px-3 py-4 font-bold">제목</th>
                <th className="text-left px-3 py-4 font-bold">작성자</th>
                <th className="text-center px-3 py-4 font-bold">작성일</th>
                <th className="text-right px-5 py-4 font-bold">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {inquiries.map(i => (
                <tr key={i.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="px-5 py-4">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-1 rounded border",
                      i.status === 'answered' 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                        : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                    )}>
                      {i.status === 'answered' ? '답변 완료' : '답변 대기'}
                    </span>
                  </td>
                  <td className="px-3 py-4 font-bold max-w-[300px] truncate">{i.title}</td>
                  <td className="px-3 py-4 text-muted-foreground">
                    {i.userNickname || i.email || '익명'}
                  </td>
                  <td className="px-3 py-4 text-center text-muted-foreground text-xs">
                    {new Date(i.createdAt).toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button 
                      onClick={() => handleOpenReply(i)}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-all border border-white/10"
                    >
                      {i.status === 'answered' ? '수정/확인' : '답변하기'}
                    </button>
                  </td>
                </tr>
              ))}
              {inquiries.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-muted-foreground text-sm">
                    접수된 문의가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Reply Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-black text-lg">1:1 문의 답변</h3>
              <button onClick={() => setSelectedInquiry(null)} className="text-muted-foreground hover:text-white p-1">✕</button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">문의 내용</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(selectedInquiry.createdAt).toLocaleString()}</span>
                  </div>
                  <h4 className="font-bold text-sm mb-2">{selectedInquiry.title}</h4>
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {selectedInquiry.content}
                  </p>
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">작성자:</span>
                    <span className="text-[10px] font-bold text-white/70">{selectedInquiry.userNickname || selectedInquiry.email || '익명'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">답변 작성</label>
                  <textarea
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    placeholder="문의에 대한 답변을 입력하세요..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-primary/50 transition-all min-h-[200px] leading-relaxed"
                  />
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-white/10 flex justify-end gap-2 bg-black/20">
              <button onClick={() => setSelectedInquiry(null)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:bg-white/5 transition-colors">취소</button>
              <button 
                onClick={handleSubmitReply} 
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(239,68,68,0.2)] disabled:opacity-50"
              >
                {isSubmitting ? '처리 중...' : '답변 저장하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function QnaAdminTabsView() {
  const [subTab, setSubTab] = useState("user-qna"); // "user-qna" | "faq-write"

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl w-fit border border-white/[0.06] mb-4">
        <button
          onClick={() => setSubTab("user-qna")}
          className={cn("px-6 py-2.5 rounded-lg text-sm font-bold transition-all", subTab === "user-qna" ? "bg-red-500 text-white" : "text-muted-foreground hover:text-foreground")}
        >
          사용자 Q&A 관리
        </button>
        <button
          onClick={() => setSubTab("faq-write")}
          className={cn("px-6 py-2.5 rounded-lg text-sm font-bold transition-all", subTab === "faq-write" ? "bg-red-500 text-white" : "text-muted-foreground hover:text-foreground")}
        >
          공식 FAQ 작성
        </button>
      </div>

      {subTab === "faq-write" ? (
        <PostEditorView categoryName="Q&A" categoryType="qna" />
      ) : (
        <AdminUserQnaView />
      )}
    </div>
  );
}

function AdminUserQnaView() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInquiries = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/inquiries');
      const data = await res.json();
      if (data.success) {
        setInquiries(data.inquiries);
      } else {
        alert(data.error || "Q&A 목록을 불러오지 못했습니다.");
      }
    } catch (e) {
      console.error(e);
      alert("오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleOpenReply = (inquiry: any) => {
    setSelectedInquiry(inquiry);
    setAnswer(inquiry.answer || "");
  };

  const handleSubmitReply = async () => {
    if (!answer.trim()) {
      alert("답변 내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedInquiry.id, answer })
      });
      const data = await res.json();
      if (data.success) {
        alert("답변이 등록되었습니다.");
        setSelectedInquiry(null);
        fetchInquiries();
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
      alert("답변 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleShowOnMain = async (id: number, currentVal: number) => {
    try {
      const res = await fetch('/api/admin/inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, showOnMain: currentVal === 1 ? 0 : 1 })
      });
      const data = await res.json();
      if (data.success) {
        fetchInquiries();
      } else {
        alert(data.error || "메인 노출 수정에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
      alert("오류가 발생했습니다.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">사용자 Q&A 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">사용자 질문 내역을 확인하고 답변하며 메인 사이트 노출을 제어합니다</p>
        </div>
        <button onClick={fetchInquiries} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold transition-all">
          새로고침
        </button>
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-muted-foreground text-sm font-bold animate-pulse">
          질문 목록을 불러오는 중...
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] text-muted-foreground uppercase tracking-widest border-b border-white/[0.06] bg-white/[0.02]">
                <th className="text-left px-5 py-4 font-bold">상태</th>
                <th className="text-center px-3 py-4 font-bold">메인 노출</th>
                <th className="text-left px-3 py-4 font-bold">제목</th>
                <th className="text-left px-3 py-4 font-bold">작성자</th>
                <th className="text-center px-3 py-4 font-bold">작성일</th>
                <th className="text-right px-5 py-4 font-bold">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {inquiries.map(i => (
                <tr key={i.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="px-5 py-4">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-1 rounded border",
                      i.status === 'answered' 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                        : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                    )}>
                      {i.status === 'answered' ? '답변 완료' : '답변 대기'}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-center">
                    <button
                      disabled={i.status !== 'answered'}
                      onClick={() => handleToggleShowOnMain(i.id, i.showOnMain || 0)}
                      className={cn(
                        "inline-flex items-center justify-center p-1 rounded-lg transition-colors",
                        i.status !== 'answered' ? "opacity-30 cursor-not-allowed" : "hover:bg-white/5"
                      )}
                    >
                      {i.showOnMain === 1 ? (
                        <ToggleRight className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-muted-foreground" />
                      )}
                    </button>
                  </td>
                  <td className="px-3 py-4 font-bold max-w-[300px] truncate">{i.title}</td>
                  <td className="px-3 py-4 text-muted-foreground">
                    {i.userNickname || i.email || '익명'}
                  </td>
                  <td className="px-3 py-4 text-center text-muted-foreground text-xs">
                    {new Date(i.createdAt).toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button 
                      onClick={() => handleOpenReply(i)}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-all border border-white/10"
                    >
                      {i.status === 'answered' ? '수정/확인' : '답변하기'}
                    </button>
                  </td>
                </tr>
              ))}
              {inquiries.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-muted-foreground text-sm">
                    접수된 질문이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Reply Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-black text-lg">사용자 Q&A 답변</h3>
              <button onClick={() => setSelectedInquiry(null)} className="text-muted-foreground hover:text-white p-1">✕</button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">질문 내용</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(selectedInquiry.createdAt).toLocaleString()}</span>
                  </div>
                  <h4 className="font-bold text-sm mb-2">{selectedInquiry.title}</h4>
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {selectedInquiry.content}
                  </p>
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">작성자:</span>
                    <span className="text-[10px] font-bold text-white/70">{selectedInquiry.userNickname || selectedInquiry.email || '익명'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">답변 작성</label>
                  <textarea
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    placeholder="질문에 대한 답변을 입력하세요..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-primary/50 transition-all min-h-[200px] leading-relaxed"
                  />
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-white/10 flex justify-end gap-2 bg-black/20">
              <button onClick={() => setSelectedInquiry(null)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:bg-white/5 transition-colors">취소</button>
              <button 
                onClick={handleSubmitReply} 
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(239,68,68,0.2)] disabled:opacity-50"
              >
                {isSubmitting ? '처리 중...' : '답변 저장하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PolicyManagementView() {
  const [policies, setPolicies] = useState({
    policy_terms: "",
    policy_privacy: "",
    policy_scam: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activePolicy, setActivePolicy] = useState("terms");

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.success) {
          setPolicies(prev => ({
            ...prev,
            ...data.settings
          }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPolicies();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policies)
      });
      const data = await res.json();
      if (data.success) {
        alert("정책이 저장되었습니다.");
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="py-20 text-center animate-pulse font-bold text-muted-foreground">불러오는 중...</div>;

  const POLICY_TABS = [
    { id: "terms", label: "이용약관", key: "policy_terms" },
    { id: "privacy", label: "개인정보처리방침", key: "policy_privacy" },
    { id: "scam", label: "사기주의 안내", key: "policy_scam" },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">정책 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">사이트 이용약관 및 개인정보 처리방침을 관리합니다 (HTML 지원)</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="btn-primary py-2.5 px-8 flex items-center gap-2"
        >
          {isSaving ? <Plus className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
          정책 저장하기
        </button>
      </div>

      <div className="flex items-center gap-2 border-b border-white/5">
        {POLICY_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActivePolicy(tab.id)}
            className={cn(
              "px-6 py-3 text-sm font-bold transition-all relative",
              activePolicy === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {activePolicy === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
            )}
          </button>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between ml-1">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {POLICY_TABS.find(t => t.id === activePolicy)?.label} 내용
          </label>
          <span className="text-[10px] text-muted-foreground italic">* HTML 태그를 사용하여 서식을 구성할 수 있습니다.</span>
        </div>
        <textarea
          value={(policies as any)[POLICY_TABS.find(t => t.id === activePolicy)?.key || ""]}
          onChange={e => setPolicies({...policies, [POLICY_TABS.find(t => t.id === activePolicy)?.key || ""]: e.target.value})}
          placeholder="정책 내용을 입력하세요..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-primary/50 transition-all min-h-[600px] font-mono leading-relaxed"
        />
      </div>
    </div>
  );
}
