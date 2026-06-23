"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar as CalendarIcon,
  Flame,
  Award,
  Coins,
  CheckCircle2,
  Lock,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  FileText,
  RotateCcw,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AttendancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [stats, setStats] = useState({
    points: 0,
    score: 0,
    attendanceCount: 0,
    attendanceStreak: 0,
    lastAttendanceDate: null,
  });
  const [history, setHistory] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Calendar setup (based on local user browser time)
  const todayObj = new Date();
  const currentYear = todayObj.getFullYear();
  const currentMonth = todayObj.getMonth();
  const todayStr = todayObj.toISOString().split("T")[0];

  const monthNames = [
    "1월", "2월", "3월", "4월", "5월", "6월",
    "7월", "8월", "9월", "10월", "11월", "12월"
  ];

  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const fetchAttendanceData = async () => {
    try {
      const res = await fetch("/api/user/attendance");
      const data = await res.json();

      if (res.status === 401) {
        setIsLoggedIn(false);
      } else if (!data.success) {
        showToastMsg("error", data.error || "데이터를 불러오는 중 오류가 발생했습니다.");
      } else {
        setIsLoggedIn(true);
        setStats(data.stats);
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error("Failed to fetch attendance data", err);
      showToastMsg("error", "서버와의 통신에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const showToastMsg = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 5000);
  };

  const handleCheckIn = async () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    if (checkingIn) return;

    setCheckingIn(true);
    try {
      const res = await fetch("/api/user/attendance", { method: "POST" });
      const data = await res.json();

      if (data.success) {
        showToastMsg("success", data.message);
        // Refresh local data
        await fetchAttendanceData();
        router.refresh();
      } else {
        showToastMsg("error", data.message || data.error || "출석 체크 중 오류가 발생했습니다.");
      }
    } catch (err) {
      showToastMsg("error", "네트워크 오류가 발생했습니다.");
    } finally {
      setCheckingIn(false);
    }
  };

  // Determine if already checked in today
  const isCheckedInToday = stats.lastAttendanceDate === todayStr || history.includes(todayStr);

  // Render Calendar Cells
  const renderCalendarCells = () => {
    const cells = [];

    // Empty cells for preceding month's days
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(
        <div key={`empty-${i}`} className="aspect-square bg-white/[0.01] border border-white/[0.03] rounded-lg" />
      );
    }

    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const isChecked = history.includes(dateStr);
      const isToday = dateStr === todayStr;

      cells.push(
        <div
          key={`day-${d}`}
          className={cn(
            "aspect-square flex flex-col items-center justify-between p-1.5 rounded-xl border relative transition-all duration-300",
            isChecked 
              ? "bg-primary/10 border-primary/40 text-primary shadow-[0_0_12px_rgba(59,130,246,0.15)]" 
              : isToday
                ? "bg-white/5 border-[hsl(var(--gold))] text-[hsl(var(--gold))] shadow-[0_0_12px_rgba(251,191,36,0.15)]"
                : "bg-white/[0.02] border-white/[0.06] text-muted-foreground hover:bg-white/[0.04]"
          )}
        >
          <span className={cn(
            "text-[11px] font-bold self-start ml-1 mt-0.5",
            isToday && "underline decoration-2"
          )}>
            {d}
          </span>
          {isChecked ? (
            <CheckCircle2 className="w-5 h-5 text-primary fill-primary/10 animate-bounce-short mb-1 shrink-0" />
          ) : isToday ? (
            <Sparkles className="w-4 h-4 text-[hsl(var(--gold))] animate-pulse mb-1.5 shrink-0" />
          ) : null}
        </div>
      );
    }

    return cells;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4" />
        <p className="text-muted-foreground text-sm font-bold animate-pulse">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden py-12 px-4">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[hsl(var(--gold))]/5 blur-[120px] pointer-events-none" />

      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[200] animate-in fade-in slide-in-from-right-10 duration-500">
          <div className={cn(
            "glass-card p-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[320px] border",
            toast.type === "success" ? "border-primary/30 bg-primary/10" : "border-red-500/30 bg-red-500/10"
          )}>
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg",
              toast.type === "success" ? "bg-primary shadow-primary/20" : "bg-red-500 shadow-red-500/20"
            )}>
              {toast.type === "success" ? (
                <Award className="w-5 h-5 text-white" />
              ) : (
                <Flame className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="flex-1">
              <p className={cn(
                "text-xs font-bold uppercase tracking-widest mb-0.5",
                toast.type === "success" ? "text-primary" : "text-red-400"
              )}>
                {toast.type === "success" ? "Reward Claimed" : "Check-in Error"}
              </p>
              <p className="text-sm font-bold leading-tight">{toast.text}</p>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-10 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-bold mb-4 uppercase tracking-widest animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-primary fill-primary/10" />
            <span>Daily Attendance Reward</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
            매일 출석하고 <span className="bg-gradient-to-r from-primary to-[hsl(var(--gold))] bg-clip-text text-transparent">포인트</span> 받기
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            출석 체크를 통해 가상 배팅에 사용할 수 있는 VP를 적립해 보세요. 7일, 30일 연속 출석 시 대박 보너스도 기다리고 있습니다!
          </p>
        </div>

        {!isLoggedIn ? (
          /* Login Prompt Card */
          <div className="glass-card border-white/10 p-8 text-center rounded-3xl mb-8 max-w-md mx-auto shadow-2xl bg-white/[0.02]">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5 shadow-inner">
              <Lock className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">로그인이 필요합니다</h3>
            <p className="text-muted-foreground text-xs leading-relaxed mb-6">
              출석 체크는 회원전용 이벤트입니다. 로그인하고 매일 50 VP 보상을 받아보세요.
            </p>
            <button
              onClick={() => router.push("/login")}
              className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 group"
            >
              로그인하고 시작하기
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ) : (
          /* Main Logged In Layout */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left/Main Column: Calendar and Check-in Action */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Check-In Card */}
              <div className="glass-card border-white/10 p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden bg-gradient-to-br from-white/[0.03] to-transparent">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
                <div className="text-center md:text-left space-y-2">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <span className="text-xs font-black text-primary uppercase tracking-widest">Today's Check-in</span>
                    {isCheckedInToday && (
                      <span className="badge-primary text-[9px] py-0.5 px-2 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">완료</span>
                    )}
                  </div>
                  <h2 className="text-2xl font-black">
                    {isCheckedInToday ? "오늘의 출석을 완료했습니다" : "매일 한 번 터치로 출석 체크"}
                  </h2>
                  <p className="text-muted-foreground text-xs max-w-md leading-relaxed">
                    출석 완료 시 기본 50 VP가 지급됩니다. 7일 연속 출석 시 추가 100 VP, 30일은 500 VP 추가 적립!
                  </p>
                </div>
                <button
                  disabled={isCheckedInToday || checkingIn}
                  onClick={handleCheckIn}
                  className={cn(
                    "w-full md:w-auto px-8 py-4 rounded-2xl font-black text-sm transition-all duration-300 shadow-lg flex items-center justify-center gap-2.5 shrink-0",
                    isCheckedInToday
                      ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 cursor-not-allowed shadow-none"
                      : "btn-primary hover:scale-[1.02] shadow-primary/20 hover:shadow-primary/30"
                  )}
                >
                  {checkingIn ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>처리 중...</span>
                    </>
                  ) : isCheckedInToday ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>출석 완료</span>
                    </>
                  ) : (
                    <>
                      <Coins className="w-5 h-5 text-white animate-bounce-short" />
                      <span>출석하고 50 VP 받기</span>
                    </>
                  )}
                </button>
              </div>

              {/* Monthly Calendar Card */}
              <div className="glass-card border-white/10 p-6 rounded-3xl shadow-xl bg-white/[0.01]">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.05]">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-primary" />
                    <h3 className="font-black text-base">{currentYear}년 {monthNames[currentMonth]} 출석 현황</h3>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary/30 border border-primary/50" />
                      <span>출석 완료</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full border border-[hsl(var(--gold))]/60 bg-white/5" />
                      <span>오늘</span>
                    </div>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2.5">
                  {dayNames.map((day) => (
                    <div
                      key={day}
                      className={cn(
                        "text-center text-xs font-black text-muted-foreground/80 py-1.5 mb-1",
                        (day === "일" || day === "토") && "text-red-400/80"
                      )}
                    >
                      {day}
                    </div>
                  ))}
                  {renderCalendarCells()}
                </div>
              </div>

            </div>

            {/* Right Column: User Stats & Other Point Methods */}
            <div className="space-y-6">
              
              {/* User Stats Card */}
              <div className="glass-card border-white/10 p-6 rounded-3xl shadow-xl bg-gradient-to-br from-white/[0.02] to-transparent">
                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4">My Status</h3>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white/[0.02] border border-white/[0.05] p-3 rounded-2xl text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Coins className="w-4 h-4 text-[hsl(var(--gold))]" />
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground block mb-0.5">보유 포인트</span>
                    <span className="font-mono font-black text-sm text-[hsl(var(--gold))]">{stats.points.toLocaleString()} VP</span>
                  </div>
                  <div className="bg-white/[0.02] border border-white/[0.05] p-3 rounded-2xl text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Flame className="w-4 h-4 text-orange-400" />
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground block mb-0.5">연속 출석</span>
                    <span className="font-mono font-black text-sm text-orange-400">{stats.attendanceStreak}일</span>
                  </div>
                  <div className="bg-white/[0.02] border border-white/[0.05] p-3 rounded-2xl text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Award className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground block mb-0.5">누적 출석</span>
                    <span className="font-mono font-black text-sm text-primary">{stats.attendanceCount}회</span>
                  </div>
                </div>

                {/* Streak Milestone Progress */}
                <div className="space-y-4 pb-1 border-t border-white/[0.05] pt-4">
                  <span className="text-[11px] font-black text-foreground block mb-1">연속 출석 보너스 현황</span>
                  
                  {/* 7 Days Streak */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold">7일 연속 보너스 (+100 VP)</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{Math.min(stats.attendanceStreak, 7)} / 7일</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min((stats.attendanceStreak / 7) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* 30 Days Streak */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold">30일 연속 보너스 (+500 VP)</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{Math.min(stats.attendanceStreak, 30)} / 30일</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-[hsl(var(--gold))] rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min((stats.attendanceStreak / 30) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Point Earning Methods Guide */}
              <div className="glass-card border-white/10 p-6 rounded-3xl shadow-xl bg-white/[0.01]">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/[0.05]">
                  <Sparkles className="w-4 h-4 text-[hsl(var(--gold))]" />
                  <h3 className="font-black text-sm">다양한 포인트 획득 방법</h3>
                </div>

                <div className="space-y-3">
                  {/* Daily Attendance */}
                  <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <CalendarIcon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black">일일 출석 체크</h4>
                        <p className="text-[10px] text-muted-foreground">매일 출석 버튼 클릭</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-black text-primary shrink-0">+50 VP</span>
                  </div>

                  {/* Write Post */}
                  <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black">게시글 작성</h4>
                        <p className="text-[10px] text-muted-foreground">일일 최대 5회 적립 가능</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-black text-blue-400 shrink-0">+50 VP</span>
                  </div>

                  {/* Write Comment */}
                  <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                        <MessageSquare className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black">댓글 작성</h4>
                        <p className="text-[10px] text-muted-foreground">일일 최대 20회 적립 가능</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-black text-purple-400 shrink-0">+10 VP</span>
                  </div>

                  {/* Get Liked */}
                  <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0">
                        <Award className="w-4 h-4 text-rose-400" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black">작성한 글 추천 받기</h4>
                        <p className="text-[10px] text-muted-foreground">내 글이 추천받을 때마다</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-black text-rose-400 shrink-0">+20 VP</span>
                  </div>

                  {/* Virtual Betting */}
                  <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black">가상 배팅 성공</h4>
                        <p className="text-[10px] text-muted-foreground">경기 결과 예측에 배팅 성공</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-black text-emerald-400 shrink-0">배당률 배수</span>
                  </div>

                  {/* Roulette spin */}
                  <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                        <RotateCcw className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black">럭키 포인트 룰렛</h4>
                        <p className="text-[10px] text-muted-foreground">100 VP 차감 후 당첨 기회</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-black text-amber-400 shrink-0">최대 1000 VP</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-white/[0.05]">
                  <button 
                    onClick={() => router.push("/point-shop")}
                    className="w-full text-center text-xs font-black text-primary hover:text-primary-hover flex items-center justify-center gap-1 group py-1.5"
                  >
                    포인트 상점 구경가기
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}
      </div>
    </div>
  );
}
