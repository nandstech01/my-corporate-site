import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

/**
 * =========================================================
 * HeroSectionSSR.tsx - コーポレートページ専用
 *
 * Mike King理論準拠: AI検索エンジン最適化
 * - SSRでコンテンツ認識可能
 * - デザイン100%維持
 * - GEO対策（生成系検索最適化）
 * - レリバンスエンジニアリング
 * - LLMO完全対応
 * 
 * 【戦略】
 * ✅ SEO重要部分: SSR（h1, p, noscript等）
 * ✅ アニメーション: CSR（Squares, Masonry）
 * ✅ フォールバック: 完全対応
 * ✅ 構造化データ: 埋め込み
 * ---------------------------------------------------------
 */

// アニメーション部分のみ動的インポート（CSR）
const Squares = dynamic(() => import('./Squares'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-blue-800/10 to-blue-900/20" />
  )
});

const Masonry = dynamic(() => import('./Masonry'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg animate-pulse" />
  )
});

// ギャラリーアイテム（SSR対応）
const GALLERY_ITEMS = [
  {
    id: "manufacturing",
    image: "/images/industries/manufacturing.jpg",
    link: "/categories/manufacturing",
    alt: "製造業AIリスキリング研修",
    height: 300,
    title: "製造業",
    description: "IoT・AI活用による生産性向上"
  },
  {
    id: "finance",
    image: "/images/industries/finance.jpg", 
    link: "/categories/finance",
    alt: "金融業AI導入支援",
    height: 400,
    title: "金融",
    description: "リスク管理・顧客対応自動化"
  },
  {
    id: "medical-care",
    image: "/images/industries/medical-care.jpg",
    link: "/categories/medical-care", 
    alt: "医療・ヘルスケア分野AI活用",
    height: 300,
    title: "医療・ヘルスケア",
    description: "診断支援・業務効率化"
  },
  {
    id: "retail",
    image: "/images/industries/retail.jpg",
    link: "/categories/retail",
    alt: "小売・流通業DX推進",
    height: 350,
    title: "小売・流通",
    description: "在庫管理・需要予測AI"
  },
  {
    id: "construction",
    image: "/images/industries/construction.jpg",
    link: "/categories/construction",
    alt: "建設・不動産AI導入",
    height: 300,
    title: "建設・不動産",
    description: "設計最適化・安全管理"
  },
  {
    id: "it-software",
    image: "/images/industries/it-software.jpg",
    link: "/categories/it-software",
    alt: "IT・ソフトウェア開発AI",
    height: 400,
    title: "IT・ソフトウェア",
    description: "開発効率化・品質向上"
  },
  {
    id: "logistics",
    image: "/images/industries/logistics.jpg",
    link: "/categories/logistics",
    alt: "物流業AI最適化",
    height: 350,
    title: "物流",
    description: "配送ルート最適化・倉庫管理"
  },
  {
    id: "government",
    image: "/images/industries/government.jpg",
    link: "/categories/government",
    alt: "官公庁・自治体AI活用",
    height: 300,
    title: "官公庁・自治体",
    description: "行政効率化・市民サービス向上"
  },
  {
    id: "hr-service",
    image: "/images/industries/hr-service.jpg",
    link: "/categories/hr-service",
    alt: "人材サービス業AI導入",
    height: 400,
    title: "人材サービス",
    description: "採用最適化・人材マッチング"
  },
  {
    id: "marketing",
    image: "/images/industries/marketing.jpg",
    link: "/categories/marketing",
    alt: "マーケティング分野AI活用",
    height: 350,
    title: "マーケティング",
    description: "顧客分析・効果測定自動化"
  }
];

// 法人向けサービス構造化データ（Mike King理論準拠）
const corporateServiceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://nands.tech/corporate#service",
  "name": "法人向けAIリスキリング研修・業務効率化支援",
  "description": "企業のDX推進・生成AI活用を支援する包括的なリスキリング研修サービス。業界別カスタマイズ対応で組織全体のAIリテラシー向上を実現。",
  "provider": {
    "@type": "Organization",
    "@id": "https://nands.tech/#organization"
  },
  "serviceType": "Corporate AI Training",
  "areaServed": {
    "@type": "Country",
    "name": "Japan"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "法人向けAIソリューション",
    "itemListElement": GALLERY_ITEMS.map((item, index) => ({
      "@type": "Offer",
      "position": index + 1,
      "itemOffered": {
        "@type": "Service",
        "name": `${item.title}向けAI研修`,
        "description": item.description,
        "category": item.title
      }
    }))
  },
  "audience": {
    "@type": "BusinessAudience",
    "audienceType": "企業・法人",
    "geographicArea": {
      "@type": "Country", 
      "name": "Japan"
    }
  },
  "offers": {
    "@type": "Offer",
    "availability": "https://schema.org/InStock",
    "price": "要相談",
    "priceCurrency": "JPY"
  }
};

