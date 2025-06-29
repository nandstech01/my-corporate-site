import React from 'react';
import FukugyoHero from './components/FukugyoHero';
import FukugyoProblems from './components/FukugyoProblems';
import FukugyoMerits from './components/FukugyoMerits';
import FukugyoFlow from './components/FukugyoFlow';
import ContactForm from '../../components/common/ContactForm';
import BuzzWordSuccessSection from './components/BuzzWordSuccessSection';
import BuzzWordToolSection from './components/BuzzWordToolSection';
import { createClient } from '@/utils/supabase/server';
import PostsGrid from '@/components/common/PostsGrid';
import type { Metadata } from 'next';
import Script from 'next/script';
import Breadcrumbs from '../components/common/Breadcrumbs';
import Image from 'next/image';
import { generateUnifiedPageData, PageContext, SemanticLinksComponent, TOCComponent } from '@/lib/structured-data/unified-integration';

// メタデータ（SEO強化）
export const metadata: Metadata = {
  title: 'AI副業支援・ChatGPTを活用した副収入獲得サポート | 株式会社エヌアンドエス',
  description: 'AIを活用した副業支援サービス。ChatGPTなどの生成AIを活用してスキルを身につけ、副収入を得るためのサポートを提供します。初心者でも始められる実践的なノウハウ、案件獲得の方法、収入アップのコツを解説。',
  keywords: 'AI副業,ChatGPT副業,副収入,副業支援,AIツール,プロンプトエンジニアリング,在宅ワーク,フリーランス,案件獲得,スキルアップ',
  openGraph: {
    title: 'AI副業支援・ChatGPTを活用した副収入獲得サポート | 株式会社エヌアンドエス',
    description: 'AIを活用した副業支援サービス。ChatGPTなどの生成AIを活用してスキルを身につけ、副収入を得るためのサポートを提供します。',
    url: 'https://nands.tech/fukugyo',
    siteName: '株式会社エヌアンドエス',
    images: ['/images/fukugyo-ogp.jpg'],
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@nands_tech',
    creator: '@nands_tech',
  },
  alternates: {
    canonical: 'https://nands.tech/fukugyo'
  },
}

// ページコンテキスト定義
const pageContext: PageContext = {
  pageSlug: 'fukugyo',
  pageTitle: 'AI副業支援・ChatGPTを活用した副収入獲得サポート',
  keywords: [
    'AI副業',
    'ChatGPT副業',
    '副収入',
    '副業支援',
    'AIツール',
    'プロンプトエンジニアリング',
    '在宅ワーク',
    'フリーランス',
    '案件獲得',
    'スキルアップ',
    'AI副業支援',
    '株式会社エヌアンドエス'
  ],
  category: 'fukugyo',
  businessId: 1,
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

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  thumbnail_url: string | null;
  featured_image: string | null;
  category?: {
    name: string;
    slug: string;
  };
};

type Category = {
  id: number;
  name: string;
  slug: string;
  description?: string;
};

