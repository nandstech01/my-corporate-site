/**
 * Cookie-based A/B test variant assignment for SDLP
 */

type Variant = 'A' | 'B'

interface ABTestConfig {
  readonly name: string
  readonly variants: readonly [string, string]
}

const COOKIE_PREFIX = 'sdlp_ab_'

export function getVariant(testName: string): Variant {
  if (typeof document === 'undefined') return 'A'

  const cookieName = `${COOKIE_PREFIX}${testName}`
  const existing = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${cookieName}=`))
    ?.split('=')[1]

  if (existing === 'A' || existing === 'B') return existing

  const variant: Variant = Math.random() < 0.5 ? 'A' : 'B'
  // Set cookie for 30 days
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString()
  document.cookie = `${cookieName}=${variant}; expires=${expires}; path=/system-dev-lp; SameSite=Lax`

  return variant
}

export const AB_TESTS: Record<string, ABTestConfig> = {
  hero_cta: {
    name: 'hero_cta',
    variants: ['無料シミュレーション', '30秒で概算見積もり'],
  },
} as const

export function getHeroCtaText(): string {
  const variant = getVariant('hero_cta')
  return AB_TESTS.hero_cta.variants[variant === 'A' ? 0 : 1]
}
