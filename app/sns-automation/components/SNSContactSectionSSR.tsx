import React from 'react';

/**
 * =========================================================
 * SNSContactSectionSSR.tsx - SNS自動化専用【完全版】
 *
 * Mike King理論準拠: AI検索エンジン最適化
 * - SSRでコンテンツ認識可能
 * - SNS業界特化設計
 * - GEO対策（生成系検索最適化）
 * - レリバンスエンジニアリング
 * - LLMO完全対応
 * - B2B特化構造化データ
 * 
 * 【戦略】
 * ✅ SNS業界特化CTA
 * ✅ マルチプラットフォーム強調
 * ✅ ROI・効果測定重視
 * ✅ 構造化データ強化
 * ✅ Fragment ID対応
 * ✅ noscript完全対応
 * ---------------------------------------------------------
 */

// SNS自動化向けサービス項目（詳細設計）
const SNS_SERVICE_TYPES = [
  {
    id: "twitter-automation",
    title: "X（Twitter）自動化",
    description: "ツイート自動投稿・RT管理\nエンゲージメント最適化",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
      </svg>
    ),
    value: "twitter-automation",
    budget: "150万円〜",
    duration: "1-2ヶ月",
    roi: "フォロワー増加",
    features: ["自動投稿", "ハッシュタグ最適化", "エンゲージメント分析"]
  },
  {
    id: "instagram-automation",
    title: "Instagram自動化",
    description: "画像・ストーリー自動投稿\nハッシュタグ戦略・分析",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v.93a2 2 0 001.17 1.83l3.24 1.46a.75.75 0 00.63-.02L10 8.35l2.96 1.15a.75.75 0 00.63.02l3.24-1.46A2 2 0 0018 5.93V5a2 2 0 00-2-2H4zm0 5.13l2.5 1.11a.75.75 0 00.63-.02L10 8.35l2.87 1.87a.75.75 0 00.63.02L16 8.13V15a2 2 0 01-2 2H6a2 2 0 01-2-2V8.13z" clipRule="evenodd" />
      </svg>
    ),
    value: "instagram-automation",
    budget: "200万円〜",
    duration: "2-3ヶ月",
    roi: "リーチ向上",
    features: ["画像自動投稿", "ストーリー管理", "インサイト分析"]
  },
  {
    id: "facebook-automation",
    title: "Facebook自動化",
    description: "ページ投稿・広告最適化\nコミュニティ管理",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
      </svg>
    ),
    value: "facebook-automation",
    budget: "180万円〜",
    duration: "1-3ヶ月",
    roi: "コンバージョン向上",
    features: ["投稿自動化", "広告最適化", "コミュニティ管理"]
  },
  {
    id: "multi-platform",
    title: "マルチプラットフォーム統合",
    description: "複数SNSの統合管理\n一元化ダッシュボード",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
      </svg>
    ),
    value: "multi-platform",
    budget: "500万円〜",
    duration: "3-6ヶ月",
    roi: "効率向上",
    features: ["統合管理", "横断分析", "一元レポート"]
  }
];

// SNS自動化 ContactAction構造化データ（Mike King理論準拠）
const snsContactSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "@id": "https://nands.tech/sns-automation#contact",
  "name": "SNS自動化システム導入相談",
  "description": "X（Twitter）、Instagram、Facebook等のSNS自動化システム開発に関する無料相談。マルチプラットフォーム対応、エンゲージメント分析機能付き。",
  "provider": {
    "@type": "Organization",
    "@id": "https://nands.tech/#organization"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "SNS Automation Sales",
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
      "urlTemplate": "https://nands.tech/sns-automation#contact"
    }
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "SNS自動化 サービス",
    "itemListElement": SNS_SERVICE_TYPES.map((service, index) => ({
      "@type": "Offer",
      "position": index + 1,
      "itemOffered": {
        "@type": "Service",
        "name": service.title,
        "description": service.description,
        "category": "SNS Automation"
      },
      "priceSpecification": {
        "@type": "PriceSpecification",
        "price": service.budget,
        "priceCurrency": "JPY"
      }
    }))
  }
};

