export default function VectorRagShowcase() {
  const caseStudies = [
    {
      industry: "製造業",
      title: "技術文書検索システム",
      challenge: "膨大な技術仕様書、設計図面、保守マニュアルから必要な情報を素早く見つけることが困難で、技術者の作業効率が低下していた。",
      solution: "20万件以上の技術文書をベクトル化し、自然言語による検索システムを構築。関連図面や類似事例も同時に表示する機能を実装。",
      results: [
        "検索精度90%向上",
        "技術者の調査時間80%短縮", 
        "新人研修期間50%削減",
        "ナレッジ共有促進"
      ],
      metrics: {
        accuracy: "90%",
        timeReduction: "80%",
        satisfaction: "95%"
      }
    },
    {
      industry: "法律事務所",
      title: "判例・法令検索システム",
      challenge: "類似判例の検索に膨大な時間を要し、法的リサーチの効率化が急務。キーワード検索では見落としが多く、精度に課題があった。",
      solution: "過去の判例、法令、契約書テンプレートをベクトル検索化。法的概念の関連性を考慮した高精度検索システムを開発。",
      results: [
        "類似判例発見率95%向上",
        "リサーチ時間70%削減",
        "案件対応速度向上",
        "クライアント満足度向上"
      ],
      metrics: {
        accuracy: "95%",
        timeReduction: "70%", 
        satisfaction: "97%"
      }
    },
    {
      industry: "医療機関",
      title: "診療ガイド検索システム",
      challenge: "最新の診療ガイドライン、薬事情報、症例報告から適切な情報を迅速に検索する必要があったが、情報量が膨大で効率的な検索が困難。",
      solution: "医学文献、診療ガイドライン、症例データベースを統合したRAGシステム。医学用語の同義語・関連語も考慮した検索機能を実装。",
      results: [
        "診断支援精度向上",
        "情報検索時間60%短縮",
        "医療従事者満足度98%",
        "医療安全性向上"
      ],
      metrics: {
        accuracy: "92%",
        timeReduction: "60%",
        satisfaction: "98%"
      }
    }
  ]

  const overallMetrics = [
    {
      label: "導入実績",
      value: "50+",
      unit: "社"
    },
    {
      label: "平均検索精度向上",
      value: "92%",
      unit: ""
    },
    {
      label: "平均時間短縮",
      value: "70%",
      unit: ""
    },
    {
      label: "平均満足度",
      value: "96%",
      unit: ""
    }
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* セクションヘッダー */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            導入事例・実績
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            様々な業界でベクトルRAGシステムを導入し、劇的な業務効率化を実現しています
          </p>
        </div>

        {/* 全体実績 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          {overallMetrics.map((metric, index) => (
            <div key={index} className="bg-white border border-gray-200 p-6 text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                {metric.value}<span className="text-2xl text-gray-500">{metric.unit}</span>
              </div>
              <div className="text-gray-700 font-medium">{metric.label}</div>
            </div>
          ))}
        </div>

        {/* 導入事例 */}
        <div className="space-y-12">
          {caseStudies.map((study, index) => (
            <div key={index} className="bg-white border border-gray-200 overflow-hidden">
              <div className="p-8 md:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* 左側：業界・タイトル・課題 */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center mb-4">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 text-sm font-medium border border-blue-200">
                        {study.industry}
                      </span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                      {study.title}
                    </h3>
                    
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">課題</h4>
                      <p className="text-gray-600 leading-relaxed">{study.challenge}</p>
                    </div>
                    
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">ソリューション</h4>
                      <p className="text-gray-600 leading-relaxed">{study.solution}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">効果・成果</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {study.results.map((result, resultIndex) => (
                          <li key={resultIndex} className="flex items-center">
                            <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-700">{result}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* 右側：数値指標 */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-gray-200 p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-6 text-center">主要指標</h4>
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-1">{study.metrics.accuracy}</div>
                        <div className="text-sm text-gray-600">検索精度向上</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-1">{study.metrics.timeReduction}</div>
                        <div className="text-sm text-gray-600">時間短縮</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-1">{study.metrics.satisfaction}</div>
                        <div className="text-sm text-gray-600">満足度</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 border border-gray-200">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              あなたの業界でも同様の成果を実現できます
            </h3>
            <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
              業界特有の課題に合わせたカスタマイズで、最適なRAGシステムをご提案いたします
            </p>
            <a 
              href="#contact" 
              className="inline-block bg-white text-blue-600 px-8 py-3 border border-gray-200 font-semibold hover:bg-gray-50 transition-colors"
            >
              導入相談を申し込む
            </a>
          </div>
        </div>
      </div>
    </section>
  )
} 