import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '技術実績・専門性 | 株式会社エヌアンドエス - AI技術の実証実績',
  description: 'AI×法律技術の融合、13法令準拠RAG、退職代行システム等の実際の開発・運営実績をご紹介。技術的専門性と信頼性をご確認ください。',
  keywords: 'AI技術実績, 13法令準拠RAG, 退職代行システム, MCPサーバー, 技術的専門性, 法律AI',
}

export default function TechnicalExpertisePage() {
  const technicalAchievements = [
    {
      id: 1,
      title: "13法令準拠RAGシステム",
      description: "労働基準法をはじめとする13の関連法令に準拠したAI検索システム",
      technology: ["RAG", "ベクトル化", "法律AI", "コンプライアンス"],
      features: [
        "労働基準法、民法等13法令の正確な検索",
        "24時間365日自動対応",
        "弁護士監修による法的妥当性",
        "リアルタイム法令更新対応"
      ],
      url: "https://taishoku-anshin-daiko.com/",
      status: "運営中"
    },
    {
      id: 2,
      title: "退職エージェントシステム",
      description: "AI技術を活用した包括的キャリア転換支援プラットフォーム",
      technology: ["AI相談", "業務自動化", "セキュリティ", "決済システム"],
      features: [
        "業界最安値2,980円での高品質サービス",
        "成功率99.9%の確実な退職実現",
        "退職〜学習〜転職〜副業まで包括支援",
        "完全秘密厳守システム"
      ],
      url: "https://taishoku-anshin-daiko.com/",
      status: "運営中"
    },
    {
      id: 3,
      title: "MCPサーバー開発",
      description: "Model Context Protocol対応の高度なAIエージェント基盤",
      technology: ["MCP", "AIエージェント", "API連携", "スケーラビリティ"],
      features: [
        "複数AIモデルの統合管理",
        "リアルタイムコンテキスト共有",
        "高パフォーマンス処理",
        "セキュアなAPI設計"
      ],
      url: "",
      status: "開発実績"
    },
    {
      id: 4,
      title: "レリバンスエンジニアリング実装",
      description: "Google AI Overviews対応のSEO・AI検索最適化",
      technology: ["構造化データ", "セマンティックHTML", "AI対応SEO"],
      features: [
        "Googleガイドライン完全準拠",
        "AIエージェント対応最適化",
        "検索順位大幅改善",
        "リッチリザルト対応"
      ],
      url: "https://nands.tech/",
      status: "実装済み"
    }
  ]

  const certifications = [
    {
      title: "弁護士監修",
      description: "顧問弁護士による法的妥当性の確保",
      icon: "⚖️"
    },
    {
      title: "労働組合連携",
      description: "専門機関との協力体制構築",
      icon: "🤝"
    },
    {
      title: "24時間365日対応",
      description: "完全自動化による継続的サービス提供",
      icon: "🕐"
    },
    {
      title: "セキュリティ対策",
      description: "最高水準のデータ保護・プライバシー保護",
      icon: "🔒"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* ヒーローセクション */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            技術実績・専門性
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            AI×法律技術の融合による実際の開発・運営実績をご紹介します。<br />
            確かな技術力と専門性で御社のDX推進をサポートします。
          </p>
        </div>
      </section>

      {/* 技術実績 */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">実際の開発・運営実績</h2>
          <div className="space-y-12">
            {technicalAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-blue-500 transition-all duration-300"
              >
                <div className="grid md:grid-cols-2 gap-8">
                  {/* 技術情報 */}
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        achievement.status === '運営中' 
                          ? 'bg-green-600 text-white' 
                          : 'bg-blue-600 text-white'
                      }`}>
                        {achievement.status}
                      </div>
                      {achievement.url && (
                        <a
                          href={achievement.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 text-sm"
                        >
                          実際のサイトを確認 →
                        </a>
                      )}
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{achievement.title}</h3>
                    <p className="text-gray-300 mb-6">{achievement.description}</p>
                    
                    <div className="mb-6">
                      <h4 className="text-blue-400 font-semibold mb-3">使用技術</h4>
                      <div className="flex flex-wrap gap-2">
                        {achievement.technology.map((tech, index) => (
                          <span
                            key={index}
                            className="bg-gray-700 px-3 py-1 rounded-full text-sm"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 特徴・機能 */}
                  <div>
                    <h4 className="text-green-400 font-semibold mb-4">主な特徴・機能</h4>
                    <ul className="space-y-3">
                      {achievement.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 信頼性・認定 */}
      <section className="py-16 px-4 bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">信頼性・認定</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {certifications.map((cert, index) => (
              <div
                key={index}
                className="bg-gray-800 rounded-xl p-6 text-center border border-gray-700 hover:border-blue-500 transition-all duration-300"
              >
                <div className="text-4xl mb-4">{cert.icon}</div>
                <h3 className="text-lg font-bold mb-2">{cert.title}</h3>
                <p className="text-gray-300 text-sm">{cert.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            実証済みの技術力で御社のDX推進をサポート
          </h2>
          <p className="text-gray-300 mb-8">
            確かな技術実績と専門性を活かし、御社に最適なAI導入プランをご提案いたします。
          </p>
          <a
            href="/corporate#contact"
            className="inline-block bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            技術相談・お問い合わせ
          </a>
        </div>
      </section>
    </div>
  )
} 