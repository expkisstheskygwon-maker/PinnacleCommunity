"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NotificationBell() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showList, setShowList] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Load notifications (latest 10) on mount
  useEffect(() => {
    fetch('/api/notifications?limit=10')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const unread = data.notifications.filter((n: any) => !n.readAt);
          setUnreadCount(unread.length);
          setNotifications(data.notifications);
        }
      });
  }, []);

  // Show toast on page entry if there are unread notifications
  useEffect(() => {
    if (unreadCount > 0) {
      const timer = setTimeout(() => setShowList(true), 800);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  const markAllRead = async () => {
    const ids = notifications.filter((n) => !n.readAt).map((n) => n.id);
    if (!ids.length) return;
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })));
  };

  return (
    <div className="relative">
      <button
        className="p-2 hover:bg-white/10 rounded-full transition-colors"
        onClick={() => setShowList(!showList)}
        aria-label="알림"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Toast popup – appears once on page load */}
      {showList && (
        <div className="fixed inset-0 flex items-start justify-end p-4 z-50 pointer-events-none">
          <div className="max-w-sm w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg p-4 pointer-events-auto animate-fade-in-down">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-foreground">새 알림</h3>
              <button
                onClick={() => setShowList(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <ul className="space-y-2 max-h-80 overflow-y-auto">
              {notifications
                .filter((n) => !n.readAt)
                .map((n) => (
                  <li
                    key={n.id}
                    className="group cursor-pointer p-2 rounded-md hover:bg-white/10 transition-colors"
                    onClick={() => {
                      if (n.link) router.push(n.link);
                      // mark as read instantly
                      fetch('/api/notifications', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ids: [n.id] }),
                      });
                      setUnreadCount((c) => c - 1);
                    }}
                  >
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    {n.body && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                    )}
                  </li>
                ))}
            </ul>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="mt-3 w-full py-1 text-xs font-medium text-primary underline"
              >
                모두 읽음 처리
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
