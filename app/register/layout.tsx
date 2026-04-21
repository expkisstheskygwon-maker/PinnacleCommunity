import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '회원가입 - 피나클 커뮤니티',
  description: '피나클 커뮤니티의 멤버가 되어 프리미엄 정보와 커뮤니티 기능을 경험하세요. Pinnacle Community signup page.',
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
