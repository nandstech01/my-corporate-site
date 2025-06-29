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
            厚生労働省認定 人材開発支援助成金で75%還付
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
              AI✖️SNS
            </span>
            <br />
            <span className="text-gray-800">助成金で</span>
            <span 
              className="bg-gradient-to-r bg-clip-text text-transparent font-bold"
              style={{
                backgroundImage: 'linear-gradient(90deg, #000000, #00FFFF, #87CEFA, #00FFFF, #000000)',
                backgroundSize: '400% 100%',
                animation: 'gradient-shift 5s linear infinite'
              }}
            >
              75%還付
            </span>
            <br />
            <span 
              className="bg-gradient-to-r bg-clip-text text-transparent text-2xl lg:text-4xl font-bold"
              style={{
                backgroundImage: 'linear-gradient(90deg, #000000, #00FFFF, #87CEFA, #00FFFF, #000000)',
                backgroundSize: '400% 100%',
                animation: 'gradient-shift 5s linear infinite'
              }}
            >
              インフルエンサーと一緒にAIを覚えませんか
            </span>
          </motion.h1>

          {/* サブタイトル */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl lg:text-2xl text-gray-800 mb-8 leading-relaxed max-w-4xl mx-auto font-semibold"
          >
            AI×SNS完全自動化で売上3倍UP
          </motion.p>

          {/* 3つのサービス領域 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-8"
          >
            {/* SNSコンサル */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-200/30 hover:shadow-xl hover:border-blue-300/50 transition-all duration-300 group">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">SNSコンサル</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                <span className="font-semibold text-blue-600">AIコンテンツ生成</span>&<br />
                <span className="font-semibold text-cyan-600">AIリサーチ</span>・<span className="font-semibold text-teal-600">AI自動運用</span>
              </p>
            </div>

            {/* LLM検索対策 */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-200/30 hover:shadow-xl hover:border-purple-300/50 transition-all duration-300 group">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">LLM検索対策</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                <span className="font-semibold text-purple-600">ChatGPT</span>・<br />
                <span className="font-semibold text-pink-600">Google-AIモード対策</span>
              </p>
            </div>

            {/* AIシステム開発 */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-green-200/30 hover:shadow-xl hover:border-green-300/50 transition-all duration-300 group">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">AIシステム開発</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                <span className="font-semibold text-green-600">AI駆動開発</span><br />
                <span className="text-xs text-gray-500">Enterprise Ready</span>
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
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg">
              AIモード時代の勝者になる
            </div>
          </motion.div>

          {/* CTA ボタン */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button className="group relative px-10 py-5 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 text-white font-bold text-lg rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 border-2 border-white/20">
              <span className="relative z-10 flex items-center gap-2">
                無料相談・75%還付申請サポート
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            
            <button className="group px-8 py-4 border-2 border-gray-400 text-gray-700 font-bold text-lg rounded-full backdrop-blur-sm hover:bg-gray-100 hover:border-gray-500 transition-all duration-300 shadow-lg">
              <span className="flex items-center gap-2">
                AI×SNS実績を見る
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </button>
          </motion.div>

          {/* 人材開発助成金対象AI研修 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {/* ChatGPT研修 */}
            <div className="text-center bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-green-200/30 hover:shadow-xl hover:border-green-300/50 transition-all duration-300 group">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/1024px-ChatGPT_logo.svg.png" 
                  alt="ChatGPT" 
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">ChatGPT</h3>
              <p className="text-sm text-gray-600 font-medium mb-2">基礎から応用まで</p>
              <div className="text-xs text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full">助成金対象研修</div>
            </div>

            {/* Claude研修 */}
            <div className="text-center bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-orange-200/30 hover:shadow-xl hover:border-orange-300/50 transition-all duration-300 group">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <img 
                  src="https://pbs.twimg.com/profile_images/1743323340806795264/j1L8K8vQ_400x400.jpg" 
                  alt="Claude" 
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Claude</h3>
              <p className="text-sm text-gray-600 font-medium mb-2">高度な分析・推論</p>
              <div className="text-xs text-orange-600 font-bold bg-orange-50 px-3 py-1 rounded-full">助成金対象研修</div>
            </div>

            {/* Gemini研修 */}
            <div className="text-center bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-200/30 hover:shadow-xl hover:border-blue-300/50 transition-all duration-300 group">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <img 
                  src="https://yt3.googleusercontent.com/bWC6-gisM3yyP9EQ0zb-H5UdJhqzKRMZGjBTWjCXVHvwm-H-R6S7RNAy8SuKm3K-e7z6Xg2gRA=s900-c-k-c0x00ffffff-no-rj" 
                  alt="Gemini" 
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Gemini</h3>
              <p className="text-sm text-gray-600 font-medium mb-2">マルチモーダルAI</p>
              <div className="text-xs text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-full">助成金対象研修</div>
            </div>
          </motion.div>

          {/* 追加のAI×SNS強調メッセージ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200 rounded-full px-6 py-3">
              <span className="text-blue-800 font-semibold text-lg">AIが24時間働く時代、あなたの競合はもう始めています</span>
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
          <span className="text-sm font-medium">AI×SNS詳細を見る</span>
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mt-2 animate-bounce"></div>
          </div>
        </div>
      </motion.div>
    </section>
  )
} 