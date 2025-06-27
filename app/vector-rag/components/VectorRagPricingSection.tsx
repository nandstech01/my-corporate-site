export default function VectorRagPricingSection() {
  const plans = [
    {
      name: "ベーシックRAG",
      price: "60万円〜",
      period: "初期費用のみ",
      description: "小規模企業向けの基本的なRAGシステム",
      features: [
        "文書数：1万件まで",
        "同時ユーザー：50人まで",
        "基本検索機能",
        "標準的な精度チューニング",
        "メール・チャットサポート",
        "月次レポート"
      ],
      development: "2-3週間",
      recommended: false
    },
    {
      name: "スタンダードRAG",
      price: "120万円〜",
      period: "初期費用のみ",
      description: "中規模企業に最適なバランス型プラン",
      features: [
        "文書数：10万件まで",
        "同時ユーザー：200人まで",
        "高度な検索・フィルタリング",
        "カスタム精度チューニング",
        "専任サポート",
        "週次レポート・分析",
        "API連携対応",
        "セキュリティ強化"
      ],
      development: "3-4週間",
      recommended: true
    },
    {
      name: "エンタープライズRAG",
      price: "250万円〜",
      period: "初期費用のみ",
      description: "大企業向けフルカスタマイズシステム",
      features: [
        "文書数：100万件以上",
        "同時ユーザー：無制限",
        "高度なAI機能フル活用",
        "完全カスタマイズ対応",
        "24時間専任サポート",
        "リアルタイム監視・分析",
        "既存システム完全統合",
        "エンタープライズセキュリティ",
        "専用インフラ構築",
        "継続的改善・最適化"
      ],
      development: "4-6週間",
      recommended: false
    }
  ]

  const optionServices = [
    {
      name: "多言語対応",
      price: "15万円〜",
      description: "英語、中国語、韓国語等の多言語検索対応"
    },
    {
      name: "API連携",
      price: "20万円〜", 
      description: "既存システムとのAPI連携・データ同期"
    },
    {
      name: "カスタムUI開発",
      price: "30万円〜",
      description: "企業ブランドに合わせたオリジナルUI設計"
    },
    {
      name: "高度分析機能",
      price: "25万円〜",
      description: "検索パターン分析・改善提案機能"
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* セクションヘッダー */}
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            料金プラン
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            企業規模・要件に応じて最適なプランをお選びいただけます。月額料金不要の明確な料金体系です。
          </p>
        </div>

        {/* 料金プラン */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div key={index} className={`relative border border-gray-200 p-8 ${plan.recommended ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-300' : 'bg-white'}`}>
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 text-sm font-semibold">
                    おすすめ
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-1">{plan.price}</div>
                <div className="text-sm text-gray-600 mb-3">{plan.period}</div>
                <p className="text-gray-600">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="text-center mb-4">
                  <span className="bg-green-100 text-green-800 px-3 py-1 text-sm font-medium border border-green-200">
                    開発期間：{plan.development}
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <a 
                href="#contact" 
                className={`block w-full text-center py-3 border border-gray-200 font-semibold transition-colors ${
                  plan.recommended 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700' 
                    : 'bg-white text-gray-900 hover:bg-gray-50'
                }`}
              >
                相談・見積もり依頼
              </a>
            </div>
          ))}
        </div>

        {/* オプション機能 */}
        <div className="bg-gray-50 border border-gray-200 p-8 md:p-12 mb-12">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
            オプション機能
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {optionServices.map((option, index) => (
              <div key={index} className="bg-white border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-lg font-semibold text-gray-900">{option.name}</h4>
                  <span className="text-blue-600 font-bold">{option.price}</span>
                </div>
                <p className="text-gray-600 text-sm">{option.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 料金の特徴 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="text-center p-6 bg-blue-50 border border-blue-200">
            <div className="w-12 h-12 bg-blue-600 text-white flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">初期費用のみ</h4>
            <p className="text-gray-600 text-sm">月額料金不要の明確な料金体系</p>
          </div>
          
          <div className="text-center p-6 bg-green-50 border border-green-200">
            <div className="w-12 h-12 bg-green-600 text-white flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">品質保証</h4>
            <p className="text-gray-600 text-sm">満足いただけるまで調整・改善</p>
          </div>
          
          <div className="text-center p-6 bg-purple-50 border border-purple-200">
            <div className="w-12 h-12 bg-purple-600 text-white flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">柔軟対応</h4>
            <p className="text-gray-600 text-sm">要件に応じたカスタマイズ対応</p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 border border-gray-200">
            <h3 className="text-2xl font-bold mb-4">
              最適なプランをご提案いたします
            </h3>
            <p className="text-lg mb-6 opacity-90">
              まずは無料相談で、現在の課題と要件をお聞かせください
            </p>
            <a 
              href="#contact" 
              className="inline-block bg-white text-blue-600 px-8 py-3 border border-gray-200 font-semibold hover:bg-gray-50 transition-colors"
            >
              無料相談・見積もり依頼
            </a>
          </div>
        </div>
      </div>
    </section>
  )
} 