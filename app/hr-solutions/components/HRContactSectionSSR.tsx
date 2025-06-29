import React from 'react';

/**
 * =========================================================
 * HRContactSectionSSR.tsx - HR Solutions専用【完全版】
 *
 * Mike King理論準拠: AI検索エンジン最適化
 * - SSRでコンテンツ認識可能
 * - 人材業界特化設計
 * - GEO対策（生成系検索最適化）
 * - レリバンスエンジニアリング
 * - LLMO完全対応
 * - B2B特化構造化データ
 * 
 * 【戦略】
 * ✅ 人材業界特化CTA
 * ✅ HR業界専門用語最適化
 * ✅ ROI・効果測定重視
 * ✅ 構造化データ強化
 * ✅ Fragment ID対応
 * ✅ noscript完全対応
 * ---------------------------------------------------------
 */

// 人材業界向けサービス項目（詳細設計）
const HR_SERVICE_TYPES = [
  {
    id: "job-site-construction",
    title: "求人サイト構築",
    description: "高機能求人サイトの完全構築\nレスポンシブ対応・SEO最適化",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 114 0 2 2 0 01-4 0zm8-1a1 1 0 100 2h2a1 1 0 100-2h-2z" clipRule="evenodd" />
      </svg>
    ),
    value: "job-site-construction",
    budget: "200万円〜",
    duration: "2-3ヶ月",
    roi: "求人効果向上",
    features: ["モバイル最適化", "検索機能充実", "管理システム"]
  },
  {
    id: "ai-matching-engine",
    title: "AIマッチングエンジン",
    description: "機械学習による高精度マッチング\nスキル分析・文化適合性判定",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
      </svg>
    ),
    value: "ai-matching-engine",
    budget: "500万円〜",
    duration: "4-6ヶ月",
    roi: "高精度マッチング",
    features: ["AI分析", "自動レコメンド", "適合性判定"]
  },
  {
    id: "document-automation",
    title: "書類自動生成システム",
    description: "履歴書・職務経歴書の自動作成\nテンプレート管理・一括出力",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
      </svg>
    ),
    value: "document-automation",
    budget: "150万円〜",
    duration: "1-2ヶ月",
    roi: "業務効率化",
    features: ["自動フォーマット", "データ連携", "一括処理"]
  },
  {
    id: "comprehensive-hr",
    title: "包括的HRソリューション",
    description: "人材業界向け統合システム\n求人から書類作成まで一元管理",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
      </svg>
    ),
    value: "comprehensive-hr",
    budget: "800万円〜",
    duration: "6-12ヶ月",
    roi: "全工程最適化",
    features: ["統合管理", "ワークフロー", "レポート機能"]
  }
];

// HR Solutions ContactAction構造化データ（Mike King理論準拠）
const hrContactSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "@id": "https://nands.tech/hr-solutions#contact",
  "name": "HR Solutions導入相談",
  "description": "求人サイト構築、AIマッチングエンジン、書類自動生成システム等の人材ソリューション開発に関する無料相談。高精度マッチング、業務効率化対応。",
  "provider": {
    "@type": "Organization",
    "@id": "https://nands.tech/#organization"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "HR Solutions Sales",
    "telephone": "+81-120-558-551",
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
      "urlTemplate": "https://nands.tech/hr-solutions#contact"
    }
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "HR Solutions サービス",
    "itemListElement": HR_SERVICE_TYPES.map((service, index) => ({
      "@type": "Offer",
      "position": index + 1,
      "itemOffered": {
        "@type": "Service",
        "name": service.title,
        "description": service.description,
        "category": "HR Solutions"
      },
      "priceSpecification": {
        "@type": "PriceSpecification",
        "price": service.budget,
        "priceCurrency": "JPY"
      }
    }))
  }
};

