import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

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
  const cookieStore = await cookies();
  const authSession = cookieStore.get("auth_session");
  let user = null;

  if (authSession?.value) {
    try {
      user = JSON.parse(authSession.value);
    } catch (e) {
      console.error("Failed to parse auth session", e);
    }
  }

  return (
    <html lang="ko" className="dark">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Header user={user} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
