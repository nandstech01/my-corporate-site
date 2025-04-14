'use client'

import { motion } from 'framer-motion'

export function MainVisual() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-gray-900 py-20 text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container relative z-10 mx-auto px-4"
      >
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl"
            >
              テクノロジーで
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                未来を創造する
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mb-8 text-lg text-gray-300 md:text-xl"
            >
              最新のテクノロジーと確かな技術力で、
              <br className="hidden md:inline" />
              ビジネスの可能性を広げます。
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <a
                href="/contact"
                className="rounded-full bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
              >
                お問い合わせ
              </a>
              <a
                href="/services"
                className="rounded-full border border-white/30 px-8 py-3 font-semibold text-white transition-colors hover:bg-white/10"
              >
                サービス一覧
              </a>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative h-[400px] w-full"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-3xl">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-3xl"></div>
            </div>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-96 w-96 rounded-full bg-blue-600/30 blur-3xl"></div>
        <div className="absolute -bottom-1/4 -right-1/4 h-96 w-96 rounded-full bg-purple-600/30 blur-3xl"></div>
      </div>
    </div>
  )
} 