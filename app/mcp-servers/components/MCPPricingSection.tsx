export default function MCPPricingSection() {
  const pricingPlans = [
    {
      name: "ベーシック",
      description: "小規模システム向けの基本的なMCPサーバー",
      features: [
        "基本MCPプロトコル対応",
        "標準API統合",
        "基本セキュリティ機能",
        "メール・チャットサポート",
        "基本監視・ログ機能",
        "月次レポート"
      ],
      popular: false
    },
    {
      name: "プロフェッショナル",
      description: "企業向け高機能MCPサーバーソリューション",
      features: [
        "高度なMCPプロトコル機能",
        "カスタムAPI開発",
        "強化セキュリティ",
        "優先サポート",
        "リアルタイム監視",
        "詳細分析レポート",
        "負荷分散・冗長化",
        "SLA保証"
      ],
      popular: true
    },
    {
      name: "エンタープライズ",
      description: "大規模システム向けフルカスタマイズソリューション",
      features: [
        "完全カスタマイズ開発",
        "マルチテナント対応",
        "エンタープライズセキュリティ",
        "専任サポートチーム",
        "24時間365日監視",
        "カスタムダッシュボード",
        "高可用性アーキテクチャ",
        "オンサイト対応"
      ],
      popular: false
    }
  ];

  const additionalServices = [
    {
      name: "システム設計・コンサルティング",
      description: "要件定義からアーキテクチャ設計まで包括的支援"
    },
    {
      name: "既存システム移行",
      description: "レガシーシステムからMCPへの段階的移行支援"
    },
    {
      name: "パフォーマンスチューニング",
      description: "システム最適化と性能向上サービス"
    },
    {
      name: "セキュリティ監査",
      description: "セキュリティ診断と脆弱性対策"
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
            システム規模や要件に応じた柔軟な料金体系でMCPサーバー開発をサポート
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

        {/* 開発プロセス */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-200 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            開発プロセス
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">要件定義</h4>
              <p className="text-sm text-gray-600">システム要件とMCP仕様の詳細分析</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">設計・開発</h4>
              <p className="text-sm text-gray-600">アーキテクチャ設計と実装開発</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">テスト・検証</h4>
              <p className="text-sm text-gray-600">包括的テストと性能検証</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">4</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">導入・運用</h4>
              <p className="text-sm text-gray-600">本番環境導入と運用開始</p>
            </div>
          </div>
        </div>

        {/* 料金に関する注意事項 */}
        <div className="mt-12 text-center">
          <div className="bg-blue-50 border border-blue-200 p-6 max-w-4xl mx-auto">
            <h4 className="font-semibold text-gray-900 mb-3">料金について</h4>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• システム規模・複雑さ・要件に応じて個別にお見積もりいたします</p>
              <p>• 開発費用・運用費用を含む透明性のある料金体系です</p>
              <p>• 段階的な導入・支払いプランもご相談いただけます</p>
              <p>• POC（概念実証）からの段階的な開発も承ります</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 border border-gray-200">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              まずは要件をお聞かせください
            </h3>
            <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
              御社の課題に最適なMCPサーバーソリューションをご提案いたします
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