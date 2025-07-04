import { Metadata } from 'next';
import Script from 'next/script';
import AIAgentHeroSection from './components/AIAgentHeroSection';
import AIAgentHeroSectionSSR from './components/AIAgentHeroSectionSSR';
import AIAgentServicesSection from './components/AIAgentServicesSection';
import AIAgentTechStack from './components/AIAgentTechStack';
import AIAgentShowcase from './components/AIAgentShowcase';
import AIAgentPricingSection from './components/AIAgentPricingSection';
import AIAgentContactSectionSSR from './components/AIAgentContactSectionSSR';
import FeaturePreviewSection from '@/components/common/FeaturePreviewSection';

// Mike King理論準拠: 統一レリバンスエンジニアリング統合
import { generateUnifiedPageData, PageContext, SemanticLinksComponent, TOCComponent } from '@/lib/structured-data/unified-integration';

// メタデータ（SEO強化）
export const metadata: Metadata = {
  title: 'AIエージェント開発・カスタマイズ | Mastra Framework | 株式会社エヌアンドエス',
  description: 'Mastra Framework・ChatGPT・Claude等最新AI技術によるインテリジェントエージェント開発。自然言語処理・RAGシステム・機械学習で24時間365日稼働する高精度自動化システムを構築。Function Calling・Tool Use対応。',
  keywords: 'AIエージェント開発,Mastra Framework,ChatGPT,Claude,自動化システム,Function Calling,Tool Use,RAG,自然言語処理,AI開発',
  openGraph: {
    title: 'AIエージェント開発・カスタマイズ | Mastra Framework',
    description: 'Mastra Framework・ChatGPT・Claude等最新AI技術によるインテリジェントエージェント開発',
    type: 'website',
    url: 'https://nands.jp/ai-agents',
    images: [
      {
        url: '/images/ai-agents/ai-agents-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'AIエージェント開発・カスタマイズ'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AIエージェント開発・カスタマイズ | Mastra Framework',
    description: 'Mastra Framework・ChatGPT・Claude等最新AI技術によるインテリジェントエージェント開発',
    images: ['/images/ai-agents/ai-agents-hero.jpg']
  },
  alternates: {
    canonical: 'https://nands.jp/ai-agents'
  }
};

// ページコンテキスト定義
const pageContext: PageContext = {
  pageSlug: 'ai-agents',
  pageTitle: 'AIエージェント開発・カスタマイズ',
  keywords: [
    'AIエージェント開発', 'Mastra Framework', 'ChatGPT', 'Claude 3.5 Sonnet',
    'Function Calling', 'Tool Use', '自動化システム', 'LLM統合', 'AI推論',
    'ワークフロー自動化', 'インテリジェント処理', 'AI意思決定', '業務自動化',
    'ナレッジベースRAG', 'ベクトル検索', '対話型AI', '自然言語処理'
  ],
  category: 'AIエージェント開発',
  businessId: undefined,
  categoryId: undefined
};

// 統合データ取得（SSR）
async function getUnifiedData() {
  try {
    return await generateUnifiedPageData(pageContext);
  } catch (error) {
    console.error('統合データ取得エラー:', error);
    return null;
  }
}

export default async function AIAgentsPage() {
  // 統合レリバンスエンジニアリングデータを取得
  const unifiedData = await getUnifiedData();

  return (
    <>
      {/* 統一構造化データ（JSON-LD） */}
      {unifiedData?.structuredData && (
        <Script
          id="unified-structured-data-ai-agents"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(unifiedData.structuredData, null, 2)
          }}
        />
      )}

      {/* 追加のAIエージェント専用構造化データ */}
      <Script
        id="ai-agent-service-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "AIエージェント開発サービス",
            "applicationCategory": "DeveloperApplication",
            "applicationSubCategory": "AI Development Framework",
            "operatingSystem": "Linux, Windows, macOS",
            "programmingLanguage": ["TypeScript", "Python", "JavaScript"],
            "runtimePlatform": "Node.js",
            "softwareRequirements": "Mastra Framework",
            "description": "Mastra Framework・ChatGPT・Claude等最新AI技術によるインテリジェントエージェント開発",
            "offers": {
              "@type": "Offer",
              "price": "500000",
              "priceCurrency": "JPY",
              "priceSpecification": {
                "@type": "PriceSpecification",
                "name": "AIエージェント開発基本パッケージ"
              }
            },
            "provider": {
              "@id": "https://nands.jp/#organization"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "reviewCount": "15",
              "bestRating": "5"
            }
          }, null, 2)
        }}
      />

      {/* Fragment IDとTOCに対応したメインコンテンツ */}
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        
        {/* Hero Section */}
        <section id="agent-hero">
          <AIAgentHeroSectionSSR />
        </section>

        {/* AIエージェント専用チャットbot予定エリア */}
        <section id="agent-chatbot-preview">
          <FeaturePreviewSection
            title="AIエージェント対話システム"
            subtitle="リアルタイム・インテリジェント対話"
            description="Mastra Frameworkと最新LLM技術を活用した高度なAIエージェントとの対話システム。Function Calling・Tool Use・RAGシステムを統合した次世代の対話型AIを体験できます。"
            features={[
              "OpenAI GPT-4o・Claude 3.5 Sonnet統合による高精度対話",
              "Function Calling対応による外部API・システム連携",
              "RAGシステムによる企業固有ナレッジベース活用",
              "Tool Use機能による複雑なタスクの自動実行",
              "マルチモーダル対応（テキスト・画像・音声）",
              "リアルタイム学習・適応機能",
              "24時間365日稼働対応",
              "セキュリティ・プライバシー保護"
            ]}
            featureType="chatbot"
            expectedDate="2025年11月"
            accentColor="blue"
          />
        </section>

        {/* 目次（機能予定エリア直後に配置） */}
        {unifiedData?.tableOfContents && unifiedData.tableOfContents.length > 0 && (
          <div
            dangerouslySetInnerHTML={{ 
              __html: TOCComponent({ 
                toc: unifiedData.tableOfContents,
                title: "目次",
                className: "py-16 bg-gradient-to-r from-blue-50 to-indigo-50"
              })
            }}
          />
        )}

        {/* Services Section */}
        <section id="agent-services">
          <AIAgentServicesSection />
        </section>

        {/* Tech Stack Section */}
        <section id="agent-techstack">
          <AIAgentTechStack />
        </section>

        {/* Showcase Section */}
        <section id="agent-showcase">
          <AIAgentShowcase />
        </section>

        {/* Pricing Section */}
        <section id="agent-pricing">
          <AIAgentPricingSection />
        </section>

        {/* セマンティック関連リンクセクション */}
        {unifiedData?.semanticLinks && unifiedData.semanticLinks.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: SemanticLinksComponent({ 
                    links: unifiedData.semanticLinks,
                    title: "🤖 関連するAI開発サービス",
                    className: "max-w-6xl mx-auto p-8 bg-white rounded-xl shadow-lg"
                  })
                }}
              />
            </div>
          </section>
        )}

        {/* Contact Section */}
        <section id="agent-contact">
          <AIAgentContactSectionSSR />
        </section>

        {/* エンティティ関係性を活用したリッチスニペット強化 */}
        {unifiedData?.entityRelationships && (
          <Script
            id="entity-relationships-ai-agents"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "ItemList",
                "name": "AIエージェント開発関連エンティティ",
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

        {/* DB連携関連記事（があれば表示） */}
        {unifiedData?.posts && unifiedData.posts.length > 0 && (
          <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12">🤖 AIエージェント関連記事</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {unifiedData.posts.slice(0, 6).map((post) => (
                  <a
                    key={post.id}
                    href={`/posts/${post.slug}`}
                    className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
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
                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
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

      </main>
    </>
  );
} 