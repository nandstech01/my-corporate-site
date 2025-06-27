export default function VectorRagTechStack() {
  const techCategories = [
    {
      title: "AI・機械学習技術",
      technologies: [
        "OpenAI Embeddings",
        "Sentence Transformers", 
        "BERT",
        "GPT-4",
        "Claude API",
        "自然言語処理"
      ]
    },
    {
      title: "ベクトルデータベース",
      technologies: [
        "Pinecone",
        "Chroma",
        "Weaviate", 
        "Qdrant",
        "Milvus",
        "Elasticsearch"
      ]
    },
    {
      title: "開発フレームワーク",
      technologies: [
        "Python",
        "FastAPI",
        "LangChain",
        "LlamaIndex",
        "Streamlit",
        "Next.js"
      ]
    },
    {
      title: "データ処理・変換",
      technologies: [
        "PyPDF2",
        "Unstructured",
        "Apache Tika",
        "Pandas",
        "NumPy",
        "Hugging Face"
      ]
    },
    {
      title: "インフラ・運用",
      technologies: [
        "AWS",
        "Docker",
        "Kubernetes",
        "Redis",
        "PostgreSQL",
        "Monitoring"
      ]
    }
  ]

  const performanceMetrics = [
    {
      metric: "検索精度",
      value: "95%",
      description: "意味的類似性による高精度検索"
    },
    {
      metric: "応答速度",
      value: "<200ms",
      description: "リアルタイム検索・回答生成"
    },
    {
      metric: "同時処理",
      value: "1000+",
      description: "大規模並行アクセス対応"
    },
    {
      metric: "稼働率",
      value: "99.9%",
      description: "高可用性システム設計"
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* セクションヘッダー */}
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            技術スタック・アーキテクチャ
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            最新のAI技術とエンタープライズグレードのインフラで、高性能なRAGシステムを構築
          </p>
        </div>

        {/* パフォーマンス指標 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          {performanceMetrics.map((item, index) => (
            <div key={index} className="text-center bg-gradient-to-br from-blue-50 to-purple-50 border border-gray-200 p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">{item.value}</div>
              <div className="text-lg font-semibold text-gray-900 mb-1">{item.metric}</div>
              <div className="text-sm text-gray-600">{item.description}</div>
            </div>
          ))}
        </div>

        {/* 技術スタック */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {techCategories.map((category, index) => (
            <div key={index} className="bg-gray-50 border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
                {category.title}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {category.technologies.map((tech, techIndex) => (
                  <div key={techIndex} className="bg-white border border-gray-200 px-3 py-2 text-center text-sm font-medium text-gray-700">
                    {tech}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* アーキテクチャ特徴 */}
        <div className="bg-gray-900 text-white p-8 md:p-12 border border-gray-200">
          <h3 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            システムアーキテクチャの特徴
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xl font-semibold mb-4 text-blue-400">スケーラブル設計</h4>
              <ul className="space-y-2 text-gray-300">
                <li>• マイクロサービスアーキテクチャ採用</li>
                <li>• 水平スケーリング対応</li>
                <li>• 負荷分散・冗長化構成</li>
                <li>• クラウドネイティブ設計</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-xl font-semibold mb-4 text-purple-400">セキュリティ・運用</h4>
              <ul className="space-y-2 text-gray-300">
                <li>• エンドツーエンド暗号化</li>
                <li>• アクセス制御・認証機能</li>
                <li>• 監視・ログ管理システム</li>
                <li>• 自動バックアップ・復旧</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-xl font-semibold mb-4 text-green-400">AI・機械学習</h4>
              <ul className="space-y-2 text-gray-300">
                <li>• 最新の埋め込みモデル活用</li>
                <li>• 継続学習・モデル更新</li>
                <li>• 多言語対応・カスタマイズ</li>
                <li>• A/Bテスト・性能最適化</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-xl font-semibold mb-4 text-yellow-400">統合・カスタマイズ</h4>
              <ul className="space-y-2 text-gray-300">
                <li>• 既存システムとのAPI連携</li>
                <li>• カスタムUI・UX設計</li>
                <li>• 多様なデータソース対応</li>
                <li>• 段階的導入・移行支援</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-lg text-gray-600 mb-6">
            技術的な詳細やアーキテクチャについて、詳しくご説明いたします
          </p>
          <a 
            href="#contact" 
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 border border-gray-200 font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            技術相談を申し込む
          </a>
        </div>
      </div>
    </section>
  )
} 