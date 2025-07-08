import React from 'react';
import { Metadata } from 'next';
import { ORGANIZATION_ENTITY, SERVICE_ENTITIES } from '@/lib/structured-data/entity-relationships';
import { SemanticLinksSystem } from '@/lib/structured-data/semantic-links';
import { AutoTOCSystem } from '@/lib/structured-data/auto-toc-system';
import TableOfContents from '@/components/common/TableOfContents';
import SystemHeroSectionSSR from './components/SystemHeroSectionSSR';
import ProjectShowcase from './components/ProjectShowcase';
import TechStackSection from './components/TechStackSection';
import DevelopmentFlow from './components/DevelopmentFlow';
import ContactCTASSR from './components/ContactCTASSR';
import FeaturePreviewSection from '@/components/common/FeaturePreviewSection';
// Mike King理論準拠: 統一システム統合
import { generateUnifiedPageData } from '@/lib/structured-data/unified-integration';

// メタデータ生成（LLMO最適化）
export const metadata: Metadata = {
  title: 'AIシステム開発サービス | 13法令準拠RAG・30分自動生成・24時間運用対応・ベクトル検索統合 | 株式会社エヌアンドエス',
  description: '株式会社エヌアンドエスのAIシステム開発サービス。13法令準拠RAGシステム、30分自動生成システム、24時間運用システム、ベクトル検索・セマンティック検索統合など、業界最速・最安値でのシステム開発を提供。フルスタック開発から運用まで一貫サポート。Mike King理論準拠のレリバンスエンジニアリング対応。',
  keywords: [
    'AIシステム開発',
    'RAGシステム',
    '自動生成システム',
    'フルスタック開発',
    '13法令準拠',
    '30分自動生成',
    '24時間運用',
    'ベクトル検索',
    'セマンティック検索',
    'LLM統合',
    'システム開発会社',
    'レリバンスエンジニアリング',
    'Mike King理論',
    'GEO対策',
    'AI検索最適化',
    'Fragment ID最適化',
    'TopicalCoverage',
    '株式会社エヌアンドエス'
  ],
  openGraph: {
    title: 'AIシステム開発サービス | 13法令準拠RAG・30分自動生成・24時間運用・ベクトル検索統合',
    description: '業界最速・最安値のAIシステム開発。RAGシステム、自動生成システム、ベクトル検索システム、フルスタックシステムの開発から24時間運用まで一貫サポート。Mike King理論準拠。',
    type: 'website',
    locale: 'ja_JP',
    url: 'https://nands.tech/system-development',
    images: [
      {
        url: '/images/system-development/ai-system-development-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'AIシステム開発サービス - 13法令準拠RAG・ベクトル検索・24時間運用対応'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AIシステム開発サービス | 13法令準拠RAG・ベクトル検索統合 | 株式会社エヌアンドエス',
    description: '13法令準拠RAGシステム、30分自動生成システム、ベクトル検索統合開発。業界最速・最安値でAIシステムを構築。Mike King理論準拠。'
  },
  alternates: {
    canonical: 'https://nands.tech/system-development'
  }
};

// ページコンテキスト定義（Mike King理論準拠）
const pageContext = {
  pageSlug: 'system-development',
  pageTitle: 'AIシステム開発サービス',
  keywords: [
    // システム開発コア
    'AIシステム開発', 'RAGシステム', '自動生成システム', 'フルスタック開発',
    
    // 技術仕様コア
    '13法令準拠', '30分自動生成', '24時間運用', 'ベクトル検索', 'セマンティック検索',
    'LLM統合', 'OpenAI統合', 'Claude統合', 'Embedding技術',
    
    // Mike King理論・GEO
    'レリバンスエンジニアリング', 'Mike King理論', 'GEO対策', 'AI検索最適化',
    'Fragment ID最適化', 'TopicalCoverage', 'セマンティック構造化データ',
    
    // 競合優位性
    'ベクトルRAG統合', 'トリプルRAGシステム', '業界最速開発', '最安値システム開発',
    'pgvector活用', 'Supabase統合', 'Next.js開発', 'TypeScript開発'
  ],
  category: 'システム開発',
  businessId: undefined,
  categoryId: undefined,
  // Phase 3: GEO最適化対象クエリ（AI検索エンジン上位表示）
  targetQueries: [
    'AIシステム開発 13法令準拠',
    'RAGシステム構築 ベクトル検索',
    '30分自動生成システム開発',
    '24時間運用AIシステム',
    'セマンティック検索システム構築',
    'LLM統合システム開発',
    'pgvector RAGシステム',
    'フルスタックAI開発 最安値'
  ],
  // Phase 4: AI検索・Trust Layer対応
  enableAISearchDetection: true,
  enableTrustSignals: true
};

const SystemDevelopmentPage = async () => {
  // 統一レリバンスエンジニアリングデータを取得
  const unifiedData = await generateUnifiedPageData(pageContext);

  // ベクトルRAGシステム統合スキーマ（競合優位性の核心）
  const vectorRAGSystemSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "AIシステム開発サービス - Vector RAG統合プラットフォーム",
    "applicationCategory": "DeveloperApplication",
    "applicationSubCategory": "AI Development Platform",
    "operatingSystem": "Linux, Windows, macOS",
    "programmingLanguage": ["TypeScript", "Python", "JavaScript", "Go"],
    "runtimePlatform": "Node.js, Docker, Kubernetes",
    "description": "13法令準拠RAGシステム・30分自動生成・24時間運用対応・ベクトル検索統合のAIシステム開発プラットフォーム。Mike King理論準拠のレリバンスエンジニアリング対応。",
    "provider": {
      "@type": "Organization",
      "@id": "https://nands.tech/#organization",
      "name": "株式会社エヌアンドエス"
    },
    "offers": [
      {
        "@type": "Offer",
        "name": "AIシステム開発基本パッケージ",
        "description": "RAGシステム、ベクトル検索、LLM統合の基本開発パッケージ",
        "price": "800000",
        "priceCurrency": "JPY",
        "priceSpecification": {
          "@type": "PriceSpecification",
          "name": "基本開発パッケージ",
          "description": "RAGシステム構築、ベクトル検索実装、API開発を含む"
        }
      },
      {
        "@type": "Offer",
        "name": "フルスタックシステム開発", 
        "description": "フロントエンド、バックエンドAPI、データベース設計、24時間運用対応",
        "price": "1200000",
        "priceCurrency": "JPY",
        "priceSpecification": {
          "@type": "PriceSpecification", 
          "name": "フルスタック開発パッケージ",
          "description": "フロントエンド、バックエンド、インフラ、運用まで包括"
        }
      },
      {
        "@type": "Offer",
        "name": "13法令準拠RAGシステム",
        "description": "13の法令に準拠した高セキュリティRAGシステム開発",
        "price": "1800000",
        "priceCurrency": "JPY",
        "priceSpecification": {
          "@type": "PriceSpecification",
          "name": "法令準拠RAGシステム",
          "description": "GDPR、個人情報保護法等13法令完全準拠"
        }
      }
    ],
    "featureList": [
      "13法令準拠対応",
      "30分自動生成機能",
      "24時間運用サポート",
      "RAGシステム構築",
      "ベクトル検索実装",
      "セマンティック検索",
      "LLM統合開発",
      "pgvector活用",
      "OpenAI Embeddings統合",
      "トリプルRAGシステム",
      "リアルタイム更新",
      "API統合対応",
      "Mike King理論準拠",
      "レリバンスエンジニアリング"
    ],
    "softwareRequirements": [
      "Node.js 18+",
      "TypeScript 5+", 
      "Next.js 14+",
      "Supabase",
      "PostgreSQL",
      "pgvector",
      "OpenAI API",
      "Claude API"
    ],
    "systemRequirements": [
      "RAM: 16GB以上推奨",
      "Storage: SSD 500GB以上",
      "Network: 高速インターネット接続"
    ],
    "screenshot": [
      {
        "@type": "ImageObject",
        "url": "/images/system-development/rag-system-dashboard.jpg",
        "caption": "RAGシステム管理画面"
      },
      {
        "@type": "ImageObject", 
        "url": "/images/system-development/vector-search-interface.jpg",
        "caption": "ベクトル検索インターフェース"
      }
    ]
  };

  // 自社RAG活用データフィードスキーマ
  const ragDataFeedSchema = {
    "@context": "https://schema.org",
    "@type": "DataFeed",
    "name": "AIシステム開発ナレッジベース",
    "description": "株式会社エヌアンドエスのベクトルRAGシステムによるAIシステム開発専門知識データベース",
    "provider": {
      "@type": "Organization",
      "@id": "https://nands.tech/#organization"
    },
    "dataset": {
      "@type": "Dataset",
      "name": "AI System Development Knowledge Base",
      "description": "15年間の開発実績と42の専門技術領域をベクトル化したAIシステム開発専門データベース",
      "creator": {
        "@type": "Organization",
        "@id": "https://nands.tech/#organization"
      },
      "keywords": [
        "AIシステム開発",
        "RAGシステム構築",
        "ベクトル検索実装",
        "LLM統合技術",
        "pgvector活用",
        "OpenAI Embeddings",
        "セマンティック検索",
        "フルスタック開発"
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
        "name": "RAGシステム開発技術",
        "description": "Retrieval-Augmented Generation システムの設計・実装・運用技術"
  },
      {
        "@type": "Thing",
        "name": "ベクトル検索技術",
        "description": "pgvector・OpenAI Embeddings活用によるセマンティック検索実装"
      },
      {
        "@type": "Thing",
        "name": "LLM統合技術",
        "description": "OpenAI GPT・Claude等の大規模言語モデル統合開発技術"
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

      {/* ベクトルRAGシステム統合スキーマ（競合優位性の核心） */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(vectorRAGSystemSchema, null, 2)
        }}
      />
      
      {/* 自社RAG活用データフィードスキーマ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(ragDataFeedSchema, null, 2)
        }}
      />

      {/* Phase 3: GEO最適化hasPartスキーマ（AI検索エンジン最適化） */}
      {unifiedData?.geoOptimizedHasPart && (
        <script
          id="geo-optimized-haspart-system-development"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(unifiedData.geoOptimizedHasPart.jsonLd, null, 2)
          }}
      />
      )}
      
      {/* エンティティ関係性構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            ORGANIZATION_ENTITY,
            vectorRAGSystemSchema,
                         ...SERVICE_ENTITIES.filter(service => 
               service['@id'].includes('/ai-agents') || 
               service['@id'].includes('/vector-rag') || 
               service['@id'].includes('/chatbot-development')
             )
          ]
        }) }}
      />
      
      <main className="min-h-screen">
        {/* AI検索流入対応: Click-Recovery Banner */}
        {unifiedData?.aiSearchDetection?.shouldShowBanner && (
          <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3">
            <div className="container mx-auto px-4 text-center">
              <p className="text-sm">
                🚀 AI検索からお越しですか？ 
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
                <span className="text-gray-900" itemProp="name">AIシステム開発</span>
                <meta itemProp="position" content="3" />
              </li>
            </ol>
          </div>
        </nav>

        {/* Fragment ID対応セクション構造 */}
        <article itemScope itemType="https://schema.org/WebPage">
          <meta itemProp="name" content="AIシステム開発サービス" />
          <meta itemProp="description" content="13法令準拠RAGシステム・30分自動生成・24時間運用対応・ベクトル検索統合のAIシステム開発サービス" />

        {/* ヒーローセクション */}
          <section id="hero-section" itemScope itemType="https://schema.org/WebPageElement">
            <meta itemProp="name" content="ヒーローセクション" />
          <SystemHeroSectionSSR />
        </section>
        
          {/* 目次（AI検索最適化） */}
          {unifiedData?.tableOfContents && unifiedData.tableOfContents.length > 0 && (
            <section id="table-of-contents" className="py-16 bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
                    <h2 className="text-2xl font-bold text-white flex items-center">
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      AIシステム開発サービス一覧
                    </h2>
                    <p className="text-indigo-100 mt-2">13法令準拠・ベクトルRAG統合・24時間運用対応</p>
                  </div>
                  <nav className="p-8">
                    <div className="grid md:grid-cols-2 gap-4">
                      {unifiedData.tableOfContents.map((item, index) => (
                        <a
                          key={index}
                          href={`#${item.id}`}
                          className="flex items-start p-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-300 group"
                        >
                          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-4">
                            {index + 1}
                          </div>
                                                     <div>
                             <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                               {item.title}
                             </h3>
                             {item.children && item.children.length > 0 && (
                               <ul className="mt-2 space-y-1">
                                 {item.children.map((child, childIndex) => (
                                   <li key={childIndex}>
                                     <a 
                                       href={`#${child.id}`}
                                       className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
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
        
          {/* プロジェクト実績セクション */}
          <section id="project-showcase" itemScope itemType="https://schema.org/WebPageElement">
            <meta itemProp="name" content="プロジェクト実績" />
          <ProjectShowcase />
        </section>
        
          {/* 技術スタックセクション */}
          <section id="tech-stack" itemScope itemType="https://schema.org/WebPageElement">
            <meta itemProp="name" content="技術スタック" />
          <TechStackSection />
        </section>
        
          {/* 開発フローセクション */}
          <section id="development-flow" itemScope itemType="https://schema.org/WebPageElement">
            <meta itemProp="name" content="開発フロー" />
          <DevelopmentFlow />
        </section>

          {/* システム開発の特徴（Fragment ID最適化） */}
          <section id="system-features" className="py-16 bg-gray-50" itemScope itemType="https://schema.org/WebPageElement">
            <meta itemProp="name" content="システム開発の特徴" />
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-12">🚀 AIシステム開発の特徴</h2>
                
            <div className="grid md:grid-cols-3 gap-8">
                  {/* 13法令準拠RAGシステム */}
                  <div id="compliance-system" className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold mb-4 text-indigo-600">⚖️ 13法令準拠RAGシステム</h3>
                    <p className="text-gray-600 mb-4">
                      GDPR、個人情報保護法、AI倫理ガイドライン等13の法令に完全準拠したRAGシステムを構築。
                    </p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• GDPR準拠データ処理</li>
                      <li>• 個人情報保護法対応</li>
                      <li>• AI倫理ガイドライン準拠</li>
                      <li>• セキュリティ監査対応</li>
                    </ul>
              </div>

                  {/* 30分自動生成システム */}
                  <div id="auto-generation" className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold mb-4 text-purple-600">⚡ 30分自動生成システム</h3>
                    <p className="text-gray-600 mb-4">
                      業界最速30分でのコンテンツ自動生成システム。ベクトル検索とLLM統合による高精度生成。
                </p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• リアルタイム生成対応</li>
                      <li>• 多形式出力対応</li>
                      <li>• 品質保証システム</li>
                      <li>• バッチ処理対応</li>
                    </ul>
              </div>

                  {/* 24時間運用対応 */}
                  <div id="operation-support" className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold mb-4 text-green-600">🔧 24時間運用対応</h3>
                    <p className="text-gray-600 mb-4">
                      24時間365日の安定稼働を保証。監視・アラート・自動復旧システムで無停止運用を実現。
                </p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• 24時間監視体制</li>
                      <li>• 自動スケーリング</li>
                      <li>• 障害自動復旧</li>
                      <li>• パフォーマンス最適化</li>
                    </ul>
                  </div>
              </div>
            </div>
          </div>
        </section>

          {/* セマンティックリンクセクション（ベクトルRAG活用） */}
          {unifiedData?.semanticLinks && unifiedData.semanticLinks.length > 0 && (
            <section id="related-services" className="py-16 bg-white">
              <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto">
                  <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
                    🔗 関連する開発サービス
            </h2>
                  <p className="text-center text-gray-600 mb-8">
                    当社のベクトルRAGシステムが推奨する技術的に関連性の高いサービス
                  </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {unifiedData.semanticLinks.map((link, index) => (
                      <a 
                        key={index}
                        href={link.url} 
                        className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 group"
                      >
                        <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2">
                        {link.title}
                    </h3>
                        <p className="text-gray-600 text-sm">
                          技術関連性: {link.relevanceScore?.toFixed(2)}
                        </p>
                      </a>
                    ))}
                  </div>
            </div>
          </div>
        </section>
          )}

          {/* よくある質問セクション */}
          <section id="faq-section" itemScope itemType="https://schema.org/WebPageElement">
            <meta itemProp="name" content="よくある質問" />
            <div className="py-16 bg-gray-50">
              <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-3xl font-bold text-center mb-12">よくある質問</h2>
                  <div className="space-y-6" itemScope itemType="https://schema.org/FAQPage">
                    {[
                      {
                        question: "13法令準拠RAGシステムとは何ですか？",
                        answer: "GDPR、個人情報保護法、AI倫理ガイドライン等13の法令に完全準拠したRAGシステムです。データプライバシー、セキュリティ、AI倫理の観点から安全性を保証します。"
                      },
                      {
                        question: "30分自動生成システムの仕組みは？",
                        answer: "ベクトル検索とLLM統合により、高精度なコンテンツを30分で自動生成します。OpenAI Embeddings、pgvector、GPT-4等の最新技術を組み合わせています。"
                      },
                      {
                        question: "24時間運用サポートの内容は？",
                        answer: "24時間365日の監視体制、自動スケーリング、障害自動復旧、パフォーマンス最適化により、無停止運用を実現します。"
                      },
                      {
                        question: "ベクトル検索システムの優位性は？",
                        answer: "従来のキーワード検索では不可能なセマンティック（意味的）検索を実現。関連性の高い情報を高精度で取得でき、RAGシステムの回答品質を大幅に向上させます。"
                      }
                    ].map((faq, index) => (
                      <div key={index} className="bg-white p-6 rounded-xl shadow-sm" itemScope itemType="https://schema.org/Question">
                        <h3 className="font-semibold text-gray-900 mb-3" itemProp="name">
                          Q. {faq.question}
                </h3>
                        <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                          <p className="text-gray-600" itemProp="text">
                            A. {faq.answer}
                </p>
              </div>
                      </div>
                    ))}
                  </div>
              </div>
            </div>
          </div>
        </section>
        
          {/* お問い合わせセクション */}
          <section id="contact-cta" itemScope itemType="https://schema.org/WebPageElement">
            <meta itemProp="name" content="お問い合わせ" />
          <ContactCTASSR />
        </section>
        </article>
      </main>
    </>
  );
};

export default SystemDevelopmentPage; 