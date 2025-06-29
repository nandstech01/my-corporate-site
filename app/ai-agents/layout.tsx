import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AIエージェント開発・自動化システム構築 | 株式会社エヌアンドエス - レリバンスエンジニアリング対応',
  description: '最新AI技術によるインテリジェントエージェント開発。自然言語処理・機械学習・RAGシステムで24時間365日稼働する自動化システムを構築。。ChatGPT・Claude対応。',
  keywords: [
    'AIエージェント開発',
    'インテリジェント自動化システム',
    '自然言語処理システム',
    'GPT-4エージェント開発',
    'RAGシステム構築',
    'ベクトル検索エージェント',
    'マルチエージェントシステム',
    '対話型AIシステム',
    'AI業務自動化',
    '機械学習エージェント',
    'セマンティック検索システム',
    'エージェントフレームワーク',
    'LangChain開発',
    'AutoGen実装',
    '継続学習システム',
    'AI判断エンジン',
    'ワークフロー自動化',
    'データ分析エージェント',
    'セキュリティエージェント',
    'エンタープライズAI',
    'カスタムAIエージェント',
    'AI導入コンサルティング',
    'レリバンスエンジニアリング',
    'AIO対策',
    'Generative Engine Optimization',
    'エヌアンドエス'
  ],
  openGraph: {
    title: 'AIエージェント開発・自動化システム構築 | 株式会社エヌアンドエス',
    description: 'ChatGPT・Claude等最新AI技術によるインテリジェントエージェント開発。自然言語処理・RAGシステムで98%精度の24時間365日自動化システム構築。金融・製造・医療業界での導入実績多数。',
    url: 'https://nands.tech/ai-agents',
    siteName: '株式会社エヌアンドエス',
    locale: 'ja_JP',
    type: 'website',
    images: [
      {
        url: 'https://nands.tech/images/ai-agents-og.jpg',
        width: 1200,
        height: 630,
        alt: 'AIエージェント開発・自動化システム構築サービス'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AIエージェント開発・自動化システム構築 | 株式会社エヌアンドエス',
    description: 'ChatGPT・Claude等最新AI技術によるインテリジェントエージェント開発。98%精度の24時間365日自動化システムで業務革新を実現。',
    images: ['https://nands.tech/images/ai-agents-og.jpg']
  },
  alternates: {
    canonical: 'https://nands.tech/ai-agents',
  },
  // AI検索最適化
  other: {
    'ai-content-type': 'service-offering',
    'ai-expertise-level': 'expert',
    'ai-content-depth': 'comprehensive',
    'ai-solution-category': 'artificial-intelligence automation-systems',
    'ai-target-industries': 'finance manufacturing healthcare',
    'ai-geographic-coverage': 'japan global'
  },
  // GEO対応
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1
  }
};

export default function AIAgentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 