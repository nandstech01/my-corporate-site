'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Settings, FileText, Sparkles } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { DURATION, EASE } from '@/lib/motion'

interface Stage {
  readonly label: string
  readonly Icon: LucideIcon
  readonly duration: number
}

const STAGES: readonly Stage[] = [
  { label: '要件を分析中...', Icon: Search, duration: 3000 },
  { label: '技術スタックを選定中...', Icon: Settings, duration: 3000 },
  { label: '提案書を生成中...', Icon: FileText, duration: 4000 },
  { label: '最終チェック中...', Icon: Sparkles, duration: 3000 },
]

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
      transition={{ duration: DURATION.slow, ease: EASE }}
      className="relative flex flex-col items-center justify-center py-16 px-4 -mx-4 sm:-mx-6 lg:-mx-8 rounded-2xl overflow-hidden"
    >
      {/* Dark ocean background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A1628] via-[#0F172A] to-[#1E293B]" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Spinner with icon */}
        <div className="relative h-28 w-28 mb-8">
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <div className="absolute inset-0 rounded-full border-4 border-white/10" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 border-r-cyan-400/30" />
          </motion.div>

          {/* Centered icon */}
          <AnimatePresence mode="wait">
            <motion.div
              key={stageIndex}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: DURATION.normal, ease: EASE }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {stage && (
                <stage.Icon className="h-10 w-10 text-cyan-400" />
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
            transition={{ duration: DURATION.normal, ease: EASE }}
            className="text-center mb-6"
          >
            <p className="text-lg font-semibold text-white">
              {stage?.label}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Progress bar */}
        <div className="w-72 h-2 bg-white/10 rounded-full overflow-hidden mb-6">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>

        <motion.p
          className="text-sm text-white/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: DURATION.normal }}
        >
          AIがあなた専用の開発提案書を作成しています
        </motion.p>
      </div>
    </motion.div>
  )
}
