import React from "react";
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/server';
import ROICalculator from '@/components/corporate/ROICalculator';
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';

// Viewport設定
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2563eb' },
    { media: '(prefers-color-scheme: dark)', color: '#1e293b' }
  ],
  colorScheme: 'light dark',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://nands.tech'),
  title: {
    default: '法人向けAIリスキリング研修・業務効率化支援 | 株式会社エヌアンドエス',
    template: '%s | 株式会社エヌアンドエス - 法人向けAIソリューション'
  },
  description: '株式会社エヌアンドエスの法人向けAIリスキリング研修・業務効率化支援サービス。生成AIを活用した業務改善、DX推進、人材育成を通じて企業の競争力を高めます。企業規模や業種に合わせたカスタマイズ研修で、組織全体のAIリテラシー向上を実現。',
  keywords: '法人向けAIリスキリング,企業向けAI研修,業務効率化,生成AI活用,人材育成,組織変革,デジタルトランスフォーメーション,DX推進,AI導入支援,AI活用コンサルティング,ChatGPT研修,プロンプトエンジニアリング,業務自動化,AIソリューション,システム開発,レリバンスエンジニアリング',
  authors: [{ name: '株式会社エヌアンドエス', url: 'https://nands.tech' }],
  creator: '株式会社エヌアンドエス',
  publisher: '株式会社エヌアンドエス',
  category: '法人向けAIソリューション',
  openGraph: {
    title: '法人向けAIリスキリング研修・業務効率化支援 | 株式会社エヌアンドエス',
    description: '株式会社エヌアンドエスの法人向けAIリスキリング研修・業務効率化支援サービス。生成AIを活用した業務改善、DX推進、人材育成を通じて企業の競争力を高めます。企業規模や業種に合わせたカスタマイズ研修で、組織全体のAIリテラシー向上を実現。',
    url: 'https://nands.tech/corporate',
    siteName: '株式会社エヌアンドエス',
    images: [
      {
        url: '/images/corporate-ogp.jpg',
        width: 1200,
        height: 630,
        alt: '株式会社エヌアンドエス 法人向けAIリスキリング研修・業務効率化支援'
      }
    ],
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: '法人向けAIリスキリング研修・業務効率化支援 | 株式会社エヌアンドエス',
    description: '株式会社エヌアンドエスの法人向けAIリスキリング研修・業務効率化支援サービス。生成AIを活用した業務改善、DX推進、人材育成を通じて企業の競争力を高めます。',
    images: ['/images/corporate-ogp.jpg'],
    site: '@nands_tech',
    creator: '@nands_tech',
  },
  alternates: {
    canonical: 'https://nands.tech/corporate',
    languages: {
      'ja-JP': 'https://nands.tech/corporate',
      'en-US': 'https://nands.tech/en/corporate'
    }
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'IO9fU_SSYnQy3hee-8zcGtWVbDMsopot5fU2kLBhw3k',
  },
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
    url: false
  },
  other: {
    'format-detection': 'telephone=no',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'application-name': 'N&S Corporate',
  },
}

// SEO重要部分はSSR、軽量アニメーションのみCSR
const HeroSection = dynamic(() => import('./components/HeroSection'), {
  ssr: true
});

const ServicesSection = dynamic(() => import('./components/ServicesSection'), {
  ssr: false
});

const CorporateProblems = dynamic(() => import('./components/CorporateProblems'), {
  ssr: false
});

// 軽量コンポーネントはSSR対応
const CaseStudiesSection = dynamic(() => import('./components/CaseStudiesSection'), {
  ssr: true,
  loading: () => (
    <section className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">導入事例</h2>
      </div>
    </section>
  )
});

const FaqSection = dynamic(() => import('./components/FaqSection'), {
  ssr: true,
  loading: () => (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">よくある質問</h2>
      </div>
    </section>
  )
});

const ContactSection = dynamic(() => import('./components/ContactSection'), {
  ssr: true,
  loading: () => (
    <section className="py-16 px-4 bg-gray-900 text-white">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold mb-8">お問い合わせ</h2>
      </div>
    </section>
  )
});

const CorporateMerits = dynamic(() => import('./components/CorporateMerits'), {
  ssr: true,
  loading: () => (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">導入のメリット</h2>
      </div>
    </section>
  )
});

