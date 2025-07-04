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

// メタデータ生成
export const metadata: Metadata = {
  title: 'AIシステム開発サービス | 13法令準拠RAG・30分自動生成・24時間運用対応 | 株式会社エヌアンドエス',
  description: '株式会社エヌアンドエスのAIシステム開発サービス。13法令準拠RAGシステム、30分自動生成システム、24時間運用システムなど、業界最速・最安値でのシステム開発を提供。フルスタック開発から運用まで一貫サポート。',
  keywords: [
    'AIシステム開発',
    'RAGシステム',
    '自動生成システム',
    'フルスタック開発',
    '13法令準拠',
    '30分自動生成',
    '24時間運用',
    'ベクトル検索',
    'LLM統合',
    'システム開発会社',
    '株式会社エヌアンドエス'
  ],
  openGraph: {
    title: 'AIシステム開発サービス | 13法令準拠RAG・30分自動生成・24時間運用',
    description: '業界最速・最安値のAIシステム開発。RAGシステム、自動生成システム、フルスタックシステムの開発から24時間運用まで一貫サポート。',
    type: 'website',
    locale: 'ja_JP'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AIシステム開発サービス | 株式会社エヌアンドエス',
    description: '13法令準拠RAGシステム、30分自動生成システム開発。業界最速・最安値でAIシステムを構築。'
  },
  alternates: {
    canonical: 'https://nands.tech/system-development'
  }
};

// 統一構造化データ生成
const generateSystemDevelopmentStructuredData = () => {
  // サービスエンティティ作成
  const systemDevelopmentService = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "AIシステム開発サービス",
    "applicationCategory": "DeveloperApplication",
    "applicationSubCategory": "AI Development Platform",
    "operatingSystem": "Linux, Windows, macOS",
    "programmingLanguage": ["TypeScript", "Python", "JavaScript", "Go"],
    "runtimePlatform": "Node.js, Docker, Kubernetes",
    "description": "13法令準拠RAGシステム・30分自動生成・24時間運用対応のAIシステム開発プラットフォーム",
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
        "priceRange": "800000-",
        "priceCurrency": "JPY"
      },
      {
        "@type": "Offer",
        "name": "フルスタックシステム開発", 
        "description": "フロントエンド、バックエンドAPI、データベース設計、24時間運用対応",
        "priceRange": "1200000-",
        "priceCurrency": "JPY"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "18",
      "bestRating": "5"
    },
    "featureList": [
      "13法令準拠対応",
      "30分自動生成機能",
      "24時間運用サポート",
      "RAGシステム構築",
      "ベクトル検索実装",
      "LLM統合開発"
    ]
  };

  return systemDevelopmentService;
};

// セマンティックリンク生成
const semanticLinksSystem = new SemanticLinksSystem({
  minRelevanceScore: 0.4,
  maxLinksPerSection: 6,
  enableAIOptimization: true
});

const semanticLinks = semanticLinksSystem.generateSemanticLinks({
  currentPage: 'system-development',
  currentTitle: 'AIシステム開発サービス', 
  keywords: ['AIシステム開発', 'RAGシステム', '自動生成システム', 'フルスタック開発'],
  category: 'system-development',
  priority: 1
});

// TOC生成
const autoTOCSystem = new AutoTOCSystem({
  minLevel: 2,
  maxLevel: 4,
  generateFragmentIds: true,
  aiOptimization: true
});

const tableOfContents = [
  { id: 'hero-section', title: 'AIシステム開発サービス', level: 2 },
  { id: 'project-showcase', title: 'プロジェクト実績', level: 2 },
  { id: 'tech-stack', title: '技術スタック', level: 2 },
  { id: 'development-flow', title: '開発フロー', level: 2 },
  { id: 'system-features', title: 'システム開発の特徴', level: 2, 
    subsections: [
      { id: 'compliance-system', title: '13法令準拠RAGシステム', level: 3 },
      { id: 'auto-generation', title: '30分自動生成システム', level: 3 },
      { id: 'operation-support', title: '24時間運用対応', level: 3 }
    ]
  },
  { id: 'faq-section', title: 'よくある質問', level: 2 },
  { id: 'contact-cta', title: 'お問い合わせ', level: 2 }
];

