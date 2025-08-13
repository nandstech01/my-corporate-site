'use client'

import { motion } from 'framer-motion'

export default function PartnerBenefits() {
  const benefits = [
    {
      icon: (
        <svg className="w-20 h-20 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 1.343-4 3s1.79 3 4 3 4 1.343 4 3-1.79 3-4 3m0-12V4" />
        </svg>
      ),
      title: '高収益のパートナー報酬',
      description: '成約時に高額報酬をお支払い',
      details: [
        '1件あたり高額報酬体系',
        '安定した収益機会をご提供',
        '詳細は個別説明会にてご案内'
      ],
      color: 'from-yellow-400 to-orange-500'
    },
    {
      icon: (
        <svg className="w-20 h-20 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7l3-7z" />
        </svg>
      ),
      title: 'AI検索時代の先行者利益',
      description: '日本初のRE・GEO実装技術を独占販売',
      details: [
        '630%改善の実証済み技術',
        '競合他社が追いつけない技術的優位性',
        'ChatGPT、Perplexity完全対応'
      ],
      color: 'from-blue-400 to-purple-500'
    },
    {
      icon: (
        <svg className="w-20 h-20 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 8a6 6 0 10-12 0v5H4a2 2 0 00-2 2v1h20v-1a2 2 0 00-2-2h-2V8z" />
        </svg>
      ),
      title: '完全サポート体制',
      description: '営業ツールから研修まで全てサポート',
      details: [
        '専用営業資料・動画素材提供',
        '月1回のパートナー限定研修',
        '専属サポート担当者を配置'
      ],
      color: 'from-green-400 to-cyan-500'
    },
    {
      icon: (
        <svg className="w-20 h-20 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18M7 13l3 3 7-7" />
        </svg>
      ),
      title: '成長する市場',
      description: 'AIリスキリング市場は急速拡大中',
      details: [
        '市場規模：2024年500億円→2027年2000億円',
        '助成金制度で企業の導入ハードル低下',
        '先行者ほど有利なポジション獲得'
      ],
      color: 'from-pink-400 to-red-500'
    }
  ]

  return (
    <section id="benefits" className="py-20 bg-gradient-to-br from-gray-950 via-slate-900 to-black">
      <div className="container mx-auto px-4">
        {/* セクションヘッダー */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl lg:text-5xl font-bold text-white mb-6"
          >
            パートナーになる
            <br className="md:hidden" />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              メリット
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-slate-300 max-w-3xl mx-auto"
          >
            AI検索時代の最先端技術を活用した、
            <br />
            <span className="font-semibold text-cyan-300">高収益・低リスク</span>
            のパートナーシップをご提案します
          </motion.p>
        </div>

        {/* メリット一覧 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="group bg-[#0d1420]/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/10 hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              {/* アイコンとタイトル */}
              <div className="flex items-start gap-4 mb-6">
                <div className="flex items-center justify-center w-24 h-24">
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{benefit.title}</h3>
                  <p className="text-slate-300 text-lg">{benefit.description}</p>
                </div>
              </div>

              {/* 詳細リスト */}
              <ul className="space-y-3">
                {benefit.details.map((detail, detailIndex) => (
                  <li key={detailIndex} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                    <span className="text-slate-200 font-medium">{detail}</span>
                  </li>
                ))}
              </ul>

              {/* ホバーエフェクト削除（アイコン背景統一のため） */}
            </motion.div>
          ))}
        </div>

        {/* 収益シミュレーション */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 bg-white/5 rounded-3xl p-8 lg:p-12 border border-white/10"
        >
          <h3 className="text-2xl lg:text-3xl font-bold text-center text-white mb-8">
            収益シミュレーション
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center bg-white/90 rounded-2xl p-6 shadow-lg">
              <h4 className="text-xl font-bold text-gray-900 mb-2">ベーシック</h4>
              <div className="text-2xl font-bold text-cyan-600 mb-2">月1件成約</div>
              <div className="text-lg text-gray-600">月収: 150万円</div>
              <div className="text-sm text-gray-500">年収: 1,800万円</div>
            </div>
            
            <div className="text-center bg-white/90 rounded-2xl p-6 shadow-lg border-2 border-cyan-200">
              <h4 className="text-xl font-bold text-gray-900 mb-2">スタンダード</h4>
              <div className="text-2xl font-bold text-cyan-600 mb-2">月2件成約</div>
              <div className="text-lg text-gray-600">月収: 300万円</div>
              <div className="text-sm text-gray-500">年収: 3,600万円</div>
            </div>
            
            <div className="text-center bg-white/90 rounded-2xl p-6 shadow-lg border-2 border-cyan-300">
              <h4 className="text-xl font-bold text-gray-900 mb-2">プレミアム</h4>
              <div className="text-2xl font-bold text-cyan-600 mb-2">月3件成約</div>
              <div className="text-lg text-gray-600">月収: 450万円</div>
              <div className="text-sm text-gray-500">年収: 5,400万円</div>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-slate-300 text-lg">
              ※ 具体的な報酬体系は個別説明会にてご案内
              <br />
              <span className="font-semibold text-cyan-300">月額10万円の投資で高収益を実現</span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
} 