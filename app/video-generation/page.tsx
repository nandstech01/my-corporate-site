import React from 'react';
import { Metadata } from 'next';
import { ORGANIZATION_ENTITY, SERVICE_ENTITIES } from '@/lib/structured-data/entity-relationships';
import { SemanticLinksSystem } from '@/lib/structured-data/semantic-links';
import { AutoTOCSystem } from '@/lib/structured-data/auto-toc-system';
import TableOfContents from '@/components/common/TableOfContents';
import VideoHeroSectionSSR from './components/VideoHeroSectionSSR';
import VideoServicesSection from './components/VideoServicesSection';
import VideoTechStack from './components/VideoTechStack';
import VideoShowcase from './components/VideoShowcase';
import VideoPricingSection from './components/VideoPricingSection';
import VideoContactSectionSSR from './components/VideoContactSectionSSR';
import FeaturePreviewSection from '@/components/common/FeaturePreviewSection';

// メタデータ生成
export const metadata: Metadata = {
  title: '動画生成AI開発サービス | 自動動画作成・AIクリエイティブ・マルチメディアソリューション | 株式会社エヌアンドエス',
  description: '株式会社エヌアンドエスの動画生成AI開発サービス。自動動画作成、AIクリエイティブ、マルチメディアソリューション、動画マーケティング自動化など、最先端の動画生成技術で企業のコンテンツ制作を革新します。',
  keywords: [
    '動画生成AI',
    '自動動画作成',
    'AIクリエイティブ',
    'マルチメディアソリューション',
    '動画マーケティング自動化',
    'AI動画編集',
    'コンテンツ自動生成',
    'クリエイティブテクノロジー',
    '動画制作AI',
    'ビデオ生成システム',
    '株式会社エヌアンドエス'
  ],
  openGraph: {
    title: '動画生成AI開発サービス | 自動動画作成・AIクリエイティブ・マルチメディアソリューション',
    description: '最先端の動画生成AI技術で企業のコンテンツ制作を革新。自動動画作成、AIクリエイティブ、動画マーケティング自動化を実現。',
    type: 'website',
    locale: 'ja_JP'
  },
  twitter: {
    card: 'summary_large_image',
    title: '動画生成AI開発サービス | 株式会社エヌアンドエス',
    description: '自動動画作成・AIクリエイティブ・マルチメディアソリューションで企業のコンテンツ制作を革新。'
  },
  alternates: {
    canonical: 'https://nands.tech/video-generation'
  }
};