export default function HeroSectionSSR() {
  return (
    <>
      {/* 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(corporateServiceSchema) }}
      />

      <section className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden bg-black">
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/70 z-[1]" />

        {/* Animated squares background - CSR only */}
        <div className="absolute inset-0 z-[2]">
          <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-blue-800/10 to-blue-900/20" />}>
            <Squares 
              speed={0.4} 
              squareSize={45}
              direction='diagonal'
              borderColor='rgba(255, 255, 255, 0.15)'
              hoverFillColor='rgba(255, 255, 255, 0.08)'
            />
          </Suspense>
        </div>

        {/* パンくずナビ（ヒーローセクション背景上に配置） */}
        <nav className="absolute top-0 left-0 right-0 z-10 px-4 py-3" 
             style={{backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(10px)'}}>
          <div className="max-w-6xl mx-auto">
            <ol className="flex items-center space-x-2 text-sm min-w-0" itemScope itemType="https://schema.org/BreadcrumbList">
              <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem" className="flex-shrink-0">
                <a href="/" className="text-white hover:text-blue-200 transition-colors" itemProp="item">
                  <span itemProp="name">ホーム</span>
                </a>
                <meta itemProp="position" content="1" />
              </li>
              <li className="text-blue-200 flex-shrink-0">›</li>
              <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem" className="flex-shrink-0">
                <a href="/#services" className="text-white hover:text-blue-200 transition-colors" itemProp="item">
                  <span itemProp="name">サービス</span>
                </a>
                <meta itemProp="position" content="2" />
              </li>
              <li className="text-blue-200 flex-shrink-0">›</li>
              <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem" className="flex-1 min-w-0">
                <span className="text-white font-medium block truncate sm:whitespace-normal" itemProp="name" title="法人向けAI研修">
                  法人向けAI研修...
                </span>
                <meta itemProp="position" content="3" />
              </li>
            </ol>
          </div>
        </nav>

        {/* SEO最重要部分（SSR完全対応） */}
        <header className="relative z-10 container mx-auto px-4 text-center pt-24 md:pt-28">
          {/* Mike King理論準拠: Fragment ID対応 */}
          <div id="corporate-hero">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Corporate Solutions
            </h1>
            
            {/* GEO対策: Explain-Then-List構造 */}
            <div className="mb-8">
              <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
                ビジネスの成長を加速させる、最先端のAIソリューションを提供します
              </p>
              
              {/* Topical Coverage: 詳細説明（AI検索エンジン対応） */}
              <div className="text-lg text-gray-400 max-w-4xl mx-auto mb-8 space-y-2">
                <p>
                  株式会社エヌアンドエスの法人向けAIリスキリング研修は、企業のDX推進と生成AI活用を支援する包括的なソリューションです。
                </p>
                <p>
                  業界別カスタマイズ対応により、製造業から金融、医療、IT、官公庁まで幅広い分野で組織全体のAIリテラシー向上を実現します。
                </p>
              </div>
            </div>

            {/* CTA Button（JavaScript無しでも機能） */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <a
                href="#consultation-section"
                className="px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm transition-all duration-300 group inline-flex items-center text-white/90 text-lg"
              >
                無料相談はこちら
                <svg
                  className="w-4 h-4 ml-2 transform transition-transform group-hover:translate-y-1 opacity-70"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </a>
            </div>

            {/* 業界別サービス一覧（noscript対応） */}
            <div id="industry-services" className="hidden lg:block mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">対応業界・分野</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto text-sm">
                {GALLERY_ITEMS.map((item, index) => (
                  <div key={item.id} className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
                    <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                    <p className="text-gray-400 text-xs">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Masonry gallery - CSR（デザイン維持） */}
          <div className="flex justify-center w-full pt-12 px-0 sm:px-2">
            <Suspense fallback={
              <div className="w-full max-w-4xl">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from({length: 8}).map((_, i) => (
                    <div key={i} className="bg-gray-700/50 rounded-lg animate-pulse" style={{height: `${200 + (i % 3) * 50}px`}} />
                  ))}
                </div>
              </div>
            }>
              <Masonry 
                items={GALLERY_ITEMS.map(item => ({
                  id: item.id,
                  image: item.image,
                  slug: item.link.replace('/categories/', ''),
                  height: item.height,
                  text: item.alt,
                  width: 280
                }))} 
                columnWidth={230}
                gap={16}
                maxColumns={4}
                maxContentWidth={1050}
              />
            </Suspense>
          </div>
        </header>

        {/* noscript対応: JavaScript無効時のフォールバック */}
        <noscript>
          <div className="relative z-20 bg-blue-900/90 text-white p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">法人向けAIリスキリング研修</h2>
            <p className="mb-4">JavaScript未対応環境でも情報をご確認いただけます。</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {GALLERY_ITEMS.slice(0, 6).map((item) => (
                <div key={item.id} className="bg-white/10 p-4 rounded border">
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm">{item.description}</p>
                </div>
              ))}
            </div>
            <p className="mt-6">
              お問い合わせ: <a href="tel:+81-120-558-551" className="text-blue-300 underline">0120-558-551</a> |
            <a href="mailto:contact@nands.tech" className="text-blue-300 underline ml-2">contact@nands.tech</a>
            </p>
          </div>
        </noscript>
      </section>
    </>
  );
} 