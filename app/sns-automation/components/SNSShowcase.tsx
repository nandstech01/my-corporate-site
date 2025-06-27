'use client';

import { motion } from 'framer-motion';
import { HashtagIcon, ClockIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const showcases = [
  {
    title: 'マーケティング代理店',
    description: 'SNS自動化システム導入により、クライアント管理とコンテンツ配信を大幅に効率化',
    results: [
      { icon: HashtagIcon, metric: '投稿作業時間', value: '90%短縮' },
      { icon: ClockIcon, metric: 'クライアント対応', value: '3倍高速化' },
      { icon: ChartBarIcon, metric: 'エンゲージメント', value: '+250%' }
    ],
    tags: ['X自動化', 'Instagram連携', 'スケジューリング', '分析レポート']
  },
  {
    title: 'Eコマース企業',
    description: '商品プロモーションの自動化で、複数SNSでの一貫したマーケティングを実現',
    results: [
      { icon: HashtagIcon, metric: 'SNS投稿数', value: '+400%' },
      { icon: ClockIcon, metric: '運用工数', value: '85%削減' },
      { icon: ChartBarIcon, metric: 'SNS経由売上', value: '+320%' }
    ],
    tags: ['マルチプラットフォーム', 'コンテンツ自動生成', 'ROI分析', 'トレンド分析']
  },
  {
    title: 'BtoB企業',
    description: 'LinkedIn中心のSNS戦略自動化で、リード獲得とブランド認知を大幅向上',
    results: [
      { icon: HashtagIcon, metric: 'リード獲得', value: '+180%' },
      { icon: ClockIcon, metric: '投稿頻度', value: '5倍向上' },
      { icon: ChartBarIcon, metric: 'ブランド認知', value: '+200%' }
    ],
    tags: ['LinkedIn特化', 'リードジェン', 'BtoB戦略', 'エンゲージメント分析']
  }
];

export default function SNSShowcase() {
  return (
    <section className="py-20 md:py-32 relative">
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
            導入事例
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-lg text-gray-300 max-w-3xl mx-auto"
          >
            様々な業界でSNS自動化システムが劇的な効果を上げています
          </motion.p>
        </div>

        {/* 事例グリッド */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {showcases.map((showcase, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="h-full p-8 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105">
                {/* タイトル */}
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors">
                  {showcase.title}
                </h3>

                {/* 説明 */}
                <p className="text-gray-300 mb-8 leading-relaxed">
                  {showcase.description}
                </p>

                {/* 成果指標 */}
                <div className="space-y-4 mb-8">
                  {showcase.results.map((result, resultIndex) => (
                    <div key={resultIndex} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center mr-3">
                          <result.icon className="w-4 h-4 text-blue-400" />
                        </div>
                        <span className="text-sm text-gray-400">{result.metric}</span>
                      </div>
                      <span className="text-lg font-bold text-blue-300">{result.value}</span>
                    </div>
                  ))}
                </div>

                {/* タグ */}
                <div className="flex flex-wrap gap-2">
                  {showcase.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-full text-blue-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
