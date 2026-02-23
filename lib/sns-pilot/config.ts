/**
 * SNS Pilot SaaS - Configuration
 *
 * ティア定義、使用量制限、料金設定
 */

export const SNS_PILOT_TIERS = {
  free: {
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    platforms: ['x'] as const,
    monthlyPostLimit: 10,
    overagePerPost: 0,
    aiModel: 'gpt-5-mini' as const,
    candidateCount: 1,
    mlPrediction: false,
    hitlApproval: false,
    customPrompts: 0,
    apiAccess: false,
  },
  starter: {
    name: 'Starter',
    monthlyPrice: 9800,
    annualPrice: 7840,
    platforms: ['x', 'linkedin'] as const,
    monthlyPostLimit: 60,
    overagePerPost: 100,
    aiModel: 'gpt-5.2' as const,
    candidateCount: 3,
    mlPrediction: false,
    hitlApproval: true,
    customPrompts: 3,
    apiAccess: false,
  },
  pro: {
    name: 'Pro',
    monthlyPrice: 29800,
    annualPrice: 23840,
    platforms: ['x', 'linkedin', 'instagram'] as const,
    monthlyPostLimit: 200,
    overagePerPost: 80,
    aiModel: 'gpt-5.2' as const,
    candidateCount: 5,
    mlPrediction: true,
    hitlApproval: true,
    customPrompts: -1,
    apiAccess: true,
  },
  enterprise: {
    name: 'Enterprise',
    monthlyPrice: 98000,
    annualPrice: 0,
    platforms: ['x', 'linkedin', 'instagram'] as const,
    monthlyPostLimit: -1,
    overagePerPost: 0,
    aiModel: 'gpt-5.2' as const,
    candidateCount: 5,
    mlPrediction: true,
    hitlApproval: true,
    customPrompts: -1,
    apiAccess: true,
  },
} as const

export type SnsPilotTier = keyof typeof SNS_PILOT_TIERS
export type SnsPilotPlatform = 'x' | 'linkedin' | 'instagram'

export const SNS_PILOT_PRICE_IDS: Record<string, string | undefined> = {
  free: process.env.SNS_PILOT_STRIPE_PRICE_FREE,
  starter: process.env.SNS_PILOT_STRIPE_PRICE_STARTER,
  starter_annual: process.env.SNS_PILOT_STRIPE_PRICE_STARTER_ANNUAL,
  pro: process.env.SNS_PILOT_STRIPE_PRICE_PRO,
  pro_annual: process.env.SNS_PILOT_STRIPE_PRICE_PRO_ANNUAL,
  enterprise: process.env.SNS_PILOT_STRIPE_PRICE_ENTERPRISE,
}

export function getTierByPriceId(priceId: string): SnsPilotTier {
  for (const [key, value] of Object.entries(SNS_PILOT_PRICE_IDS)) {
    if (value === priceId) {
      const tierName = key.replace('_annual', '') as SnsPilotTier
      if (tierName in SNS_PILOT_TIERS) {
        return tierName
      }
    }
  }
  return 'free'
}

export function getTierConfig(tier: SnsPilotTier) {
  return SNS_PILOT_TIERS[tier]
}

export function isPlatformAllowed(tier: SnsPilotTier, platform: SnsPilotPlatform): boolean {
  const config = SNS_PILOT_TIERS[tier]
  return (config.platforms as readonly string[]).includes(platform)
}
