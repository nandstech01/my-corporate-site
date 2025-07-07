import React from 'react';
import { Metadata } from 'next';
import { ORGANIZATION_ENTITY, SERVICE_ENTITIES } from '@/lib/structured-data/entity-relationships';
import { SemanticLinksSystem } from '@/lib/structured-data/semantic-links';
import { AutoTOCSystem } from '@/lib/structured-data/auto-toc-system';
import { generateUnifiedPageData, type PageContext } from '@/lib/structured-data/unified-integration';
import TableOfContents from '@/components/common/TableOfContents';
import Header from '@/app/components/common/Header'
import VectorRagHeroSectionSSR from './components/VectorRagHeroSectionSSR'
import VectorRagServicesSection from './components/VectorRagServicesSection'
import VectorRagTechStack from './components/VectorRagTechStack'
import VectorRagShowcase from './components/VectorRagShowcase'
import VectorRagPricingSection from './components/VectorRagPricingSection'
import VectorRagContactSectionSSR from './components/VectorRagContactSectionSSR'
import FeaturePreviewSection from '@/components/common/FeaturePreviewSection'

// メタデータ生成
export const metadata: Metadata = {
  title: 'ベクトルRAG開発サービス | AI検索・知識ベース構築・Embedding技術 | 株式会社エヌアンドエス',
  description: '株式会社エヌアンドエスのベクトルRAG開発サービス。AI検索システム、知識ベース構築、Embedding技術、類似検索機能など、高精度なRAGシステムを開発。企業の知識活用を革新します。',
  keywords: [
    'ベクトルRAG',
    'RAGシステム',
    'ベクトル検索',
    'Embedding技術',
    'AI検索システム',
    '知識ベース構築',
    '類似検索',
    'セマンティック検索',
    'LLM統合',
    '情報検索システム',
    '株式会社エヌアンドエス'
  ],
  openGraph: {
    title: 'ベクトルRAG開発サービス | AI検索・知識ベース構築・Embedding技術',
    description: '高精度なベクトルRAGシステムの開発。AI検索、知識ベース構築、類似検索機能で企業の知識活用を革新。',
    type: 'website',
    locale: 'ja_JP'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ベクトルRAG開発サービス | 株式会社エヌアンドエス',
    description: 'AI検索・知識ベース構築・Embedding技術で高精度なRAGシステムを開発。企業の知識活用を革新。'
  },
  alternates: {
    canonical: 'https://nands.tech/vector-rag'
  }
};

