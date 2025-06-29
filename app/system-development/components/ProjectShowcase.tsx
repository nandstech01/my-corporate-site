import React from 'react';

// 実際の開発プロジェクト実績
const PROJECTS = [
  {
    id: 'relevance-engineering-system',
    title: 'レリバンスエンジニアリング実装',
    subtitle: 'AI検索最適化（AIO対策）システム',
    description: 'Mike King理論に基づくレリバンスエンジニアリングの実装。AI検索エンジン（ChatGPT、Perplexity、Google SGE）に最適化されたコンテンツ生成と関連性スコアリングシステム。',
    technologies: ['レリバンスエンジニアリング', 'AIO対策', 'AI検索最適化', 'コンテキスト理解', 'セマンティック検索'],
    achievements: [
      'AI検索での上位表示実現',
      'ユーザー意図の高精度理解',
      'コンテキスト最適化による関連性向上',
      'マルチAI対応（ChatGPT/Perplexity/SGE）'
    ],
    metrics: {
      developmentTime: '3週間',
      aiSearchRanking: 'Top 3',
      relevanceScore: '98.2%',
      contextAccuracy: '96.8%'
    },
    status: '運用中',
    url: '',
    image: '/images/default-post.jpg'
  },
  {
    id: 'hr-support-ai-system',
    title: '人事支援AIシステム',
    subtitle: '業界最安値サービスを実現',
    description: '13法令準拠RAGシステムと24時間対応AIチャットボットにより、業界最安値での人事支援サービスを実現。Triple RAGアーキテクチャによる高精度な労務相談対応。',
    technologies: ['Triple RAG', 'e-Gov API', 'DALLE-3', 'o1-mini', 'ベクトル検索'],
    achievements: [
      '業界最安値価格帯を実現',
      '24時間365日自動対応',
      '13法令完全準拠',
      '30分間隔自動更新'
    ],
    metrics: {
      developmentTime: '2週間',
      operationTime: '24時間365日',
      accuracy: '99.7%',
      cost: '従来の1/10'
    },
    status: '運用中',
    url: '',
    image: '/images/default-post.jpg'
  },
  {
    id: 'legal-rag-system',
    title: '13法令準拠RAGシステム',
    subtitle: '372項目法律データベース統合',
    description: 'e-Gov法令APIと連携し、民法627条・労働基準法など13法令に完全準拠したRAGシステム。弁護士監修による法的根拠の確実性を担保。',
    technologies: ['RAG', 'Vector DB', 'e-Gov API', 'FastAPI', 'PostgreSQL'],
    achievements: [
      '372項目法令データベース構築',
      'リアルタイム法令更新',
      '弁護士監修による法的保証',
      'API連携による自動同期'
    ],
    metrics: {
      developmentTime: '3週間',
      dataPoints: '372項目',
      accuracy: '99.9%',
      updateFrequency: 'リアルタイム'
    },
    status: '運用中',
    url: '',
    image: '/images/default-post.jpg'
  },
  {
    id: 'auto-content-system',
    title: '30分自動生成システム',
    subtitle: 'Triple RAGによる高精度コンテンツ生成',
    description: 'Google Sheetsスケジューラーと連携した自動コンテンツ生成システム。Triple RAGアーキテクチャにより、法律・実体験・企業データを統合した高品質記事を30分間隔で生成。',
    technologies: ['Google Sheets API', 'Triple RAG', 'DALLE-3', 'SEO最適化', 'レスポンシブ対応'],
    achievements: [
      '30分間隔での自動生成',
      '5000-7000文字の高品質記事',
      'SEO最適化（Mike King理論）',
      '無限拡張自己学習システム'
    ],
    metrics: {
      developmentTime: '1週間',
      generationInterval: '30分',
      articleLength: '5000-7000文字',
      seoScore: '95%+'
    },
    status: '稼働中',
    url: '',
    image: '/images/default-post.jpg'
  },
  {
    id: 'job-matching-system',
    title: '求人マッチングシステム',
    subtitle: 'AI求人推薦・自動スクリーニング',
    description: 'AIを活用した高精度求人マッチングシステム。候補者のスキル・経験をベクトル化し、企業要件との適合度を自動算出。スクリーニング工数を90%削減。',
    technologies: ['求人マッチングAI', 'スキルベクトル化', '自動スクリーニング', 'レコメンドエンジン', 'リアルタイム分析'],
    achievements: [
      'マッチング精度95%以上を実現',
      'スクリーニング工数90%削減',
      '候補者満足度向上（4.8/5.0）',
      '企業採用効率3倍向上'
    ],
    metrics: {
      developmentTime: '3週間',
      matchingAccuracy: '95.2%',
      processingSpeed: '即時',
      costReduction: '工数90%削減'
    },
    status: '運用中',
    url: '',
    image: '/images/default-post.jpg'
  },
  {
    id: 'chatbot-system',
    title: 'AI チャットボットシステム',
    subtitle: '24時間自動応答・多言語対応',
    description: 'GPT-4を活用した高度なチャットボットシステム。自然言語処理により人間らしい対話を実現。カスタマーサポートの自動化で対応工数を80%削減。',
    technologies: ['GPT-4 API', 'WebSocket', 'Node.js', 'React', 'MongoDB'],
    achievements: [
      '24時間自動応答システム',
      '多言語対応（日英中韓）',
      'カスタマーサポート業務効率化',
      '高品質サポート以上を維持'
    ],
    metrics: {
      developmentTime: '2週間',
      responseTime: '<1秒',
      accuracy: '96.8%',
      costReduction: '業務効率化'
    },
    status: '運用中',
    url: '',
    image: '/images/default-post.jpg'
  },
  {
    id: 'webapp-python-system',
    title: 'Python Webアプリケーション',
    subtitle: 'Django・機械学習・データ可視化',
    description: 'PythonのDjangoフレームワークを使用したWebアプリケーション。機械学習モデルと連携し、リアルタイムデータ分析・可視化を実現。技術力を証明する実装事例。',
    technologies: ['Python', 'Django', 'PostgreSQL', 'scikit-learn', 'Pandas', 'Chart.js'],
    achievements: [
      'Django RESTful API構築',
      '機械学習モデル統合',
      'リアルタイムデータ可視化',
      'パフォーマンス最適化'
    ],
    metrics: {
      developmentTime: '3週間',
      dataProcessing: '10万件/分',
      accuracy: '94.2%',
      performance: '応答時間200ms'
    },
    status: '運用中',
    url: '',
    image: '/images/default-post.jpg'
  },
  {
    id: 'enterprise-entity-db',
    title: '企業エンティティデータベース',
    subtitle: '111社データ統合ベクトル検索',
    description: '111社の企業データを統合したベクトル検索システム。ユーザーケース実体験データと組み合わせ、パーソナライズされた情報提供を実現。',
    technologies: ['Vector Search', 'Entity Recognition', 'データ統合', 'リアルタイム検索'],
    achievements: [
      '111社企業データベース構築',
      'ユーザーケース実体験統合',
      '高速ベクトル検索実装',
      'パーソナライズ対応'
    ],
    metrics: {
      developmentTime: '2週間',
      entities: '111社',
      searchSpeed: '<100ms',
      accuracy: '98.5%'
    },
    status: '運用中',
    url: '',
    image: '/images/default-post.jpg'
  }
];

