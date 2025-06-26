export default function VectorRagServicesSection() {
  const services = [
    {
      title: "企業内文書検索システム",
      description: "社内規定、マニュアル、契約書、技術文書など膨大な企業内文書から、自然言語による質問で瞬時に関連情報を検索・抽出。",
      features: [
        "多様な文書形式対応（PDF、Word、Excel、PowerPoint）",
        "階層構造を考慮した文書分類・整理",
        "アクセス権限管理による情報セキュリティ",
        "検索履歴分析による改善提案"
      ],
      benefits: "文書検索時間90%短縮、業務効率化、ナレッジ共有促進"
    },
    {
      title: "顧客向けFAQシステム",
      description: "顧客からの問い合わせに対して、過去のFAQや製品情報から最適な回答を自動生成。類似質問の提案機能も搭載。",
      features: [
        "自然言語による質問理解・回答生成",
        "類似質問・関連情報の自動提案",
        "多言語対応（日本語、英語、中国語等）",
        "回答精度の継続的学習・改善"
      ],
      benefits: "顧客満足度95%向上、サポート工数70%削減、24時間対応"
    },
    {
      title: "ナレッジベース構築",
      description: "企業の専門知識や技術情報を体系化し、AIが理解しやすい形でデータベース化。組織の知的資産を最大活用。",
      features: [
        "専門用語・概念の関係性マッピング",
        "知識の構造化・カテゴリ分類",
        "エキスパートナレッジの形式知化",
        "継続的な知識更新・メンテナンス"
      ],
      benefits: "組織知識の体系化、新人研修効率化、専門性向上"
    }
  ]

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* セクションヘッダー */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            ベクトルRAGサービス詳細
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            企業の情報資産を最大限に活用する、3つの核となるサービスをご提供します
          </p>
        </div>

        {/* サービス一覧 */}
        <div className="space-y-16">
          {services.map((service, index) => (
            <div key={index} className="bg-white border border-gray-200 p-8 md:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* 左側：サービス概要 */}
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                    {service.title}
                  </h3>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  <div className="bg-blue-50 border border-blue-200 p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">期待効果</h4>
                    <p className="text-blue-800">{service.benefits}</p>
                  </div>
                </div>

                {/* 右側：機能詳細 */}
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">主要機能</h4>
                  <ul className="space-y-3">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 border border-gray-200">
            <h3 className="text-2xl font-bold mb-4">
              あなたの企業に最適なRAGシステムを構築します
            </h3>
            <p className="text-lg mb-6 opacity-90">
              無料相談で、現在の課題をヒアリングし、最適なソリューションをご提案いたします
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
  )
} 