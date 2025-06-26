export default function ChatbotPricingSection() {
  const pricingPlans = [
    {
      name: "ベーシックボット",
      price: "40万円〜",
      period: "開発期間: 1-2週間",
      description: "基本的なFAQ対応チャットボット",
      features: [
        "FAQ自動応答（50問まで）",
        "基本的な問い合わせ分類",
        "Webサイト埋め込み",
        "基本レポート機能",
        "メール通知機能",
        "3ヶ月間サポート"
      ],
      recommended: false,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    },
    {
      name: "スタンダードボット",
      price: "80万円〜",
      period: "開発期間: 2-3週間",
      description: "高機能カスタマーサポートボット",
      features: [
        "FAQ自動応答（無制限）",
        "高度な問い合わせ分類・振り分け",
        "人間オペレーターへの自動エスカレーション",
        "複数プラットフォーム対応",
        "詳細レポート・分析機能",
        "6ヶ月間サポート"
      ],
      recommended: true,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      name: "プレミアムボット",
      price: "150万円〜",
      period: "開発期間: 3-4週間",
      description: "AI機能フル活用の高性能ボット",
      features: [
        "GPT-4による高精度応答",
        "多言語対応（10言語）",
        "機械学習による継続改善",
        "カスタムAPI連携",
        "高度な分析・BI機能",
        "12ヶ月間サポート"
      ],
      recommended: false,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    }
  ]

  const addOns = [
    {
      name: "LINE Bot連携",
      price: "10万円〜",
      description: "LINE公式アカウントとの連携機能"
    },
    {
      name: "Slack Bot統合",
      price: "8万円〜",
      description: "Slackワークスペースへの統合"
    },
    {
      name: "音声対応機能",
      price: "20万円〜",
      description: "音声認識・音声合成機能の追加"
    },
    {
      name: "カスタムAI学習",
      price: "30万円〜",
      description: "業界特化型AI学習・カスタマイズ"
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            チャットボット開発
            <span className="block text-blue-600">料金プラン</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            ニーズに応じた柔軟な料金体系。<br />
            初期費用のみで月額費用は不要です。
          </p>
        </div>

        {/* メインプラン */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white border-2 p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
                plan.recommended 
                  ? 'border-blue-500 shadow-lg' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-2 text-sm font-bold border border-gray-200">
                    おすすめ
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <div className={`text-blue-600 mb-4 ${plan.recommended ? 'text-blue-700' : ''}`}>
                  {plan.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {plan.price}
                </div>
                <div className="text-sm text-gray-500 mb-4">
                  {plan.period}
                </div>
                <p className="text-gray-600">
                  {plan.description}
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 text-sm">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <a
                  href="#consultation-section"
                  className={`inline-block w-full py-3 px-6 font-semibold transition-all duration-300 border border-gray-200 ${
                    plan.recommended
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-white text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  相談する
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* オプション機能 */}
        <div className="bg-gray-50 border border-gray-200 p-8 mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              オプション機能
            </h3>
            <p className="text-gray-600">
              基本プランに追加できる拡張機能
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {addOns.map((addon, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 p-6 text-center transition-all duration-300 hover:shadow-lg hover:border-blue-300"
              >
                <h4 className="font-bold text-gray-900 mb-2">
                  {addon.name}
                </h4>
                <div className="text-xl font-bold text-blue-600 mb-3">
                  {addon.price}
                </div>
                <p className="text-sm text-gray-600">
                  {addon.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 料金体系の特徴 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-12 border border-gray-200">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">
              料金体系の特徴
            </h3>
            <p className="text-xl text-blue-100">
              透明性の高い料金設定で安心してご利用いただけます
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 mb-4">
                <svg className="w-12 h-12 text-cyan-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <div className="text-2xl font-bold text-cyan-400 mb-2">初期費用のみ</div>
                <div className="text-blue-100">月額費用不要</div>
              </div>
              <p className="text-sm text-blue-200">
                開発費用のみで継続的な月額費用は発生しません
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 mb-4">
                <svg className="w-12 h-12 text-green-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-2xl font-bold text-green-400 mb-2">品質保証</div>
                <div className="text-blue-100">満足度保証</div>
              </div>
              <p className="text-sm text-blue-200">
                品質に満足いただけない場合は修正対応いたします
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 mb-4">
                <svg className="w-12 h-12 text-yellow-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-2xl font-bold text-yellow-400 mb-2">柔軟対応</div>
                <div className="text-blue-100">カスタマイズ可能</div>
              </div>
              <p className="text-sm text-blue-200">
                お客様のニーズに合わせた柔軟なカスタマイズ対応
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 