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
              厚生労働省認定制度
            </span>
          </motion.div>
          
          <motion.h2 
            variants={itemVariants}
            className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
          >
            人材開発支援助成金とは？
          </motion.h2>
          
          <motion.p 
            variants={itemVariants}
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            厚生労働省が提供する助成金で、企業の人材育成を支援する制度です。
            <br />
            <span className="text-blue-600 font-semibold">研修費用の75%が助成対象</span>となります。
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
                <span className="text-3xl font-bold text-white">75%</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">助成率</h3>
              <p className="text-gray-600 leading-relaxed">
                研修費用の<span className="font-semibold text-blue-600">75%が助成対象</span>
                <br />
                （中小企業の場合）
              </p>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700 font-medium">
                  例：400万円の研修 → 実質100万円負担
                </p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-green-200"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">年間申請</h3>
              <p className="text-gray-600 leading-relaxed">
                年間を通じて<span className="font-semibold text-green-600">複数回申請可能</span>
                <br />
                計画的な人材育成が実現
              </p>
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700 font-medium">
                  段階的スキルアップに最適
                </p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-purple-200"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">完全サポート</h3>
              <p className="text-gray-600 leading-relaxed">
                申請書類作成から承認まで
                <br />
                <span className="font-semibold text-purple-600">専門スタッフが完全サポート</span>
              </p>
              <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-700 font-medium">
                  申請成功率98%の実績
                </p>
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
                助成金計算シミュレーション
              </h3>
              <p className="text-gray-600">実際の負担額を確認してみましょう</p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-4"><svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>費用詳細</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">研修費用（総額）</span>
                    <span className="font-bold text-lg">400万円</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-red-700">助成金（75%）</span>
                    <span className="font-bold text-lg text-red-600">-300万円</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200">
                    <span className="font-bold text-blue-800">実質負担額</span>
                    <span className="font-bold text-2xl text-blue-600">100万円</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-4"><svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>期待効果</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-green-700">生産性向上</span>
                    <span className="font-bold text-lg text-green-600">+40%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-green-700">年間効果額</span>
                    <span className="font-bold text-lg text-green-600">1,500万円</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-200">
                    <span className="font-bold text-green-800">ROI</span>
                    <span className="font-bold text-2xl text-green-600">1,500%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-400 text-gray-900 px-6 py-3 rounded-full font-bold">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                投資回収期間：わずか24日
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
} 