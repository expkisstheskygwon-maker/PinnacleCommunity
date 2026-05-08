"use client";

import { useEffect, useState } from "react";
import { Star, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AttendanceTracker({ user }: { user: any }) {
  const [showToast, setShowToast] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;

    const checkAttendance = async () => {
      try {
        const res = await fetch("/api/user/attendance", { method: "POST" });
        const data = await res.json();

        if (data.success) {
          setMessage(data.message);
          setShowToast(true);
          // 5초 후 자동 닫기
          setTimeout(() => setShowToast(false), 5000);
        }
      } catch (err) {
        console.error("Attendance check failed", err);
      }
    };

    // 로딩 직후 약간의 지연을 두어 렌더링 안정화 후 실행
    const timer = setTimeout(checkAttendance, 2000);
    return () => clearTimeout(timer);
  }, [user]);

  if (!showToast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[200] animate-in fade-in slide-in-from-right-10 duration-500">
      <div className="glass-card border-primary/30 bg-primary/10 p-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[300px]">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
          <Star className="w-6 h-6 text-white fill-current" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-0.5">Attendance Reward</p>
          <p className="text-sm font-bold text-foreground leading-tight">{message}</p>
        </div>
        <button 
          onClick={() => setShowToast(false)}
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