const ProjectShowcase = () => {
  return (
    <section id="project-showcase" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            開発実績
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            業界最速・最安値を実現する実際のシステム開発プロジェクト
          </p>
        </div>

        <div className="space-y-16">
          {PROJECTS.map((project, index) => (
            <div
              key={project.id}
              className={`flex flex-col ${
                index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              } items-center gap-12`}
            >
              {/* プロジェクト画像 */}
              <div className="w-full lg:w-1/2">
                <div className="relative overflow-hidden shadow-2xl border border-gray-200">
                  <div className="aspect-video bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="text-6xl mb-4">
                        {project.id === 'relevance-engineering-system' && (
                          <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        {project.id === 'hr-support-ai-system' && (
                          <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                          </svg>
                        )}
                        {project.id === 'legal-rag-system' && (
                          <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
                          </svg>
                        )}
                        {project.id === 'auto-content-system' && (
                          <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                          </svg>
                        )}
                        {project.id === 'job-matching-system' && (
                          <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                          </svg>
                        )}
                        {project.id === 'chatbot-system' && (
                          <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" />
                          </svg>
                        )}
                        {project.id === 'webapp-python-system' && (
                          <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                        {project.id === 'enterprise-entity-db' && (
                          <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                          </svg>
                        )}
                      </div>
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold">{project.title}</h3>
                      <p className="text-blue-100 mt-2">{project.subtitle}</p>
                    </div>
                  </div>
                  {project.status && (
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-green-600 text-white text-sm font-medium border border-green-700">
                        {project.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* プロジェクト詳細 */}
              <div className="w-full lg:w-1/2">
                <div className="mb-6">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2">
                    {project.title}
                  </h3>
                  <p className="text-xl text-blue-600 font-semibold mb-4">
                    {project.subtitle}
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* 技術スタック */}
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-3">使用技術</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium border border-gray-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 主な成果 */}
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-3">主な成果</h4>
                  <ul className="space-y-2">
                    {project.achievements.map((achievement, idx) => (
                      <li key={idx} className="flex items-start">
                        <svg
                          className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-700">{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* メトリクス */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {Object.entries(project.metrics).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 border border-gray-200 p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {value}
                      </div>
                      <div className="text-sm text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* URL（もしあれば） */}
                {project.url && (
                  <div>
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold border border-gray-200 hover:bg-blue-700 transition-colors"
                    >
                      実際のサイトを見る
                      <svg
                        className="w-4 h-4 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            同様のシステム開発をご希望ですか？
          </h3>
          <p className="text-gray-600 mb-8">
            業界最速・最安値でのシステム開発について無料相談を承ります
          </p>
          <a
            href="#consultation-section"
            className="inline-block px-8 py-4 bg-blue-600 text-white font-bold border border-blue-700 hover:bg-blue-700 transition-all duration-300 shadow-lg"
          >
            無料相談を申し込む
          </a>
        </div>
      </div>
    </section>
  );
};

export default ProjectShowcase; 