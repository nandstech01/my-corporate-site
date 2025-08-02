import React from 'react';

/**
 * =========================================================
 * SNSHeroSectionSSR.tsx - SNS自動化専用【完全版】
 *
 * Mike King理論準拠: AI検索エンジン最適化
 * - SSRでコンテンツ認識可能
 * - 構造化データ完備
 * - GEO対策（生成系検索最適化）
 * - レリバンスエンジニアリング
 * - LLMO完全対応
 * - SNS業界特化設計
 * 
 * 【戦略】
 * ✅ SNSマーケティング特化
 * ✅ マルチプラットフォーム強調
 * ✅ 自動化効果訴求
 * ✅ 実績数値強調
 * ✅ Fragment ID対応
 * ---------------------------------------------------------
 */

// SNS自動化構造化データ（Mike King理論準拠）
const snsAutomationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": "https://nands.tech/sns-automation#software",
  "name": "SNS自動化システム",
  "description": "X（Twitter）、Instagram、FacebookなどのSNS投稿を自動化し、マーケティング効果を最大化するシステム開発サービス。エンゲージメント分析、完全自動化対応。",
  "url": "https://nands.tech/sns-automation",
  "applicationCategory": "SocialMediaApplication",
  "operatingSystem": "Web Browser",
  "provider": {
    "@type": "Organization",
    "@id": "https://nands.tech/#organization"
  },
  "offers": {
    "@type": "Offer",
    "name": "SNS自動化システム開発",
    "description": "マルチプラットフォーム対応のSNS自動化システム開発サービス",
    "priceCurrency": "JPY",
    "availability": "https://schema.org/InStock"
  },
  "featureList": [
    "X（Twitter）自動投稿",
    "Instagram自動化",
    "Facebook自動投稿",
    "LinkedIn対応",
    "エンゲージメント分析",
    "パフォーマンス最適化",
    "スケジューリング機能",
    "自動リサーチ"
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "bestRating": "5",
    "worstRating": "1",
    "ratingCount": 17
  },
  "potentialAction": {
    "@type": "ContactAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://nands.tech/sns-automation#contact"
    }
  },
  "additionalType": "SNS Automation Service",
  "serviceType": "Social Media Marketing Automation",
  "areaServed": "日本",
  "availableLanguage": ["ja", "en"]
};

// SNS自動化統計データ（GEO対策）
const SNS_STATISTICS = [
  {
    id: "multi-platform",
    value: "7+",
    label: "対応プラットフォーム",
    description: "X、Instagram、Facebook、LinkedIn等の主要SNSプラットフォームに対応",
    color: "text-blue-400",
    platforms: ["X (Twitter)", "Instagram", "Facebook", "LinkedIn", "YouTube", "TikTok", "Pinterest"]
  },
  {
    id: "engagement-boost",
    value: "300%",
    label: "エンゲージメント向上",
    description: "自動化により投稿頻度・タイミング最適化でエンゲージメント300%向上",
    color: "text-cyan-400"
  },
  {
    id: "automation-level",
    value: "100%",
    label: "完全自動化対応",
    description: "コンテンツ生成からスケジューリング、分析まで365日24時間自動実行",
    color: "text-blue-400"
  }
];

