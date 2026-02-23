import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CLAVI - 機能一覧 | AI検索最適化SaaS',
  description:
    'CLAVIの主要機能：AI構造スコア分析、JSON-LD自動生成、内部リンク最適化など。コンテンツをAI検索エンジンに最適化するための包括的なツールセット。',
  openGraph: {
    title: 'CLAVI - 機能一覧 | AI検索最適化SaaS',
    description:
      'CLAVIの主要機能：AI構造スコア分析、JSON-LD自動生成、内部リンク最適化など。AI検索時代のコンテンツ最適化ツール。',
    url: 'https://clavi.nands.co/clavi/features',
    images: [{ url: '/og-clavi.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CLAVI - 機能一覧 | AI検索最適化SaaS',
    description:
      'CLAVIの主要機能：AI構造スコア分析、JSON-LD自動生成、内部リンク最適化など。AI検索時代のコンテンツ最適化ツール。',
  },
};

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
