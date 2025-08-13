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
          <div className="relative bg-white/75 backdrop-blur-xl p-8 lg:p-10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-white/30 ring-1 ring-white/50 overflow-hidden">
            <div className="text-center mb-8 relative">
              <div className="pointer-events-none absolute -inset-x-10 -top-10 h-24 bg-gradient-to-b from-white/60 to-transparent blur-xl"></div>
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
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/70 rounded-xl p-3 border border-gray-200/50">
                      <div className="text-xs text-gray-500">Instagram</div>
                      <div className="text-lg font-bold text-gray-900">10万フォロワー</div>
                    </div>
                    <div className="bg-white/70 rounded-xl p-3 border border-gray-200/50">
                      <div className="text-xs text-gray-500">TikTok</div>
                      <div className="text-lg font-bold text-cyan-700">54.6K</div>
                    </div>
                  </div>
                  <div className="bg-white/70 rounded-xl p-3 border border-gray-200/50">
                    <div className="text-xs text-gray-500">総フォロワー</div>
                    <div className="text-lg font-bold text-cyan-700">20万</div>
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
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-50/80 rounded-xl p-3 border border-green-200/50">
                      <div className="text-xs text-gray-500">AI引用率</div>
                      <div className="text-lg font-bold text-green-600">最大400%向上</div>
                    </div>
                    <div className="bg-green-50/80 rounded-xl p-3 border border-green-200/50">
                      <div className="text-xs text-gray-500">コスト削減</div>
                      <div className="text-lg font-bold text-green-600">94%削減</div>
                    </div>
                  </div>
                  <div className="bg-green-50/80 rounded-xl p-3 border border-green-200/50">
                    <div className="text-xs text-gray-500">助成金成功率</div>
                    <div className="text-lg font-bold text-green-600">98%</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <div className="inline-block bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-full font-semibold shadow-[0_10px_30px_rgba(59,130,246,0.35)] ring-1 ring-white/40">
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