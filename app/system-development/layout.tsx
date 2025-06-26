import type { Metadata, Viewport } from 'next';

// Viewport設定
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1e40af' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' }
  ],
  colorScheme: 'light dark',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://nands.tech'),
  title: {
    default: 'AIシステム開発・RAGシステム構築 | 株式会社エヌアンドエス',
    template: '%s | 株式会社エヌアンドエス - AIシステム開発'
  },
  description: '株式会社エヌアンドエスのAIシステム開発サービス。13法令準拠RAGシステム、30分自動生成システム、24時間運用システムなど、業界最速・最安値でのシステム開発を提供。退職代行システム、法律特化AIなど豊富な実績。',
  keywords: [
    'AIシステム開発',
    'RAGシステム',
    '法令準拠システム',
    '自動生成システム',
    'AI開発',
    'システム構築',
    'エヌアンドエス',
    'N&S',
    '滋賀県',
    '大津市',
    '業務効率化',
    'DX推進',
    '退職代行システム',
    '法律AI',
    'Triple RAG',
    'ベクトル検索'
  ],
  authors: [{ name: '株式会社エヌアンドエス', url: 'https://nands.tech' }],
  creator: '株式会社エヌアンドエス',
  publisher: '株式会社エヌアンドエス',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'AIシステム開発・RAGシステム構築 | 株式会社エヌアンドエス',
    description: '13法令準拠RAGシステム、30分自動生成システムなど、業界最速・最安値でのAIシステム開発を提供。豊富な実績と24時間運用体制で企業のDXを支援します。',
    url: 'https://nands.tech/system-development',
    siteName: '株式会社エヌアンドエス',
    locale: 'ja_JP',
    type: 'website',
    images: [
      {
        url: '/images/default-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'エヌアンドエス AIシステム開発サービス',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AIシステム開発・RAGシステム構築 | 株式会社エヌアンドエス',
    description: '13法令準拠RAGシステム、30分自動生成システムなど、業界最速・最安値でのAIシステム開発を提供。',
    images: ['/images/default-og-image.jpg'],
  },
  alternates: {
    canonical: 'https://nands.tech/system-development',
  },
  other: {
    'msapplication-TileColor': '#1e40af',
    'theme-color': '#1e40af',
  },
};

export default function SystemDevelopmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 