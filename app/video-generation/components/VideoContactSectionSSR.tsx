import React from 'react';

/**
 * =========================================================
 * VideoContactSectionSSR.tsx - AI動画生成専用【完全版】
 *
 * Mike King理論準拠: AI検索エンジン最適化
 * - SSRでコンテンツ認識可能
 * - 動画生成業界特化設計
 * - GEO対策（生成系検索最適化）
 * - レリバンスエンジニアリング
 * - LLMO完全対応
 * - B2B特化構造化データ
 * 
 * 【戦略】
 * ✅ AI動画生成業界特化CTA
 * ✅ 主要AIプラットフォーム強調
 * ✅ ROI・効率化重視
 * ✅ 構造化データ強化
 * ✅ Fragment ID対応
 * ✅ noscript完全対応
 * ---------------------------------------------------------
 */

// AI動画生成向けサービス項目（詳細設計）
const VIDEO_SERVICE_TYPES = [
  {
    id: "text-to-video",
    title: "テキスト→動画生成",
    description: "テキストプロンプトから自動動画生成\nVeo 3・Runway ML対応",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM5 8a1 1 0 011-1h1a1 1 0 011 1v1a1 1 0 01-1 1H6a1 1 0 01-1-1V8zm5 0a1 1 0 011-1h3a1 1 0 110 2h-3a1 1 0 01-1-1zm0 3a1 1 0 011-1h3a1 1 0 110 2h-3a1 1 0 01-1-1z" />
      </svg>
    ),
    value: "text-to-video",
    budget: "300万円〜",
    duration: "2-3ヶ月",
    roi: "制作時間短縮",
    features: ["テキスト入力", "自動動画生成", "品質最適化"]
  },
  {
    id: "image-to-video",
    title: "画像→動画変換",
    description: "静止画から動画自動生成\nRunway ML・Stable Video対応",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
      </svg>
    ),
    value: "image-to-video",
    budget: "250万円〜",
    duration: "1-2ヶ月",
    roi: "コンテンツ量増加",
    features: ["画像アップロード", "動画変換", "エフェクト追加"]
  },
  {
    id: "ai-image-generation",
    title: "AI画像生成統合",
    description: "Midjourney・DALL-E連携\n画像→動画ワークフロー",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ),
    value: "ai-image-generation",
    budget: "400万円〜",
    duration: "3-4ヶ月",
    roi: "クリエイティブ効率800%向上",
    features: ["AI画像生成", "動画変換", "統合ワークフロー"]
  },
  {
    id: "batch-processing",
    title: "バッチ処理システム",
    description: "大量動画の自動生成\n24/7無人運用対応",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
      </svg>
    ),
    value: "batch-processing",
    budget: "600万円〜",
    duration: "4-6ヶ月",
    roi: "運用コスト削減",
    features: ["バッチ処理", "自動化", "監視システム"]
  }
];

// AI動画生成 ContactAction構造化データ（Mike King理論準拠）
const videoContactSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "@id": "https://nands.tech/video-generation#contact",
  "name": "AI動画生成システム導入相談",
  "description": "Midjourney、Veo 3、Runway ML等のAI動画生成APIを活用したシステム開発に関する無料相談。テキスト→動画、画像→動画変換、バッチ処理対応。",
  "provider": {
    "@type": "Organization",
    "@id": "https://nands.tech/#organization"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "AI Video Generation Sales",
    "telephone": "+81-77-575-3757",
    "email": "contact@nands.tech",
    "availableLanguage": ["Japanese", "English"],
    "areaServed": "JP",
    "hoursAvailable": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "18:00"
    }
  },
  "potentialAction": {
    "@type": "ContactAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://nands.tech/video-generation#contact"
    }
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "AI動画生成 サービス",
    "itemListElement": VIDEO_SERVICE_TYPES.map((service, index) => ({
      "@type": "Offer",
      "position": index + 1,
      "itemOffered": {
        "@type": "Service",
        "name": service.title,
        "description": service.description,
        "category": "AI Video Generation"
      },
      "priceSpecification": {
        "@type": "PriceSpecification",
        "price": service.budget,
        "priceCurrency": "JPY"
      }
    }))
  }
};

