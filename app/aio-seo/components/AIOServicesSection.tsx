import React from 'react'

const AIOServicesSection = () => {
  const services = [
    {
      title: "セマンティック構造最適化",
      description: "エンティティ関係性を明確化し、AI検索エンジンが理解しやすいコンテンツ構造を構築",
      icon: (
        <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      features: ["エンティティマッピング", "セマンティックトリプル構築", "コンテキスト最適化", "関係性定義"]
    },
    {
      title: "GEO・コンテンツベクトル最適化",
      description: "GEO（生成系検索最適化）とベクトル空間での最適化を組み合わせたコンテンツ戦略",
      icon: (
        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      features: ["Topical-Coverage（1万字級網羅記事）", "Explain-Then-List構造", "Fragment ID+TOC最適化", "ベクトル空間分析", "意味的密度最適化", "コンテンツクラスタリング"]
    },
    {
      title: "AI検索アルゴリズム対策",
      description: "Google AI Mode、ChatGPT、Perplexityなど主要AI検索エンジンへの個別最適化",
      icon: (
        <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      features: ["Google AI Mode最適化", "ChatGPT対応", "Perplexity最適化", "複数AI検索対応"]
    },
    {
      title: "レリバンス測定・分析",
      description: "Mike King理論に基づく関連性スコアリングと継続的な改善",
      icon: (
        <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      features: ["レリバンススコア計測", "競合分析", "改善提案", "効果測定"]
    },
    {
      title: "構造化データ最適化",
      description: "AI検索エンジンが理解しやすい構造化データの実装と最適化",
      icon: (
        <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
        </svg>
      ),
      features: ["Schema.org実装", "JSON-LD最適化", "リッチスニペット対応", "ナレッジグラフ統合"]
    },
    {
      title: "継続的モニタリング",
      description: "AI検索結果での表示状況を継続的に監視し、最適化を継続",
      icon: (
        <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      features: ["AI検索監視", "順位追跡", "パフォーマンス分析", "レポート提供"]
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {/* スマホ版：2行分割 */}
            <span className="sm:hidden block">
              <span className="block text-2xl">AIO対策・GEO</span>
              <span className="block text-xl">レリバンスエンジニアリング</span>
            </span>
            
            {/* デスクトップ版：1行表示 */}
            <span className="hidden sm:block">
              AIO対策・GEO・レリバンスエンジニアリング
            </span>
            
            <span className="block text-blue-600">サービス一覧</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Mike King理論＋GEO（生成系検索最適化）に基づく包括的なAI検索最適化サービスで、<br />
            あなたのサイトをAI検索結果の上位に表示させます
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={index}
              className="bg-white border border-gray-200 p-8 shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              {/* Icon */}
              <div className="mb-6">
                {service.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                {service.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                {service.description}
              </p>

              {/* Features */}
              <ul className="space-y-2">
                {service.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              まずは無料診断から始めませんか？
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              現在のサイトのAI検索対応状況を無料で診断し、<br />
              改善提案をご提供いたします
            </p>
            <a
              href="#consultation-section"
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-bold border border-gray-200 hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              無料AIO診断を申し込む
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AIOServicesSection 