'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { ReactNode } from 'react'

interface QuestionCardProps {
  stepId: number
  title: string
  subtitle: string
  children: ReactNode
}

export default function QuestionCard({
  stepId,
  title,
  subtitle,
  children,
}: QuestionCardProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stepId}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-lg border border-sdlp-border max-w-2xl mx-auto">
          {/* Question header */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-sdlp-primary/10 text-sdlp-primary text-sm font-bold mb-3">
              {stepId}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-sdlp-text">
              {title}
            </h2>
            <p className="text-sm text-sdlp-text-secondary mt-1">{subtitle}</p>
          </div>

          {/* Question content */}
          {children}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
