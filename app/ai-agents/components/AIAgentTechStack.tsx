export default function AIAgentTechStack() {
  const techCategories = [
    {
      title: "AI・機械学習",
      technologies: [
        { name: "GPT-4 Turbo", description: "最新の自然言語処理モデル" },
        { name: "Claude 3.5", description: "高度な推論・分析AI" },
        { name: "Vector Database", description: "高速ベクトル検索エンジン" },
        { name: "TensorFlow", description: "機械学習フレームワーク" }
      ]
    },
    {
      title: "エージェントフレームワーク",
      technologies: [
        { name: "Framework 2024", description: "最新エージェント開発基盤" },
        { name: "Protocol Latest", description: "通信プロトコル最新版" },
        { name: "LangChain", description: "LLMアプリケーション開発" },
        { name: "AutoGen", description: "マルチエージェントシステム" }
      ]
    },
    {
      title: "データ処理・検索",
      technologies: [
        { name: "RAG System", description: "検索拡張生成システム" },
        { name: "Semantic Search", description: "セマンティック検索技術" },
        { name: "Elasticsearch", description: "全文検索エンジン" },
        { name: "Redis", description: "高速キャッシュシステム" }
      ]
    },
    {
      title: "自動化・統合",
      technologies: [
        { name: "Automation Engine", description: "自動化判例検索システム" },
        { name: "API Gateway", description: "外部システム統合基盤" },
        { name: "Webhook System", description: "イベント駆動処理" },
        { name: "Message Queue", description: "非同期処理システム" }
      ]
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* セクションヘッダー */}
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            技術スタック
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            最先端のAI技術と実績のあるフレームワークで、高性能なAIエージェントシステムを構築
          </p>
        </div>

        {/* 技術スタックグリッド */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {techCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-gray-50 border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">
                {category.title}
              </h3>
              
              <div className="space-y-4">
                {category.technologies.map((tech, techIndex) => (
                  <div key={techIndex} className="bg-white border border-gray-200 p-4 hover:shadow-md transition-shadow duration-300">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {tech.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {tech.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 技術的特徴 */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-200 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            技術的特徴
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">リアルタイム処理</h4>
              <p className="text-gray-600 text-sm">
                最適化されたアルゴリズムによる高速レスポンスと並列処理機能
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">高度なセキュリティ</h4>
              <p className="text-gray-600 text-sm">
                エンタープライズレベルのセキュリティとプライバシー保護機能
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">継続的学習</h4>
              <p className="text-gray-600 text-sm">
                使用データから継続的に学習し、精度を向上させる適応型システム
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 