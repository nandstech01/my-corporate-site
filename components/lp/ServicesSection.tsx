'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

export default function ServicesSection() {
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

  const services = [
    {
      title: "システム開発",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
        </svg>
      ),
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
      borderGradient: "from-blue-200 to-cyan-200",
      features: [
        "AIO対策・レリバンスエンジニアリング",
        "AIエージェント開発（Mastra Framework）", 
        "チャットボット・RAGシステム",
        "MCPサーバー開発"
      ],
      description: "次世代のAI検索対策とシステム最適化で、御社のデジタル戦略を根本から変革します。",
      badge: "AI最適化"
    },
    {
      title: "SNS自動化",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      ),
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
      borderGradient: "from-purple-200 to-pink-200",
      features: [
        "AI投稿自動生成・配信",
        "ブランド認知度向上",
        "エンゲージメント最適化",
        "ROI測定・改善"
      ],
      description: "AIによる戦略的なコンテンツ生成で、ブランド価値を最大化し、効率的な顧客獲得を実現します。",
      badge: "マーケティング革命"
    },
    {
      title: "ベクトル化・検索",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      gradient: "from-green-500 to-teal-500",
      bgGradient: "from-green-50 to-teal-50",
      borderGradient: "from-green-200 to-teal-200",
      features: [
        "AIモード対策・記事自動生成",
        "企業内文書検索システム",
        "13法令準拠RAG検索",
        "検索精度95%向上実績"
      ],
      description: "高精度な文書検索とAIモード対策で、情報活用効率を劇的に向上させます。",
      badge: "情報革命"
    }
  ]

  return (
    <section ref={ref} className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="text-center mb-16"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <span className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-full text-sm font-semibold mb-4">
              3つの核心技術
            </span>
          </motion.div>
          
          <motion.h2 
            variants={itemVariants}
            className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
          >
            DX人材育成のための
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              実証済み技術スタック
            </span>
          </motion.h2>
          
          <motion.p 
            variants={itemVariants}
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            実際に稼働中のシステムで培った技術を、
            <br />
            御社の人材育成プログラムに活用します。
          </motion.p>
        </motion.div>
        
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative"
            >
              {/* グロー効果 */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-20 rounded-3xl blur-xl transition-all duration-500`}></div>
              
              <div className={`relative bg-white p-8 rounded-2xl border-2 border-gray-100 hover:border-transparent hover:bg-gradient-to-br ${service.bgGradient} transition-all duration-300 h-full`}>
                {/* バッジ */}
                <div className="absolute -top-3 left-6">
                  <span className={`inline-block bg-gradient-to-r ${service.gradient} text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg`}>
                    {service.badge}
                  </span>
                </div>

                <div className="pt-4">
                  {/* アイコンとタイトル */}
                  <div className="text-center mb-8">
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {service.icon}
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      {service.description}
                    </p>
                  </div>

                  {/* 機能リスト */}
                  <div className="space-y-3">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3">
                        <div className={`w-6 h-6 bg-gradient-to-br ${service.gradient} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-gray-700 text-sm leading-relaxed">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* 詳細ボタン */}
                  <div className="mt-8 text-center">
                    <button className={`group/btn inline-flex items-center gap-2 bg-gradient-to-r ${service.gradient} text-white px-6 py-3 rounded-lg font-semibold text-sm hover:shadow-lg transform hover:scale-105 transition-all duration-300`}>
                      詳細を見る
                      <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* 技術統合セクション */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={itemVariants}
          className="mt-20 max-w-5xl mx-auto"
        >
          <div className="bg-gradient-to-br from-gray-900 to-slate-800 p-8 lg:p-12 rounded-3xl text-center relative overflow-hidden">
            {/* 背景エフェクト */}
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/20 rounded-full filter blur-2xl"></div>
              <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-purple-500/20 rounded-full filter blur-2xl"></div>
            </div>

            <div className="relative z-10">
              <div className="mb-8">
                <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                  統合技術プラットフォーム
                </h3>
                <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
                  3つの技術を組み合わせることで、
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-semibold">従来の10倍の効率性</span>
                  を実現します
                </p>
              </div>

              <div className="grid lg:grid-cols-3 gap-6 mt-10">
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
                  <div className="text-3xl font-bold text-blue-400 mb-2">1週間</div>
                  <div className="text-sm text-gray-300">システム構築期間</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
                  <div className="text-3xl font-bold text-green-400 mb-2">80%</div>
                  <div className="text-sm text-gray-300">運用コスト削減</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
                  <div className="text-3xl font-bold text-purple-400 mb-2">300%</div>
                  <div className="text-sm text-gray-300">生産性向上</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
} 