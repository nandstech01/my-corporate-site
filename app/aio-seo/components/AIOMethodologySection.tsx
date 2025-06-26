import React from 'react'

const AIOMethodologySection = () => {
  const methodologies = [
    {
      step: "01",
      title: "エンティティ関係性分析",
      description: "Mike King理論に基づき、コンテンツ内のエンティティ（人物、場所、概念）とその関係性を詳細に分析します。",
      details: [
        "主要エンティティの特定",
        "エンティティ間の関係性マッピング",
        "セマンティックトリプルの構築",
        "コンテキスト理解の最適化"
      ]
    },
    {
      step: "02", 
      title: "コンテンツベクトル最適化",
      description: "AI検索エンジンのベクトル空間において、最適な位置を確保するためのコンテンツ最適化を実施します。",
      details: [
        "ベクトル空間での位置分析",
        "意味的密度の計算・最適化",
        "関連キーワードの戦略的配置",
        "コンテンツクラスタリング"
      ]
    },
    {
      step: "03",
      title: "構造化データ実装",
      description: "AI検索エンジンが理解しやすい構造化データを実装し、検索結果での表示を最適化します。",
      details: [
        "Schema.org準拠の構造化データ",
        "JSON-LD形式での実装",
        "リッチスニペット対応",
        "ナレッジグラフ統合"
      ]
    },
    {
      step: "04",
      title: "AI検索エンジン個別対策",
      description: "Google AI Mode、ChatGPT、Perplexityなど、各AI検索エンジンの特性に合わせた個別最適化を実施します。",
      details: [
        "Google AI Mode専用最適化",
        "ChatGPT検索対応",
        "Perplexity最適化",
        "その他AI検索エンジン対応"
      ]
    }
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Mike King理論に基づく
            <span className="block text-blue-600">レリバンスエンジニアリング手法</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            iPullRank社のMike King氏が提唱する最新理論を完全実装。<br />
            従来のSEOからAIO（AI最適化）への転換を実現します。
          </p>
        </div>

        {/* Methodology Steps */}
        <div className="space-y-12">
          {methodologies.map((method, index) => (
            <div key={index} className="flex flex-col lg:flex-row items-center gap-8">
              {/* Step Number */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-blue-600 text-white border border-gray-200 flex items-center justify-center">
                  <span className="text-2xl font-bold">{method.step}</span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="bg-white border border-gray-200 p-8 shadow-lg">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {method.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {method.description}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {method.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mike King Theory Explanation */}
        <div className="mt-20">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border border-gray-200 p-12">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-3xl font-bold mb-6">
                Mike King理論とは？
              </h3>
              <p className="text-xl mb-8 leading-relaxed">
                iPullRank社のMike King氏が提唱する「レリバンスエンジニアリング」は、<br />
                従来のSEOからAI検索時代への進化を示す革新的な理論です。
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6">
                  <h4 className="text-lg font-bold mb-3">従来のSEO</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• キーワード中心の最適化</li>
                    <li>• リンク構築重視</li>
                    <li>• 検索エンジン向け</li>
                    <li>• 技術的SEO中心</li>
                  </ul>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6">
                  <h4 className="text-lg font-bold mb-3">レリバンスエンジニアリング</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• エンティティ関係性重視</li>
                    <li>• セマンティック理解</li>
                    <li>• AI検索エンジン対応</li>
                    <li>• コンテキスト最適化</li>
                  </ul>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6">
                  <h4 className="text-lg font-bold mb-3">AIO（AI最適化）</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• AI検索結果最適化</li>
                    <li>• ベクトル空間対応</li>
                    <li>• 複数AI検索対応</li>
                    <li>• 継続的学習対応</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AIOMethodologySection 