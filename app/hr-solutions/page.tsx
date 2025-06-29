import HRHeroSection from './components/HRHeroSection';
import HRServicesSection from './components/HRServicesSection';
import HRTechStack from './components/HRTechStack';
import HRShowcase from './components/HRShowcase';
import HRPricingSection from './components/HRPricingSection';
import HRContactSection from './components/HRContactSection';
import { Metadata } from 'next';
import Script from 'next/script';

// SSR Components Import
import HRHeroSectionSSR from './components/HRHeroSectionSSR';
import HRContactSectionSSR from './components/HRContactSectionSSR';

// Mike King理論準拠: 統一レリバンスエンジニアリング統合
import { generateUnifiedPageData, PageContext, SemanticLinksComponent, TOCComponent } from '@/lib/structured-data/unified-integration';

// メタデータ（SEO強化）
export const metadata: Metadata = {
  title: 'HR支援・人事DXソリューション | 株式会社エヌアンドエス',
  description: '13法令準拠RAGシステム、AI労働法相談、退職代行DX、人事業務自動化など、法令遵守とAI技術を組み合わせた包括的HR支援サービス。労働組合連携で安心・確実な人事DXを実現します。',
  keywords: 'HR支援,人事DX,労働法AI,退職代行,13法令準拠,RAGシステム,労働組合,人事自動化,コンプライアンス,AI相談',
  openGraph: {
    title: 'HR支援・人事DXソリューション',
    description: '13法令準拠RAGシステムと労働組合連携による包括的HR支援サービス',
    type: 'website',
    url: 'https://nands.jp/hr-solutions',
    images: [
      {
        url: '/images/hr-solutions/hr-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'HR支援・人事DXソリューション'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HR支援・人事DXソリューション',
    description: '13法令準拠RAGシステムと労働組合連携による包括的HR支援サービス',
    images: ['/images/hr-solutions/hr-hero.jpg']
  },
  alternates: {
    canonical: 'https://nands.jp/hr-solutions'
  }
};

// ページコンテキスト定義
const pageContext: PageContext = {
  pageSlug: 'hr-solutions',
  pageTitle: 'HR支援・人事DXソリューション',
  keywords: [
    'HR支援', '人事DX', '労働法AI', '退職代行', '13法令準拠', 'RAGシステム',
    '労働組合', '人事自動化', 'コンプライアンス', 'AI相談', '労働基準法',
    '民法第627条', '弁護士監修', '24時間365日サポート', 'オンライン完結'
  ],
  category: 'HR・人事支援',
  businessId: undefined, // 個別サービスページなのでbusinessIdは未設定
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

export default async function HRSolutionsPage() {
  // 統合レリバンスエンジニアリングデータを取得
  const unifiedData = await getUnifiedData();

  return (
    <>
      {/* 統一構造化データ（JSON-LD） */}
      {unifiedData?.structuredData && (
        <Script
          id="unified-structured-data-hr"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(unifiedData.structuredData, null, 2)
          }}
        />
      )}

      {/* Fragment IDとTOCに対応したメインコンテンツ */}
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        
        {/* TOC（目次）- モバイル対応 */}
        {unifiedData?.tableOfContents && unifiedData.tableOfContents.length > 0 && (
          <div className="hidden lg:block fixed top-20 right-4 z-40 w-64">
            <div 
              dangerouslySetInnerHTML={{ 
                __html: TOCComponent({ 
                  toc: unifiedData.tableOfContents,
                  title: "HR支援サービス一覧",
                  className: "sticky top-4 p-4 bg-white/95 backdrop-blur border rounded-lg shadow-lg"
                })
              }}
            />
          </div>
        )}

        {/* Hero Section */}
        <section id="hr-hero">
          <HRHeroSectionSSR />
        </section>

        {/* Services Section */}
        <section id="hr-services">
          <HRServicesSection />
        </section>

        {/* Tech Stack Section */}
        <section id="hr-techstack">
          <HRTechStack />
        </section>

        {/* Showcase Section */}
        <section id="hr-showcase">
          <HRShowcase />
        </section>

        {/* Pricing Section */}
        <section id="hr-pricing">
          <HRPricingSection />
        </section>

        {/* セマンティック関連リンクセクション */}
        {unifiedData?.semanticLinks && unifiedData.semanticLinks.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: SemanticLinksComponent({ 
                    links: unifiedData.semanticLinks,
                    title: "🔗 関連するAIソリューション",
                    className: "max-w-6xl mx-auto p-8 bg-white rounded-xl shadow-lg"
                  })
                }}
              />
            </div>
          </section>
        )}

        {/* Contact Section */}
        <section id="hr-contact">
          <HRContactSectionSSR />
        </section>

        {/* エンティティ関係性を活用したリッチスニペット強化 */}
        {unifiedData?.entityRelationships && (
          <Script
            id="entity-relationships-hr"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "ItemList",
                "name": "HR支援関連エンティティ",
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
              <h2 className="text-3xl font-bold text-center mb-12">📖 HR関連記事</h2>
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