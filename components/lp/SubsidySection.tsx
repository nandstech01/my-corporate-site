'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

export default function SubsidySection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  return (
    <section ref={ref} className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="text-center mb-16"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <span className="inline-block bg-blue-100 text-blue-700 px-6 py-2 rounded-full text-sm font-semibold mb-4">
              keita×NANDS コラボ特別プログラム
            </span>
          </motion.div>
          
          <motion.h2 
            variants={itemVariants}
            className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
          >
            総フォロワー20万のkeita×実証済み技術力
          </motion.h2>
          
          <motion.p 
            variants={itemVariants}
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            Instagram 10万・TikTok 54.6Kのインフルエンサーkeitaと、
            <br />
            ベクトル検索630%向上を実現したNANDSの技術力を融合。
            <br />
            <span className="text-blue-600 font-semibold">助成金活用で最大80%還付対象</span>の革新的プログラム。
          </motion.p>
        </motion.div>
        
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          <motion.div 
            variants={itemVariants}
            className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-white">❶</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">SNSコンサル講座</h3>
              <p className="text-gray-600 mb-4">4週間集中プログラム</p>
              <div className="space-y-3">
                <div className="text-3xl font-bold text-blue-600">30万円 × 人数</div>
                <div className="text-sm text-gray-500">3人以上から受講可能</div>
                <div className="text-lg text-green-600 font-semibold">助成金適用で実質6万円〜</div>
                <div className="text-sm text-gray-500">最大80%還付</div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-green-200"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-white">❷</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AIO・RE実装講座</h3>
              <p className="text-gray-600 mb-4">6週間集中プログラム</p>
              <div className="space-y-3">
                <div className="text-3xl font-bold text-green-600">30万円 × 人数</div>
                <div className="text-sm text-gray-500">3人以上から受講可能</div>
                <div className="text-lg text-green-600 font-semibold">助成金適用で実質6万円〜</div>
                <div className="text-sm text-gray-500">最大80%還付</div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-purple-200"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-white">❸</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI駆動開発講座</h3>
              <p className="text-gray-600 mb-4">8週間集中プログラム</p>
              <div className="space-y-3">
                <div className="text-3xl font-bold text-blue-600">30万円 × 人数</div>
                <div className="text-sm text-gray-500">3人以上から受講可能</div>
                <div className="text-lg text-green-600 font-semibold">助成金適用で実質6万円〜</div>
                <div className="text-sm text-gray-500">最大80%還付</div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* 助成金計算例 */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={itemVariants}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="bg-white p-8 lg:p-10 rounded-2xl shadow-xl border border-gray-100">
            <div className="text-center mb-8">
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                keita×NANDS 実績データ
              </h3>
              <p className="text-gray-600">実証済みの圧倒的な成果を確認してください</p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-4"><svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>keita SNS実績</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Instagram</span>
                    <span className="font-bold text-lg">10万フォロワー</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-red-700">TikTok</span>
                    <span className="font-bold text-lg text-red-600">54.6K</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200">
                    <span className="font-bold text-blue-800">総フォロワー</span>
                    <span className="font-bold text-2xl text-blue-600">20万</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-4"><svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>NANDS技術実績</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-green-700">ベクトル検索精度</span>
                    <span className="font-bold text-lg text-green-600">630%向上</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-green-700">コスト削減</span>
                    <span className="font-bold text-lg text-green-600">94%削減</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-200">
                    <span className="font-bold text-green-800">助成金成功率</span>
                    <span className="font-bold text-2xl text-green-600">98%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-400 text-gray-900 px-6 py-3 rounded-full font-bold">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
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