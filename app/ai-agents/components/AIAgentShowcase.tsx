export default function AIAgentShowcase() {
  const caseStudies = [
    {
      industry: "金融業界",
      title: "顧客対応AIエージェントシステム",
      challenge: "大量の顧客問い合わせに対する対応時間の短縮と、24時間365日のサポート体制構築が課題だった。",
      solution: "自然言語処理技術を活用した対話型AIエージェントを導入。ベクトル検索により過去の対応履歴から最適な回答を生成。",
      results: [
        "応答時間95%短縮",
        "顧客満足度大幅向上",
        "24時間365日対応実現",
        "オペレーター負荷軽減"
      ],
      metrics: {
        accuracy: "98%",
        timeReduction: "95%",
        satisfaction: "96%"
      }
    },
    {
      industry: "製造業",
      title: "品質管理AIエージェント",
      challenge: "製品の品質検査における人的ミスの削減と、検査効率の向上が求められていた。",
      solution: "機械学習アルゴリズムを活用した異常検知システムを構築。リアルタイムでの品質判定と予測分析を実装。",
      results: [
        "検査精度99%達成",
        "不良品検出率向上",
        "検査時間大幅短縮",
        "コスト削減効果"
      ],
      metrics: {
        accuracy: "99%",
        timeReduction: "85%",
        satisfaction: "94%"
      }
    },
    {
      industry: "医療・介護",
      title: "診療支援AIエージェント",
      challenge: "医師の診断支援と、膨大な医療情報の効率的な検索・活用が課題となっていた。",
      solution: "医療知識データベースとRAGシステムを統合したAIエージェントを開発。症状から適切な診断候補を提示。",
      results: [
        "診断精度向上",
        "診療時間短縮",
        "医療ミス削減",
        "患者満足度向上"
      ],
      metrics: {
        accuracy: "97%",
        timeReduction: "70%",
        satisfaction: "98%"
      }
    }
  ];

  const overallMetrics = [
    {
      label: "平均自動化精度",
      value: "98%",
      unit: ""
    },
    {
      label: "平均処理時間短縮",
      value: "83%",
      unit: ""
    },
    {
      label: "平均満足度",
      value: "96%",
      unit: ""
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* セクションヘッダー */}
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            導入事例・実績
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            様々な業界でAIエージェントシステムを導入し、業務効率化と品質向上を実現しています
          </p>
        </div>

        {/* 全体実績 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
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
                        <div className="text-sm text-gray-600">精度</div>
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
              業界特有の課題に合わせたカスタマイズで、最適なAIエージェントシステムをご提案いたします
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
  );
} 