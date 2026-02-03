import type { QuestionnaireAnswers, EstimateResult } from './types'

const BASE_PRICES: Record<string, number> = {
  WEB: 800000,
  スマホ: 1200000,
  ソフトウェア: 1000000,
  未定: 800000,
}

const BASE_DURATIONS: Record<string, number> = {
  WEB: 2,
  スマホ: 3,
  ソフトウェア: 3,
  未定: 2,
}

const SCALE_MULTIPLIERS: Record<string, number> = {
  '1-10': 1.0,
  '11-50': 1.1,
  '51-100': 1.2,
  '101-500': 1.35,
  '500以上': 1.5,
}

const FEATURE_COST_WEIGHT = 0.08

export function calculateEstimate(
  answers: QuestionnaireAnswers,
): EstimateResult {
  const systemType = answers.systemType || '未定'
  const basePrice = BASE_PRICES[systemType] ?? 800000
  const baseDuration = BASE_DURATIONS[systemType] ?? 2

  const featureCount = answers.features.length
  const featureMultiplier = 1 + featureCount * FEATURE_COST_WEIGHT

  const scaleMultiplier =
    SCALE_MULTIPLIERS[answers.employeeCount] ?? 1.0

  const rawEstimate = basePrice * featureMultiplier * scaleMultiplier

  const deviceCount = answers.devices.length
  const deviceMultiplier = deviceCount > 2 ? 1 + (deviceCount - 2) * 0.05 : 1.0

  const finalEstimate = Math.round(rawEstimate * deviceMultiplier)

  const durationMonths = Math.ceil(baseDuration * featureMultiplier)

  const breakdown = [
    { label: '基本開発費', amount: basePrice },
    {
      label: `機能追加 (${featureCount}機能)`,
      amount: Math.round(basePrice * (featureMultiplier - 1)),
    },
    {
      label: '規模対応',
      amount: Math.round(basePrice * featureMultiplier * (scaleMultiplier - 1)),
    },
  ]

  if (deviceMultiplier > 1) {
    breakdown.push({
      label: `マルチデバイス対応 (${deviceCount}デバイス)`,
      amount: Math.round(rawEstimate * (deviceMultiplier - 1)),
    })
  }

  return {
    minPrice: Math.round(finalEstimate * 0.85),
    maxPrice: Math.round(finalEstimate * 1.2),
    estimatedDuration:
      durationMonths <= 1
        ? '約1ヶ月'
        : `約${durationMonths}〜${durationMonths + 1}ヶ月`,
    breakdown,
  }
}

export function formatPrice(price: number): string {
  if (price >= 10000) {
    const man = Math.round(price / 10000)
    return `${man.toLocaleString()}万円`
  }
  return `${price.toLocaleString()}円`
}
