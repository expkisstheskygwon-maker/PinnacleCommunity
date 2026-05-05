"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell, MessageSquare, Heart, Star, Trophy, Zap,
  Check, CheckCheck, ChevronRight, Loader2, ArrowLeft,
  Trash2, Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  match_start: { icon: Zap, color: "text-emerald-400", bg: "bg-emerald-500/15" },
  goal: { icon: Trophy, color: "text-[hsl(var(--gold))]", bg: "bg-[hsl(var(--gold))]/15" },
  half_time: { icon: Star, color: "text-primary", bg: "bg-primary/15" },
  match_end: { icon: Check, color: "text-muted-foreground", bg: "bg-white/10" },
  message: { icon: MessageSquare, color: "text-primary", bg: "bg-primary/15" },
  like: { icon: Heart, color: "text-red-400", bg: "bg-red-500/15" },
  system: { icon: Bell, color: "text-[hsl(var(--gold))]", bg: "bg-[hsl(var(--gold))]/15" },
};

function getTypeConfig(type: string) {
  return TYPE_CONFIG[type] ?? TYPE_CONFIG.system;
}

function timeAgo(dateStr: string) {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "방금 전";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=50");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (e) {
      console.error("Failed to load notifications", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markRead = async (id: number) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
    );
  };

  const markAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.readAt).map((n) => n.id);
    if (!unreadIds.length) return;
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: unreadIds }),
    });
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() }))
    );
  };

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const filtered =
    filterType === "all"
      ? notifications
      : notifications.filter((n) => n.type === filterType);

  const filterOptions = [
    { id: "all", label: "전체" },
    { id: "match_start", label: "경기 시작" },
    { id: "goal", label: "득점" },
    { id: "match_end", label: "경기 종료" },
    { id: "message", label: "쪽지" },
    { id: "system", label: "시스템" },
  ];

  return (
    <div className="mesh-gradient min-h-screen">
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary transition-colors">홈</Link>
          <span>/</span>
          <Link href="/mypage" className="hover:text-primary transition-colors">마이페이지</Link>
          <span>/</span>
          <span className="text-foreground font-bold">알림 서랍</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link href="/mypage" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
            <div>
              <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                <Bell className="w-6 h-6 text-primary" />
                알림 서랍
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                경기 알림, 쪽지, 시스템 알림을 확인하세요
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold hover:bg-primary hover:text-white transition-all"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              모두 읽음 ({unreadCount})
            </button>
          )}
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {filterOptions.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                filterType === f.id
                  ? "bg-primary text-white shadow-[0_0_16px_rgba(59,130,246,0.3)]"
                  : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 border border-white/[0.06]"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="glass-card rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground animate-pulse">알림을 불러오는 중...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 space-y-4 text-muted-foreground">
              <Bell className="w-12 h-12 opacity-20" />
              <p className="font-medium">
                {filterType === "all" ? "아직 알림이 없습니다" : "해당 유형의 알림이 없습니다"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {filtered.map((n) => {
                const config = getTypeConfig(n.type);
                const Icon = config.icon;
                return (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (!n.readAt) markRead(n.id);
                      if (n.link) window.location.href = n.link;
                    }}
                    className={cn(
                      "flex items-start gap-4 px-5 py-4 transition-colors cursor-pointer group",
                      !n.readAt
                        ? "bg-primary/[0.03] border-l-2 border-l-primary hover:bg-primary/[0.06]"
                        : "hover:bg-white/[0.03] border-l-2 border-transparent"
                    )}
                  >
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5", config.bg)}>
                      <Icon className={cn("w-4 h-4", config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm leading-snug", !n.readAt ? "font-bold text-foreground" : "text-muted-foreground")}>
                        {n.title}
                      </p>
                      {n.body && (
                        <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-2">{n.body}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground/50 mt-1.5 font-mono">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 mt-1">
                      {!n.readAt && (
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      )}
                      {n.link && (
                        <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
