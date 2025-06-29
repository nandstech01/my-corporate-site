import { Metadata } from 'next'
import Script from 'next/script'
import AIOHeroSection from './components/AIOHeroSection'
import AIOServicesSection from './components/AIOServicesSection'
import AIOCaseStudiesSection from './components/AIOCaseStudiesSection'
import AIOMethodologySection from './components/AIOMethodologySection'
import AIOPricingSection from './components/AIOPricingSection'
import AIOContactSectionSSR from './components/AIOContactSectionSSR'

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
    'AI検索流入対策', 'Click-Recovery最適化', 'Trust Layer構築'
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
    'AIO対策 専門企業'
  ]
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

  return (
    <>
      {/* 統一構造化データ（JSON-LD） */}
      {unifiedData?.structuredData && (
        <Script
          id="unified-structured-data-aio-seo"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(unifiedData.structuredData, null, 2)
          }}
        />
      )}

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
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                  "@type": schema['@type'],
                  "@id": schema['@id'],
                  "name": schema.name,
                  "url": schema.url
                }
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
            "@type": "ProfessionalService",
            "name": "Mike King理論準拠レリバンスエンジニアリング",
            "description": "Mike King理論に基づくGEO（Generative Engine Optimization）・Topical Coverage・Fragment ID最適化専門サービス",
            "serviceType": "Relevance Engineering",
            "provider": {
              "@id": "https://nands.jp/#organization"
            },
            "areaServed": "JP",
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "レリバンスエンジニアリングサービス",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "GEO（Generative Engine Optimization）",
                    "description": "生成系検索エンジンに最適化されたTopical Coverage・Fragment ID・TOC構造の設計・実装"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "統一エンティティ関係性システム",
                    "description": "セマンティック構造化データ・JSON-LD統合・Schema.org拡張による検索エンジン理解度向上"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "AI検索流入対策",
                    "description": "ChatGPT・Perplexity・Google AI Overviews対応のClick-Recovery最適化"
                  }
                }
              ]
            },
            "knowsAbout": [
              "Mike King理論",
              "Relevance Engineering", 
              "GEO (Generative Engine Optimization)",
              "Topical Coverage",
              "Fragment ID最適化",
              "セマンティック構造化データ",
              "AI検索エンジン最適化"
            ],
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "reviewCount": "127",
              "bestRating": "5"
            }
          }, null, 2)
        }}
      />

      <main className="min-h-screen bg-white">
        {/* パンくずナビ */}
        <nav className="bg-gray-50 px-4 py-2">
          <div className="max-w-6xl mx-auto">
            <ol className="flex items-center space-x-2 text-sm">
              <li><a href="/" className="text-blue-600 hover:underline">ホーム</a></li>
              <li className="text-gray-500">›</li>
              <li><a href="/services" className="text-blue-600 hover:underline">サービス</a></li>
              <li className="text-gray-500">›</li>
              <li className="text-gray-900">AIO対策・レリバンスエンジニアリング</li>
            </ol>
          </div>
        </nav>

        {/* ヒーローセクション */}
        <section id="aio-hero">
          <AIOHeroSection />
        </section>

        {/* 目次（ヒーロー直後に配置） */}
        {unifiedData?.tableOfContents && unifiedData.tableOfContents.length > 0 && (
          <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="max-w-6xl mx-auto px-4">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <svg 
                      className="w-6 h-6 mr-3" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
                      />
                    </svg>
                    目次
                  </h2>
                  <p className="text-blue-100 mt-2">
                    このページの内容に素早くアクセス
                  </p>
                </div>
                
                <nav className="p-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    {unifiedData.tableOfContents.map((item, index) => (
                      <div key={index} className="group">
                        <a
                          href={`#${item.id}`}
                          className="flex items-start p-4 rounded-xl border border-gray-200 
                                   hover:border-blue-300 hover:bg-blue-50 transition-all duration-300
                                   group-hover:shadow-md"
                        >
                          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 
                                         rounded-lg flex items-center justify-center text-white text-sm font-bold mr-4">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 
                                         transition-colors mb-2 leading-tight">
                              {item.title}
                            </h3>
                          </div>
                          <svg 
                            className="w-5 h-5 text-gray-400 group-hover:text-blue-500 
                                     transition-colors flex-shrink-0 mt-1" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M9 5l7 7-7 7" 
                            />
                          </svg>
                        </a>
                        
                                                 {/* Subsections */}
                         {item.children && item.children.length > 0 && (
                           <div className="mt-3 ml-12 space-y-1">
                             {item.children.map((subsection, subIndex) => (
                               <a
                                 key={subIndex}
                                 href={`#${subsection.id}`}
                                 className="block text-sm text-gray-600 hover:text-blue-600 
                                          transition-colors hover:underline pl-2 border-l-2 
                                          border-gray-200 hover:border-blue-300
                                          py-1 hover:bg-blue-50 rounded"
                               >
                                 {subsection.title}
                               </a>
                             ))}
                           </div>
                         )}
                      </div>
                    ))}
                  </div>
                </nav>
              </div>
            </div>
          </section>
        )}

        {/* サービス一覧セクション */}
        <section id="aio-services">
          <AIOServicesSection />
        </section>

        {/* Methodology Section - Mike King理論 */}
        <section id="aio-methodology">
          <AIOMethodologySection />
        </section>

        {/* Case Studies Section */}
        <section id="aio-case-studies">
          <AIOCaseStudiesSection />
        </section>

        {/* Pricing Section */}
        <section id="aio-pricing">
          <AIOPricingSection />
        </section>

        {/* セマンティック関連リンクセクション */}
        {unifiedData?.semanticLinks && unifiedData.semanticLinks.length > 0 && (
          <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="container mx-auto px-4">
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: SemanticLinksComponent({ 
                    links: unifiedData.semanticLinks,
                    title: "🔗 レリバンスエンジニアリング関連サービス",
                    className: "max-w-6xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-blue-100"
                  })
                }}
              />
            </div>
          </section>
        )}

        {/* Contact Section */}
        <section id="aio-contact">
          <AIOContactSectionSSR />
        </section>

        {/* エンティティ関係性を活用したリッチスニペット強化 */}
        {unifiedData?.entityRelationships && (
          <Script
            id="entity-relationships-aio-seo"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "ItemList",
                "name": "レリバンスエンジニアリング関連エンティティ",
                "description": "Mike King理論に基づくレリバンスエンジニアリング・GEO関連のエンティティ関係性",
                "itemListElement": unifiedData.entityRelationships.map((entity, index) => ({
                  "@type": "ListItem",
                  "position": index + 1,
                  "item": {
                    "@id": entity["@id"],
                    "name": entity.name,
                    "knowsAbout": entity.knowsAbout
                  }
                }))
              }, null, 2)
            }}
          />
        )}

        {/* DB連携関連記事（レリバンスエンジニアリング・GEO関連） */}
        {unifiedData?.posts && unifiedData.posts.length > 0 && (
          <section className="py-16 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12">
                📖 レリバンスエンジニアリング・GEO関連記事
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {unifiedData.posts.slice(0, 6).map((post) => (
                  <a
                    key={post.id}
                    href={`/posts/${post.slug}`}
                    className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-indigo-100 hover:border-indigo-300"
                  >
                    <h3 className="font-semibold text-lg mb-2 text-gray-800">{post.title}</h3>
                    {post.excerpt && (
                      <p className="text-gray-600 text-sm mb-3">{post.excerpt}</p>
                    )}
                    {post.seo_keywords && post.seo_keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.seo_keywords.slice(0, 3).map((keyword) => (
                          <span
                            key={keyword}
                            className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    )}
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Mike King理論・GEO最適化の専門性アピール */}
        <section className="py-16 bg-white border-t border-gray-200">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              🎯 Mike King理論準拠 レリバンスエンジニアリング専門企業
            </h2>
            <p className="text-gray-600 max-w-4xl mx-auto leading-relaxed">
              当社は<strong>Mike King理論</strong>に基づく<strong>レリバンスエンジニアリング</strong>の専門企業として、
              <strong>GEO（Generative Engine Optimization）</strong>・<strong>Topical Coverage</strong>・
              <strong>Fragment ID最適化</strong>等の最新手法を用いて、
              AI検索エンジン（ChatGPT・Perplexity・Google AI Overviews）での上位表示を実現いたします。
            </p>
          </div>
        </section>

      </main>
    </>
  )
} 