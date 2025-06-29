import React from "react";
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { generateUnifiedPageData } from '@/lib/structured-data/unified-integration';
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
  description: '株式会社エヌアンドエスの法人向けAIリスキリング研修・業務効率化支援サービス。生成AIを活用した業務改善、DX推進、人材育成を通じて企業の競争力を高めます。企業規模や業種に合わせたカスタマイズ研修で、組織全体のAIリテラシー向上を実現。Mike King理論準拠のレリバンスエンジニアリング、GEO（Generative Engine Optimization）対応で、AI検索エンジンでの発見性も強化。',
  keywords: '法人向けAIリスキリング,企業向けAI研修,業務効率化,生成AI活用,人材育成,組織変革,デジタルトランスフォーメーション,DX推進,AI導入支援,AI活用コンサルティング,ChatGPT研修,プロンプトエンジニアリング,業務自動化,AIソリューション,システム開発,レリバンスエンジニアリング,GEO対策,AI検索最適化,LLMO,Fragment ID,TopicalCoverage,ExplainThenList,Mike King理論,iPullRank',
  authors: [{ name: '株式会社エヌアンドエス', url: 'https://nands.tech' }],
  creator: '株式会社エヌアンドエス',
  publisher: '株式会社エヌアンドエス',
  category: '法人向けAIソリューション',
  openGraph: {
    title: '法人向けAIリスキリング研修・業務効率化支援 | 株式会社エヌアンドエス',
    description: '株式会社エヌアンドエスの法人向けAIリスキリング研修・業務効率化支援サービス。生成AIを活用した業務改善、DX推進、人材育成を通じて企業の競争力を高めます。企業規模や業種に合わせたカスタマイズ研修で、組織全体のAIリテラシー向上を実現。Mike King理論準拠のレリバンスエンジニアリング、GEO（Generative Engine Optimization）対応で、AI検索エンジンでの発見性も強化。',
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
    description: '株式会社エヌアンドエスの法人向けAIリスキリング研修・業務効率化支援サービス。生成AIを活用した業務改善、DX推進、人材育成を通じて企業の競争力を高めます。Mike King理論準拠のレリバンスエンジニアリング、GEO（Generative Engine Optimization）対応で、AI検索エンジンでの発見性も強化。',
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

// Mike King理論準拠SSR完全対応（デザイン100%維持）
const HeroSectionSSR = dynamic(() => import('./components/HeroSectionSSR'), {
  ssr: true,
  loading: () => (
    <section className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden bg-black">
      <div className="absolute inset-0 bg-black/70 z-[1]" />
      <div className="relative z-10 container mx-auto px-4 text-center pt-32 md:pt-40">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
          Corporate Solutions
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
          ビジネスの成長を加速させる、最先端のAIソリューションを提供します
        </p>
      </div>
    </section>
  )
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

const ContactSectionSSR = dynamic(() => import('./components/ContactSectionSSR'), {
  ssr: true,
  loading: () => (
    <section className="py-16 px-4 bg-gray-900 text-white">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold mb-8">AI導入に関するご相談</h2>
        <p className="text-gray-300 mb-8">企業のAI活用・DX推進を支援します</p>
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

export default async function CorporatePage() {
  // 統一システム適用（Mike King理論準拠）
  const pageData = await generateUnifiedPageData({
    pageSlug: 'corporate',
    pageTitle: '法人向けAIリスキリング研修・業務効率化支援',
    keywords: [
      '法人向けAIリスキリング',
      '企業向けAI研修', 
      '業務効率化',
      '生成AI活用',
      '人材育成',
      '組織変革',
      'デジタルトランスフォーメーション',
      'DX推進',
      'AI導入支援',
      'AI活用コンサルティング',
      'ChatGPT研修',
      'プロンプトエンジニアリング',
      '業務自動化',
      'AIソリューション',
      'システム開発',
      'レリバンスエンジニアリング',
      'GEO対策',
      'AI検索最適化',
      'LLMO',
      'Fragment ID',
      'TopicalCoverage',
      'ExplainThenList',
      'Mike King理論',
      'iPullRank'
    ],
    category: '法人向けAIソリューション',
    businessId: 3 // 法人向けAIリスキリング研修事業
  });

  // データ処理（統一システム対応）
  const posts = (pageData.posts || []).map((post: any) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    thumbnail_url: post.thumbnail_url,
    featured_image: post.featured_image
  }));

  return (
    <main className="min-h-screen">
      {/* 構造化データの処理を修正 */}
      {Array.isArray(pageData.structuredData) ? 
        pageData.structuredData.map((data: any, index: number) => (
          <Script
            key={`structured-data-corporate-success-${index}`}
            id={`structured-data-corporate-success-${index}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
          />
        )) : 
        <Script
          key="structured-data-corporate-success"
          id="structured-data-corporate-success"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(pageData.structuredData) }}
        />
      }
      
      {/* Fragment ID対応TOC */}
      {pageData.tableOfContents && pageData.tableOfContents.length > 0 && (
        <div className="fixed top-1/2 right-4 transform -translate-y-1/2 z-50 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-xs hidden lg:block">
          <h3 className="text-sm font-bold mb-3 text-gray-900">目次</h3>
          <nav className="space-y-2">
            {pageData.tableOfContents.map((section: any, index: number) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="block text-xs text-gray-600 hover:text-blue-600 transition-colors py-1 border-l-2 border-transparent hover:border-blue-600 pl-2"
              >
                {section.title}
              </a>
            ))}
          </nav>
        </div>
      )}

      <div className="container mx-auto px-4">
        {/* <Breadcrumbs customItems={[
          { name: 'ホーム', path: '/' },
          { name: '法人向けAIリスキリング', path: '/corporate' }
        ]} /> */}
      </div>
      <section id="hero">
        <HeroSectionSSR />
      </section>
      
      {/* セマンティック内部リンク統合ナビゲーション */}
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
          
          {/* エンティティ関係性 - 関連サービス */}
          {pageData.semanticLinks && pageData.semanticLinks.length > 0 && (
            <div className="mt-8 p-6 bg-gray-800 rounded-xl">
              <h3 className="text-lg font-bold text-white mb-4">関連サービス</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pageData.semanticLinks.slice(0, 6).map((link: any, index: number) => (
                  <a
                    key={index}
                    href={link.url}
                    className="group bg-gray-700 hover:bg-gray-600 rounded-lg p-4 transition-all duration-300"
                  >
                    <h4 className="text-sm font-semibold text-white group-hover:text-blue-300 mb-1">
                      {link.title}
                    </h4>
                    <p className="text-xs text-gray-300">
                      {link.description}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section id="problems">
        <CorporateProblems />
      </section>
      <section id="services">
        <ServicesSection />
      </section>
      <section id="merits">
        <CorporateMerits />
      </section>
      <section id="case-studies">
        <CaseStudiesSection />
      </section>
      
      {/* 業界別ソリューション（軽量化） */}
      <section id="industries" className="py-16 px-4 bg-white">
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
      
      <section id="flow">
        <CorporateFlow />
      </section>
      
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
      
      <section id="faq">
        <FaqSection />
      </section>
      <section id="contact">
        <ContactSectionSSR />
      </section>
      
      {/* 最新の記事セクション（統一システム対応） */}
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
