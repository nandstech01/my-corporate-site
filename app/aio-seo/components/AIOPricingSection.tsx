import React from 'react'

const AIOPricingSection = () => {
  const plans = [
    {
      name: "ベーシックプラン",
      price: "30万円〜",
      period: "月額",
      description: "小規模サイト向けの基本的なAIO対策",
      features: [
        "サイト診断・分析",
        "基本的なエンティティ最適化",
        "構造化データ実装",
        "月次レポート",
        "メールサポート"
      ],
      recommended: false
    },
    {
      name: "スタンダードプラン", 
      price: "60万円〜",
      period: "月額",
      description: "中規模サイト向けの包括的なレリバンスエンジニアリング",
      features: [
        "詳細サイト診断・競合分析",
        "Mike King理論完全実装",
                 "複数AI検索エンジン対応",
        "セマンティック構造最適化",
        "コンテンツベクトル最適化",
        "隔週進捗レポート",
        "電話・チャットサポート"
      ],
      recommended: true
    },
    {
      name: "エンタープライズプラン",
      price: "120万円〜",
      period: "月額", 
      description: "大規模サイト・複数サイト向けの完全カスタマイズ対応",
      features: [
        "全サイト包括診断・戦略策定",
        "カスタムレリバンスエンジニアリング",
        "専用AI検索最適化システム",
        "リアルタイム監視・分析",
        "専任コンサルタント配置",
        "週次戦略ミーティング",
        "24時間サポート",
        "成果保証制度"
      ],
      recommended: false
    }
  ]

  const additionalServices = [
    {
      name: "無料AIO診断",
      price: "無料",
      description: "現在のサイトのAI検索対応状況を無料で診断",
      duration: "1週間"
    },
    {
      name: "AIO対策コンサルティング",
      price: "15万円〜",
      description: "レリバンスエンジニアリング戦略の立案・アドバイス",
      duration: "2時間"
    },
    {
      name: "緊急AIO対策",
      price: "50万円〜",
      description: "競合他社に遅れをとった場合の緊急対応",
      duration: "2週間"
    }
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            AIO対策・レリバンスエンジニアリング
            <span className="block text-blue-600">料金プラン</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            サイト規模と目標に応じて最適なプランをお選びいただけます。<br />
            まずは無料診断からお気軽にお試しください。
          </p>
        </div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`bg-white border-2 shadow-lg hover:shadow-xl transition-all duration-300 relative ${
                plan.recommended 
                  ? 'border-blue-500 transform scale-105' 
                  : 'border-gray-200'
              }`}
            >
              {/* Recommended Badge */}
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-6 py-2 text-sm font-bold">
                    おすすめ
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-blue-600">{plan.price}</span>
                    <span className="text-gray-600 ml-2">/{plan.period}</span>
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <div className="text-center">
                  <a
                    href="#consultation-section"
                    className={`w-full inline-flex items-center justify-center px-6 py-3 border font-bold transition-colors ${
                      plan.recommended
                        ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                        : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    相談・見積もり依頼
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Services */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            追加サービス
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {additionalServices.map((service, index) => (
              <div key={index} className="bg-white border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-center">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    {service.name}
                  </h4>
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {service.price}
                  </div>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <div className="text-sm text-gray-500">
                    納期: {service.duration}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white border border-gray-200 p-8">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            よくある質問
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Q. 効果が出るまでの期間は？
              </h4>
              <p className="text-gray-600 mb-4">
                A. 通常2-3ヶ月で効果が現れ始め、6ヶ月で大幅な改善が期待できます。
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Q. 契約期間の縛りはありますか？
              </h4>
              <p className="text-gray-600 mb-4">
                A. 最低契約期間は6ヶ月です。効果を実感いただくために必要な期間です。
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Q. 他のSEO施策との併用は可能？
              </h4>
              <p className="text-gray-600 mb-4">
                A. はい。既存のSEO施策と相乗効果を発揮します。
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Q. 成果が出なかった場合は？
              </h4>
              <p className="text-gray-600 mb-4">
                A. エンタープライズプランには成果保証制度があります。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AIOPricingSection 