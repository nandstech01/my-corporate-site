import { describe, it, expect, vi, beforeEach } from 'vitest'

// ============================================================
// Mock Supabase: chainable query builder
// ============================================================

let mockSupabaseData: Record<string, unknown[]> = {}
let mockSupabaseErrors: Record<string, { message: string } | null> = {}

function createChainableQuery(tableName: string) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    then: vi.fn((resolve: (val: unknown) => void) => {
      return resolve({
        data: mockSupabaseData[tableName] ?? [],
        error: mockSupabaseErrors[tableName] ?? null,
      })
    }),
  }

  // Make it thenable so await works
  Object.defineProperty(chain, 'then', {
    value(
      onFulfill: (val: { data: unknown[]; error: unknown }) => void,
      onReject?: (err: unknown) => void,
    ) {
      try {
        return Promise.resolve(
          onFulfill({
            data: mockSupabaseData[tableName] ?? [],
            error: mockSupabaseErrors[tableName] ?? null,
          }),
        )
      } catch (err) {
        if (onReject) return Promise.resolve(onReject(err))
        return Promise.reject(err)
      }
    },
    writable: true,
    configurable: true,
  })

  return chain
}

const mockFrom = vi.fn((tableName: string) => createChainableQuery(tableName))

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: mockFrom,
  })),
}))

// ============================================================
// Mock Anthropic SDK
// ============================================================

let mockLlmResponse = '{}'

vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      messages: {
        create: vi.fn().mockImplementation(() =>
          Promise.resolve({
            content: [{ type: 'text', text: mockLlmResponse }],
          }),
        ),
      },
    })),
  }
})

// ============================================================
// Environment
// ============================================================

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-key')
  vi.stubEnv('ANTHROPIC_API_KEY', 'test-anthropic-key')

  mockSupabaseData = {}
  mockSupabaseErrors = {}
  mockLlmResponse = '{}'

  vi.clearAllMocks()
})

// ============================================================
// Tests
// ============================================================

