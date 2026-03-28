import { describe, it, expect, vi, beforeEach } from 'vitest'

// ============================================================
// Mock: LINE webhook-handler (replyToLine)
// ============================================================

const mockReplyToLine = vi.fn().mockResolvedValue(undefined)

vi.mock('../../../lib/cortex/line/webhook-handler', () => ({
  replyToLine: (...args: unknown[]) => mockReplyToLine(...args),
}))

// ============================================================
// Mock: Supabase (for postback approve flow)
// ============================================================

const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null })

vi.mock('../../../lib/cortex/discord/context-builder', () => ({
  getSupabaseAdmin: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: mockInsert,
    })),
  })),
  getSupabase: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      then: vi.fn((resolve: (val: unknown) => void) =>
        resolve({ data: [], error: null }),
      ),
    })),
  })),
  buildCortexContext: vi.fn().mockResolvedValue({
    platformRules: [],
    viralInsights: [],
    temporalPatterns: [],
    patternPerformance: [],
    recentTrends: [],
    recentPosts: [],
  }),
  buildContextSummary: vi.fn().mockReturnValue('Mock context summary'),
}))

// ============================================================
// Mock: command-handler (Discord commands used by LINE router)
// ============================================================

const mockHandleTrendQuery = vi.fn().mockResolvedValue({
  trends: [
    {
      topic: 'AI Agents',
      maturity: 'emerging',
      unexplored_angles: ['Enterprise adoption'],
      japan_specific_angle: 'Japan AI strategy',
      freshness_score: 0.9,
      recommended_content_types: ['Original'],
      supporting_data: [],
    },
  ],
  recommendations: ['Focus on AI agents'],
})

const mockHandlePerformanceReview = vi.fn().mockResolvedValue({
  executive_summary: 'Good week overall.',
  wins: ['High ER on X'],
  improvements: ['Post more on LinkedIn'],
  platforms: [],
  pattern_analysis: [],
  timing_analysis: { best_slots: [], worst_slots: [] },
  ml_health: { is_drifted: false, latest_mae: 0.01 },
  period: { start: '2026-03-21', end: '2026-03-28' },
  next_week_recommendations: [],
})

const mockHandleGuidelineCheck = vi.fn().mockResolvedValue({
  platform: 'x',
  active_rules: [
    {
      id: 'r1',
      platform: 'x',
      rule_category: 'algorithm',
      rule_title: 'Engagement velocity',
      rule_description: 'Early engagement boosts reach in the algorithm',
      confidence: 0.9,
      verified_by_data: true,
    },
  ],
  recent_changes: [],
  unverified_rules: [],
  summary: 'Platform: x | Active rules: 1',
})

const mockHandleContentReview = vi.fn().mockResolvedValue({
  overall_score: 72,
  platform_compliance: [],
  viral_potential: {
    score: 60,
    similar_high_performers: [],
    improvement_suggestions: ['Add a question hook'],
  },
  timing_recommendation: { platform: 'x', recommended_slots: [], avoid_slots: [] },
  evidence_sources: ['cortex_platform_rules'],
})

vi.mock('../../../lib/cortex/discord/command-handler', () => ({
  handleTrendQuery: (...args: unknown[]) => mockHandleTrendQuery(...args),
  handlePerformanceReview: (...args: unknown[]) => mockHandlePerformanceReview(...args),
  handleGuidelineCheck: (...args: unknown[]) => mockHandleGuidelineCheck(...args),
  handleContentReview: (...args: unknown[]) => mockHandleContentReview(...args),
}))

// ============================================================
// Mock: Anthropic SDK (for post generation)
// ============================================================

vi.mock('../../../lib/cortex/line/live-handlers', () => ({
  handleLiveBuzz: vi.fn().mockResolvedValue(undefined),
  handleLiveGenerate: vi.fn().mockResolvedValue(undefined),
  handleLiveExecute: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              post_text: 'AI is transforming everything',
              hook_type: 'statement',
              confidence: 0.8,
            }),
          },
        ],
      }),
    },
  })),
}))

// ============================================================
// Environment
// ============================================================

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-key')
  vi.stubEnv('ANTHROPIC_API_KEY', 'test-anthropic-key')
  vi.stubEnv('LINE_CHANNEL_ACCESS_TOKEN', 'test-line-token')

  mockReplyToLine.mockClear()
  mockInsert.mockClear()
  mockHandleTrendQuery.mockClear()
  mockHandlePerformanceReview.mockClear()
  mockHandleGuidelineCheck.mockClear()
  mockHandleContentReview.mockClear()
})

// ============================================================
// Command Detection Tests
// ============================================================

