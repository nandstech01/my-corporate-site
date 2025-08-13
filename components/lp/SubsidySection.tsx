'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import TextType from '../common/TextType'
import Threads from './Threads'

export default function SubsidySection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  return (
    <section ref={ref} className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        {/* 実績データセクションのみ残す */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={itemVariants}
          className="relative max-w-4xl mx-auto"
        >
          {/* 背景Threads */}
          <Threads color={[0.0, 0.85, 1.0]} amplitude={1} distance={0.0} enableMouseInteraction={true} />
          <div className="relative bg-white/90 backdrop-blur-sm p-8 lg:p-10 rounded-2xl shadow-xl border border-cyan-100 overflow-hidden">
            <div className="text-center mb-8">
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                <TextType
                  text="keita×NANDS 実績データ"
                  className="text-gray-900"
                  typingSpeed={75}
                  showCursor={false}
                  startOnVisible={true}
                  loop={false}
                  initialDelay={0}
                  as="span"
                />
              </h3>
              <p className="text-gray-600">実証済みの圧倒的な成果を確認してください</p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  keita SNS実績
                </h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-cyan-50/60 rounded-lg">
                    <span className="text-gray-700">Instagram</span>
                    <span className="font-bold text-gray-900">10万フォロワー</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-cyan-50/60 rounded-lg">
                    <span className="text-gray-700">TikTok</span>
                    <span className="font-bold text-cyan-700">54.6K</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-cyan-50/60 rounded-lg">
                    <span className="text-gray-700">総フォロワー</span>
                    <span className="font-bold text-cyan-700">20万</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  NANDS技術実績
                </h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50/70 rounded-lg">
                    <span className="text-gray-700">ベクトル検索精度</span>
                    <span className="font-bold text-green-600">630%向上</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50/70 rounded-lg">
                    <span className="text-gray-700">コスト削減</span>
                    <span className="font-bold text-green-600">94%削減</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50/70 rounded-lg">
                    <span className="text-gray-700">助成金成功率</span>
                    <span className="font-bold text-green-600">98%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <div className="inline-block bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg">
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                インフルエンサーレベル × 実証済み技術力 = 他社を圧倒
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
} 