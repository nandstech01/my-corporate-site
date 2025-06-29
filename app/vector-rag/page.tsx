import React from 'react';
import { Metadata } from 'next';
import { ORGANIZATION_ENTITY, SERVICE_ENTITIES } from '@/lib/structured-data/entity-relationships';
import { SemanticLinksSystem } from '@/lib/structured-data/semantic-links';
import { AutoTOCSystem } from '@/lib/structured-data/auto-toc-system';
import TableOfContents from '@/components/common/TableOfContents';
import Header from '@/app/components/common/Header'
import VectorRagHeroSection from './components/VectorRagHeroSection'
import VectorRagServicesSection from './components/VectorRagServicesSection'
import VectorRagTechStack from './components/VectorRagTechStack'
import VectorRagShowcase from './components/VectorRagShowcase'
import VectorRagPricingSection from './components/VectorRagPricingSection'
import VectorRagContactSectionSSR from './components/VectorRagContactSectionSSR'

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

// 統一構造化データ生成
const generateVectorRAGStructuredData = () => {
  // ベクトルRAGサービスエンティティ作成
  const vectorRAGService = {
    "@context": "https://schema.org",
    "@type": ["Service", "SoftwareApplication"],
    "name": "ベクトルRAG開発サービス",
    "applicationCategory": "BusinessApplication",
    "description": "AI検索システム、知識ベース構築、Embedding技術を活用した高精度なRAGシステムの開発・提供サービス",
    "provider": ORGANIZATION_ENTITY,
    "serviceType": "VectorRAGDevelopment",
    "offers": [
      {
        "@type": "Offer",
        "name": "ベクトル検索システム開発",
        "description": "高精度な類似検索・セマンティック検索システムの構築",
        "priceRange": "600000-",
        "priceCurrency": "JPY"
      },
      {
        "@type": "Offer",
        "name": "知識ベース構築サービス",
        "description": "企業文書のベクトル化・インデックス化・検索最適化",
        "priceRange": "800000-",
        "priceCurrency": "JPY"
      },
      {
        "@type": "Offer",
        "name": "RAGシステム統合開発",
        "description": "LLMとベクトル検索を統合した包括的RAGシステム",
        "priceRange": "1500000-",
        "priceCurrency": "JPY"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "reviewCount": "35",
      "bestRating": "5"
    },
    "featureList": [
      "高精度ベクトル検索",
      "マルチモーダル対応",
      "リアルタイム更新",
      "スケーラブル設計",
      "API統合対応",
      "多言語対応",
      "セキュリティ強化",
      "コスト最適化"
    ],
    "applicationSubCategory": [
      "Vector Search",
      "Semantic Search", 
      "Knowledge Management",
      "Information Retrieval",
      "AI-Powered Search"
    ]
  };

  return vectorRAGService;
};

// セマンティックリンク生成
const semanticLinksSystem = new SemanticLinksSystem({
  minRelevanceScore: 0.4,
  maxLinksPerSection: 6,
  enableAIOptimization: true
});

const semanticLinks = semanticLinksSystem.generateSemanticLinks({
  currentPage: 'vector-rag',
  currentTitle: 'ベクトルRAG開発サービス',
  keywords: ['ベクトルRAG', 'AI検索', '知識ベース', 'Embedding技術', 'セマンティック検索'],
  category: 'vector-rag',
  priority: 1
});

// TOC生成（ベクトルRAG特化）
const tableOfContents = [
  { id: 'hero-section', title: 'ベクトルRAG開発サービス', level: 2 },
  { id: 'services-section', title: 'サービス内容', level: 2 },
  { id: 'tech-stack', title: '技術スタック', level: 2 },
  { id: 'showcase', title: '開発実績', level: 2 },
  { id: 'vector-features', title: 'ベクトルRAGの特徴', level: 2,
    subsections: [
      { id: 'high-precision-search', title: '高精度検索技術', level: 3 },
      { id: 'multimodal-support', title: 'マルチモーダル対応', level: 3 },
      { id: 'scalable-architecture', title: 'スケーラブル設計', level: 3 }
    ]
  },
  { id: 'pricing-section', title: '料金プラン', level: 2 },
  { id: 'faq-section', title: 'よくある質問', level: 2 },
  { id: 'contact-section', title: 'お問い合わせ', level: 2 }
];

export default function VectorRagPage() {
  const structuredData = generateVectorRAGStructuredData();

  return (
    <>
      {/* 統合構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* セマンティック内部リンク構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "関連サービス",
          "itemListElement": semanticLinks.map((link, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "url": link.url,
            "name": link.title
          }))
        }) }}
      />
      
      {/* エンティティ関係性構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            ORGANIZATION_ENTITY,
            structuredData,
            ...SERVICE_ENTITIES.filter(service => 
              service['@id'].includes('/system-development') || 
              service['@id'].includes('/ai-agents') || 
              service['@id'].includes('/chatbot-development')
            )
          ]
        }) }}
      />

      <main className="min-h-screen bg-white">
        {/* Header */}
        <Header />

        {/* パンくずナビ */}
        <nav className="bg-gray-50 px-4 py-2">
          <div className="max-w-6xl mx-auto">
            <ol className="flex items-center space-x-2 text-sm">
              <li><a href="/" className="text-blue-600 hover:underline">ホーム</a></li>
              <li className="text-gray-500">›</li>
              <li><a href="/services" className="text-blue-600 hover:underline">サービス</a></li>
              <li className="text-gray-500">›</li>
              <li className="text-gray-900">ベクトルRAG開発</li>
            </ol>
          </div>
        </nav>

        {/* ヒーローセクション */}
        <section id="hero-section">
          <VectorRagHeroSection />
        </section>

        {/* 目次（ヒーロー直後に配置） */}
        <TableOfContents items={tableOfContents} />

        {/* サービス内容セクション */}
        <section id="services-section">
          <VectorRagServicesSection />
        </section>

        {/* 技術スタック */}
        <section id="tech-stack">
          <VectorRagTechStack />
        </section>

        {/* 開発実績 */}
        <section id="showcase">
          <VectorRagShowcase />
        </section>

        {/* ベクトルRAGの特徴・強み */}
        <section id="vector-features" className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              エヌアンドエスのベクトルRAGの特徴
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div id="high-precision-search" className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-4 text-blue-600">
                  高精度検索技術
                </h3>
                <p className="text-gray-700">
                  最新のEmbedding技術と類似度計算により、従来のキーワード検索を大幅に上回る精度を実現。
                  意味的に関連性の高い情報を正確に検索できます。
                </p>
              </div>
              <div id="multimodal-support" className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-4 text-green-600">
                  マルチモーダル対応
                </h3>
                <p className="text-gray-700">
                  テキスト、画像、音声、動画など複数のデータ形式に対応。
                  統合的な検索体験で、多様なコンテンツから最適な情報を発見できます。
                </p>
              </div>
              <div id="scalable-architecture" className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-4 text-purple-600">
                  スケーラブル設計
                </h3>
                <p className="text-gray-700">
                  大量データにも対応できる分散アーキテクチャを採用。
                  企業の成長に合わせてシステムを拡張でき、長期的な運用をサポートします。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* セマンティック関連サービス */}
        <section id="semantic-links" className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              関連サービス
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {semanticLinks.map((link, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden border">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-2">
                      <a 
                        href={link.url} 
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {link.title}
                      </a>
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {link.description}
                    </p>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      関連度: {Math.round(link.relevanceScore * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ・よくある質問 */}
        <section id="faq-section" className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              よくある質問
            </h2>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-3 text-gray-900">
                  ベクトルRAGと従来の検索システムの違いは何ですか？
                </h3>
                <p className="text-gray-700">
                  従来のキーワード検索は完全一致が基本ですが、ベクトルRAGは意味的な類似性に基づいて検索します。
                  「顧客満足度向上」と検索しても「お客様の喜び」のような類似表現のドキュメントも適切にヒットします。
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-3 text-gray-900">
                  どのような企業データに対応できますか？
                </h3>
                <p className="text-gray-700">
                  マニュアル、FAQ、報告書、プレゼンテーション、メール、チャットログなど、
                  様々な形式の企業データに対応可能です。PDFや画像内のテキストも処理できます。
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-3 text-gray-900">
                  システムの導入期間と運用開始までの流れを教えてください
                </h3>
                <p className="text-gray-700">
                  要件定義から本格運用まで通常4-8週間程度です。
                  データ準備→ベクトル化→インデックス構築→検索精度調整→運用開始の流れで進めます。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 料金プラン */}
        <section id="pricing-section">
          <VectorRagPricingSection />
        </section>

        {/* お問い合わせ */}
        <section id="contact-section">
          <VectorRagContactSectionSSR />
        </section>
      </main>
    </>
  )
} 