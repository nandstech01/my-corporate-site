'use client';

import { motion } from 'framer-motion';
import { VideoCameraIcon, ClockIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const showcases = [
  {
    title: 'マーケティング代理店',
    description: 'AI動画生成システム導入により、クライアント向け動画制作を大幅に効率化',
    results: [
      { icon: VideoCameraIcon, metric: '制作時間短縮', value: '85%減' },
      { icon: ClockIcon, metric: '納期短縮', value: '週→日' },
      { icon: ChartBarIcon, metric: 'コスト削減', value: '70%減' }
    ],
    tags: ['Runway ML', 'Midjourney', 'バッチ処理', '自動化']
  },
  {
    title: 'Eコマース企業',
    description: '商品紹介動画の自動生成システムで、商品登録から動画公開までを完全自動化',
    results: [
      { icon: VideoCameraIcon, metric: '動画生成数', value: '+500%' },
      { icon: ClockIcon, metric: '作業時間', value: '90%短縮' },
      { icon: ChartBarIcon, metric: 'CVR向上', value: '+180%' }
    ],
    tags: ['Veo 3', 'DALL-E 3', 'API連携', 'ECシステム']
  },
  {
    title: '教育コンテンツ企業',
    description: 'AI技術を活用した教材動画の大量生成システムで、コンテンツ制作を革新',
    results: [
      { icon: VideoCameraIcon, metric: 'コンテンツ量', value: '+400%' },
      { icon: ClockIcon, metric: '制作期間', value: '月→週' },
      { icon: ChartBarIcon, metric: '品質向上', value: '+250%' }
    ],
    tags: ['Stable Video', 'カスタムAI', 'ワークフロー', '品質管理']
  }
];

export default function VideoShowcase() {
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
            様々な業界でAI動画生成システムが画期的な成果を上げています
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
              <div className="h-full p-8 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105">
                {/* タイトル */}
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors">
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
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center mr-3">
                          <result.icon className="w-4 h-4 text-purple-400" />
                        </div>
                        <span className="text-sm text-gray-400">{result.metric}</span>
                      </div>
                      <span className="text-lg font-bold text-purple-300">{result.value}</span>
                    </div>
                  ))}
                </div>

                {/* タグ */}
                <div className="flex flex-wrap gap-2">
                  {showcase.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full text-purple-300"
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
