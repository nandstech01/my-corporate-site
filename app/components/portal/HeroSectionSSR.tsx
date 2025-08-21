// HeroSectionSSR - ai-site方式完全採用（3D Galaxy + 構造化データ100%維持 + 高速化）
import dynamic from 'next/dynamic'

const MainHeroSection = dynamic(() => import('./MainHeroSection'), {
  ssr: true,
  loading: () => (
    <>
      {/* 構造化データ（Mike King理論準拠） - SSR完全対応 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPageElement",
            "name": "ヒーローセクション",
            "description": "株式会社エヌアンドエスのメインビジュアルエリア",
            "about": [
              "AIとともに未来を切り拓く",
              "AIシステム開発",
              "リスキリング研修", 
              "AI副業サポート",
              "退職サポート",
              "キャリア支援"
            ],
            "mainEntity": {
              "@type": "Organization",
              "name": "株式会社エヌアンドエス",
              "alternateName": "NANDS",
              "description": "AI時代のキャリアをトータルサポートする総合人材支援企業"
            }
          })
        }}
      />

      {/* 軽量SSRフォールバック（即座表示） */}
      <section 
        className="relative w-full min-h-screen flex flex-col items-center justify-center bg-black text-white overflow-hidden" 
        role="banner" 
        aria-label="メインビジュアル"
      >
        {/* 軽量静的背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-900 to-black">
          {/* CSS星空アニメーション（軽量） */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full opacity-60 animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>
        
        {/* メインコンテンツ（SEO完全対応） */}
        <div className="relative z-10 max-w-4xl px-4 py-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-tight">
            <span className="hidden md:block">AIとともに未来を切り拓く</span>
            <span className="block md:hidden">
              <div className="mb-2">AIとともに</div>
              <div>未来を切り拓く</div>
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8">
            <span className="hidden md:inline">
              AIシステム開発・リスキリング研修からAI副業、退職サポートまで。
              <br />
              <span className="font-semibold" style={{ color: '#00CFFF' }}>NANDS</span>
              があなたのキャリアをトータルでサポートします。
            </span>
            <span className="block md:hidden text-center">
              AIシステム開発・リスキリング研修から
              <br />
              AI副業、退職サポートまで。
              <br />
              <span className="font-semibold" style={{ color: '#00CFFF' }}>NANDS</span>
              があなたのキャリアを
              <br />
              トータルでサポートします。
            </span>
          </p>
          <div className="relative inline-block mt-4 md:mt-8 lg:mt-8 mb-20 md:mb-8">
            <a
              href="#services"
              className="relative overflow-hidden px-12 py-5 font-bold text-white
              bg-[#00CFFF] hover:bg-[#00BDEE]
              transition-all duration-300 border border-white border-opacity-30"
              role="button"
              aria-label="サービス一覧を表示"
            >
              <span className="relative z-10 tracking-wider text-black">サービスを見る</span>
            </a>
          </div>
        </div>

        {/* スクロール案内 */}
        <div className="absolute bottom-10 flex justify-center w-full text-gray-300">
          <div className="animate-bounce">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>
    </>
  )
})

/**
 * ai-site方式完全採用版 HeroSection
 * 
 * 【実装内容】
 * ✅ 3D Galaxy背景完全維持（ai-site同等）
 * ✅ 構造化データ100%維持（Mike King理論準拠）
 * ✅ SSR + 軽量fallback（即座表示）
 * ✅ 最大パフォーマンス最適化
 * ✅ SEO・AI検索完全対応
 */
export default function HeroSectionSSR() {
  return <MainHeroSection />
} 