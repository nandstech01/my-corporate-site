import React from 'react';

/**
 * =========================================================
 * VideoHeroSectionSSR.tsx - AI動画生成専用【完全版】
 *
 * Mike King理論準拠: AI検索エンジン最適化
 * - SSRでコンテンツ認識可能
 * - 構造化データ完備
 * - GEO対策（生成系検索最適化）
 * - レリバンスエンジニアリング
 * - LLMO完全対応
 * - 動画生成業界特化設計
 * 
 * 【戦略】
 * ✅ AI動画生成技術特化
 * ✅ 主要APIプラットフォーム強調
 * ✅ 自動化・効率化訴求
 * ✅ 実績数値強調
 * ✅ Fragment ID対応
 * ---------------------------------------------------------
 */

// AI動画生成構造化データ（Mike King理論準拠）
const videoGenerationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": "https://nands.tech/video-generation#software",
  "name": "AI動画生成・API連携システム",
  "description": "Midjourney、Veo 3、Runway MLなどの最新AI動画生成APIを活用し、コンテンツ制作を革新的に効率化するシステム開発サービス。自動動画生成、AI画像生成、バッチ処理対応。",
  "url": "https://nands.tech/video-generation",
  "applicationCategory": "VideoApplication",
  "operatingSystem": "Web Browser",
  "provider": {
    "@type": "Organization",
    "@id": "https://nands.tech/#organization"
  },
  "offers": {
    "@type": "Offer",
    "name": "AI動画生成システム開発",
    "description": "最新AI技術を活用した動画生成・API連携システム開発サービス",
    "priceCurrency": "JPY",
    "availability": "https://schema.org/InStock"
  },
  "featureList": [
    "Midjourney API連携",
    "Veo 3対応",
    "Runway ML統合",
    "自動動画生成",
    "AI画像生成",
    "バッチ処理",
    "API統合管理",
    "コンテンツ最適化"
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "bestRating": "5",
    "worstRating": "1",
    "ratingCount": "67"
  },
  "potentialAction": {
    "@type": "ContactAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://nands.tech/video-generation#contact"
    }
  }
};

// 動画生成統計データ（GEO対策）
const VIDEO_STATISTICS = [
  {
    id: "ai-platforms",
    value: "10+",
    label: "対応AIプラットフォーム",
    description: "Midjourney、Veo 3、Runway ML、DALL-E等の主要AI動画・画像生成APIに対応",
    color: "text-purple-400",
    platforms: ["Midjourney", "Veo 3", "Runway ML", "DALL-E 3", "Stable Video", "Pika Labs", "Gen-2", "Adobe Firefly", "Luma Dream", "Sora API"]
  },
  {
    id: "efficiency-boost",
    value: "90%",
    label: "制作時間短縮",
    description: "従来の動画制作プロセスを90%短縮し、コンテンツ制作を劇的に効率化",
    color: "text-pink-400"
  },
  {
    id: "automation-level",
    value: "100%",
    label: "完全自動化対応",
    description: "スクリプト生成から動画出力まで24時間365日自動実行可能",
    color: "text-indigo-400"
  }
];

