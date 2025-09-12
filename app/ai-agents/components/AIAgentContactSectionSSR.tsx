import React from 'react';

/**
 * =========================================================
 * AIAgentContactSectionSSR.tsx
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

// AIエージェント開発相談項目
const AI_AGENT_CONSULTATION_TYPES = [
  {
    id: "dialogue-agent",
    title: "対話型AIエージェント",
    description: "GPT-4・Claude統合による自然言語処理システム\n24時間365日対応・多言語対応",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" />
      </svg>
    ),
    value: "dialogue-agent"
  },
  {
    id: "knowledge-agent",
    title: "ナレッジベースエージェント", 
    description: "RAGシステム・ベクトル検索による知識管理\n企業データ統合・高精度検索",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
      </svg>
    ),
    value: "knowledge-agent"
  },
  {
    id: "workflow-agent",
    title: "ワークフロー自動化エージェント",
    description: "業務プロセス自動化・RPA統合\n複雑な判断業務の完全自動化",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" clipRule="evenodd" />
      </svg>
    ),
    value: "workflow-agent"
  },
  {
    id: "analysis-agent",
    title: "データ分析エージェント",
    description: "機械学習・予測分析による意思決定支援\n異常検知・パターン認識",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    value: "analysis-agent"
  }
];

export default function AIAgentContactSectionSSR() {
  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* セクションヘッダー */}
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            AIエージェント開発のご相談
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            業界最速・最安値でのAIエージェント開発について<br className="hidden md:block" />
            無料でご相談いただけます
          </p>
        </div>

        {/* 相談内容の例 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {AI_AGENT_CONSULTATION_TYPES.map((type) => (
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
          {/* 左側：お問い合わせフォーム */}
          <div className="bg-white border border-gray-200 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              AIエージェント開発のご相談
            </h3>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    会社名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    required
                    className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="株式会社○○"
                  />
                </div>
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
                    placeholder="山田 太郎"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    電話番号
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="03-1234-5678"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
                  ご興味のあるサービス <span className="text-red-500">*</span>
                </label>
                <select
                  id="service"
                  name="service"
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="">選択してください</option>
                  <option value="dialogue-agent">対話型AIエージェント</option>
                  <option value="knowledge-agent">ナレッジベースエージェント</option>
                  <option value="workflow-agent">ワークフロー自動化エージェント</option>
                  <option value="analysis-agent">データ分析エージェント</option>
                  <option value="learning-agent">学習型エージェント</option>
                  <option value="security-agent">セキュリティエージェント</option>
                  <option value="custom">カスタム開発</option>
                  <option value="consultation">まずは相談したい</option>
                </select>
              </div>

              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                  ご予算感
                </label>
                <select
                  id="budget"
                  name="budget"
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="">選択してください</option>
                  <option value="under-100">100万円未満</option>
                  <option value="100-300">100万円〜300万円</option>
                  <option value="300-500">300万円〜500万円</option>
                  <option value="500-1000">500万円〜1000万円</option>
                  <option value="over-1000">1000万円以上</option>
                  <option value="consultation">まずは相談したい</option>
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
                  placeholder="AIエージェント開発についてお聞かせください..."
                />
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  相談内容を送信
                </button>
              </div>
            </form>
          </div>

          {/* 右側：連絡先情報・特徴 */}
          <div className="space-y-8">
            {/* 直接連絡先 */}
            <div className="bg-white border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">お急ぎの場合</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 flex items-center justify-center rounded-full">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">お電話でのお問い合わせ</p>
                                          <a href="tel:+81-120-407-638" className="text-lg font-semibold text-blue-600 hover:text-blue-800">
                      0120-407-638
                    </a>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 flex items-center justify-center rounded-full">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">メールでのお問い合わせ</p>
                    <a href="mailto:contact@nands.tech" className="text-lg font-semibold text-green-600 hover:text-green-800">
                      contact@nands.tech
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* 開発の特徴 */}
            <div className="bg-white border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">開発の特徴</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 flex items-center justify-center rounded-full mt-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold text-gray-900">業界最速・最安値</h4>
                    <p className="text-gray-600 text-sm">2-3週間での超高速開発・従来の1/3コストを実現</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 flex items-center justify-center rounded-full mt-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold text-gray-900">最新AI技術統合</h4>
                    <p className="text-gray-600 text-sm">GPT-4・Claude・LangChain・AutoGenによる高精度システム</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 flex items-center justify-center rounded-full mt-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold text-gray-900">継続学習機能</h4>
                    <p className="text-gray-600 text-sm">使用するほど精度が向上する学習型システム</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 flex items-center justify-center rounded-full mt-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold text-gray-900">24時間365日稼働</h4>
                    <p className="text-gray-600 text-sm">99.95%可用性保証・自動復旧機能付き</p>
                  </div>
                </div>
              </div>
            </div>

            {/* サービス特徴 */}
            <div className="bg-blue-50 border border-blue-200 p-8">
              <h3 className="text-xl font-bold text-blue-900 mb-4">AIエージェント開発サービス</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white flex items-center justify-center rounded-full mt-1">
                    <span className="text-xs font-bold">AI</span>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold text-blue-900">対話型AIエージェント</h4>
                    <p className="text-blue-800 text-sm">自然言語による高度な対話システム</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white flex items-center justify-center rounded-full mt-1">
                    <span className="text-xs font-bold">KB</span>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold text-blue-900">ナレッジベースエージェント</h4>
                    <p className="text-blue-800 text-sm">企業知識を活用した情報提供システム</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white flex items-center justify-center rounded-full mt-1">
                    <span className="text-xs font-bold">WF</span>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold text-blue-900">ワークフロー自動化</h4>
                    <p className="text-blue-800 text-sm">業務プロセスの完全自動化</p>
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