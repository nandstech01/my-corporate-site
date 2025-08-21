'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import TextType from '@/components/common/TextType'

// Galaxy 3D背景（ai-site同様の実装）
const Galaxy = dynamic(() => import('@/components/lp/Galaxy'), { ssr: false })

export default function MainHeroSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [isMobile, setIsMobile] = useState<boolean | null>(null)
  
  useEffect(() => { setIsVisible(true) }, [])
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(max-width: 639px)')
    const handler = () => setIsMobile(mq.matches)
    handler()
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return (
    <>
      {/* 構造化データ（Mike King理論準拠） */}
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

      <section className="relative w-full min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black overflow-hidden" role="banner" aria-label="メインビジュアル">
        {/* 3D Galaxy背景（ai-site同等実装） */}
        <div className="absolute inset-0 z-0">
          <Galaxy 
            mouseRepulsion 
            mouseInteraction 
            density={1.0} 
            glowIntensity={0.3} 
            saturation={0.0} 
            hueShift={190} 
            twinkleIntensity={0.2} 
            rotationSpeed={0.03} 
            transparent 
            loading="lazy" 
          />
        </div>
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[0.3px] z-10"></div>

        {/* メインコンテンツ - さらに上に調整 */}
        <div className="relative z-20 flex flex-col items-center justify-center lg:justify-center min-h-screen px-4 lg:px-8 pt-12 pb-6 sm:pb-12 lg:pt-24 lg:pb-12">
          <div className="text-center max-w-5xl">
            {/* キャッチフレーズバッジ - 削除済み */}

                          {/* ヒーローテキスト - スマホ版 */}
              <div className="block sm:hidden text-center mb-12 -mt-8">
                <h1 className="text-7xl font-bold tracking-tight -mt-44 mb-8 relative z-50">
                  <span className="bg-gradient-to-r from-cyan-400 via-white to-cyan-300 bg-clip-text text-transparent">
                    NANDS
                  </span>
                </h1>
                <div className="text-2xl font-semibold text-white leading-relaxed max-w-xs mx-auto relative z-50">
                  <TextType
                    text="AIとともに未来を切り拓く"
                    as="span"
                    typingSpeed={60}
                    initialDelay={800}
                    startOnVisible
                    showCursor={false}
                    loop={false}
                    className="text-white font-semibold"
                  />
                </div>
              </div>

                          {/* ヒーローテキスト - デスクトップ版フル表示 */}
              <div className="hidden sm:block text-center mb-8">
                <div className="text-7xl md:text-9xl font-bold tracking-tight -mt-44 mb-12 relative z-50">
                  <span className="bg-gradient-to-r from-cyan-400 via-white to-cyan-300 bg-clip-text text-transparent">
                    NANDS
                  </span>
                </div>
                {/* サブタイトル削除済み */}
                <div className="text-3xl md:text-5xl font-semibold text-white leading-relaxed max-w-4xl mx-auto relative z-50">
                  <TextType
                    text="AIとともに未来を切り拓く"
                    as="span"
                    typingSpeed={80}
                    initialDelay={1000}
                    startOnVisible
                    showCursor={false}
                    loop={false}
                    className="text-white font-semibold"
                  />
                </div>
              </div>

            {/* サービス説明 - 削除済み（重複コンテンツのため） */}

            {/* メッセージ */}
            <p className="text-slate-200 text-base lg:text-lg mb-8">
              {isMobile === true ? (
                <span className="block text-center leading-snug">
                  AIシステム開発・リスキリング研修から
                  <br />
                  AI副業、退職サポートまで。
                  <br />
                  <span className="font-semibold text-cyan-400">NANDS</span>
                  があなたのキャリアを
                  <br />
                  トータルでサポートします。
                </span>
              ) : (
                <span>
                  AIシステム開発・リスキリング研修からAI副業、退職サポートまで。
                  <br />
                  <span className="font-semibold text-cyan-400">NANDS</span>
                  があなたのキャリアをトータルでサポートします。
                </span>
              )}
            </p>

            {/* CTAボタン - NANDSと同じ水色×白グラデーション・最前面配置 */}
            <div className="mb-8 relative z-50">
              <a
                href="#services"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-400 via-white to-cyan-300 hover:from-cyan-500 hover:via-gray-100 hover:to-cyan-400 text-black font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl relative z-50"
                role="button"
                aria-label="サービス一覧を表示"
              >
                <span className="mr-2">サービスを見る</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* スクロール案内 */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60">
          <div className="animate-bounce">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>
    </>
  )
} 