export default function MCPServicesSection() {
  const services = [
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: "カスタムMCPサーバー開発",
      description: "企業固有の要件に合わせたMCPサーバーの完全カスタム開発。既存システムとの連携も含めて設計・構築。",
      features: [
        "要件定義から運用まで",
        "既存システム連携",
        "カスタムプロトコル対応",
        "パフォーマンス最適化"
      ]
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      title: "データベース統合MCP",
      description: "データベースとAIシステムを連携するMCPサーバー。リアルタイムデータアクセスと高速検索機能を提供。",
      features: [
        "複数DB対応",
        "リアルタイムクエリ",
        "セキュアアクセス",
        "スケーラブル設計"
      ]
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
        </svg>
      ),
      title: "API統合MCPサーバー",
      description: "外部APIとAIシステムを繋ぐMCPサーバー。RESTやGraphQLなど様々なAPIプロトコルに対応。",
      features: [
        "マルチAPI対応",
        "認証・認可機能",
        "レート制限管理",
        "エラーハンドリング"
      ]
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: "ファイルシステムMCP",
      description: "ファイル操作とドキュメント管理を行うMCPサーバー。AI技術による自動分類・検索機能も搭載。",
      features: [
        "ファイル操作自動化",
        "ドキュメント検索",
        "メタデータ管理",
        "バージョン管理"
      ]
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: "監視・ログMCPサーバー",
      description: "システム監視とログ管理に特化したMCPサーバー。リアルタイム分析とアラート機能を提供。",
      features: [
        "リアルタイム監視",
        "ログ分析機能",
        "アラート通知",
        "ダッシュボード連携"
      ]
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: "セキュリティMCPサーバー",
      description: "セキュリティ機能に特化したMCPサーバー。認証・認可・暗号化などの包括的なセキュリティ機能。",
      features: [
        "多要素認証",
        "エンドツーエンド暗号化",
        "アクセス制御",
        "監査ログ"
      ]
    }
  ];

  return (
    <section id="services" className="py-20 bg-gray-50 service">
      {/* エンティティマップ対応Fragment ID */}
      <div id="service"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* セクションヘッダー */}
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            MCPサーバー開発サービス
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Model Context Protocolに基づく高性能サーバーで、AIシステム間の連携を強化
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

        {/* MCP Protocol説明 */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-200 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Model Context Protocol（MCP）とは
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">プロトコルの特徴</h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  AIシステム間の標準化された通信プロトコル
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  高速で安全なデータ交換機能
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  拡張性とスケーラビリティの確保
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  リアルタイム通信とイベント駆動処理
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">活用メリット</h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  異なるAIシステムの統合が容易
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  開発・保守コストの大幅削減
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  将来的な機能拡張への対応
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  エンタープライズレベルの信頼性
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 border border-gray-200">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              MCPサーバーでAI基盤を強化
            </h3>
            <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
              最新のModel Context Protocolで、御社のAIシステムを次世代レベルに押し上げます
            </p>
            <a 
              href="#contact" 
              className="inline-block bg-white text-blue-600 px-8 py-3 border border-gray-200 font-semibold hover:bg-gray-50 transition-colors"
            >
              開発相談を申し込む
            </a>
          </div>
        </div>
      </div>
    </section>
  );
} 