describe('handleContentReview', () => {
  it('returns ContentReviewResult with all required fields', async () => {
    // Arrange
    mockSupabaseData['cortex_platform_rules'] = [
      {
        id: 'r1',
        platform: 'x',
        rule_category: 'algorithm',
        rule_title: 'Engagement velocity',
        rule_description: 'Early engagement boosts reach',
        confidence: 0.9,
        verified_by_data: true,
        deprecated_at: null,
        updated_at: '2026-03-01',
        created_at: '2026-01-01',
      },
    ]
    mockSupabaseData['cortex_viral_analysis'] = [
      {
        id: 'v1',
        platform: 'x',
        hook_type: 'question',
        structure_type: 'narrative',
        engagement_rate: 0.05,
        replicability_score: 0.8,
        primary_buzz_factor: 'novelty',
        emotional_trigger: 'surprise',
        anti_patterns: [],
        analyzed_at: new Date().toISOString(),
      },
    ]
    mockSupabaseData['cortex_temporal_patterns'] = [
      {
        id: 't1',
        platform: 'x',
        day_of_week: 1,
        hour_jst: 8,
        avg_engagement_rate: 0.04,
        sample_count: 20,
        recommendation_score: 0.85,
      },
    ]
    mockSupabaseData['pattern_performance'] = [
      {
        pattern_id: 'p1',
        platform: 'x',
        successes: 8,
        failures: 2,
        total_uses: 10,
        avg_engagement: 0.06,
      },
    ]

    mockLlmResponse = JSON.stringify({
      overall_score: 78,
      platform_compliance: [
        { rule_title: 'Engagement velocity', status: 'pass', detail: 'Good hook' },
      ],
      viral_potential: {
        score: 65,
        similar_high_performers: ['Post A with 5% ER'],
        improvement_suggestions: ['Based on cortex_platform_rules: add question hook'],
      },
      timing_recommendation: {
        platform: 'x',
        recommended_slots: [
          { day_of_week: 1, hour_jst: 8, avg_engagement_rate: 0.04, sample_count: 20, confidence: '95% CI: [0.03, 0.05]' },
        ],
        avoid_slots: [],
      },
      evidence_sources: [
        'cortex_platform_rules',
        'cortex_viral_analysis',
        'cortex_temporal_patterns',
        'pattern_performance',
      ],
    })

    const { handleContentReview } = await import(
      '../../../lib/cortex/discord/command-handler'
    )

    // Act
    const result = await handleContentReview('Test post about AI', 'x')

    // Assert
    expect(result).toBeDefined()
    expect(result.overall_score).toBe(78)
    expect(result.overall_score).toBeGreaterThanOrEqual(0)
    expect(result.overall_score).toBeLessThanOrEqual(100)
    expect(result.evidence_sources).toBeDefined()
    expect(result.evidence_sources.length).toBeGreaterThan(0)
    expect(result.platform_compliance).toBeInstanceOf(Array)
    expect(result.viral_potential).toBeDefined()
    expect(result.viral_potential.score).toBeDefined()
    expect(result.timing_recommendation).toBeDefined()
  })

  it('evidence_sources is non-empty', async () => {
    mockSupabaseData['cortex_platform_rules'] = []
    mockSupabaseData['cortex_viral_analysis'] = []
    mockSupabaseData['cortex_temporal_patterns'] = []
    mockSupabaseData['pattern_performance'] = []

    mockLlmResponse = JSON.stringify({
      overall_score: 50,
      platform_compliance: [],
      viral_potential: { score: 30, similar_high_performers: [], improvement_suggestions: [] },
      timing_recommendation: { platform: 'x', recommended_slots: [], avoid_slots: [] },
      evidence_sources: ['cortex_platform_rules', 'cortex_viral_analysis'],
    })

    const { handleContentReview } = await import(
      '../../../lib/cortex/discord/command-handler'
    )

    const result = await handleContentReview('Hello world', 'x')
    expect(result.evidence_sources.length).toBeGreaterThan(0)
  })

  it('returns fallback evidence_sources when LLM omits them', async () => {
    mockSupabaseData['cortex_platform_rules'] = []
    mockSupabaseData['cortex_viral_analysis'] = []
    mockSupabaseData['cortex_temporal_patterns'] = []
    mockSupabaseData['pattern_performance'] = []

    mockLlmResponse = JSON.stringify({
      overall_score: 40,
      platform_compliance: [],
      viral_potential: { score: 20, similar_high_performers: [], improvement_suggestions: [] },
      timing_recommendation: { platform: 'x', recommended_slots: [], avoid_slots: [] },
      // evidence_sources intentionally omitted
    })

    const { handleContentReview } = await import(
      '../../../lib/cortex/discord/command-handler'
    )

    const result = await handleContentReview('Short post', 'x')
    expect(result.evidence_sources).toEqual([
      'cortex_platform_rules',
      'cortex_viral_analysis',
      'cortex_temporal_patterns',
      'pattern_performance',
    ])
  })

  it('calls Supabase for platform rules, viral analysis, and temporal patterns', async () => {
    mockSupabaseData['cortex_platform_rules'] = []
    mockSupabaseData['cortex_viral_analysis'] = []
    mockSupabaseData['cortex_temporal_patterns'] = []
    mockSupabaseData['pattern_performance'] = []

    mockLlmResponse = JSON.stringify({
      overall_score: 50,
      platform_compliance: [],
      viral_potential: { score: 50, similar_high_performers: [], improvement_suggestions: [] },
      timing_recommendation: { platform: 'linkedin', recommended_slots: [], avoid_slots: [] },
      evidence_sources: ['cortex_platform_rules'],
    })

    const { handleContentReview } = await import(
      '../../../lib/cortex/discord/command-handler'
    )

    await handleContentReview('LinkedIn post', 'linkedin')

    const tableNames = mockFrom.mock.calls.map((call: unknown[]) => call[0])
    expect(tableNames).toContain('cortex_platform_rules')
    expect(tableNames).toContain('cortex_viral_analysis')
    expect(tableNames).toContain('cortex_temporal_patterns')
    expect(tableNames).toContain('pattern_performance')
  })
})

