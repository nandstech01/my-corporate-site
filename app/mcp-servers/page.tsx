import React, { Suspense } from 'react';
import { Metadata } from 'next'
import { generateUnifiedPageData } from '@/lib/structured-data/unified-integration'
import { supabase } from '@/lib/supabase/supabase'
import MCPHeroSectionSSR from './components/MCPHeroSectionSSR';
import MCPServicesSection from './components/MCPServicesSection';
import MCPTechStack from './components/MCPTechStack';
import MCPShowcase from './components/MCPShowcase';
import MCPPricingSection from './components/MCPPricingSection';
import MCPContactSectionSSR from './components/MCPContactSectionSSR';
import ClientSideAnchorEnhancer from '@/components/ai-search/ClientSideAnchorEnhancer';
import FeaturePreviewSection from '@/components/common/FeaturePreviewSection';

export const metadata: Metadata = {
  title: 'MCPサーバー開発サービス | Model Context Protocol最新技術でAI統合基盤を構築 | 株式会社エヌアンドエス',
  description: 'Model Context Protocol（MCP）による最新のAIシステム連携サーバー開発。6つの専門特化ソリューションで高度なAPI統合、データベース連携、セキュリティ機能を実現。',
  keywords: [
    'MCPサーバー開発',
    'Model Context Protocol',
    'AI連携システム',
    'プロトコル開発',
    'AIシステム統合',
    'API統合サーバー',
    'データベース統合MCP',
    'セキュリティMCP',
    'リアルタイム通信',
    'ファイルシステムMCP',
    '監視ログMCP'
  ],
  openGraph: {
    title: 'MCPサーバー開発サービス | Model Context Protocol最新技術でAI統合基盤を構築',
    description: 'Model Context Protocol（MCP）による最新のAIシステム連携サーバー開発。6つの専門特化ソリューションで高度なAPI統合、データベース連携、セキュリティ機能を実現。',
    url: 'https://nands.tech/mcp-servers',
    siteName: '株式会社エヌアンドエス',
    images: [
      {
        url: '/images/mcp-servers-og.jpg',
        width: 1200,
        height: 630,
        alt: 'MCPサーバー開発サービス - Model Context Protocol AI統合基盤',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MCPサーバー開発サービス | Model Context Protocol最新技術でAI統合基盤を構築',
    description: 'Model Context Protocol（MCP）による最新のAIシステム連携サーバー開発。6つの専門特化ソリューションで高度なAPI統合、データベース連携、セキュリティ機能を実現。',
    images: ['/images/mcp-servers-og.jpg'],
  },
  alternates: {
    canonical: 'https://nands.tech/mcp-servers',
  },
}

// ページコンテキスト定義
const pageContext = {
  pageSlug: 'mcp-servers',
  pageName: 'mcp-servers',
  pageTitle: 'MCPサーバー開発サービス',
  businessDomain: 'AI・機械学習',
  serviceType: 'MCPサーバー開発',
  keywords: [
    'MCPサーバー開発', 'Model Context Protocol', 'AI連携システム', 'プロトコル開発',
    'AIシステム統合', 'API統合サーバー', 'データベース統合MCP', 'セキュリティMCP'
  ],
  primaryKeywords: [
    'MCPサーバー開発', 'Model Context Protocol', 'AI連携システム', 'プロトコル開発',
    'AIシステム統合', 'API統合サーバー', 'データベース統合MCP', 'セキュリティMCP'
  ],
  category: 'AI・機械学習',
  targetAudience: ['AI開発者', 'システム統合担当者', 'エンタープライズ開発チーム', 'プロトコル技術者'],
  painPoints: [
    'AIシステム間の連携複雑性',
    '標準化されていない通信プロトコル',
    'スケーラビリティの限界',
    'セキュリティとパフォーマンスの両立'
  ],
  solutions: [
    'Model Context Protocol標準実装',
    '6つの専門特化MCPサーバー',
    'リアルタイム高速通信',
    'エンタープライズ級セキュリティ'
  ],
  benefits: [
    'AIシステム統合の標準化',
    '開発・保守コスト大幅削減',
    '将来的な機能拡張対応',
    'エンタープライズレベル信頼性'
  ]
}

export default async function MCPServersPage() {
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
                  <a href="/#services" className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2">
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
                    MCPサーバー開発
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Jump-Link CTA強化システム（Googleガイドライン100%準拠） */}
      <ClientSideAnchorEnhancer 
        enableAIDetection={true}
        enhancementDelay={800}
        scrollBehavior="smooth"
        trackingEnabled={true}
      />

      {/* ヒーローセクション */}
      <section id="hero-section">
        <MCPHeroSectionSSR />
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
        <MCPServicesSection />
      </section>

      {/* 技術スタックセクション */}
      <section id="tech-stack-section">
        <MCPTechStack />
      </section>

      {/* 実績ショーケースセクション */}
      <section id="showcase-section">
        <MCPShowcase />
      </section>

      {/* 料金プランセクション */}
      <section id="pricing-section">
        <MCPPricingSection />
      </section>

      {/* Feature Preview Section */}
      <FeaturePreviewSection 
        featureType="diagnostic"
        title="MCP サーバー診断ツール"
        subtitle="AI連携・プロトコル最適化診断"
        description="既存システムのMCP対応状況を診断し、最適なサーバー構成・プロトコル設計を自動提案します。"
        features={[
          "システム連携状況診断",
          "プロトコル最適化提案",
          "パフォーマンス分析",
          "セキュリティ評価",
          "拡張性評価",
          "移行コスト試算",
          "実装ロードマップ生成",
          "ROI予測レポート"
        ]}
        expectedDate="2025年12月"
        accentColor="blue"
      />

      {/* セマンティック内部リンクセクション */}
      {unifiedData.semanticLinks.length > 0 && (
        <section className="py-16 bg-gray-50 border-t border-gray-200" id="related-services-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
              関連開発・技術サービス
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
        <RelatedArticlesSection businessDomain="AI・機械学習" serviceType="MCPサーバー開発" />
      </Suspense>

      {/* お問い合わせセクション */}
      <section id="contact-section">
        <MCPContactSectionSSR />
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
    // MCP・プロトコル・AI連携関連記事を取得
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
      .or('seo_keywords.cs.{MCP},seo_keywords.cs.{プロトコル},seo_keywords.cs.{AI連携},seo_keywords.cs.{システム統合}')
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
            MCP・AI連携システム関連記事
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