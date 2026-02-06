'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Settings, FileText, Sparkles } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Stage {
  readonly label: string
  readonly Icon: LucideIcon
  readonly duration: number
  readonly color: string
}

const STAGES: readonly Stage[] = [
  { label: '要件を分析中...', Icon: Search, duration: 3000, color: 'text-blue-500' },
  { label: '技術スタックを選定中...', Icon: Settings, duration: 3000, color: 'text-violet-500' },
  { label: '提案書を生成中...', Icon: FileText, duration: 4000, color: 'text-emerald-500' },
  { label: '最終チェック中...', Icon: Sparkles, duration: 3000, color: 'text-amber-500' },
]

const particleVariants = {
  animate: (i: number) => ({
    y: [0, -30, 0],
    opacity: [0, 1, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      delay: i * 0.4,
      ease: 'easeInOut',
    },
  }),
}

export default function ProposalLoading() {
  const [stageIndex, setStageIndex] = useState(0)

  useEffect(() => {
    const stage = STAGES[stageIndex]
    if (!stage || stageIndex >= STAGES.length - 1) return

    const timer = setTimeout(() => {
      setStageIndex((prev) => Math.min(prev + 1, STAGES.length - 1))
    }, stage.duration)

    return () => clearTimeout(timer)
  }, [stageIndex])

  const stage = STAGES[stageIndex]
  const progress = ((stageIndex + 1) / STAGES.length) * 100

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16"
    >
      {/* Spinner with icon */}
      <div className="relative h-28 w-28 mb-8">
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute inset-0 rounded-full border-4 border-sdlp-border" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-sdlp-primary border-r-sdlp-primary/30" />
        </motion.div>

        {/* Centered icon */}
        <AnimatePresence mode="wait">
          <motion.div
            key={stageIndex}
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 90 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {stage && (
              <stage.Icon className={`h-10 w-10 ${stage.color}`} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Stage label */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stageIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-center mb-6"
        >
          <p className="text-lg font-semibold text-sdlp-text">
            {stage?.label}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Progress bar */}
      <div className="w-72 h-2 bg-sdlp-border rounded-full overflow-hidden mb-2">
        <motion.div
          className="h-full bg-gradient-to-r from-sdlp-primary to-sdlp-accent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex gap-2 mb-6">
        {STAGES.map((_, i) => (
          <motion.div
            key={i}
            className={`h-1.5 w-1.5 rounded-full ${
              i <= stageIndex ? 'bg-sdlp-primary' : 'bg-sdlp-border'
            }`}
            animate={i === stageIndex ? { scale: [1, 1.4, 1] } : {}}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        ))}
      </div>

      {/* Floating particles */}
      <div className="relative h-8 w-40 mb-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            custom={i}
            variants={particleVariants}
            animate="animate"
            className="absolute h-1 w-1 rounded-full bg-sdlp-primary/30"
            style={{ left: `${15 + i * 18}%` }}
          />
        ))}
      </div>

      <motion.p
        className="text-sm text-sdlp-text-secondary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        AIがあなた専用の開発提案書を作成しています
      </motion.p>
    </motion.div>
  )
}
