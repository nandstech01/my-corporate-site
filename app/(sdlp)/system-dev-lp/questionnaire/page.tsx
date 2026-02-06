'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import QuestionnaireWizard from '../components/QuestionnaireWizard'

export default function QuestionnairePage() {
  return (
    <div className="relative min-h-screen bg-sdlp-bg-card overflow-hidden">
      {/* Ambient blobs (matching top page aesthetic) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative bg-white border-b border-sdlp-border">
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
              <span className="text-sdlp-primary">NANDS</span> 無料シミュレーション
            </div>
            <div className="w-20" />
          </div>
        </div>
        {/* Brand accent bar */}
        <div className="h-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />
      </header>

      {/* Wizard */}
      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <QuestionnaireWizard />
      </div>
    </div>
  )
}