// 統一構造化データ生成
const generateVideoGenerationStructuredData = () => {
  // 動画生成AIサービスエンティティ作成
  const videoGenerationService = {
    "@context": "https://schema.org",
    "@type": ["Service", "SoftwareApplication", "CreativeWork"],
    "name": "動画生成AI開発サービス",
    "applicationCategory": "MultimediaApplication",
    "description": "自動動画作成、AIクリエイティブ、マルチメディアソリューションを活用した最先端の動画生成AIシステムの開発・提供サービス",
    "provider": ORGANIZATION_ENTITY,
    "serviceType": "VideoGenerationAI",
    "offers": [
      {
        "@type": "Offer",
        "name": "自動動画作成システム開発",
        "description": "AI技術による動画の自動生成・編集・配信システムの構築",
        "priceRange": "800000-",
        "priceCurrency": "JPY"
      },
      {
        "@type": "Offer",
        "name": "AIクリエイティブソリューション",
        "description": "創造性とAI技術を融合したクリエイティブコンテンツ生成システム",
        "priceRange": "1200000-",
        "priceCurrency": "JPY"
      },
      {
        "@type": "Offer",
        "name": "動画マーケティング自動化システム",
        "description": "企業の動画マーケティング戦略をAIで自動化・最適化",
        "priceRange": "1800000-",
        "priceCurrency": "JPY"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.7",
      "reviewCount": "16",
      "bestRating": "5"
    },
    "featureList": [
      "自動動画生成",
      "AIクリエイティブ制作",
      "マルチメディア統合",
      "動画マーケティング自動化",
      "リアルタイム編集",
      "多言語対応動画",
      "ブランディング一貫性",
      "ROI最適化"
    ],
    "applicationSubCategory": [
      "Video Generation",
      "AI Creative",
      "Multimedia Production",
      "Marketing Automation",
      "Content Creation"
    ],
    "creativeWorkStatus": "Published",
    "inLanguage": "ja"
  };

  return videoGenerationService;
};

// セマンティックリンク生成
const semanticLinksSystem = new SemanticLinksSystem({
  minRelevanceScore: 0.4,
  maxLinksPerSection: 6,
  enableAIOptimization: true
});

const semanticLinks = semanticLinksSystem.generateSemanticLinks({
  currentPage: 'video-generation',
  currentTitle: '動画生成AI開発サービス',
  keywords: ['動画生成AI', '自動動画作成', 'AIクリエイティブ', 'マルチメディア', '動画マーケティング'],
  category: 'video-generation',
  priority: 1
});

// TOC生成（動画生成AI特化）
const tableOfContents = [
  { id: 'hero-section', title: '動画生成AI開発サービス', level: 2 },
  { id: 'services-section', title: 'サービス内容', level: 2 },
  { id: 'tech-stack', title: '技術スタック', level: 2 },
  { id: 'showcase', title: '開発実績', level: 2 },
  { id: 'video-ai-features', title: '動画生成AIの特徴', level: 2,
    subsections: [
      { id: 'auto-generation', title: '自動動画生成技術', level: 3 },
      { id: 'ai-creative', title: 'AIクリエイティブ制作', level: 3 },
      { id: 'marketing-automation', title: '動画マーケティング自動化', level: 3 }
    ]
  },
  { id: 'pricing-section', title: '料金プラン', level: 2 },
  { id: 'faq-section', title: 'よくある質問', level: 2 },
  { id: 'contact-section', title: 'お問い合わせ', level: 2 }
];

export default function VideoGenerationPage() {
  const structuredData = generateVideoGenerationStructuredData();

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
              service['@id'].includes('/system-development') || 
              service['@id'].includes('/sns-automation')
            )
          ]
        }) }}
      />

      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        {/* パンくずナビ */}
        <nav className="bg-black bg-opacity-30 px-4 py-2">
          <div className="max-w-6xl mx-auto">
            <ol className="flex items-center space-x-2 text-sm text-white">
              <li><a href="/" className="text-purple-300 hover:text-purple-100 hover:underline">ホーム</a></li>
              <li className="text-purple-400">›</li>
              <li><a href="/#services" className="text-purple-300 hover:text-purple-100 hover:underline">サービス</a></li>
              <li className="text-purple-400">›</li>
              <li className="text-white">動画生成AI開発</li>
            </ol>
          </div>
        </nav>

        {/* ヒーローセクション */}
        <section id="hero-section">
          <VideoHeroSectionSSR />
        </section>

        {/* 動画生成AI専用ツール予定エリア */}
        <section id="video-generation-preview">
          <FeaturePreviewSection
            title="AI動画生成ツール"
            subtitle="テキストから動画を自動生成"
            description="Midjourney、Runway ML、DALL-E等の最新AI技術を統合し、テキストから高品質な動画を自動生成。企業のコンテンツ制作を革新的に効率化します。"
            features={[
              "テキストから動画自動生成",
              "Midjourney・Runway ML・DALL-E統合",
              "マルチメディア・マルチモーダル対応",
              "ブランドガイドライン準拠",
              "A/Bテスト・最適化機能",
              "リアルタイム編集・カスタマイズ",
              "多言語動画生成",
              "API連携・バッチ処理対応"
            ]}
            featureType="generation"
            expectedDate="2026年1月"
            accentColor="pink"
          />
        </section>

        {/* 目次（ヒーロー直後に配置、背景色を調整） */}
        <div className="bg-gray-50">
          <TableOfContents items={tableOfContents} />
        </div>

        {/* サービス内容セクション */}
        <section id="services-section">
          <VideoServicesSection />
        </section>

        {/* 技術スタック */}
        <section id="tech-stack">
          <VideoTechStack />
        </section>

        {/* 開発実績 */}
        <section id="showcase">
          <VideoShowcase />
        </section>

        {/* 動画生成AIの特徴・強み */}
        <section id="video-ai-features" className="py-16 bg-gradient-to-r from-gray-800 to-gray-900">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-white">
              エヌアンドエスの動画生成AIの特徴
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div id="auto-generation" className="bg-black bg-opacity-40 p-6 rounded-lg backdrop-blur-sm border border-purple-500">
                <h3 className="text-xl font-semibold mb-4 text-purple-300">
                  自動動画生成技術
                </h3>
                <p className="text-gray-300">
                  最先端のAI技術により、テキストから高品質な動画を自動生成。
                  企業の動画コンテンツ制作を大幅に効率化し、創造性を解放します。
                </p>
              </div>
              <div id="ai-creative" className="bg-black bg-opacity-40 p-6 rounded-lg backdrop-blur-sm border border-green-500">
                <h3 className="text-xl font-semibold mb-4 text-green-300">
                  AIクリエイティブ制作
                </h3>
                <p className="text-gray-300">
                  創造性とAI技術を融合したクリエイティブコンテンツ生成。
                  ブランドイメージに一貫性を保ちながら、革新的な動画表現を実現します。
                </p>
              </div>
              <div id="marketing-automation" className="bg-black bg-opacity-40 p-6 rounded-lg backdrop-blur-sm border border-blue-500">
                <h3 className="text-xl font-semibold mb-4 text-blue-300">
                  動画マーケティング自動化
                </h3>
                <p className="text-gray-300">
                  企業の動画マーケティング戦略をAIで自動化・最適化。
                  ターゲットに合わせた動画配信で、ROIを最大化します。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* セマンティック関連サービス */}
        <section id="semantic-links" className="py-16 bg-gradient-to-r from-indigo-900 to-purple-900">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-white">
              関連サービス
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {semanticLinks.map((link, index) => (
                <div key={index} className="bg-black bg-opacity-40 rounded-lg overflow-hidden border border-purple-400 backdrop-blur-sm">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-2">
                      <a 
                        href={link.url} 
                        className="text-purple-300 hover:text-white hover:underline"
                      >
                        {link.title}
                      </a>
                    </h3>
                    <p className="text-gray-300 text-sm mb-3">
                      {link.description}
                    </p>
                    <span className="inline-block bg-purple-900 bg-opacity-50 text-purple-200 text-xs px-2 py-1 rounded">
                      関連度: {Math.round(link.relevanceScore * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ・よくある質問 */}
        <section id="faq-section" className="py-16 bg-gradient-to-r from-gray-800 to-gray-900">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-white">
              よくある質問
            </h2>
            <div className="space-y-6">
              <div className="bg-black bg-opacity-40 p-6 rounded-lg backdrop-blur-sm border border-gray-600">
                <h3 className="text-lg font-semibold mb-3 text-white">
                  動画生成AIはどのような動画を作成できますか？
                </h3>
                <p className="text-gray-300">
                  プロモーション動画、説明動画、商品紹介動画、社内研修動画など、
                  様々な用途の動画を自動生成できます。ブランドガイドラインに沿った一貫性のある動画制作が可能です。
                </p>
              </div>
              <div className="bg-black bg-opacity-40 p-6 rounded-lg backdrop-blur-sm border border-gray-600">
                <h3 className="text-lg font-semibold mb-3 text-white">
                  従来の動画制作と比べてどのような違いがありますか？
                </h3>
                <p className="text-gray-300">
                  制作時間を90%短縮し、コストを80%削減できます。
                  また、A/Bテストによる最適化や、リアルタイムでの動画カスタマイズが可能です。
                </p>
              </div>
              <div className="bg-black bg-opacity-40 p-6 rounded-lg backdrop-blur-sm border border-gray-600">
                <h3 className="text-lg font-semibold mb-3 text-white">
                  導入から運用開始までの期間はどのくらいですか？
                </h3>
                <p className="text-gray-700">
                  システムの規模にもよりますが、基本的な動画生成システムであれば6-10週間程度です。
                  要件定義→AI学習→テスト→本格運用の流れで進めます。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 料金プラン */}
        <section id="pricing-section">
          <VideoPricingSection />
        </section>

        {/* お問い合わせ */}
        <section id="contact-section">
          <VideoContactSectionSSR />
        </section>
      </main>
    </>
  );
} 