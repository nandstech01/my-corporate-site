'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
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
      {/* PC版: GridMotion背景 */}
      <div className="hidden lg:block absolute inset-0 z-0">
        <GridMotion 
          items={gridItems}
          gradientColor="rgba(59, 130, 246, 0.12)"
        />
      </div>
      
      {/* スマホ版: 背景画像 */}
      <div className="block lg:hidden absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-70"
          style={{
            backgroundImage: `url('/images/lp/mobile-background.jpg')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 to-teal-50/60"></div>
      </div>
      
      {/* スマホ版: GridMotion（背景画像の上に重ねる） */}
      <div className="block lg:hidden absolute inset-0 z-[5]">
        <GridMotion 
          items={gridItems}
          gradientColor="rgba(59, 130, 246, 0.08)"
        />
      </div>
      
      {/* 文字の視認性向上のための軽量オーバーレイ */}
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] z-10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-white/30 to-amber-50/20 z-10"></div>

      {/* メインコンテンツ */}
      <div className="relative z-20 container mx-auto px-4 py-12 lg:py-20">
        <div className="max-w-7xl mx-auto">
          {/* 上部：タイトルと人物画像 */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between relative mb-8 lg:mb-12">
            {/* テキストコンテンツ */}
            <div className="flex-1 text-left lg:text-left lg:pr-8">
              {/* 助成金バッジ */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
                transition={{ duration: 0.6 }}
                className="inline-block bg-white/20 backdrop-blur-sm text-gray-800 px-3 lg:px-6 py-2 rounded-md text-xs lg:text-base mb-4 lg:mb-6 border border-gray-200/50 shadow-sm"
              >
                {/* PC版：フルテキスト */}
                <span className="hidden lg:inline">
                  <span className="font-medium">日本初</span>
                  <span className="mx-2 font-bold text-blue-600">RE × GEO実装</span>
                  <span className="mx-1 text-gray-400">|</span>
                  <span className="font-medium">SNS × AI</span>
                  <span className="mx-2 text-blue-600 font-semibold">最大80%還付</span>
                </span>
                {/* スマホ版：短縮テキスト */}
                <span className="lg:hidden">
                  <span className="font-bold text-blue-600">RE×GEO実装</span>
                  <span className="mx-1 text-gray-400">|</span>
                  <span className="text-blue-600 font-semibold">80%還付</span>
                </span>
              </motion.div>

              {/* メインタイトル */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl lg:text-4xl font-bold text-gray-900 mb-4 lg:mb-6 leading-tight"
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
                <span className="text-lg lg:text-2xl text-gray-600"> × </span>
                <span 
                  className="bg-gradient-to-r bg-clip-text text-transparent font-bold"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #9333EA, #3B82F6, #06B6D4, #3B82F6, #9333EA)',
                    backgroundSize: '400% 100%',
                    animation: 'gradient-shift 5s linear infinite'
                  }}
                >
                  RE<span className="mx-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-black text-2xl lg:text-4xl">×</span>GEO実装
                </span>
                <br />
                <span className="text-gray-800 text-2xl lg:text-5xl">日本初の</span>
                <span 
                  className="bg-gradient-to-r bg-clip-text text-transparent font-bold text-2xl lg:text-5xl"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #000000, #00FFFF, #87CEFA, #00FFFF, #000000)',
                    backgroundSize: '400% 100%',
                    animation: 'gradient-shift 5s linear infinite'
                  }}
                >
                  AI検索時代
                </span>
                <span className="text-gray-800 text-2xl lg:text-5xl">対策</span>
                <br />
                <span 
                  className="bg-gradient-to-r bg-clip-text text-transparent text-lg lg:text-2xl font-bold"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #9333EA, #3B82F6, #06B6D4, #3B82F6, #9333EA)',
                    backgroundSize: '400% 100%',
                    animation: 'gradient-shift 5s linear infinite'
                  }}
                >
                  NANDSアンバサダー『keita』
                  <br />
                  <span 
                    className="inline-block transform transition-all duration-1000 hover:scale-105"
                    style={{
                      background: 'linear-gradient(45deg, #FFD700, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7)',
                      backgroundSize: '400% 400%',
                      animation: 'rich-simple-gradient 3s ease-in-out infinite, gentle-pulse 2s ease-in-out infinite',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      textShadow: '0 0 30px rgba(255, 215, 0, 0.3)',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                    }}
                  >
                    総フォロワー20万
                  </span>
                  <br />
                  コンテンツ術を自動化
                </span>
              </motion.h1>

              {/* スマホ版人物画像 - メインタイトルとサブタイトルの間 */}
              <div className="lg:hidden flex justify-center my-6">
                <Image
                  src="/images/lp/person-avatar-mobile.png"
                  alt="人物アバター"
                  width={250}
                  height={250}
                  className="object-contain"
                  style={{ width: 'auto', height: 'auto' }}
                />
              </div>

              {/* サブタイトル */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-lg lg:text-xl text-gray-800 mb-6 lg:mb-8 leading-relaxed max-w-4xl lg:mx-auto font-semibold"
              >
                AIリスキリングで、あなたの会社の広報社員が
                <br />
                <span 
                  className="bg-gradient-to-r bg-clip-text text-transparent font-bold text-xl lg:text-2xl"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #9333EA, #3B82F6, #06B6D4, #3B82F6, #9333EA)',
                    backgroundSize: '400% 100%',
                    animation: 'gradient-shift 5s linear infinite'
                  }}
                >
                  20万フォロワー級インフルエンサーに変身！
                </span>
              </motion.p>
            </div>

            {/* 人物画像エリア - PC版のみ上部に表示 */}
            <div className="hidden lg:flex flex-shrink-0 justify-end items-start">
              {/* 人物画像は後で追加 */}
              <div className="w-80 h-80 bg-gray-200/50 rounded-full flex items-center justify-center text-gray-500 text-sm border-2 border-gray-300/50 backdrop-blur-sm">
                人物画像
                <br />
                (PNG透過)
                <br />
                PC: 300-400px
              </div>
            </div>
          </div>

          {/* 3コースカード - 正方形デザインに戻す */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {/* コース❶ */}
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-200/50 hover:shadow-xl hover:border-purple-300/70 transition-all duration-300 group">
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
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-200/50 hover:shadow-xl hover:border-blue-300/70 transition-all duration-300 group">
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
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-green-200/50 hover:shadow-xl hover:border-green-300/70 transition-all duration-300 group">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <div className="w-full h-full bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                  ❸
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">SNSコンサル講座</h3>
              <p className="text-sm text-gray-600 font-medium mb-2">keita実践手法 × NANDS技術</p>
              <div className="text-xs text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full mb-2">総フォロワー20万の実証済み手法</div>
              <div className="text-xs text-gray-500">30万円×人数（3人以上から）</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* スクロールインジケーター */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
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