'use client';

import { motion } from 'framer-motion';

const techCategories = [
  {
    title: 'AI動画生成API',
    technologies: [
      'Runway ML API',
      'Stable Video Diffusion',
      'Pika Labs API',
      'Google Veo 3',
      'Meta Make-A-Video',
      'Adobe Firefly Video',
      'Synthesia API',
      'D-ID API'
    ],
    color: 'from-purple-500 to-pink-500'
  },
  {
    title: 'AI画像生成API',
    technologies: [
      'Midjourney API',
      'DALL-E 3',
      'Stable Diffusion XL',
      'Adobe Firefly',
      'Google Imagen',
      'Ideogram API',
      'Leonardo AI',
      'Replicate API'
    ],
    color: 'from-pink-500 to-rose-500'
  },
  {
    title: 'バックエンド・処理',
    technologies: [
      'Node.js',
      'Python (FastAPI)',
      'FFmpeg',
      'OpenCV',
      'Redis Queue',
      'Celery',
      'WebSocket',
      'GraphQL'
    ],
    color: 'from-blue-500 to-indigo-500'
  },
  {
    title: 'インフラ・ストレージ',
    technologies: [
      'AWS S3',
      'AWS Lambda',
      'Google Cloud Storage',
      'Docker',
      'Kubernetes',
      'CDN (CloudFlare)',
      'PostgreSQL',
      'MongoDB'
    ],
    color: 'from-green-500 to-teal-500'
  }
];

export default function VideoTechStack() {
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
            技術スタック
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-lg text-gray-300 max-w-3xl mx-auto"
          >
            最新のAI動画生成技術と堅牢なインフラを組み合わせ、高品質で安定したシステムを構築します
          </motion.p>
        </div>

        {/* 技術カテゴリグリッド */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {techCategories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="h-full p-8 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300">
                {/* カテゴリタイトル */}
                <div className="mb-6">
                  <h3 className={`text-xl font-bold bg-gradient-to-r ${category.color} bg-clip-text text-transparent mb-2`}>
                    {category.title}
                  </h3>
                  <div className={`w-12 h-1 bg-gradient-to-r ${category.color} rounded-full`} />
                </div>

                {/* 技術リスト */}
                <div className="grid grid-cols-2 gap-3">
                  {category.technologies.map((tech, techIndex) => (
                    <motion.div
                      key={techIndex}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: (index * 0.1) + (techIndex * 0.05) }}
                      viewport={{ once: true }}
                      className="group/tech"
                    >
                      <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/30 hover:border-gray-600 transition-all duration-200 hover:transform hover:scale-105">
                        <span className="text-sm text-gray-300 group-hover/tech:text-white transition-colors">
                          {tech}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
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
              高速処理対応 • 大容量ストレージ • API制限管理
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
