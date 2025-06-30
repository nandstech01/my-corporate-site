export default function AIAgentTechStack() {
  const techCategories = [
    {
      title: "AI・機械学習基盤",
      description: "最先端の言語モデルと機械学習フレームワークを統合した高性能AI処理基盤",
      technologies: [
        { 
          name: "GPT-4 Turbo", 
          description: "OpenAIの最新大規模言語モデル。128K contextで長文理解・生成",
          specs: {
            "Context Length": "128,000 トークン",
            "精度": "MMLU 86.4%、HumanEval 67%",
            "処理速度": "平均0.8秒/回答",
            "多言語対応": "100+言語対応"
          },
          useCases: ["複雑な推論・分析", "長文書の要約・生成", "コード生成・デバッグ"]
        },
        { 
          name: "Claude 3.5 Sonnet", 
          description: "Anthropicの高精度推論AI。Constitutional AIによる安全性確保",
          specs: {
            "推論精度": "複雑な問題で95%以上",
            "安全性": "Constitutional AI統合",
            "処理能力": "200K context window",
            "特徴": "数学・分析・創作に特化"
          },
          useCases: ["高精度データ分析", "安全性重視業務", "数学的推論・計算"]
        },
        { 
          name: "Vector Database", 
          description: "Pinecone・Chroma・Weaviate統合による超高速ベクトル検索",
          specs: {
            "検索速度": "1億ベクトルを50ms以下",
            "精度": "Cosine類似度 99.2%",
            "スケール": "最大10TB データ対応",
            "API": "REST・gRPC対応"
          },
          useCases: ["セマンティック検索", "推薦システム", "類似文書検索"]
        },
        { 
          name: "TensorFlow/PyTorch", 
          description: "機械学習・深層学習モデルの学習・推論統合基盤",
          specs: {
            "GPU加速": "CUDA・ROCm対応",
            "分散学習": "Multi-GPU・TPU対応",
            "モデル形式": "ONNX・TensorRT互換",
            "デプロイ": "TensorFlow Serving統合"
          },
          useCases: ["カスタムモデル学習", "予測分析", "画像・音声処理"]
        }
      ]
    },
    {
      title: "エージェントフレームワーク",
      description: "AIエージェントの構築・管理・連携を支援する包括的なフレームワーク群",
      technologies: [
        { 
          name: "LangChain", 
          description: "LLMアプリケーション開発の標準フレームワーク。Chain・Agent・Memory統合",
          specs: {
            "対応LLM": "GPT・Claude・Llama・Gemini",
            "Chain数": "50+の事前定義Chain",
            "Memory": "永続化・分散メモリ対応",
            "Tools": "200+のツール統合"
          },
          useCases: ["複雑ワークフロー", "Tool連携", "長期記憶システム"]
        },
        { 
          name: "AutoGen", 
          description: "Microsoft開発マルチエージェント対話フレームワーク",
          specs: {
            "エージェント数": "無制限同時実行",
            "対話パターン": "グループチャット・ピアツーピア",
            "Code実行": "Python・JavaScript・SQL",
            "役割定義": "カスタム役割・スキル定義"
          },
          useCases: ["チーム作業自動化", "コード生成・レビュー", "複雑問題解決"]
        },
        { 
          name: "CrewAI", 
          description: "役割ベースAIエージェント協調システム",
          specs: {
            "役割管理": "階層型組織構造対応",
            "タスク分散": "動的負荷分散",
            "協調方式": "投票・合意形成・競争",
            "監視": "リアルタイム状態監視"
          },
          useCases: ["複雑プロジェクト管理", "意思決定支援", "品質管理"]
        },
        { 
          name: "LlamaIndex", 
          description: "データ統合・インデックス構築特化フレームワーク",
          specs: {
            "データ形式": "PDF・DOCX・CSV・JSON・SQL",
            "インデックス": "Tree・Vector・Graph・Keyword",
            "クエリ": "自然言語・SQL・GraphQL",
            "統合": "200+データソース対応"
          },
          useCases: ["企業データ統合", "知識ベース構築", "検索システム"]
        }
      ]
    },
    {
      title: "データ処理・検索技術",
      description: "大規模データの処理・検索・分析を支える高性能データ基盤技術",
      technologies: [
        { 
          name: "RAG System", 
          description: "検索拡張生成による動的知識統合システム",
          specs: {
            "検索精度": "Recall@10: 94.2%",
            "生成品質": "ROUGE-L: 0.89",
            "レイテンシ": "検索+生成 < 2秒",
            "スケール": "100TB+ 文書対応"
          },
          useCases: ["動的FAQ生成", "文書要約", "質問応答システム"]
        },
        { 
          name: "Elasticsearch", 
          description: "分散型全文検索・分析エンジン",
          specs: {
            "検索速度": "10億文書を100ms以下",
            "分析機能": "リアルタイム集計・可視化",
            "スケール": "ペタバイト級データ対応",
            "API": "REST・GraphQL・SDK"
          },
          useCases: ["ログ分析", "全文検索", "リアルタイム分析"]
        },
        { 
          name: "Apache Kafka", 
          description: "高スループット分散ストリーミングプラットフォーム",
          specs: {
            "スループット": "数百万メッセージ/秒",
            "レイテンシ": "1ms以下（P99）",
            "耐久性": "レプリケーション・永続化",
            "統合": "Spark・Flink・Storm対応"
          },
          useCases: ["リアルタイムデータパイプライン", "イベント駆動処理", "マイクロサービス連携"]
        },
        { 
          name: "Redis", 
          description: "インメモリ高速キャッシュ・データストア",
          specs: {
            "処理速度": "100万ops/秒",
            "データ構造": "String・Hash・List・Set・Stream",
            "永続化": "RDB・AOF対応",
            "クラスタ": "自動シャーディング・HA"
          },
          useCases: ["セッション管理", "リアルタイムキャッシュ", "分散ロック"]
        }
      ]
    },
    {
      title: "自動化・統合システム",
      description: "業務プロセス自動化とシステム統合を実現する包括的な自動化基盤",
      technologies: [
        { 
          name: "Microsoft Power Automate", 
          description: "ローコードワークフロー自動化プラットフォーム",
          specs: {
            "コネクタ数": "400+サービス対応",
            "処理能力": "100万フロー/月",
            "AI統合": "AI Builder・Forms Recognizer",
            "監視": "詳細ログ・エラーハンドリング"
          },
          useCases: ["Office365連携", "承認ワークフロー", "データ同期"]
        },
        { 
          name: "Zapier Enterprise", 
          description: "5000+アプリ統合自動化プラットフォーム",
          specs: {
            "アプリ連携": "5,000+アプリケーション",
            "実行速度": "即座～15分間隔",
            "データ転送": "無制限",
            "セキュリティ": "SOC2・GDPR準拠"
          },
          useCases: ["マーケティング自動化", "CRM連携", "データ統合"]
        },
        { 
          name: "Apache Airflow", 
          description: "プログラマブルワークフロー管理・スケジューリング",
          specs: {
            "DAG管理": "複雑な依存関係対応",
            "スケール": "数千タスク並列実行",
            "監視": "Web UI・メトリクス監視",
            "拡張性": "カスタムOperator開発"
          },
          useCases: ["ETLパイプライン", "MLOpsワークフロー", "バッチ処理"]
        },
        { 
          name: "Docker/Kubernetes", 
          description: "コンテナ化・オーケストレーション基盤",
          specs: {
            "スケール": "数千ノード・数万Pod",
            "自動化": "Auto-scaling・Self-healing",
            "デプロイ": "Blue-Green・Rolling Update",
            "監視": "Prometheus・Grafana統合"
          },
          useCases: ["マイクロサービス", "CI/CD", "インフラ自動化"]
        }
      ]
    }
  ];

  const integrationBenefits = [
    {
      title: "シームレス統合",
      description: "全技術スタックがAPI・SDK・Webhookで完全連携。データサイロを排除し、統一されたAIエージェントエコシステムを構築",
      metrics: ["API応答時間 < 100ms", "99.95%統合成功率", "ゼロダウンタイムデプロイ"]
    },
    {
      title: "自動スケーリング",
      description: "Kubernetes・Docker・Kafka・Redisクラスタによる自動負荷分散。需要に応じて動的にリソースを調整し、常に最適性能を維持",
      metrics: ["需要予測精度95%", "自動スケール時間 < 30秒", "99.9%可用性保証"]
    },
    {
      title: "継続的学習",
      description: "TensorFlow・PyTorch・LangChain・Vector Databaseが連携し、運用データからリアルタイムで学習。モデル性能を継続的に改善",
      metrics: ["学習サイクル 24時間", "精度向上率 月10%", "A/Bテスト自動実行"]
    }
  ];

  return (
    <section id="tech-stack" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* セクションヘッダー */}
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            技術スタック・アーキテクチャ
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
            実績のある業界標準技術と最先端イノベーションを組み合わせ、
            エンタープライズグレードの信頼性と最高性能を両立したAIエージェントシステムを提供
          </p>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-200 p-6 rounded-lg max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">99.95%</div>
                <div className="text-sm text-gray-600">システム可用性</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">&lt; 1秒</div>
                <div className="text-sm text-gray-600">平均応答時間</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">50+</div>
                <div className="text-sm text-gray-600">統合技術数</div>
              </div>
            </div>
          </div>
        </div>

        {/* 技術カテゴリ詳細 */}
        <div className="space-y-16">
          {techCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-gray-50 border border-gray-200 p-8 rounded-lg">
              <div className="text-center mb-12">
                <h3 id={category.title.toLowerCase().replace(/[^a-z0-9]/g, '-')} className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {category.title}
                </h3>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  {category.description}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {category.technologies.map((tech, techIndex) => (
                  <div key={techIndex} className="bg-white border border-gray-200 p-6 rounded-lg hover:shadow-lg transition-shadow duration-300">
                    {/* 技術名・説明 */}
                    <div className="mb-6">
                      <h4 className="text-xl font-bold text-gray-900 mb-2">
                        {tech.name}
                      </h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {tech.description}
                      </p>
                    </div>

                    {/* 技術仕様 */}
                    <div className="mb-6">
                      <h5 className="text-lg font-semibold text-gray-900 mb-3">技術仕様・性能</h5>
                      <div className="bg-gray-50 border border-gray-200 p-4 rounded">
                        <div className="grid grid-cols-1 gap-3">
                          {Object.entries(tech.specs).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center border-b border-gray-200 pb-1">
                              <span className="text-sm font-medium text-gray-700">{key}</span>
                              <span className="text-sm text-gray-600">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 主要用途 */}
                    <div>
                      <h5 className="text-lg font-semibold text-gray-900 mb-3">主要用途・適用領域</h5>
                      <ul className="space-y-1">
                        {tech.useCases.map((useCase, useCaseIndex) => (
                          <li key={useCaseIndex} className="flex items-center text-gray-700 text-sm">
                            <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {useCase}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 統合アーキテクチャ説明 */}
        <div className="mt-16 bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 text-white p-8 rounded-lg">
          <h3 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            統合アーキテクチャ・相乗効果
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {integrationBenefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <h4 className="text-xl font-semibold mb-4">{benefit.title}</h4>
                <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                  {benefit.description}
                </p>
                <ul className="space-y-1">
                  {benefit.metrics.map((metric, metricIndex) => (
                    <li key={metricIndex} className="text-cyan-400 text-sm">
                      ✓ {metric}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-lg">
            <h4 className="text-xl font-semibold mb-4 text-center">
              技術スタック間の連携フロー
            </h4>
            <div className="text-center text-sm text-gray-300 leading-relaxed">
              <p className="mb-4">
                <strong className="text-white">データ取得:</strong> Kafka・Elasticsearch・APIが外部データを収集 → 
                <strong className="text-white">前処理:</strong> TensorFlow・PyTorchで データクリーニング・特徴量抽出 → 
                <strong className="text-white">ベクトル化:</strong> OpenAI Embeddings・Vector Databaseで セマンティック検索可能化
              </p>
              <p className="mb-4">
                <strong className="text-white">推論・生成:</strong> GPT-4・Claude がLangChain・AutoGenで協調処理 → 
                <strong className="text-white">ワークフロー:</strong> Power Automate・Zapier・Airflowが業務プロセス自動実行 → 
                <strong className="text-white">監視・最適化:</strong> Kubernetes・Redis・Prometheusがシステム状態監視・自動調整
              </p>
              <p>
                この統合アーキテクチャにより、単体技術では不可能な <strong className="text-cyan-400">複雑な業務の完全自動化</strong> と 
                <strong className="text-cyan-400">継続的な性能向上</strong> を実現。
                エンタープライズ環境での <strong className="text-cyan-400">高可用性・高セキュリティ・高スケーラビリティ</strong> を保証します。
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              最先端技術で業務革新を実現
            </h3>
                                      <p className="text-lg mb-6 opacity-90 max-w-4xl mx-auto">
               {`50以上の実績技術を統合した堅牢なアーキテクチャで、
               99.95%可用性・エンタープライズセキュリティ・継続的進化を保証する
               AIエージェントシステムを構築いたします`}
             </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="#contact" 
                className="inline-block bg-white text-blue-600 px-8 py-3 font-semibold hover:bg-gray-50 transition-colors rounded"
              >
                技術詳細・アーキテクチャ相談
              </a>
              <a 
                href="#showcase" 
                className="inline-block border border-white/30 text-white px-8 py-3 font-semibold hover:bg-white/10 transition-colors rounded"
              >
                導入事例・性能指標を確認
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 