export default function VideoContactSectionSSR() {
  return (
    <>
      {/* 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoContactSchema) }}
      />

      <section
        id="contact"
        className="py-20 md:py-32 relative"
      >
        {/* 背景エフェクト（動画生成特化デザイン） */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/30 to-indigo-900/20" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Section Header（GEO対策: Explain-Then-List） */}
            <header className="text-center mb-16">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6">
                AI動画生成システム 導入相談
              </h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
                AI動画生成システムの導入について、お気軽にご相談ください。
                <br className="hidden md:block" />
                専門チームが最適なソリューションをご提案いたします。
              </p>

              {/* Topical Coverage: AI動画生成業界特化説明（LLMO対応） */}
              <div className="text-lg text-gray-400 max-w-4xl mx-auto mb-12">
                <p>
                  株式会社エヌアンドエスは、OpenAI、Google、Meta、Adobe等の主要AI企業との
                  パートナーシップを活用し、Midjourney、Veo 3、Runway ML、DALL-E等の
                  最新AI動画・画像生成APIを統合。67社の導入実績で、
                  確実なコンテンツ制作DXをお約束いたします。
                </p>
              </div>
            </header>

            {/* AI動画生成サービス一覧（Fragment ID対応） */}
            <div id="video-services" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {VIDEO_SERVICE_TYPES.map((service) => (
                <div key={service.id} className="bg-gray-800/50 border border-gray-700/50 p-6 rounded-2xl hover:bg-gray-800/70 transition-all group backdrop-blur-sm">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-4 rounded-xl group-hover:scale-110 transition-transform">
                    <div className="text-purple-400">
                      {service.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-3 text-center text-white">{service.title}</h3>
                  <p className="text-gray-300 text-sm mb-4 text-center" style={{ whiteSpace: 'pre-line' }}>
                    {service.description}
                  </p>
                  
                  {/* 予算・期間・ROI情報 */}
                  <div className="space-y-2 text-xs text-gray-400 mb-4">
                    <div className="flex justify-between">
                      <span>予算目安:</span>
                      <span className="text-purple-400 font-semibold">{service.budget}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>期間:</span>
                      <span className="text-pink-400 font-semibold">{service.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>効果:</span>
                      <span className="text-indigo-400 font-semibold">{service.roi}</span>
                    </div>
                  </div>

                  {/* 主要機能 */}
                  <div className="space-y-1">
                    {service.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-xs text-gray-400">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="p-8 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 backdrop-blur-sm">
                <h3 className="text-xl font-bold text-white mb-6">お問い合わせフォーム</h3>
                <p className="text-gray-300 mb-8">
                  AI動画生成専門スタッフが丁寧にサポートいたします。
                </p>

                <form className="space-y-6" action="/api/contact" method="POST">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">
                        会社名 <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        required
                        className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="株式会社○○"
                      />
                    </div>
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                        担当者名 <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="山田太郎"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                        メールアドレス <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="example@company.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                        電話番号
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="03-1234-5678"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="service" className="block text-sm font-medium text-gray-300 mb-2">
                        ご希望のサービス <span className="text-red-400">*</span>
                      </label>
                      <select
                        id="service"
                        name="service"
                        required
                        className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      >
                        <option value="">選択してください</option>
                        {VIDEO_SERVICE_TYPES.map((service) => (
                          <option key={service.id} value={service.value}>{service.title}</option>
                        ))}
                        <option value="consultation">まずは相談したい</option>
                        <option value="other">その他</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="budget" className="block text-sm font-medium text-gray-300 mb-2">
                        ご予算
                      </label>
                      <select
                        id="budget"
                        name="budget"
                        className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      >
                        <option value="">選択してください</option>
                        <option value="under-200">200万円未満</option>
                        <option value="200-500">200万円〜500万円</option>
                        <option value="500-1000">500万円〜1000万円</option>
                        <option value="over-1000">1000万円以上</option>
                        <option value="undecided">未定</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="use-case" className="block text-sm font-medium text-gray-300 mb-2">
                      想定利用用途
                    </label>
                    <select
                      id="use-case"
                      name="use-case"
                      className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      <option value="">選択してください</option>
                      <option value="marketing">マーケティング動画</option>
                      <option value="social-media">SNS投稿コンテンツ</option>
                      <option value="product-demo">商品・サービス紹介</option>
                      <option value="training">教育・研修動画</option>
                      <option value="e-commerce">EC・販売促進</option>
                      <option value="other">その他</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                      お問い合わせ内容・ご要望 <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-vertical"
                      placeholder="現在のコンテンツ制作状況、AI動画生成で解決したい課題、期待する効果などをお聞かせください..."
                    />
                  </div>

                  <div className="text-center">
                    <button
                      type="submit"
                      className="px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      無料相談を申し込む
                    </button>
                  </div>
                </form>
              </div>

              {/* 右側：AI動画生成業界特化情報・実績 */}
              <div className="space-y-8">
                {/* 連絡先情報 */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white mb-8">連絡先情報</h3>
                  
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center mr-4 flex-shrink-0">
                      <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">メール</h4>
                      <p className="text-gray-300">contact@nands.tech</p>
                      <p className="text-sm text-gray-400 mt-1">24時間受付・48時間以内に返信</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center mr-4 flex-shrink-0">
                      <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">電話</h4>
                      <p className="text-gray-300">0120-407-638</p>
                      <p className="text-sm text-gray-400 mt-1">AI動画生成専用ライン 平日 9:00-18:00</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center mr-4 flex-shrink-0">
                      <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">オンライン相談</h4>
                      <p className="text-gray-300">Zoom・Google Meet対応</p>
                      <p className="text-sm text-gray-400 mt-1">事前予約制・無料デモ可能</p>
                    </div>
                  </div>
                </div>

                {/* AI動画生成サービス特徴 */}
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 p-8 rounded-xl">
                  <h3 className="text-xl font-bold text-white mb-6">AI動画生成サービス</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white flex items-center justify-center rounded-full mt-1">
                        <span className="text-xs font-bold">TX</span>
                      </div>
                      <div className="ml-3">
                        <h4 className="font-semibold text-white">テキスト→動画生成</h4>
                        <p className="text-gray-300 text-sm">最新AI技術による自動動画制作</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 bg-pink-600 text-white flex items-center justify-center rounded-full mt-1">
                        <span className="text-xs font-bold">IM</span>
                      </div>
                      <div className="ml-3">
                        <h4 className="font-semibold text-white">画像→動画変換</h4>
                        <p className="text-gray-300 text-sm">静止画から動的コンテンツ生成</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white flex items-center justify-center rounded-full mt-1">
                        <span className="text-xs font-bold">MP</span>
                      </div>
                      <div className="ml-3">
                        <h4 className="font-semibold text-white">マルチプラットフォーム</h4>
                        <p className="text-gray-300 text-sm">10+AIプラットフォーム統合</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 無料サービス */}
                <div className="p-6 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                  <h4 className="text-white font-semibold mb-3">無料サービス</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-3" />
                      現状のコンテンツ制作分析
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-3" />
                      AI動画生成戦略・要件定義
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-3" />
                      ROI試算・効果予測
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-3" />
                      実際のAI動画生成デモ
                    </li>
                  </ul>
                </div>

                {/* Mike King理論特別対応 */}
                <div className="bg-gradient-to-r from-indigo-50/10 to-purple-50/10 border border-indigo-500/20 p-8 rounded-xl">
                  <h3 className="text-xl font-bold text-indigo-300 mb-4">
                    🎯 Mike King理論準拠 AI動画生成特別対応
                  </h3>
                  <div className="space-y-3 text-purple-300">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 bg-indigo-500 text-white flex items-center justify-center rounded-full mt-1 mr-3">
                        <span className="text-xs font-bold">RE</span>
                      </div>
                      <p>レリバンスエンジニアリング（AI動画生成業界特化）</p>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 bg-indigo-500 text-white flex items-center justify-center rounded-full mt-1 mr-3">
                        <span className="text-xs font-bold">GEO</span>
                      </div>
                      <p>GEO（動画生成向け生成系検索最適化）</p>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 bg-indigo-500 text-white flex items-center justify-center rounded-full mt-1 mr-3">
                        <span className="text-xs font-bold">AI</span>
                      </div>
                      <p>AI検索エンジン完全対応</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* noscript対応: JavaScript無効時のフォールバック */}
        <noscript>
          <div className="bg-purple-50/10 text-purple-200 p-8 text-center mt-8">
            <h3 className="text-2xl font-bold mb-4">AI動画生成システム導入相談</h3>
            <p className="mb-4">JavaScript未対応環境でも、お電話・メールでご相談いただけます。</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="bg-gray-800 p-6 rounded border">
                <h4 className="font-semibold mb-2">お電話でのご相談</h4>
                <p className="text-purple-400 text-lg font-bold">0120-407-638</p>
                <p className="text-sm">AI動画生成専用ライン 平日 9:00-18:00</p>
              </div>
              <div className="bg-gray-800 p-6 rounded border">
                <h4 className="font-semibold mb-2">メールでのご相談</h4>
                <p className="text-purple-400 text-lg font-bold">contact@nands.tech</p>
                <p className="text-sm">24時間受付</p>
              </div>
            </div>
            
            {/* サービス一覧（noscript版） */}
            <div className="mt-8">
              <h4 className="text-xl font-bold mb-4">提供サービス</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                {VIDEO_SERVICE_TYPES.map((service) => (
                  <div key={service.id} className="bg-gray-800 p-4 rounded border">
                    <h5 className="font-semibold mb-2">{service.title}</h5>
                    <p className="text-sm mb-2">{service.description.replace('\n', ' ')}</p>
                    <p className="text-xs text-gray-400">
                      予算: {service.budget} | 期間: {service.duration} | 効果: {service.roi}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </noscript>
      </section>
    </>
  );
} 