'use client';

import { motion } from 'framer-motion';
import { 
  HashtagIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  ClockIcon,
  CogIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const services = [
  {
    icon: HashtagIcon,
    title: 'マルチプラットフォーム投稿',
    description: 'X（Twitter）、Instagram、Facebook、LinkedInなど複数のSNSプラットフォームに同時投稿できるシステムを構築します。',
    features: ['X（Twitter）API v2', 'Instagram Graph API', 'Facebook Graph API', 'LinkedIn API']
  },
  {
    icon: MagnifyingGlassIcon,
    title: 'トレンドリサーチ機能',
    description: 'AIを活用してトレンドキーワードやハッシュタグを自動分析し、最適なコンテンツ戦略を提案します。',
    features: ['トレンド分析', 'ハッシュタグ最適化', '競合分析', 'キーワード提案']
  },
  {
    icon: ChartBarIcon,
    title: 'エンゲージメント分析',
    description: '投稿のパフォーマンスを詳細に分析し、エンゲージメント向上のための具体的な改善案を提供します。',
    features: ['リアルタイム分析', 'パフォーマンス比較', 'ROI計測', 'レポート自動生成']
  },
  {
    icon: ClockIcon,
    title: 'スケジューリング機能',
    description: '最適な投稿タイミングを分析し、効果的な時間帯に自動投稿するスケジューリングシステムを提供します。',
    features: ['最適時間分析', '予約投稿', 'タイムゾーン対応', 'カレンダー連携']
  },
  {
    icon: CogIcon,
    title: 'コンテンツ自動生成',
    description: 'AIを活用して投稿文やハッシュタグを自動生成し、一貫性のあるブランドメッセージを維持します。',
    features: ['AI文章生成', 'ブランド調整', 'A/Bテスト', 'コンテンツライブラリ']
  },
  {
    icon: ShieldCheckIcon,
    title: 'セキュリティ・管理',
    description: 'API制限管理、投稿承認フロー、アカウント保護など、安全な運用をサポートします。',
    features: ['API制限管理', '承認フロー', 'アカウント保護', 'ログ監視']
  }
];

export default function SNSServicesSection() {
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
            SNS自動化サービス
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-lg text-gray-300 max-w-3xl mx-auto"
          >
            最新のSNS APIと AI技術を活用し、マーケティング効果を最大化する包括的な自動化ソリューションを提供します
          </motion.p>
        </div>

        {/* サービスグリッド */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="h-full p-8 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105">
                {/* アイコン */}
                <div className="mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <service.icon className="w-6 h-6 text-blue-400" />
                  </div>
                </div>

                {/* タイトル */}
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors">
                  {service.title}
                </h3>

                {/* 説明 */}
                <p className="text-gray-300 mb-6 leading-relaxed">
                  {service.description}
                </p>

                {/* 機能リスト */}
                <ul className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-gray-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}