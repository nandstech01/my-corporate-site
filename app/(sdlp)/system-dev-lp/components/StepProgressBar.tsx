'use client'

import { TOTAL_STEPS } from '../lib/questionnaireConfig'

interface StepProgressBarProps {
  currentStep: number
}

export default function StepProgressBar({ currentStep }: StepProgressBarProps) {
  const progress = (currentStep / TOTAL_STEPS) * 100

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-sdlp-text-secondary">
          質問 {currentStep} / {TOTAL_STEPS}
        </span>
        <span className="text-sm font-medium text-sdlp-primary">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-sdlp-border">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sdlp-primary to-sdlp-accent transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
