import { describe, it, expect } from 'vitest'
import { buildContextSummary } from '../../../lib/cortex/discord/context-builder'
import type { CortexContext } from '../../../lib/cortex/types'

function makeFullContext(): CortexContext {
  return {
    platformRules: [{
      id: 'rule-1',
      platform: 'x',
      rule_category: 'algorithm',
      rule_title: 'Engagement velocity matters',
      rule_description: 'Posts that get engagement in first 30 min are boosted',
      source_url: null,
      source_type: 'official_blog',
      confidence: 0.9,
      effective_from: '2025-01-01',
      deprecated_at: null,
      verified_by_data: true,
      verification_notes: null,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    }],
    viralInsights: [{
      id: 'viral-1',
      buzz_post_id: null,
      platform: 'x',
      original_text: 'A viral post about AI',
      author_handle: '@user',
      hook_type: 'question',
      structure_type: 'narrative',
      closing_type: 'cta',
      emoji_count: 1,
      hashtag_count: 0,
      char_length: 200,
      emotional_trigger: 'surprise',
      information_density: 0.8,
      novelty_score: 0.7,
      authority_signal: null,
      controversy_level: 0.2,
      actionability: 0.9,
      likes: 350,
      reposts: 120,
      replies: 45,
      impressions: 25000,
      engagement_rate: 0.0206,
      primary_buzz_factor: 'Timely AI insight',
      secondary_factors: ['strong hook'],
      anti_patterns: ['too long'],
      replicability_score: 0.75,
      analyzed_at: '2026-03-01T00:00:00Z',
      analyzed_by: 'claude-code',
    }],
    temporalPatterns: [{
      id: 'tp-1',
      platform: 'x',
      day_of_week: 2,
      hour_jst: 18,
      topic_category: 'AI',
      content_type: 'original',
      sample_count: 30,
      avg_engagement_rate: 0.035,
      avg_likes: 50,
      avg_impressions: 6000,
      max_engagement_rate: 0.09,
      std_dev: 0.01,
      confidence_interval_lower: 0.025,
      confidence_interval_upper: 0.045,
      recommendation_score: 0.92,
      period_start: '2025-12-01',
      period_end: '2026-03-01',
      calculated_at: '2026-03-01T00:00:00Z',
    }],
    patternPerformance: [{
      pattern_id: 'hook-question',
      platform: 'x',
      successes: 8,
      failures: 2,
      total_uses: 10,
      avg_engagement: 0.0312,
      success_rate: 0.8,
    }],
    recentTrends: [{
      content: 'Claude Code MCP adoption surging',
      context: { source: 'HackerNews' },
      created_at: '2026-03-25T10:00:00Z',
    }],
    recentPosts: [{
      post_text: 'Claude Codeを使ったら開発速度が3倍になった話',
      platform: 'x',
      posted_at: '2026-03-24T09:00:00Z',
      likes: 120,
      impressions: 8000,
      engagement_rate: 0.015,
      pattern_used: 'hook-question',
    }],
  }
}

function makeEmptyContext(): CortexContext {
  return {
    platformRules: [],
    viralInsights: [],
    temporalPatterns: [],
    patternPerformance: [],
    recentTrends: [],
    recentPosts: [],
  }
}

