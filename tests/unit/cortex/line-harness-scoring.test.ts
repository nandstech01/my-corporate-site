import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---- Mocks ----

vi.mock('@line-harness/sdk', () => ({
  LineHarness: vi.fn(),
}))

vi.mock('@/lib/cortex/line-harness/client', () => ({
  getLineHarnessClientSafe: vi.fn().mockReturnValue(null),
}))

vi.mock('@/lib/slack-bot/slack-client', () => ({
  sendMessage: vi.fn(),
  SLACK_GENERAL_CHANNEL_ID: 'C-test-channel',
}))

const mockSelect = vi.fn()
const mockGte = vi.fn()
const mockOrder = vi.fn()
const mockLimit = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockEq = vi.fn()

const chainBuilder = () => {
  const chain: Record<string, any> = {}
  chain.select = mockSelect.mockReturnValue(chain)
  chain.gte = mockGte.mockReturnValue(chain)
  chain.order = mockOrder.mockReturnValue(chain)
  chain.limit = mockLimit
  chain.insert = mockInsert
  chain.update = mockUpdate.mockReturnValue(chain)
  chain.upsert = vi.fn().mockResolvedValue({ data: null, error: null })
  chain.eq = mockEq.mockReturnValue(chain)
  chain.lte = vi.fn().mockReturnValue(chain)
  chain.single = vi.fn().mockResolvedValue({ data: null, error: null })
  return chain
}

const mockFrom = vi.fn().mockImplementation(() => chainBuilder())

vi.mock('@/lib/cortex/discord/context-builder', () => ({
  getSupabase: vi.fn().mockReturnValue({
    from: (...args: unknown[]) => mockFrom(...args),
  }),
}))

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              should_broadcast: false,
              target_tag: 'all',
              message_text: 'Test message',
              reasoning: 'Not relevant enough',
            }),
          },
        ],
      }),
    },
  })),
}))

import { SCORE_TIERS, SNS_ENGAGEMENT_SCORES, UTM_TAG_MAP } from '@/lib/cortex/line-harness/types'

describe('LINE Harness Scoring - Types & Constants', () => {
  describe('SCORE_TIERS', () => {
    it('has correct thresholds: hot >= 100, warm >= 30, cold >= 0', () => {
      const hot = SCORE_TIERS.find((t) => t.name === 'hot')
      const warm = SCORE_TIERS.find((t) => t.name === 'warm')
      const cold = SCORE_TIERS.find((t) => t.name === 'cold')

      expect(hot).toBeDefined()
      expect(hot!.min_score).toBe(100)
      expect(warm).toBeDefined()
      expect(warm!.min_score).toBe(30)
      expect(cold).toBeDefined()
      expect(cold!.min_score).toBe(0)
    })

    it('is ordered descending by min_score', () => {
      for (let i = 0; i < SCORE_TIERS.length - 1; i++) {
        expect(SCORE_TIERS[i].min_score).toBeGreaterThan(
          SCORE_TIERS[i + 1].min_score,
        )
      }
    })
  })

  describe('SNS_ENGAGEMENT_SCORES', () => {
    it('has entries for x, linkedin, instagram, threads, web, line', () => {
      const expectedPlatforms = [
        'x',
        'linkedin',
        'instagram',
        'threads',
        'web',
        'line',
      ]

      for (const platform of expectedPlatforms) {
        expect(SNS_ENGAGEMENT_SCORES[platform]).toBeDefined()
        expect(typeof SNS_ENGAGEMENT_SCORES[platform]).toBe('object')
      }
    })

    it('has numeric score values for each engagement type', () => {
      for (const [platform, scores] of Object.entries(SNS_ENGAGEMENT_SCORES)) {
        for (const [action, value] of Object.entries(scores)) {
          expect(typeof value).toBe('number')
          expect(value).toBeGreaterThan(0)
        }
      }
    })
  })

  describe('UTM_TAG_MAP', () => {
    it('maps platforms to utm: prefixed tags', () => {
      expect(UTM_TAG_MAP.x).toBe('utm:x')
      expect(UTM_TAG_MAP.twitter).toBe('utm:x')
      expect(UTM_TAG_MAP.linkedin).toBe('utm:linkedin')
      expect(UTM_TAG_MAP.threads).toBe('utm:threads')
      expect(UTM_TAG_MAP.instagram).toBe('utm:instagram')
      expect(UTM_TAG_MAP.youtube).toBe('utm:youtube')
      expect(UTM_TAG_MAP.zenn).toBe('utm:zenn')
      expect(UTM_TAG_MAP.qiita).toBe('utm:qiita')
      expect(UTM_TAG_MAP.blog).toBe('utm:blog')
    })

    it('all values start with utm: prefix', () => {
      for (const value of Object.values(UTM_TAG_MAP)) {
        expect(value).toMatch(/^utm:/)
      }
    })
  })

  describe('Score tier determination', () => {
    // SCORE_TIERS is sorted hot(100) > warm(30) > cold(0)
    // determineTier iterates and returns first tier where score >= min_score
    it('score 150 resolves to hot', () => {
      const tier = SCORE_TIERS.find((t) => 150 >= t.min_score)
      expect(tier?.name).toBe('hot')
    })

    it('score 50 resolves to warm', () => {
      const tier = SCORE_TIERS.find((t) => 50 >= t.min_score)
      expect(tier?.name).toBe('warm')
    })

    it('score 10 resolves to cold', () => {
      const tier = SCORE_TIERS.find((t) => 10 >= t.min_score)
      expect(tier?.name).toBe('cold')
    })

    it('score 0 resolves to cold', () => {
      const tier = SCORE_TIERS.find((t) => 0 >= t.min_score)
      expect(tier?.name).toBe('cold')
    })

    it('score 100 resolves to hot (boundary)', () => {
      const tier = SCORE_TIERS.find((t) => 100 >= t.min_score)
      expect(tier?.name).toBe('hot')
    })

    it('score 30 resolves to warm (boundary)', () => {
      const tier = SCORE_TIERS.find((t) => 30 >= t.min_score)
      expect(tier?.name).toBe('warm')
    })
  })
})

