import React from 'react';

// 開発フローのステップ
const DEVELOPMENT_STEPS = [
  {
    id: 1,
    title: 'ヒアリング・要件定義',
    duration: '1-2日',
    description: 'お客様のビジネス課題と要件を詳しくヒアリング。最適なソリューションを提案します。',
    deliverables: [
      '要件定義書',
      '技術提案書',
      '開発スケジュール',
      '費用見積書'
    ],
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 2,
    title: 'システム設計・アーキテクチャ',
    duration: '2-3日',
    description: 'スケーラブルで保守性の高いシステム設計。Triple RAGアーキテクチャなど最新技術を活用。',
    deliverables: [
      'システム設計書',
      'データベース設計',
      'API設計書',
      'セキュリティ設計'
    ],
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
      </svg>
    ),
    color: 'from-green-500 to-green-600'
  },
  {
    id: 3,
    title: '開発・実装',
    duration: '1-2週間',
    description: '高速開発フレームワークとAI支援により、短期間で高品質なシステムを構築。',
    deliverables: [
      'システム本体',
      '管理画面',
      'API エンドポイント',
      'ドキュメント'
    ],
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
      </svg>
    ),
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 4,
    title: 'テスト・品質保証',
    duration: '2-3日',
    description: '自動テストと手動テストを組み合わせ、品質を徹底的に検証。',
    deliverables: [
      'テスト結果報告書',
      'パフォーマンステスト',
      'セキュリティテスト',
      'バグ修正'
    ],
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
      </svg>
    ),
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 5,
    title: 'デプロイ・運用開始',
    duration: '1日',
    description: 'クラウド環境への自動デプロイ。24時間監視体制で安定運用を開始。',
    deliverables: [
      '本番環境構築',
      '監視システム設定',
      '運用手順書',
      'サポート体制'
    ],
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
      </svg>
    ),
    color: 'from-cyan-500 to-cyan-600'
  },
  {
    id: 6,
    title: '保守・改善',
    duration: '継続',
    description: '24時間監視とAI分析により、継続的な改善とメンテナンスを提供。',
    deliverables: [
      '定期レポート',
      '改善提案',
      'バックアップ管理',
      'セキュリティ更新'
    ],
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
      </svg>
    ),
    color: 'from-red-500 to-red-600'
  }
];

// 開発の特徴
const DEVELOPMENT_FEATURES = [
  {
    title: '業界最速開発',
    description: '30分自動生成システム、求人マッチングシステムなど、独自の開発手法により従来の1/3の期間で開発',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
      </svg>
    ),
    metric: '従来の1/3'
  },
  {
    title: 'AI支援開発',
    description: 'GPT-4やRAGシステム、求人マッチングAIを活用した開発支援により、高品質・高速開発を実現',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
      </svg>
    ),
    metric: '品質向上300%'
  },
  {
    title: '24時間運用',
    description: '自動監視システムにより、24時間365日の安定運用を保証',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
      </svg>
    ),
    metric: '99.9%稼働率'
  },
  {
    title: 'コスト最適化',
    description: '自動化とクラウド技術により、運用コストを従来の1/10に削減。求人サイトでは工数90%削減を実現',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5z" clipRule="evenodd" />
      </svg>
    ),
    metric: '運用費1/10'
  }
];

