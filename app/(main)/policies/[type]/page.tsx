import { getCloudflareContext } from '@opennextjs/cloudflare';
import { notFound } from 'next/navigation';
import { Shield, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default async function PolicyPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  
  const policyKeys: any = {
    terms: 'policy_terms',
    privacy: 'policy_privacy',
    scam: 'policy_scam'
  };

  const policyLabels: any = {
    terms: '이용약관',
    privacy: '개인정보처리방침',
    scam: '사기주의 안내'
  };

  if (!policyKeys[type]) notFound();

  let content = "";
  try {
    const { env } = getCloudflareContext();
    const db = env.DB as any;
    const result: any = await db.prepare('SELECT value FROM site_settings WHERE key = ?').bind(policyKeys[type]).first();
    content = result?.value || "";
  } catch (e) {
    console.error(e);
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary transition-colors">홈</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-bold">{policyLabels[type]}</span>
        </div>

        <div className="glass-card rounded-3xl p-8 md:p-12 space-y-8">
          <div className="flex items-center gap-4 border-b border-white/5 pb-8">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">{policyLabels[type]}</h1>
              <p className="text-sm text-muted-foreground mt-1">피나클 커뮤니티 사이트 정책 안내</p>
            </div>
          </div>

          <div 
            className="prose prose-invert prose-sm max-w-none leading-relaxed text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: content || "<p className='italic py-20 text-center'>등록된 내용이 없습니다.</p>" }}
          />
        </div>
      </div>
    </div>
  );
}
