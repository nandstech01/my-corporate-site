import { Metadata } from 'next'
import { Suspense } from 'react'
import { generateUnifiedPageData } from '@/lib/structured-data/unified-integration'
import { supabase } from '@/lib/supabase/supabase'
import ChatbotHeroSection from './components/ChatbotHeroSection'
import ChatbotServicesSection from './components/ChatbotServicesSection'
import ChatbotTechStack from './components/ChatbotTechStack'
import ChatbotShowcase from './components/ChatbotShowcase'
import ChatbotPricingSection from './components/ChatbotPricingSection'
import ChatbotContactSectionSSR from './components/ChatbotContactSectionSSR'

export const metadata: Metadata = {
  title: 'チャットボット開発サービス | GPT-4活用の高性能AI自動応答システム | 株式会社エヌアンドエス',
  description: 'GPT-4を活用した高性能チャットボット開発。24時間自動応答、多言語対応、カスタマーサポート業務効率化を実現。6つの業界別特化ソリューションで80%の工数削減を達成。',
  keywords: [
    'チャットボット開発',
    'GPT-4',
    'AI開発',
    '自動応答システム',
    'カスタマーサポート',
    '多言語対応',
    '業務効率化',
    'FAQ自動応答',
    'ECサイト販売ボット',
    '社内ヘルプデスク',
    'データ分析ボット'
  ],
  openGraph: {
    title: 'チャットボット開発サービス | GPT-4活用の高性能AI自動応答システム',
    description: 'GPT-4を活用した高性能チャットボット開発。24時間自動応答、多言語対応、カスタマーサポート業務効率化を実現。',
    url: 'https://nands.tech/chatbot-development',
    siteName: '株式会社エヌアンドエス',
    images: [
      {
        url: '/images/chatbot-og.jpg',
        width: 1200,
        height: 630,
        alt: 'チャットボット開発サービス - GPT-4活用AI自動応答システム',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'チャットボット開発サービス | GPT-4活用の高性能AI自動応答システム',
    description: 'GPT-4を活用した高性能チャットボット開発。24時間自動応答、多言語対応、カスタマーサポート業務効率化を実現。',
    images: ['/images/chatbot-og.jpg'],
  },
}

// ページコンテキスト定義
const pageContext = {
  pageSlug: 'chatbot-development',
  pageName: 'chatbot-development',
  pageTitle: 'チャットボット開発サービス',
  businessDomain: 'AI・機械学習',
  serviceType: 'チャットボット開発',
  keywords: [
    'チャットボット開発', 'GPT-4', 'AI自動応答', 'カスタマーサポート',
    '多言語対応', '業務効率化', 'FAQ自動応答', 'ECサイトボット'
  ],
  primaryKeywords: [
    'チャットボット開発', 'GPT-4', 'AI自動応答', 'カスタマーサポート',
    '多言語対応', '業務効率化', 'FAQ自動応答', 'ECサイトボット'
  ],
  category: 'AI・機械学習',
  targetAudience: ['企業のカスタマーサポート担当者', 'ECサイト運営者', '社内IT担当者', '教育機関担当者'],
  painPoints: [
    '24時間対応の人的コスト',
    '多言語サポートの困難さ',
    '繰り返し質問への対応負荷',
    'カスタマーサポート品質の一貫性'
  ],
  solutions: [
    'GPT-4による高精度自動応答',
    '10言語対応チャットボット',
    'FAQ自動分類・振り分け',
    '24時間365日安定稼働'
  ],
  benefits: [
    '80%の工数削減実績',
    '95%の顧客満足度達成',
    '60%のコスト削減',
    '24時間自動対応'
  ]
}

export default async function ChatbotDevelopmentPage() {
  // 統合データ生成
  const unifiedData = await generateUnifiedPageData(pageContext)
  
  return (
    <main className="min-h-screen bg-white">
      {/* 統一構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            unifiedData.structuredData.service,
            unifiedData.structuredData.softwareApplication,
            unifiedData.structuredData.breadcrumbs,
            unifiedData.structuredData.faq,
          ].filter(Boolean))
        }}
      />

      {/* TOC（目次）ナビゲーション */}
      <div className="fixed top-1/2 right-8 transform -translate-y-1/2 z-40 hidden lg:block">
        <nav className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-4 max-w-xs">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">目次</h3>
          <ul className="space-y-2 text-sm">
            {unifiedData.tableOfContents.map((item, index) => (
              <li key={index}>
                <a
                  href={`#${item.id}`}
                  className="block text-gray-600 hover:text-blue-600 transition-colors py-1"
                >
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* パンくずリスト */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <a href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
                  ホーム
                </a>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <a href="/services" className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2">
                    サービス
                  </a>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                    チャットボット開発
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* ヒーローセクション */}
      <section id="hero-section">
        <ChatbotHeroSection />
      </section>

      {/* サービス紹介セクション */}
      <section id="services-section">
        <ChatbotServicesSection />
      </section>

      {/* 技術スタックセクション */}
      <section id="tech-stack-section">
        <ChatbotTechStack />
      </section>

      {/* 実績ショーケースセクション */}
      <section id="showcase-section">
        <ChatbotShowcase />
      </section>

      {/* 料金プランセクション */}
      <section id="pricing-section">
        <ChatbotPricingSection />
      </section>

      {/* セマンティック内部リンクセクション */}
      {unifiedData.semanticLinks.length > 0 && (
        <section className="py-16 bg-gray-50 border-t border-gray-200" id="related-services-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
              関連サービス・ソリューション
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {unifiedData.semanticLinks.slice(0, 6).map((link, index) => (
                <div key={index} className="bg-white border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    <a href={link.url} className="hover:text-blue-600 transition-colors">
                      {link.title}
                    </a>
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {link.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {link.keywords.slice(0, 3).map((keyword, kidx) => (
                      <span key={kidx} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-medium">
                        {keyword}
                      </span>
                    ))}
                  </div>
                  <a
                    href={link.url}
                    className="inline-flex items-center text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
                  >
                    詳細を見る
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* データベース連携記事表示 */}
      <Suspense fallback={<div className="py-16 text-center">読み込み中...</div>}>
        <RelatedArticlesSection businessDomain="AI・機械学習" serviceType="チャットボット開発" />
      </Suspense>

      {/* お問い合わせセクション */}
      <section id="consultation-section">
        <ChatbotContactSectionSSR />
      </section>
    </main>
  )
}

// データベース連携記事表示コンポーネント
async function RelatedArticlesSection({ 
  businessDomain, 
  serviceType 
}: { 
  businessDomain: string
  serviceType: string 
}) {
  try {
    // チャットボット関連記事を取得
    const { data: posts } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        excerpt,
        slug,
        published_at,
        seo_keywords,
        categories (
          name,
          slug
        )
      `)
      .contains('seo_keywords', ['チャットボット'])
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(6)

    if (!posts || posts.length === 0) {
      return null
    }

    return (
      <section className="py-16 bg-white" id="related-articles-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
            チャットボット開発関連記事
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article key={post.id} className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    {post.categories && Array.isArray(post.categories) && post.categories.length > 0 && (
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-medium">
                        {post.categories[0].name}
                      </span>
                    )}
                    {post.categories && !Array.isArray(post.categories) && (
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-medium">
                        {(post.categories as any).name}
                      </span>
                    )}
                    <time className="text-xs text-gray-500">
                      {new Date(post.published_at).toLocaleDateString('ja-JP')}
                    </time>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                    <a href={`/posts/${post.slug}`} className="hover:text-blue-600 transition-colors">
                      {post.title}
                    </a>
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  {post.seo_keywords && post.seo_keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.seo_keywords.slice(0, 3).map((keyword: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-gray-50 text-gray-600 text-xs">
                          #{keyword}
                        </span>
                      ))}
                    </div>
                  )}
                  <a
                    href={`/posts/${post.slug}`}
                    className="inline-flex items-center text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
                  >
                    続きを読む
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    )
  } catch (error) {
    console.error('Error fetching related articles:', error)
    return null
  }
} 