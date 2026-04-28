import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

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
      const session = JSON.parse(adminSession.value);
      isAdmin = session.role === 'admin';
    } catch (e) {}
  }

  if (!isAdmin) {
    redirect('/admin/login');
  }

  return <>{children}</>;
}
