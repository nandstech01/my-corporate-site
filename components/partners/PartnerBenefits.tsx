'use client'

import { motion } from 'framer-motion'

export default function PartnerBenefits() {
  const benefits = [
    {
      icon: '💰',
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
      icon: '🚀',
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
      icon: '🤝',
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
      icon: '📈',
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
    <section id="benefits" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* セクションヘッダー */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
          >
            パートナーになる
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              メリット
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            AI検索時代の最先端技術を活用した、
            <br />
            <span className="font-semibold text-purple-600">高収益・低リスク</span>
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
              className="group bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              {/* アイコンとタイトル */}
              <div className="flex items-start gap-4 mb-6">
                <div className={`text-5xl p-4 rounded-2xl bg-gradient-to-r ${benefit.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-lg">{benefit.description}</p>
                </div>
              </div>

              {/* 詳細リスト */}
              <ul className="space-y-3">
                {benefit.details.map((detail, detailIndex) => (
                  <li key={detailIndex} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${benefit.color}`}></div>
                    <span className="text-gray-700 font-medium">{detail}</span>
                  </li>
                ))}
              </ul>

              {/* ホバーエフェクト */}
              <div className={`absolute inset-0 bg-gradient-to-r ${benefit.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
            </motion.div>
          ))}
        </div>

        {/* 収益シミュレーション */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 bg-gradient-to-r from-purple-50 to-blue-50 rounded-3xl p-8 lg:p-12 border border-purple-200"
        >
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-8">
            💰 収益シミュレーション
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-3xl mb-3">🥉</div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">ベーシック</h4>
              <div className="text-2xl font-bold text-purple-600 mb-2">月1件成約</div>
              <div className="text-lg text-gray-600">月収: 150万円</div>
              <div className="text-sm text-gray-500">年収: 1,800万円</div>
            </div>
            
            <div className="text-center bg-white rounded-2xl p-6 shadow-lg border-2 border-gold">
              <div className="text-3xl mb-3">🥈</div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">スタンダード</h4>
              <div className="text-2xl font-bold text-blue-600 mb-2">月2件成約</div>
              <div className="text-lg text-gray-600">月収: 300万円</div>
              <div className="text-sm text-gray-500">年収: 3,600万円</div>
            </div>
            
            <div className="text-center bg-white rounded-2xl p-6 shadow-lg border-2 border-yellow-400">
              <div className="text-3xl mb-3">🥇</div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">プレミアム</h4>
              <div className="text-2xl font-bold text-red-600 mb-2">月3件成約</div>
              <div className="text-lg text-gray-600">月収: 450万円</div>
              <div className="text-sm text-gray-500">年収: 5,400万円</div>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600 text-lg">
              ※ 具体的な報酬体系は個別説明会にてご案内
              <br />
              <span className="font-semibold text-purple-600">月額10万円の投資で高収益を実現</span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
} 