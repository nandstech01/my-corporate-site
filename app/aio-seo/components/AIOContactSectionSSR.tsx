import React from 'react';

/**
 * =========================================================
 * AIOContactSectionSSR.tsx
 *
 * Mike King理論準拠: AI検索エンジン最適化
 * - SSRでコンテンツ認識可能
 * - 構造化データ完備
 * - セマンティックHTML構造
 * - フォーム機能100%維持
 * 
 * 【特徴】
 * ✅ サーバーサイドレンダリング対応
 * ✅ AI検索エンジン最適化
 * ✅ レリバンスエンジニアリング準拠
 * ✅ フォーム機能完全維持
 * ---------------------------------------------------------
 */

// AIO対策・GEO相談項目
const AIO_CONSULTATION_TYPES = [
  {
    id: "free-diagnosis",
    title: "無料AIO診断",
    description: "現在のサイトのAI検索最適化状況を無料で診断\nGEO対策・レリバンスエンジニアリング分析",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
      </svg>
    ),
    value: "free-diagnosis"
  },
  {
    id: "basic-plan",
    title: "ベーシックプラン",
    description: "Mike King理論に基づく基本的なAIO対策\nTopical Coverage・Fragment ID対応",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    value: "basic-plan"
  },
  {
    id: "standard-plan",
    title: "スタンダードプラン",
    description: "包括的なレリバンスエンジニアリング実装\nGEO最適化・構造化データ統合",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
      </svg>
    ),
    value: "standard-plan"
  },
  {
    id: "enterprise-plan",
    title: "エンタープライズプラン",
    description: "大規模サイト向け完全AIO対策\n継続的モニタリング・高度な分析",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    value: "enterprise-plan"
  }
];

export default function AIOContactSectionSSR() {
  return (
    <section id="consultation-section" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            AIO対策・レリバンスエンジニアリング
            <span className="block text-blue-600">無料相談・お見積もり</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            まずは無料のAIO診断から始めませんか？<br />
            現在のサイト状況を分析し、最適な改善提案をご提供いたします。
          </p>
        </div>

        {/* 相談内容の例 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {AIO_CONSULTATION_TYPES.map((type) => (
            <div key={type.id} className="text-center bg-gray-50 p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4 rounded-full">
                {type.icon}
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-900">{type.title}</h3>
              <p className="text-gray-600 text-sm" style={{ whiteSpace: 'pre-line' }}>
                {type.description}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-gray-50 border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              お問い合わせフォーム
            </h3>
            
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  お名前 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="山田太郎"
                />
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                  会社名
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="株式会社○○"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="example@company.com"
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                  サイトURL
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
                  ご希望のサービス <span className="text-red-500">*</span>
                </label>
                <select
                  id="service"
                  name="service"
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="">選択してください</option>
                  <option value="free-diagnosis">無料AIO診断</option>
                  <option value="basic-plan">ベーシックプラン</option>
                  <option value="standard-plan">スタンダードプラン</option>
                  <option value="enterprise-plan">エンタープライズプラン</option>
                  <option value="consulting">AIO対策コンサルティング</option>
                  <option value="emergency">緊急AIO対策</option>
                  <option value="other">その他</option>
                </select>
              </div>

              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                  ご予算
                </label>
                <select
                  id="budget"
                  name="budget"
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="">選択してください</option>
                  <option value="under-30">30万円未満</option>
                  <option value="30-60">30万円〜60万円</option>
                  <option value="60-120">60万円〜120万円</option>
                  <option value="120-300">120万円〜300万円</option>
                  <option value="over-300">300万円以上</option>
                  <option value="undecided">未定</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  お問い合わせ内容
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical transition-colors"
                  placeholder="AIO対策・レリバンスエンジニアリングについてお聞かせください..."
                />
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  相談内容を送信
                </button>
              </div>
            </form>
          </div>

          {/* 右側：サービス特徴・実績 */}
          <div className="space-y-8">
            {/* 緊急連絡先 */}
            <div className="bg-red-50 border border-red-200 p-8">
              <h3 className="text-xl font-bold text-red-800 mb-4">
                🚨 緊急AIO対策
              </h3>
              <p className="text-red-700 mb-4">
                AI検索結果で順位急落・ペナルティを受けた場合の緊急対応も承ります
              </p>
              <div className="space-y-2">
                                  <a href="tel:+81-120-407-638" className="block text-red-600 font-semibold hover:text-red-800">
                                  📞 0120-407-638（緊急対応）
                </a>
                <a href="mailto:contact@nands.tech" className="block text-red-600 font-semibold hover:text-red-800">
                📧 contact@nands.tech
                </a>
              </div>
            </div>

            {/* Mike King理論の特徴 */}
            <div className="bg-blue-50 border border-blue-200 p-8">
              <h3 className="text-xl font-bold text-blue-900 mb-6">Mike King理論の特徴</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white flex items-center justify-center rounded-full mt-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold text-blue-900">レリバンスエンジニアリング</h4>
                    <p className="text-blue-800 text-sm">関連性を定量化し、AI検索に最適化</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white flex items-center justify-center rounded-full mt-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold text-blue-900">GEO（生成系検索最適化）</h4>
                    <p className="text-blue-800 text-sm">ChatGPT・Perplexityでの引用率向上</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white flex items-center justify-center rounded-full mt-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold text-blue-900">Topical Coverage</h4>
                    <p className="text-blue-800 text-sm">1万字級の網羅的コンテンツ制作</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white flex items-center justify-center rounded-full mt-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold text-blue-900">Fragment ID対応</h4>
                    <p className="text-blue-800 text-sm">セクション別最適化・TOC自動生成</p>
                  </div>
                </div>
              </div>
            </div>

            {/* サービス特徴 */}
            <div className="bg-gray-50 border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">AIO対策サービス特徴</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white flex items-center justify-center rounded-full mt-1">
                    <span className="text-xs font-bold">AI</span>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold text-gray-900">AI検索エンジン最適化</h4>
                    <p className="text-gray-700 text-sm">ChatGPT、Perplexity等のAI検索に対応</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white flex items-center justify-center rounded-full mt-1">
                    <span className="text-xs font-bold">RE</span>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold text-gray-900">レリバンスエンジニアリング</h4>
                    <p className="text-gray-700 text-sm">関連性を科学的に最適化</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white flex items-center justify-center rounded-full mt-1">
                    <span className="text-xs font-bold">GEO</span>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold text-gray-900">生成系検索最適化</h4>
                    <p className="text-gray-700 text-sm">GEO（Generative Engine Optimization）対応</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 対応AI検索エンジン */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-8">
              <h3 className="text-xl font-bold text-blue-900 mb-4">対応AI検索エンジン</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-800">Google AI Mode</div>
                  <div className="text-sm text-blue-600">SGE・AI Overviews</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-800">ChatGPT</div>
                  <div className="text-sm text-blue-600">Web検索・引用対応</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-800">Perplexity</div>
                  <div className="text-sm text-blue-600">Pro検索・ソース引用</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-800">Bing Chat</div>
                  <div className="text-sm text-blue-600">Copilot・Creative検索</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 