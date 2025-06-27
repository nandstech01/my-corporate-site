export default function ChatbotServicesSection() {
  const services = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      title: "カスタマーサポートボット",
      description: "FAQ対応、問い合わせ分類、エスカレーション機能を搭載した高性能サポートボット",
      features: [
        "FAQ自動応答",
        "問い合わせ分類・振り分け",
        "人間オペレーターへの自動エスカレーション",
        "顧客満足度調査機能"
      ]
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      title: "ECサイト販売ボット",
      description: "商品説明、在庫確認、注文サポートまで対応するEC特化型チャットボット",
      features: [
        "商品検索・推薦機能",
        "在庫確認・価格案内",
        "注文サポート・決済案内",
        "配送状況確認"
      ]
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      title: "社内ヘルプデスクボット",
      description: "社内システム操作、申請手続き、IT関連の質問に対応する社内向けボット",
      features: [
        "システム操作ガイド",
        "申請手続きサポート",
        "IT関連FAQ対応",
        "社内規定・ルール案内"
      ]
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: "教育・研修ボット",
      description: "学習サポート、進捗管理、質問対応を行う教育特化型チャットボット",
      features: [
        "学習コンテンツ提供",
        "進捗管理・レポート",
        "質問対応・解説",
        "テスト・クイズ機能"
      ]
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: "データ分析ボット",
      description: "データ抽出、レポート生成、分析結果の説明を行うBI特化型ボット",
      features: [
        "データ抽出・集計",
        "自動レポート生成",
        "グラフ・チャート作成",
        "分析結果の自然言語説明"
      ]
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      ),
      title: "多言語対応ボット",
      description: "リアルタイム翻訳機能を搭載した国際対応チャットボット",
      features: [
        "10言語対応",
        "リアルタイム翻訳",
        "文化的配慮機能",
        "地域別カスタマイズ"
      ]
    }
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            チャットボット開発サービス
            <span className="block text-blue-600">業界別特化ソリューション</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            GPT-4を活用した高性能チャットボットで、<br />
            業界特有のニーズに最適化された自動化ソリューションを提供します。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group bg-white border border-gray-200 p-8 transition-all duration-300 hover:shadow-xl hover:border-blue-300 hover:-translate-y-2"
            >
              <div className="text-blue-600 mb-6 group-hover:text-blue-700 transition-colors">
                {service.icon}
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                {service.title}
              </h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                {service.description}
              </p>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 text-sm">
                  主な機能
                </h4>
                <ul className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <a
                  href="#consultation-section"
                  className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700 transition-colors"
                >
                  詳細相談
                  <svg className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* 導入メリット */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-12 border border-gray-200">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">
              チャットボット導入のメリット
            </h3>
            <p className="text-xl text-blue-100">
              AIチャットボットがもたらす具体的な効果と改善点
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6">
              <div className="text-4xl font-bold text-cyan-300 mb-2">80%</div>
              <div className="text-blue-100">工数削減</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6">
              <div className="text-4xl font-bold text-green-300 mb-2">24時間</div>
              <div className="text-blue-100">自動対応</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6">
              <div className="text-4xl font-bold text-yellow-300 mb-2">95%</div>
              <div className="text-blue-100">顧客満足度</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6">
              <div className="text-4xl font-bold text-purple-300 mb-2">60%</div>
              <div className="text-blue-100">コスト削減</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 