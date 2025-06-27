export default function MCPTechStack() {
  const techCategories = [
    {
      title: "プロトコル・通信",
      technologies: [
        { name: "Protocol Latest", description: "最新MCP仕様対応" },
        { name: "WebSocket", description: "リアルタイム双方向通信" },
        { name: "JSON-RPC", description: "標準化されたRPC通信" },
        { name: "HTTP/3", description: "高速HTTP通信プロトコル" }
      ]
    },
    {
      title: "サーバー・インフラ",
      technologies: [
        { name: "Node.js", description: "高性能JavaScript実行環境" },
        { name: "Python", description: "AI・データ処理に最適" },
        { name: "Docker", description: "コンテナ化・デプロイメント" },
        { name: "Kubernetes", description: "オーケストレーション基盤" }
      ]
    },
    {
      title: "データベース・ストレージ",
      technologies: [
        { name: "PostgreSQL", description: "高性能リレーショナルDB" },
        { name: "Redis", description: "高速インメモリストレージ" },
        { name: "MongoDB", description: "柔軟なドキュメントDB" },
        { name: "S3", description: "スケーラブルオブジェクトストレージ" }
      ]
    },
    {
      title: "セキュリティ・監視",
      technologies: [
        { name: "OAuth 2.0", description: "標準認証プロトコル" },
        { name: "TLS 1.3", description: "最新暗号化通信" },
        { name: "Prometheus", description: "メトリクス監視システム" },
        { name: "Grafana", description: "可視化・ダッシュボード" }
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
            最新のMCP技術と実証済みのインフラストラクチャーで、信頼性の高いサーバーシステムを構築
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

        {/* MCP技術的特徴 */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-200 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            MCP技術的優位性
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">高速通信</h4>
              <p className="text-gray-600 text-sm">
                最適化されたプロトコルによる低レイテンシー通信とバッファリング機能
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">堅牢なセキュリティ</h4>
              <p className="text-gray-600 text-sm">
                エンドツーエンド暗号化と多層セキュリティによる包括的な保護機能
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">自動スケーリング</h4>
              <p className="text-gray-600 text-sm">
                負荷に応じた動的リソース調整と高可用性アーキテクチャ
              </p>
            </div>
          </div>
        </div>

        {/* アーキテクチャ図説明 */}
        <div className="mt-16 bg-white border border-gray-200 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            MCPサーバーアーキテクチャ
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">コアコンポーネント</h4>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <div className="font-medium text-gray-900">プロトコルハンドラー</div>
                    <div className="text-sm text-gray-600">MCP仕様に準拠したメッセージ処理エンジン</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <div className="font-medium text-gray-900">コネクションマネージャー</div>
                    <div className="text-sm text-gray-600">マルチクライアント接続管理とセッション制御</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <div className="font-medium text-gray-900">データアダプター</div>
                    <div className="text-sm text-gray-600">外部システム・データソースとの統合レイヤー</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <div className="font-medium text-gray-900">セキュリティゲートウェイ</div>
                    <div className="text-sm text-gray-600">認証・認可・暗号化処理の統合管理</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">運用・監視機能</h4>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-3 h-3 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <div className="font-medium text-gray-900">パフォーマンス監視</div>
                    <div className="text-sm text-gray-600">リアルタイムメトリクス収集と分析</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <div className="font-medium text-gray-900">ログ管理</div>
                    <div className="text-sm text-gray-600">構造化ログと検索・分析機能</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-3 h-3 bg-cyan-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <div className="font-medium text-gray-900">ヘルスチェック</div>
                    <div className="text-sm text-gray-600">自動診断とフェイルオーバー機能</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-3 h-3 bg-pink-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <div className="font-medium text-gray-900">アラート通知</div>
                    <div className="text-sm text-gray-600">異常検知と自動通知システム</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 