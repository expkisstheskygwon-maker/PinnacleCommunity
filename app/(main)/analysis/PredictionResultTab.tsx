"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Calendar as CalendarIcon, ChevronDown, Loader2, Calendar } from "lucide-react";
import PredictionResultCard from "./PredictionResultCard";
import { cn } from "@/lib/utils";

const SPORTS_TABS = [
  { id: "soccer", label: "⚽ 축구" },
  { id: "baseball", label: "⚾ 야구" },
  { id: "basketball", label: "🏀 농구" },
];

export default function PredictionResultTab() {
  const [activeSport, setActiveSport] = useState("soccer");
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 어제 날짜 구하기 (YYYY-MM-DD 형식)
  const getYesterdayDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState<string>(getYesterdayDate());
  const [showCalendar, setShowCalendar] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  });

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth(); // 0-11

  // Get days of the month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleDateSelect = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setShowCalendar(false);
  };

  const getDateLabel = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];
    
    if (dateStr === today) return `${dateStr} (오늘)`;
    if (dateStr === yesterday) return `${dateStr} (어제)`;
    return dateStr;
  };

  useEffect(() => {
    const fetchFinishedMatches = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/sports/matches?sport=${activeSport}&date=${selectedDate}`);
        const data = await res.json();
        if (data.matches) {
          // 종료된 경기(finished: true)만 필터링
          const finishedMatches = data.matches.filter((m: any) => m.finished);
          setMatches(finishedMatches);
        } else {
          setMatches([]);
        }
      } catch (err) {
        console.error("Failed to fetch matches", err);
        setMatches([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFinishedMatches();
  }, [activeSport, selectedDate]);

  return (
    <div className="space-y-10 mt-6 animate-fade-in">
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-emerald-500/20 via-background to-secondary/10 border border-emerald-500/20 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]" />
        
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 rounded-xl">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">AI 예측 결과 리포트</h2>
            <p className="text-muted-foreground text-sm mt-1">과거 AI 봇들이 예측했던 픽과 실제 결과를 투명하게 비교합니다.</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/5 p-2 md:p-3 rounded-2xl border border-white/5">
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
          {SPORTS_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSport(tab.id)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                activeSport === tab.id
                  ? "bg-primary text-white shadow-[0_0_16px_rgba(59,130,246,0.3)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/10"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto relative">
          <button 
            onClick={() => setShowCalendar(!showCalendar)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors"
          >
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 font-bold">{getDateLabel(selectedDate)}</span>
            <ChevronDown className="w-4 h-4 text-emerald-400/50 ml-2" />
          </button>

          {showCalendar && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowCalendar(false)} />
              <div className="absolute right-0 top-full mt-2 p-4 bg-zinc-950/95 border border-white/10 backdrop-blur-md rounded-2xl shadow-2xl z-50 w-72">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4">
                  <button onClick={handlePrevMonth} className="p-1 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-foreground transition-colors">&lt;</button>
                  <span className="font-bold text-sm text-foreground">{currentYear}년 {currentMonth + 1}월</span>
                  <button onClick={handleNextMonth} className="p-1 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-foreground transition-colors">&gt;</button>
                </div>
                
                {/* Weekdays */}
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-muted-foreground mb-2">
                  <span>일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {/* Empty cells before the 1st of month */}
                  {Array.from({ length: getFirstDayOfMonth(currentYear, currentMonth) }).map((_, idx) => (
                    <div key={`empty-${idx}`} />
                  ))}
                  
                  {/* Month days */}
                  {Array.from({ length: getDaysInMonth(currentYear, currentMonth) }).map((_, idx) => {
                    const day = idx + 1;
                    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isSelected = dateStr === selectedDate;
                    const isToday = dateStr === new Date().toISOString().split('T')[0];
                    
                    return (
                      <button
                        key={`day-${day}`}
                        onClick={() => handleDateSelect(day)}
                        className={cn(
                          "w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center",
                          isSelected 
                            ? "bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                            : isToday
                              ? "border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                        )}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Match List */}
      <div>
        <div className="flex items-center justify-between mb-4 px-2">
          <span className="text-sm text-muted-foreground">
            평가 완료된 경기: <strong className="text-foreground">{matches.length}</strong> 건
          </span>
        </div>
        
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
            <p>경기 결과를 대조 중입니다...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            {getDateLabel(selectedDate)}에 종료된 {activeSport === 'soccer' ? '축구' : activeSport === 'baseball' ? '야구' : '농구'} 경기가 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {matches.map((match) => (
              <PredictionResultCard key={match.id} match={match} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
