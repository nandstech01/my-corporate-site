import React from "react";
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { generateUnifiedPageData } from '@/lib/structured-data/unified-integration';
import ROICalculator from '@/components/corporate/ROICalculator';
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import ClientSideAnchorEnhancer from '@/components/ai-search/ClientSideAnchorEnhancer';

// Viewport設定
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2563eb' },
    { media: '(prefers-color-scheme: dark)', color: '#1e293b' }
  ],
  colorScheme: 'light dark',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://nands.tech'),
  title: {
    default: '法人向けAIリスキリング研修・業務効率化支援 | 株式会社エヌアンドエス',
    template: '%s | 株式会社エヌアンドエス - 法人向けAIソリューション'
  },
  description: '株式会社エヌアンドエスの法人向けAIリスキリング研修・業務効率化支援サービス。生成AIを活用した業務改善、DX推進、人材育成を通じて企業の競争力を高めます。企業規模や業種に合わせたカスタマイズ研修で、組織全体のAIリテラシー向上を実現。Mike King理論準拠のレリバンスエンジニアリング、GEO（Generative Engine Optimization）対応で、AI検索エンジンでの発見性も強化。',
  keywords: '法人向けAIリスキリング,企業向けAI研修,業務効率化,生成AI活用,人材育成,組織変革,デジタルトランスフォーメーション,DX推進,AI導入支援,AI活用コンサルティング,ChatGPT研修,プロンプトエンジニアリング,業務自動化,AIソリューション,システム開発,レリバンスエンジニアリング,GEO対策,AI検索最適化,LLMO,Fragment ID,TopicalCoverage,ExplainThenList,Mike King理論,iPullRank',
  authors: [{ name: '株式会社エヌアンドエス', url: 'https://nands.tech' }],
  creator: '株式会社エヌアンドエス',
  publisher: '株式会社エヌアンドエス',
  category: '法人向けAIソリューション',
  openGraph: {
    title: '法人向けAIリスキリング研修・業務効率化支援 | 株式会社エヌアンドエス',
    description: '株式会社エヌアンドエスの法人向けAIリスキリング研修・業務効率化支援サービス。生成AIを活用した業務改善、DX推進、人材育成を通じて企業の競争力を高めます。企業規模や業種に合わせたカスタマイズ研修で、組織全体のAIリテラシー向上を実現。Mike King理論準拠のレリバンスエンジニアリング、GEO（Generative Engine Optimization）対応で、AI検索エンジンでの発見性も強化。',
    url: 'https://nands.tech/corporate',
    siteName: '株式会社エヌアンドエス',
    images: [
      {
        url: '/images/corporate-ogp.jpg',
        width: 1200,
        height: 630,
        alt: '株式会社エヌアンドエス 法人向けAIリスキリング研修・業務効率化支援'
      }
    ],
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: '法人向けAIリスキリング研修・業務効率化支援 | 株式会社エヌアンドエス',
    description: '株式会社エヌアンドエスの法人向けAIリスキリング研修・業務効率化支援サービス。生成AIを活用した業務改善、DX推進、人材育成を通じて企業の競争力を高めます。Mike King理論準拠のレリバンスエンジニアリング、GEO（Generative Engine Optimization）対応で、AI検索エンジンでの発見性も強化。',
    images: ['/images/corporate-ogp.jpg'],
    site: '@nands_tech',
    creator: '@nands_tech',
  },
  alternates: {
    canonical: 'https://nands.tech/corporate',
    languages: {
      'ja-JP': 'https://nands.tech/corporate',
      'en-US': 'https://nands.tech/en/corporate'
    }
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'IO9fU_SSYnQy3hee-8zcGtWVbDMsopot5fU2kLBhw3k',
  },
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
    url: false
  },
  other: {
    'format-detection': 'telephone=no',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'application-name': 'N&S Corporate',
  },
}

// Mike King理論準拠SSR完全対応（デザイン100%維持）
const HeroSectionSSR = dynamic(() => import('./components/HeroSectionSSR'), {
  ssr: true,
  loading: () => (
    <section className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden bg-black">
      <div className="absolute inset-0 bg-black/70 z-[1]" />
      <div className="relative z-10 container mx-auto px-4 text-center pt-32 md:pt-40">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
          Corporate Solutions
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
          ビジネスの成長を加速させる、最先端のAIソリューションを提供します
        </p>
      </div>
    </section>
  )
});

const ServicesSection = dynamic(() => import('./components/ServicesSection'), {
  ssr: false
});

const CorporateProblems = dynamic(() => import('./components/CorporateProblems'), {
  ssr: false
});

