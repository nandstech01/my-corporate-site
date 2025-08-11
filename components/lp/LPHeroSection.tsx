'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Galaxy from './Galaxy'
import CountUp from '../common/CountUp'
import TextType from '../common/TextType'

export default function LPHeroSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black overflow-hidden">
      {/* Galaxy 3D背景 */}
      <div className="absolute inset-0 z-0">
        <Galaxy 
          mouseRepulsion={true}
          mouseInteraction={true}
          density={1.0}
          glowIntensity={0.3}
          saturation={0.0}
          hueShift={210}
          twinkleIntensity={0.2}
          rotationSpeed={0.03}
          transparent={true}
        />
      </div>

      {/* 文字の視認性向上のための軽量オーバーレイ */}
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[0.3px] z-10"></div>

      {/* メインコンテンツ */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-4 lg:px-8 py-12 lg:py-20">
        <div className="w-full text-center max-w-6xl">
          {/* 上部バッジ */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-6 lg:mb-8"
          >
            <span className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm lg:text-base text-white font-medium">
              <TextType
                text="AI検索で選ばれる企業になるための唯一の研修"
                className="text-white font-bold"
                typingSpeed={75}
                showCursor={false}
                startOnVisible={true}
                loop={false}
                initialDelay={0}
                as="span"
                textColors={["#ffffff"]}
              />
            </span>
          </motion.div>

          {/* メインタイトル */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-4 lg:mb-6 leading-tight"
          >
            {/* 法人リスキリングAI習得DX研修 - 2段構成 */}
            <div className="mb-3 lg:mb-4 space-y-1 lg:space-y-2">
              {/* 1段目: 法人リスキリング */}
              <div>
                <span 
                  className="bg-gradient-to-r bg-clip-text text-transparent font-bold text-4xl lg:text-8xl"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #00FFFF, #40E0D0, #00E5FF, #00CED1, #00FFFF)',
                    backgroundSize: '400% 100%',
                    animation: 'gradient-shift 5s linear infinite'
                  }}
                >
                  法人リスキリング
                </span>
              </div>
              {/* 2段目: AI習得DX研修 */}
              <div>
                <span className="text-white font-bold text-lg lg:text-3xl tracking-wider opacity-90">AI習得DX研修</span>
              </div>
            </div>


          </motion.h1>

          {/* プレミアムサブタイトル */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-6 lg:mb-8"
          >
            {/* PC版 - 2段中央揃え */}
            <div className="hidden lg:block text-center space-y-3">
              <div className="text-4xl">
                <span className="text-white font-bold">上級者の</span>
                <span 
                  className="bg-gradient-to-r bg-clip-text text-transparent font-bold"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #00FFFF, #40E0D0, #00E5FF, #00CED1, #00FFFF)',
                    backgroundSize: '400% 100%',
                    animation: 'gradient-shift 5s linear infinite'
                  }}
                >
                  『自動集客ノウハウ』
                </span>
                <span className="text-white font-bold">を</span>
              </div>
              <div className="text-4xl flex items-end justify-center space-y-3">
                <span className="text-white font-bold">助成金</span>
                <div className="text-cyan-400 font-bold flex items-baseline mx-2">
                  <CountUp
                    from={0}
                    to={75}
                    duration={1.5}
                    delay={0.5}
                    className="text-7xl leading-none"
                  />
                  <span className="text-5xl leading-none">％</span>
                </div>
                <span className="text-white font-bold">で習得</span>
              </div>
            </div>

            {/* PC版無料相談ボタン */}
            <div className="hidden lg:flex justify-center mt-8">
              <button
                onClick={() => {
                  const targetSection = document.querySelector('#keita-nands-program');
                  if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 p-1 shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105"
              >
                <div className="relative bg-gradient-to-r from-gray-900 via-slate-900 to-black rounded-lg px-12 py-6 group-hover:from-gray-800 group-hover:via-slate-800 group-hover:to-gray-900 transition-all duration-300">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                      <div className="relative w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <span className="text-white font-bold text-2xl tracking-wide">
                      無料相談を申し込む
                    </span>
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                  <p className="text-cyan-300 text-base text-center mt-3 opacity-90">
                    keita×NANDS 特別プログラム申込受付中
                  </p>
                </div>
              </button>
            </div>
            
            {/* スマホ版 - 2段中央揃え */}
            <div className="lg:hidden text-center space-y-3">
              {/* 1段目 */}
              <div className="text-lg">
                <span className="text-white font-bold">上級者の</span>
                <span 
                  className="bg-gradient-to-r bg-clip-text text-transparent font-bold"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #00FFFF, #40E0D0, #00E5FF, #00CED1, #00FFFF)',
                    backgroundSize: '400% 100%',
                    animation: 'gradient-shift 5s linear infinite'
                  }}
                >
                  『自動集客ノウハウ』
                </span>
                <span className="text-white font-bold">を</span>
              </div>
              {/* 2段目 */}
              <div className="text-lg flex items-end justify-center gap-2">
                <span className="text-white font-bold">助成金</span>
                <div className="text-cyan-400 font-bold flex items-baseline mx-2">
                  <CountUp
                    from={0}
                    to={75}
                    duration={1.5}
                    delay={0.5}
                    className="text-6xl leading-none"
                  />
                  <span className="text-4xl leading-none">％</span>
                </div>
                <span className="text-white font-bold">で習得</span>
              </div>
            </div>

            {/* スマホ版無料相談ボタン */}
            <div className="lg:hidden flex justify-center mt-8">
              <button
                onClick={() => {
                  const targetSection = document.querySelector('#keita-nands-program');
                  if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 p-1 shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105"
              >
                <div className="relative bg-gradient-to-r from-gray-900 via-slate-900 to-black rounded-lg px-8 py-4 group-hover:from-gray-800 group-hover:via-slate-800 group-hover:to-gray-900 transition-all duration-300">
                  <div className="flex items-center justify-center space-x-3">
                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                      <div className="relative w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <span className="text-white font-bold text-lg tracking-wide">
                      無料相談を申し込む
                    </span>
                    <div className="flex">
                      <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                  <p className="text-cyan-300 text-sm text-center mt-2 opacity-90">
                    keita×NANDS 特別プログラム申込受付中
                  </p>
                </div>
              </button>
            </div>
          </motion.div>

          {/* 3つのスキルカード - 講師統合版 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 gap-6 lg:gap-8 max-w-4xl mx-auto mb-8 lg:mb-12"
          >
            {/* AI引用カード + 原田賢治講師 */}
            <div className="group relative overflow-hidden rounded-xl shadow-2xl hover:shadow-3xl transform hover:scale-102 transition-all duration-300">
              {/* 青いバーヘッダー */}
              <div 
                className="p-4 lg:p-5"
                style={{
                  background: 'linear-gradient(135deg, #00FFFF 0%, #40E0D0 25%, #00E5FF 50%, #00CED1 75%, #00FFFF 100%)',
                  boxShadow: '0 8px 32px rgba(0, 255, 255, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-black opacity-80 flex-shrink-0 group-hover:opacity-100 transition-opacity"></div>
                  <TextType
                    text="ChatGPT Googleに引用されたい"
                    className="text-black font-bold text-lg lg:text-xl drop-shadow-lg"
                    typingSpeed={75}
                    showCursor={false}
                    startOnVisible={true}
                    loop={false}
                    initialDelay={500}
                  />
                </div>
              </div>
              {/* 詳細情報 + 講師カード統合 */}
              <div className="bg-gradient-to-br from-gray-900 via-slate-800 to-black p-6 border-2 border-cyan-500/20">
                <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-start items-center">
                  {/* 左側：講座詳細 */}
                  <div className="flex-1 text-center lg:text-left">
                    <h3 className="text-white font-bold text-xl mb-3">レリバンスエンジニアリング講座</h3>
                    <div className="space-y-2 mb-4">
                      <p className="text-cyan-300 font-semibold text-sm">AIO・GEO対策完全実装</p>
                      <p className="text-white text-sm">日本初RE・GEO実装企業が指導</p>
                    </div>
                    <div className="bg-cyan-500/10 rounded-lg p-3 border border-cyan-500/30 mb-4">
                      <p className="text-cyan-300 font-bold text-lg">30万円×人数（5人以上から）</p>
                    </div>
                    
                    {/* AI プラットフォームロゴ */}
                    <div className="flex flex-wrap justify-center lg:justify-start gap-3 items-center">
                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
                        <div className="w-4 h-4 bg-green-500 rounded-sm flex items-center justify-center">
                          <span className="text-white text-xs font-bold">C</span>
                        </div>
                        <span className="text-white text-xs font-medium">ChatGPT</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
                        <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center">
                          <span className="text-white text-xs font-bold">G</span>
                        </div>
                        <span className="text-white text-xs font-medium">Google</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
                        <div className="w-4 h-4 bg-orange-500 rounded-sm flex items-center justify-center">
                          <span className="text-white text-xs font-bold">C</span>
                        </div>
                        <span className="text-white text-xs font-medium">Claude</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
                        <div className="w-4 h-4 bg-cyan-500 rounded-sm flex items-center justify-center">
                          <span className="text-white text-xs font-bold">P</span>
                        </div>
                        <span className="text-white text-xs font-medium">Perplexity</span>
                      </div>
                    </div>
                  </div>
                  {/* 右側：講師カード（原田賢治） */}
                  <div className="relative bg-gradient-to-br from-blue-900/30 via-purple-900/30 to-black/50 rounded-xl p-4 border border-cyan-500/30 backdrop-blur-sm overflow-hidden min-w-[200px]">
                    {/* 宇宙背景エフェクト */}
                    <div className="absolute top-1 left-1 w-0.5 h-0.5 bg-yellow-300 rounded-full animate-pulse"></div>
                    <div className="absolute top-3 right-2 w-1 h-1 bg-white rounded-full animate-pulse"></div>
                    <div className="absolute bottom-2 left-3 w-0.5 h-0.5 bg-cyan-300 rounded-full animate-pulse"></div>
                    <div className="absolute bottom-4 right-1 w-0.5 h-0.5 bg-blue-300 rounded-full animate-pulse"></div>
                    
                    <div className="relative z-10 text-center">
                      {/* プロフィール画像 */}
                      <div className="mx-auto w-16 h-16 bg-gray-600 rounded-full mb-3 flex items-center justify-center border-2 border-cyan-500/30">
                        <div className="text-gray-400 text-xs text-center leading-tight">
                          人物画像<br />
                          (PNG透過)<br />
                          80px
                        </div>
                      </div>
                      
                      {/* 講師情報 */}
                      <div className="space-y-2">
                        {/* 専門分野 */}
                        <div 
                          className="inline-block px-2 py-1 rounded-full text-xs font-bold"
                          style={{
                            background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
                            border: '1px solid rgba(255,255,255,0.1)'
                          }}
                        >
                          <span 
                            className="text-xs"
                            style={{ 
                              color: '#00FFFF',
                              textShadow: '0 0 8px rgba(0, 255, 255, 0.5)'
                            }}
                          >
                            レリバンスエンジニアリング専門家
                          </span>
                        </div>
                        
                        {/* 講師名・肩書き */}
                        <div 
                          className="px-3 py-2 rounded-full"
                          style={{
                            background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
                            border: '1px solid rgba(255,255,255,0.1)'
                          }}
                        >
                          <div className="text-white text-xs font-medium">RE専門講師</div>
                          <div className="text-white font-bold text-sm">NANDS CEO</div>
                          <div 
                            className="font-black text-base"
                            style={{ 
                              color: '#00FFFF',
                              textShadow: '0 0 12px rgba(0, 255, 255, 0.6)'
                            }}
                          >
                            原田賢治
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SNS自動化カード + keita講師 */}
            <div className="group relative overflow-hidden rounded-xl shadow-2xl hover:shadow-3xl transform hover:scale-102 transition-all duration-300">
              {/* 青いバーヘッダー */}
              <div 
                className="p-4 lg:p-5"
                style={{
                  background: 'linear-gradient(135deg, #00FFFF 0%, #40E0D0 25%, #00E5FF 50%, #00CED1 75%, #00FFFF 100%)',
                  boxShadow: '0 8px 32px rgba(0, 255, 255, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-black opacity-80 flex-shrink-0 group-hover:opacity-100 transition-opacity"></div>
                  <TextType
                    text="SNSを自動化したい"
                    className="text-black font-bold text-lg lg:text-xl drop-shadow-lg"
                    typingSpeed={75}
                    showCursor={false}
                    startOnVisible={true}
                    loop={false}
                    initialDelay={1000}
                  />
                </div>
              </div>
              {/* 詳細情報 + 講師カード統合 */}
              <div className="bg-gradient-to-br from-gray-900 via-slate-800 to-black p-6 border-2 border-cyan-500/20">
                <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start">
                  {/* 左側：講座詳細 */}
                  <div className="flex-1 text-center lg:text-left">
                    <h3 className="text-white font-bold text-xl mb-3">インフルエンサー実践講座</h3>
                    <div className="space-y-2 mb-4">
                      <p className="text-cyan-300 font-semibold text-sm">総フォロワー20万の実証済み手法</p>
                      <p className="text-white text-sm">SNS集客ノウハウ・keitaアンバサダー直接指導</p>
                    </div>
                    <div className="bg-cyan-500/10 rounded-lg p-3 border border-cyan-500/30 mb-4">
                      <p className="text-cyan-300 font-bold text-lg">25万円×人数（5人以上から）</p>
                    </div>
                    
                    {/* BuzzLabリンクボタン */}
                    <div className="flex justify-center lg:justify-start">
                      <button className="group relative bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-white/20">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm font-bold">B</span>
                          </div>
                          <span className="text-sm font-medium">BuzzLab</span>
                          <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform duration-300">
                            <span className="text-white text-xs">→</span>
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </button>
                    </div>
                  </div>
                  {/* 右側：講師カード（keita） */}
                  <div className="relative bg-gradient-to-br from-blue-900/30 via-purple-900/30 to-black/50 rounded-xl p-4 border border-cyan-500/30 backdrop-blur-sm overflow-hidden min-w-[200px]">
                    {/* 宇宙背景エフェクト */}
                    <div className="absolute top-2 left-2 w-1 h-1 bg-yellow-300 rounded-full animate-pulse"></div>
                    <div className="absolute top-1 right-3 w-0.5 h-0.5 bg-white rounded-full animate-pulse"></div>
                    <div className="absolute bottom-3 left-1 w-0.5 h-0.5 bg-cyan-300 rounded-full animate-pulse"></div>
                    <div className="absolute bottom-1 right-2 w-1 h-1 bg-blue-300 rounded-full animate-pulse"></div>
                    
                    <div className="relative z-10 text-center">
                      {/* プロフィール画像 */}
                      <div className="mx-auto w-16 h-16 bg-gray-600 rounded-full mb-3 flex items-center justify-center border-2 border-cyan-500/30">
                        <div className="text-gray-400 text-xs text-center leading-tight">
                          人物画像<br />
                          (PNG透過)<br />
                          80px
                        </div>
                      </div>
                      
                      {/* 講師情報 */}
                      <div className="space-y-2">
                        {/* 専門分野 */}
                        <div 
                          className="inline-block px-2 py-1 rounded-full text-xs font-bold"
                          style={{
                            background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
                            border: '1px solid rgba(255,255,255,0.1)'
                          }}
                        >
                          <span 
                            className="text-xs"
                            style={{ 
                              color: '#00FFFF',
                              textShadow: '0 0 8px rgba(0, 255, 255, 0.5)'
                            }}
                          >
                            総フォロワー20万越えSNS専門家
                          </span>
                        </div>
                        
                        {/* 講師名・肩書き */}
                        <div 
                          className="px-3 py-2 rounded-full"
                          style={{
                            background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
                            border: '1px solid rgba(255,255,255,0.1)'
                          }}
                        >
                          <div className="text-white text-xs font-medium">SNS専門講師</div>
                          <div className="text-white font-bold text-sm">NANDSアンバサダー</div>
                          <div 
                            className="font-black text-base"
                            style={{ 
                              color: '#00FFFF',
                              textShadow: '0 0 12px rgba(0, 255, 255, 0.6)'
                            }}
                          >
                            『keita』
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI内製化カード + 原田賢治講師 */}
            <div className="group relative overflow-hidden rounded-xl shadow-2xl hover:shadow-3xl transform hover:scale-102 transition-all duration-300">
              {/* 青いバーヘッダー */}
              <div 
                className="p-4 lg:p-5"
                style={{
                  background: 'linear-gradient(135deg, #00FFFF 0%, #40E0D0 25%, #00E5FF 50%, #00CED1 75%, #00FFFF 100%)',
                  boxShadow: '0 8px 32px rgba(0, 255, 255, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-black opacity-80 flex-shrink-0 group-hover:opacity-100 transition-opacity"></div>
                  <TextType
                    text="社内を内製化したい"
                    className="text-black font-bold text-lg lg:text-xl drop-shadow-lg"
                    typingSpeed={75}
                    showCursor={false}
                    startOnVisible={true}
                    loop={false}
                    initialDelay={1500}
                  />
                </div>
              </div>
              {/* 詳細情報 + 講師カード統合 */}
              <div className="bg-gradient-to-br from-gray-900 via-slate-800 to-black p-6 border-2 border-cyan-500/20">
                <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start">
                  {/* 左側：講座詳細 */}
                  <div className="flex-1 text-center lg:text-left">
                    <h3 className="text-white font-bold text-xl mb-3">AI駆動開発</h3>
                    <div className="space-y-2 mb-4">
                      <p className="text-cyan-300 font-semibold text-sm">cursor bolt.newのAIツールの使い方</p>
                      <p className="text-white text-sm">爆速で社内の内製化可能・NANDS CEO原田賢治が直接指導</p>
                    </div>
                    <div className="bg-cyan-500/10 rounded-lg p-3 border border-cyan-500/30 mb-4">
                      <p className="text-cyan-300 font-bold text-lg">35万円×人数（5人以上から）</p>
                    </div>
                    
                    {/* AI開発ツールアイコン */}
                    <div className="flex flex-wrap justify-center lg:justify-start gap-3 items-center">
                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
                        <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center">
                          <span className="text-white text-xs font-bold">C</span>
                        </div>
                        <span className="text-white text-xs font-medium">cursor</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
                        <div className="w-4 h-4 bg-yellow-500 rounded-sm flex items-center justify-center">
                          <span className="text-black text-xs font-bold">⚡</span>
                        </div>
                        <span className="text-white text-xs font-medium">bolt.new</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
                        <div className="w-4 h-4 bg-gray-800 rounded-sm flex items-center justify-center">
                          <span className="text-white text-xs font-bold">G</span>
                        </div>
                        <span className="text-white text-xs font-medium">GitHub</span>
                      </div>
                    </div>
                  </div>
                  {/* 右側：講師カード（原田賢治） */}
                  <div className="relative bg-gradient-to-br from-blue-900/30 via-purple-900/30 to-black/50 rounded-xl p-4 border border-cyan-500/30 backdrop-blur-sm overflow-hidden min-w-[200px]">
                    {/* 宇宙背景エフェクト */}
                    <div className="absolute top-3 right-3 w-1 h-1 bg-yellow-300 rounded-full animate-pulse"></div>
                    <div className="absolute top-1 left-2 w-0.5 h-0.5 bg-white rounded-full animate-pulse"></div>
                    <div className="absolute bottom-1 right-1 w-0.5 h-0.5 bg-cyan-300 rounded-full animate-pulse"></div>
                    <div className="absolute bottom-3 left-1 w-1 h-1 bg-blue-300 rounded-full animate-pulse"></div>
                    
                    <div className="relative z-10 text-center">
                      {/* プロフィール画像 */}
                      <div className="mx-auto w-16 h-16 bg-gray-600 rounded-full mb-3 flex items-center justify-center border-2 border-cyan-500/30">
                        <div className="text-gray-400 text-xs text-center leading-tight">
                          人物画像<br />
                          (PNG透過)<br />
                          80px
                        </div>
                      </div>
                      
                      {/* 講師情報 */}
                      <div className="space-y-2">
                        {/* 専門分野 */}
                        <div 
                          className="inline-block px-2 py-1 rounded-full text-xs font-bold"
                          style={{
                            background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
                            border: '1px solid rgba(255,255,255,0.1)'
                          }}
                        >
                          <span 
                            className="text-xs"
                            style={{ 
                              color: '#00FFFF',
                              textShadow: '0 0 8px rgba(0, 255, 255, 0.5)'
                            }}
                          >
                            レリバンスエンジニアリング専門家
                          </span>
                        </div>
                        
                        {/* 講師名・肩書き */}
                        <div 
                          className="px-3 py-2 rounded-full"
                          style={{
                            background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
                            border: '1px solid rgba(255,255,255,0.1)'
                          }}
                        >
                          <div className="text-white text-xs font-medium">RE専門講師</div>
                          <div className="text-white font-bold text-sm">NANDS CEO</div>
                          <div 
                            className="font-black text-base"
                            style={{ 
                              color: '#00FFFF',
                              textShadow: '0 0 12px rgba(0, 255, 255, 0.6)'
                            }}
                          >
                            原田賢治
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>



          {/* サブタイトル（スマホ版人物画像の後） */}

        </div>


      </div>



      {/* CSS Animation for gradient shift */}
      <style jsx>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </section>
  )
} 