export default function SNSContactSectionSSR() {
  return (
    <>
      {/* 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(snsContactSchema) }}
      />

      <section
        id="contact"
        className="relative py-20 md:py-32"
      >
        {/* 背景エフェクト（SNS特化デザイン） */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/30 to-cyan-900/20" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Section Header（GEO対策: Explain-Then-List） */}
            <header className="text-center mb-16">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6">
                SNS自動化システム 導入相談
              </h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
                SNS自動化システムの導入について、お気軽にご相談ください。
                <br className="hidden md:block" />
                無料相談・デモンストレーションも承っております。
              </p>

              {/* Topical Coverage: SNS業界特化説明（LLMO対応） */}
              <div className="text-lg text-gray-400 max-w-4xl mx-auto mb-12">
                <p>
                  株式会社エヌアンドエスは、Meta（Facebook）、X Corp、Googleなど主要SNS
                  プラットフォームの公式パートナーシップを活用し、X（Twitter）、Instagram、
                  Facebook、LinkedInの統合自動化システムを提供。
                  確実なSNSマーケティングROI向上をお約束いたします。
                </p>
              </div>
            </header>

            {/* SNSサービス一覧（Fragment ID対応） */}
            <div id="sns-services" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {SNS_SERVICE_TYPES.map((service) => (
                <div key={service.id} className="bg-gray-800/50 border border-gray-700/50 p-6 rounded-2xl hover:bg-gray-800/70 transition-all group backdrop-blur-sm">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-4 rounded-xl group-hover:scale-110 transition-transform">
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
                      <span className="text-blue-400 font-semibold">{service.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>効果:</span>
                      <span className="text-cyan-400 font-semibold">{service.roi}</span>
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
                  SNS自動化専門スタッフが丁寧にサポートいたします。
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
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
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
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
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
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
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
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
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
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none transition-colors"
                      >
                        <option value="">選択してください</option>
                        {SNS_SERVICE_TYPES.map((service) => (
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
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none transition-colors"
                      >
                        <option value="">選択してください</option>
                        <option value="under-100">100万円未満</option>
                        <option value="100-300">100万円〜300万円</option>
                        <option value="300-500">300万円〜500万円</option>
                        <option value="over-500">500万円以上</option>
                        <option value="undecided">未定</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="platforms" className="block text-sm font-medium text-gray-300 mb-2">
                      対象SNSプラットフォーム
                    </label>
                    <select
                      id="platforms"
                      name="platforms"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none transition-colors"
                    >
                      <option value="">選択してください</option>
                      <option value="twitter">X（Twitter）のみ</option>
                      <option value="instagram">Instagramのみ</option>
                      <option value="facebook">Facebookのみ</option>
                      <option value="multi-platform">複数プラットフォーム</option>
                      <option value="all">全プラットフォーム統合</option>
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
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors resize-vertical"
                      placeholder="現在のSNS運用状況、自動化したい内容、期待する効果などをお聞かせください..."
                    />
                  </div>

                  <div className="text-center">
                    <button
                      type="submit"
                      className="px-10 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      無料相談を申し込む
                    </button>
                  </div>
                </form>
              </div>

              {/* 右側：SNS業界特化情報・実績 */}
              <div className="space-y-8">
                {/* 連絡先情報 */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white mb-8">連絡先情報</h3>
                  
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center mr-4 flex-shrink-0">
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
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center mr-4 flex-shrink-0">
                      <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">電話</h4>
                      <p className="text-gray-300">0120-407-638</p>
                      <p className="text-sm text-gray-400 mt-1">SNS専用ライン 平日 9:00-18:00</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center mr-4 flex-shrink-0">
                      <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">オンライン相談</h4>
                      <p className="text-gray-300">Zoom・Google Meet対応</p>
                      <p className="text-sm text-gray-400 mt-1">事前予約制・無料相談可能</p>
                    </div>
                  </div>
                </div>

                {/* SNS自動化サービス特徴 */}
                <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 p-8 rounded-xl">
                  <h3 className="text-xl font-bold text-white mb-6">SNS自動化サービス</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white flex items-center justify-center rounded-full mt-1">
                        <span className="text-xs font-bold">X</span>
                      </div>
                      <div className="ml-3">
                        <h4 className="font-semibold text-white">X（Twitter）自動化</h4>
                        <p className="text-gray-300 text-sm">フォロワー獲得・エンゲージメント最適化</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 bg-pink-600 text-white flex items-center justify-center rounded-full mt-1">
                        <span className="text-xs font-bold">IG</span>
                      </div>
                      <div className="ml-3">
                        <h4 className="font-semibold text-white">Instagram自動化</h4>
                        <p className="text-gray-300 text-sm">リーチ拡大・ストーリー自動投稿</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white flex items-center justify-center rounded-full mt-1">
                        <span className="text-xs font-bold">MP</span>
                      </div>
                      <div className="ml-3">
                        <h4 className="font-semibold text-white">マルチプラットフォーム</h4>
                        <p className="text-gray-300 text-sm">7+プラットフォーム統合管理</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 無料サービス */}
                <div className="p-6 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                  <h4 className="text-white font-semibold mb-3">無料サービス</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-3" />
                      現状のSNS運用分析
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-3" />
                      自動化戦略・要件定義
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-3" />
                      ROI試算・効果予測
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-3" />
                      デモンストレーション
                    </li>
                  </ul>
                </div>

                {/* Mike King理論特別対応 */}
                <div className="bg-gradient-to-r from-indigo-50/10 to-purple-50/10 border border-indigo-500/20 p-8 rounded-xl">
                  <h3 className="text-xl font-bold text-indigo-300 mb-4">
                    🎯 Mike King理論準拠 SNS特別対応
                  </h3>
                  <div className="space-y-3 text-purple-300">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 bg-indigo-500 text-white flex items-center justify-center rounded-full mt-1 mr-3">
                        <span className="text-xs font-bold">RE</span>
                      </div>
                      <p>レリバンスエンジニアリング（SNS業界特化）</p>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 bg-indigo-500 text-white flex items-center justify-center rounded-full mt-1 mr-3">
                        <span className="text-xs font-bold">GEO</span>
                      </div>
                      <p>GEO（SNS向け生成系検索最適化）</p>
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
            <h3 className="text-2xl font-bold mb-4">SNS自動化システム導入相談</h3>
            <p className="mb-4">JavaScript未対応環境でも、お電話・メールでご相談いただけます。</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="bg-gray-800 p-6 rounded border">
                <h4 className="font-semibold mb-2">お電話でのご相談</h4>
                <p className="text-purple-400 text-lg font-bold">0120-407-638</p>
                <p className="text-sm">SNS専用ライン 平日 9:00-18:00</p>
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
                {SNS_SERVICE_TYPES.map((service) => (
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