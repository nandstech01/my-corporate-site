import { Metadata } from 'next'
import Script from 'next/script'
import AIOHeroSection from './components/AIOHeroSection'
import AIOHeroSectionSSR from './components/AIOHeroSectionSSR'
import AIOServicesSection from './components/AIOServicesSection'
import AIOCaseStudiesSection from './components/AIOCaseStudiesSection'
import AIOMethodologySection from './components/AIOMethodologySection'
import AIOPricingSection from './components/AIOPricingSection'
import AIOContactSectionSSR from './components/AIOContactSectionSSR'
import FeaturePreviewSection from '@/components/common/FeaturePreviewSection'

// Mike King理論準拠: 統一レリバンスエンジニアリング統合（本丸）
import { generateUnifiedPageData, PageContext, SemanticLinksComponent, TOCComponent } from '@/lib/structured-data/unified-integration'

// メタデータ（SEO強化）
export const metadata: Metadata = {
  title: 'AIO対策・GEO・レリバンスエンジニアリング | Mike King理論準拠 | 株式会社エヌアンドエス',
  description: 'Mike King理論準拠のレリバンスエンジニアリング専門サービス。GEO（Generative Engine Optimization）・Topical Coverage・Fragment ID最適化・セマンティック構造化データでAI検索エンジン（ChatGPT・Perplexity・Google AI Overviews）上位表示を実現。',
  keywords: 'レリバンスエンジニアリング,Mike King理論,GEO,Generative Engine Optimization,AIO対策,Topical Coverage,Fragment ID,セマンティック構造化データ,AI検索最適化,ChatGPT SEO,Perplexity最適化,Google AI Overviews',
  openGraph: {
    title: 'AIO対策・GEO・レリバンスエンジニアリング | Mike King理論準拠',
    description: 'Mike King理論準拠のレリバンスエンジニアリング専門サービス。GEO・Topical Coverage・Fragment ID最適化でAI検索上位表示を実現',
    type: 'website',
    url: 'https://nands.jp/aio-seo',
    images: [
      {
        url: '/images/aio-seo/mike-king-relevance-engineering.jpg',
        width: 1200,
        height: 630,
        alt: 'Mike King理論準拠レリバンスエンジニアリング'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AIO対策・GEO・レリバンスエンジニアリング | Mike King理論準拠',
    description: 'Mike King理論準拠のレリバンスエンジニアリング専門サービス。GEO・Topical Coverage・Fragment ID最適化でAI検索上位表示を実現',
    images: ['/images/aio-seo/mike-king-relevance-engineering.jpg']
  },
  alternates: {
    canonical: 'https://nands.jp/aio-seo'
  }
}

// ページコンテキスト定義（レリバンスエンジニアリングの本丸）
const pageContext: PageContext = {
  pageSlug: 'aio-seo',
  pageTitle: 'AIO対策・GEO・レリバンスエンジニアリング',
  keywords: [
    // Mike King理論コア
    'レリバンスエンジニアリング', 'Mike King理論', 'Relevance Engineering',
    
    // GEO（Generative Engine Optimization）コア
    'GEO', 'Generative Engine Optimization', '生成系検索最適化',
    'Topical Coverage', 'Explain-Then-List構造', 'Fragment ID最適化',
    
    // AI検索エンジン対策
    'AIO対策', 'AI Overviews最適化', 'ChatGPT SEO', 'Perplexity最適化',
    'セマンティック検索', 'エンティティSEO', 'ナレッジグラフ',
    
    // 技術実装
    'セマンティック構造化データ', 'JSON-LD統合', 'Schema.org拡張',
    '統一エンティティシステム', 'TOC自動生成', 'HowTo Schema',
    
    // サービス特化
    'AI検索流入対策', 'Click-Recovery最適化', 'Trust Layer構築',
    
    // ベクトルRAG統合（競合優位性の核心）
    'ベクトルRAG活用', 'トリプルRAGシステム', 'pgvector活用',
    'OpenAI Embeddings', 'セマンティック関連性', 'AI検索ランキング',
    'レリバンス最大化', 'コンテンツ最適化', 'エンティティ関係性'
  ],
  category: 'レリバンスエンジニアリング',
  businessId: undefined,
  categoryId: undefined,
  // Phase 3: GEO最適化対象クエリ
  targetQueries: [
    'レリバンスエンジニアリング実装',
    'Mike King理論 GEO対策',
    'AI検索エンジン最適化',
    'ChatGPT SEO対策',
    'Topical Coverage最適化',
    'Fragment ID SEO',
    'セマンティック構造化データ',
    'AIO対策 専門企業',
    'AI Overviews 上位表示',
    'Perplexity 最適化',
    'GEO対策 実装方法',
    'レリバンスエンジニアリング 成功事例'
  ],
  // Phase 4: AI検索・Trust Layer対応
  enableAISearchDetection: true,
  enableTrustSignals: true
}

// 統合データ取得（SSR）
async function getUnifiedData() {
  try {
    return await generateUnifiedPageData(pageContext)
  } catch (error) {
    console.error('統合データ取得エラー:', error)
    return null
  }
}

export default async function AIOPage() {
  // 統合レリバンスエンジニアリングデータを取得
  const unifiedData = await getUnifiedData()

  // ベクトルRAGシステム統合スキーマ（レリバンスエンジニアリングの核心）
  const vectorRAGLeverageSchema = {
    "@context": "https://schema.org",
    "@type": "DataFeed",
    "name": "レリバンスエンジニアリング専門ナレッジベース",
    "description": "株式会社エヌアンドエスのベクトルRAGシステムによるMike King理論・GEO対策・AI検索最適化専門知識データベース",
    "provider": {
      "@type": "Organization",
      "@id": "https://nands.tech/#organization"
    },
    "dataset": {
      "@type": "Dataset",
      "name": "Mike King Relevance Engineering Knowledge Base",
      "description": "15年間の実績とMike King理論完全準拠のレリバンスエンジニアリング専門データベース",
      "creator": {
        "@type": "Organization",
        "@id": "https://nands.tech/#organization"
      },
      "keywords": [
        "Mike King理論",
        "レリバンスエンジニアリング",
        "GEO対策",
        "AI検索最適化",
        "Fragment ID最適化",
        "Topical Coverage",
        "セマンティック構造化データ",
        "AI Overviews最適化"
      ],
      "temporalCoverage": "2009/2024",
      "spatialCoverage": {
        "@type": "Place",
        "name": "グローバル",
        "geo": {
          "@type": "GeoShape",
          "addressCountry": ["JP", "US", "GB"]
        }
      },
      "distribution": {
        "@type": "DataDownload",
        "encodingFormat": "application/json",
        "contentUrl": "https://nands.tech/api/search-rag"
      }
    },
    "about": [
      {
        "@type": "Thing",
        "name": "Mike King理論実装",
        "description": "iPullRank創設者Mike King氏のレリバンスエンジニアリング理論の実装方法"
      },
      {
        "@type": "Thing",
        "name": "GEO対策技術",
        "description": "Generative Engine Optimizationによる生成系AI検索エンジン最適化"
      },
      {
        "@type": "Thing",
        "name": "セマンティック構造化データ",
        "description": "意味的関連性を最大化する高度な構造化データ実装技術"
      }
    ]
  };

  return (
    <>
      {/* 統一構造化データ（Mike King理論準拠） */}
      {unifiedData?.structuredData && (
        <Script
          id="unified-structured-data-aio-seo"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(unifiedData.structuredData, null, 2)
          }}
        />
      )}

      {/* ベクトルRAGシステム統合スキーマ（競合優位性の核心） */}
      <Script
        id="vector-rag-leverage-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(vectorRAGLeverageSchema, null, 2)
        }}
      />

      {/* Phase 3: GEO最適化hasPartスキーマ（専用出力） */}
      {unifiedData?.geoOptimizedHasPart && (
        <Script
          id="geo-optimized-haspart-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(unifiedData.geoOptimizedHasPart.jsonLd, null, 2)
          }}
        />
      )}

      {/* hasPartスキーマ一覧（デバッグ用） */}
      {unifiedData?.hasPartSchemas && unifiedData.hasPartSchemas.length > 0 && (
        <Script
          id="haspart-schema-collection"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              "name": "ページセクション一覧",
              "numberOfItems": unifiedData.hasPartSchemas.length,
              "itemListElement": unifiedData.hasPartSchemas.map((schema, index) => ({
                "@type": schema['@type'],
                "@id": schema['@id'],
                "name": schema.name,
                "url": schema.url
              }))
            }, null, 2)
          }}
        />
      )}

      {/* Mike King理論専用構造化データ */}
      <Script
        id="mike-king-relevance-engineering-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "AIO対策・レリバンスエンジニアリング",
            "applicationCategory": "BusinessApplication",
            "applicationSubCategory": "SEO Optimization Tool",
            "operatingSystem": "Web-based",
            "programmingLanguage": ["JavaScript", "TypeScript", "Python"],
            "description": "Mike King理論準拠のレリバンスエンジニアリング・GEO最適化・AI検索エンジン対応の統合プラットフォーム。ベクトルRAGシステムによる競合優位性を確立。",
            "provider": {
              "@type": "Organization",
              "@id": "https://nands.tech/#organization",
              "name": "株式会社エヌアンドエス"
            },
            "offers": {
              "@type": "Offer",
              "name": "AIO対策・レリバンスエンジニアリング",
              "description": "Mike King理論準拠のAI検索最適化・GEO対策・レリバンスエンジニアリング。ベクトルRAGシステム統合による業界最高レベルの成果を保証。",
              "price": "300000",
              "priceCurrency": "JPY",
              "priceSpecification": {
                "@type": "PriceSpecification",
                "name": "レリバンスエンジニアリング基本パッケージ",
                "description": "Mike King理論準拠・GEO対策・Fragment ID最適化・セマンティック構造化データ実装"
              }
            },
            "featureList": [
              "Mike King理論準拠",
              "GEO最適化",
              "AI検索エンジン対応",
              "レリバンスエンジニアリング",
              "構造化データ最適化",
              "Topical Coverage",
              "Fragment ID最適化",
              "セマンティック構造化データ",
              "AI検索エンジン最適化",
              "ベクトルRAG統合",
              "トリプルRAGシステム活用",
              "pgvector セマンティック検索",
              "OpenAI Embeddings統合",
              "関連性スコア最大化",
              "AI検索ランキング向上"
            ],
            "softwareRequirements": [
              "Google Search Console",
              "Schema.org Validator",
              "Mike King理論フレームワーク",
              "iPullRank メソドロジー",
              "ベクトルRAGシステム",
              "pgvector",
              "OpenAI Embeddings API"
            ]
          }, null, 2)
        }}
      />

      <main className="min-h-screen bg-white">
        {/* AI検索流入対応: Click-Recovery Banner */}
        {unifiedData?.aiSearchDetection?.shouldShowBanner && (
          <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3">
            <div className="container mx-auto px-4 text-center">
              <p className="text-sm">
                🎯 AI検索からお越しですか？ 
                <strong className="ml-2">{unifiedData.aiSearchDetection.recoveryMessage.title}</strong>
                <span className="ml-2">{unifiedData.aiSearchDetection.recoveryMessage.message}</span>
              </p>
            </div>
          </section>
        )}

        {/* パンくずナビ */}
        <nav className="bg-gray-50 px-4 py-2">
          <div className="max-w-6xl mx-auto">
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
                <span className="text-gray-900" itemProp="name">AIO対策・レリバンスエンジニアリング</span>
                <meta itemProp="position" content="3" />
              </li>
            </ol>
          </div>
        </nav>

        {/* Fragment ID対応セクション構造 */}
        <article itemScope itemType="https://schema.org/WebPage">
          <meta itemProp="name" content="AIO対策・GEO・レリバンスエンジニアリング" />
          <meta itemProp="description" content="Mike King理論準拠のレリバンスエンジニアリング専門サービス。GEO・Topical Coverage・Fragment ID最適化・セマンティック構造化データでAI検索エンジン上位表示を実現。" />

          {/* ヒーローセクション */}
          <section id="hero-section" itemScope itemType="https://schema.org/WebPageElement">
            <meta itemProp="name" content="ヒーローセクション" />
          <AIOHeroSectionSSR />
        </section>

          {/* 目次（AI検索最適化） */}
        {unifiedData?.tableOfContents && unifiedData.tableOfContents.length > 0 && (
            <section id="table-of-contents" className="py-16 bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                      レリバンスエンジニアリング・Mike King理論サービス一覧
                  </h2>
                    <p className="text-purple-100 mt-2">業界最高レベルのAI検索最適化・GEO対策・Fragment ID最適化</p>
                </div>
                <nav className="p-8">
                    <div className="grid md:grid-cols-2 gap-4">
                    {unifiedData.tableOfContents.map((item, index) => (
                        <a
                          key={index}
                          href={`#${item.id}`}
                          className="flex items-start p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300 group"
                        >
                          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-4">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                              {item.title}
                            </h3>
                            {item.children && item.children.length > 0 && (
                              <ul className="mt-2 space-y-1">
                                {item.children.map((child, childIndex) => (
                                  <li key={childIndex}>
                                    <a 
                                      href={`#${child.id}`}
                                      className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
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

          {/* AIOサービスセクション */}
          <section id="aio-services" itemScope itemType="https://schema.org/WebPageElement">
            <meta itemProp="name" content="AIOサービス" />
          <AIOServicesSection />
        </section>

          {/* ケーススタディセクション */}
          <section id="case-studies" itemScope itemType="https://schema.org/WebPageElement">
            <meta itemProp="name" content="ケーススタディ" />
          <AIOCaseStudiesSection />
        </section>

          {/* メソドロジーセクション */}
          <section id="methodology" itemScope itemType="https://schema.org/WebPageElement">
            <meta itemProp="name" content="メソドロジー" />
            <AIOMethodologySection />
        </section>

          {/* ベクトルRAG統合の優位性セクション */}
          <section id="vector-rag-advantage" className="py-16 bg-gray-50" itemScope itemType="https://schema.org/WebPageElement">
            <meta itemProp="name" content="ベクトルRAG統合の優位性" />
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-12">🚀 ベクトルRAGシステム統合による競合優位性</h2>
                
                <div className="grid md:grid-cols-3 gap-8">
                  {/* トリプルRAGシステム */}
                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold mb-4 text-purple-600">🔗 トリプルRAGシステム</h3>
                    <p className="text-gray-600 mb-4">
                      自社RAG・トレンドRAG・YouTubeRAGの3つのRAGシステムを統合活用。業界最高レベルの関連性スコアを実現。
                    </p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• 42専門領域ナレッジベース</li>
                      <li>• リアルタイムトレンド反映</li>
                      <li>• 動画コンテンツ理解</li>
                      <li>• セマンティック関連性最大化</li>
                    </ul>
                  </div>

                  {/* pgvector活用 */}
                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold mb-4 text-pink-600">⚡ pgvector高精度検索</h3>
                    <p className="text-gray-600 mb-4">
                      PostgreSQL拡張のpgvectorとOpenAI Embeddingsを活用した高精度セマンティック検索を実装。
                    </p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• OpenAI text-embedding-3-large</li>
                      <li>• コサイン類似度最適化</li>
                      <li>• インデックス高速化</li>
                      <li>• リアルタイム更新対応</li>
                    </ul>
                  </div>

                  {/* AI検索ランキング向上 */}
                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold mb-4 text-indigo-600">📈 AI検索ランキング向上</h3>
                    <p className="text-gray-600 mb-4">
                      ベクトルRAGによる関連性最大化でChatGPT・Perplexity・AI Overviewsでの上位表示を実現。
                    </p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• ChatGPT検索最適化</li>
                      <li>• Perplexity上位表示</li>
                      <li>• AI Overviews引用獲得</li>
                      <li>• 関連性スコア最大化</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 料金プランセクション */}
          <section id="pricing" itemScope itemType="https://schema.org/WebPageElement">
            <meta itemProp="name" content="料金プラン" />
            <AIOPricingSection />
        </section>

          {/* セマンティックリンクセクション（ベクトルRAG活用） */}
          {unifiedData?.semanticLinks && unifiedData.semanticLinks.length > 0 && (
            <section id="related-services" className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto">
                  <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
                    🎯 関連するレリバンスエンジニアリングサービス
              </h2>
                  <p className="text-center text-gray-600 mb-8">
                    当社のベクトルRAGシステムが推奨するMike King理論関連サービス
                  </p>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {unifiedData.semanticLinks.map((link, index) => (
                  <a
                        key={index}
                        href={link.url}
                        className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 group"
                  >
                        <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors mb-2">
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
          <section id="contact" itemScope itemType="https://schema.org/WebPageElement">
            <meta itemProp="name" content="お問い合わせ" />
            <AIOContactSectionSSR />
        </section>
        </article>
      </main>
    </>
  );
} 