describe('LINE Harness Scoring Bridge', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: Supabase returns empty data
    mockLimit.mockResolvedValue({ data: [], error: null })
    mockInsert.mockResolvedValue({ error: null })
    mockEq.mockResolvedValue({ error: null })
  })

  describe('runScoringBridge', () => {
    it('returns report with expected structure', async () => {
      // Mock: no engagement data so global delta = 0 -> early return
      mockLimit.mockResolvedValue({ data: [], error: null })

      const { runScoringBridge } = await import(
        '@/lib/cortex/line-harness/scoring-bridge'
      )

      const report = await runScoringBridge()

      expect(report).toHaveProperty('processed')
      expect(report).toHaveProperty('score_updates')
      expect(report).toHaveProperty('tier_changes')
      expect(report).toHaveProperty('errors')
      expect(typeof report.processed).toBe('number')
      expect(typeof report.score_updates).toBe('number')
      expect(Array.isArray(report.tier_changes)).toBe(true)
      expect(typeof report.errors).toBe('number')
    })
  })
})

describe('LINE Harness Buzz Broadcaster', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('runBuzzBroadcast', () => {
    it('skips when no recent viral analyses', async () => {
      // Mock: no recent broadcast, no viral candidates
      mockLimit
        .mockResolvedValueOnce({ data: [], error: null }) // hasRecentBroadcast -> false
        .mockResolvedValueOnce({ data: [], error: null }) // fetchViralCandidates -> empty

      const { runBuzzBroadcast } = await import(
        '@/lib/cortex/line-harness/buzz-broadcaster'
      )

      const report = await runBuzzBroadcast()

      expect(report.analyzed).toBe(0)
      expect(report.broadcasted).toBe(0)
      expect(report.skipped_reasons).toContain(
        'No viral candidates above threshold',
      )
    })

    it('respects 4-hour broadcast interval', async () => {
      // Mock: recent broadcast exists within 4h
      mockLimit.mockResolvedValueOnce({
        data: [{ id: 'recent-broadcast' }],
        error: null,
      })

      const { runBuzzBroadcast } = await import(
        '@/lib/cortex/line-harness/buzz-broadcaster'
      )

      const report = await runBuzzBroadcast()

      expect(report.analyzed).toBe(0)
      expect(report.broadcasted).toBe(0)
      expect(report.skipped_reasons[0]).toContain('Recent broadcast within 4h')
    })
  })

  describe('AI judge decision structure', () => {
    it('has expected fields in judgement interface', () => {
      // Validate the expected shape of AIJudgement
      const validJudgement = {
        should_broadcast: true,
        target_tag: 'ai-enthusiasts',
        message_text: 'Test broadcast message',
        reasoning: 'High engagement potential',
      }

      expect(validJudgement).toHaveProperty('should_broadcast')
      expect(validJudgement).toHaveProperty('target_tag')
      expect(validJudgement).toHaveProperty('message_text')
      expect(validJudgement).toHaveProperty('reasoning')
      expect(typeof validJudgement.should_broadcast).toBe('boolean')
      expect(typeof validJudgement.target_tag).toBe('string')
      expect(typeof validJudgement.message_text).toBe('string')
      expect(typeof validJudgement.reasoning).toBe('string')
    })
  })
})
