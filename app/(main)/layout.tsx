import { cookies } from 'next/headers';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AttendanceTracker from '@/components/AttendanceTracker';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export default async function MainLayout({
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

  // Fetch Site Settings for Footer
  let footerSettings: any = {};
  try {
    const { env } = getCloudflareContext();
    const db = env.DB as any;
    const { results } = await db.prepare('SELECT key, value FROM site_settings WHERE key IN (?, ?)').bind('footer_description', 'footer_copyright').all();
    results.forEach((row: any) => {
      footerSettings[row.key] = row.value;
    });
  } catch (e) {
    console.error("Failed to fetch site settings", e);
  }

  return (
    <>
      <Header user={user} />
      <AttendanceTracker user={user} />
      <main className="flex-1">{children}</main>
      <Footer 
        description={footerSettings.footer_description} 
        copyright={footerSettings.footer_copyright} 
        isLoggedIn={!!user}
      />
    </>
  );
}
