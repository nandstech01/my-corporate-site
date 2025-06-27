'use client';

import { motion } from 'framer-motion';
import { 
  VideoCameraIcon,
  PhotoIcon,
  SparklesIcon,
  ClockIcon,
  CogIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const services = [
  {
    icon: VideoCameraIcon,
    title: 'AI動画生成API連携',
    description: 'Runway ML、Stable Video Diffusion、Pika Labsなどの最新AI動画生成APIを統合し、高品質な動画を自動生成します。',
    features: ['Runway ML API', 'Stable Video Diffusion', 'Pika Labs連携', 'カスタム動画生成']
  },
  {
    icon: PhotoIcon,
    title: 'Midjourney・画像生成',
    description: 'Midjourney、DALL-E 3、Stable Diffusion APIを活用し、動画制作に必要な高品質画像を自動生成します。',
    features: ['Midjourney API', 'DALL-E 3連携', 'Stable Diffusion', 'バッチ画像生成']
  },
  {
    icon: SparklesIcon,
    title: 'Veo 3・Google AI',
    description: 'GoogleのVeo 3やImagenなどの最新AI技術を活用し、リアルな動画コンテンツを生成します。',
    features: ['Veo 3 API', 'Imagen Video', 'Google AI連携', 'リアル動画生成']
  },
  {
    icon: ClockIcon,
    title: 'バッチ処理・自動化',
    description: '大量の動画生成タスクを効率的に処理し、スケジューリングやキューイング機能で運用を自動化します。',
    features: ['バッチ処理', 'スケジューリング', 'キューイング', 'プログレス管理']
  },
  {
    icon: CogIcon,
    title: 'カスタムワークフロー',
    description: '企業のニーズに合わせたカスタムワークフローを構築し、動画制作プロセス全体を最適化します。',
    features: ['ワークフロー設計', 'テンプレート管理', 'プロセス自動化', 'カスタマイズ対応']
  },
  {
    icon: ShieldCheckIcon,
    title: 'セキュリティ・管理',
    description: 'API利用制限管理、コンテンツ品質チェック、著作権対策など、安全な運用をサポートします。',
    features: ['API制限管理', '品質チェック', '著作権対策', 'ログ監視']
  }
];

export default function VideoServicesSection() {
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
            AI動画生成サービス
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-lg text-gray-300 max-w-3xl mx-auto"
          >
            最新のAI動画生成技術を活用し、コンテンツ制作を革新的に効率化する包括的なソリューションを提供します
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
              <div className="h-full p-8 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105">
                {/* アイコン */}
                <div className="mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <service.icon className="w-6 h-6 text-purple-400" />
                  </div>
                </div>

                {/* タイトル */}
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors">
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
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-3 flex-shrink-0" />
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