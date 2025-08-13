'use client'

import { motion } from 'framer-motion'

export default function PartnerTypes() {
  const partnerTypes = [
    {
      type: 'corporate',
      title: '法人パートナー',
      subtitle: '自社導入 + 他社紹介で高収益',
      icon: null,
      image: '/images/corporate-partner.jpg',
      benefits: [
        '自社でAIリスキリング導入（助成金80%活用）',
        '他社への紹介で高額報酬獲得',
        '月額10万円で営業権・サポート付き',
        '専用営業ツール・資料提供'
      ],
      examples: [
        '人材派遣会社: 自社+顧客企業への導入',
        'コンサル会社: サービスメニューに追加',
        'IT企業: 既存顧客への追加提案',
        '士業事務所: 顧客企業への紹介'
      ],
      color: 'from-cyan-500 to-cyan-600',
      bgColor: 'from-cyan-50 to-blue-50'
    },
    {
      type: 'influencer',
      title: 'インフルエンサーパートナー',
      subtitle: 'コンテンツ制作 + 法人紹介で収益化',
      icon: null,
      image: '/images/influencer-partner.jpg',
      benefits: [
        'SNS×AI×RE・GEOのコンテンツ制作',
        '法人への紹介で高額報酬獲得',
        '月額10万円で最先端技術の販売権',
        'keita監修の実践ノウハウ提供'
      ],
      examples: [
        'ビジネス系インフルエンサー',
        'IT・Tech系コンテンツクリエイター',
        'SNSマーケティング専門家',
        '企業研修・コンサル系インフルエンサー'
      ],
      color: 'from-cyan-500 to-cyan-600',
      bgColor: 'from-cyan-50 to-blue-50'
    }
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* セクションヘッダー */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6"
          >
            <span className="bg-gradient-to-r from-cyan-500 to-cyan-700 bg-clip-text text-transparent">
              2つのパートナータイプ
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            あなたの立場やビジネスモデルに合わせて
            <br />
            最適なパートナーシップをお選びいただけます
          </motion.p>
        </div>

        {/* パートナータイプ比較 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {partnerTypes.map((partner, index) => (
            <motion.div
              key={partner.type}
              initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className={`group relative bg-gradient-to-br ${partner.bgColor} rounded-3xl p-8 border-2 border-transparent hover:border-opacity-50 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-2xl`}
            >
              {/* ヘッダー */}
              <div className="text-center mb-8">
                {/* アイコン削除 */}
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{partner.title}</h3>
                <p className="text-lg text-gray-600">{partner.subtitle}</p>
              </div>

              {/* メリット */}
              <div className="mb-8">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${partner.color}`}></span>
                  主なメリット
                </h4>
                <ul className="space-y-3">
                  {partner.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${partner.color} mt-2 flex-shrink-0`}></div>
                      <span className="text-gray-700 font-medium">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 対象例 */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${partner.color}`}></span>
                  対象例
                </h4>
                <ul className="space-y-2">
                  {partner.examples.map((example, exampleIndex) => (
                    <li key={exampleIndex} className="flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${partner.color}`}></div>
                      <span className="text-gray-600 text-sm">{example}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* グロー効果 */}
              <div className={`absolute inset-0 bg-gradient-to-r ${partner.color} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-300`}></div>
            </motion.div>
          ))}
        </div>

        {/* 共通の特徴 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 bg-white rounded-3xl p-8 lg:p-12 shadow-lg border border-gray-200"
        >
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-8">共通のパートナー特典</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="mb-4 flex items-center justify-center">
                <svg className="w-12 h-12 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="4" y="4" width="16" height="16" rx="2" ry="2" strokeWidth="2" />
                  <path d="M12 4v16" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">専用研修</h4>
              <p className="text-gray-600 text-sm">月1回のパートナー限定研修でスキルアップ</p>
            </div>
            
            <div className="text-center">
              <div className="mb-4 flex items-center justify-center">
                <svg className="w-12 h-12 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M3 7h6l2 2h10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">営業ツール</h4>
              <p className="text-gray-600 text-sm">プレゼン資料・動画素材を完全提供</p>
            </div>
            
            <div className="text-center">
              <div className="mb-4 flex items-center justify-center">
                <svg className="w-12 h-12 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 8a6 6 0 10-12 0v5H4a2 2 0 00-2 2v1h20v-1a2 2 0 00-2-2h-2V8z" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">専属サポート</h4>
              <p className="text-gray-600 text-sm">専属担当者による営業サポート</p>
            </div>
            
            <div className="text-center">
              <div className="mb-4 flex items-center justify-center">
                <svg className="w-12 h-12 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18M7 13l3 3 7-7" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">成果管理</h4>
              <p className="text-gray-600 text-sm">専用ダッシュボードで成果を可視化</p>
            </div>
          </div>
        </motion.div>

        {/* フロー図 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16"
        >
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">収益化フロー</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">1</div>
              <h4 className="font-bold text-gray-900 mb-2">パートナー登録</h4>
              <p className="text-gray-600 text-sm">月額10万円でパートナー契約</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">2</div>
              <h4 className="font-bold text-gray-900 mb-2">研修・準備</h4>
              <p className="text-gray-600 text-sm">営業ツール習得・準備完了</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">3</div>
              <h4 className="font-bold text-gray-900 mb-2">営業・紹介</h4>
              <p className="text-gray-600 text-sm">法人への提案・成約獲得</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">4</div>
              <h4 className="font-bold text-gray-900 mb-2">報酬受取</h4>
              <p className="text-gray-600 text-sm">成約時に高額報酬をお支払い</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
} 