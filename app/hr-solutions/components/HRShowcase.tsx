export default function HRShowcase() {
  const caseStudies = [
    {
      industry: "人材紹介会社",
      title: "AI求人マッチングシステム",
      challenge: "手動での求人マッチングに時間がかかり、精度も不安定。大量の応募者から最適な候補者を見つけるのが困難だった。",
      solution: "機械学習とベクトル検索を活用したAIマッチングシステムを導入。スキル・経験・志向性を多次元で分析し、最適なマッチングを実現。",
      results: [
        "マッチング精度大幅向上",
        "スクリーニング時間大幅短縮",
        "成約率向上",
        "顧客満足度向上"
      ],
      metrics: {
        accuracy: "AI分析",
        timeReduction: "自動化",
        satisfaction: "高品質"
      }
    },
    {
      industry: "製造業",
      title: "履歴書・職務経歴書自動生成システム",
      challenge: "採用担当者が履歴書の確認に多大な時間を費やし、応募者も魅力的な書類作成に苦労していた。",
      solution: "AIを活用した書類自動生成システムを導入。応募者の情報から最適化された履歴書・職務経歴書を自動作成。",
      results: [
        "書類作成時間大幅削減",
        "書類品質の標準化",
        "採用効率向上",
        "応募者体験向上"
      ],
      metrics: {
        accuracy: "自動生成",
        timeReduction: "効率化",
        satisfaction: "品質向上"
      }
    },
    {
      industry: "IT企業",
      title: "求人サイト構築・レコメンドシステム",
      challenge: "既存の求人サイトではユーザーが適切な求人を見つけにくく、離脱率が高い状況だった。",
      solution: "AI搭載の求人サイトを構築し、ユーザーの行動履歴に基づくパーソナライズドレコメンド機能を実装。",
      results: [
        "ユーザー滞在時間増加",
        "応募率向上",
        "離脱率削減",
        "売上向上"
      ],
      metrics: {
        accuracy: "レコメンド",
        timeReduction: "自動化",
        satisfaction: "UX向上"
      }
    }
  ];

  const overallMetrics = [
    {
      label: "AI技術活用",
      value: "機械学習",
      unit: ""
    },
    {
      label: "自動化対応",
      value: "24/7",
      unit: ""
    },
    {
      label: "業界対応",
      value: "全業界",
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
            様々な業界で人材ソリューションを導入し、劇的な業務効率化を実現しています
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
                        <div className="text-sm text-gray-600">精度向上</div>
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
              業界特有の課題に合わせたカスタマイズで、最適な人材ソリューションをご提案いたします
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