export default function SNSHeroSectionSSR() {
  return (
    <>
      {/* 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(snsAutomationSchema) }}
      />

      <section 
        id="sns-hero"
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16 md:pt-28 md:pb-24"
      >
        {/* パンくずリスト */}
        <nav className="absolute top-0 left-0 right-0 z-10 px-4 py-3" 
             style={{backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(10px)'}}>
          <div className="max-w-7xl mx-auto">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <a href="/" className="inline-flex items-center text-sm font-medium text-gray-300 hover:text-blue-400">
                  ホーム
                </a>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <a href="/#services" className="ml-1 text-sm font-medium text-gray-300 hover:text-blue-400 md:ml-2">
                    サービス
                  </a>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-400 md:ml-2 block truncate sm:whitespace-normal" 
                        title="SNS自動化システム開発">
                    <span className="hidden sm:inline">SNS自動化システム開発</span>
                    <span className="sm:hidden">SNS自動化...</span>
                  </span>
                </div>
              </li>
            </ol>
          </div>
        </nav>
        {/* 背景グラデーション */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_50%)]" />
        
        {/* 装飾的な背景要素（SNS特化デザイン） */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
          
          {/* SNSアイコン風の装飾 */}
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-1/3 left-1/6 w-4 h-4 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* メインタイトル（GEO対策: Explain-Then-List構造） */}
          <header>
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-500 bg-clip-text text-transparent">
                SNS自動化システム
              </span>
              <br />
              <span className="text-white">開発サービス</span>
            </h1>

            {/* Topical Coverage: SNS業界特化説明（LLMO対応） */}
            <div className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              <p className="mb-4">
                X（Twitter）、Instagram、FacebookなどのSNS投稿を自動化し、
                <br className="hidden md:block" />
                マーケティング効果を最大化するシステムを開発します
              </p>
              
              {/* 詳細説明（Mike King理論: 網羅的コンテンツ） */}
              <div className="text-base text-gray-400 max-w-3xl mx-auto mb-8">
                <p>
                  株式会社エヌアンドエスのSNS自動化システムは、現代のデジタルマーケティングに
                  不可欠な複数のSNSプラットフォームを統合管理。AI技術を活用した投稿最適化、
                  エンゲージメント分析、自動スケジューリングにより、企業のSNSマーケティング
                  ROIを飛躍的に向上させます。
                </p>
              </div>
            </div>
          </header>

          {/* SNS特化統計情報（Fragment ID対応） */}
          <div id="sns-statistics" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
            {SNS_STATISTICS.map((stat) => (
              <div 
                key={stat.id}
                className="bg-white/10 backdrop-blur-md border border-white/20 p-6 text-center rounded-2xl hover:bg-white/15 transition-all duration-300 group"
              >
                <div className={`text-3xl md:text-4xl font-bold ${stat.color} mb-2 group-hover:scale-110 transition-transform`}>
                  {stat.value}
                </div>
                <div className="text-gray-300 text-sm font-medium mb-3">
                  {stat.label}
                </div>
                <div className="text-gray-400 text-xs leading-relaxed mb-3">
                  {stat.description}
                </div>
                
                {/* プラットフォーム一覧（マルチプラットフォーム項目のみ） */}
                {stat.platforms && (
                  <div className="mt-3">
                    <div className="flex flex-wrap justify-center gap-2">
                      {stat.platforms.slice(0, 4).map((platform, index) => (
                        <span key={index} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                          {platform}
                        </span>
                      ))}
                      <span className="text-xs bg-gray-500/20 text-gray-300 px-2 py-1 rounded-full">
                        +{stat.platforms.length - 4}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 主要機能ハイライト（GEO強化） */}
          <div id="sns-features" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="flex flex-col items-center p-6 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 hover:border-blue-500/30 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.243 3.03a1 1 0 01.727 1.213L9.53 6h2.94l.56-2.243a1 1 0 111.94.486L14.53 6H17a1 1 0 110 2h-2.97l-1 4H15a1 1 0 110 2h-2.47l-.56 2.242a1 1 0 11-1.94-.485L10.47 14H7.53l-.56 2.242a1 1 0 11-1.94-.485L5.47 14H3a1 1 0 110-2h2.97l1-4H5a1 1 0 110-2h2.47l.56-2.243a1 1 0 011.213-.727zM9.03 8l-1 4h2.94l1-4H9.03z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">マルチプラットフォーム対応</h3>
              <p className="text-gray-300 text-center text-sm">X、Instagram、Facebook、LinkedIn等主要SNSに対応</p>
            </div>

            <div className="flex flex-col items-center p-6 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 hover:border-cyan-500/30 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">高度な分析機能</h3>
              <p className="text-gray-300 text-center text-sm">エンゲージメント分析とパフォーマンス最適化</p>
            </div>

            <div className="flex flex-col items-center p-6 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 hover:border-purple-500/30 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">完全自動化</h3>
              <p className="text-gray-300 text-center text-sm">スケジューリングからリサーチまで自動実行</p>
            </div>
          </div>

          {/* CTAボタン（アクセシビリティ対応） */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a
              href="#contact"
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl rounded-xl transform hover:scale-105"
              role="button"
              aria-label="SNS自動化システムの無料相談を予約"
            >
              無料相談を予約
            </a>
            <a
              href="#showcase"
              className="px-8 py-4 border-2 border-blue-400 text-blue-400 font-bold hover:bg-blue-400 hover:text-white transition-all duration-300 rounded-xl transform hover:scale-105"
              role="button"
              aria-label="SNS自動化システムの事例を見る"
            >
              事例を見る
            </a>
            <a
              href="/reviews"
              className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl rounded-xl transform hover:scale-105"
              role="button"
              aria-label="SNS自動化システムのレビューを見る"
            >
              レビューを見る
            </a>
          </div>

          {/* 追加コンテンツ: SNS業界トレンド（GEO強化） */}
          <div className="max-w-2xl mx-auto text-sm text-gray-400 leading-relaxed">
            <p>
              <strong className="text-gray-300">SNSマーケティングの進化</strong>に対応する
              エヌアンドエスの自動化システムは、Meta（Facebook）、X Corp、Googleなど
              プラットフォーム各社のAPI変更にも迅速対応。
              従来の手動投稿を<strong className="text-cyan-400">AI完全自動化</strong>し、
              マーケティング担当者の工数を劇的に削減いたします。
            </p>
          </div>
        </div>

        {/* noscript対応 */}
        <noscript>
          <div className="absolute inset-0 bg-gray-900/95 text-white flex items-center justify-center z-50">
            <div className="text-center max-w-2xl mx-auto p-8">
              <h1 className="text-4xl font-bold mb-6">SNS自動化システム開発サービス</h1>
              <p className="text-lg mb-6">マーケティング効果を最大化するシステムを開発</p>
              <div className="space-y-4 text-left">
                <div><strong>対応プラットフォーム:</strong> 7+（X、Instagram、Facebook等）</div>
                <div><strong>エンゲージメント向上:</strong> 300%</div>
                <div><strong>自動化レベル:</strong> 100%完全対応</div>
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