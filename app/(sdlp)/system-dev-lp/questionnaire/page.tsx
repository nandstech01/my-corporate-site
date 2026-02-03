'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import QuestionnaireWizard from '../components/QuestionnaireWizard'

export default function QuestionnairePage() {
  return (
    <div className="min-h-screen bg-sdlp-bg-card">
      {/* Header */}
      <header className="bg-white border-b border-sdlp-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <Link
              href="/system-dev-lp"
              className="flex items-center gap-2 text-sm text-sdlp-text-secondary hover:text-sdlp-text transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              LPに戻る
            </Link>
            <div className="text-sm font-semibold text-sdlp-text">
              <span className="text-sdlp-primary">N&S</span> 無料シミュレーション
            </div>
            <div className="w-20" />
          </div>
        </div>
      </header>

      {/* Wizard */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <QuestionnaireWizard />
      </div>
    </div>
  )
}
