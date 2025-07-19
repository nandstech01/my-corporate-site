import React from 'react';
import { Metadata } from 'next';
import { generateUnifiedPageData, type PageContext } from '@/lib/structured-data/unified-integration';
import FeaturePreviewSection from '@/components/common/FeaturePreviewSection';
import ChatbotHeroSectionSSR from './components/ChatbotHeroSectionSSR';
import ChatbotServicesSection from './components/ChatbotServicesSection';
import ChatbotTechStack from './components/ChatbotTechStack';
import ChatbotShowcase from './components/ChatbotShowcase';
import ChatbotContactSectionSSR from './components/ChatbotContactSectionSSR';

// メタデータ生成
export const metadata: Metadata = {
  title: 'チャットボット開発サービス | GPT-4・Claude統合・24時間自動応答 | 株式会社エヌアンドエス',
  description: '株式会社エヌアンドエスのチャットボット開発サービス。GPT-4・Claude統合、ベクトルRAG活用、業界特化、多言語対応で24時間高品質な自動応答を実現。顧客対応を革新します。',
  keywords: [
    'チャットボット開発',
    'GPT-4チャットボット', 
    'Claude統合',
    'AI自動応答',
    '24時間対応',
    'カスタマーサポート',
    'ベクトルRAG',
    '業界特化',
    '多言語対応',
    'エスカレーション機能',
    '株式会社エヌアンドエス'
  ],
  openGraph: {
    title: 'チャットボット開発サービス | GPT-4・Claude統合・24時間自動応答',
    description: 'GPT-4・Claude統合チャットボット。ベクトルRAG活用・業界特化・多言語対応で24時間高品質な自動応答を実現。',
    type: 'website',
    locale: 'ja_JP'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'チャットボット開発サービス | 株式会社エヌアンドエス',
    description: 'GPT-4・Claude統合・ベクトルRAG活用で24時間高品質な自動応答チャットボットを開発。'
  },
  alternates: {
    canonical: 'https://nands.tech/chatbot-development'
}
};

