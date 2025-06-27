export default function HRServicesSection() {
  const services = [
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      title: "求人サイト構築",
      description: "AI機能を搭載した高性能求人サイトを短期間で構築。レスポンシブデザインと高速表示を実現。",
      features: [
        "AI検索機能搭載",
        "レスポンシブデザイン",
        "高速表示最適化",
        "SEO完全対応"
      ]
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: "AIマッチングエンジン",
      description: "機械学習とベクトル検索を活用した高精度マッチングシステム。求職者と企業を最適にマッチング。",
      features: [
        "95%以上のマッチング精度",
        "リアルタイム分析",
        "多次元スキル評価",
        "学習型アルゴリズム"
      ]
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "レコメンド機能",
      description: "ユーザーの行動履歴と嗜好を分析し、最適な求人や候補者を自動推薦するシステム。",
      features: [
        "行動履歴分析",
        "パーソナライズ推薦",
        "協調フィルタリング",
        "リアルタイム更新"
      ]
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: "職務経歴書自動生成",
      description: "AIが経歴情報を最適化し、魅力的な職務経歴書を自動生成。業界別テンプレート対応。",
      features: [
        "AI文章最適化",
        "業界別テンプレート",
        "キーワード最適化",
        "PDF自動出力"
      ]
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      title: "履歴書自動生成",
      description: "個人情報から最適な履歴書を自動作成。写真配置や文字サイズも自動調整。",
      features: [
        "フォーマット自動調整",
        "写真配置最適化",
        "文字サイズ調整",
        "複数形式対応"
      ]
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: "退職届自動生成",
      description: "法的要件を満たした退職届を自動生成。労働法に準拠した文面で安心サポート。",
      features: [
        "法的要件完全準拠",
        "労働法対応",
        "文面自動最適化",
        "即日対応可能"
      ]
    }
  ];

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* セクションヘッダー */}
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            人材ソリューションサービス
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            AIを活用した包括的な人材サービスで、採用から退職まで全プロセスをサポート
          </p>
        </div>

        {/* サービスグリッド */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-white border border-gray-200 p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="text-blue-600 mb-6">
                {service.icon}
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {service.title}
              </h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                {service.description}
              </p>
              
              <ul className="space-y-2">
                {service.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-gray-700">
                    <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 border border-gray-200">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              人材業界のDXを今すぐ始めませんか？
            </h3>
            <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
              AIを活用した次世代人材ソリューションで、業務効率を劇的に向上させます
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