describe('routeCommand - command detection', () => {
  it('「バズ」triggers buzz handler with immediate feedback + live buzz', async () => {
    const { routeCommand } = await import(
      '../../../lib/cortex/line/command-router'
    )

    await routeCommand('バズ', 'reply-token-1', 'user-1')

    // Should send immediate "分析中..." feedback
    expect(mockReplyToLine).toHaveBeenCalledWith(
      'reply-token-1',
      expect.arrayContaining([
        expect.objectContaining({ type: 'text', text: expect.stringContaining('バズ分析中') }),
      ]),
    )
  })

  it('「投稿して AI」triggers post handler with immediate feedback', async () => {
    const { routeCommand } = await import(
      '../../../lib/cortex/line/command-router'
    )

    await routeCommand('投稿して AI', 'reply-token-2', 'user-1')

    // Should send immediate "生成中..." feedback
    expect(mockReplyToLine).toHaveBeenCalledWith(
      'reply-token-2',
      expect.arrayContaining([
        expect.objectContaining({ type: 'text', text: expect.stringContaining('投稿生成中') }),
      ]),
    )
  })

  it('「成績」triggers performance handler', async () => {
    const { routeCommand } = await import(
      '../../../lib/cortex/line/command-router'
    )

    await routeCommand('成績', 'reply-token-3', 'user-1')

    expect(mockHandlePerformanceReview).toHaveBeenCalledWith(7)
    expect(mockReplyToLine).toHaveBeenCalledWith(
      'reply-token-3',
      expect.arrayContaining([
        expect.objectContaining({
          type: 'text',
          text: expect.stringContaining('パフォーマンスレポート'),
        }),
      ]),
    )
  })

  it('「トレンド」triggers trend handler', async () => {
    const { routeCommand } = await import(
      '../../../lib/cortex/line/command-router'
    )

    await routeCommand('トレンド', 'reply-token-4', 'user-1')

    expect(mockHandleTrendQuery).toHaveBeenCalled()
    expect(mockReplyToLine).toHaveBeenCalledWith(
      'reply-token-4',
      expect.arrayContaining([
        expect.objectContaining({
          type: 'text',
          text: expect.stringContaining('トレンド分析'),
        }),
      ]),
    )
  })

  it('「ルール X」triggers guideline handler with platform=x', async () => {
    const { routeCommand } = await import(
      '../../../lib/cortex/line/command-router'
    )

    await routeCommand('ルール X', 'reply-token-5', 'user-1')

    expect(mockHandleGuidelineCheck).toHaveBeenCalledWith('x')
    expect(mockReplyToLine).toHaveBeenCalledWith(
      'reply-token-5',
      expect.arrayContaining([
        expect.objectContaining({
          type: 'text',
          text: expect.stringContaining('ガイドライン'),
        }),
      ]),
    )
  })

  it('「ルール LinkedIn」triggers guideline handler with platform=linkedin', async () => {
    mockHandleGuidelineCheck.mockResolvedValueOnce({
      platform: 'linkedin',
      active_rules: [],
      recent_changes: [],
      unverified_rules: [],
      summary: 'Platform: linkedin | Active rules: 0',
    })

    const { routeCommand } = await import(
      '../../../lib/cortex/line/command-router'
    )

    await routeCommand('ルール LinkedIn', 'reply-token-6', 'user-1')

    expect(mockHandleGuidelineCheck).toHaveBeenCalledWith('linkedin')
  })

  it('unknown text returns help message', async () => {
    const { routeCommand } = await import(
      '../../../lib/cortex/line/command-router'
    )

    await routeCommand('こんにちは', 'reply-token-7', 'user-1')

    expect(mockReplyToLine).toHaveBeenCalledWith(
      'reply-token-7',
      expect.arrayContaining([
        expect.objectContaining({
          type: 'text',
          text: expect.stringContaining('コマンド一覧'),
        }),
      ]),
    )
  })
})

// ============================================================
// Postback Handling Tests
// ============================================================

describe('handlePostback', () => {
  it('action=approve_post without pending_id shows error', async () => {
    const { handlePostback } = await import(
      '../../../lib/cortex/line/command-router'
    )

    await handlePostback(
      'action=approve_post',
      'reply-token-pb1',
      'user-1',
    )

    expect(mockReplyToLine).toHaveBeenCalledWith(
      'reply-token-pb1',
      expect.arrayContaining([
        expect.objectContaining({
          type: 'text',
          text: expect.stringContaining('見つかりません'),
        }),
      ]),
    )
  })

  it('action=reject_post sends rejection message', async () => {
    const { handlePostback } = await import(
      '../../../lib/cortex/line/command-router'
    )

    await handlePostback('action=reject_post', 'reply-token-pb2', 'user-1')

    expect(mockReplyToLine).toHaveBeenCalledWith(
      'reply-token-pb2',
      expect.arrayContaining([
        expect.objectContaining({
          type: 'text',
          text: expect.stringContaining('却下'),
        }),
      ]),
    )
  })

  it('action=edit_post sends edit prompt', async () => {
    const { handlePostback } = await import(
      '../../../lib/cortex/line/command-router'
    )

    await handlePostback('action=edit_post', 'reply-token-pb3', 'user-1')

    expect(mockReplyToLine).toHaveBeenCalledWith(
      'reply-token-pb3',
      expect.arrayContaining([
        expect.objectContaining({
          type: 'text',
          text: expect.stringContaining('修正テキスト'),
        }),
      ]),
    )
  })
})
