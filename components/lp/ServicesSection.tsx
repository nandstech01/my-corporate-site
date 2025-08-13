'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import TextType from '../common/TextType'

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
      title: (
        <div className="text-center">
          レリバンス<br />
          エンジニアリング講座
        </div>
      ),
      duration: "6週間", 
      price: "30万円×人数（3人以上から）",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      ),
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
      borderGradient: "from-purple-200 to-pink-200",
      features: [
        "GoogleのAIモード完全対策",
        "GEO最適化で表示率が平均4倍に向上",
        "ChatGPT Search対応手法",
        "AI検索時代の生存戦略"
      ],
      badge: "日本初の実装技術",
      description: "AI検索時代に生き残るための、レリバンスエンジニアリング完全習得プログラム。"
    },
    {
      title: "SNS自動化講座",
      duration: "4週間",
      price: "30万円×人数（3人以上から）",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
      borderGradient: "from-blue-200 to-cyan-200",
      features: [
        "インフルエンサー思考法の完全習得",
        "バズるコンテンツ作成術",
        "フォロワー獲得の実践的戦略",
        "企業SNS運用の最新手法"
      ],
      badge: "総フォロワー20万の実証済み",
      description: "総フォロワー20万のkeitaから直接学ぶ、インフルエンサーレベルの発信力習得プログラム。"
    },
    {
      title: "AI駆動開発講座",
      duration: "8週間",
      price: "30万円×人数（3人以上から）",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
        </svg>
      ),
      gradient: "from-green-500 to-teal-500",
      bgGradient: "from-green-50 to-teal-50",
      borderGradient: "from-green-200 to-teal-200",
      features: [
        "AI駆動開発ツールの完全マスター",
        "効率10倍向上のワークフロー構築",
        "最新フレームワークとの統合",
        "実践的プロジェクト開発"
      ],
      badge: "開発効率10倍向上",
      description: "10時間以上のハンズオン学習で、開発効率10倍向上を実現するAI駆動開発術。"
    }
  ]

  return (
    <section id="services" ref={ref} className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="text-center mb-16"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <span className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-full text-sm font-semibold mb-4">
              法人リスキリング3コースパッケージ
            </span>
          </motion.div>
          
          <motion.h2 
            variants={itemVariants}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6"
          >
            <TextType
              text="keita×NANDS で実現する"
              className="text-gray-900"
              typingSpeed={70}
              showCursor={false}
              startOnVisible={true}
              loop={false}
              initialDelay={0}
              as="span"
            />
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              <TextType
                text="次世代人材育成プログラム"
                className=""
                typingSpeed={70}
                showCursor={false}
                startOnVisible={true}
                loop={false}
                initialDelay={300}
                as="span"
              />
            </span>
          </motion.h2>
          
          <motion.p 
            variants={itemVariants}
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            総フォロワー20万のインフルエンサー思考 × 実証済み最先端技術で、
            <br />
            企業の競争力を根本から変革する人材育成を実現。
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
              {/* 背面グロー */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-25 rounded-3xl blur-2xl transition-all duration-500`}></div>

              {/* 外枠のグラデボーダー */}
              <div className={`relative rounded-2xl p-[2px] bg-gradient-to-r ${service.gradient} transition-all duration-300 h-full`}> 
                {/* 内側カード（ガラス調） */}
                <div className={`relative bg-white/95 backdrop-blur-sm p-8 rounded-[14px] border border-transparent hover:bg-gradient-to-br ${service.bgGradient} hover:bg-opacity-90 transition-all duration-300 h-full`}>
                  {/* バッジ */}
                  <div className="absolute -top-3 left-6">
                    <span className={`inline-block bg-gradient-to-r ${service.gradient} text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg`}>
                      {service.badge}
                    </span>
                  </div>

                  <div className="pt-4">
                    {/* タイトル */}
                    <div className="text-center mb-8">
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

                    {/* 受講形式（LP専用表示） */}
                    <div className="mt-8 text-center space-y-1">
                      <p className="text-sm text-gray-700">Eラーニング6時間</p>
                      <p className="text-sm text-gray-700">ZOOM4時間</p>
                      <p className="text-sm text-gray-700">LMS搭載</p>
                    </div>
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
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 leading-snug">
                  <span className="hidden lg:inline">統合技術プラットフォーム</span>
                  <span className="lg:hidden">統合技術<br />プラットフォーム</span>
                </h3>
                <p className="text-base sm:text-lg lg:text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
                  3つの技術を組み合わせることで、
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-semibold">従来の10倍の効率性</span>
                  を実現します
                </p>
              </div>
 
              <div className="grid lg:grid-cols-3 gap-6 mt-10">
                <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-white/60 shadow-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-2">12週間</div>
                  <div className="text-sm text-gray-700">システム構築期間</div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-white/60 shadow-lg">
                  <div className="text-3xl font-bold text-green-600 mb-2">75%</div>
                  <div className="text-sm text-gray-700">運用コスト削減</div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-white/60 shadow-lg">
                  <div className="text-3xl font-bold text-purple-600 mb-2">300%</div>
                  <div className="text-sm text-gray-700">生産性向上</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
} 