describe('handleTrendQuery', () => {
  it('returns trends array and recommendations', async () => {
    mockSupabaseData['buzz_posts'] = [
      { post_text: 'AI is amazing', buzz_score: 95, platform: 'x', post_date: '2026-03-28', created_at: new Date().toISOString() },
    ]
    mockSupabaseData['cortex_viral_analysis'] = [
      {
        platform: 'x',
        hook_type: 'question',
        replicability_score: 0.9,
        primary_buzz_factor: 'novelty',
        emotional_trigger: 'curiosity',
        analyzed_at: new Date().toISOString(),
      },
    ]
    mockSupabaseData['slack_bot_memory'] = [
      { content: 'Claude Code trending', context: {}, created_at: new Date().toISOString() },
    ]

    mockLlmResponse = JSON.stringify({
      trends: [
        {
          topic: 'Claude Code adoption',
          maturity: 'emerging',
          unexplored_angles: ['Enterprise use cases', 'Security implications', 'Cost analysis'],
          japan_specific_angle: 'Japanese dev community adoption',
          freshness_score: 0.9,
          recommended_content_types: ['Original', 'Thread'],
          supporting_data: [{ source: 'buzz_posts', relevance: 0.8, summary: 'High buzz score' }],
        },
      ],
      recommendations: ['Post about Claude Code adoption, citing buzz_posts data'],
    })

    const { handleTrendQuery } = await import(
      '../../../lib/cortex/discord/command-handler'
    )

    const result = await handleTrendQuery()

    expect(result.trends).toBeInstanceOf(Array)
    expect(result.trends.length).toBeGreaterThan(0)
    expect(result.recommendations).toBeInstanceOf(Array)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('each trend has topic, maturity, and unexplored_angles', async () => {
    mockSupabaseData['buzz_posts'] = []
    mockSupabaseData['cortex_viral_analysis'] = []
    mockSupabaseData['slack_bot_memory'] = []

    mockLlmResponse = JSON.stringify({
      trends: [
        {
          topic: 'AI Agents',
          maturity: 'growing',
          unexplored_angles: ['Regulatory impact', 'Open source alternatives', 'Multi-modal agents'],
          japan_specific_angle: 'Japan gov AI strategy',
          freshness_score: 0.7,
          recommended_content_types: ['Quote RT'],
          supporting_data: [],
        },
        {
          topic: 'MCP Protocol',
          maturity: 'emerging',
          unexplored_angles: ['Security concerns', 'Standardization efforts', 'Developer adoption'],
          japan_specific_angle: 'Japanese tool ecosystem',
          freshness_score: 0.85,
          recommended_content_types: ['Thread'],
          supporting_data: [],
        },
      ],
      recommendations: ['Focus on emerging MCP protocol'],
    })

    const { handleTrendQuery } = await import(
      '../../../lib/cortex/discord/command-handler'
    )

    const result = await handleTrendQuery()

    for (const trend of result.trends) {
      expect(trend.topic).toBeDefined()
      expect(typeof trend.topic).toBe('string')
      expect(['emerging', 'growing', 'saturated']).toContain(trend.maturity)
      expect(trend.unexplored_angles).toBeInstanceOf(Array)
      expect(trend.unexplored_angles.length).toBeGreaterThan(0)
    }
  })
})

describe('handlePerformanceReview', () => {
  it('returns PerformanceReport with executive_summary', async () => {
    mockSupabaseData['x_post_analytics'] = [
      { post_text: 'Great post', posted_at: new Date().toISOString(), likes: 100, impressions: 5000, engagement_rate: 0.05, pattern_used: 'question_hook' },
    ]
    mockSupabaseData['linkedin_post_analytics'] = []
    mockSupabaseData['threads_post_analytics'] = []
    mockSupabaseData['pattern_performance'] = [
      { pattern_id: 'question_hook', platform: 'x', successes: 15, failures: 5, total_uses: 20, avg_engagement: 0.045 },
    ]
    mockSupabaseData['cortex_temporal_patterns'] = [
      { platform: 'x', day_of_week: 1, hour_jst: 8, avg_engagement_rate: 0.04, sample_count: 30, recommendation_score: 0.85 },
    ]
    mockSupabaseData['model_drift_log'] = [
      { id: 'd1', mae: 0.012, is_drifted: false, checked_at: new Date().toISOString() },
    ]

    mockLlmResponse = JSON.stringify({
      executive_summary: 'Overall performance is strong with 5% avg ER on X.',
      wins: ['X engagement rate above 5%', 'question_hook pattern 75% success rate', 'No model drift detected'],
      improvements: ['Increase LinkedIn posting frequency', 'Test more hooks', 'Try Thursday 20:00 slot'],
      next_week_recommendations: ['Post 3x on LinkedIn', 'Test storytelling hook on X'],
    })

    const { handlePerformanceReview } = await import(
      '../../../lib/cortex/discord/command-handler'
    )

    const result = await handlePerformanceReview(7)

    expect(result.executive_summary).toBeDefined()
    expect(typeof result.executive_summary).toBe('string')
    expect(result.executive_summary.length).toBeGreaterThan(0)
    expect(result.period).toBeDefined()
    expect(result.period.start).toBeDefined()
    expect(result.period.end).toBeDefined()
  })

  it('wins and improvements arrays are populated', async () => {
    mockSupabaseData['x_post_analytics'] = [
      { post_text: 'Post A', posted_at: new Date().toISOString(), likes: 50, impressions: 2000, engagement_rate: 0.03, pattern_used: null },
    ]
    mockSupabaseData['linkedin_post_analytics'] = []
    mockSupabaseData['threads_post_analytics'] = []
    mockSupabaseData['pattern_performance'] = []
    mockSupabaseData['cortex_temporal_patterns'] = []
    mockSupabaseData['model_drift_log'] = []

    mockLlmResponse = JSON.stringify({
      executive_summary: 'Moderate performance this week.',
      wins: ['Consistent posting schedule'],
      improvements: ['Engagement rate below target'],
      next_week_recommendations: ['Experiment with new hooks'],
    })

    const { handlePerformanceReview } = await import(
      '../../../lib/cortex/discord/command-handler'
    )

    const result = await handlePerformanceReview(7)

    expect(result.wins).toBeInstanceOf(Array)
    expect(result.wins.length).toBeGreaterThan(0)
    expect(result.improvements).toBeInstanceOf(Array)
    expect(result.improvements.length).toBeGreaterThan(0)
  })

  it('trajectory direction is a valid enum value', async () => {
    mockSupabaseData['x_post_analytics'] = [
      { post_text: 'Post', posted_at: new Date().toISOString(), likes: 10, impressions: 500, engagement_rate: 0.02, pattern_used: null },
    ]
    mockSupabaseData['linkedin_post_analytics'] = []
    mockSupabaseData['threads_post_analytics'] = []
    mockSupabaseData['pattern_performance'] = [
      { pattern_id: 'test_pattern', platform: 'x', successes: 3, failures: 7, total_uses: 10, avg_engagement: 0.015 },
    ]
    mockSupabaseData['cortex_temporal_patterns'] = []
    mockSupabaseData['model_drift_log'] = []

    mockLlmResponse = JSON.stringify({
      executive_summary: 'Performance declining.',
      wins: [],
      improvements: ['Everything'],
      next_week_recommendations: ['Rethink strategy'],
    })

    const { handlePerformanceReview } = await import(
      '../../../lib/cortex/discord/command-handler'
    )

    const result = await handlePerformanceReview(7)

    for (const pattern of result.pattern_analysis) {
      expect(['improving', 'stable', 'declining']).toContain(pattern.trend)
    }
  })
})

describe('handleGuidelineCheck', () => {
  it('returns active_rules, recent_changes, unverified_rules', async () => {
    const now = new Date()
    const recentDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
    const oldDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

    mockSupabaseData['cortex_platform_rules'] = [
      {
        id: 'r1',
        platform: 'x',
        rule_category: 'algorithm',
        rule_title: 'Recent active rule',
        rule_description: 'Updated recently',
        confidence: 0.9,
        verified_by_data: true,
        deprecated_at: null,
        updated_at: recentDate,
        created_at: oldDate,
      },
      {
        id: 'r2',
        platform: 'x',
        rule_category: 'best_practice',
        rule_title: 'Old unverified rule',
        rule_description: 'Not verified',
        confidence: 0.5,
        verified_by_data: false,
        deprecated_at: null,
        updated_at: oldDate,
        created_at: oldDate,
      },
      {
        id: 'r3',
        platform: 'x',
        rule_category: 'content_policy',
        rule_title: 'Deprecated rule',
        rule_description: 'No longer valid',
        confidence: 0.3,
        verified_by_data: true,
        deprecated_at: recentDate,
        updated_at: recentDate,
        created_at: oldDate,
      },
    ]

    const { handleGuidelineCheck } = await import(
      '../../../lib/cortex/discord/command-handler'
    )

    const result = await handleGuidelineCheck('x')

    expect(result.active_rules).toBeInstanceOf(Array)
    expect(result.active_rules.length).toBe(2) // r1 and r2 (not deprecated)
    expect(result.recent_changes).toBeInstanceOf(Array)
    expect(result.recent_changes.length).toBeGreaterThan(0) // r1 and r3 updated recently
    expect(result.unverified_rules).toBeInstanceOf(Array)
    expect(result.unverified_rules.length).toBe(1) // r2
    expect(result.unverified_rules[0].rule_title).toBe('Old unverified rule')
  })

  it('summary string is non-empty', async () => {
    mockSupabaseData['cortex_platform_rules'] = [
      {
        id: 'r1',
        platform: 'linkedin',
        rule_category: 'format',
        rule_title: 'Use bullet points',
        rule_description: 'Bullet points increase readability',
        confidence: 0.8,
        verified_by_data: true,
        deprecated_at: null,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
    ]

    const { handleGuidelineCheck } = await import(
      '../../../lib/cortex/discord/command-handler'
    )

    const result = await handleGuidelineCheck('linkedin')

    expect(result.summary).toBeDefined()
    expect(typeof result.summary).toBe('string')
    expect(result.summary.length).toBeGreaterThan(0)
    expect(result.summary).toContain('linkedin')
  })
})
