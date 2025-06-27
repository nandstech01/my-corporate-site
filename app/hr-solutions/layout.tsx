import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '人材ソリューション | 株式会社エヌアンドエス',
  description: 'AIを活用した総合人材ソリューション。求人サイト構築、AIマッチング、履歴書・職務経歴書自動生成など、人材業界のDXを支援します。',
  keywords: [
    '人材ソリューション',
    'AI求人マッチング', 
    '求人サイト構築',
    '履歴書自動生成',
    '職務経歴書作成',
    '退職届作成',
    'レコメンド機能',
    '人材DX',
    'HR-Tech',
    'エヌアンドエス'
  ],
  openGraph: {
    title: '人材ソリューション | 株式会社エヌアンドエス',
    description: 'AIを活用した総合人材ソリューション。求人サイト構築からAIマッチング、各種書類自動生成まで一気通貫でサポート。',
    url: 'https://nands.tech/hr-solutions',
    siteName: '株式会社エヌアンドエス',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '人材ソリューション | 株式会社エヌアンドエス',
    description: 'AIを活用した総合人材ソリューション。求人サイト構築からAIマッチング、各種書類自動生成まで一気通貫でサポート。',
  },
  alternates: {
    canonical: 'https://nands.tech/hr-solutions',
  },
};

export default function HRSolutionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 