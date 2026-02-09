'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function QuestionnairePage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/system-dev-lp/questionnaire/custom-dev')
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-sdlp-bg-card">
      <div className="animate-pulse text-sm text-sdlp-text-secondary">
        リダイレクト中...
      </div>
    </div>
  )
}
