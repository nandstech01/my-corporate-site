'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function PartnerHeroSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="relative bg-gradient-to-br from-purple-900 via-blue-900 to-cyan-900 text-white overflow-hidden">
      {/* 背景エフェクト */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20"></div>
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 2px, transparent 2px)',
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* 募集中バッジ */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-full font-bold text-sm lg:text-base mb-8 shadow-2xl border-2 border-white/20"
          >
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            🔥 限定募集中！パートナー大募集 🔥
          </motion.div>

          {/* メインタイトル */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl lg:text-6xl font-bold mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-yellow-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent">
              AIリスキリング×SNS
            </span>
            <br />
            <span className="text-white">パートナープログラム</span>
          </motion.h1>

          {/* サブタイトル */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl lg:text-2xl text-gray-200 mb-8 leading-relaxed max-w-3xl mx-auto"
          >
            <span className="font-semibold text-yellow-300">月額10万円</span>で
            <span className="font-semibold text-cyan-300">AI検索時代の最先端技術パッケージ</span>の販売権を獲得
            <br />
            <span className="font-bold text-pink-300 text-2xl lg:text-3xl">高額パートナー報酬</span>の収益パートナーシップ
          </motion.p>

          {/* 3つの特徴 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-lg font-bold mb-2">高収益体系</h3>
              <p className="text-gray-300 text-sm">
                成約1件あたり
                <br />
                <span className="text-yellow-300 font-bold">高額報酬をご提供</span>
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-lg font-bold mb-2">先行者利益</h3>
              <p className="text-gray-300 text-sm">
                日本初RE・GEO実装
                <br />
                <span className="text-cyan-300 font-bold">AI検索時代のパイオニア</span>
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-lg font-bold mb-2">完全サポート</h3>
              <p className="text-gray-300 text-sm">
                営業ツール・研修完備
                <br />
                <span className="text-pink-300 font-bold">専属サポート付き</span>
              </p>
            </div>
          </motion.div>

          {/* 対象者 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10"
          >
            <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-300/30 rounded-full px-6 py-3">
              <span className="font-bold text-purple-300">🎯 法人様</span>
              <span className="text-gray-300 ml-2">× 自社導入 + 他社紹介</span>
            </div>
            <div className="bg-gradient-to-r from-pink-500/20 to-cyan-500/20 border border-pink-300/30 rounded-full px-6 py-3">
              <span className="font-bold text-pink-300">✨ インフルエンサー様</span>
              <span className="text-gray-300 ml-2">× コンテンツ + 紹介</span>
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
              className="group relative px-10 py-5 bg-gradient-to-r from-yellow-400 via-pink-500 to-red-500 text-white font-bold text-lg rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 border-2 border-white/20"
            >
              <span className="relative z-10 flex items-center gap-2">
                🚀 今すぐパートナー申請
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-pink-600 to-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </a>
            
            <a
              href="#benefits"
              className="group px-8 py-4 border-2 border-white/30 text-white font-bold text-lg rounded-full backdrop-blur-sm hover:bg-white/10 hover:border-white/50 transition-all duration-300 shadow-lg"
            >
              <span className="flex items-center gap-2">
                📋 詳細メリットを見る
                <svg className="w-5 h-5 group-hover:translate-y-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </span>
            </a>
          </motion.div>

          {/* 実績表示 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          >
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-yellow-300 mb-2">630%</div>
              <div className="text-gray-300 text-sm">技術改善実績</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-cyan-300 mb-2">20万</div>
              <div className="text-gray-300 text-sm">keitaフォロワー</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-pink-300 mb-2">80%</div>
              <div className="text-gray-300 text-sm">助成金還付率</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-purple-300 mb-2">日本初</div>
              <div className="text-gray-300 text-sm">RE・GEO実装</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* スクロールインジケーター */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 1, delay: 1.4 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2 text-white/80">
          <span className="text-sm font-medium">パートナーメリット詳細</span>
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gradient-to-b from-yellow-300 to-pink-300 rounded-full mt-2 animate-bounce"></div>
          </div>
        </div>
      </motion.div>
    </section>
  )
} 