import React from 'react';

/**
 * =========================================================
 * HRHeroSectionSSR.tsx - HR Solutions専用【完全版】
 *
 * Mike King理論準拠: AI検索エンジン最適化
 * - SSRでコンテンツ認識可能
 * - 構造化データ完備
 * - GEO対策（生成系検索最適化）
 * - レリバンスエンジニアリング
 * - LLMO完全対応
 * - HR業界特化設計
 * 
 * 【戦略】
 * ✅ 人材マッチング特化
 * ✅ AI活用アピール
 * ✅ DX効果訴求
 * ✅ 実績数値強調
 * ✅ Fragment ID対応
 * ---------------------------------------------------------
 */

// HR Solutions構造化データ（Mike King理論準拠）
const hrSolutionsSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": "https://nands.tech/hr-solutions#software",
  "name": "AI人材ソリューション",
  "description": "求人サイト構築からAIマッチング、書類自動生成まで。人材業界のDXを包括的にサポートする総合ソリューション。マッチング精度95%向上、業務効率80%改善を実現。",
  "url": "https://nands.tech/hr-solutions",
  "applicationCategory": "HumanResourcesApplication",
  "operatingSystem": "Web Browser",
  "provider": {
    "@type": "Organization",
    "@id": "https://nands.tech/#organization"
  },
  "offers": {
    "@type": "Offer",
    "name": "AI人材ソリューション導入支援",
    "description": "求人サイト構築、AIマッチングエンジン、書類自動生成システムの包括的導入支援",
    "priceCurrency": "JPY",
    "availability": "https://schema.org/InStock"
  },
  "featureList": [
    "AIマッチングエンジン",
    "求人サイト構築",
    "書類自動生成",
    "レコメンド機能",
    "24/7自動化サポート",
    "人材データ分析"
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "bestRating": "5",
    "worstRating": "1",
    "ratingCount": 147
  },
  "potentialAction": {
    "@type": "ContactAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://nands.tech/hr-solutions#contact"
    }
  }
};

// HR業界向け統計データ（GEO対策）
const HR_STATISTICS = [
  {
    id: "matching-accuracy",
    value: "95%",
    label: "マッチング精度向上",
    description: "AI分析により候補者と企業のマッチング精度を95%まで向上",
    color: "text-blue-400"
  },
  {
    id: "efficiency-improvement", 
    value: "80%",
    label: "業務効率化",
    description: "自動化により採用業務の効率を80%向上",
    color: "text-cyan-400"
  },
  {
    id: "automation-support",
    value: "24/7",
    label: "自動化サポート",
    description: "365日24時間体制での自動マッチング・レコメンド機能",
    color: "text-blue-400"
  }
];

export default function HRHeroSectionSSR() {
  return (
    <>
      {/* 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hrSolutionsSchema) }}
      />

      <section 
        id="hr-hero"
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32"
      >
        {/* 背景グラデーション */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900" />
        
        {/* 装飾的な背景要素（アニメーション対応） */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* メインタイトル（GEO対策: Explain-Then-List構造） */}
          <header>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                AI人材ソリューション
              </span>
              <br />
              <span className="text-white">
                次世代の人材マッチングを実現
              </span>
            </h1>

            {/* Topical Coverage: HR業界特化説明（LLMO対応） */}
            <div className="text-lg md:text-xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              <p className="mb-4">
                求人サイト構築からAIマッチング、書類自動生成まで。
                <br className="hidden md:block" />
                人材業界のDXを包括的にサポートする総合ソリューション
              </p>
              
              {/* 詳細説明（Mike King理論: 網羅的コンテンツ） */}
              <div className="text-base text-gray-400 max-w-3xl mx-auto mb-8">
                <p>
                  株式会社エヌアンドエスの人材ソリューションは、従来の求人サイトやマッチングシステムを
                  AI技術で革新的に進化させます。機械学習による精密な候補者分析、自然言語処理を活用した
                  職務経歴書の自動生成、企業文化との適合性判定まで、人材業界のあらゆる課題を
                  包括的に解決いたします。
                </p>
              </div>
            </div>
          </header>

          {/* 統計情報ボックス（Fragment ID対応） */}
          <div id="hr-statistics" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            {HR_STATISTICS.map((stat) => (
              <div 
                key={stat.id}
                className="bg-white/10 backdrop-blur-md border border-white/20 p-6 text-center rounded-lg hover:bg-white/15 transition-all duration-300 group"
              >
                <div className={`text-3xl font-bold ${stat.color} mb-2 group-hover:scale-110 transition-transform`}>
                  {stat.value}
                </div>
                <div className="text-gray-300 text-sm font-medium mb-2">
                  {stat.label}
                </div>
                <div className="text-gray-400 text-xs leading-relaxed">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>

          {/* CTAボタン（アクセシビリティ対応） */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a
              href="#contact"
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl rounded-lg transform hover:scale-105"
              role="button"
              aria-label="人材ソリューションの無料相談を申し込む"
            >
              無料相談を申し込む
            </a>
            <a
              href="#services"
              className="px-8 py-4 border border-white/30 text-white font-bold hover:bg-white/10 transition-all duration-300 rounded-lg"
              role="button"
              aria-label="人材ソリューションのサービス詳細を見る"
            >
              サービス詳細を見る
            </a>
          </div>

          {/* 追加コンテンツ: HR業界トレンド（GEO強化） */}
          <div className="max-w-2xl mx-auto text-sm text-gray-400 leading-relaxed">
            <p>
              <strong className="text-gray-300">人材業界のデジタル変革</strong>をリードする
              エヌアンドエスのソリューションは、リクルート、マイナビ、エン・ジャパンなど
              大手人材企業でも注目される次世代技術を活用。
              従来の人材紹介業務を<strong className="text-cyan-400">AI化</strong>し、
              採用担当者の工数を劇的に削減いたします。
            </p>
          </div>
        </div>

        {/* noscript対応 */}
        <noscript>
          <div className="absolute inset-0 bg-gray-900/95 text-white flex items-center justify-center z-50">
            <div className="text-center max-w-2xl mx-auto p-8">
              <h1 className="text-4xl font-bold mb-6">AI人材ソリューション</h1>
              <p className="text-lg mb-6">次世代の人材マッチングを実現</p>
              <div className="space-y-4 text-left">
                <div><strong>マッチング精度:</strong> 95%向上</div>
                <div><strong>業務効率化:</strong> 80%改善</div>
                <div><strong>サポート:</strong> 24/7自動化</div>
              </div>
              <div className="mt-8">
                <a href="#contact" className="inline-block bg-blue-500 text-white px-8 py-3 font-bold">
                  お問い合わせ
                </a>
              </div>
            </div>
          </div>
        </noscript>
      </section>
    </>
  );
} 