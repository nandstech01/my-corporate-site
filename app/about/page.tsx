import React from 'react';
import { Metadata } from 'next';
import TableOfContents from '@/components/common/TableOfContents';
import type { TOCItem } from '@/components/common/TableOfContents';

// 新しいコンポーネントをインポート
import HeroSection from './components/HeroSection';
import MissionVisionSection from './components/MissionVisionSection';
import EnterpriseAISection from './components/EnterpriseAISection';
import BusinessSection from './components/BusinessSection';
import CompanyMessageSection from './components/CompanyMessageSection';
import HistoryAccessSection from './components/HistoryAccessSection';
import OfficialSNSSection from './components/OfficialSNSSection';
import RepresentativeSNSSection from './components/RepresentativeSNSSection';

// SSG/ISR設定
export const revalidate = 3600; // 1時間間隔でISR実行

// aboutページ専用目次（Mike King理論準拠 - レリバンスエンジニアリング最適化）
const aboutPageTocItems: TOCItem[] = [
  { 
    id: 'hero', 
    title: 'NANDS - Business Concept', 
    level: 1,
    semanticWeight: 0.98,
    targetQueries: ['NANDS とは', '株式会社エヌアンドエス', 'Business Concept', '次のステージ'],
    entities: ['NANDS', 'Business Concept', '次のステージ', 'AI技術', '働く人']
  },
  { 
    id: 'mission-vision', 
    title: 'Mission & Vision - 企業使命とビジョン', 
    level: 1,
    semanticWeight: 0.96,
    targetQueries: ['企業使命', 'ビジョン', '2030年', 'リーディングカンパニー', 'DX推進'],
    entities: ['Mission', 'Vision', '2030年', 'リーディングカンパニー', 'DX推進', 'AI活用']
  },
  { 
    id: 'enterprise-ai', 
    title: 'Enterprise AI Solutions - 企業向けAI', 
    level: 1,
    semanticWeight: 0.94,
    targetQueries: ['AI導入コンサルティング', '企業向けAI研修', 'AI組織構築', 'ROI評価'],
    entities: ['AI導入コンサルティング', '企業向けAI研修', 'AI組織構築', 'ROI評価', 'AI戦略']
  },
  { 
    id: 'business', 
    title: 'Business - 事業内容', 
    level: 1,
    semanticWeight: 0.92,
    targetQueries: ['事業内容', 'リスキリング研修', 'キャリアコンサルティング', '退職支援'],
    entities: ['リスキリング研修', 'キャリアコンサルティング', '退職支援', 'システム開発', 'SNSコンサル']
  },
  { 
    id: 'company-message', 
    title: 'Company & Message - 会社概要', 
    level: 1,
    semanticWeight: 0.90,
    targetQueries: ['会社概要', '原田賢治', '代表メッセージ', '株式会社エヌアンドエス'],
    entities: ['株式会社エヌアンドエス', '原田賢治', '代表メッセージ', '寄り添い続ける', '2008年設立']
  },
  { 
    id: 'company-official-x', 
    title: 'Official SNS - X (Twitter)', 
    level: 1,
    semanticWeight: 0.86,
    targetQueries: ['公式SNS', 'X', 'Twitter', 'NANDS_AI', 'AI技術動向'],
    entities: ['X', 'Twitter', '公式SNS', 'NANDS_AI', 'AI技術動向', 'サービス情報', '業界インサイト']
  },
  { 
    id: 'representative-linkedin', 
    title: 'Representative LinkedIn - 原田賢治', 
    level: 1,
    semanticWeight: 0.84,
    targetQueries: ['代表LinkedIn', '原田賢治', 'B2B専門性', '業界インサイト', 'レリバンスエンジニアリング'],
    entities: ['LinkedIn', '原田賢治', 'B2B専門性', '業界インサイト', '経営視点', 'レリバンスエンジニアリング']
  },
  { 
    id: 'history-access', 
    title: 'History & Access - 企業沿革', 
    level: 1,
    semanticWeight: 0.82,
    targetQueries: ['企業沿革', '2008年設立', 'アクセス情報', '滋賀県大津市', '東京支社'],
    entities: ['企業沿革', '2008年設立', 'アクセス情報', '滋賀県大津市', '東京支社', 'NANDSTECH']
  }
];

// メタデータのエクスポート（既存SEO設定維持）
export const metadata: Metadata = {
  title: '会社概要 | 株式会社エヌアンドエス - AI技術で働く人の次のステージへ',
  description: '株式会社エヌアンドエスの会社概要。2008年設立、滋賀県を拠点に生成AI活用リスキリング研修、AIシステム開発、キャリアコンサルティング、退職支援事業を展開。代表取締役原田賢治のメッセージもご覧いただけます。',
  keywords: [
    '株式会社エヌアンドエス',
    '会社概要',
    '企業情報',
    '代表メッセージ',
    '原田賢治',
    'AI研修',
    'キャリアコンサルティング',
    '退職支援',
    '滋賀県',
    '企業沿革'
  ],
  openGraph: {
    title: '会社概要 | 株式会社エヌアンドエス',
    description: '2008年設立、AI技術で働く人の次のステージを支援する総合キャリア支援企業',
    url: 'https://nands.tech/about',
    siteName: '株式会社エヌアンドエス',
    images: [
      {
        url: 'https://nands.tech/images/company.jpg',
        width: 1200,
        height: 630,
        alt: 'NANDS会社概要'
      }
    ],
    locale: 'ja_JP',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: '会社概要 | 株式会社エヌアンドエス',
    description: '2008年設立、AI技術で働く人の次のステージを支援する総合キャリア支援企業',
    images: ['https://nands.tech/images/company.jpg']
  },
  alternates: {
    canonical: 'https://nands.tech/about'
  }
};

