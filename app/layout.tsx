import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import NotificationBell from '@/components/NotificationBell';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '피나클 커뮤니티 - Pinnacle Information Hub',
  description: '피나클 사용자를 위한 정보 허브. 가입 가이드, 배당 분석, 실사용 후기, Q&A를 한곳에서. Pinnacle Community - your trusted information hub for guides, odds analysis, user reviews, and expert insights.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="dark">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        {/* Header with navigation and notification bell */}
        <header className="flex items-center justify-between px-4 py-3 bg-black/30 backdrop-blur-md sticky top-0 z-10">
          <a href="/" className="text-xl font-black text-primary">Pinnacle Community</a>
          <div className="flex items-center gap-4">
            {/* Future navigation items can be added here */}
            <NotificationBell />
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
