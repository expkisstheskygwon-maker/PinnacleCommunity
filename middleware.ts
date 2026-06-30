import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth-utils';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 1. 관리자 대시보드 화면 접근 제어 (/admin/login 및 /admin/crawler 제외 - crawler는 dashboard로 통합 예정)
  if (path.startsWith('/admin') && path !== '/admin/login' && path !== '/admin/crawler') {
    const adminSession = request.cookies.get('admin_session');
    
    let isAdmin = false;
    if (adminSession?.value) {
      try {
        const sessionSecret = process.env.SESSION_SECRET || process.env.BOT_API_KEY || 'pinnacle_default_session_secret_key_2026';
        const decoded = await verifyToken(adminSession.value, sessionSecret);
        if (decoded && decoded.role === 'admin') {
          isAdmin = true;
        }
      } catch (e) {
        console.error("Middleware admin token verification failed", e);
      }
    }

    if (!isAdmin) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // 2. 관리자 API 엔드포인트 접근 제어 (/api/admin/login 제외)
  if (path.startsWith('/api/admin') && path !== '/api/admin/login') {
    const adminSession = request.cookies.get('admin_session');
    
    let isAdmin = false;
    if (adminSession?.value) {
      try {
        const sessionSecret = process.env.SESSION_SECRET || process.env.BOT_API_KEY || 'pinnacle_default_session_secret_key_2026';
        const decoded = await verifyToken(adminSession.value, sessionSecret);
        if (decoded && decoded.role === 'admin') {
          isAdmin = true;
        }
      } catch (e) {
        console.error("Middleware admin API token verification failed", e);
      }
    }

    if (!isAdmin) {
      return NextResponse.json({ success: false, error: '권한이 없습니다. 유효하지 않은 세션입니다.' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
