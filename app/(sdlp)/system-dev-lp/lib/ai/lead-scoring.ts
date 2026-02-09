import type { ServiceType, LeadTier } from '@/lib/services/types'
import { SERVICE_CONFIGS } from '@/lib/services/config'
import type { LeadScoring } from './types'

const BUDGET_SCORES: Record<string, number> = {
  '30万円以下': 20,
  '50万円以下': 25,
  '30〜50万円': 40,
  '50〜100万円': 50,
  '100〜300万円': 70,
  '300〜500万円': 85,
  '500〜1000万円': 90,
  '500万円以上': 90,
  '1000〜2000万円': 95,
  '1000万円以上': 95,
  '2000万円以上': 100,
  '300万円以上': 90,
  '未定': 30,
}

const TIMELINE_SCORES: Record<string, number> = {
  '1ヶ月以内': 100,
  '2〜3ヶ月': 80,
  '3〜6ヶ月': 60,
  '4〜6ヶ月': 60,
  '6ヶ月以上': 40,
  '未定': 20,
}

const COMPLEXITY_SCORES: Record<string, number> = {
  S: 30,
  M: 55,
  L: 75,
  XL: 95,
}

function getTier(score: number): LeadTier {
  if (score > 80) return 'hot'
  if (score > 50) return 'warm'
  return 'cold'
}

export function scoreLeadQuality(
  answers: Record<string, unknown>,
  serviceType: ServiceType,
  complexityTier: string,
): LeadScoring {
  const config = SERVICE_CONFIGS[serviceType]
  const weights = config.scoringWeights

  const budget = String(answers.budget ?? '未定')
  const timeline = String(answers.timeline ?? '未定')

  const budgetScore = BUDGET_SCORES[budget] ?? 30
  const timelineScore = TIMELINE_SCORES[timeline] ?? 20
  const complexityScore = COMPLEXITY_SCORES[complexityTier] ?? 50

  const score = Math.round(
    budgetScore * weights.budget +
    timelineScore * weights.timeline +
    complexityScore * weights.complexity,
  )

  return {
    score,
    tier: getTier(score),
    factors: {
      budgetScore,
      timelineScore,
      complexityScore,
    },
  }
}