const SystemDevelopmentPage = () => {
  const structuredData = generateSystemDevelopmentStructuredData();

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
               service['@id'].includes('/ai-agents') || 
               service['@id'].includes('/vector-rag') || 
               service['@id'].includes('/chatbot-development')
             )
          ]
        }) }}
      />
      
      <main className="min-h-screen">
        {/* パンくずナビ */}
        <nav className="bg-gray-50 px-4 py-2">
          <div className="max-w-6xl mx-auto">
            <ol className="flex items-center space-x-2 text-sm">
              <li><a href="/" className="text-blue-600 hover:underline">ホーム</a></li>
              <li className="text-gray-500">›</li>
              <li><a href="/services" className="text-blue-600 hover:underline">サービス</a></li>
              <li className="text-gray-500">›</li>
              <li className="text-gray-900">AIシステム開発</li>
            </ol>
          </div>
        </nav>

        {/* ヒーローセクション */}
        <section id="hero-section">
          <SystemHeroSectionSSR />
        </section>
        
        {/* システム開発専用チャットbot予定エリア */}
        <section id="system-chatbot-preview">
          <FeaturePreviewSection
            title="AIシステム開発コンサルティングBot"
            subtitle="リアルタイム技術相談・最適解提案"
            description="13法令準拠RAGシステム、30分自動生成、24時間運用対応など、システム開発に関する専門的な相談をリアルタイムで受けられるAIコンサルティングシステムです。"
            features={[
              "13法令準拠要件の自動チェック・提案",
              "30分自動生成システムの設計相談",
              "24時間運用対応のアーキテクチャ設計",
              "フルスタック開発技術選定サポート",
              "プロジェクト工数・期間の自動見積もり",
              "セキュリティ・コンプライアンス要件確認",
              "既存システムとの統合方法提案",
              "最適なクラウドインフラ選定支援"
            ]}
            featureType="chatbot"
            expectedDate="2025年10月"
            accentColor="green"
          />
        </section>
        
        {/* 目次（機能予定エリア直後に配置） */}
        <TableOfContents items={tableOfContents} />
        
        {/* プロジェクト実績 */}
        <section id="project-showcase">
          <ProjectShowcase />
        </section>
        
        {/* 技術スタック */}
        <section id="tech-stack">
          <TechStackSection />
        </section>
        
        {/* 開発フロー */}
        <section id="development-flow">
          <DevelopmentFlow />
        </section>

        {/* システム開発の特徴・強み */}
        <section id="system-features" className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              エヌアンドエスのAIシステム開発の特徴
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div id="compliance-system" className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-4 text-blue-600">
                  13法令準拠RAGシステム
                </h3>
                <p className="text-gray-700">
                  労働基準法、個人情報保護法など13の法令に準拠したRAGシステムを構築。
                  コンプライアンスを重視した安全なAIシステムを提供します。
                </p>
              </div>
              <div id="auto-generation" className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-4 text-green-600">
                  30分自動生成システム
                </h3>
                <p className="text-gray-700">
                  コンテンツや資料の自動生成を30分以内で実現。
                  業務効率化と時間短縮を大幅に改善します。
                </p>
              </div>
              <div id="operation-support" className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-4 text-purple-600">
                  24時間運用対応
                </h3>
                <p className="text-gray-700">
                  システムの24時間運用を前提とした設計・構築。
                  監視・保守・メンテナンスまで一貫してサポートします。
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
                  RAGシステムの開発期間はどのくらいですか？
                </h3>
                <p className="text-gray-700">
                  プロジェクトの規模にもよりますが、標準的なRAGシステムであれば2-4週間での構築が可能です。
                  13法令準拠の要件確認から実装、テストまでを含めた期間となります。
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-3 text-gray-900">
                  30分自動生成システムはどのような仕組みですか？
                </h3>
                <p className="text-gray-700">
                  LLMとベクトル検索を組み合わせた独自のシステムにより、コンテンツ生成を30分以内で実現。
                  テンプレート機能や学習機能により、継続利用で精度も向上します。
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-3 text-gray-900">
                  24時間運用サポートの内容を教えてください
                </h3>
                <p className="text-gray-700">
                  システム監視、障害対応、定期メンテナンス、パフォーマンス最適化を24時間体制で実施。
                  緊急時の対応から予防保守まで、安定運用をサポートします。
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* お問い合わせCTA */}
        <section id="contact-cta">
          <ContactCTASSR />
        </section>
      </main>
    </>
  );
};

export default SystemDevelopmentPage; 