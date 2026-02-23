import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CLAVI - 料金プラン | AI検索最適化SaaS',
  description:
    'CLAVIの料金プラン。無料プランから大企業向けまで、ビジネスの規模に合わせて柔軟に選べるプランをご用意しています。14日間無料トライアル。',
  openGraph: {
    title: 'CLAVI - 料金プラン | AI検索最適化SaaS',
    description:
      'CLAVIの料金プラン。無料プランから大企業向けまで、ビジネスの規模に合わせて柔軟に選べるプランをご用意しています。',
    url: 'https://clavi.nands.co/clavi/pricing',
    images: [{ url: '/og-clavi.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CLAVI - 料金プラン | AI検索最適化SaaS',
    description:
      'CLAVIの料金プラン。無料プランから大企業向けまで、ビジネスの規模に合わせて柔軟に選べるプランをご用意しています。',
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
