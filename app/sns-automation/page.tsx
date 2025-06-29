import React, { Suspense } from 'react';
import { Metadata } from 'next'
import { generateUnifiedPageData } from '@/lib/structured-data/unified-integration'
import { supabase } from '@/lib/supabase/supabase'
import SNSHeroSectionSSR from './components/SNSHeroSectionSSR';
import SNSServicesSection from './components/SNSServicesSection';
import SNSTechStack from './components/SNSTechStack';
import SNSShowcase from './components/SNSShowcase';
import SNSPricingSection from './components/SNSPricingSection';
import SNSContactSectionSSR from './components/SNSContactSectionSSR';

export const metadata: Metadata = {
  title: 'SNS自動化システム開発サービス | X・Instagram・Facebook対応AI投稿管理 | 株式会社エヌアンドエス',
  description: 'X（Twitter）、Instagram、FacebookなどのSNS投稿を自動化し、マーケティング効果を最大化するシステムを開発。AI分析、スケジューリング、エンゲージメント300%向上の実績。7プラットフォーム対応。',
  keywords: [
    'SNS自動化',
    'X自動化',
    'Twitter自動化',
    'Instagram自動化',
    'Facebook自動化',
    'SNSマーケティング',
    'API連携',
    '投稿自動化',
    'エンゲージメント分析',
    'トレンドリサーチ',
    'スケジューリング機能'
  ],
  openGraph: {
    title: 'SNS自動化システム開発サービス | X・Instagram・Facebook対応AI投稿管理',
    description: 'X（Twitter）、Instagram、FacebookなどのSNS投稿を自動化し、マーケティング効果を最大化するシステムを開発。AI分析、スケジューリング、エンゲージメント300%向上の実績。',
    url: 'https://nands.tech/sns-automation',
    siteName: '株式会社エヌアンドエス',
    images: [
      {
        url: '/images/sns-automation-og.jpg',
        width: 1200,
        height: 630,
        alt: 'SNS自動化システム開発サービス - X・Instagram・Facebook AI投稿管理',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SNS自動化システム開発サービス | X・Instagram・Facebook対応AI投稿管理',
    description: 'X（Twitter）、Instagram、FacebookなどのSNS投稿を自動化し、マーケティング効果を最大化するシステムを開発。AI分析、スケジューリング、エンゲージメント300%向上の実績。',
    images: ['/images/sns-automation-og.jpg'],
  },
}

// ページコンテキスト定義
const pageContext = {
  pageSlug: 'sns-automation',
  pageName: 'sns-automation',
  pageTitle: 'SNS自動化システム開発サービス',
  businessDomain: 'デジタルマーケティング',
  serviceType: 'SNS自動化システム開発',
  keywords: [
    'SNS自動化', 'X自動化', 'Twitter自動化', 'Instagram自動化', 'Facebook自動化',
    'SNSマーケティング', 'API連携', '投稿自動化', 'エンゲージメント分析'
  ],
  primaryKeywords: [
    'SNS自動化', 'X自動化', 'Twitter自動化', 'Instagram自動化', 'Facebook自動化',
    'SNSマーケティング', 'API連携', '投稿自動化', 'エンゲージメント分析'
  ],
  category: 'デジタルマーケティング',
  targetAudience: ['SNSマーケティング担当者', 'デジタルマーケター', 'ソーシャルメディア管理者', 'コンテンツマーケター'],
  painPoints: [
    '複数SNSの手動投稿負荷',
    'マルチプラットフォーム管理の複雑性',
    'エンゲージメント分析の困難さ',
    '最適投稿タイミングの判断'
  ],
  solutions: [
    '7プラットフォーム同時投稿自動化',
    'AI分析によるエンゲージメント最適化',
    'トレンドリサーチ機能搭載',
    'スケジューリング自動管理'
  ],
  benefits: [
    '300%エンゲージメント向上',
    '100%完全自動化対応',
    '7プラットフォーム統合管理',
    'ROI分析・レポート自動生成'
  ]
}

export default async function SNSAutomationPage() {
  // 統合データ生成
  const unifiedData = await generateUnifiedPageData(pageContext)
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* パンくずリスト */}
      <div className="bg-gray-900/50 border-b border-gray-700/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <a href="/" className="inline-flex items-center text-sm font-medium text-gray-300 hover:text-blue-400">
                  ホーム
                </a>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <a href="/services" className="ml-1 text-sm font-medium text-gray-300 hover:text-blue-400 md:ml-2">
                    サービス
                  </a>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-400 md:ml-2">
                    SNS自動化システム開発
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

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

      {/* ヒーローセクション */}
      <section id="hero-section">
        <SNSHeroSectionSSR />
      </section>

      {/* 目次（ヒーロー直後に配置） */}
      {unifiedData.tableOfContents && unifiedData.tableOfContents.length > 0 && (
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

      {/* サービス紹介セクション */}
      <section id="services-section">
        <SNSServicesSection />
      </section>

      {/* 技術スタックセクション */}
      <section id="tech-stack-section">
        <SNSTechStack />
      </section>

      {/* 実績ショーケースセクション */}
      <section id="showcase-section">
        <SNSShowcase />
      </section>

      {/* 料金プランセクション */}
      <section id="pricing-section">
        <SNSPricingSection />
      </section>

      {/* セマンティック内部リンクセクション */}
      {unifiedData.semanticLinks.length > 0 && (
        <section className="py-16 bg-gray-800/50 border-t border-gray-700/50" id="related-services-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
              関連マーケティング・開発サービス
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {unifiedData.semanticLinks.slice(0, 6).map((link, index) => (
                <div key={index} className="bg-gray-900/60 border border-gray-700/50 p-6 hover:shadow-lg hover:border-blue-500/30 transition-all backdrop-blur-sm">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    <a href={link.url} className="hover:text-blue-400 transition-colors">
                      {link.title}
                    </a>
                  </h3>
                  <p className="text-gray-300 text-sm mb-4">
                    {link.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {link.keywords.slice(0, 3).map((keyword, kidx) => (
                      <span key={kidx} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs font-medium">
                        {keyword}
                      </span>
                    ))}
                  </div>
                  <a
                    href={link.url}
                    className="inline-flex items-center text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors"
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
      <Suspense fallback={<div className="py-16 text-center text-white">読み込み中...</div>}>
        <RelatedArticlesSection businessDomain="デジタルマーケティング" serviceType="SNS自動化システム開発" />
      </Suspense>

      {/* お問い合わせセクション */}
      <section id="contact-section">
        <SNSContactSectionSSR />
      </section>
    </main>
  );
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
    // SNS・マーケティング・自動化関連記事を取得
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
      .or('seo_keywords.cs.{SNS},seo_keywords.cs.{マーケティング},seo_keywords.cs.{自動化},seo_keywords.cs.{Twitter},seo_keywords.cs.{Instagram}')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(6)

    if (!posts || posts.length === 0) {
      return null
    }

    return (
      <section className="py-16 bg-gray-900/70" id="related-articles-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
            SNS・マーケティング自動化関連記事
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article key={post.id} className="bg-gray-800/50 border border-gray-700/50 hover:shadow-lg hover:border-blue-500/30 transition-all backdrop-blur-sm">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    {post.categories && Array.isArray(post.categories) && post.categories.length > 0 && (
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs font-medium">
                        {post.categories[0].name}
                      </span>
                    )}
                    {post.categories && !Array.isArray(post.categories) && (
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs font-medium">
                        {(post.categories as any).name}
                      </span>
                    )}
                    <time className="text-xs text-gray-400">
                      {new Date(post.published_at).toLocaleDateString('ja-JP')}
                    </time>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2">
                    <a href={`/posts/${post.slug}`} className="hover:text-blue-400 transition-colors">
                      {post.title}
                    </a>
                  </h3>
                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  {post.seo_keywords && post.seo_keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.seo_keywords.slice(0, 3).map((keyword: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs">
                          #{keyword}
                        </span>
                      ))}
                    </div>
                  )}
                  <a
                    href={`/posts/${post.slug}`}
                    className="inline-flex items-center text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors"
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