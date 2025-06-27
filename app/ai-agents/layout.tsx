import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AIエージェント開発 | 株式会社エヌアンドエス',
  description: '最新のAI技術を活用したインテリジェントエージェント開発。自然言語処理、機械学習、自動化システムで業務効率を劇的に向上させます。',
  keywords: [
    'AIエージェント開発',
    '人工知能システム',
    '自然言語処理',
    'GPT-4活用',
    'ベクトル検索',
    '機械学習',
    'AI自動化',
    'インテリジェントシステム',
    'エヌアンドエス'
  ],
  openGraph: {
    title: 'AIエージェント開発 | 株式会社エヌアンドエス',
    description: '最新のAI技術を活用したインテリジェントエージェント開発。自然言語処理から自動化まで包括的にサポート。',
    url: 'https://nands.tech/ai-agents',
    siteName: '株式会社エヌアンドエス',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AIエージェント開発 | 株式会社エヌアンドエス',
    description: '最新のAI技術を活用したインテリジェントエージェント開発。自然言語処理から自動化まで包括的にサポート。',
  },
  alternates: {
    canonical: 'https://nands.tech/ai-agents',
  },
};

export default function AIAgentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 