// 軽量コンポーネントはSSR対応
const CaseStudiesSection = dynamic(() => import('./components/CaseStudiesSection'), {
  ssr: true,
  loading: () => (
    <section className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">導入事例</h2>
      </div>
    </section>
  )
});

const FaqSection = dynamic(() => import('./components/FaqSection'), {
  ssr: true,
  loading: () => (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">よくある質問</h2>
      </div>
    </section>
  )
});

const ContactSectionSSR = dynamic(() => import('./components/ContactSectionSSR'), {
  ssr: true,
  loading: () => (
    <section className="py-16 px-4 bg-gray-900 text-white">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold mb-8">AI導入に関するご相談</h2>
        <p className="text-gray-300 mb-8">企業のAI活用・DX推進を支援します</p>
      </div>
    </section>
  )
});

const CorporateMerits = dynamic(() => import('./components/CorporateMerits'), {
  ssr: true,
  loading: () => (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">導入のメリット</h2>
      </div>
    </section>
  )
});

const CorporateFlow = dynamic(() => import('./components/CorporateFlow'), {
  ssr: true,
  loading: () => (
    <section className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">導入の流れ</h2>
      </div>
    </section>
  )
});

export default async function CorporatePage() {
  // 統一システム適用（Mike King理論準拠）
  const pageData = await generateUnifiedPageData({
    pageSlug: 'corporate',
    pageTitle: '法人向けAIリスキリング研修・業務効率化支援',
    keywords: [
      '法人向けAIリスキリング',
      '企業向けAI研修', 
      '業務効率化',
      '生成AI活用',
      '人材育成',
      '組織変革',
      'デジタルトランスフォーメーション',
      'DX推進',
      'AI導入支援',
      'AI活用コンサルティング',
      'ChatGPT研修',
      'プロンプトエンジニアリング',
      '業務自動化',
      'AIソリューション',
      'システム開発',
      'レリバンスエンジニアリング',
      'GEO対策',
      'AI検索最適化',
      'LLMO',
      'Fragment ID',
      'TopicalCoverage',
      'ExplainThenList',
      'Mike King理論',
      'iPullRank'
    ],
    category: '法人向けAIソリューション',
    businessId: undefined,
    categoryId: undefined,
    // Mike King理論準拠: GEO最適化対象クエリ（AI検索エンジン上位表示）
    targetQueries: [
      '法人向けAI研修導入方法',
      '企業AI活用コンサルティング',
      'DX推進AI研修プログラム',
      '組織変革AI活用事例',
      'ChatGPT企業研修効果',
      'AI業務効率化成功事例',
      '生成AI人材育成プログラム',
      'プロンプトエンジニアリング企業研修'
    ],
    // Phase 4: AI検索・Trust Layer対応
    enableAISearchDetection: true,
    enableTrustSignals: true
  });

  // ベクトルRAGシステム統合（自社RAG最大活用）
  const vectorRAGSchema = {
    "@context": "https://schema.org",
    "@type": "DataFeed",
    "name": "企業向けAI研修ナレッジベース",
    "description": "株式会社エヌアンドエスのベクトルRAGシステムによる企業AI研修専門知識データベース",
    "provider": {
      "@type": "Organization",
      "@id": "https://nands.tech/#organization"
    },
    "dataset": {
      "@type": "Dataset",
      "name": "Corporate AI Training Knowledge Base",
      "description": "株式会社エヌアンドエスが15年間蓄積した企業向けAI研修専門データベース。法人向けAI研修、企業向け生成AI活用、DX推進プログラム、AI業務効率化、組織変革支援など42の専門領域をベクトル化。ChatGPT企業活用、プロンプトエンジニアリング、AI活用コンサルティング技術を集約。300社以上の導入実績をベースにした実践的AI研修カリキュラム、ROI測定手法、組織変革メソッドを包括する、業界最先端の企業AI研修専門知識データベース。",
      "creator": {
        "@type": "Organization",
        "@id": "https://nands.tech/#organization"
      },
      "keywords": [
        "法人向けAI研修",
        "企業向け生成AI活用",
        "DX推進プログラム",
        "AI業務効率化",
        "組織変革支援",
        "プロンプトエンジニアリング",
        "ChatGPT企業活用",
        "AI活用コンサルティング"
      ],
      "temporalCoverage": "2009/2024",
      "spatialCoverage": {
        "@type": "Place",
        "name": "日本全国",
        "geo": {
          "@type": "GeoShape",
          "addressCountry": "JP"
        }
      },
      "license": "https://creativecommons.org/licenses/by-nc-sa/4.0/",
      "distribution": {
        "@type": "DataDownload",
        "encodingFormat": "application/json",
        "contentUrl": "https://nands.tech/api/search-rag"
      }
    },
    "about": [
      {
        "@type": "Thing",
        "name": "企業向けAI研修プログラム",
        "description": "42の専門領域をカバーする包括的AI研修カリキュラム"
      },
      {
        "@type": "Thing", 
        "name": "DX推進AI活用支援",
        "description": "組織全体のデジタルトランスフォーメーション推進"
      },
      {
        "@type": "Thing",
        "name": "生成AI業務効率化",
        "description": "ChatGPT・Claude等を活用した業務プロセス最適化"
      }
    ]
  };

  return (
    <>
      {/* 統一構造化データ（Mike King理論準拠） */}
      {pageData?.structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(pageData.structuredData, null, 2)
          }}
        />
      )}

      {/* ベクトルRAGシステム統合スキーマ（競合優位性の核心） */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(vectorRAGSchema, null, 2)
        }}
      />

      {/* Phase 3: GEO最適化hasPartスキーマ（AI検索エンジン最適化） */}
      {pageData?.geoOptimizedHasPart && (
        <script
          id="geo-optimized-haspart-corporate"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(pageData.geoOptimizedHasPart.jsonLd, null, 2)
          }}
        />
      )}

      {/* 法人向けAI研修専用スキーマ（E-E-A-T最大化） */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            "name": "株式会社エヌアンドエス AI研修部門",
            "alternateName": "N&S Corporate AI Training Division",
            "description": "15年の実績を持つ企業向けAI研修・リスキリング専門組織。42の専門領域で組織変革を支援。",
            "foundingDate": "2009",
            "areaServed": {
              "@type": "Country",
              "name": "日本"
            },
            "offers": [
              {
                "@type": "EducationalOccupationalProgram",
                "name": "企業向けAIリスキリング研修プログラム",
                "description": "生成AI活用による業務効率化・組織変革を実現する包括的研修プログラム",
                "provider": {
                  "@type": "Organization",
                  "@id": "https://nands.tech/#organization"
                },
                "educationalCredentialAwarded": "AI活用認定資格",
                "numberOfCredits": 42,
                "timeToComplete": "P3M",
                "programPrerequisites": "基本的なPC操作スキル",
                "occupationalCategory": [
                  "AI活用推進担当者",
                  "DX推進リーダー", 
                  "業務効率化スペシャリスト",
                  "組織変革マネージャー"
                ],
                "competencyRequired": [
                  "ChatGPT活用スキル",
                  "プロンプトエンジニアリング",
                  "AI業務自動化",
                  "データ分析AI活用",
                  "生成AI戦略立案"
                ],
                "educationalProgramMode": [
                  "オンライン研修",
                  "対面研修",
                  "ハイブリッド研修",
                  "カスタマイズ研修"
                ]
              }
            ],
            "hasCredential": [
              {
                "@type": "EducationalOccupationalCredential",
                "name": "企業AI活用マスター認定",
                "description": "企業における生成AI活用のエキスパート認定資格",
                "credentialCategory": "Professional Certification",
                "competencyRequired": [
                  "ChatGPT高度活用",
                  "AI業務プロセス設計", 
                  "組織AI導入戦略",
                  "ROI測定・改善"
                ]
              }
            ],
            "alumni": [
              {
                "@type": "Person",
                "name": "企業AI活用成功事例集",
                "description": "15年間で300社以上の企業AI導入成功実績"
              }
            ]
          }, null, 2)
        }}
      />

      <main className="min-h-screen bg-white">
        {/* AI検索流入対応: Click-Recovery Banner */}
        {pageData?.aiSearchDetection?.shouldShowBanner && (
          <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3">
            <div className="container mx-auto px-4 text-center">
              <p className="text-sm">
                🤖 AI検索からお越しですか？ 
                <strong className="ml-2">{pageData.aiSearchDetection.recoveryMessage.title}</strong>
                <span className="ml-2">{pageData.aiSearchDetection.recoveryMessage.message}</span>
              </p>
            </div>
          </section>
        )}

        {/* パンくずナビ（構造化データ対応） */}
        <nav className="bg-gray-50 px-4 py-3 border-b">
          <div className="container mx-auto">
            <ol className="flex items-center space-x-2 text-sm" itemScope itemType="https://schema.org/BreadcrumbList">
              <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <a href="/" className="text-blue-600 hover:underline" itemProp="item">
                  <span itemProp="name">ホーム</span>
                </a>
                <meta itemProp="position" content="1" />
              </li>
              <li className="text-gray-500">›</li>
              <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <a href="/services" className="text-blue-600 hover:underline" itemProp="item">
                  <span itemProp="name">サービス</span>
                </a>
                <meta itemProp="position" content="2" />
              </li>
              <li className="text-gray-500">›</li>
              <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <span className="text-gray-900" itemProp="name">法人向けAI研修</span>
                <meta itemProp="position" content="3" />
              </li>
            </ol>
          </div>
        </nav>

        {/* Fragment ID対応セクション構造 */}
        <article itemScope itemType="https://schema.org/WebPage">
          <meta itemProp="name" content="法人向けAIリスキリング研修・業務効率化支援" />
          <meta itemProp="description" content="株式会社エヌアンドエスの法人向けAIリスキリング研修・業務効率化支援サービス。生成AIを活用した業務改善、DX推進、人材育成を通じて企業の競争力を高めます。" />

          {/* ヒーローセクション */}
          <section id="hero-section" itemScope itemType="https://schema.org/WebPageElement">
            <meta itemProp="name" content="ヒーローセクション" />
            <HeroSectionSSR />
          </section>

          {/* 目次（AI検索最適化） */}
          {pageData?.tableOfContents && pageData.tableOfContents.length > 0 && (
            <section id="table-of-contents" className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                    <h2 className="text-2xl font-bold text-white flex items-center">
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      法人向けAI研修サービス一覧
                    </h2>
                    <p className="text-blue-100 mt-2">15年の実績と42の専門領域で企業の AI 活用を支援</p>
                  </div>
                  <nav className="p-8">
                    <div className="grid md:grid-cols-2 gap-4">
                      {pageData.tableOfContents.map((item, index) => (
                        <a
                          key={index}
                          href={`#${item.id}`}
                          className="flex items-start p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 group"
                        >
                          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-4">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {item.title}
                            </h3>
                            {item.children && item.children.length > 0 && (
                              <ul className="mt-2 space-y-1">
                                {item.children.map((child, childIndex) => (
                                  <li key={childIndex}>
                                    <a 
                                      href={`#${child.id}`}
                                      className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                                    >
                                      • {child.title}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </a>
                      ))}
                    </div>
                  </nav>
                </div>
              </div>
            </section>
          )}

          {/* サービス概要セクション */}
          <section id="services-overview" itemScope itemType="https://schema.org/WebPageElement">
            <meta itemProp="name" content="サービス概要" />
            <ServicesSection />
          </section>

          {/* 企業の課題セクション */}
          <section id="corporate-problems" itemScope itemType="https://schema.org/WebPageElement">
            <meta itemProp="name" content="企業の課題" />
            <CorporateProblems />
          </section>

          {/* 導入事例セクション */}
          <section id="case-studies" itemScope itemType="https://schema.org/WebPageElement">
            <meta itemProp="name" content="導入事例" />
            <CaseStudiesSection />
          </section>

          {/* よくある質問セクション */}
          <section id="faq-section" itemScope itemType="https://schema.org/WebPageElement">
            <meta itemProp="name" content="よくある質問" />
            <FaqSection />
          </section>

          {/* 導入のメリットセクション */}
          <section id="corporate-merits" itemScope itemType="https://schema.org/WebPageElement">
            <meta itemProp="name" content="導入のメリット" />
            <CorporateMerits />
          </section>

          {/* 導入フローセクション */}
          <section id="corporate-flow" itemScope itemType="https://schema.org/WebPageElement">
            <meta itemProp="name" content="導入の流れ" />
            <CorporateFlow />
          </section>

          {/* ROI計算ツール */}
          <section id="roi-calculator" className="py-16 bg-gray-50" itemScope itemType="https://schema.org/WebPageElement">
            <meta itemProp="name" content="ROI計算ツール" />
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-12">AI研修導入効果計算ツール</h2>
                <ROICalculator />
              </div>
            </div>
          </section>

          {/* セマンティックリンクセクション（ベクトルRAG活用） */}
          {pageData?.semanticLinks && pageData.semanticLinks.length > 0 && (
            <section id="related-services" className="py-16 bg-white">
              <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto">
                  <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
                    🤖 関連するAIソリューション
                  </h2>
                  <p className="text-center text-gray-600 mb-8">
                    当社のベクトルRAGシステムが推奨する関連サービス
                  </p>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pageData.semanticLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group"
                      >
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                          {link.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          関連性スコア: {link.relevanceScore?.toFixed(2)}
                        </p>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* お問い合わせセクション */}
          <section id="contact-section" itemScope itemType="https://schema.org/WebPageElement">
            <meta itemProp="name" content="お問い合わせ" />
            <ContactSectionSSR />
          </section>
        </article>
      </main>
    </>
  );
}
