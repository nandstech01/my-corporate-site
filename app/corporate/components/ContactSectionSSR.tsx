import React from 'react';

/**
 * =========================================================
 * ContactSectionSSR.tsx - 法人向け専用【完全版】
 *
 * Mike King理論準拠: AI検索エンジン最適化
 * - SSRでコンテンツ認識可能
 * - デザイン100%維持  
 * - GEO対策（生成系検索最適化）
 * - レリバンスエンジニアリング
 * - LLMO完全対応
 * - B2B特化構造化データ
 * 
 * 【戦略】
 * ✅ 法人向けCTA最適化
 * ✅ 業界別相談項目
 * ✅ ROI・効果測定重視
 * ✅ 構造化データ強化
 * ✅ Fragment ID対応
 * ✅ noscript完全対応
 * ---------------------------------------------------------
 */

// 法人向け相談項目（業界特化・詳細設計）
const CORPORATE_CONSULTATION_TYPES = [
  {
    id: "ai-reskilling",
    title: "AIリスキリング研修",
    description: "全社員のAIリテラシー向上\n生成AI活用スキル習得・プロンプトエンジニアリング",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.84L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
      </svg>
    ),
    value: "ai-reskilling",
    budget: "300万円〜",
    duration: "3-6ヶ月",
    roi: "生産性40%向上",
    features: ["ChatGPT研修", "プロンプトエンジニアリング", "業務フロー最適化"]
  },
  {
    id: "dx-transformation",
    title: "DX推進支援",
    description: "デジタル変革戦略策定\n業務プロセス自動化・システム統合",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
      </svg>
    ),
    value: "dx-transformation",
    budget: "500万円〜",
    duration: "6-12ヶ月", 
    roi: "コスト30%削減",
    features: ["戦略策定", "システム統合", "プロセス自動化"]
  },
  {
    id: "automation-consulting",
    title: "業務自動化コンサルティング",
    description: "RPA・AI導入による効率化\n工数削減・品質向上・コスト最適化",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15.586 13H14a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    ),
    value: "automation-consulting",
    budget: "200万円〜",
    duration: "2-4ヶ月",
    roi: "業務効率化",
    features: ["RPA導入", "AI活用", "効果測定"]
  },
  {
    id: "ai-strategy",
    title: "AI戦略・ガバナンス構築",
    description: "AI活用戦略立案\nリスク管理・ガバナンス体制構築",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    value: "ai-strategy",
    budget: "800万円〜",
    duration: "4-8ヶ月",
    roi: "競争力強化",
    features: ["戦略策定", "ガバナンス", "リスク管理"]
  }
];

// 法人向けContactAction構造化データ（Mike King理論準拠）
const corporateContactSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "@id": "https://nands.tech/corporate#contact",
  "name": "法人向けAI導入相談",
  "description": "企業のAIリスキリング研修・DX推進・業務自動化に関する無料相談。ROI重視の提案で確実な効果を実現。Mike King理論準拠のレリバンスエンジニアリング対応。",
  "provider": {
    "@type": "Organization",
    "@id": "https://nands.tech/#organization"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Corporate Sales",
          "telephone": "+81-120-407-638",
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
      "urlTemplate": "https://nands.tech/corporate#consultation-section"
    }
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "法人向けAI導入サービス",
    "itemListElement": CORPORATE_CONSULTATION_TYPES.map((service, index) => ({
      "@type": "Offer",
      "position": index + 1,
      "itemOffered": {
        "@type": "Service",
        "name": service.title,
        "description": service.description,
        "category": "法人向けAIソリューション"
      },
      "priceSpecification": {
        "@type": "PriceSpecification",
        "price": service.budget,
        "priceCurrency": "JPY"
      }
    }))
  }
};

