'use client';

import { motion } from 'framer-motion';
import { VideoCameraIcon, SparklesIcon, PlayIcon } from '@heroicons/react/24/outline';

export default function VideoHeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* 背景エフェクト */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/30 to-indigo-900/20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* バッジ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 backdrop-blur-sm mb-8"
          >
            <SparklesIcon className="w-4 h-4 mr-2 text-purple-400" />
            <span className="text-sm font-medium text-purple-300">AI Video Generation</span>
          </motion.div>

          {/* メインタイトル */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
              AI動画生成・API連携
            </span>
            <br />
            <span className="text-white">システム開発</span>
          </motion.h1>

          {/* サブタイトル */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Midjourney、Veo 3、Runway MLなどの最新AI動画生成APIを活用し、
            <br className="hidden md:block" />
            コンテンツ制作を革新的に効率化するシステムを構築します
          </motion.p>

          {/* 特徴アイコン */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-8 mb-12"
          >
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                <VideoCameraIcon className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-gray-300 font-medium">自動動画生成</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-pink-500/20 border border-pink-500/30">
                <SparklesIcon className="w-5 h-5 text-pink-400" />
              </div>
              <span className="text-gray-300 font-medium">AI画像生成</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
                <PlayIcon className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="text-gray-300 font-medium">バッチ処理</span>
            </div>
          </motion.div>

          {/* CTAボタン */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              無料デモを見る
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 border border-gray-600 text-gray-300 font-semibold rounded-xl hover:bg-white/5 transition-all duration-300"
            >
              技術詳細を確認
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