export default function AboutPage() {
  return (
    <>
      {/* 🚀 Fragment Feed API Discovery - AIエンジン向け */}
      <link 
        rel="alternate" 
        type="application/json" 
        href="/api/about/fragments" 
        title="Fragment Feed - About Page AI引用最適化マップ"
      />
      <meta 
        name="fragment-feed" 
        content="/api/about/fragments" 
      />
      <meta 
        name="ai-optimization" 
        content="mike-king-theory,relevance-engineering,fragment-ids,company-profile" 
      />
      
      <div className="min-h-screen bg-white">
        
        {/* Table of Contents（ai-siteページ同様のおしゃれなナビゲーション） - ヘッダー直下に配置 */}
        <div className="bg-black py-4 border-b border-gray-800 mt-16">
          <div className="container mx-auto px-4">
            <TableOfContents items={aboutPageTocItems} compact={true} />
          </div>
        </div>
        
        {/* 既存の Fragment ID for Entity Map - Hidden from users（互換性維持） */}
        <div id="company" style={{ display: 'none' }} aria-hidden="true" />
        
        <main>
          {/* Heroセクション - 最重要コンテンツを最初に表示 */}
          <HeroSection />
          
          {/* Mission & Vision - #mission-vision */}
          <MissionVisionSection />
          
          {/* Enterprise AI Solutions - #enterprise-ai */}
          <EnterpriseAISection />
          
          {/* Business - #business */}
          <BusinessSection />
          
          {/* Company & Message - #company-message */}
          <CompanyMessageSection />
          
          {/* Official SNS - X (Twitter) - #company-official-x */}
          <OfficialSNSSection />
          
          {/* Representative SNS - LinkedIn - #representative-linkedin */}
          <RepresentativeSNSSection />
          
          {/* History & Access - #history-access */}
          <HistoryAccessSection />
        </main>

        {/* 🎯 Mike King理論準拠: 統合構造化データ（JSON-LD）*/}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "AboutPage",
                  "@id": "https://nands.tech/about#webpage",
                  "name": "会社概要 | 株式会社エヌアンドエス - AI技術で働く人の次のステージへ",
                  "description": "株式会社エヌアンドエスの会社概要。2008年設立、滋賀県を拠点に生成AI活用リスキリング研修、AIシステム開発、キャリアコンサルティング、退職支援事業を展開。代表取締役原田賢治のメッセージもご覧いただけます。",
                  "url": "https://nands.tech/about",
                  "inLanguage": "ja-JP",
                  "dateModified": new Date().toISOString(),
                  "mainEntity": {
                    "@type": "Organization",
                    "@id": "https://nands.tech/#organization"
                  },
                  "about": {
                    "@type": "Organization",
                    "@id": "https://nands.tech/#organization"
                  },
                  "isPartOf": {
                    "@type": "WebSite",
                    "@id": "https://nands.tech/#website",
                    "name": "株式会社エヌアンドエス",
                    "url": "https://nands.tech"
                  },
                  "hasPart": [
                    {
                      "@type": "WebPageElement",
                      "@id": "https://nands.tech/about#hero",
                      "name": "NANDS - Business Concept - メインビジュアル",
                      "description": "全ての働く人を次のステージへ - AI技術で働く人の次のステージを支援",
                      "url": "https://nands.tech/about#hero",
                      "about": {
                        "@type": "Thing",
                        "name": "NANDS Business Concept",
                        "description": "企業ビジョンとメインメッセージ"
                      },
                      "mentions": ["NANDS", "Business Concept", "次のステージ", "AI技術", "働く人"],
                      "isPartOf": { "@id": "https://nands.tech/about#webpage" }
                    },
                    {
                      "@type": "WebPageElement",
                      "@id": "https://nands.tech/about#mission-vision",
                      "name": "Mission & Vision - 企業使命とビジョン",
                      "description": "働く人々の可能性を解放し、キャリアの新たな地平を切り拓く。2030年日本の働き方を革新するリーディングカンパニーへ",
                      "url": "https://nands.tech/about#mission-vision",
                      "about": {
                        "@type": "Thing",
                        "name": "企業使命とビジョン",
                        "description": "Mission・Vision・キャリア革新・企業変革・社会貢献"
                      },
                      "mentions": ["Mission", "Vision", "2030年", "リーディングカンパニー", "DX推進", "AI活用"],
                      "isPartOf": { "@id": "https://nands.tech/about#webpage" }
                    },
                    {
                      "@type": "WebPageElement",
                      "@id": "https://nands.tech/about#enterprise-ai",
                      "name": "Enterprise AI Solutions - 企業向けAIソリューション",
                      "description": "AI導入コンサルティング・企業向けAI研修プログラム・AI組織構築支援。滋賀拠点から全国へサービス展開",
                      "url": "https://nands.tech/about#enterprise-ai",
                      "about": {
                        "@type": "Service",
                        "name": "Enterprise AI Solutions",
                        "description": "AI導入から組織構築まで包括的支援"
                      },
                      "mentions": ["AI導入コンサルティング", "企業向けAI研修", "AI組織構築", "ROI評価", "AI戦略", "AI人材育成"],
                      "isPartOf": { "@id": "https://nands.tech/about#webpage" }
                    },
                    {
                      "@type": "WebPageElement",
                      "@id": "https://nands.tech/about#business",
                      "name": "Business - 事業内容",
                      "description": "キャリア変革支援事業（生成AI活用リスキリング研修・キャリアコンサルティング）、キャリアサポート事業（退職支援）、システム開発事業、SNSコンサル事業、メディア運営事業",
                      "url": "https://nands.tech/about#business",
                      "about": {
                        "@type": "Thing",
                        "name": "事業内容",
                        "description": "6つの主要事業領域"
                      },
                      "mentions": ["リスキリング研修", "キャリアコンサルティング", "退職支援", "システム開発", "SNSコンサル", "メディア運営"],
                      "isPartOf": { "@id": "https://nands.tech/about#webpage" }
                    },
                    {
                      "@type": "WebPageElement",
                      "@id": "https://nands.tech/about#company-message",
                      "name": "Company & Message - 会社概要・代表メッセージ",
                      "description": "株式会社エヌアンドエス（2008年4月設立）。代表取締役原田賢治からの「寄り添い続ける！」メッセージ。本社：滋賀県大津市、東京支社：渋谷区",
                      "url": "https://nands.tech/about#company-message",
                      "about": {
                        "@type": "Organization",
                        "@id": "https://nands.tech/#organization"
                      },
                      "mentions": ["株式会社エヌアンドエス", "原田賢治", "2008年設立", "滋賀県大津市", "東京支社", "代表メッセージ", "寄り添い続ける"],
                      "isPartOf": { "@id": "https://nands.tech/about#webpage" }
                    },
                    {
                      "@type": "WebPageElement",
                      "@id": "https://nands.tech/about#company-official-x",
                      "name": "公式SNS - X (Twitter)アカウント",
                      "description": "@NANDS_AI - 株式会社エヌアンドエス公式Xアカウント。AI技術動向、サービス情報、業界インサイトを発信",
                      "url": "https://nands.tech/about#company-official-x",
                      "about": {
                        "@type": "Organization",
                        "@id": "https://nands.tech/#organization"
                      },
                      "mentions": ["X", "Twitter", "公式SNS", "NANDS_AI", "AI技術動向", "サービス情報", "業界インサイト"],
                      "sameAs": ["https://x.com/NANDS_AI"],
                      "isPartOf": { "@id": "https://nands.tech/about#webpage" }
                    },
                    {
                      "@type": "WebPageElement",
                      "@id": "https://nands.tech/about#representative-linkedin",
                      "name": "代表LinkedIn - 原田賢治個人アカウント",
                      "description": "原田賢治個人LinkedInアカウント。B2B専門性、業界インサイト、経営視点、レリバンスエンジニアリング専門家として発信",
                      "url": "https://nands.tech/about#representative-linkedin",
                      "about": {
                        "@type": "Person",
                        "@id": "https://nands.tech/author/harada-kenji"
                      },
                      "mentions": ["LinkedIn", "原田賢治", "B2B専門性", "業界インサイト", "経営視点", "レリバンスエンジニアリング"],
                      "sameAs": ["https://www.linkedin.com/in/%E8%B3%A2%E6%B2%BB-%E5%8E%9F%E7%94%B0-77a4b7353/"],
                      "isPartOf": { "@id": "https://nands.tech/about#webpage" }
                    },
                    {
                      "@type": "WebPageElement",
                      "@id": "https://nands.tech/about#history-access",
                      "name": "History & Access - 企業沿革・アクセス情報",
                      "description": "2008年設立から現在まで。デジタルマーケティング→人材育成→AIコンサルティング→AI事業本部設立。本社：滋賀県大津市、東京支社：渋谷区",
                      "url": "https://nands.tech/about#history-access",
                      "about": {
                        "@type": "Thing",
                        "name": "企業沿革とアクセス情報",
                        "description": "企業の歴史と所在地情報"
                      },
                      "mentions": ["企業沿革", "2008年設立", "デジタルマーケティング", "AIコンサルティング", "AI事業本部", "滋賀県大津市", "東京支社"],
                      "isPartOf": { "@id": "https://nands.tech/about#webpage" }
                    }
                  ]
                }
              ]
            })
          }}
        />
      </div>
    </>
  );
}