const CorporateFlow = dynamic(() => import('./components/CorporateFlow'), {
  ssr: true,
  loading: () => (
    <section className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">導入の流れ</h2>
      </div>
    </section>
  )
});

// 軽量データ取得関数（パフォーマンス最適化・必要最小限）
async function getCorporateData() {
  try {
    const supabase = createClient();
    
    // 最小限のデータのみ取得（パフォーマンス向上）
    const postsResult = await supabase
      .from('chatgpt_posts')
      .select('id, title, slug, excerpt, thumbnail_url, featured_image')
      .eq('status', 'published')
      .eq('business_id', 3)
      .order('created_at', { ascending: false })
      .limit(3); // 3件に削減

    return {
      posts: postsResult.data || [],
      error: postsResult.error
    };
  } catch (error) {
    console.error('Error fetching corporate data:', error);
    return {
      posts: [],
      error: error
    };
  }
}

export default async function CorporatePage() {
  const { posts: postsData, error } = await getCorporateData();

  // 構造化データ（レリバンスエンジニアリング強化・Googleガイドライン準拠）
  const organizationStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://nands.tech/#organization",
    "name": "株式会社エヌアンドエス",
    "alternateName": ["NANDS", "N&S", "エヌアンドエス"],
    "url": "https://nands.tech",
    "logo": "https://nands.tech/images/logo.png",
    "description": "総合人材支援・生成AIリスキリング研修企業。法人向けAI導入支援、DX推進、業務効率化コンサルティングを全国に提供。ChatGPT活用研修からシステム開発まで包括的サポート。",
    "foundingDate": "2008",
    "legalName": "株式会社エヌアンドエス",
    "industry": ["人材支援", "教育研修", "AIコンサルティング", "システム開発"],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "皇子が丘2丁目10番25-3004号",
      "addressLocality": "大津市",
      "addressRegion": "滋賀県",
      "postalCode": "520-0025",
      "addressCountry": "JP"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "0120-558-551",
      "contactType": "customer service",
      "email": "contact@nands.tech",
      "availableLanguage": ["Japanese"],
      "areaServed": ["JP", "関西地方", "滋賀県", "大津市"],
      "serviceUrl": "https://nands.tech/corporate"
    },
    "founder": {
      "@type": "Person",
      "name": "原田賢治",
      "jobTitle": "代表取締役"
    },
    "sameAs": [
      "https://twitter.com/nands_tech",
      "https://www.facebook.com/nands.tech",
      "https://www.linkedin.com/company/nands-tech",
      "https://taishoku-anshin-daiko.com/"
    ],
    "knowsAbout": [
      "生成AI研修",
      "ChatGPT活用",
      "プロンプトエンジニアリング",
      "AIリスキリング",
      "DX推進",
      "業務効率化",
      "システム開発",
      "Next.js開発",
      "レリバンスエンジニアリング",
      "SEO対策",
      "AI導入コンサルティング",
      "組織変革支援",
      "MCPサーバー開発",
      "RAG（Retrieval-Augmented Generation）",
      "13法令準拠RAG",
      "ベクトル化技術",
      "LLM（大規模言語モデル）",
      "AIエージェント開発",
      "AI法律相談システム",
      "労働法AI検索システム",
      "AIモード対策",
      "弁護士監修サービス",
      "労働組合連携",
      "24時間365日AIサポート"
    ],
    "serviceArea": [
      {
        "@type": "Country",
        "name": "日本"
      },
      {
        "@type": "Place",
        "name": "関西地方"
      },
      {
        "@type": "Place", 
        "name": "滋賀県"
      },
      {
        "@type": "Place",
        "name": "大津市"
      }
    ],
    "numberOfEmployees": {
      "@type": "QuantitativeValue",
      "value": "10-50"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "法人向けAIソリューション",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "AI導入コンサルティング",
            "description": "ChatGPTやAIエージェントの活用戦略立案、業務プロセス分析と改善提案",
            "provider": { "@id": "https://nands.tech/#organization" }
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "AI開発支援",
            "description": "Next.js活用Webアプリ開発、既存システムAPI連携、AIモデルファインチューニング",
            "provider": { "@id": "https://nands.tech/#organization" }
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "生成AIリスキリング研修",
            "description": "プロンプトエンジニアリング、AIエージェント開発研修",
            "provider": { "@id": "https://nands.tech/#organization" }
          }
        }
      ]
    }
  };

  const serviceStructuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "法人向けAIリスキリング研修・業務効率化支援",
    "description": "株式会社エヌアンドエスが提供する法人向けAIリスキリング研修。生成AI（ChatGPT等）を活用した業務改善、DX推進、人材育成を通じて企業の競争力を向上。企業規模や業種に合わせたカスタマイズ研修で組織全体のAIリテラシー向上を実現。",
    "provider": organizationStructuredData,
    "serviceType": "企業向けAIリスキリング研修",
    "category": "AI教育・研修サービス",
    "audience": {
      "@type": "BusinessAudience",
      "audienceType": "企業・法人"
    },
    "offers": [
      {
        "@type": "Offer",
        "name": "AI導入コンサルティング",
        "description": "ChatGPTやAIエージェントの活用戦略立案、業務プロセス分析と改善提案",
        "category": "法人向けAIソリューション",
        "priceCurrency": "JPY",
        "availability": "https://schema.org/InStock"
      },
      {
        "@type": "Offer", 
        "name": "AI開発支援",
        "description": "Next.js活用Webアプリ開発、既存システムAPI連携、AIモデルファインチューニング",
        "category": "システム開発",
        "priceCurrency": "JPY",
        "availability": "https://schema.org/InStock"
      },
      {
        "@type": "Offer",
        "name": "エンジニアリングサポート", 
        "description": "AI人材育成・採用支援、技術スタック選定、コードレビュー",
        "category": "技術コンサルティング",
        "priceCurrency": "JPY",
        "availability": "https://schema.org/InStock"
      }
    ],
    "areaServed": [
      {
        "@type": "Country",
        "name": "日本"
      },
      {
        "@type": "Place",
        "name": "関西地方"
      }
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "法人向けAIソリューション",
      "itemListElement": [
        {
          "@type": "OfferCatalog",
          "name": "AI研修・教育",
          "itemListElement": [
            {
              "@type": "Service",
              "name": "ChatGPT活用研修",
              "description": "実践的なChatGPT活用方法の習得"
            },
            {
              "@type": "Service", 
              "name": "プロンプトエンジニアリング研修",
              "description": "効果的なプロンプト作成技術の習得"
            }
          ]
        }
      ]
    }
  };

  const pageStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "法人向けAIリスキリング研修・業務効率化支援",
    "description": "株式会社エヌアンドエスの法人向けAIリスキリング研修ページ。生成AI活用による業務改善、DX推進サービスを詳しくご紹介。",
    "url": "https://nands.tech/corporate",
    "isPartOf": {
      "@type": "WebSite",
      "name": "株式会社エヌアンドエス",
      "url": "https://nands.tech"
    },
    "mainEntity": serviceStructuredData,
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "ホーム",
          "item": "https://nands.tech"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "法人向けAIリスキリング",
          "item": "https://nands.tech/corporate"
        }
      ]
    },
    "potentialAction": [
      {
        "@type": "ReadAction",
        "target": ["https://nands.tech/corporate"]
      },
      {
        "@type": "ContactAction",
        "target": ["https://nands.tech/corporate#contact"]
      }
    ]
  };

  const structuredData = [organizationStructuredData, serviceStructuredData, pageStructuredData];
  
  // エラーハンドリング（SSR対応）
  if (error) {
    console.error('Error fetching data:', error);
    return (
      <main className="min-h-screen">
        {structuredData.map((data, index) => (
          <Script
            key={`structured-data-corporate-${index}`}
            id={`structured-data-corporate-${index}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
          />
        ))}
        <div className="container mx-auto px-4">
          {/* <Breadcrumbs customItems={[
            { name: 'ホーム', path: '/' },
            { name: '法人向けAIリスキリング', path: '/corporate' }
          ]} /> */}
        </div>
        <HeroSection />
        <section className="py-8 px-4 bg-gray-900">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              <a
                href="/corporate/case-studies"
                className="group bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">🔧</div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">技術実績・専門性</h3>
                    <p className="text-blue-100 text-sm">実際の開発・運営実績をご確認</p>
                  </div>
                </div>
              </a>
              
              <a
                href="#roi-calculator"
                className="group bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">📊</div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">ROI計算ツール</h3>
                    <p className="text-green-100 text-sm">投資対効果を即座に計算</p>
                  </div>
                </div>
              </a>
              
              <a
                href="#contact"
                className="group bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">💬</div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">無料相談</h3>
                    <p className="text-purple-100 text-sm">専門スタッフがサポート</p>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </section>
        <CorporateProblems />
        <ServicesSection />
        <CorporateMerits />
        <CaseStudiesSection />
        <CorporateFlow />
        <FaqSection />
        <ContactSection />
      </main>
    );
  }

  // 軽量データ処理（パフォーマンス最適化）
  const posts = (postsData || []).map((post: any) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    thumbnail_url: post.thumbnail_url,
    featured_image: post.featured_image
  }));

  // カテゴリ機能は軽量化のため削除

  return (
    <main className="min-h-screen">
      {structuredData.map((data, index) => (
        <Script
          key={`structured-data-corporate-success-${index}`}
          id={`structured-data-corporate-success-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
      <div className="container mx-auto px-4">
        {/* <Breadcrumbs customItems={[
          { name: 'ホーム', path: '/' },
          { name: '法人向けAIリスキリング', path: '/corporate' }
        ]} /> */}
      </div>
      <HeroSection />
      
      {/* クイックナビゲーション */}
      <section className="py-8 px-4 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <a
              href="/corporate/case-studies"
              className="group bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">🔧</div>
                <div>
                  <h3 className="text-lg font-bold mb-1">技術実績・専門性</h3>
                  <p className="text-blue-100 text-sm">実際の開発・運営実績をご確認</p>
                </div>
              </div>
            </a>
            
            <a
              href="#roi-calculator"
              className="group bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">📊</div>
                <div>
                  <h3 className="text-lg font-bold mb-1">ROI計算ツール</h3>
                  <p className="text-green-100 text-sm">投資対効果を即座に計算</p>
                </div>
              </div>
            </a>
            
            <a
              href="#contact"
              className="group bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">💬</div>
                <div>
                  <h3 className="text-lg font-bold mb-1">無料相談</h3>
                  <p className="text-purple-100 text-sm">専門スタッフがサポート</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      <CorporateProblems />
      <ServicesSection />
      <CorporateMerits />
      <CaseStudiesSection />
      
      {/* 業界別ソリューション（軽量化） */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">業界別ソリューション</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">製造業</h3>
              <p className="text-gray-600 mb-4">生産効率向上とAI活用による品質管理</p>
              <a href="/industries/manufacturing" className="text-blue-600 hover:text-blue-800 font-medium">詳しく見る →</a>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">金融・保険</h3>
              <p className="text-gray-600 mb-4">リスク管理とカスタマーサービス向上</p>
              <a href="/industries/finance" className="text-blue-600 hover:text-blue-800 font-medium">詳しく見る →</a>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">小売・EC</h3>
              <p className="text-gray-600 mb-4">顧客体験向上と在庫最適化</p>
              <a href="/industries/retail" className="text-blue-600 hover:text-blue-800 font-medium">詳しく見る →</a>
            </div>
          </div>
        </div>
      </section>
      
      <CorporateFlow />
      
      {/* ROI計算ツール */}
      <section id="roi-calculator" className="py-16 px-4 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">ROI計算ツール</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              AIリスキリング研修による投資対効果を、実際の数値で計算してみましょう。
            </p>
          </div>
          <ROICalculator />
        </div>
      </section>
      
      <FaqSection />
      <ContactSection />
      
      {/* 最新の記事セクション */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">最新の記事</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              AI導入・リスキリング・キャリア支援に関する最新情報と実践的なノウハウをお届けします
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {posts.slice(0, 3).map((post: any, index: number) => (
              <a
                key={post.id}
                href={`/posts/${post.slug}`}
                className="group transform hover:-translate-y-1 transition-all duration-300"
              >
                <article className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    {(post.thumbnail_url || post.featured_image) ? (
                      <Image
                        src={post.thumbnail_url || post.featured_image}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={index === 0}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <div className="text-white text-4xl font-bold">
                          {index + 1}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 flex-grow">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-gray-600 line-clamp-3 mb-4 flex-grow">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-blue-600 font-medium group-hover:text-blue-800 transition-colors duration-200">
                        詳しく見る →
                      </span>
                      <div className="flex items-center space-x-1">
                        <span className="inline-flex items-center justify-center bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                          NEW
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              </a>
            ))}
          </div>

          <div className="text-center mt-12">
            <a
              href="/posts"
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              すべての記事を見る
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