const DevelopmentFlow = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
          開発フロー
        </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            効率的で透明性の高い開発プロセスにより、短期間で高品質なシステムを提供
          </p>
        </div>

        {/* 開発フローのステップ */}
        <div className="mb-20">
          <div className="relative">
            {/* 接続線（デスクトップ） */}
            <div className="hidden lg:block absolute top-20 left-0 right-0 h-0.5 bg-gray-300"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {DEVELOPMENT_STEPS.map((step, index) => (
                <div key={step.id} className="relative">
                  {/* ステップ番号（デスクトップ） */}
                  <div className="hidden lg:flex absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-white border-4 border-gray-900 items-center justify-center font-bold text-gray-900 text-lg z-10">
                    {step.id}
                  </div>
                  
                  <div className="bg-white border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 mt-8 lg:mt-12">
                    <div className="flex items-center mb-4">
                                              <div className={`w-12 h-12 bg-gray-900 border border-gray-700 flex items-center justify-center text-white text-2xl mr-4`}>
                          {step.icon}
                        </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {step.title}
                        </h3>
                        <p className="text-sm text-gray-600 font-semibold">
                          期間: {step.duration}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {step.description}
                    </p>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">成果物:</h4>
                      <ul className="space-y-1">
                        {step.deliverables.map((deliverable, idx) => (
                          <li key={idx} className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {deliverable}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 開発の特徴 */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
            エヌアンドエスの開発の特徴
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {DEVELOPMENT_FEATURES.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gray-900 border border-gray-700 flex items-center justify-center text-white text-2xl mx-auto mb-4">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h4>
                <p className="text-gray-600 mb-3 leading-relaxed">
                  {feature.description}
                </p>
                <div className="inline-block px-3 py-1 bg-gray-100 text-gray-800 border border-gray-300 text-sm font-semibold">
                  {feature.metric}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 開発期間と費用の目安 */}
        <div className="bg-white border border-gray-200 p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            開発期間と費用の目安
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center border-r border-gray-200 last:border-r-0">
              <div className="text-3xl font-bold text-gray-900 mb-2">1-2週間</div>
              <div className="text-lg font-semibold text-gray-900 mb-2">チャットボット</div>
              <div className="text-gray-600">
                GPT-4 API連携<br />
                24時間自動応答<br />
                多言語対応
              </div>
              <div className="mt-4 text-xl font-bold text-gray-900">40万円〜</div>
            </div>
            
            <div className="text-center border-r border-gray-200 last:border-r-0">
              <div className="text-3xl font-bold text-gray-900 mb-2">2-3週間</div>
              <div className="text-lg font-semibold text-gray-900 mb-2">求人マッチングシステム</div>
              <div className="text-gray-600">
                AI求人推薦エンジン<br />
                自動スクリーニング<br />
                リアルタイム分析
              </div>
              <div className="mt-4 text-xl font-bold text-gray-900">80万円〜</div>
            </div>
            
            <div className="text-center border-r border-gray-200 last:border-r-0">
              <div className="text-3xl font-bold text-gray-900 mb-2">2-3週間</div>
              <div className="text-lg font-semibold text-gray-900 mb-2">Python Webアプリ</div>
              <div className="text-gray-600">
                Django・機械学習<br />
                データ可視化<br />
                API構築
              </div>
              <div className="mt-4 text-xl font-bold text-gray-900">90万円〜</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">3-4週間</div>
              <div className="text-lg font-semibold text-gray-900 mb-2">フルスタックシステム</div>
              <div className="text-gray-600">
                React・Next.js<br />
                Node.js API<br />
                データベース設計
              </div>
              <div className="mt-4 text-xl font-bold text-gray-900">120万円〜</div>
            </div>
          </div>
          
          <div className="text-center mt-8 p-4 bg-gray-50 border border-gray-200">
            <p className="text-gray-800 font-semibold">
              ※ 具体的な要件により費用は変動します。無料相談でお見積もりいたします。
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            開発のご相談・お見積もり
          </h3>
          <p className="text-gray-600 mb-8">
            お客様の要件に合わせた最適なソリューションを無料でご提案いたします
          </p>
          <a
            href="#consultation-section"
            className="inline-block px-8 py-4 bg-blue-600 text-white font-bold border border-blue-700 hover:bg-blue-700 transition-all duration-300 shadow-lg"
          >
            無料相談・お見積もり
          </a>
        </div>
      </div>
    </section>
  );
};

export default DevelopmentFlow; 