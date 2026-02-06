'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Settings, FileText, Sparkles } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

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
    <div className="flex flex-col items-center justify-center py-16">
      <motion.div
        className="relative h-24 w-24 mb-8"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute inset-0 rounded-full border-4 border-sdlp-border" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-sdlp-primary border-r-sdlp-primary/30" />
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={stageIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-center mb-6"
        >
          {stage && (
            <div className="flex justify-center mb-2">
              <stage.Icon className="h-8 w-8 text-sdlp-primary" />
            </div>
          )}
          <p className="text-lg font-semibold text-sdlp-text">
            {stage?.label}
          </p>
        </motion.div>
      </AnimatePresence>

      <div className="w-64 h-2 bg-sdlp-border rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full bg-gradient-to-r from-sdlp-primary to-sdlp-accent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      <motion.p
        className="text-sm text-sdlp-text-secondary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        AIがあなた専用の開発提案書を作成しています
      </motion.p>
    </div>
  )
}
