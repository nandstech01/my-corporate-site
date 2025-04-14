import type { Metadata } from 'next';

// メタデータの定義
export const metadata: Metadata = {
  title: 'AI時代のリスキリング研修・AI活用スキル習得 | 株式会社エヌアンドエス',
  description: '2025年に向けた個人向けAIリスキリング研修。ChatGPTなどの生成AIを活用したスキルアップ、キャリアアップを支援します。初心者でも安心して学べる実践的なカリキュラムで、AI時代に必須のスキルを習得できます。',
  keywords: 'リスキリング,AI研修,生成AI,ChatGPT,スキルアップ,キャリアアップ,AI教育,プロンプトエンジニアリング,2025年対策,個人向けAI研修',
  openGraph: {
    title: 'AI時代のリスキリング研修・AI活用スキル習得 | 株式会社エヌアンドエス',
    description: '2025年に向けた個人向けAIリスキリング研修。ChatGPTなどの生成AIを活用したスキルアップ、キャリアアップを支援します。初心者でも安心して学べる実践的なカリキュラムで、AI時代に必須のスキルを習得できます。',
    url: 'https://nands.tech/reskilling',
    siteName: '株式会社エヌアンドエス',
    images: ['/images/reskilling-ogp.jpg'],
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@nands_tech',
    creator: '@nands_tech',
  },
  alternates: {
    canonical: 'https://nands.tech/reskilling'
  },
};

export default function ReskillLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      {children}
    </div>
  );
} 