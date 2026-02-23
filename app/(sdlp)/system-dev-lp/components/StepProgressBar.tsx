'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface StepProgressBarProps {
  currentStep: number
  totalSteps: number
}

export default function StepProgressBar({ currentStep, totalSteps }: StepProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-sdlp-text-secondary">
          質問 {currentStep} / {totalSteps}
        </span>
        <span className="text-sm font-medium text-sdlp-primary">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-sdlp-border">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-sdlp-primary to-sdlp-accent"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Step dots */}
      <div className="flex items-center justify-between mt-3 px-1">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1
          const isCompleted = step < currentStep
          const isActive = step === currentStep
          return (
            <div key={step} className="flex flex-col items-center">
              {isCompleted ? (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-sdlp-primary">
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </div>
              ) : isActive ? (
                <motion.div
                  className="h-5 w-5 rounded-full bg-sdlp-primary"
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-sdlp-border bg-white" />
              )}
            </div>
          )
        })}
      </div>

      {/* Encouragement message */}
      {currentStep === totalSteps ? (
        <motion.p
          className="text-center text-sm font-medium text-sdlp-primary mt-2"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          最後の質問です！
        </motion.p>
      ) : currentStep >= totalSteps - 2 ? (
        <motion.p
          className="text-center text-sm font-medium text-sdlp-primary mt-2"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          あと{totalSteps - currentStep}問！
        </motion.p>
      ) : null}
    </div>
  )
}
