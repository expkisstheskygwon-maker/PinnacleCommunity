'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PopupSetting {
  id: number;
  isActive: boolean;
  title: string;
  htmlContent: string;
  image: string;
  linkUrl: string;
  position: 'top-left' | 'top-center' | 'top-right' | 'center' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

export default function PopupRenderer() {
  const [popups, setPopups] = useState<PopupSetting[]>([]);
  const [hiddenPopupIds, setHiddenPopupIds] = useState<number[]>([]);
  const [tempClosedIds, setTempClosedIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchPopups = async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.success && data.settings.popups) {
          const parsed = JSON.parse(data.settings.popups);
          if (Array.isArray(parsed)) {
            // 활성화된 팝업만 필터링
            const activePopups = parsed.filter((p: any) => p.isActive);
            setPopups(activePopups);

            // 로컬 스토리지를 확인하여 노출 제한 기한이 남은 팝업 아이디 수집
            const now = Date.now();
            const expiredOrHiddenIds: number[] = [];
            activePopups.forEach((p: any) => {
              const hideUntil = localStorage.getItem(`pinnacle_popup_hide_${p.id}`);
              if (hideUntil) {
                if (now < parseInt(hideUntil, 10)) {
                  expiredOrHiddenIds.push(p.id);
                } else {
                  localStorage.removeItem(`pinnacle_popup_hide_${p.id}`);
                }
              }
            });
            setHiddenPopupIds(expiredOrHiddenIds);
          }
        }
      } catch (err) {
        console.error('Failed to fetch popups in PopupRenderer:', err);
      }
    };

    fetchPopups();
  }, []);

  const handleCloseTemp = (id: number) => {
    setTempClosedIds(prev => [...prev, id]);
  };

  const handleCloseOneDay = (id: number) => {
    // 24시간 뒤의 타임스탬프 계산
    const oneDayLater = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem(`pinnacle_popup_hide_${id}`, oneDayLater.toString());
    setHiddenPopupIds(prev => [...prev, id]);
  };

  // 숨겨지지 않은 최종 노출 대상 팝업들
  const visiblePopups = popups.filter(
    p => !hiddenPopupIds.includes(p.id) && !tempClosedIds.includes(p.id)
  );

  if (visiblePopups.length === 0) return null;

  // 지정 위치별 Tailwind CSS 클래스 매핑
  const getPositionStyles = (position: string) => {
    switch (position) {
      case 'top-left':
        return 'top-6 left-6';
      case 'top-center':
        return 'top-6 left-1/2 -translate-x-1/2';
      case 'top-right':
        return 'top-6 right-6';
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'bottom-center':
        return 'bottom-6 left-1/2 -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-6 right-6';
      case 'center':
      default:
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {visiblePopups.map((p) => {
        const positionClass = getPositionStyles(p.position);
        return (
          <div
            key={p.id}
            className={cn(
              "fixed pointer-events-auto w-full max-w-[340px] glass-card rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col animate-scale-in bg-[#111622]/90 backdrop-blur-md",
              positionClass
            )}
          >
            {/* Header */}
            <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <span className="text-[10px] font-black text-primary tracking-wider uppercase">Notice</span>
              <button
                onClick={() => handleCloseTemp(p.id)}
                className="p-1 hover:bg-white/5 rounded-lg text-muted-foreground hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Body Content */}
            <div className="flex-1 flex flex-col">
              {p.image && (
                <div className="relative aspect-video w-full overflow-hidden border-b border-white/5 bg-black/10">
                  {p.linkUrl ? (
                    <a href={p.linkUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                      <img src={p.image} alt={p.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    </a>
                  ) : (
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                  )}
                </div>
              )}

              {p.htmlContent && (
                <div
                  className="p-4 text-xs leading-relaxed text-foreground/90 overflow-y-auto max-h-[250px] custom-scrollbar"
                  dangerouslySetInnerHTML={{ __html: p.htmlContent }}
                />
              )}
            </div>

            {/* Footer Buttons */}
            <div className="grid grid-cols-2 border-t border-white/5 bg-white/[0.01]">
              <button
                onClick={() => handleCloseOneDay(p.id)}
                className="py-2.5 text-[10px] font-bold text-muted-foreground hover:text-foreground border-r border-white/5 transition-colors text-center"
              >
                오늘 하루 보지 않기
              </button>
              <button
                onClick={() => handleCloseTemp(p.id)}
                className="py-2.5 text-[10px] font-bold text-primary hover:text-primary/80 transition-colors text-center"
              >
                닫기
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