async function getFukugyoPosts(): Promise<Post[]> {
  const supabase = createClient();
  const { data: posts, error } = await supabase
    .from('chatgpt_posts')
    .select(`
      id,
      title,
      slug,
      excerpt,
      thumbnail_url,
      featured_image,
      categories!inner (
        name,
        slug
      )
    `)
    .eq('status', 'published')
    .eq('business_id', 1)  // fukugyo
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching fukugyo posts:', error);
    return [];
  }
  
  return (posts || []).map(post => {
    // Ensure the image URLs are absolute
    const imageUrl = post.thumbnail_url || post.featured_image;
    const finalImageUrl = imageUrl 
      ? imageUrl.startsWith('http') 
        ? imageUrl 
        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${imageUrl}`
      : null;

    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      thumbnail_url: finalImageUrl,
      featured_image: finalImageUrl,
      category: post.categories?.[0]
    };
  });
}

async function getFukugyoCategories(): Promise<Category[]> {
  const supabase = createClient();
  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name, slug, description')
    .eq('business_id', 1)  // fukugyo
    .order('name');
  
  if (error) {
    console.error('Error fetching fukugyo categories:', error);
    return [];
  }

  return categories || [];
}

export default async function FukugyoPage() {
  const [posts, categories, unifiedData] = await Promise.all([
    getFukugyoPosts(),
    getFukugyoCategories(),
    getUnifiedData()
  ]);

  return (
    <main>
      {/* 統一構造化データ */}
      {unifiedData?.structuredData && (
        <Script
          id="unified-structured-data-fukugyo"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(unifiedData.structuredData, null, 2)
          }}
        />
      )}

      {/* 追加の副業支援専用構造化データ */}
      <Script
        id="fukugyo-service-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": ["Service", "EducationalService"],
            "name": "AI副業支援・ChatGPTを活用した副収入獲得サポート",
            "description": "AIを活用した副業支援サービス。ChatGPTなどの生成AIを活用してスキルを身につけ、副収入を得るためのサポートを提供します。",
            "serviceType": "AI副業支援",
            "provider": {
              "@type": "Organization",
              "name": "株式会社エヌアンドエス",
              "url": "https://nands.tech"
            },
            "areaServed": "JP",
            "audience": {
              "@type": "Audience",
              "audienceType": "副業希望者、フリーランス、AI初心者"
            },
            "offers": {
              "@type": "Offer",
              "category": "副業支援サービス",
              "priceCurrency": "JPY",
              "availability": "https://schema.org/InStock"
            }
          }, null, 2)
        }}
      />
      
      <div className="min-h-screen">
        {/* パンくずナビ */}
        <div className="container mx-auto px-4">
          <Breadcrumbs customItems={[
            { name: 'ホーム', path: '/' },
            { name: 'AI副業支援', path: '/fukugyo' }
          ]} />
        </div>

        {/* TOC (目次) */}
        {unifiedData?.tableOfContents && unifiedData.tableOfContents.length > 0 && (
          <div className="hidden lg:block fixed top-20 right-4 z-40 w-64">
            <div 
              dangerouslySetInnerHTML={{ 
                __html: TOCComponent({ 
                  toc: unifiedData.tableOfContents,
                  title: "AI副業支援サービス一覧",
                  className: "sticky top-4 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 backdrop-blur border rounded-lg shadow-lg"
                })
              }}
            />
          </div>
        )}

        {/* Hero Section */}
        <section id="fukugyo-hero">
          <FukugyoHero />
        </section>

        {/* 目次（ヒーロー直後に配置） */}
        {unifiedData?.tableOfContents && unifiedData.tableOfContents.length > 0 && (
          <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="max-w-6xl mx-auto px-4">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <svg 
                      className="w-6 h-6 mr-3" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
                      />
                    </svg>
                    目次
                  </h2>
                  <p className="text-blue-100 mt-2">
                    このページの内容に素早くアクセス
                  </p>
                </div>
                
                <nav className="p-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    {unifiedData.tableOfContents.map((item, index) => (
                      <div key={index} className="group">
                        <a
                          href={`#${item.id}`}
                          className="flex items-start p-4 rounded-xl border border-gray-200 
                                   hover:border-blue-300 hover:bg-blue-50 transition-all duration-300
                                   group-hover:shadow-md"
                        >
                          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 
                                         rounded-lg flex items-center justify-center text-white text-sm font-bold mr-4">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 
                                         transition-colors mb-2 leading-tight">
                              {item.title}
                            </h3>
                          </div>
                          <svg 
                            className="w-5 h-5 text-gray-400 group-hover:text-blue-500 
                                     transition-colors flex-shrink-0 mt-1" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M9 5l7 7-7 7" 
                            />
                          </svg>
                        </a>
                        
                        {/* Subsections */}
                        {item.children && item.children.length > 0 && (
                          <div className="mt-3 ml-12 space-y-1">
                            {item.children.map((subsection, subIndex) => (
                              <a
                                key={subIndex}
                                href={`#${subsection.id}`}
                                className="block text-sm text-gray-600 hover:text-blue-600 
                                         transition-colors hover:underline pl-2 border-l-2 
                                         border-gray-200 hover:border-blue-300
                                         py-1 hover:bg-blue-50 rounded"
                              >
                                {subsection.title}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </nav>
              </div>
            </div>
          </section>
        )}

        {/* Problems Section */}
        <section id="fukugyo-problems">
          <FukugyoProblems />
        </section>

        {/* Merits Section */}
        <section id="merits-section">
          <FukugyoMerits />
        </section>

        {/* Flow Section */}
        <section id="flow-section">
          <FukugyoFlow />
        </section>

        {/* 副業支援カテゴリーセクション */}
        <section id="categories-section" className="relative py-24 px-4 bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden">
          {/* Decorative background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_70%)]" />
          </div>

          <div className="container mx-auto relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 bg-clip-text text-transparent mb-6">
                副業支援カテゴリー
              </h2>
              <div className="w-40 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 mx-auto rounded-full mb-8" />
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                あなたのスキルや興味に合わせた最適な副業を見つけましょう
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((category) => {
                // カテゴリー名とファイル名のマッピング
                const imageMap: { [key: string]: string } = {
                  'AIショート動画/UGCマーケ支援': 'fukugyo-ai-video-marketing',
                  'AI翻訳・字幕作成': 'fukugyo-ai-translation',
                  'AI音声合成/ナレーション': 'fukugyo-ai-voice',
                  'No-code × AIアプリ構築': 'fukugyo-nocode-ai-app',
                  'SEOライティング': 'fukugyo-seo-writing',
                  'データ分析': 'fukugyo-data-analysis',
                  'ビジネス事務': 'fukugyo-business-admin',
                  'プログラミング': 'fukugyo-programming',
                  '生成AIコンサルタント': 'fukugyo-genai-consultant',
                  '画像・動画生成': 'fukugyo-media-generation',
                  'default': 'default-post'
                };

                const imageName = imageMap[category.name as keyof typeof imageMap] || imageMap.default;
                const imagePath = `/images/fukugyo-categories/${imageName}.jpg`;

                return (
                  <div 
                    key={category.id} 
                    className="group relative bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 border border-blue-100/20"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={imagePath}
                        alt={category.name}
                        layout="fill"
                        objectFit="cover"
                        className="transform group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 z-10 opacity-50 group-hover:opacity-30 transition-opacity" />
                    </div>
                    
                    <div className="relative z-10 p-6">
                      <div className="mb-4">
                        <div className="inline-block px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                          <span className="text-sm font-medium text-blue-600">
                            カテゴリー
                          </span>
                        </div>
                      </div>

                      <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent group-hover:text-blue-600 transition-colors duration-300">
                        {category.name}
                      </h3>
                      <p className="text-gray-600 mb-6 leading-relaxed line-clamp-2">
                        {category.description || `${category.name}に関する記事一覧です。`}
                      </p>
                      <a 
                        href={`/categories/${category.slug}`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
                      >
                        詳しく見る
                        <svg 
                          className="w-5 h-5 ml-2 transform transition-transform group-hover:translate-x-1" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 最新記事セクション */}
        <section id="articles-section" className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">最新の記事</h2>
            <PostsGrid initialPosts={posts} />
          </div>
        </section>

        {/* Success Section */}
        <section id="success-section">
          <BuzzWordSuccessSection />
        </section>

        {/* Tools Section */}
        <section id="tools-section">
          <BuzzWordToolSection />
        </section>

        {/* セマンティック関連リンクセクション */}
        {unifiedData?.semanticLinks && unifiedData.semanticLinks.length > 0 && (
          <section className="py-16 bg-gradient-to-br from-blue-50 to-cyan-50">
            <div className="container mx-auto px-4">
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: SemanticLinksComponent({ 
                    links: unifiedData.semanticLinks,
                    title: "💼 関連するAI副業支援サービス",
                    className: "max-w-6xl mx-auto p-8 bg-white rounded-xl shadow-lg"
                  })
                }}
              />
            </div>
          </section>
        )}

        {/* Contact Section */}
        <section id="contact-section">
          <ContactForm />
        </section>

        {/* エンティティ関係性を活用したリッチスニペット強化 */}
        {unifiedData?.entityRelationships && (
          <Script
            id="entity-relationships-fukugyo"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "ItemList",
                "name": "AI副業支援関連エンティティ",
                "itemListElement": unifiedData.entityRelationships.map((entity, index) => ({
                  "@type": "ListItem",
                  "position": index + 1,
                  "name": entity.name,
                  "url": entity['@id']
                }))
              }, null, 2)
            }}
          />
        )}
      </div>
    </main>
  );
} 