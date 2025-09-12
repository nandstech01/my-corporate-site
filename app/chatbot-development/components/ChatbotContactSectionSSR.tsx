import React from 'react';

/**
 * ChatbotContactSectionSSR.tsx
 * Mike King理論準拠: AI検索エンジン最適化
 * SSRでコンテンツ認識可能・フォーム機能100%維持
 */

// チャットボット開発相談項目
const CHATBOT_CONSULTATION_TYPES = [
  {
    id: "customer-support",
    title: "カスタマーサポート自動化",
    description: "24時間365日対応・業務効率化\nGPT-4統合による高精度応答",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" />
      </svg>
    ),
    value: "customer-support"
  },
  {
    id: "multilingual",
    title: "多言語対応チャットボット",
    description: "17言語対応・自動翻訳機能\n海外展開支援・グローバル対応",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z" clipRule="evenodd" />
      </svg>
    ),
    value: "multilingual"
  },
  {
    id: "integration",
    title: "システム統合チャットボット",
    description: "CRM・ERP連携・データベース統合\nAPI連携による業務自動化",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15.586 13H14a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    ),
    value: "integration"
  },
  {
    id: "custom",
    title: "カスタム開発・特別仕様",
    description: "完全オリジナル設計・高度な機能\n企業固有のニーズに対応",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
      </svg>
    ),
    value: "custom"
  }
];

export default function ChatbotContactSectionSSR() {
  return (
    <section id="consultation-section" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            チャットボット開発のご相談
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            GPT-4活用の高性能チャットボット開発について<br className="hidden md:block" />
            無料でご相談いただけます
          </p>
        </div>

        {/* 相談内容の例 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {CHATBOT_CONSULTATION_TYPES.map((type) => (
            <div key={type.id} className="text-center bg-white p-6 border border-gray-200 hover:shadow-lg transition-shadow">
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
          {/* フォーム */}
          <div className="bg-white border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              お問い合わせフォーム
            </h3>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    お名前 <span className="text-red-500">*</span>
                  </label>
                  <input type="text" id="name" name="name" required className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" placeholder="山田太郎" />
                </div>
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">会社名</label>
                  <input type="text" id="company" name="company" className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" placeholder="株式会社○○" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    メールアドレス <span className="text-red-500">*</span>
                  </label>
                  <input type="email" id="email" name="email" required className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" placeholder="example@company.com" />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">電話番号</label>
                  <input type="tel" id="phone" name="phone" className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" placeholder="03-1234-5678" />
                </div>
              </div>

              <div>
                <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
                  ご希望のサービス <span className="text-red-500">*</span>
                </label>
                <select id="service" name="service" required className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
                  <option value="">選択してください</option>
                  <option value="customer-support">カスタマーサポート自動化</option>
                  <option value="multilingual">多言語対応チャットボット</option>
                  <option value="integration">システム統合チャットボット</option>
                  <option value="custom">カスタム開発</option>
                  <option value="consultation">まずは相談したい</option>
                </select>
              </div>

              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">ご予算</label>
                <select id="budget" name="budget" className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
                  <option value="">選択してください</option>
                  <option value="under-50">50万円未満</option>
                  <option value="50-100">50万円〜100万円</option>
                  <option value="100-200">100万円〜200万円</option>
                  <option value="200-500">200万円〜500万円</option>
                  <option value="over-500">500万円以上</option>
                  <option value="consultation">要相談</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">お問い合わせ内容</label>
                <textarea id="message" name="message" rows={5} className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical transition-colors" placeholder="チャットボット開発についてお聞かせください..." />
              </div>

              <div className="text-center">
                <button type="submit" className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                  相談内容を送信
                </button>
              </div>
            </form>
          </div>

          {/* 右側：連絡先・特徴 */}
          <div className="space-y-8">
            {/* 直接連絡 */}
            <div className="bg-white border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">お急ぎの場合</h3>
              <div className="space-y-4">
                <a href="tel:+81-120-558-551" className="flex items-center text-blue-600 hover:text-blue-800">
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  0120-407-638
                </a>
                <a href="mailto:contact@nands.tech" className="flex items-center text-green-600 hover:text-green-800">
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  contact@nands.tech
                </a>
              </div>
            </div>

            {/* サービス特徴 */}
            <div className="bg-blue-50 border border-blue-200 p-8">
              <h3 className="text-xl font-bold text-blue-900 mb-4">チャットボット開発サービス</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white flex items-center justify-center rounded-full mt-1">
                    <span className="text-xs font-bold">CS</span>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold text-blue-900">カスタマーサポート自動化</h4>
                    <p className="text-blue-800 text-sm">24時間365日対応の高精度応答システム</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white flex items-center justify-center rounded-full mt-1">
                    <span className="text-xs font-bold">ML</span>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold text-blue-900">多言語対応</h4>
                    <p className="text-blue-800 text-sm">17言語対応・自動翻訳機能統合</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white flex items-center justify-center rounded-full mt-1">
                    <span className="text-xs font-bold">SI</span>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold text-blue-900">システム統合</h4>
                    <p className="text-blue-800 text-sm">CRM・ERP連携・データベース統合</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 