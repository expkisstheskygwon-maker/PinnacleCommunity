import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth-utils';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');

  let isAdmin = false;
  if (adminSession?.value) {
    try {
      const sessionSecret = process.env.SESSION_SECRET || process.env.BOT_API_KEY || 'pinnacle_default_session_secret_key_2026';
      const decoded = await verifyToken(adminSession.value, sessionSecret);
      isAdmin = decoded && decoded.role === 'admin';
    } catch (e) {}
  }

  if (!isAdmin) {
    redirect('/admin/login');
  }

  return <>{children}</>;
}

