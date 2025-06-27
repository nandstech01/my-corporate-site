export default function MCPShowcase() {
  const caseStudies = [
    {
      industry: "フィンテック企業",
      title: "金融データ統合MCPサーバー",
      challenge: "複数の金融APIとAIシステムを連携させ、リアルタイムでの取引分析と意思決定支援システムの構築が必要だった。",
      solution: "MCP Protocolを活用した統合サーバーを構築。複数の金融データソースとAI分析エンジンをシームレスに連携。",
      results: [
        "データ処理速度99%向上",
        "API統合コスト大幅削減",
        "リアルタイム分析実現",
        "システム安定性向上"
      ],
      metrics: {
        performance: "99%",
        availability: "99.9%",
        latency: "10ms"
      }
    },
    {
      industry: "ヘルスケア",
      title: "医療情報連携MCPサーバー",
      challenge: "病院内の複数システムと外部医療データベースを安全に連携し、AI診断支援システムとの統合が課題だった。",
      solution: "セキュリティ強化されたMCPサーバーを開発。HIPAA準拠の暗号化通信と厳格なアクセス制御を実装。",
      results: [
        "診断精度向上",
        "データ連携時間短縮",
        "セキュリティ強化",
        "運用効率化"
      ],
      metrics: {
        performance: "95%",
        availability: "99.8%",
        latency: "15ms"
      }
    },
    {
      industry: "製造業",
      title: "IoT・AI統合MCPサーバー",
      challenge: "工場内のIoTデバイスからのデータ収集と、AI予測分析システムとの連携による予知保全システムの構築。",
      solution: "大量データ処理に最適化されたMCPサーバーを構築。リアルタイムストリーミングと機械学習パイプラインを統合。",
      results: [
        "予知保全精度向上",
        "ダウンタイム削減",
        "保守コスト削減",
        "生産性向上"
      ],
      metrics: {
        performance: "97%",
        availability: "99.5%",
        latency: "5ms"
      }
    }
  ];

  const overallMetrics = [
    {
      label: "平均応答時間",
      value: "10",
      unit: "ms"
    },
    {
      label: "平均稼働率",
      value: "99.7",
      unit: "%"
    },
    {
      label: "平均処理性能向上",
      value: "97",
      unit: "%"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* セクションヘッダー */}
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            導入事例・実績
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            様々な業界でMCPサーバーを導入し、システム連携の課題を解決しています
          </p>
        </div>

        {/* 全体実績 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {overallMetrics.map((metric, index) => (
            <div key={index} className="bg-white border border-gray-200 p-6 text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                {metric.value}<span className="text-2xl text-gray-500">{metric.unit}</span>
              </div>
              <div className="text-gray-700 font-medium">{metric.label}</div>
            </div>
          ))}
        </div>

        {/* 導入事例 */}
        <div className="space-y-12">
          {caseStudies.map((study, index) => (
            <div key={index} className="bg-white border border-gray-200 overflow-hidden">
              <div className="p-8 md:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* 左側：業界・タイトル・課題 */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center mb-4">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 text-sm font-medium border border-blue-200">
                        {study.industry}
                      </span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                      {study.title}
                    </h3>
                    
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">課題</h4>
                      <p className="text-gray-600 leading-relaxed">{study.challenge}</p>
                    </div>
                    
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">ソリューション</h4>
                      <p className="text-gray-600 leading-relaxed">{study.solution}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">効果・成果</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {study.results.map((result, resultIndex) => (
                          <li key={resultIndex} className="flex items-center">
                            <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-700">{result}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* 右側：技術指標 */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-gray-200 p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-6 text-center">技術指標</h4>
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-1">{study.metrics.performance}</div>
                        <div className="text-sm text-gray-600">性能向上</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-1">{study.metrics.availability}</div>
                        <div className="text-sm text-gray-600">稼働率</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-1">{study.metrics.latency}</div>
                        <div className="text-sm text-gray-600">応答時間</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 技術的優位性 */}
        <div className="mt-16 bg-white border border-gray-200 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            MCPサーバーの技術的優位性
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">高速処理</h4>
              <p className="text-sm text-gray-600">最適化されたプロトコルによる低レイテンシー通信</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">スケーラビリティ</h4>
              <p className="text-sm text-gray-600">負荷に応じた自動スケーリング機能</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">セキュリティ</h4>
              <p className="text-sm text-gray-600">エンタープライズレベルの暗号化通信</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">柔軟性</h4>
              <p className="text-sm text-gray-600">多様なシステムとの統合対応</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 border border-gray-200">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              あなたの業界でも同様の成果を実現
            </h3>
            <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
              業界特有の要件に合わせたMCPサーバーで、システム連携の課題を解決いたします
            </p>
            <a 
              href="#contact" 
              className="inline-block bg-white text-blue-600 px-8 py-3 border border-gray-200 font-semibold hover:bg-gray-50 transition-colors"
            >
              導入相談を申し込む
            </a>
          </div>
        </div>
      </div>
    </section>
  );
} 