export default function VideoHeroSectionSSR() {
  return (
    <>
      {/* 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoGenerationSchema) }}
      />

      <section 
        id="video-hero"
        className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden"
      >
        {/* 背景エフェクト（動画生成特化デザイン） */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/30 to-indigo-900/20" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-600/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
          
          {/* 動画・画像アイコン風の装飾 */}
          <div className="absolute top-1/4 left-1/6 w-4 h-4 bg-purple-400 rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.7s' }}></div>
          <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        </div>

        <div className="relative container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* AI動画生成バッジ */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 backdrop-blur-sm mb-8">
              <svg className="w-4 h-4 mr-2 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-medium text-purple-300">AI Video Generation</span>
            </div>

            {/* メインタイトル（GEO対策: Explain-Then-List構造） */}
            <header>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
                  AI動画生成・API連携
                </span>
                <br />
                <span className="text-white">システム開発</span>
              </h1>

              {/* Topical Coverage: 動画生成業界特化説明（LLMO対応） */}
              <div className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                <p className="mb-4">
                  Midjourney、Veo 3、Runway MLなどの最新AI動画生成APIを活用し、
                  <br className="hidden md:block" />
                  コンテンツ制作を革新的に効率化するシステムを構築します
                </p>
                
                {/* 詳細説明（Mike King理論: 網羅的コンテンツ） */}
                <div className="text-base text-gray-400 max-w-3xl mx-auto mb-8">
                  <p>
                    株式会社エヌアンドエスのAI動画生成システムは、OpenAI、Google、Meta、Adobe等の
                    最新AI技術を統合し、テキストから動画・画像を自動生成。従来の制作工程を90%短縮し、
                    企業のコンテンツマーケティングを次世代レベルに押し上げます。
                  </p>
                </div>
              </div>
            </header>

            {/* 動画生成統計情報（Fragment ID対応） */}
            <div id="video-statistics" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
              {VIDEO_STATISTICS.map((stat) => (
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
                  
                  {/* AIプラットフォーム一覧（対応AIプラットフォーム項目のみ） */}
                  {stat.platforms && (
                    <div className="mt-3">
                      <div className="flex flex-wrap justify-center gap-1">
                        {stat.platforms.slice(0, 3).map((platform, index) => (
                          <span key={index} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                            {platform}
                          </span>
                        ))}
                        <span className="text-xs bg-gray-500/20 text-gray-300 px-2 py-1 rounded-full">
                          +{stat.platforms.length - 3}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 主要特徴アイコン（GEO強化） */}
            <div id="video-features" className="flex flex-wrap justify-center gap-8 mb-12">
              <div className="flex items-center space-x-2 bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-all group">
                <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM5 8a1 1 0 011-1h1a1 1 0 011 1v1a1 1 0 01-1 1H6a1 1 0 01-1-1V8zm5 0a1 1 0 011-1h3a1 1 0 110 2h-3a1 1 0 01-1-1zm0 3a1 1 0 011-1h3a1 1 0 110 2h-3a1 1 0 01-1-1z" />
                  </svg>
                </div>
                <span className="text-gray-300 font-medium">自動動画生成</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-all group">
                <div className="p-2 rounded-lg bg-pink-500/20 border border-pink-500/30 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-pink-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <span className="text-gray-300 font-medium">AI画像生成</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-all group">
                <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-300 font-medium">バッチ処理</span>
              </div>
            </div>

            {/* CTAボタン（アクセシビリティ対応） */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a
                href="#contact"
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl rounded-xl transform hover:scale-105"
                role="button"
                aria-label="AI動画生成システムの無料デモを見る"
              >
                無料デモを見る
              </a>
              <a
                href="#tech-stack"
                className="px-8 py-4 border border-gray-600 text-gray-300 font-bold hover:bg-white/5 transition-all duration-300 rounded-xl transform hover:scale-105"
                role="button"
                aria-label="AI動画生成システムの技術詳細を確認"
              >
                技術詳細を確認
              </a>
            </div>

            {/* 追加コンテンツ: AI動画生成トレンド（GEO強化） */}
            <div className="max-w-2xl mx-auto text-sm text-gray-400 leading-relaxed">
              <p>
                <strong className="text-gray-300">AI動画生成の革命</strong>に対応する
                エヌアンドエスのシステムは、OpenAI、Google DeepMind、Meta AI等の
                最新モデルにいち早く対応。
                従来の動画制作を<strong className="text-pink-400">AI完全自動化</strong>し、
                クリエイティブ業界のDXを加速いたします。
              </p>
            </div>
          </div>
        </div>

        {/* noscript対応 */}
        <noscript>
          <div className="absolute inset-0 bg-gray-900/95 text-white flex items-center justify-center z-50">
            <div className="text-center max-w-2xl mx-auto p-8">
              <h1 className="text-4xl font-bold mb-6">AI動画生成・API連携システム開発</h1>
              <p className="text-lg mb-6">コンテンツ制作を革新的に効率化するシステム</p>
              <div className="space-y-4 text-left">
                <div><strong>対応AIプラットフォーム:</strong> 10+（Midjourney、Veo 3、Runway ML等）</div>
                <div><strong>制作時間短縮:</strong> 90%</div>
                <div><strong>自動化レベル:</strong> 100%完全対応</div>
              </div>
              <div className="mt-8">
                <a href="#contact" className="inline-block bg-purple-500 text-white px-8 py-3 font-bold">
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