'use client'

import { motion } from 'framer-motion'

export default function EstimateLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <motion.div
        className="relative h-20 w-20 mb-8"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute inset-0 rounded-full border-4 border-sdlp-border" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-sdlp-primary" />
      </motion.div>

      <motion.p
        className="text-lg font-semibold text-sdlp-text mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        見積もりを算出中...
      </motion.p>

      <motion.div
        className="flex items-center gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-2 w-2 rounded-full bg-sdlp-primary"
            animate={{ scale: [1, 1.4, 1] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>

      <motion.p
        className="text-sm text-sdlp-text-secondary mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        お客様の要件を分析しています
      </motion.p>
    </div>
  )
}