describe('buildContextSummary', () => {
  it('returns all 6 sections when context is fully populated', () => {
    const context = makeFullContext()
    const summary = buildContextSummary(context)

    expect(summary).toContain('## Platform Rules')
    expect(summary).toContain('## Viral Insights (30 days)')
    expect(summary).toContain('## Best Posting Times')
    expect(summary).toContain('## Pattern Performance')
    expect(summary).toContain('## Recent Trends')
    expect(summary).toContain('## Recent Post Performance')
  })

  it('returns section headers with empty-state messages when context has empty arrays', () => {
    const context = makeEmptyContext()
    const summary = buildContextSummary(context)

    expect(summary).toContain('## Platform Rules')
    expect(summary).toContain('No platform rules loaded.')
    expect(summary).toContain('## Viral Insights (30 days)')
    expect(summary).toContain('No viral analysis data available.')
    expect(summary).toContain('## Best Posting Times')
    expect(summary).toContain('No temporal pattern data available.')
    expect(summary).toContain('## Pattern Performance')
    expect(summary).toContain('No pattern performance data available.')
    expect(summary).toContain('## Recent Trends')
    expect(summary).toContain('No recent trend data available.')
    expect(summary).toContain('## Recent Post Performance')
    expect(summary).toContain('No recent post data available.')
  })

  it('includes specific numeric data from context', () => {
    const context = makeFullContext()
    const summary = buildContextSummary(context)

    // Platform rule confidence
    expect(summary).toContain('confidence: 0.9')
    // Viral insight engagement rate (0.0206 * 100 = 2.06)
    expect(summary).toContain('2.06%')
    // Viral insight likes
    expect(summary).toContain('350 likes')
    // Viral insight impressions
    expect(summary).toContain('25000 impressions')
    // Temporal pattern hour
    expect(summary).toContain('18:00 JST')
    // Temporal pattern samples
    expect(summary).toContain('samples: 30')
    // Pattern performance success rate (0.8 * 100 = 80.0%)
    expect(summary).toContain('80.0% success')
    // Pattern performance uses
    expect(summary).toContain('8/10')
    // Recent post likes
    expect(summary).toContain('120 likes')
  })

  it('renders verified rules with DATA-VERIFIED tag', () => {
    const context = makeFullContext()
    const summary = buildContextSummary(context)

    expect(summary).toContain('[DATA-VERIFIED]')
  })

  it('renders anti-patterns from viral insights', () => {
    const context = makeFullContext()
    const summary = buildContextSummary(context)

    expect(summary).toContain('Anti-patterns: too long')
  })

  it('renders day-of-week labels correctly', () => {
    const context = makeFullContext()
    const summary = buildContextSummary(context)

    // day_of_week: 2 should render as "Tue"
    expect(summary).toContain('Tue')
  })

  it('renders source type in parentheses for platform rules', () => {
    const context = makeFullContext()
    const summary = buildContextSummary(context)

    expect(summary).toContain('(official_blog)')
  })

  it('renders confidence intervals for temporal patterns', () => {
    const context = makeFullContext()
    const summary = buildContextSummary(context)

    // 0.025 * 100 = 2.50, 0.045 * 100 = 4.50
    expect(summary).toContain('95% CI: [2.50%, 4.50%]')
  })

  it('renders trend dates from created_at', () => {
    const context = makeFullContext()
    const summary = buildContextSummary(context)

    expect(summary).toContain('[2026-03-25]')
    expect(summary).toContain('Claude Code MCP adoption surging')
  })

  it('renders pattern_used for recent posts when present', () => {
    const context = makeFullContext()
    const summary = buildContextSummary(context)

    expect(summary).toContain('pattern: hook-question')
  })

  it('limits temporal patterns to top 10', () => {
    const context = makeFullContext()
    // Add 15 temporal patterns
    context.temporalPatterns = Array.from({ length: 15 }, (_, i) => ({
      id: `tp-${i}`,
      platform: 'x',
      day_of_week: i % 7,
      hour_jst: 8 + i,
      topic_category: 'AI',
      content_type: 'original',
      sample_count: 20,
      avg_engagement_rate: 0.03 - i * 0.001,
      avg_likes: 40,
      avg_impressions: 5000,
      max_engagement_rate: 0.08,
      std_dev: 0.01,
      confidence_interval_lower: 0.02,
      confidence_interval_upper: 0.04,
      recommendation_score: 0.9 - i * 0.01,
      period_start: '2025-12-01',
      period_end: '2026-03-01',
      calculated_at: '2026-03-01T00:00:00Z',
    }))

    const summary = buildContextSummary(context)

    // Count the temporal pattern lines (lines starting with "- **x**" under Best Posting Times)
    const lines = summary.split('\n')
    const temporalLines = lines.filter(line =>
      line.startsWith('- **x**') && line.includes('JST')
    )
    expect(temporalLines).toHaveLength(10)
  })
})
