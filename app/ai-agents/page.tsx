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
    // AIエージェント開発コア
    'AIエージェント開発', 'Mastra Framework', 'ChatGPT', 'Claude 3.5 Sonnet',
    'Function Calling', 'Tool Use', '自動化システム', 'LLM統合', 'AI推論',
    'ワークフロー自動化', 'インテリジェント処理', 'AI意思決定', '業務自動化',
    'ナレッジベースRAG', 'ベクトル検索', '対話型AI', '自然言語処理',
    
    // Mike King理論・GEO対応
    'レリバンスエンジニアリング', 'Mike King理論', 'GEO対策', 'AI検索最適化',
    'Fragment ID最適化', 'TopicalCoverage', 'セマンティック構造化データ',
    
    // ベクトルRAG統合（競合優位性の核心）
    'ベクトルRAG活用', 'トリプルRAGシステム', 'pgvector活用',
    'OpenAI Embeddings', 'セマンティック関連性', 'AI検索ランキング',
    'レリバンス最大化', 'コンテンツ最適化', 'エンティティ関係性',
    
    // 技術仕様
    'Next.js開発', 'TypeScript開発', 'Supabase統合', 'API開発',
    '24時間運用', 'スケーラブル設計', 'セキュリティ強化'
  ],
  category: 'AIエージェント開発',
  businessId: undefined,
  categoryId: undefined,
  // Phase 3: GEO最適化対象クエリ（AI検索エンジン上位表示）
  targetQueries: [
    'AIエージェント開発 Mastra Framework',
    'ChatGPT Function Calling 開発',
    'Claude Tool Use システム構築',
    '自動化システム AI開発',
    'ワークフロー自動化 LLM統合',
    'AIエージェント カスタマイズ',
    'インテリジェント処理 システム開発',
    'ベクトルRAG AIエージェント統合'
  ],
  // Phase 4: AI検索・Trust Layer対応
  enableAISearchDetection: true,
  enableTrustSignals: true
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

  // ベクトルRAGシステム統合スキーマ（AIエージェント専門）
  const vectorRAGAgentSchema = {
    "@context": "https://schema.org",
    "@type": "DataFeed",
    "name": "AIエージェント開発専門ナレッジベース",
    "description": "株式会社エヌアンドエスのベクトルRAGシステムによるAIエージェント・Mastra Framework・LLM統合専門知識データベース",
    "provider": {
      "@type": "Organization",
      "@id": "https://nands.tech/#organization"
    },
    "dataset": {
      "@type": "Dataset",
      "name": "AI Agent Development Knowledge Base",
      "description": "15年間の開発実績とAIエージェント・Function Calling・Tool Use専門技術をベクトル化したデータベース",
      "creator": {
        "@type": "Organization",
        "@id": "https://nands.tech/#organization"
      },
      "keywords": [
        "AIエージェント開発",
        "Mastra Framework",
        "Function Calling",
        "Tool Use",
        "ChatGPT統合",
        "Claude統合",
        "ワークフロー自動化",
        "LLM統合システム"
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
      "distribution": {
        "@type": "DataDownload",
        "encodingFormat": "application/json",
        "contentUrl": "https://nands.tech/api/search-rag"
      }
    },
    "about": [
      {
        "@type": "Thing",
        "name": "Mastra Framework開発",
        "description": "最新のAIエージェントフレームワークを活用したインテリジェントシステム開発"
      },
      {
        "@type": "Thing",
        "name": "Function Calling・Tool Use",
        "description": "LLMの外部ツール連携機能を活用した高度な自動化システム実装"
      },
      {
        "@type": "Thing",
        "name": "ワークフロー自動化",
        "description": "AI推論による意思決定とワークフロー自動化の統合システム"
      }
    ]
  };

  return (
    <>
      {/* 統一構造化データ（Mike King理論準拠） */}
      {unifiedData?.structuredData && (
        <Script
          id="unified-structured-data-ai-agents"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(unifiedData.structuredData, null, 2)
          }}
        />
      )}

      {/* ベクトルRAGシステム統合スキーマ（競合優位性の核心） */}
      <Script
        id="vector-rag-agent-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(vectorRAGAgentSchema, null, 2)
        }}
      />

      {/* Phase 3: GEO最適化hasPartスキーマ（AI検索エンジン最適化） */}
      {unifiedData?.geoOptimizedHasPart && (
        <Script
          id="geo-optimized-haspart-ai-agents"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(unifiedData.geoOptimizedHasPart.jsonLd, null, 2)
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
            "description": "Mastra Framework・ChatGPT・Claude等最新AI技術によるインテリジェントエージェント開発。ベクトルRAGシステム統合による業界最高レベルの成果を保証。",
            "offers": {
              "@type": "Offer",
              "price": "500000",
              "priceCurrency": "JPY",
              "priceSpecification": {
                "@type": "PriceSpecification",
                "name": "AIエージェント開発基本パッケージ",
                "description": "Mastra Framework・Function Calling・Tool Use・ベクトルRAG統合開発"
              }
            },
            "provider": {
              "@id": "https://nands.jp/#organization"
            },
            "featureList": [
              "Mastra Framework統合",
              "ChatGPT Function Calling",
              "Claude Tool Use",
              "ワークフロー自動化",
              "LLM統合開発",
              "ベクトルRAG統合",
              "トリプルRAGシステム活用",
              "pgvector セマンティック検索",
              "OpenAI Embeddings統合",
              "リアルタイム学習機能",
              "24時間365日稼働対応",
              "マルチモーダル対応",
              "セキュリティ・プライバシー保護",
              "Mike King理論準拠",
              "レリバンスエンジニアリング対応"
            ],
            "softwareRequirements": [
              "Node.js 18+",
              "TypeScript 5+",
              "Mastra Framework",
              "OpenAI API",
              "Claude API",
              "ベクトルRAGシステム",
              "pgvector",
              "Supabase"
            ]
          }, null, 2)
        }}
      />

      {/* Fragment IDとTOCに対応したメインコンテンツ */}
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        
        {/* AI検索流入対応: Click-Recovery Banner */}
        {unifiedData?.aiSearchDetection?.shouldShowBanner && (
          <section className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3">
            <div className="container mx-auto px-4 text-center">
              <p className="text-sm">
                🤖 AI検索からお越しですか？ 
                <strong className="ml-2">{unifiedData.aiSearchDetection.recoveryMessage.title}</strong>
                <span className="ml-2">{unifiedData.aiSearchDetection.recoveryMessage.message}</span>
              </p>
            </div>
          </section>
        )}

        {/* パンくずナビ（構造化データ対応） */}
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
                <a href="/#services" className="text-blue-600 hover:underline" itemProp="item">
                  <span itemProp="name">サービス</span>
                </a>
                <meta itemProp="position" content="2" />
              </li>
              <li className="text-gray-500">›</li>
              <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <span className="text-gray-900" itemProp="name">AIエージェント開発</span>
                <meta itemProp="position" content="3" />
              </li>
            </ol>
          </div>
        </nav>

        {/* Fragment ID対応セクション構造 */}
        <article itemScope itemType="https://schema.org/WebPage">
          <meta itemProp="name" content="AIエージェント開発・カスタマイズ" />
          <meta itemProp="description" content="Mastra Framework・ChatGPT・Claude等最新AI技術によるインテリジェントエージェント開発。自然言語処理・RAGシステム・機械学習で24時間365日稼働する高精度自動化システムを構築。" />
        
        {/* Hero Section */}
          <section id="agent-hero" itemScope itemType="https://schema.org/WebPageElement">
            <meta itemProp="name" content="ヒーローセクション" />
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
            <section id="table-of-contents" className="py-16 bg-gradient-to-r from-blue-50 to-cyan-50">
              <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-6">
                    <h2 className="text-2xl font-bold text-white flex items-center">
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      AIエージェント開発サービス一覧
                    </h2>
                    <p className="text-blue-100 mt-2">Mastra Framework・Function Calling・Tool Use・ベクトルRAG統合</p>
                  </div>
                  <nav className="p-8">
                    <div className="grid md:grid-cols-2 gap-4">
                      {unifiedData.tableOfContents.map((item, index) => (
                        <a
                          key={index}
                          href={`#${item.id}`}
                          className="flex items-start p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 group"
                        >
                          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-4">
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

        {/* Services Section */}
          <section id="agent-services" itemScope itemType="https://schema.org/WebPageElement">
            <meta itemProp="name" content="サービス一覧" />
          <AIAgentServicesSection />
        </section>

        {/* Tech Stack Section */}
          <section id="agent-techstack" itemScope itemType="https://schema.org/WebPageElement">
            <meta itemProp="name" content="技術スタック" />
          <AIAgentTechStack />
        </section>

        {/* Showcase Section */}
          <section id="agent-showcase" itemScope itemType="https://schema.org/WebPageElement">
            <meta itemProp="name" content="開発実績" />
          <AIAgentShowcase />
        </section>

          {/* ベクトルRAG統合の優位性セクション */}
          <section id="vector-rag-advantage" className="py-16 bg-gray-800" itemScope itemType="https://schema.org/WebPageElement">
            <meta itemProp="name" content="ベクトルRAG統合の優位性" />
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-12 text-white">🚀 AIエージェント×ベクトルRAG統合による競合優位性</h2>
                
                <div className="grid md:grid-cols-3 gap-8">
                  {/* インテリジェント推論 */}
                  <div className="bg-gray-700 p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold mb-4 text-blue-400">🧠 インテリジェント推論</h3>
                    <p className="text-gray-300 mb-4">
                      ベクトルRAGとFunction Callingを組み合わせた高度な推論システム。コンテキストを理解した賢い意思決定を実現。
                    </p>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• セマンティック理解による高精度推論</li>
                      <li>• コンテキスト保持型対話</li>
                      <li>• 複雑な業務ロジック処理</li>
                      <li>• 学習機能による継続改善</li>
                    </ul>
                  </div>

                  {/* マルチモーダル対応 */}
                  <div className="bg-gray-700 p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold mb-4 text-cyan-400">🔗 マルチモーダル対応</h3>
                    <p className="text-gray-300 mb-4">
                      テキスト・画像・音声・動画を統合処理するマルチモーダルAIエージェント。あらゆる形式のデータを理解。
                    </p>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• GPT-4 Vision統合</li>
                      <li>• 音声認識・合成</li>
                      <li>• 画像・動画解析</li>
                      <li>• 統合的なデータ理解</li>
                    </ul>
                  </div>

                  {/* 24時間自動運用 */}
                  <div className="bg-gray-700 p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold mb-4 text-green-400">🔧 24時間自動運用</h3>
                    <p className="text-gray-300 mb-4">
                      自動スケーリング・障害復旧・パフォーマンス最適化により24時間365日の安定稼働を保証。
                    </p>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• Kubernetes自動スケーリング</li>
                      <li>• 障害自動検知・復旧</li>
                      <li>• パフォーマンス監視</li>
                      <li>• セキュリティ・プライバシー保護</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

        {/* Pricing Section */}
          <section id="agent-pricing" itemScope itemType="https://schema.org/WebPageElement">
            <meta itemProp="name" content="料金プラン" />
          <AIAgentPricingSection />
        </section>

        {/* セマンティック関連リンクセクション */}
        {unifiedData?.semanticLinks && unifiedData.semanticLinks.length > 0 && (
            <section id="related-services" className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto">
                  <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
                    🤖 関連するAI開発サービス
                  </h2>
                  <p className="text-center text-gray-600 mb-8">
                    当社のベクトルRAGシステムが推奨するAIエージェント関連サービス
                  </p>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {unifiedData.semanticLinks.map((link, index) => (
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

        {/* Contact Section */}
          <section id="agent-contact" itemScope itemType="https://schema.org/WebPageElement">
            <meta itemProp="name" content="お問い合わせ" />
          <AIAgentContactSectionSSR />
          </section>
        </article>
      </main>
    </>
  );
} 