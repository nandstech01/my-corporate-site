'use client';

import { motion } from 'framer-motion';
import { HashtagIcon, ChartBarIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function SNSHeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32">
      {/* 背景エフェクト */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_50%)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center">
          {/* メインタイトル */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight"
          >
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              SNS自動化システム
            </span>
            <br />
            <span className="text-white">開発サービス</span>
          </motion.h1>

          {/* サブタイトル */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
          >
            X（Twitter）、Instagram、FacebookなどのSNS投稿を自動化し、<br />
            マーケティング効果を最大化するシステムを開発します
          </motion.p>

          {/* 特徴ポイント */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto"
          >
            <div className="flex flex-col items-center p-6 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center mb-4">
                <HashtagIcon className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">マルチプラットフォーム対応</h3>
              <p className="text-gray-300 text-center">X、Instagram、Facebook、LinkedIn等に対応</p>
            </div>

            <div className="flex flex-col items-center p-6 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center mb-4">
                <ChartBarIcon className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">高度な分析機能</h3>
              <p className="text-gray-300 text-center">エンゲージメント分析とパフォーマンス最適化</p>
            </div>

            <div className="flex flex-col items-center p-6 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center mb-4">
                <ClockIcon className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">完全自動化</h3>
              <p className="text-gray-300 text-center">スケジューリングからリサーチまで自動実行</p>
            </div>
          </motion.div>

          {/* CTAボタン */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/25">
              無料相談を予約
            </button>
            <button className="px-8 py-4 bg-transparent border-2 border-blue-400 text-blue-400 font-medium rounded-xl hover:bg-blue-400 hover:text-white transition-all duration-300 transform hover:scale-105">
              事例を見る
            </button>
          </motion.div>
        </div>
      </div>

      {/* 装飾的な要素 */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/10 rounded-full blur-xl" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-xl" />
      <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
      <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-cyan-400 rounded-full animate-pulse" />
    </section>
  );
}