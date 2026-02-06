import React, { Suspense } from 'react';
import { Metadata } from 'next'
import { generateUnifiedPageData } from '@/lib/structured-data/unified-integration'
import { supabase } from '@/lib/supabase/supabase'
import TableOfContents from '@/components/common/TableOfContents';
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

  // 手動目次データ（RE維持・Fragment ID対応）
  const tableOfContents = [
    {
      id: 'mcp-preview',
      title: 'MCPサーバー体験プレビュー',
      level: 2,
      anchor: '#mcp-preview'
    },
    {
      id: 'services-section',
      title: 'サービス一覧',
      level: 2,
      anchor: '#services-section'
    },
    {
      id: 'tech-stack-section',
      title: '技術スタック',
      level: 2,
      anchor: '#tech-stack-section'
    },
    {
      id: 'showcase-section',
      title: '導入事例・実績',
      level: 2,
      anchor: '#showcase-section'
    },
    {
      id: 'pricing-section',
      title: '料金プラン',
      level: 2,
      anchor: '#pricing-section'
    },
    {
      id: 'mcp-diagnostic-preview',
      title: 'MCP診断ツール体験',
      level: 2,
      anchor: '#mcp-diagnostic-preview'
    },
    {
      id: 'related-services-section',
      title: '関連サービス',
      level: 2,
      anchor: '#related-services-section'
    },
    {
      id: 'contact-section',
      title: 'お問い合わせ',
      level: 2,
      anchor: '#contact-section'
    }
  ];
  
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



      {/* Jump-Link CTA強化システム（Googleガイドライン100%準拠） */}
      <ClientSideAnchorEnhancer 
        enableAIDetection={true}
        enhancementDelay={800}
        scrollBehavior="smooth"
        trackingEnabled={true}
      />

      {/* Table of Contents（Fragment ID ナビゲーション） - ヘッダー直下配置 */}
      <div className="bg-black py-4 border-b border-gray-800 pt-20">
        <div className="container mx-auto px-4">
          <div className="mcp-servers-toc-container">
            <TableOfContents items={tableOfContents} compact={true} />
          </div>
        </div>
      </div>

      {/* ヒーローセクション */}
      <section id="hero-section">
        <MCPHeroSectionSSR />
      </section>



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
    const { data: postsData } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        meta_description,
        slug,
        published_at,
        meta_keywords
      `)
      .or('meta_keywords.cs.{MCP},meta_keywords.cs.{プロトコル},meta_keywords.cs.{AI連携},meta_keywords.cs.{システム統合}')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(6)

    // 型変換（コード互換性のため）
    const posts = (postsData || []).map(p => ({
      ...p,
      excerpt: p.meta_description,
      seo_keywords: p.meta_keywords,
      categories: null as any
    }))

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
                      {post.published_at ? new Date(post.published_at).toLocaleDateString('ja-JP') : '-'}
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