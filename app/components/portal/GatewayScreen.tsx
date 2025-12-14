'use client'

/**
 * GatewayScreen
 * Apple風のフルスクリーン選択画面
 * サイト訪問時に表示され、「個人様」or「法人様」を選択するとLPが表示される
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMode } from './ModeContext'

interface GatewayScreenProps {
  onComplete: () => void
}

export default function GatewayScreen({ onComplete }: GatewayScreenProps) {
  const { setMode } = useMode()
  const [isExiting, setIsExiting] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<'individual' | 'corporate' | null>(null)
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark' | null>(null)

  // システムのテーマ設定を検出
  useEffect(() => {
    // 初回実行時に即座に検出
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      // ライトモードが明示的に設定されている場合のみライトにする
      const detectedTheme = mediaQuery.matches ? 'dark' : 'light'
      
      console.log('🎨 Gateway: System theme detected =', detectedTheme)
      console.log('🎨 Gateway: prefers-color-scheme:dark matches =', mediaQuery.matches)
      console.log('🎨 Gateway: User Agent =', navigator.userAgent)
      
      setSystemTheme(detectedTheme)
      
      // テーマ変更を監視
      const handleChange = (e: MediaQueryListEvent) => {
        const newTheme = e.matches ? 'dark' : 'light'
        console.log('🎨 Gateway: System theme changed to', newTheme)
        setSystemTheme(newTheme)
      }
      
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  // ゲートウェイ表示中は背景のスクロールを無効化
  useEffect(() => {
    if (typeof window !== 'undefined' && !isExiting) {
      // 現在のスクロール位置を保存
      const scrollY = window.scrollY
      
      // スクロールを無効化
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      
      return () => {
        // クリーンアップ: スクロールを復元
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [isExiting])

  // テーマが検出されるまでダークで表示（ちらつき防止）
  if (systemTheme === null) {
    return (
      <div className="fixed inset-0 z-[100]" style={{ background: 'linear-gradient(180deg, #000000 0%, #0a0a0f 50%, #050510 100%)' }} />
    )
  }

  const handleSelect = (mode: 'individual' | 'corporate') => {
    setMode(mode)
    setIsExiting(true)
    
    // LocalStorageに選択を記憶
    if (typeof window !== 'undefined') {
      localStorage.setItem('nands-gateway-completed', 'true')
      localStorage.setItem('nands-selected-mode', mode)
    }
    
    // アニメーション後にコールバック
    setTimeout(() => {
      onComplete()
    }, 800)
  }

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          style={{
            background: systemTheme === 'dark'
              ? 'linear-gradient(180deg, #000000 0%, #0a0a0f 50%, #050510 100%)'
              : 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 50%, #e9ecef 100%)',
            touchAction: 'none' // タッチスクロールも無効化
          }}
        >
          {/* 背景のサブトルなグロー */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: systemTheme === 'dark'
                ? `
                  radial-gradient(ellipse 60% 40% at 30% 50%, rgba(59, 130, 246, 0.08) 0%, transparent 60%),
                  radial-gradient(ellipse 60% 40% at 70% 50%, rgba(168, 85, 247, 0.08) 0%, transparent 60%)
                `
                : `
                  radial-gradient(ellipse 60% 40% at 30% 50%, rgba(59, 130, 246, 0.03) 0%, transparent 60%),
                  radial-gradient(ellipse 60% 40% at 70% 50%, rgba(168, 85, 247, 0.03) 0%, transparent 60%)
                `
            }}
          />

          {/* メインコンテンツ */}
          <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-20 sm:pt-8">
            {/* ロゴ・タイトル */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center mb-6 sm:mb-12"
            >
              {/* メインコピー */}
              <div 
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 leading-relaxed sm:leading-relaxed"
                style={{ 
                  fontFamily: "'Noto Sans JP', sans-serif",
                  color: systemTheme === 'dark' ? '#ffffff' : '#1a1a1a',
                  lineHeight: '1.6'
                }}
              >
                AIに「使われる」側で終わるか。<br />
                「動かす」側になるか。
              </div>
            </motion.div>

            {/* 選択カード */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10">
              {/* 個人様カード */}
              <motion.button
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                onClick={() => handleSelect('individual')}
                onMouseEnter={() => setHoveredCard('individual')}
                onMouseLeave={() => setHoveredCard(null)}
                className="group relative rounded-3xl overflow-hidden transition-all duration-500 text-left"
                style={{
                  aspectRatio: '4/3',
                  background: systemTheme === 'dark'
                    ? (hoveredCard === 'individual'
                        ? 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
                        : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)')
                    : (hoveredCard === 'individual'
                        ? 'linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)'
                        : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'),
                  boxShadow: hoveredCard === 'individual'
                    ? (systemTheme === 'dark'
                        ? '0 25px 60px rgba(59, 130, 246, 0.4), 0 0 40px rgba(59, 130, 246, 0.2)'
                        : '0 25px 60px rgba(59, 130, 246, 0.2), 0 0 40px rgba(59, 130, 246, 0.1)')
                    : (systemTheme === 'dark'
                        ? '0 10px 40px rgba(0, 0, 0, 0.3)'
                        : '0 10px 40px rgba(0, 0, 0, 0.1)'),
                  border: systemTheme === 'dark'
                    ? '1px solid rgba(255, 255, 255, 0.05)'
                    : '1px solid rgba(0, 0, 0, 0.1)'
                }}
              >
                {/* ホバー時のグロー */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: systemTheme === 'dark'
                      ? 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 70%)'
                      : 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 70%)'
                  }}
                />

                <div className="relative z-10 h-full flex flex-col justify-between p-8 sm:p-10">
                  <div>
                    {/* 高品質バッジ */}
                    <div 
                      className="inline-block px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-4"
                      style={{
                        backgroundColor: systemTheme === 'dark' 
                          ? 'rgba(37, 99, 235, 0.12)' 
                          : 'rgba(219, 234, 254, 1)',
                        color: systemTheme === 'dark' ? '#3b82f6' : '#1e40af',
                        border: systemTheme === 'dark'
                          ? '1px solid rgba(59, 130, 246, 0.3)'
                          : '1px solid rgba(59, 130, 246, 0.25)',
                        boxShadow: systemTheme === 'dark'
                          ? '0 1px 3px rgba(0, 0, 0, 0.3)'
                          : '0 1px 2px rgba(0, 0, 0, 0.05)'
                      }}
                    >
                      稼げるAI人材への最短ルート
                    </div>
                    
                    {/* 個人様（大きく黒文字） */}
                    <div 
                      className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-5"
                      style={{ 
                        fontFamily: "'Noto Sans JP', sans-serif",
                        color: systemTheme === 'dark' ? '#ffffff' : '#1a1a1a'
                      }}
                    >
                      個人様
                    </div>
                    
                    {/* 説明文 */}
                    <p 
                      className="text-xs sm:text-sm leading-relaxed mb-4 sm:mb-8"
                      style={{
                        color: systemTheme === 'dark' ? '#9ca3af' : '#4b5563',
                        lineHeight: '1.7'
                      }}
                    >
                      1日333円で未経験でもプログラミング目指せる<br />
                      年収1000万の「AIアーキテクト」養成講座
                    </p>
                  </div>

                  {/* 矢印 */}
                  <motion.div
                    className="flex items-center gap-2 mt-auto"
                    style={{
                      color: systemTheme === 'dark' ? '#60a5fa' : '#2563eb'
                    }}
                    animate={{ x: hoveredCard === 'individual' ? 10 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="text-xs sm:text-sm font-medium">今すぐ始める</span>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </motion.div>
                </div>
              </motion.button>

              {/* 法人様カード */}
              <motion.button
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                onClick={() => handleSelect('corporate')}
                onMouseEnter={() => setHoveredCard('corporate')}
                onMouseLeave={() => setHoveredCard(null)}
                className="group relative rounded-3xl overflow-hidden transition-all duration-500 text-left"
                style={{
                  aspectRatio: '4/3',
                  background: systemTheme === 'dark'
                    ? (hoveredCard === 'corporate'
                        ? 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)'
                        : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)')
                    : (hoveredCard === 'corporate'
                        ? 'linear-gradient(135deg, #ede9fe 0%, #c4b5fd 100%)'
                        : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'),
                  boxShadow: hoveredCard === 'corporate'
                    ? (systemTheme === 'dark'
                        ? '0 25px 60px rgba(124, 58, 237, 0.4), 0 0 40px rgba(124, 58, 237, 0.2)'
                        : '0 25px 60px rgba(124, 58, 237, 0.2), 0 0 40px rgba(124, 58, 237, 0.1)')
                    : (systemTheme === 'dark'
                        ? '0 10px 40px rgba(0, 0, 0, 0.3)'
                        : '0 10px 40px rgba(0, 0, 0, 0.1)'),
                  border: systemTheme === 'dark'
                    ? '1px solid rgba(255, 255, 255, 0.05)'
                    : '1px solid rgba(0, 0, 0, 0.1)'
                }}
              >
                {/* ホバー時のグロー */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: systemTheme === 'dark'
                      ? 'radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.15) 0%, transparent 70%)'
                      : 'radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.1) 0%, transparent 70%)'
                  }}
                />

                <div className="relative z-10 h-full flex flex-col justify-between p-8 sm:p-10">
                  <div>
                    {/* 高品質バッジ */}
                    <div 
                      className="inline-block px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-4"
                      style={{
                        backgroundColor: systemTheme === 'dark' 
                          ? 'rgba(109, 40, 217, 0.12)' 
                          : 'rgba(237, 233, 254, 1)',
                        color: systemTheme === 'dark' ? '#a855f7' : '#6b21a8',
                        border: systemTheme === 'dark'
                          ? '1px solid rgba(168, 85, 247, 0.3)'
                          : '1px solid rgba(168, 85, 247, 0.25)',
                        boxShadow: systemTheme === 'dark'
                          ? '0 1px 3px rgba(0, 0, 0, 0.3)'
                          : '0 1px 2px rgba(0, 0, 0, 0.05)'
                      }}
                    >
                      AIをコストではなく戦力に
                    </div>
                    
                    {/* 法人様（大きく黒文字） */}
                    <div 
                      className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-5"
                      style={{ 
                        fontFamily: "'Noto Sans JP', sans-serif",
                        color: systemTheme === 'dark' ? '#ffffff' : '#1a1a1a'
                      }}
                    >
                      法人様
                    </div>
                    
                    {/* 説明文 */}
                    <p 
                      className="text-xs sm:text-sm leading-relaxed mb-4 sm:mb-8"
                      style={{
                        color: systemTheme === 'dark' ? '#9ca3af' : '#4b5563',
                        lineHeight: '1.7'
                      }}
                    >
                      導入して終わりではない<br />
                      利益を生み続ける仕組みを社内に構築
                    </p>
                  </div>

                  {/* 矢印 */}
                  <motion.div
                    className="flex items-center gap-2 mt-auto"
                    style={{
                      color: systemTheme === 'dark' ? '#c084fc' : '#7c3aed'
                    }}
                    animate={{ x: hoveredCard === 'corporate' ? 10 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="text-xs sm:text-sm font-medium">相談する</span>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </motion.div>
                </div>
              </motion.button>
            </div>

            {/* フッター */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-center text-[10px] sm:text-xs mt-6 sm:mt-10"
              style={{ 
                color: systemTheme === 'dark' 
                  ? 'rgba(255, 255, 255, 0.5)' 
                  : 'rgba(0, 0, 0, 0.4)',
                letterSpacing: '0.05em'
              }}
            >
              ※選択はヘッダーからいつでも変更できます
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * ゲートウェイの表示判定フック
 */
export function useGatewayState() {
  const [showGateway, setShowGateway] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // LocalStorageから状態を確認
    const completed = localStorage.getItem('nands-gateway-completed')
    
    if (!completed) {
      setShowGateway(true)
    }
    setIsLoading(false)
  }, [])

  const completeGateway = () => {
    setShowGateway(false)
  }

  const resetGateway = () => {
    localStorage.removeItem('nands-gateway-completed')
    localStorage.removeItem('nands-selected-mode')
    setShowGateway(true)
  }

  return { showGateway, isLoading, completeGateway, resetGateway }
}

