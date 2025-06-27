export default function HRPricingSection() {
  const plans = [
    {
      name: "スタータープラン",
      description: "小規模企業向けの基本的な人材ソリューション",
      features: [
        "求人サイト基本構築",
        "基本マッチング機能",
        "履歴書自動生成",
        "メールサポート",
        "月次レポート"
      ],
      recommended: false
    },
    {
      name: "ビジネスプラン", 
      description: "中規模企業向けの包括的なソリューション",
      features: [
        "高度なAIマッチング",
        "レコメンド機能",
        "職務経歴書自動生成",
        "退職届作成機能",
        "リアルタイム分析",
        "電話・チャットサポート",
        "週次レポート",
        "カスタマイズ対応"
      ],
      recommended: true
    },
    {
      name: "エンタープライズプラン",
      description: "大企業向けのフルカスタマイズソリューション",
      features: [
        "完全カスタマイズ開発",
        "既存システム連携",
        "高度な分析・レポート",
        "専任サポート担当",
        "24時間365日サポート",
        "オンサイト導入支援",
        "定期コンサルティング",
        "SLA保証"
      ],
      recommended: false
    }
  ];

  const additionalServices = [
    {
      name: "無料診断",
      description: "現状分析と最適プラン提案"
    },
    {
      name: "導入サポート",
      description: "専門スタッフによる導入支援"
    },
    {
      name: "運用サポート",
      description: "継続的な運用・改善支援"
    },
    {
      name: "カスタマイズ開発",
      description: "企業固有の要件に対応"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* セクションヘッダー */}
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            料金プラン
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            企業規模とニーズに合わせた柔軟なプランをご用意しています
          </p>
        </div>

        {/* 料金プラン */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`border border-gray-200 p-8 relative ${
                plan.recommended 
                  ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-300' 
                  : 'bg-white'
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-2 text-sm font-semibold">
                    おすすめ
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 mb-6">
                  {plan.description}
                </p>
                <div className="text-lg font-semibold text-blue-600 mb-4">
                  お見積もりいたします
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                className={`block w-full text-center py-3 px-6 font-semibold transition-colors ${
                  plan.recommended
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                お問い合わせ
              </a>
            </div>
          ))}
        </div>

        {/* 追加サービス */}
        <div className="bg-gray-50 border border-gray-200 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            追加サービス
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalServices.map((service, index) => (
              <div key={index} className="text-center">
                <h4 className="font-semibold text-gray-900 mb-2">
                  {service.name}
                </h4>
                <p className="text-sm text-gray-600">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 border border-gray-200">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              まずは無料相談から始めませんか？
            </h3>
            <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
              お客様のニーズに最適なプランと詳細なお見積もりをご提案いたします
            </p>
            <a 
              href="#contact" 
              className="inline-block bg-white text-blue-600 px-8 py-3 border border-gray-200 font-semibold hover:bg-gray-50 transition-colors"
            >
              無料相談を申し込む
            </a>
          </div>
        </div>
      </div>
    </section>
  );
} 