import React from 'react'

const AIOCaseStudiesSection = () => {
  const caseStudies = [
    {
      company: "試験運用A",
      industry: "製造業向け",
      challenge: "技術情報がAI検索で発見されない課題",
      solution: "エンティティ関係性最適化・構造化データ実装",
      results: [
        "Mike King理論実装により LLM表示率向上確認",
        "AI検索対応アルゴリズム運用開始", 
        "日本語セマンティック構造最適化完了",
        "製造業特化型AIO対策で効果実証中"
      ],
      period: "試験運用中"
    },
    {
      company: "試験運用B",
      industry: "IT・ソフトウェア向け",
      challenge: "競合他社にAI検索で負ける課題",
      solution: "Mike King理論完全実装・複数AI検索対応",
      results: [
        "Google AI対策でChatGPT表示増加確認",
        "ChatGPT検索最適化で可視性向上",
        "Perplexity対応アルゴリズムで成果確認",
        "SaaS業界特化型AIO対策で優位性確立"
      ],
      period: "試験運用中"
    },
    {
      company: "試験運用C", 
      industry: "Eコマース向け",
      challenge: "商品情報がAI検索に表示されない課題",
      solution: "商品エンティティ最適化・セマンティック構造化",
      results: [
        "商品データ構造化でAI検索表示率向上",
        "ECサイト専用AIO対策で売上貢献確認",
        "商品検索最適化で競合優位性確立",
        "Eコマース特化型レリバンス技術で効果実証"
      ],
      period: "試験運用中"
    }
  ]

  return (
    <section id="case-studies" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {/* スマホ版：2行分割 */}
            <span className="sm:hidden block">
              <span className="block text-2xl">AIO対策</span>
              <span className="block text-xl">レリバンスエンジニアリング</span>
            </span>
            
            {/* デスクトップ版：1行表示 */}
            <span className="hidden sm:block">
              AIO対策・レリバンスエンジニアリング
            </span>
            
            <span className="block text-blue-600">サービス準備状況</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            様々な業界向けAI検索最適化サービスで効果実証中。<br />
            日本市場に特化したAIO対策で LLM表示率向上を確認しています。
          </p>
        </div>

        {/* Case Studies Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {caseStudies.map((study, index) => (
            <div key={index} className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6">
                <h3 className="text-xl font-bold mb-2">{study.company}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">{study.industry}</span>
                  <span className="bg-white/20 px-3 py-1 text-sm font-medium">
                    {study.period}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Challenge */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    課題
                  </h4>
                  <p className="text-gray-600 text-sm">{study.challenge}</p>
                </div>

                {/* Solution */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                    <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    解決策
                  </h4>
                  <p className="text-gray-600 text-sm">{study.solution}</p>
                </div>

                {/* Results */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    開発状況
                  </h4>
                  <ul className="space-y-2">
                    {study.results.map((result, resultIndex) => (
                      <li key={resultIndex} className="flex items-center text-sm text-gray-700">
                        <svg className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                        </svg>
                        {result}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="mt-20">
          <div className="bg-gradient-to-r from-gray-900 to-blue-900 text-white border border-gray-200 p-12">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold mb-4">
                {/* スマホ版：2行分割 */}
                <span className="sm:hidden block">
                  <span className="block text-xl">サービス開発</span>
                  <span className="block text-lg">試験運用状況</span>
                </span>
                
                {/* デスクトップ版：1行表示 */}
                <span className="hidden sm:block">
                  サービス開発・試験運用状況
                </span>
              </h3>
              <p className="text-xl text-gray-300">
                日本市場向けAIO対策・レリバンスエンジニアリングサービスの現在の試験運用状況
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6">
                <div className="text-4xl font-bold text-green-400 mb-2">効果実証</div>
                <div className="text-gray-300 text-sm">Mike King理論実装成功</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6">
                <div className="text-4xl font-bold text-blue-400 mb-2">運用中</div>
                <div className="text-gray-300 text-sm">AI検索対応技術</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6">
                <div className="text-4xl font-bold text-yellow-400 mb-2">向上確認</div>
                <div className="text-gray-300 text-sm">LLM表示率改善</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6">
                <div className="text-4xl font-bold text-purple-400 mb-2">基盤確立</div>
                <div className="text-gray-300 text-sm">分析・監視システム</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AIOCaseStudiesSection 