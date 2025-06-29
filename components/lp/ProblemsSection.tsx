'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function ProblemsSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const challenges = [
    {
      id: 1,
      icon: (
        <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "助成金活用の課題",
      text: "AI研修の必要性は感じているが助成金の申請方法や最適な活用戦略がわからない",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      id: 2,
      icon: (
        <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      title: "最適研修の発見",
      text: "自社の業務フローに最適化されたAIツール研修プログラムを見つけるのが困難",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      id: 3,
      icon: (
        <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      title: "予算・ROIの不安",
      text: "AI研修への投資対効果と、実際の業務改善につながるかの懸念が大きい",
      gradient: "from-green-500 to-teal-500"
    }
  ]

  return (
    <section className="relative py-20 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      {/* 背景装飾 */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-400/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* タイトル */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-6 py-2 mb-6">
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-blue-700 font-semibold text-sm">AI研修導入における課題</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              多くの企業が抱える
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                AI人材育成の課題
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              DX推進が急務な中、AI研修導入には様々な障壁が存在します
            </p>
          </motion.div>

          {/* 課題カード */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {challenges.map((challenge, index) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
                className="group"
              >
                <div className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 border border-gray-100">
                  {/* グラデーションボーダー */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${challenge.gradient} rounded-3xl p-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500`}>
                    <div className="w-full h-full bg-white rounded-3xl"></div>
                  </div>
                  
                  <div className="relative z-10">
                    {/* アイコンと番号 */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="hover:scale-110 transition-transform duration-300">
                        {challenge.icon}
                      </div>
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${challenge.gradient} flex items-center justify-center text-white font-bold text-sm`}>
                        {challenge.id}
                      </div>
                    </div>
                    
                    {/* タイトル */}
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      {challenge.title}
                    </h3>
                    
                    {/* 説明文 */}
                    <p className="text-gray-600 leading-relaxed">
                      {challenge.text}
                    </p>
                  </div>
                  
                  {/* 装飾要素 */}
                  <div className={`absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-r ${challenge.gradient} rounded-full opacity-5 group-hover:opacity-10 transition-opacity duration-500`}></div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 解決策への導線 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-16"
          >
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl p-8 text-white">
              <div className="flex items-center justify-center gap-3 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h3 className="text-2xl font-bold">Solution</h3>
              </div>
              <p className="text-xl mb-4">
                これらの課題を<span className="font-bold text-yellow-300">人材開発支援助成金75%還付</span>で一挙解決
              </p>
              <p className="text-blue-100">
                実質25%負担でChatGPT・Claude・Gemini研修を実現し、AI人材育成を加速させます
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
} 