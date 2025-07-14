'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import GridMotion from './GridMotion'

export default function LPHeroSection() {
  const [isVisible, setIsVisible] = useState(false)

  // 全て画像で構成されたランダムなSNSロゴとインフルエンサー画像
  const imagePool = [
    'https://logo.clearbit.com/x.com', // Xロゴ
    'https://logo.clearbit.com/instagram.com', // Instagramロゴ
    'https://logo.clearbit.com/tiktok.com', // TikTokロゴ
    'https://logo.clearbit.com/youtube.com', // YouTubeロゴ
    'https://logo.clearbit.com/linkedin.com', // LinkedInロゴ
    'https://logo.clearbit.com/facebook.com', // Facebookロゴ
    'https://logo.clearbit.com/snapchat.com', // Snapchatロゴ
    'https://logo.clearbit.com/pinterest.com', // Pinterestロゴ
    'https://images.unsplash.com/photo-1494790108755-2616c78746d6?w=150&h=150&fit=crop&crop=face', // インフルエンサー1
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face', // インフルエンサー2
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', // インフルエンサー3
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=face', // インフルエンサー4
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face', // インフルエンサー5
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face', // インフルエンサー6
    'https://images.unsplash.com/photo-1494790108755-2616c78746d6?w=150&h=150&fit=crop&crop=face&random=1', // インフルエンサー7
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&crop=face', // インフルエンサー8
  ]
  
  // 28個のカード全てに画像をランダムで配置
  const gridItems = Array.from({ length: 28 }, (_, index) => {
    return imagePool[index % imagePool.length]
  })

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="relative min-h-screen bg-white overflow-hidden">
      {/* GridMotion背景 */}
      <GridMotion 
        items={gridItems}
        gradientColor="rgba(59, 130, 246, 0.08)"
      />
      
      {/* 文字の視認性向上のための強化オーバーレイ */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-white/50 to-amber-50/40"></div>

      {/* メインコンテンツ */}
      <div className="relative z-10 container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-5xl mx-auto text-center">
          {/* 助成金バッジ */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 text-white px-8 py-4 rounded-full font-bold text-sm lg:text-base mb-8 shadow-2xl border-2 border-white/20"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            日本初RE・GEO実装 × SNS✖️AI 人材開発支援助成金で最大80%還付
          </motion.div>

          {/* メインタイトル */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight"
          >
            <span 
              className="bg-gradient-to-r bg-clip-text text-transparent font-bold"
              style={{
                backgroundImage: 'linear-gradient(90deg, #000000, #00FFFF, #87CEFA, #00FFFF, #000000)',
                backgroundSize: '400% 100%',
                animation: 'gradient-shift 5s linear infinite'
              }}
            >
              SNS✖️AI
            </span>
            <span className="text-2xl lg:text-4xl text-gray-600"> × </span>
            <span 
              className="bg-gradient-to-r bg-clip-text text-transparent font-bold"
              style={{
                backgroundImage: 'linear-gradient(90deg, #9333EA, #3B82F6, #06B6D4, #3B82F6, #9333EA)',
                backgroundSize: '400% 100%',
                animation: 'gradient-shift 5s linear infinite'
              }}
            >
              RE・GEO実装
            </span>
            <br />
            <span className="text-gray-800">日本初の</span>
            <span 
              className="bg-gradient-to-r bg-clip-text text-transparent font-bold"
              style={{
                backgroundImage: 'linear-gradient(90deg, #000000, #00FFFF, #87CEFA, #00FFFF, #000000)',
                backgroundSize: '400% 100%',
                animation: 'gradient-shift 5s linear infinite'
              }}
            >
              AI検索時代
            </span>
            <span className="text-gray-800">対策</span>
            <br />
            <span 
              className="bg-gradient-to-r bg-clip-text text-transparent text-2xl lg:text-4xl font-bold"
              style={{
                backgroundImage: 'linear-gradient(90deg, #9333EA, #3B82F6, #06B6D4, #3B82F6, #9333EA)',
                backgroundSize: '400% 100%',
                animation: 'gradient-shift 5s linear infinite'
              }}
            >
              630%改善 × keita20万フォロワーの実証済み手法
            </span>
          </motion.h1>

          {/* サブタイトル */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl lg:text-2xl text-gray-800 mb-8 leading-relaxed max-w-4xl mx-auto font-semibold"
          >
            AIリスキリングで、あなたの会社の広報社員が
            <br />
            <span 
              className="bg-gradient-to-r bg-clip-text text-transparent font-bold text-2xl lg:text-3xl"
              style={{
                backgroundImage: 'linear-gradient(90deg, #9333EA, #3B82F6, #06B6D4, #3B82F6, #9333EA)',
                backgroundSize: '400% 100%',
                animation: 'gradient-shift 5s linear infinite'
              }}
            >
              20万フォロワー級インフルエンサーに変身！
            </span>
          </motion.p>

          {/* 3つのサービス領域 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-8"
          >
            {/* AI検索モード対策講座 */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-200/30 hover:shadow-xl hover:border-purple-300/50 transition-all duration-300 group">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">AI駆動開発講座</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                <span className="font-semibold text-purple-600">日本未上陸対策の先行実装</span><br />
                <span className="font-semibold text-pink-600">ChatGPT・Perplexity・Claude対応</span><br />
                <span className="text-xs text-gray-500">30万円×人数（3人以上から）</span>
              </p>
            </div>

            {/* AIO・RE実装講座 */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-200/30 hover:shadow-xl hover:border-blue-300/50 transition-all duration-300 group">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">AIO・RE実装講座</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                <span className="font-semibold text-blue-600">Relevance Engineering完全実装</span><br />
                <span className="font-semibold text-cyan-600">630%改善の技術移転</span><br />
                <span className="text-xs text-gray-500">30万円×人数（3人以上から）</span>
              </p>
            </div>

            {/* SNSコンサル講座 */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-green-200/30 hover:shadow-xl hover:border-green-300/50 transition-all duration-300 group">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">SNSコンサル講座</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                <span className="font-semibold text-green-600">keita実践手法 × NANDS技術</span><br />
                <span className="text-xs text-gray-500">総フォロワー20万の実証済み手法</span><br />
                <span className="text-xs text-gray-500">30万円×人数（3人以上から）</span>
              </p>
            </div>
          </motion.div>

          {/* 特別な強調メッセージ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex items-center justify-center gap-4 mb-10"
          >
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg">
              日本初技術実装 × SNS✖️AI = 圧倒的競争優位
            </div>
          </motion.div>

          {/* CTA ボタン */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button className="group relative px-10 py-5 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 text-white font-bold text-lg rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 border-2 border-white/20">
              <span className="relative z-10 flex items-center gap-2">
                SNS✖️AI先行者利益・最大80%還付申請
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            
            <button className="group px-8 py-4 border-2 border-gray-400 text-gray-700 font-bold text-lg rounded-full backdrop-blur-sm hover:bg-gray-100 hover:border-gray-500 transition-all duration-300 shadow-lg">
              <span className="flex items-center gap-2">
                630%改善 × keita実績を見る
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </button>
          </motion.div>

          {/* 法人リスキリング3コースパッケージ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {/* コース❶ */}
            <div className="text-center bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-200/30 hover:shadow-xl hover:border-purple-300/50 transition-all duration-300 group">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                  ❶
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI駆動開発講座</h3>
              <p className="text-sm text-gray-600 font-medium mb-2">日本未上陸の先行実装</p>
              <div className="text-xs text-purple-600 font-bold bg-purple-50 px-3 py-1 rounded-full mb-2">日本初実装企業が指導</div>
              <div className="text-xs text-gray-500">30万円×人数（3人以上から）</div>
            </div>

            {/* コース❷ */}
            <div className="text-center bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-200/30 hover:shadow-xl hover:border-blue-300/50 transition-all duration-300 group">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                  ❷
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">AIO・RE実装講座</h3>
              <p className="text-sm text-gray-600 font-medium mb-2">630%改善の技術移転</p>
              <div className="text-xs text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-full mb-2">Relevance Engineering完全習得</div>
              <div className="text-xs text-gray-500">30万円×人数（3人以上から）</div>
            </div>

            {/* コース❸ */}
            <div className="text-center bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-green-200/30 hover:shadow-xl hover:border-green-300/50 transition-all duration-300 group">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <div className="w-full h-full bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                  ❸
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">SNSコンサル講座</h3>
              <p className="text-sm text-gray-600 font-medium mb-2">keita手法 × NANDS技術</p>
              <div className="text-xs text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full mb-2">総フォロワー20万の実証手法</div>
              <div className="text-xs text-gray-500">30万円×人数（3人以上から）</div>
            </div>
          </motion.div>

          {/* 追加の強調メッセージ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-200 rounded-full px-6 py-3">
              <span className="text-purple-800 font-semibold text-lg">SNS✖️AI時代の先行者として、技術×影響力の両方を制覇</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* スクロールインジケーター */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2 text-gray-600">
          <span className="text-sm font-medium">SNS✖️AI × RE・GEO詳細を見る</span>
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full mt-2 animate-bounce"></div>
          </div>
        </div>
      </motion.div>
    </section>
  )
} 