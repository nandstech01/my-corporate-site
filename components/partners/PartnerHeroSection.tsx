'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

export default function PartnerHeroSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white overflow-hidden">
      {/* 背景エフェクト */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-cyan-500/10"></div>
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 2px, transparent 2px)',
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20 lg:py-32">
        {/* モバイルでヘッダーとバッジの間隔を少し広げる */}
        <div className="md:hidden h-4"></div>
        <div className="max-w-4xl mx-auto text-center">
          {/* 募集中バッジ */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-cyan-600 text-white px-6 py-3 rounded-full font-bold text-sm lg:text-base mb-8 shadow-2xl border border-cyan-300/20"
          >
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            限定募集中！パートナー大募集
          </motion.div>

          {/* メインタイトル */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl lg:text-6xl font-bold mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-cyan-300 to-teal-500 bg-clip-text text-transparent">
              AIリスキリング×SNS
            </span>
            <br />
            <span className="text-white inline-block mt-2 text-3xl lg:text-5xl">パートナープログラム</span>
          </motion.h1>

          {/* サブタイトル */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl lg:text-2xl text-slate-200 mb-8 leading-relaxed max-w-3xl mx-auto"
          >
            <span className="font-semibold text-cyan-300">月額10万円</span>で
            <span className="font-semibold text-cyan-200">AI検索時代の最先端技術</span>
            <br className="md:hidden" />
            <span className="font-semibold text-cyan-200">パッケージ</span>の販売権を獲得
            <br className="md:hidden" />
            <span className="font-bold text-cyan-300 text-2xl lg:text-3xl">高額パートナー報酬</span>の
            <br className="md:hidden" />
            収益パートナーシップ
          </motion.p>

          {/* 3つの特徴 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12"
          >
            <div className="rounded-2xl p-4 md:p-6 flex items-center justify-center">
              <div className="mb-2 relative w-56 h-56 md:w-72 md:h-72">
                <Image src="/images/partners/icons/high-revenue.png" alt="高収益体系" fill sizes="(min-width: 768px) 288px, 224px" className="object-contain drop-shadow-lg" />
              </div>
            </div>
            <div className="rounded-2xl p-4 md:p-6 flex items-center justify-center">
              <div className="mb-2 relative w-56 h-56 md:w-72 md:h-72">
                <Image src="/images/partners/icons/first-mover.png" alt="先行者利益" fill sizes="(min-width: 768px) 288px, 224px" className="object-contain drop-shadow-lg" />
              </div>
            </div>
            <div className="rounded-2xl p-4 md:p-6 flex items-center justify-center">
              <div className="mb-2 relative w-56 h-56 md:w-72 md:h-72">
                <Image src="/images/partners/icons/full-support.png" alt="完全サポート" fill sizes="(min-width: 768px) 288px, 224px" className="object-contain drop-shadow-lg" />
              </div>
            </div>
          </motion.div>

          {/* 対象者 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10"
          >
            <div className="rounded-full px-5 py-2 border border-cyan-400/40 bg-transparent">
              <span className="font-semibold text-cyan-300 text-sm md:text-base whitespace-nowrap">法人様</span>
              <span className="text-slate-300 ml-2 text-sm md:text-base whitespace-nowrap">× 自社導入 + 他社紹介</span>
            </div>
            <div className="rounded-full px-5 py-2 border border-cyan-400/40 bg-transparent">
              <span className="font-semibold text-cyan-300 text-sm md:text-base whitespace-nowrap">インフルエンサー様</span>
              <span className="text-slate-300 ml-2 text-sm md:text-base whitespace-nowrap">× コンテンツ + 紹介</span>
            </div>
          </motion.div>

          {/* CTAボタン */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <a
              href="#application"
              className="group relative px-10 py-5 bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 text-white font-bold text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 border border-cyan-300/30"
            >
              <span className="relative z-10 flex items-center gap-2">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
                 今すぐパートナー申請
                 <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                 </svg>
               </span>
            </a>
            
            <a
              href="#benefits"
              className="group px-8 py-4 border border-white/20 text-white font-bold text-lg rounded-full backdrop-blur-sm hover:bg-white/10 hover:border-white/40 transition-all duration-300 shadow-lg"
            >
              <span className="flex items-center gap-2">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" /></svg>
                 詳細メリットを見る
                 <svg className="w-5 h-5 group-hover:translate-y-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                 </svg>
               </span>
            </a>
          </motion.div>
          
        </div>
      </div>
      
    </section>
  )
} 