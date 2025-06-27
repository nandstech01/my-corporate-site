export default function AIAgentPricingSection() {
  const pricingPlans = [
    {
      name: "スタンダード",
      description: "中小企業向けの基本的なAIエージェントシステム",
      features: [
        "対話型AIエージェント",
        "基本的な自然言語処理",
        "ベクトル検索機能",
        "24時間365日稼働",
        "基本サポート",
        "月次レポート"
      ],
      popular: false
    },
    {
      name: "プロフェッショナル",
      description: "高度な機能を備えた企業向けソリューション",
      features: [
        "高度なAIエージェント",
        "マルチモーダル対応",
        "RAGシステム統合",
        "カスタム学習機能",
        "優先サポート",
        "詳細分析レポート",
        "API連携",
        "セキュリティ強化"
      ],
      popular: true
    },
    {
      name: "エンタープライズ",
      description: "大企業向けのフルカスタマイズソリューション",
      features: [
        "完全カスタマイズ",
        "マルチエージェント連携",
        "高度なセキュリティ",
        "オンプレミス対応",
        "専任サポート",
        "SLA保証",
        "継続的改善",
        "統合コンサルティング"
      ],
      popular: false
    }
  ];

  const additionalServices = [
    {
      name: "初期導入支援",
      description: "システム導入から運用開始までの包括的サポート"
    },
    {
      name: "カスタム開発",
      description: "業界特有の要件に合わせた専用機能開発"
    },
    {
      name: "運用保守",
      description: "24時間365日の監視・保守サービス"
    },
    {
      name: "データ移行",
      description: "既存システムからのデータ移行支援"
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
            企業規模や要件に合わせて選択可能な柔軟な料金体系をご用意しています
          </p>
        </div>

        {/* 料金プラン */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {pricingPlans.map((plan, index) => (
            <div 
              key={index} 
              className={`border border-gray-200 p-8 relative ${
                plan.popular 
                  ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-300 shadow-lg' 
                  : 'bg-white'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 text-sm font-bold">
                    人気プラン
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="text-lg font-semibold text-blue-600">
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
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
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
              <div key={index} className="bg-white border border-gray-200 p-6 text-center">
                <h4 className="font-semibold text-gray-900 mb-2">{service.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                <div className="text-sm font-medium text-blue-600">
                  お見積もりいたします
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 料金に関する注意事項 */}
        <div className="mt-12 text-center">
          <div className="bg-blue-50 border border-blue-200 p-6 max-w-4xl mx-auto">
            <h4 className="font-semibold text-gray-900 mb-3">料金について</h4>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• 料金は要件やシステム規模によって個別にお見積もりいたします</p>
              <p>• 初期費用と月額費用を含む透明性のある料金体系です</p>
              <p>• 長期契約割引やボリューム割引もご用意しています</p>
              <p>• 無料トライアル期間を設けており、効果を実感してからご導入いただけます</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 border border-gray-200">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              まずは無料相談から始めませんか？
            </h3>
            <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
              御社の課題をお聞かせください。最適なAIエージェントシステムをご提案いたします
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