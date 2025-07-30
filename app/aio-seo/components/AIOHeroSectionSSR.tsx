import React from 'react';

/**
 * =========================================================
 * AIOHeroSectionSSR.tsx - AIO-SEO専用【完全版】
 *
 * Mike King理論準拠: AI検索エンジン最適化
 * - SSRでコンテンツ認識可能
 * - 構造化データ完備
 * - GEO対策（生成系検索最適化）
 * - レリバンスエンジニアリング
 * - LLMO完全対応
 * - AIO業界特化設計
 * 
 * 【戦略】
 * ✅ Mike King理論特化
 * ✅ レリバンスエンジニアリング強調
 * ✅ AI検索最適化訴求
 * ✅ 実績数値強調
 * ✅ Fragment ID対応
 * ---------------------------------------------------------
 */

// AIO-SEO構造化データ（Mike King理論準拠）
const aioSeoSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": "https://nands.tech/aio-seo#software",
  "name": "AIO対策・レリバンスエンジニアリング",
  "description": "Mike King理論準拠のレリバンスエンジニアリング・GEO最適化・AI検索エンジン対応の統合プラットフォーム。ChatGPT・Perplexity・Google AI Overviewsでの発見可能性を向上。",
  "url": "https://nands.tech/aio-seo",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web Browser",
  "provider": {
    "@type": "Organization",
    "@id": "https://nands.tech/#organization"
  },
  "offers": {
    "@type": "Offer",
    "name": "AIO対策・レリバンスエンジニアリング",
    "description": "Mike King理論準拠のAI検索最適化・GEO対策・レリバンスエンジニアリング",
    "priceCurrency": "JPY",
    "availability": "https://schema.org/InStock"
  },
  "featureList": [
    "Mike King理論準拠",
    "GEO最適化",
    "AI検索エンジン対応",
    "レリバンスエンジニアリング",
    "構造化データ最適化",
    "Topical Coverage",
    "Fragment ID最適化",
    "セマンティック構造化データ"
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.7",
    "bestRating": "5",
    "worstRating": "1",
    "ratingCount": 12
  },
  "potentialAction": {
    "@type": "ContactAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://nands.tech/aio-seo#contact"
    }
  }
};

// AIO-SEO統計データ（GEO対策）
const AIO_STATISTICS = [
  {
    id: "ai-search-engines",
    value: "5+",
    label: "対応AI検索エンジン",
    description: "ChatGPT、Perplexity、Google AI Overviews等主要AI検索エンジンに対応",
    color: "text-purple-400",
    engines: ["ChatGPT", "Perplexity", "Google AI Overviews", "Bing Copilot", "Claude Search"]
  },
  {
    id: "relevance-improvement",
    value: "85%",
    label: "関連性スコア向上",
    description: "Mike King理論に基づくレリバンスエンジニアリングで関連性スコア85%向上",
    color: "text-purple-400"
  },
  {
    id: "visibility-boost",
    value: "400%",
    label: "AI検索表示率向上",
    description: "GEO最適化により主要AI検索エンジンでの表示率400%向上を実現",
    color: "text-purple-400"
  }
];

export default function AIOHeroSectionSSR() {
  return (
    <>
      {/* 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aioSeoSchema) }}
      />

      <section 
        id="aio-seo-hero"
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16 md:pt-28 md:pb-24"
      >
        {/* 背景グラデーション */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900" />
        
        {/* 装飾的な背景要素（AIO-SEO特化デザイン） */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-violet-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
          
          {/* AI検索アイコン風の装飾 */}
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-violet-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-1/3 left-1/6 w-4 h-4 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Mike King理論バッジ */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-violet-500/20 border border-purple-500/30 backdrop-blur-sm mb-8">
            <svg className="w-4 h-4 mr-2 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-medium text-purple-300">Mike King理論準拠</span>
          </div>

          {/* メインタイトル（GEO対策: Explain-Then-List構造） */}
          <header>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-10 leading-tight text-center">
              {/* スマホ版：2行分割 */}
              <span className="sm:hidden bg-gradient-to-r from-purple-400 via-violet-400 to-purple-500 bg-clip-text text-transparent block mb-4">
                <span className="block text-2xl">AIO対策</span>
                <span className="block text-xl">レリバンスエンジニアリング</span>
              </span>
              
              {/* デスクトップ版：1行表示 */}
              <span className="hidden sm:block bg-gradient-to-r from-purple-400 via-violet-400 to-purple-500 bg-clip-text text-transparent mb-4">
                AIO対策・レリバンスエンジニアリング
              </span>
              
              <span className="text-white block">
                AI検索時代の最適化手法
              </span>
            </h1>

            {/* Topical Coverage: AIO業界特化説明（LLMO対応） */}
            <div className="text-lg md:text-xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              <p className="mb-4">
                Mike King理論準拠のレリバンスエンジニアリングで
                <br className="hidden md:block" />
                ChatGPT・Perplexity・Google AI Overviewsでの発見可能性を向上
              </p>
              
              {/* 詳細説明（Mike King理論: 網羅的コンテンツ） */}
              <div className="text-base text-gray-400 max-w-3xl mx-auto mb-8">
                <p>
                  株式会社エヌアンドエスのAIO対策は、Mike King氏が提唱する
                  レリバンスエンジニアリング理論を完全実装。GEO（Generative Engine Optimization）、
                  Topical Coverage拡充、Fragment ID最適化により、
                  AI検索時代における企業の検索可視性を飛躍的に向上させます。
                </p>
              </div>
            </div>
          </header>

          {/* 統計情報ボックス（Fragment ID対応） */}
          <div id="aio-seo-statistics" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            {AIO_STATISTICS.map((stat) => (
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
                
                {/* AI検索エンジン一覧（対応AI検索エンジン項目のみ） */}
                {stat.engines && (
                  <div className="mt-3">
                    <div className="flex flex-wrap justify-center gap-1">
                      {stat.engines.slice(0, 3).map((engine, index) => (
                        <span key={index} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                          {engine}
                        </span>
                      ))}
                      <span className="text-xs bg-gray-500/20 text-gray-300 px-2 py-1 rounded-full">
                        +{stat.engines.length - 3}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTAボタン（アクセシビリティ対応） */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a
              href="#contact"
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-violet-500 text-white font-bold hover:from-purple-600 hover:to-violet-600 transition-all duration-300 shadow-lg hover:shadow-xl rounded-lg transform hover:scale-105"
              role="button"
              aria-label="AIO対策の無料相談を申し込む"
            >
              無料相談を申し込む
            </a>
            <a
              href="#aio-services"
              className="px-8 py-4 border border-white/30 text-white font-bold hover:bg-white/10 transition-all duration-300 rounded-lg"
              role="button"
              aria-label="AIO対策のサービス詳細を見る"
            >
              サービス詳細を見る
            </a>
            <a
              href="/reviews"
              className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl rounded-lg transform hover:scale-105"
              role="button"
              aria-label="AIO対策サービスのレビューを見る"
            >
              レビューを見る
            </a>
          </div>

          {/* 追加コンテンツ: AIO業界トレンド（GEO強化） */}
          <div className="max-w-2xl mx-auto text-sm text-gray-400 leading-relaxed">
            <p>
              <strong className="text-gray-300">AI検索時代の最前線</strong>をリードする
              エヌアンドエスのAIO対策は、Mike King氏の理論を日本初完全実装。
              従来のSEOを<strong className="text-purple-400">次世代レリバンスエンジニアリング</strong>で進化させ、
              企業のAI検索可視性を革命的に向上させます。
            </p>
          </div>
        </div>
      </section>
    </>
  );
} 