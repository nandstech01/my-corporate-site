export default function ChatbotShowcase() {
  const projects = [
    {
      title: "カスタマーサポートボット",
      category: "ECサイト向け",
      description: "大手ECサイトの24時間カスタマーサポートを自動化。FAQ対応から注文サポートまで幅広く対応し、高品質サポートを達成。",
      features: [
        "24時間自動FAQ対応",
        "注文状況確認・変更",
        "商品推薦機能",
        "人間オペレーターへの自動エスカレーション"
      ],
      results: [
        "問い合わせ対応業務効率化",
        "高品質サポート達成",
        "応答時間を平均30分から即時に短縮",
        "年間運用コスト大幅削減"
      ],
      tech: ["GPT-4", "Node.js", "MongoDB", "WebSocket"],
      period: "開発期間: 1-2週間",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      )
    },
    {
      title: "社内ヘルプデスクボット",
      category: "企業内システム",
      description: "社内システムの操作説明、申請手続きサポート、IT関連の質問対応を自動化。従業員の業務効率を大幅に向上。",
      features: [
        "システム操作ガイド",
        "申請手続き自動化",
        "IT関連FAQ対応",
        "社内規定・ルール案内"
      ],
      results: [
        "ヘルプデスク業務効率化",
        "従業員満足度向上",
        "問題解決時間を平均2時間から10分に短縮",
        "IT部門の負荷軽減"
      ],
      tech: ["Claude API", "Python", "FastAPI", "Redis"],
      period: "開発期間: 2-3週間",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      title: "多言語対応接客ボット",
      category: "ホテル・観光業",
      description: "10言語対応の接客ボットで海外観光客への対応を自動化。文化的配慮も含めた高品質なサービスを提供。",
      features: [
        "10言語リアルタイム対応",
        "観光案内・予約サポート",
        "文化的配慮機能",
        "地域情報提供"
      ],
      results: [
        "海外観光客満足度向上",
        "多言語対応コスト効率化",
        "予約処理時間大幅短縮",
        "スタッフ負荷大幅軽減"
      ],
      tech: ["GPT-4", "翻訳API", "WebSocket", "MongoDB"],
      period: "開発期間: 2-3週間",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      )
    }
  ]

  return (
    <section id="showcase-section" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            チャットボット開発
            <span className="block text-blue-600">実績・事例紹介</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            様々な業界でのチャットボット開発実績。<br />
            GPT-4を活用した高性能ボットで業務効率化を実現しています。
          </p>
        </div>

        <div className="space-y-12">
          {projects.map((project, index) => (
            <div
              key={index}
              className={`flex flex-col ${
                index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              } gap-12 items-center`}
            >
              {/* プロジェクト画像・アイコン部分 */}
              <div className="flex-1">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-12 border border-gray-200 h-96 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-white mb-6">
                      {project.icon}
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{project.title}</h3>
                    <span className="inline-block px-4 py-2 bg-white/20 border border-white/30 text-sm font-medium">
                      {project.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* プロジェクト詳細部分 */}
              <div className="flex-1">
                <div className="bg-white border border-gray-200 p-8 h-96 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {project.title}
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {project.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                          主な機能
                        </h4>
                        <ul className="space-y-2">
                          {project.features.slice(0, 2).map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                              <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                          導入効果
                        </h4>
                        <ul className="space-y-2">
                          {project.results.slice(0, 2).map((result, resultIndex) => (
                            <li key={resultIndex} className="flex items-center text-sm text-gray-600">
                              <svg className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {result}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2">
                      {project.tech.slice(0, 3).map((tech, techIndex) => (
                        <span
                          key={techIndex}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium border border-gray-200"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 font-medium">
                      {project.period}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 全体実績サマリー */}
        <div className="mt-20 bg-gradient-to-r from-gray-900 to-blue-900 text-white p-12 border border-gray-200">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">
              チャットボット開発実績サマリー
            </h3>
            <p className="text-xl text-gray-300">
              様々な業界での導入実績と平均的な効果
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6">
              <div className="text-4xl font-bold text-green-400 mb-2">24/7</div>
              <div className="text-gray-300">稼働時間</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6">
              <div className="text-4xl font-bold text-yellow-400 mb-2">高品質</div>
              <div className="text-gray-300">サポート</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6">
              <div className="text-4xl font-bold text-purple-400 mb-2">GPT-4</div>
              <div className="text-gray-300">統合技術</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 