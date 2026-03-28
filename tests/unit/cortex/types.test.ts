import { describe, it, expect } from 'vitest'
import type {
  CortexPlatformRule,
  CortexViralAnalysis,
  CortexTemporalPattern,
  CortexConversationLog,
  CortexContext,
  Platform,
  ContentReviewResult,
  TrendResearchResult,
} from '../../../lib/cortex/types'

describe('CORTEX Types', () => {
  it('CortexPlatformRule accepts valid data', () => {
    const rule: CortexPlatformRule = {
      id: 'test-id',
      platform: 'x',
      rule_category: 'algorithm',
      rule_title: 'Engagement velocity matters',
      rule_description: 'Posts that get engagement in first 30 min are boosted',
      source_url: 'https://blog.x.com/engineering/algorithm',
      source_type: 'official_blog',
      confidence: 0.9,
      effective_from: '2025-01-01',
      deprecated_at: null,
      verified_by_data: true,
      verification_notes: 'Confirmed by A/B test',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    expect(rule.platform).toBe('x')
    expect(rule.confidence).toBeGreaterThan(0)
    expect(rule.confidence).toBeLessThanOrEqual(1)
  })

  it('CortexViralAnalysis accepts valid data', () => {
    const analysis: CortexViralAnalysis = {
      id: 'test-id',
      buzz_post_id: 'buzz-123',
      platform: 'x',
      original_text: 'This is a viral post',
      author_handle: '@viraluser',
      hook_type: 'question',
      structure_type: 'narrative',
      closing_type: 'cta',
      emoji_count: 2,
      hashtag_count: 1,
      char_length: 180,
      emotional_trigger: 'surprise',
      information_density: 0.7,
      novelty_score: 0.8,
      authority_signal: 'specific numbers and data',
      controversy_level: 0.3,
      actionability: 0.9,
      likes: 500,
      reposts: 200,
      replies: 50,
      impressions: 50000,
      engagement_rate: 0.015,
      primary_buzz_factor: 'Surprising data with actionable takeaway',
      secondary_factors: ['timely topic', 'strong hook'],
      anti_patterns: ['too many hashtags'],
      replicability_score: 0.72,
      analyzed_at: new Date().toISOString(),
      analyzed_by: 'claude-code',
    }
    expect(analysis.replicability_score).toBeGreaterThanOrEqual(0)
    expect(analysis.replicability_score).toBeLessThanOrEqual(1)
  })

  it('CortexTemporalPattern accepts valid data', () => {
    const pattern: CortexTemporalPattern = {
      id: 'test-id',
      platform: 'x',
      day_of_week: 2,  // Tuesday
      hour_jst: 18,
      topic_category: 'AI',
      content_type: 'original',
      sample_count: 25,
      avg_engagement_rate: 0.032,
      avg_likes: 45,
      avg_impressions: 5200,
      max_engagement_rate: 0.08,
      std_dev: 0.012,
      confidence_interval_lower: 0.024,
      confidence_interval_upper: 0.040,
      recommendation_score: 0.87,
      period_start: '2025-12-01',
      period_end: '2026-03-01',
      calculated_at: new Date().toISOString(),
    }
    expect(pattern.day_of_week).toBeGreaterThanOrEqual(0)
    expect(pattern.day_of_week).toBeLessThanOrEqual(6)
    expect(pattern.hour_jst).toBeGreaterThanOrEqual(0)
    expect(pattern.hour_jst).toBeLessThanOrEqual(23)
  })

  it('CortexConversationLog accepts valid data', () => {
    const log: CortexConversationLog = {
      id: 'test-id',
      channel: 'discord',
      conversation_type: 'content_review',
      summary: 'Reviewed X post about Claude Code',
      key_decisions: ['Change hook to question type', 'Post at 18:00 JST'],
      action_items: { update_template: true, schedule_change: '18:00' },
      affected_files: ['lib/viral-hooks/hook-templates.ts'],
      affected_platforms: ['x', 'threads'],
      priority: 'high',
      status: 'pending',
      created_at: new Date().toISOString(),
      completed_at: null,
    }
    expect(log.channel).toBe('discord')
    expect(log.key_decisions).toHaveLength(2)
  })

  it('Platform type restricts to valid values', () => {
    const platforms: Platform[] = ['x', 'linkedin', 'threads', 'instagram', 'youtube', 'zenn', 'qiita']
    expect(platforms).toHaveLength(7)
  })

  it('ContentReviewResult has required structure', () => {
    const result: ContentReviewResult = {
      overall_score: 75,
      platform_compliance: [
        { rule_title: 'Character limit', status: 'pass', detail: '180/280 chars' },
      ],
      viral_potential: {
        score: 82,
        similar_high_performers: ['Post about Claude Code got 500 likes'],
        improvement_suggestions: ['Add a question at the end'],
      },
      timing_recommendation: {
        platform: 'x',
        recommended_slots: [{
          day_of_week: 2,
          hour_jst: 18,
          avg_engagement_rate: 0.032,
          sample_count: 25,
          confidence: '95% CI: [0.024, 0.040]',
        }],
        avoid_slots: [{
          day_of_week: 0,
          hour_jst: 3,
          reason: 'Low engagement historically',
        }],
      },
      evidence_sources: ['cortex_platform_rules #123', 'cortex_viral_analysis 30d avg'],
    }
    expect(result.overall_score).toBeGreaterThanOrEqual(0)
    expect(result.overall_score).toBeLessThanOrEqual(100)
    expect(result.evidence_sources.length).toBeGreaterThan(0)
  })

  it('TrendResearchResult has required structure', () => {
    const result: TrendResearchResult = {
      topic: 'Claude Code MCP Servers',
      maturity: 'growing',
      unexplored_angles: ['Security implications', 'Enterprise adoption patterns'],
      japan_specific_angle: 'Japanese enterprise integration challenges',
      freshness_score: 0.9,
      recommended_content_types: ['thread', 'article'],
      supporting_data: [{
        source: 'HackerNews',
        relevance: 0.85,
        summary: 'Top post about MCP with 350 points',
      }],
    }
    expect(result.maturity).toMatch(/^(emerging|growing|saturated)$/)
    expect(result.freshness_score).toBeLessThanOrEqual(1)
  })
})
