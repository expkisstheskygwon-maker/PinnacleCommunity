import { cookies } from 'next/headers';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

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

  return (
    <>
      <Header user={user} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
