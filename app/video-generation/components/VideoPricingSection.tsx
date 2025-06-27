'use client';

import { motion } from 'framer-motion';
import { CheckIcon } from '@heroicons/react/24/outline';

const pricingPlans = [
  {
    name: 'ベーシック',
    description: '小規模な動画生成ニーズに最適',
    price: 'お見積もりいたします',
    features: [
      'AI動画生成API連携',
      'Midjourney画像生成',
      '基本的なワークフロー',
      'メール・チャットサポート',
      '月次レポート',
      '基本的なカスタマイズ'
    ],
    highlighted: false
  },
  {
    name: 'スタンダード',
    description: '中規模企業向けの包括的ソリューション',
    price: 'お見積もりいたします',
    features: [
      'マルチAPI統合（Runway ML、Veo 3）',
      'バッチ処理・自動化',
      'カスタムワークフロー',
      '専任サポート',
      'リアルタイム監視',
      '高度なカスタマイズ',
      'API制限管理',
      '品質チェック機能'
    ],
    highlighted: true
  },
  {
    name: 'エンタープライズ',
    description: '大規模企業向けのフルマネージドサービス',
    price: 'お見積もりいたします',
    features: [
      '全AI動画生成API対応',
      '完全カスタムシステム',
      '専用インフラ構築',
      '24/7専任サポート',
      'SLA保証',
      'セキュリティ強化',
      'オンサイト導入支援',
      '運用・保守サービス',
      '定期的な機能追加'
    ],
    highlighted: false
  }
];

export default function VideoPricingSection() {
  return (
    <section className="py-20 md:py-32 relative bg-gray-900/30">
      <div className="container mx-auto px-4">
        {/* セクションヘッダー */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6"
          >
            料金プラン
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-lg text-gray-300 max-w-3xl mx-auto"
          >
            お客様のニーズに合わせた柔軟な料金プランをご用意しています
          </motion.p>
        </div>

        {/* 料金プラングリッド */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className={`h-full p-8 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:transform hover:scale-105 ${
                plan.highlighted
                  ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/50'
                  : 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 hover:border-purple-500/30'
              }`}>
                {/* プラン名 */}
                <div className="mb-6">
                  <h3 className={`text-2xl font-bold mb-2 ${
                    plan.highlighted
                      ? 'text-purple-300'
                      : 'text-white group-hover:text-purple-300'
                  } transition-colors`}>
                    {plan.name}
                  </h3>
                  <p className="text-gray-300">{plan.description}</p>
                </div>

                {/* 価格 */}
                <div className="mb-8">
                  <div className={`text-xl font-bold ${
                    plan.highlighted ? 'text-purple-300' : 'text-white'
                  }`}>
                    {plan.price}
                  </div>
                </div>

                {/* 機能リスト */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 ${
                        plan.highlighted
                          ? 'bg-purple-500/30 border border-purple-400'
                          : 'bg-gray-700/50 border border-gray-600'
                      }`}>
                        <CheckIcon className={`w-3 h-3 ${
                          plan.highlighted ? 'text-purple-300' : 'text-gray-400'
                        }`} />
                      </div>
                      <span className="text-gray-300 leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTAボタン */}
                <button className={`w-full py-4 px-6 rounded-xl font-medium transition-all duration-300 ${
                  plan.highlighted
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transform hover:scale-105'
                    : 'bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-purple-500 hover:to-pink-500 transform hover:scale-105'
                }`}>
                  お問い合わせ
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 追加情報 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 backdrop-blur-sm">
            <span className="text-purple-300 font-medium">
              無料相談 • カスタマイズ対応 • 導入支援
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
