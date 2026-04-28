import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '로그인 - 피나클 커뮤니티',
  description: '피나클 커뮤니티에 로그인하여 다양한 서비스를 이용하세요. Pinnacle Community login page.',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