// ページコンテキスト定義（レリバンスエンジニアリング最適化）
const pageContext: PageContext = {
  pageSlug: 'vector-rag',
  pageTitle: 'ベクトルRAG開発・知識ベース構築サービス',
  keywords: [
    // ベクトルRAG専門コア
    'ベクトルRAG', 'Vector RAG', 'pgvector活用', 'OpenAI Embeddings',
    'セマンティック検索', 'ベクトル検索', '知識ベース構築', 'Embedding技術',
    '類似検索', 'AI検索システム', 'コサイン類似度', 'ベクトルデータベース',
    
    // Mike King理論・GEO対応
    'レリバンスエンジニアリング', 'Mike King理論', 'GEO対策', 'AI検索最適化',
    'Fragment ID最適化', 'TopicalCoverage', 'セマンティック構造化データ',
    
    // 競合優位性（トリプルRAGシステム）
    'トリプルRAGシステム', '自社RAG', 'トレンドRAG', 'YouTubeRAG',
    'マルチRAG統合', 'ベクトル統合検索', 'AI検索ランキング向上',
    
    // 技術仕様
    'Supabase pgvector', 'PostgreSQL拡張', 'リアルタイム更新',
    'マルチモーダル対応', 'スケーラブル設計', 'API統合'
  ],
  category: 'ベクトルRAG開発',
  businessId: undefined,
  categoryId: undefined,
  // Phase 3: GEO最適化対象クエリ（AI検索エンジン上位表示）
  targetQueries: [
    'ベクトルRAG pgvector 開発',
    'OpenAI Embeddings 検索システム',
    'セマンティック検索 システム構築',
    '知識ベース ベクトル化',
    'トリプルRAGシステム 統合',
    'AI検索システム 企業向け',
    'ベクトルデータベース 活用',
    'コサイン類似度 検索最適化'
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

export default async function VectorRagPage() {
  // 統合レリバンスエンジニアリングデータを取得
  const unifiedData = await getUnifiedData();

  // 業界最強ベクトルRAGシステム統合スキーマ（競合優位性の核心）
  const vectorRAGAdvantageSchema = {
    "@context": "https://schema.org",
    "@type": "DataFeed", 
    "name": "業界最強ベクトルRAGシステム・トリプルRAG統合プラットフォーム",
    "description": "株式会社エヌアンドエスの3つのRAGシステム（自社RAG・トレンドRAG・YouTubeRAG）を統合したベクトル検索プラットフォーム。OpenAI Embeddings・pgvector・Mike King理論を完全統合。",
    "provider": {
      "@type": "Organization",
      "@id": "https://nands.tech/#organization"
    },
    "dataset": [
      {
        "@type": "Dataset",
        "name": "自社RAGナレッジベース",
        "description": "42専門領域をカバーする15年間の実績データをベクトル化。pgvectorとOpenAI Embeddingsによる高精度検索を実現。",
        "keywords": ["企業ナレッジ", "専門知識", "実績データ", "ベクトル検索"],
        "creator": { "@id": "https://nands.tech/#organization" },
        "distribution": {
          "@type": "DataDownload",
          "encodingFormat": "application/json",
          "contentUrl": "https://nands.tech/api/search-rag"
        }
      },
      {
        "@type": "Dataset", 
        "name": "トレンドRAGシステム",
        "description": "リアルタイム技術動向・業界トレンドをベクトル化。最新情報による高関連性検索を提供。",
        "keywords": ["技術トレンド", "業界動向", "リアルタイム更新", "トレンド分析"],
        "temporalCoverage": "2024/継続更新"
      },
      {
        "@type": "Dataset",
        "name": "YouTubeRAGシステム", 
        "description": "動画コンテンツの音声・映像・メタデータをベクトル化。マルチモーダル検索対応。",
        "keywords": ["動画検索", "マルチモーダル", "音声認識", "映像解析"]
      }
    ],
    "about": [
      {
        "@type": "Thing",
        "name": "トリプルRAG統合技術",
        "description": "自社・トレンド・YouTubeの3つのRAGシステムを統合したベクトル検索プラットフォーム"
      },
      {
        "@type": "Thing",
        "name": "pgvector高速検索",
        "description": "PostgreSQL拡張pgvectorによる高速ベクトル検索とコサイン類似度最適化"
      },
      {
        "@type": "Thing",
        "name": "Mike King理論準拠",
        "description": "レリバンスエンジニアリング・GEO対策によるAI検索エンジン最適化"
      }
    ]
  };

  return (
    <>
      {/* 統一構造化データ（Mike King理論準拠） */}
      {unifiedData?.structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(unifiedData.structuredData, null, 2)
          }}
        />
      )}

      {/* 業界最強ベクトルRAGシステム統合スキーマ（競合優位性の核心） */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(vectorRAGAdvantageSchema, null, 2)
        }}
      />

      {/* Phase 3: GEO最適化hasPartスキーマ（AI検索エンジン最適化） */}
      {unifiedData?.geoOptimizedHasPart && (
        <script
          id="geo-optimized-haspart-vector-rag"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(unifiedData.geoOptimizedHasPart.jsonLd, null, 2)
          }}
        />
      )}

      {/* ベクトルRAG専用技術スキーマ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "ベクトルRAG開発・知識ベース構築サービス",
            "applicationCategory": "DeveloperApplication",
            "applicationSubCategory": "Vector Search Platform",
            "operatingSystem": "Linux, Docker, Kubernetes",
            "programmingLanguage": ["Python", "TypeScript", "SQL", "JavaScript"],
            "runtimePlatform": "PostgreSQL, Node.js, Docker",
            "description": "OpenAI Embeddings・pgvector・トリプルRAGシステム統合による業界最高レベルのベクトル検索・知識ベース構築プラットフォーム。Mike King理論準拠のレリバンスエンジニアリング対応。",
            "offers": {
              "@type": "Offer",
              "price": "600000",
              "priceCurrency": "JPY",
              "priceSpecification": {
                "@type": "PriceSpecification",
                "name": "ベクトルRAG・知識ベース構築基本パッケージ",
                "description": "pgvector・OpenAI Embeddings・トリプルRAGシステム統合・セマンティック検索構築"
              }
            },
            "provider": {
              "@id": "https://nands.tech/#organization"
            },
            "featureList": [
              "OpenAI Embeddings統合",
              "pgvector高速検索",
              "トリプルRAGシステム統合",
              "セマンティック検索",
              "コサイン類似度最適化",
              "リアルタイム更新",
              "マルチモーダル対応",
              "スケーラブル設計",
              "API統合対応",
              "多言語ベクトル化",
              "知識ベース自動構築",
              "Mike King理論準拠",
              "レリバンスエンジニアリング対応",
              "AI検索ランキング向上"
            ],
            "softwareRequirements": [
              "PostgreSQL 14+",
              "pgvector 0.5+",
              "OpenAI API",
              "Python 3.11+",
              "TypeScript 5+",
              "Docker",
              "Kubernetes",
              "Supabase"
            ]
          }, null, 2)
        }}
      />

      <main className="min-h-screen bg-white">
        {/* AI検索流入対応: Click-Recovery Banner */}
        {unifiedData?.aiSearchDetection?.shouldShowBanner && (
          <section className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3">
            <div className="container mx-auto px-4 text-center">
              <p className="text-sm">
                🔍 AI検索からお越しですか？ 
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
                <a href="/services" className="text-blue-600 hover:underline" itemProp="item">
                  <span itemProp="name">サービス</span>
                </a>
                <meta itemProp="position" content="2" />
              </li>
              <li className="text-gray-500">›</li>
              <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <span className="text-gray-900" itemProp="name">ベクトルRAG開発</span>
                <meta itemProp="position" content="3" />
              </li>
            </ol>
          </div>
        </nav>

        {/* Fragment ID対応セクション構造 */}
        <article itemScope itemType="https://schema.org/WebPage">
          <meta itemProp="name" content="ベクトルRAG開発・知識ベース構築サービス" />
          <meta itemProp="description" content="OpenAI Embeddings・pgvector・トリプルRAGシステム統合による業界最高レベルのベクトル検索・セマンティック検索・知識ベース構築サービス。Mike King理論準拠のレリバンスエンジニアリング対応。" />

          {/* Hero Section */}
          <section id="vector-rag-hero" itemScope itemType="https://schema.org/WebPageElement">
            <meta itemProp="name" content="ヒーローセクション" />
            <VectorRagHeroSectionSSR />
          </section>

          {/* ベクトル検索・RAGシステム体験予定エリア */}
          <section id="vector-search-preview">
            <FeaturePreviewSection
              title="ベクトル検索・RAGシステム体験"
              subtitle="トリプルRAG統合・高精度セマンティック検索"
              description="当社のベクトルRAGシステム（自社RAG・トレンドRAG・YouTubeRAG）を体験。OpenAI Embeddings・pgvectorによる高精度検索で、関連性の高い情報を瞬時に発見できます。"
              features={[
                "トリプルRAGシステム統合検索（自社・トレンド・YouTube）",
                "OpenAI Embeddings・pgvector高速検索",
                "セマンティック検索・コサイン類似度最適化",
                "自然言語による意味的検索",
                "多言語対応・マルチモーダル検索",
                "リアルタイム学習・更新機能",
                "API連携・カスタマイズ対応",
                "分析ダッシュボード・レポート生成"
              ]}
              featureType="search"
              expectedDate="2025年9月"
              accentColor="purple"
            />
          </section>

          {/* 目次（機能予定エリア直後に配置） */}
          {unifiedData?.tableOfContents && unifiedData.tableOfContents.length > 0 && (
            <section id="table-of-contents" className="py-16 bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6">
                    <h2 className="text-2xl font-bold text-white flex items-center">
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      ベクトルRAG・知識ベース構築サービス一覧
                    </h2>
                    <p className="text-purple-100 mt-2">トリプルRAGシステム・OpenAI Embeddings・pgvector統合</p>
                  </div>
                  <nav className="p-8">
                    <div className="grid md:grid-cols-2 gap-4">
                      {unifiedData.tableOfContents.map((item, index) => (
                        <a
                          key={index}
                          href={`#${item.id}`}
                          className="flex items-start p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300 group"
                        >
                          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-4">
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

          {/* サービス内容セクション */}
          <section id="services-section" itemScope itemType="https://schema.org/WebPageElement">
            <meta itemProp="name" content="サービス内容" />
            <VectorRagServicesSection />
          </section>

          {/* 技術スタック */}
          <section id="tech-stack" itemScope itemType="https://schema.org/WebPageElement">
            <meta itemProp="name" content="技術スタック" />
            <VectorRagTechStack />
          </section>

          {/* 開発実績 */}
          <section id="showcase" itemScope itemType="https://schema.org/WebPageElement">
            <meta itemProp="name" content="開発実績" />
            <VectorRagShowcase />
          </section>

          {/* トリプルRAGシステム統合の業界最強優位性セクション */}
          <section id="triple-rag-advantage" className="py-16 bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-900 text-white" itemScope itemType="https://schema.org/WebPageElement">
            <meta itemProp="name" content="トリプルRAGシステム統合の優位性" />
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-12">🚀 業界最強！トリプルRAGシステム統合による圧倒的競合優位性</h2>
                <p className="text-center text-purple-100 mb-12 text-lg">
                  当社独自の3つのRAGシステムを統合した業界唯一のベクトル検索プラットフォーム
                </p>
                
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                  {/* 自社RAGシステム */}
                  <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                    <h3 className="text-xl font-bold mb-4 text-purple-300">🏢 自社RAGナレッジベース</h3>
                    <p className="text-purple-100 mb-4">
                      15年間の実績・42専門領域をベクトル化。企業の専門知識とノウハウを最大限活用。
                    </p>
                    <ul className="text-sm text-purple-200 space-y-1">
                      <li>• 15年間の蓄積実績データ</li>
                      <li>• 42専門領域カバー</li>
                      <li>• 企業固有ナレッジ最適化</li>
                      <li>• プライベートナレッジ統合</li>
                    </ul>
                  </div>

                  {/* トレンドRAGシステム */}
                  <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                    <h3 className="text-xl font-bold mb-4 text-indigo-300">📈 トレンドRAGシステム</h3>
                    <p className="text-purple-100 mb-4">
                      リアルタイム技術動向・業界トレンドをベクトル化。最新情報で常に関連性最大化。
                    </p>
                    <ul className="text-sm text-purple-200 space-y-1">
                      <li>• リアルタイム技術動向分析</li>
                      <li>• 業界トレンド自動取得</li>
                      <li>• 最新情報関連性向上</li>
                      <li>• 継続的データ更新</li>
                    </ul>
                  </div>

                  {/* YouTubeRAGシステム */}
                  <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                    <h3 className="text-xl font-bold mb-4 text-cyan-300">🎥 YouTubeRAGシステム</h3>
                    <p className="text-purple-100 mb-4">
                      動画コンテンツ・音声・映像をベクトル化。マルチモーダル検索で情報取得革新。
                    </p>
                    <ul className="text-sm text-purple-200 space-y-1">
                      <li>• 動画コンテンツ理解</li>
                      <li>• 音声認識・テキスト化</li>
                      <li>• 映像情報抽出</li>
                      <li>• マルチモーダル統合検索</li>
                    </ul>
                  </div>
                </div>

                {/* 技術的優位性 */}
                <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl">
                  <h3 className="text-2xl font-bold text-center mb-8 text-white">⚡ 技術的優位性</h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-lg font-bold mb-4 text-purple-300">🔧 OpenAI Embeddings統合</h4>
                      <ul className="text-purple-100 space-y-2">
                        <li>• text-embedding-3-large活用</li>
                        <li>• 3,072次元ベクトル高精度</li>
                        <li>• 多言語対応・意味理解</li>
                        <li>• コサイン類似度最適化</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold mb-4 text-indigo-300">⚡ pgvector高速検索</h4>
                      <ul className="text-purple-100 space-y-2">
                        <li>• PostgreSQL拡張活用</li>
                        <li>• インデックス最適化</li>
                        <li>• 並列処理・高速化</li>
                        <li>• スケーラブル設計</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ベクトルRAGの特徴・強み */}
          <section id="vector-features" className="py-16 bg-gray-50" itemScope itemType="https://schema.org/WebPageElement">
            <meta itemProp="name" content="ベクトルRAGの特徴" />
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12">
                🎯 エヌアンドエスのベクトルRAGの特徴
              </h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                {/* 高精度検索技術 */}
                <div id="high-precision-search" className="bg-white p-6 rounded-xl shadow-lg">
                  <h3 className="text-xl font-bold mb-4 text-purple-600">🎯 高精度検索技術</h3>
                  <p className="text-gray-600 mb-4">
                    OpenAI Embeddingsとpgvectorを組み合わせた業界最高レベルの検索精度を実現。
                  </p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• 検索精度92%以上</li>
                    <li>• 意味的類似検索</li>
                    <li>• 自然言語理解</li>
                    <li>• コンテキスト保持</li>
                  </ul>
                </div>

                {/* マルチモーダル対応 */}
                <div id="multimodal-support" className="bg-white p-6 rounded-xl shadow-lg">
                  <h3 className="text-xl font-bold mb-4 text-indigo-600">🔗 マルチモーダル対応</h3>
                  <p className="text-gray-600 mb-4">
                    テキスト・画像・音声・動画を統合的に検索。あらゆる形式のデータから情報取得。
                  </p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• テキスト・画像統合</li>
                    <li>• 音声認識・検索</li>
                    <li>• 動画コンテンツ理解</li>
                    <li>• 統合的情報取得</li>
                  </ul>
                </div>

                {/* スケーラブル設計 */}
                <div id="scalable-architecture" className="bg-white p-6 rounded-xl shadow-lg">
                  <h3 className="text-xl font-bold mb-4 text-green-600">📈 スケーラブル設計</h3>
                  <p className="text-gray-600 mb-4">
                    大規模データ対応・高速処理・自動スケーリングで企業成長に合わせて拡張可能。
                  </p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• 大規模データ対応</li>
                    <li>• 自動スケーリング</li>
                    <li>• 負荷分散処理</li>
                    <li>• パフォーマンス最適化</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* 料金プランセクション */}
          <section id="pricing-section" itemScope itemType="https://schema.org/WebPageElement">
            <meta itemProp="name" content="料金プラン" />
            <VectorRagPricingSection />
          </section>

          {/* セマンティック関連リンクセクション */}
          {unifiedData?.semanticLinks && unifiedData.semanticLinks.length > 0 && (
            <section id="related-services" className="py-16 bg-white">
              <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto">
                  <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
                    🔍 関連するベクトルRAG・AI開発サービス
                  </h2>
                  <p className="text-center text-gray-600 mb-8">
                    当社のトリプルRAGシステムが推奨するベクトル検索関連サービス
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
          <section id="contact-section" itemScope itemType="https://schema.org/WebPageElement">
            <meta itemProp="name" content="お問い合わせ" />
            <VectorRagContactSectionSSR />
          </section>
        </article>
      </main>
    </>
  );
} 