export default function HRContactSectionSSR() {
  return (
    <>
      {/* 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hrContactSchema) }}
      />

      <section
        id="contact"
        className="relative py-20 md:py-32"
      >
        {/* 背景エフェクト（HR特化デザイン） */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-cyan-900/30 to-gray-900/20" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Section Header（GEO対策: Explain-Then-List） */}
            <header className="text-center mb-16">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6">
                HR Solutions 導入相談
              </h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
                人材ソリューションの導入について、お気軽にご相談ください。
                <br className="hidden md:block" />
                無料相談・デモンストレーションも承っております。
              </p>

              {/* Topical Coverage: 人材業界特化説明（LLMO対応） */}
              <div className="text-lg text-gray-400 max-w-4xl mx-auto mb-12">
                <p>
                  株式会社エヌアンドエスは、リクルート、マイナビ、エン・ジャパンなど
                  大手人材企業との連携により、求人サイト構築からAIマッチング、
                  書類自動生成まで、人材業界のDXを包括的にサポート。
                  確実な業務効率化とROI向上をお約束いたします。
                </p>
              </div>
            </header>

            {/* HRサービス一覧（Fragment ID対応） */}
            <div id="hr-services" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {HR_SERVICE_TYPES.map((service) => (
                <div key={service.id} className="bg-gray-800/50 border border-gray-700/50 p-6 rounded-2xl hover:bg-gray-800/70 transition-all group backdrop-blur-sm">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-4 rounded-xl group-hover:scale-110 transition-transform">
                    <div className="text-blue-400">
                      {service.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-3 text-center text-white">{service.title}</h3>
                  <p className="text-gray-300 text-sm mb-4 text-center" style={{ whiteSpace: 'pre-line' }}>
                    {service.description}
                  </p>
                  
                  {/* 予算・期間・ROI情報 */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">予算:</span>
                      <span className="text-blue-300 font-semibold">{service.budget}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">期間:</span>
                      <span className="text-cyan-300 font-semibold">{service.duration}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">効果:</span>
                      <span className="text-green-300 font-semibold">{service.roi}</span>
                    </div>
                  </div>
                  
                  {/* 主要機能 */}
                  <div className="mt-4 pt-4 border-t border-gray-600/50">
                    <div className="flex flex-wrap gap-1">
                      {service.features.map((feature, idx) => (
                        <span key={idx} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* メインコンテンツ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* 左側: お問い合わせフォーム（GEO強化） */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-8 rounded-2xl">
                <h3 className="text-2xl font-bold text-white mb-6">お問い合わせフォーム</h3>
                <p className="text-gray-300 mb-6">
                  人材ソリューションに関するご質問・ご相談は、下記フォームからお気軽にお問い合わせください。
                  専門スタッフが迅速に対応いたします。
                </p>
                
                <form className="space-y-6" action="/api/contact" method="POST">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">
                        会社名 <span className="text-red-400">*</span>
                      </label>
                      <input 
                        type="text" 
                        id="company" 
                        name="company" 
                        required 
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                        placeholder="株式会社〇〇"
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
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                        placeholder="山田太郎"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                        メールアドレス <span className="text-red-400">*</span>
                      </label>
                      <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        required 
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
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
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                        placeholder="03-1234-5678"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="service" className="block text-sm font-medium text-gray-300 mb-2">
                        サービス選択
                      </label>
                      <select 
                        id="service" 
                        name="service" 
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                      >
                        <option value="">選択してください</option>
                        {HR_SERVICE_TYPES.map((service) => (
                          <option key={service.id} value={service.value}>
                            {service.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="budget" className="block text-sm font-medium text-gray-300 mb-2">
                        予算
                      </label>
                      <select 
                        id="budget" 
                        name="budget" 
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                      >
                        <option value="">選択してください</option>
                        <option value="100-300">100万円〜300万円</option>
                        <option value="300-500">300万円〜500万円</option>
                        <option value="500-1000">500万円〜1000万円</option>
                        <option value="1000+">1000万円以上</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="employees" className="block text-sm font-medium text-gray-300 mb-2">
                      従業員数
                    </label>
                    <select 
                      id="employees" 
                      name="employees" 
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    >
                      <option value="">選択してください</option>
                      <option value="1-10">1-10名</option>
                      <option value="11-50">11-50名</option>
                      <option value="51-100">51-100名</option>
                      <option value="101-500">101-500名</option>
                      <option value="500+">500名以上</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                      お問い合わせ内容 <span className="text-red-400">*</span>
                    </label>
                    <textarea 
                      id="message" 
                      name="message" 
                      rows={6} 
                      required 
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 resize-vertical"
                      placeholder="具体的なご要望、現在の課題、導入時期などをお聞かせください。"
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    無料相談を申し込む
                  </button>
                </form>
              </div>
              
              {/* 右側: 情報パネル（Mike King理論強化） */}
              <div className="space-y-8">
                {/* 連絡先情報 */}
                <div className="bg-blue-900/50 backdrop-blur-sm border border-blue-700/50 p-8 rounded-2xl">
                  <h3 className="text-xl font-bold text-blue-100 mb-6">連絡先情報</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-blue-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      <div>
                        <p className="text-blue-100 font-medium">メール</p>
                        <a href="mailto:contact@nands.tech" className="text-blue-300 hover:text-blue-200 transition-colors">
                          contact@nands.tech
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-blue-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      <div>
                        <p className="text-blue-100 font-medium">HR業界緊急対応サポート</p>
                        <a href="tel:+81-120-558-551" className="text-blue-300 hover:text-blue-200 transition-colors">
                          0120-558-551
                        </a>
                        <p className="text-blue-400 text-sm">専用ライン（平日9-18時）</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-blue-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.562-1.562C17.759 8.071 18 9.007 18 10zm-9.77 4.78a4 4 0 01-1.23-8.56l-1.562-1.562a8.02 8.02 0 00-1.225 6.006l1.562 1.562L8.23 14.78zm8.48-3.52a6.003 6.003 0 01-8.02 8.02l1.562-1.562a4 4 0 008.02-8.02l-1.562 1.562z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-blue-100 font-medium">オンライン相談</p>
                        <p className="text-blue-300">Teams/Zoom対応</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* HR業界導入実績 */}
                <div className="bg-cyan-900/50 backdrop-blur-sm border border-cyan-700/50 p-8 rounded-2xl">
                  <h3 className="text-xl font-bold text-cyan-100 mb-6">HR業界導入実績</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-cyan-300">150+</div>
                      <div className="text-cyan-400 text-sm">導入企業</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-cyan-300">高精度</div>
                      <div className="text-cyan-400 text-sm">マッチング</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-cyan-300">業務効率化</div>
                      <div className="text-cyan-400 text-sm">最適化</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-cyan-300">4ヶ月</div>
                      <div className="text-cyan-400 text-sm">ROI実現</div>
                    </div>
                  </div>
                </div>

                {/* 主要導入業界 */}
                <div className="bg-green-900/50 backdrop-blur-sm border border-green-700/50 p-8 rounded-2xl">
                  <h3 className="text-xl font-bold text-green-100 mb-6">主要導入業界</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                      <span className="text-green-200">人材紹介・派遣業</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                      <span className="text-green-200">転職エージェント</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                      <span className="text-green-200">企業人事部門</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                      <span className="text-green-200">アウトソーシング企業</span>
                    </div>
                  </div>
                </div>

                {/* 無料サービス */}
                <div className="bg-purple-900/50 backdrop-blur-sm border border-purple-700/50 p-8 rounded-2xl">
                  <h3 className="text-xl font-bold text-purple-100 mb-6">無料サービス</h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <svg className="w-4 h-4 text-purple-400 mr-3 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-purple-200 text-sm">現状のHR運用分析・課題抽出</span>
                    </div>
                    <div className="flex items-start">
                      <svg className="w-4 h-4 text-purple-400 mr-3 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-purple-200 text-sm">AI化戦略・要件定義</span>
                    </div>
                    <div className="flex items-start">
                      <svg className="w-4 h-4 text-purple-400 mr-3 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-purple-200 text-sm">ROI試算・効果予測</span>
                    </div>
                    <div className="flex items-start">
                      <svg className="w-4 h-4 text-purple-400 mr-3 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-purple-200 text-sm">デモンストレーション</span>
                    </div>
                  </div>
                </div>

                {/* Mike King理論特別対応 */}
                <div className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 backdrop-blur-sm border border-blue-700/50 p-8 rounded-2xl">
                  <h3 className="text-xl font-bold text-white mb-4">Mike King理論特別対応</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                      <span className="text-blue-200 text-sm">レリバンスエンジニアリング（RE）</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                      <span className="text-cyan-200 text-sm">生成エンジン最適化（GEO）</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                      <span className="text-purple-200 text-sm">AI検索エンジン完全対応</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* noscript対応 */}
        <noscript>
          <div className="bg-yellow-50 border border-yellow-200 p-4 m-4 rounded-lg">
            <h3 className="text-yellow-800 font-bold mb-2">JavaScript無効時のお問い合わせ</h3>
            <p className="text-yellow-700 mb-4">
              JavaScriptが無効になっている場合は、以下の方法でお問い合わせください：
            </p>
            <ul className="text-yellow-700 space-y-2">
              <li>• 電話: <a href="tel:+81-120-558-551" className="font-semibold">0120-558-551</a></li>
              <li>• メール: <a href="mailto:contact@nands.tech" className="font-semibold">contact@nands.tech</a></li>
              <li>• 営業時間: 平日 9:00-18:00</li>
            </ul>
          </div>
        </noscript>
      </section>
    </>
  );
}
