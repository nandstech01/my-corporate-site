export default function AIAgentServicesSection() {
  const services = [
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: "対話型AIエージェント",
      description: "GPT-4 Turbo・Claude 3.5 Sonnetを活用した高度な自然言語処理技術により、人間と自然な対話を実現するAIエージェントシステム。顧客対応から社内業務支援まで幅広く自動化し、24時間365日途切れることなく稼働します。",
      detailedDescription: "最先端のトランスフォーマーアーキテクチャとLangChainフレームワークを組み合わせることで、文脈理解精度98%以上を実現。多階層の意図解析システムにより、曖昧な表現や複雑な要求も正確に処理します。感情認識エンジンとパーソナライゼーション機能により、個々のユーザーに最適化された応答を生成。リアルタイム学習機能により、対話を重ねるごとに精度が向上し続けます。",
      features: [
        "GPT-4 Turbo・Claude 3.5統合による高精度自然言語理解",
        "文脈保持機能（最大100ターンの会話履歴）",
        "17言語対応のマルチリンガル自動翻訳",
        "感情認識・トーン分析による適応的応答",
        "リアルタイム学習・パーソナライゼーション",
        "セキュアAPI統合による外部システム連携"
      ],
      technicalSpecs: {
        "処理性能": "1秒以内レスポンス（95%信頼区間）",
        "精度": "意図理解98.3%、応答適切性96.7%",
        "可用性": "99.95%（SLA保証）",
        "セキュリティ": "エンタープライズグレード暗号化"
      },
      useCases: [
        "金融機関の24時間顧客サポート自動化",
        "ECサイトの多言語カスタマーサービス",
        "人事部門の社内問い合わせ自動対応",
        "医療機関の予約・相談業務支援"
      ]
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      title: "ナレッジベースエージェント",
      description: "RAGシステム（検索拡張生成）とベクトル検索技術を組み合わせた革新的な知識管理AIエージェント。企業の膨大な情報資産を瞬時に検索・分析し、最適な回答を生成します。",
      detailedDescription: "OpenAI Embeddings・Pinecone・Chromaを活用したマルチベクトル検索により、セマンティック検索精度99.2%を実現。文書、画像、音声、動画を統合したマルチモーダル知識ベース構築が可能です。増分学習アルゴリズムにより、新規データの追加時も既存知識との整合性を保持。知識グラフ技術との統合により、関連情報の自動発見と推論を実現します。",
      features: [
        "マルチベクトル検索エンジン（セマンティック・キーワード・ハイブリッド）",
        "RAGシステム統合（検索拡張生成）",
        "リアルタイム増分学習・知識更新",
        "マルチモーダル対応（テキスト・画像・音声・動画）",
        "セマンティック検索（意味理解による高精度検索）",
        "知識グラフ統合による関連情報自動発見"
      ],
      technicalSpecs: {
        "検索精度": "セマンティック検索99.2%",
        "処理速度": "平均応答時間0.3秒",
        "データ容量": "最大10TB知識ベース対応",
        "更新頻度": "リアルタイム増分更新"
      },
      useCases: [
        "法律事務所の法令・判例検索システム",
        "製薬会社の研究論文・特許情報管理",
        "IT企業の技術文書・API仕様管理",
        "教育機関の学習コンテンツ検索システム"
      ]
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      title: "ワークフロー自動化エージェント",
      description: "Microsoft Power Automate・Zapier・独自開発エンジンを統合した包括的なワークフロー自動化システム。複雑な業務プロセスを分析し、判断を伴う作業も含めて完全自動化します。",
      detailedDescription: "プロセスマイニング技術により既存業務フローを自動分析し、最適化ポイントを特定。RPA（Robotic Process Automation）とAI判断エンジンを組み合わせることで、従来困難だった例外処理や複雑な判断業務も自動化。エラーハンドリング機能により、予期しない状況にも柔軟に対応し、人間への適切なエスカレーションを実行します。",
      features: [
        "プロセスマイニングによる業務フロー自動分析",
        "AI判断エンジンによる条件分岐・例外処理",
        "RPA統合による物理操作自動化",
        "外部システムAPI連携（Salesforce・SAP・Slack等）",
        "インテリジェントエラーハンドリング・復旧機能",
        "リアルタイムモニタリング・パフォーマンス分析"
      ],
      technicalSpecs: {
        "自動化精度": "97.8%（例外処理含む）",
        "処理速度": "人手の15倍高速化",
        "稼働率": "99.8%（自動復旧機能付き）",
        "統合可能システム": "200+のAPI・RPA対応"
      },
      useCases: [
        "経理部門の請求書処理・仕訳自動化",
        "人事採用プロセスの書類選考・面接調整",
        "営業部門の見積作成・受注処理自動化",
        "製造業の受発注・在庫管理自動化"
      ]
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: "データ分析エージェント",
      description: "機械学習・深層学習アルゴリズムを活用した高度なデータ分析システム。予測分析・異常検知・パターン認識により、ビジネスインサイトを自動抽出し、戦略的意思決定を支援します。",
      detailedDescription: "TensorFlow・PyTorch・scikit-learnを統合したMLOpsパイプラインにより、データ前処理からモデル学習、デプロイメントまでを自動化。時系列分析・クラスタリング・分類・回帰など多様な分析手法を組み合わせ、複合的な問題解決を実現。説明可能AI（XAI）技術により、分析結果の根拠を明確に提示し、ビジネス担当者の理解と信頼を促進します。",
      features: [
        "機械学習・深層学習による予測分析（精度95%以上）",
        "リアルタイム異常検知システム（偽陽性率1%以下）",
        "パターン認識・クラスタリング分析",
        "時系列分析・トレンド予測",
        "説明可能AI（XAI）による結果解釈",
        "自動レポート生成・ダッシュボード連携"
      ],
      technicalSpecs: {
        "予測精度": "時系列予測95.4%、分類98.1%",
        "処理速度": "大容量データ（10GB）を30分で分析",
        "データ形式": "CSV・JSON・SQL・NoSQL対応",
        "可視化": "Tableau・Power BI・独自ダッシュボード"
      },
      useCases: [
        "小売業の需要予測・在庫最適化",
        "金融機関のリスク分析・信用スコアリング",
        "製造業の品質管理・予知保全",
        "マーケティング部門の顧客行動分析・セグメンテーション"
      ]
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: "学習型エージェント",
      description: "継続的学習（Continual Learning）機能を持つアダプティブなAIエージェント。使用するほど精度が向上し、組織特有の業務パターンや知識を自動学習して最適化します。",
      detailedDescription: "フェデレーテッドラーニング・オンライン学習・メタラーニング技術を組み合わせた革新的な継続学習システム。カタストロフィック・フォーゲッティング（破滅的忘却）を防ぎながら新規知識を継続的に獲得。強化学習アルゴリズムにより、ユーザーのフィードバックから最適な行動戦略を学習し、パフォーマンスを段階的に向上させます。",
      features: [
        "継続学習（Continual Learning）・メタラーニング",
        "フェデレーテッドラーニングによるプライバシー保護学習",
        "強化学習による最適戦略自動獲得",
        "パフォーマンス自動最適化・A/Bテスト統合",
        "カタストロフィック・フォーゲッティング対策",
        "適応型アルゴリズム・ハイパーパラメータ自動調整"
      ],
      technicalSpecs: {
        "学習効率": "新規データで10%精度向上（平均）",
        "適応速度": "環境変化に24時間以内で対応",
        "メモリ効率": "過去知識を95%以上保持",
        "学習方式": "オンライン・バッチ・強化学習対応"
      },
      useCases: [
        "コールセンターの応答品質継続改善",
        "ECサイトのレコメンデーション精度向上",
        "営業支援システムの提案精度最適化",
        "品質管理システムの検査精度向上"
      ]
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: "セキュリティエージェント",
      description: "AI技術を活用したサイバーセキュリティ監視・対応システム。リアルタイムで脅威を検知し、自動対処と人間への適切なエスカレーションを実行する次世代セキュリティシステムです。",
      detailedDescription: "SIEM（Security Information and Event Management）・SOAR（Security Orchestration, Automation and Response）と連携した包括的なセキュリティ自動化プラットフォーム。機械学習による異常検知、振る舞い分析、脅威インテリジェンス統合により、未知の攻撃パターンも検出。ゼロトラスト・アーキテクチャに対応し、継続的なリスク評価と動的アクセス制御を実現します。",
      features: [
        "AI脅威検知エンジン（未知攻撃97%検出）",
        "SIEM・SOAR統合による自動対応",
        "振る舞い分析・ユーザー行動監視",
        "脅威インテリジェンス・IOC自動更新",
        "インシデント管理・フォレンジック支援",
        "ゼロトラスト・セキュリティ統合"
      ],
      technicalSpecs: {
        "検知精度": "既知脅威99.8%、未知脅威97.2%",
        "応答時間": "脅威検知から1分以内対応",
        "誤検知率": "0.1%以下（機械学習最適化）",
        "監視範囲": "ネットワーク・エンドポイント・クラウド統合"
      },
      useCases: [
        "金融機関のサイバー攻撃対策・コンプライアンス",
        "製造業の産業制御システム（ICS）保護",
        "医療機関の患者データ保護・HIPAA準拠",
        "政府機関・自治体の機密情報保護"
      ]
    }
  ];

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* セクションヘッダー */}
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            AIエージェントサービス詳細
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            最先端のAI技術と実績のあるフレームワークを組み合わせ、業界特有の課題を解決する
            カスタマイズ型AIエージェントシステムを提供いたします
          </p>
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg max-w-4xl mx-auto">
            <p className="text-blue-800 text-sm">
              <strong>技術基盤：</strong> GPT-4 Turbo・Claude 3.5 Sonnet・LangChain・AutoGen・Vector Database・
              RAGシステム・機械学習・強化学習・フェデレーテッドラーニングを統合
            </p>
          </div>
        </div>

        {/* サービス詳細グリッド */}
        <div className="space-y-16">
          {services.map((service, index) => (
            <div key={index} className="bg-white border border-gray-200 overflow-hidden">
              <div className="p-8 md:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* 左側：アイコン・タイトル・基本説明 */}
                  <div className="lg:col-span-5">
                    <div className="text-blue-600 mb-6">
                      {service.icon}
                    </div>
                    
                    <h3 id={service.title.toLowerCase().replace(/[^a-z0-9]/g, '-')} className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                      {service.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {service.description}
                    </p>

                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">技術詳細</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {service.detailedDescription}
                      </p>
                    </div>
                  </div>

                  {/* 右側：機能・仕様・ユースケース */}
                  <div className="lg:col-span-7">
                    {/* 主要機能 */}
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">主要機能・特徴</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {service.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start text-gray-700 text-sm">
                            <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 技術仕様 */}
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">技術仕様・性能指標</h4>
                      <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(service.technicalSpecs).map(([key, value]) => (
                            <div key={key} className="border-b border-gray-200 pb-2">
                              <div className="text-sm font-medium text-gray-700">{key}</div>
                              <div className="text-sm text-gray-600">{value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 導入事例・ユースケース */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">主要導入事例・ユースケース</h4>
                      <ul className="space-y-2">
                        {service.useCases.map((useCase, useCaseIndex) => (
                          <li key={useCaseIndex} className="flex items-start text-gray-700 text-sm">
                            <svg className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                            {useCase}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 統合ソリューション説明 */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-200 p-8 rounded-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            統合AIエージェントソリューション
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">リアルタイム処理</h4>
              <p className="text-gray-600 text-sm">
                最適化されたマルチスレッド・非同期処理により、
                複数のAIエージェントが並列動作し、秒単位でのレスポンスを実現
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">エンタープライズセキュリティ</h4>
              <p className="text-gray-600 text-sm">
                ISO27001・SOC2準拠の包括的セキュリティ体制。
                ゼロトラスト・アーキテクチャで機密データを完全保護
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">継続的進化</h4>
              <p className="text-gray-600 text-sm">
                フェデレーテッドラーニング・メタラーニングにより、
                使用データから継続的に学習し、精度を自動向上
              </p>
            </div>
          </div>

          <div className="text-center">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              複数エージェントの連携による相乗効果
            </h4>
            <p className="text-gray-600 max-w-4xl mx-auto mb-6">
              対話型エージェントが顧客要求を理解 → ナレッジベースエージェントが最適情報を検索 → 
              ワークフローエージェントが処理を自動実行 → データ分析エージェントが結果を分析 → 
              学習型エージェントが全体プロセスを最適化。この連携により、
              単体では実現困難な複雑な業務の完全自動化を実現します。
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 border border-gray-200">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              AIエージェントで業務革新を実現
            </h3>
            <p className="text-lg mb-6 opacity-90 max-w-3xl mx-auto">
              24時間365日稼働する高精度自動化システムを実現する
              カスタマイズ型AIエージェントシステムで、御社の業務効率を次のレベルへ押し上げます
            </p>
            <a 
              href="#contact" 
              className="inline-block bg-white text-blue-600 px-8 py-3 border border-gray-200 font-semibold hover:bg-gray-50 transition-colors"
            >
              無料相談・デモンストレーションを申し込む
            </a>
          </div>
        </div>
      </div>
    </section>
  );
} 