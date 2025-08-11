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
      title: "本物のインフルエンサー思考を学べない",
      text: "フォロワー20万級のインフルエンサーから直接学べる機会がなく、表面的なSNS運用に留まってしまう",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      id: 2,
      icon: (
        <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      title: "日本未上陸AIモード対策の遅れ",
      text: "GoogleのAIモード、ChatGPT Search等の新検索に対応できず、競合他社に検索流入で大差をつけられてしまう",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      id: 3,
      icon: (
        <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      title: "bolt.new・AI駆動開発の導入困難",
              text: "AI駆動開発ツールの習得に時間がかかり、開発効率化が進まず競争力が低下してしまう",
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
              <span className="text-blue-700 font-semibold text-sm">法人AI×SNS人材育成の現実的課題</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-relaxed">
              多くの企業が抱える
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                次世代スキル習得の壁
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto text-center leading-relaxed">
              <span className="hidden lg:inline">
                最新AI技術の習得とインフルエンサーレベルのSNS運用は
                <br />
                従来の研修では実現困難です
              </span>
              <span className="lg:hidden">
                最新AI技術の習得と
                <br />
                インフルエンサーレベルのSNS運用は
                <br />
                従来の研修では実現困難です
              </span>
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
                <div className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                  {/* グラデーションボーダー */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${challenge.gradient} rounded-2xl p-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500`}>
                    <div className="w-full h-full bg-white rounded-2xl"></div>
                  </div>
                  
                  <div className="relative z-10">
                    {/* タイトル */}
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      {challenge.title}
                    </h3>
                    
                    {/* 説明文 */}
                    <p className="text-gray-600 leading-relaxed">
                      {challenge.text}
                    </p>
                  </div>

                </div>
              </motion.div>
            ))}
          </div>

          {/* 何ができる？セクション */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-20"
          >
            {/* セクションタイトル */}
            <div className="text-center mb-16">
              <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8">何ができる？</h3>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                <span className="hidden lg:inline">
                  <span className="font-bold text-blue-600">keita×NANDS 3コースパッケージ</span>で実現できる圧倒的な成果
                </span>
                <span className="lg:hidden">
                  <span className="font-bold text-blue-600">keita×NANDS 3コースパッケージ</span>で
                  <br />
                  実現できる圧倒的な成果
                </span>
              </p>
            </div>

            {/* 3つの価値提案カード */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* カード1: AI引用で24時間営業マン */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 40 }}
                transition={{ duration: 0.8, delay: 1.0 }}
                className="group"
              >
                <div className="bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-200 rounded-3xl p-8 border border-blue-200 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                  {/* カード上部のアイコンエリア */}
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                      {/* 将来的に画像を配置:
                      <img src="/images/solutions/ai-automation.png" alt="AI自動化" className="w-10 h-10 object-contain" />
                      */}
                    </div>
                  </div>
                  
                  {/* タイトル */}
                  <h4 className="text-2xl font-bold text-gray-900 mb-4">
                    AIに引用されれば<br />
                    <span className="text-blue-600">24時間365日の営業マン</span>
                  </h4>
                  
                  {/* 説明文 */}
                  <p className="text-gray-700 leading-relaxed mb-6 text-sm">
                    GoogleのAIモード、ChatGPT Search、Claude、Perplexityなど主要AI検索で引用されることで、睡眠中でも自動で見込み客を獲得
                  </p>
                  
                  {/* 効果指標 */}
                  <div className="bg-white/90 rounded-xl p-4 border border-blue-300/50">
                    <div className="flex items-center gap-2 text-blue-600 font-bold">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                      </svg>
                      自動集客率 300% UP
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* カード2: SNS自動化でバズコンテンツ */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 40 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="group"
              >
                <div className="bg-gradient-to-br from-purple-50 via-purple-100 to-pink-200 rounded-3xl p-8 border border-purple-200 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                  {/* カード上部のアイコンエリア */}
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                      {/* 将来的に画像を配置:
                      <img src="/images/solutions/sns-automation.png" alt="SNS自動化" className="w-10 h-10 object-contain" />
                      */}
                    </div>
                  </div>
                  
                  {/* タイトル */}
                  <h4 className="text-2xl font-bold text-gray-900 mb-4">
                    <span className="text-purple-600">SNS自動化で</span><br />
                    <span className="text-purple-600">バズコンテンツが自動配信</span>
                  </h4>
                  
                  {/* 説明文 */}
                  <p className="text-gray-700 leading-relaxed mb-6 text-sm">
                    Instagram、YouTube、TikTok、Xで20万フォロワー級のバズコンテンツを自動生成・配信。手動投稿は過去のもの
                  </p>
                  
                  {/* 効果指標 */}
                  <div className="bg-white/90 rounded-xl p-4 border border-purple-300/50">
                    <div className="flex items-center gap-2 text-purple-600 font-bold">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                      </svg>
                      エンゲージメント 500% UP
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* カード3: AI駆動開発で差別化 */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 40 }}
                transition={{ duration: 0.8, delay: 1.4 }}
                className="group"
              >
                <div className="bg-gradient-to-br from-emerald-50 via-emerald-100 to-teal-200 rounded-3xl p-8 border border-emerald-200 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                  {/* カード上部のアイコンエリア */}
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                      {/* 将来的に画像を配置:
                      <img src="/images/solutions/ai-development.png" alt="AI駆動開発" className="w-10 h-10 object-contain" />
                      */}
                    </div>
                  </div>
                  
                  {/* タイトル */}
                  <h4 className="text-2xl font-bold text-gray-900 mb-4">
                    <span className="text-emerald-600">AI駆動開発で</span><br />
                    <span className="text-emerald-600">同業他社と差別化</span>
                  </h4>
                  
                  {/* 説明文 */}
                  <p className="text-gray-700 leading-relaxed mb-6 text-sm">
                    cursor、bolt.new、VERCEL、NEXT.JSを駆使した最先端AI駆動開発で、競合が追いつけない圧倒的な開発スピードを実現
                  </p>
                  
                  {/* 効果指標 */}
                  <div className="bg-white/90 rounded-xl p-4 border border-emerald-300/50">
                    <div className="flex items-center gap-2 text-emerald-600 font-bold">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                      開発効率 1000% UP
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* 総合効果 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
              transition={{ duration: 0.8, delay: 1.6 }}
              className="mt-16 text-center"
            >
              <div className="bg-gradient-to-r from-cyan-900 via-blue-900 to-cyan-800 rounded-3xl p-8 text-white relative overflow-hidden border-2 border-cyan-300/30 hover:border-cyan-300/60 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-400/20">
                {/* 背景エフェクト */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/15 to-blue-600/15 animate-pulse"></div>
                
                <div className="relative z-10">
                  <h4 className="text-3xl font-bold mb-6">
                    <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">圧倒的な競争優位性</span>
                  </h4>
                  
                  {/* PC版 */}
                  <div className="hidden lg:block">
                    <p className="text-xl text-cyan-100 max-w-4xl mx-auto">
                      日本初実装のAI技術 × 総フォロワー20万のインフルエンサー思考で、<br />
                      <span className="font-bold text-cyan-200">同業他社が追いつけない圧倒的なポジション</span>を確立
                    </p>
                  </div>
                  
                  {/* スマホ版 */}
                  <div className="lg:hidden text-center">
                    <p className="text-lg text-cyan-100 leading-relaxed">
                      日本初実装のAI技術<br />
                      <span className="text-2xl font-bold text-cyan-200">×</span><br />
                      総フォロワー20万の<br />
                      インフルエンサー思考で、
                    </p>
                    <div className="mt-4 pt-4 border-t border-cyan-400/30">
                      <p className="text-lg text-cyan-100 leading-relaxed">
                        <span className="font-bold text-cyan-200">同業他社が追いつけない</span><br />
                        <span className="font-bold text-cyan-200">圧倒的なポジション</span>を確立
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
} 