// ページコンテキスト定義（レリバンスエンジニアリング最適化）
const pageContext: PageContext = {
  pageSlug: 'chatbot-development',
  pageTitle: 'チャットボット開発・GPT-4統合・自動応答システム',
  keywords: [
    // チャットボット開発コア
    'チャットボット開発', 'GPT-4 チャットボット', 'Claude 統合', 'OpenAI API',
    'AI自動応答', '24時間対応', 'カスタマーサポート', '顧客対応自動化',
    'LINE Bot', 'Slack Bot', 'Teams Bot', 'Discord Bot', 'Web チャット',
    
    // Mike King理論・GEO対応
    'レリバンスエンジニアリング', 'Mike King理論', 'GEO対策', 'AI検索最適化',
    'Fragment ID最適化', 'TopicalCoverage', 'セマンティック構造化データ',
    
    // ベクトルRAG統合（競合優位性の核心）
    'ベクトルRAG活用', 'トリプルRAGシステム', 'pgvector活用',
    'OpenAI Embeddings', 'セマンティック検索', 'ナレッジベース統合',
    '企業固有知識', 'FAQシステム', 'マルチモーダル対応',
    
    // 技術仕様
    'Next.js開発', 'TypeScript開発', 'Webhooks統合', 'API連携',
    'リアルタイム処理', 'WebSocket', 'サーバーレス', 'スケーラブル設計'
  ],
  category: 'チャットボット開発',
  businessId: undefined,
  categoryId: undefined,
  // Phase 3: GEO最適化対象クエリ（AI検索エンジン上位表示）
  targetQueries: [
    'GPT-4 チャットボット 開発',
    'Claude 統合 チャットボット',
    'ベクトルRAG チャットボット',
    '24時間 自動応答 システム',
    'AI カスタマーサポート',
    'LINE Bot 開発 GPT-4',
    'Slack Bot 業務自動化',
    'チャットボット 業界特化'
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

export default async function ChatbotDevelopmentPage() {
  // 統合レリバンスエンジニアリングデータを取得
  const unifiedData = await getUnifiedData();

  // チャットボット×ベクトルRAG統合スキーマ（競合優位性の核心）
  const chatbotRAGIntegrationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "インテリジェント・チャットボット開発プラットフォーム",
    "applicationCategory": "BusinessApplication",
    "applicationSubCategory": "Customer Support Bot",
    "operatingSystem": "Web Browser, Mobile, Slack, LINE, Teams, Discord",
    "programmingLanguage": ["TypeScript", "Python", "JavaScript"],
    "runtimePlatform": "Node.js, Cloud Functions, WebSocket",
    "description": "GPT-4・Claude統合・ベクトルRAG活用による業界最高レベルのインテリジェント・チャットボット開発プラットフォーム。トリプルRAGシステム・24時間自動応答・Mike King理論準拠のレリバンスエンジニアリング対応。",
    "provider": {
      "@type": "Organization",
      "@id": "https://nands.tech/#organization"
    },
    "offers": {
      "@type": "Offer",
      "price": "400000",
      "priceCurrency": "JPY",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "name": "チャットボット開発・GPT-4統合基本パッケージ",
        "description": "GPT-4・Claude統合・ベクトルRAG活用・24時間自動応答・業界特化チャットボット開発"
      }
    },
    "featureList": [
      "GPT-4・Claude 3.5 Sonnet統合",
      "ベクトルRAG・ナレッジベース活用",
      "トリプルRAGシステム統合",
      "24時間365日自動応答",
      "多言語対応（日本語・英語・中国語）",
      "業界特化カスタマイズ",
      "LINE・Slack・Teams・Discord統合",
      "エスカレーション機能",
      "感情分析・意図理解",
      "学習機能・継続改善",
      "API連携・Webhooks対応",
      "リアルタイム処理・WebSocket",
      "Mike King理論準拠",
      "レリバンスエンジニアリング対応"
    ],
    "softwareRequirements": [
      "OpenAI GPT-4 API",
      "Claude 3.5 Sonnet API",
      "pgvector",
      "PostgreSQL 14+",
      "Node.js 18+",
      "TypeScript 5+",
      "WebSocket支援",
      "OAuth 2.0",
      "Webhooks"
    ]
  };

  // ベクトルRAG統合チャットボット・ナレッジベーススキーマ
  const knowledgeBaseIntegrationSchema = {
    "@context": "https://schema.org",
    "@type": "DataFeed",
    "name": "チャットボット向けベクトルRAGナレッジベース",
    "description": "株式会社エヌアンドエスのトリプルRAGシステム（自社・トレンド・YouTube）をチャットボットに統合したナレッジベース。企業固有知識・FAQ・技術文書をベクトル化して24時間高精度回答を実現。",
    "provider": {
      "@type": "Organization",
      "@id": "https://nands.tech/#organization"
    },
    "dataset": [
      {
        "@type": "Dataset",
        "name": "企業FAQナレッジベース",
        "description": "株式会社エヌアンドエスが蓄積した企業の過去問い合わせ・FAQ・マニュアル専門ベクトル化データベース。顧客サポート履歴、製品マニュアル、技術文書、トラブルシューティング情報を高精度でベクトル化し、OpenAI Embeddingsとpgvectorによるセマンティック検索を実現。GPT-4・Claude統合により、コンテキストを理解した自然な回答生成、類似問題の自動提案、エスカレーション判定を提供。24時間365日の高品質カスタマーサポートを可能にする、次世代企業FAQ専門知識データベース。",
        "keywords": ["FAQ", "カスタマーサポート", "問い合わせ履歴", "マニュアル"],
        "creator": { 
          "@type": "Organization",
          "@id": "https://nands.tech/#organization" 
        },
        "license": "https://creativecommons.org/licenses/by-nc-sa/4.0/",
        "temporalCoverage": "2009/2024",
        "distribution": {
          "@type": "DataDownload",
          "encodingFormat": "application/json",
          "contentUrl": "https://nands.tech/api/search-rag"
        }
      },
      {
        "@type": "Dataset",
        "name": "業界特化ナレッジ",
        "description": "株式会社エヌアンドエスが15年間蓄積した42専門領域の業界知識ベクトル化データベース。製造業、金融、医療、IT、建設、物流、小売など多業界の専門用語、技術文書、業務プロセス、法規制情報、ベストプラクティスを網羅的にベクトル化。OpenAI Embeddingsによる意味的検索で、業界特化チャットボットの高精度回答を実現。専門性の高い質問に対する的確な回答生成、業界動向分析、技術トレンド予測を提供する、業界最先端の専門知識データベース。",
        "keywords": ["業界知識", "専門用語", "技術文書", "プロセス説明"],
        "creator": { 
          "@type": "Organization",
          "@id": "https://nands.tech/#organization" 
        },
        "license": "https://creativecommons.org/licenses/by-nc-sa/4.0/",
        "temporalCoverage": "2009/2024",
        "distribution": {
          "@type": "DataDownload",
          "encodingFormat": "application/json",
          "contentUrl": "https://nands.tech/api/search-rag"
        }
      },
      {
        "@type": "Dataset",
        "name": "マルチモーダル対応データ",
        "description": "株式会社エヌアンドエスが開発したテキスト・画像・音声・動画の複合データマルチモーダルベクトル化システム。文書テキスト、画像認識、音声解析、動画コンテンツを統合的にベクトル化し、OpenAI CLIP・Whisper・GPT-4V等の最新マルチモーダルAIを活用。複数メディア形式の情報を同時に理解・処理し、視覚的説明、音声ガイド、動画デモンストレーションを含む包括的な回答生成を実現。次世代マルチモーダルチャットボットの基盤となる統合型知識データベース。",
        "keywords": ["マルチモーダル", "画像認識", "音声理解", "動画解析"],
        "creator": { 
          "@type": "Organization",
          "@id": "https://nands.tech/#organization" 
        },
        "license": "https://creativecommons.org/licenses/by-nc-sa/4.0/",
        "temporalCoverage": "2024/継続更新",
        "distribution": {
          "@type": "DataDownload",
          "encodingFormat": "application/json",
          "contentUrl": "https://nands.tech/api/search-rag"
        }
      }
    ],
    "about": [
      {
        "@type": "Thing",
        "name": "ベクトル類似検索",
        "description": "pgvectorとOpenAI Embeddingsによる意味的類似検索でコンテキストに適した回答を生成"
      },
      {
        "@type": "Thing",
        "name": "リアルタイム学習",
        "description": "新しい問い合わせから継続的に学習し、回答精度を向上"
      },
      {
        "@type": "Thing",
        "name": "Mike King理論活用",
        "description": "レリバンスエンジニアリングによるAI検索最適化とGEO対策"
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

      {/* チャットボット×ベクトルRAG統合スキーマ（競合優位性の核心） */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(chatbotRAGIntegrationSchema, null, 2)
        }}
      />

      {/* ベクトルRAG統合ナレッジベーススキーマ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(knowledgeBaseIntegrationSchema, null, 2)
        }}
      />

      {/* Phase 3: GEO最適化hasPartスキーマ（AI検索エンジン最適化） */}
      {unifiedData?.geoOptimizedHasPart && (
        <script
          id="geo-optimized-haspart-chatbot"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(unifiedData.geoOptimizedHasPart.jsonLd, null, 2)
          }}
        />
      )}

      <main className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-900">
        {/* AI検索流入対応: Click-Recovery Banner */}
        {unifiedData?.aiSearchDetection?.shouldShowBanner && (
          <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-3">
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
                <span className="text-gray-900" itemProp="name">チャットボット開発</span>
                <meta itemProp="position" content="3" />
              </li>
            </ol>
          </div>
          </nav>

        {/* Fragment ID対応セクション構造 */}
        <article itemScope itemType="https://schema.org/WebPage">
          <meta itemProp="name" content="チャットボット開発・GPT-4統合・自動応答システム" />
          <meta itemProp="description" content="GPT-4・Claude統合・ベクトルRAG活用による業界最高レベルのインテリジェント・チャットボット開発。24時間自動応答・業界特化・多言語対応で顧客対応を革新。Mike King理論準拠のレリバンスエンジニアリング対応。" />

          {/* Hero Section */}
          <section id="chatbot-hero" itemScope itemType="https://schema.org/WebPageElement">
            <meta itemProp="name" content="ヒーローセクション" />
        <ChatbotHeroSectionSSR />
      </section>

          {/* チャットボット体験予定エリア */}
          <section id="chatbot-demo-preview">
            <FeaturePreviewSection
              title="インテリジェント・チャットボット体験"
              subtitle="GPT-4・Claude統合・ベクトルRAG活用"
              description="当社のトリプルRAGシステムを統合したインテリジェント・チャットボットを体験。GPT-4・Claude・ベクトル検索による高精度な自動応答で、24時間365日の顧客対応を実現できます。"
              features={[
                "GPT-4・Claude 3.5 Sonnet統合による高精度対話",
                "トリプルRAGシステム・ナレッジベース活用",
                "24時間365日自動応答・即座な問題解決",
                "多言語対応（日本語・英語・中国語・韓国語）",
                "業界特化カスタマイズ・専門用語対応",
                "感情分析・意図理解・コンテキスト保持",
                "エスカレーション機能・人間オペレーター連携",
                "学習機能・継続的な回答精度向上"
              ]}
              featureType="chatbot"
              expectedDate="2025年8月"
              accentColor="green"
            />
          </section>

          {/* 目次（機能予定エリア直後に配置） */}
          {unifiedData?.tableOfContents && unifiedData.tableOfContents.length > 0 && (
            <section id="table-of-contents" className="py-16 bg-gradient-to-r from-green-50 to-blue-50">
              <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-600 to-blue-600 px-8 py-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                      チャットボット開発サービス一覧
                </h2>
                    <p className="text-green-100 mt-2">GPT-4・Claude統合・ベクトルRAG活用・24時間自動応答</p>
              </div>
              <nav className="p-8">
                    <div className="grid md:grid-cols-2 gap-4">
                      {unifiedData.tableOfContents.map((item: any, index: number) => (
                      <a
                          key={index}
                        href={`#${item.id}`}
                          className="flex items-start p-4 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-300 group"
                      >
                          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-4">
                          {index + 1}
                        </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                            {item.title}
                          </h3>
                       {item.children && item.children.length > 0 && (
                              <ul className="mt-2 space-y-1">
                                {item.children.map((child: any, childIndex: number) => (
                                  <li key={childIndex}>
                                    <a 
                                      href={`#${child.id}`}
                                      className="text-sm text-gray-600 hover:text-green-600 transition-colors"
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
          <section id="chatbot-services" itemScope itemType="https://schema.org/WebPageElement">
            <meta itemProp="name" content="サービス一覧" />
        <ChatbotServicesSection />
      </section>

          {/* Tech Stack Section */}
          <section id="chatbot-techstack" itemScope itemType="https://schema.org/WebPageElement">
            <meta itemProp="name" content="技術スタック" />
        <ChatbotTechStack />
      </section>

          {/* Showcase Section */}
          <section id="chatbot-showcase" itemScope itemType="https://schema.org/WebPageElement">
            <meta itemProp="name" content="開発実績" />
        <ChatbotShowcase />
      </section>

          {/* チャットボット×ベクトルRAG統合の優位性セクション */}
          <section id="chatbot-rag-advantage" className="py-16 bg-gray-800" itemScope itemType="https://schema.org/WebPageElement">
            <meta itemProp="name" content="チャットボット×ベクトルRAG統合の優位性" />
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-12 text-white">🚀 チャットボット×ベクトルRAG統合による圧倒的競合優位性</h2>
                <p className="text-center text-gray-300 mb-12 text-lg">
                  当社独自のトリプルRAGシステムとチャットボットを統合した業界最高レベルの自動応答プラットフォーム
                </p>
                
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                  {/* インテリジェント回答生成 */}
                  <div className="bg-gray-700 p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold mb-4 text-green-400">🧠 インテリジェント回答生成</h3>
                    <p className="text-gray-300 mb-4">
                      ベクトルRAGとGPT-4を組み合わせた高度な回答生成。企業固有知識を活用した正確で文脈に適した応答を実現。
                    </p>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• セマンティック検索による関連情報取得</li>
                      <li>• コンテキスト保持型対話</li>
                      <li>• 企業固有ナレッジベース活用</li>
                      <li>• 回答精度継続的向上</li>
                    </ul>
                  </div>

                  {/* 24時間高品質サポート */}
                  <div className="bg-gray-700 p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold mb-4 text-blue-400">🌟 24時間高品質サポート</h3>
                    <p className="text-gray-300 mb-4">
                      人間レベルの回答品質を24時間365日提供。エスカレーション機能により複雑な問い合わせも適切に対応。
                    </p>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• 24時間365日稼働</li>
                      <li>• 人間レベル回答品質</li>
                      <li>• 即座な問題解決</li>
                      <li>• エスカレーション機能</li>
                    </ul>
                  </div>

                  {/* マルチプラットフォーム対応 */}
                  <div className="bg-gray-700 p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold mb-4 text-purple-400">🔗 マルチプラットフォーム対応</h3>
                    <p className="text-gray-300 mb-4">
                      LINE・Slack・Teams・Discord・Webサイトなど、あらゆるプラットフォームに統合可能。
                    </p>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• LINE Bot・Slack Bot統合</li>
                      <li>• Teams・Discord対応</li>
                      <li>• Webサイト埋め込み</li>
                      <li>• API・Webhooks連携</li>
                    </ul>
                  </div>
                </div>

                {/* 技術的優位性 */}
                <div className="bg-gray-700/50 p-8 rounded-xl">
                  <h3 className="text-2xl font-bold text-center mb-8 text-white">⚡ 技術的優位性</h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-lg font-bold mb-4 text-green-400">🤖 最新LLM統合</h4>
                      <ul className="text-gray-300 space-y-2">
                        <li>• GPT-4o最新モデル活用</li>
                        <li>• Claude 3.5 Sonnet統合</li>
                        <li>• マルチモーダル対応</li>
                        <li>• Function Calling活用</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold mb-4 text-blue-400">🔍 ベクトルRAG統合</h4>
                      <ul className="text-gray-300 space-y-2">
                        <li>• pgvector高速検索</li>
                        <li>• OpenAI Embeddings統合</li>
                        <li>• トリプルRAGシステム活用</li>
                        <li>• リアルタイム学習機能</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
      </section>

          {/* セマンティック関連リンクセクション */}
          {unifiedData?.semanticLinks && unifiedData.semanticLinks.length > 0 && (
            <section id="related-services" className="py-16 bg-white">
              <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto">
                  <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
                    🤖 関連するチャットボット・AI開発サービス
            </h2>
                  <p className="text-center text-gray-600 mb-8">
                    当社のトリプルRAGシステムが推奨するチャットボット関連サービス
                  </p>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {unifiedData.semanticLinks.map((link: any, index: number) => (
                      <a
                        key={index}
                        href={link.url}
                        className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300 group"
                      >
                        <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors mb-2">
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
        <ChatbotContactSectionSSR />
      </section>
        </article>
    </main>
    </>
  );
} 