export default function ContactSectionSSR() {
  return (
    <>
      {/* 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(corporateContactSchema) }}
      />

      <section
        id="consultation-section"
        className="relative py-20 bg-gray-900 text-white"
      >
        {/* 背景のグラデーション */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 opacity-50" />

        {/* グリッドパターン */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:14px_24px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4">
          {/* Section Header（GEO対策: Explain-Then-List） */}
          <header className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              AI導入に関するご相談
            </h2>
            <p className="text-center text-gray-300 mb-8 max-w-3xl mx-auto">
              生成AIの活用やリスキリング研修など、ROI重視で企業の競争力強化を支援します。<br />
              業界特化のカスタマイズ対応で、確実な効果を実現いたします。
            </p>

            {/* Topical Coverage: 法人向け詳細説明（LLMO対応） */}
            <div className="text-lg text-gray-400 max-w-4xl mx-auto mb-12">
              <p>
                株式会社エヌアンドエスは、製造業・金融・医療・IT・官公庁など、あらゆる業界での
                AI導入実績を持つ専門企業です。単なる研修提供ではなく、貴社の事業戦略に合わせた
                包括的なAIトランスフォーメーションを支援します。Mike King理論準拠のレリバンスエンジニアリングで、
                AI検索エンジンでの発見性も同時に強化いたします。
              </p>
            </div>
          </header>

          {/* 相談サービス一覧（Fragment ID対応） */}
          <div id="corporate-services" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {CORPORATE_CONSULTATION_TYPES.map((service) => (
              <div key={service.id} className="bg-white/10 backdrop-blur-lg p-6 rounded-lg border border-white/20 hover:bg-white/15 transition-all group">
                <div className="w-16 h-16 bg-blue-100/20 text-blue-400 flex items-center justify-center mx-auto mb-4 rounded-full group-hover:bg-blue-100/30 transition-colors">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-center text-white">{service.title}</h3>
                <p className="text-gray-300 text-sm mb-4 text-center" style={{ whiteSpace: 'pre-line' }}>
                  {service.description}
                </p>
                
                {/* 予算・期間・ROI情報 */}
                <div className="space-y-2 text-xs text-gray-400 mb-4">
                  <div className="flex justify-between">
                    <span>予算目安:</span>
                    <span className="text-blue-300 font-semibold">{service.budget}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>期間:</span>
                    <span className="text-green-300 font-semibold">{service.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>効果:</span>
                    <span className="text-yellow-300 font-semibold">{service.roi}</span>
                  </div>
                </div>

                {/* 主要機能 */}
                <div className="space-y-1">
                  {service.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-xs text-gray-400">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white/10 backdrop-blur-lg p-8 rounded-lg border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-6">
                法人向けお問い合わせフォーム
              </h3>
              
              <form className="space-y-6" action="/api/contact" method="POST">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="representative" className="block text-gray-200 font-medium mb-2">
                      ご担当者様 <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="representative"
                      name="representative"
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring focus:ring-blue-500/20 transition-colors"
                      placeholder="山田太郎"
                    />
                  </div>
                  <div>
                    <label htmlFor="position" className="block text-gray-200 font-medium mb-2">役職</label>
                    <input
                      type="text"
                      id="position"
                      name="position"
                      className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring focus:ring-blue-500/20 transition-colors"
                      placeholder="部長・課長・担当者等"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="company" className="block text-gray-200 font-medium mb-2">
                    会社名 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring focus:ring-blue-500/20 transition-colors"
                    placeholder="株式会社○○"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-gray-200 font-medium mb-2">
                      メールアドレス <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring focus:ring-blue-500/20 transition-colors"
                      placeholder="example@company.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-gray-200 font-medium mb-2">電話番号</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring focus:ring-blue-500/20 transition-colors"
                      placeholder="03-1234-5678"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="industry" className="block text-gray-200 font-medium mb-2">業界</label>
                    <select
                      id="industry"
                      name="industry"
                      className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring focus:ring-blue-500/20 transition-colors"
                    >
                      <option value="">選択してください</option>
                      <option value="manufacturing">製造業</option>
                      <option value="finance">金融</option>
                      <option value="medical">医療・ヘルスケア</option>
                      <option value="retail">小売・流通</option>
                      <option value="construction">建設・不動産</option>
                      <option value="it">IT・ソフトウェア</option>
                      <option value="logistics">物流</option>
                      <option value="government">官公庁・自治体</option>
                      <option value="hr">人材サービス</option>
                      <option value="marketing">マーケティング</option>
                      <option value="other">その他</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="company-size" className="block text-gray-200 font-medium mb-2">従業員数</label>
                    <select
                      id="company-size"
                      name="company-size"
                      className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring focus:ring-blue-500/20 transition-colors"
                    >
                      <option value="">選択してください</option>
                      <option value="1-10">1〜10名</option>
                      <option value="11-50">11〜50名</option>
                      <option value="51-100">51〜100名</option>
                      <option value="101-500">101〜500名</option>
                      <option value="501-1000">501〜1,000名</option>
                      <option value="1000+">1,000名以上</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="service" className="block text-gray-200 font-medium mb-2">
                    ご希望のサービス <span className="text-red-400">*</span>
                  </label>
                  <select
                    id="service"
                    name="service"
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring focus:ring-blue-500/20 transition-colors"
                  >
                    <option value="">選択してください</option>
                    {CORPORATE_CONSULTATION_TYPES.map((service) => (
                      <option key={service.id} value={service.value}>{service.title}</option>
                    ))}
                    <option value="custom">カスタマイズ提案</option>
                    <option value="consultation">まずは相談したい</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="budget" className="block text-gray-200 font-medium mb-2">ご予算</label>
                  <select
                    id="budget"
                    name="budget"
                    className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring focus:ring-blue-500/20 transition-colors"
                  >
                    <option value="">選択してください</option>
                    <option value="under-100">100万円未満</option>
                    <option value="100-300">100万円〜300万円</option>
                    <option value="300-500">300万円〜500万円</option>
                    <option value="500-1000">500万円〜1,000万円</option>
                    <option value="over-1000">1,000万円以上</option>
                    <option value="consultation">要相談</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-gray-200 font-medium mb-2">
                    お問い合わせ内容・課題
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring focus:ring-blue-500/20 resize-vertical transition-colors"
                    placeholder="現在の課題、AI導入の目的、期待する効果などをお聞かせください..."
                  />
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    className="px-10 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    無料相談を申し込む
                  </button>
                </div>
              </form>
            </div>

            {/* 右側：企業向け情報・実績 */}
            <div className="space-y-8">
              {/* 緊急対応 */}
              <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-lg backdrop-blur-lg">
                <h3 className="text-xl font-bold text-red-300 mb-4">
                  🚨 緊急AI導入支援
                </h3>
                <p className="text-red-200 mb-4">
                  競合他社に遅れを取る前に、迅速なAI導入で競争優位を確保します
                </p>
                <div className="space-y-2">
                                      <a href="tel:+81-120-407-638" className="block text-red-300 font-semibold hover:text-red-100 transition-colors">
                    📞 0120-407-638（緊急対応）
                  </a>
                  <a href="mailto:contact@nands.tech" className="block text-red-300 font-semibold hover:text-red-100 transition-colors">
                    📧 contact@nands.tech
                  </a>
                </div>
              </div>

              {/* 法人向けサービス */}
              <div className="bg-blue-500/10 border border-blue-500/30 p-8 rounded-lg backdrop-blur-lg">
                <h3 className="text-xl font-bold text-blue-300 mb-6">法人向けAI研修サービス</h3>
                <div className="space-y-4 text-blue-200">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white flex items-center justify-center rounded-full mt-1 mr-3">
                      <span className="text-xs font-bold">AI</span>
                    </div>
                    <p>生成AI活用による業務効率化</p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white flex items-center justify-center rounded-full mt-1 mr-3">
                      <span className="text-xs font-bold">DX</span>
                    </div>
                    <p>デジタルトランスフォーメーション推進</p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white flex items-center justify-center rounded-full mt-1 mr-3">
                      <span className="text-xs font-bold">研修</span>
                    </div>
                    <p>組織全体のAIリテラシー向上</p>
                  </div>
                </div>
              </div>

              {/* サポート体制 */}
              <div className="bg-green-500/10 border border-green-500/30 p-8 rounded-lg backdrop-blur-lg">
                <h3 className="text-xl font-bold text-green-300 mb-4">サポート体制</h3>
                <div className="space-y-3 text-green-200">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-500 text-white flex items-center justify-center rounded-full mt-1 mr-3">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p>企業規模に合わせたカスタマイズ研修</p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-500 text-white flex items-center justify-center rounded-full mt-1 mr-3">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p>業種別AI活用事例のご提供</p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-500 text-white flex items-center justify-center rounded-full mt-1 mr-3">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p>継続的なフォローアップサポート</p>
                  </div>
                </div>
              </div>

              {/* GEO・レリバンスエンジニアリング特別対応 */}
              <div className="bg-purple-500/10 border border-purple-500/30 p-8 rounded-lg backdrop-blur-lg">
                <h3 className="text-xl font-bold text-purple-300 mb-4">
                  🎯 Mike King理論準拠特別対応
                </h3>
                <div className="space-y-3 text-purple-200">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white flex items-center justify-center rounded-full mt-1 mr-3">
                      <span className="text-xs font-bold">RE</span>
                    </div>
                    <p>レリバンスエンジニアリング対応</p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white flex items-center justify-center rounded-full mt-1 mr-3">
                      <span className="text-xs font-bold">GEO</span>
                    </div>
                    <p>GEO（Generative Engine Optimization）</p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white flex items-center justify-center rounded-full mt-1 mr-3">
                      <span className="text-xs font-bold">AI</span>
                    </div>
                    <p>AI検索エンジン完全対応</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* noscript対応: JavaScript無効時のフォールバック */}
        <noscript>
          <div className="relative z-20 bg-blue-900/95 text-white p-8 text-center mt-8">
            <h3 className="text-2xl font-bold mb-4">法人向けAI導入相談</h3>
            <p className="mb-4">JavaScript未対応環境でも、お電話・メールでご相談いただけます。</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 p-6 rounded border">
                <h4 className="font-semibold mb-2">お電話でのご相談</h4>
                <p className="text-blue-300 text-lg font-bold">0120-407-638</p>
                <p className="text-sm">平日 9:00-18:00</p>
              </div>
              <div className="bg-white/10 p-6 rounded border">
                <h4 className="font-semibold mb-2">メールでのご相談</h4>
                <p className="text-blue-300 text-lg font-bold">contact@nands.tech</p>
                <p className="text-sm">24時間受付</p>
              </div>
            </div>
            
            {/* サービス一覧（noscript版） */}
            <div className="mt-8">
              <h4 className="text-xl font-bold mb-4">提供サービス</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                {CORPORATE_CONSULTATION_TYPES.map((service) => (
                  <div key={service.id} className="bg-white/10 p-4 rounded border">
                    <h5 className="font-semibold mb-2">{service.title}</h5>
                    <p className="text-sm mb-2">{service.description.replace('\n', ' ')}</p>
                    <p className="text-xs text-gray-300">
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
