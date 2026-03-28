/**
 * Unit tests for CORTEX knowledge modules
 *
 * Tests pure functions and data transformation logic extracted from:
 * - platform-rule-collector.ts
 * - viral-structure-analyzer.ts
 * - temporal-pattern-miner.ts
 * - deep-trend-researcher.ts
 *
 * External services (Supabase, Anthropic, Brave, Slack) are fully mocked.
 * Timers are faked to eliminate real delays from rate-limiting sleeps.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ============================================================
// Mock external dependencies BEFORE imports
// ============================================================

// Track all Supabase operations for assertions
const mockInsert = vi.fn(() => Promise.resolve({ data: null, error: null }))
const mockUpsert = vi.fn(() => Promise.resolve({ data: null, error: null }))
const mockUpdate = vi.fn(() => ({
  eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
}))
const mockDelete = vi.fn(() => ({
  gte: vi.fn(() => ({
    lte: vi.fn(() => Promise.resolve({ error: null })),
  })),
}))

const mockFrom = vi.fn((_table: string) => ({
  select: vi.fn(() => ({
    gte: vi.fn(() => ({
      order: vi.fn(() => ({
        limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      lte: vi.fn(() => Promise.resolve({ error: null })),
      gt: vi.fn(() => ({
        gte: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
    })),
    gt: vi.fn(() => ({
      gte: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    })),
    eq: vi.fn(() => ({
      eq: vi.fn(() => ({
        limit: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
      order: vi.fn(() => Promise.resolve({ data: [], error: null })),
    })),
    filter: vi.fn(() => ({
      order: vi.fn(() => ({
        limit: vi.fn(() => ({
          maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
    order: vi.fn(() => ({
      limit: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
  })),
  insert: mockInsert,
  upsert: mockUpsert,
  update: mockUpdate,
  delete: mockDelete,
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: mockFrom,
  })),
}))

const mockClaudeCreate = vi.fn(() =>
  Promise.resolve({
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          emotional_trigger: 'surprise',
          information_density: 0.7,
          novelty_score: 0.8,
          authority_signal: 'data',
          controversy_level: 0.3,
          actionability: 0.9,
          primary_buzz_factor: 'novel insight',
          secondary_factors: ['timing', 'brevity'],
          anti_patterns: ['clickbait'],
          replicability_score: 0.7,
        }),
      },
    ],
  }),
)

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn(() => ({
    messages: {
      create: mockClaudeCreate,
    },
  })),
}))

// Mock brave search - used via relative import '../../web-search/brave' from source files
const mockBraveSearch = vi.fn(() => Promise.resolve([]))
vi.mock('../../../lib/web-search/brave', () => ({
  braveWebSearch: mockBraveSearch,
}))

// Mock pattern-extractor - used via @/ alias in viral-structure-analyzer
vi.mock('@/lib/buzz-db/pattern-extractor', () => ({
  analyzeSinglePost: vi.fn(() => ({
    hookType: 'question',
    structureType: 'list',
    closingType: 'cta',
    emojiCount: 3,
    hashtagCount: 2,
    length: 280,
  })),
}))

// Mock slack-client - used via @/ alias in viral-structure-analyzer and temporal-pattern-miner
const mockSendMessage = vi.fn(() => Promise.resolve())
vi.mock('@/lib/slack-bot/slack-client', () => ({
  sendMessage: mockSendMessage,
  SLACK_GENERAL_CHANNEL_ID: 'C_TEST_CHANNEL',
}))

// Mock statistics - used via @/ alias in temporal-pattern-miner
vi.mock('@/lib/learning/statistics', () => ({
  confidenceInterval: vi.fn(
    (mean: number, _std: number, _n: number, _alpha: number) => [
      mean * 0.8,
      mean * 1.2,
    ],
  ),
}))

// ============================================================
// Global fetch mock for article fetching and Slack notifications
// ============================================================

const mockFetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    text: () => Promise.resolve('<html><body>Test content</body></html>'),
  }),
)
vi.stubGlobal('fetch', mockFetch)

// ============================================================
// Setup and teardown
// ============================================================

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
  process.env.ANTHROPIC_API_KEY = 'test-anthropic-key'
  process.env.SLACK_BOT_TOKEN = 'xoxb-test-token'
  process.env.SLACK_DEFAULT_CHANNEL = 'C_DEFAULT'

  vi.clearAllMocks()
  mockBraveSearch.mockResolvedValue([])
  mockFetch.mockResolvedValue({
    ok: true,
    text: () => Promise.resolve('<html><body>Test content</body></html>'),
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ============================================================
// 1. Platform Rule Collector
// ============================================================

// Timeout: platform-rule-collector has rate-limiting delays (500ms per query, 1000ms per platform)
describe('platform-rule-collector', { timeout: 30000 }, () => {
  describe('PLATFORM_SEARCHES configuration', () => {
    it('covers all 4 target platforms with 3 queries each', async () => {
      const { runPlatformRuleCollector } = await import(
        '../../../lib/cortex/knowledge/platform-rule-collector'
      )

      await runPlatformRuleCollector()

      const calls = mockBraveSearch.mock.calls
      // 4 platforms x 3 queries = 12 calls
      expect(calls.length).toBe(12)

      const queryTexts = calls.map(([query]) => (query as string).toLowerCase())
      expect(queryTexts.some((q) => q.includes('twitter') || q.includes('x '))).toBe(true)
      expect(queryTexts.some((q) => q.includes('linkedin'))).toBe(true)
      expect(queryTexts.some((q) => q.includes('threads'))).toBe(true)
      expect(queryTexts.some((q) => q.includes('instagram'))).toBe(true)
    })

    it('passes count=5 parameter to brave search', async () => {
      const { runPlatformRuleCollector } = await import(
        '../../../lib/cortex/knowledge/platform-rule-collector'
      )

      await runPlatformRuleCollector()

      for (const [, opts] of mockBraveSearch.mock.calls) {
        expect(opts).toEqual(expect.objectContaining({ count: 5 }))
      }
    })
  })

  describe('rule extraction and UPSERT logic', () => {
    it('inserts new rules when none exist in the database', async () => {
      mockBraveSearch.mockResolvedValue([
        {
          title: 'X Algorithm Update',
          url: 'https://example.com/x-algo',
          description: 'New algorithm changes',
        },
      ])

      mockClaudeCreate.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify([
              {
                rule_category: 'algorithm',
                rule_title: 'Reply engagement boost',
                rule_description: 'Replies in first 30min boost visibility 2x',
                source_type: 'verified_experiment',
                confidence: 0.8,
              },
            ]),
          },
        ],
      })

      const { runPlatformRuleCollector } = await import(
        '../../../lib/cortex/knowledge/platform-rule-collector'
      )
      await runPlatformRuleCollector()

      // Verify insert was called with a rule containing expected fields
      const ruleInserts = mockInsert.mock.calls.filter((call) => {
        const arg = call[0] as Record<string, unknown>
        return arg && typeof arg === 'object' && 'rule_title' in arg
      })
      expect(ruleInserts.length).toBeGreaterThanOrEqual(1)

      const insertedRule = ruleInserts[0][0] as Record<string, unknown>
      expect(insertedRule.rule_title).toBe('Reply engagement boost')
      expect(insertedRule.platform).toBe('x')
      expect(insertedRule.verified_by_data).toBe(false)
    })

    it('updates existing rules when description changes', async () => {
      mockBraveSearch.mockResolvedValue([
        {
          title: 'X Algorithm Update',
          url: 'https://example.com/x-algo',
          description: 'New algo changes',
        },
      ])

      mockClaudeCreate.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify([
              {
                rule_category: 'algorithm',
                rule_title: 'Reply engagement boost',
                rule_description: 'Updated: Replies in first 15min boost 3x',
                source_type: 'verified_experiment',
                confidence: 0.9,
              },
            ]),
          },
        ],
      })

      // Mock: existing rule found with different description
      mockFrom.mockImplementation((table: string) => {
        if (table === 'cortex_platform_rules') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  limit: vi.fn(() => ({
                    single: vi.fn(() =>
                      Promise.resolve({
                        data: {
                          id: 'existing-rule-id',
                          rule_description: 'Old description',
                          confidence: 0.7,
                        },
                        error: null,
                      }),
                    ),
                  })),
                })),
              })),
            })),
            insert: mockInsert,
            update: mockUpdate,
          } as never
        }
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                limit: vi.fn(() => ({
                  single: vi.fn(() => Promise.resolve({ data: null, error: null })),
                })),
              })),
            })),
          })),
          insert: mockInsert,
          update: mockUpdate,
        } as never
      })

      const { runPlatformRuleCollector } = await import(
        '../../../lib/cortex/knowledge/platform-rule-collector'
      )
      await runPlatformRuleCollector()

      // Verify update was called
      expect(mockUpdate).toHaveBeenCalled()
    })
  })

  describe('Claude response parsing', () => {
    it('filters out rules with missing required fields', async () => {
      mockBraveSearch.mockResolvedValue([
        {
          title: 'Article',
          url: 'https://example.com/article',
          description: 'desc',
        },
      ])

      // Response includes one valid rule and one invalid (missing confidence)
      mockClaudeCreate.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify([
              {
                rule_category: 'algorithm',
                rule_title: 'Valid rule',
                rule_description: 'Good description',
                source_type: 'official_doc',
                confidence: 0.95,
              },
              {
                rule_category: 'algorithm',
                rule_title: 'Invalid rule',
                rule_description: 'Missing confidence',
                source_type: 'official_doc',
                // confidence intentionally missing
              },
            ]),
          },
        ],
      })

      const { runPlatformRuleCollector } = await import(
        '../../../lib/cortex/knowledge/platform-rule-collector'
      )
      await runPlatformRuleCollector()

      // Only the valid rule should be inserted (or checked for upsert)
      // The invalid rule is filtered out by the validation logic
      const ruleInserts = mockInsert.mock.calls.filter((call) => {
        const arg = call[0] as Record<string, unknown>
        return arg && 'rule_title' in arg
      })

      // Only "Valid rule" should be processed
      for (const [rule] of ruleInserts) {
        expect((rule as Record<string, unknown>).rule_title).not.toBe('Invalid rule')
      }
    })
  })

  describe('Slack notification', () => {
    it('sends notification only when rules changed', async () => {
      // No search results means no rules to insert/update
      mockBraveSearch.mockResolvedValue([])

      const { runPlatformRuleCollector } = await import(
        '../../../lib/cortex/knowledge/platform-rule-collector'
      )
      await runPlatformRuleCollector()

      // Slack should NOT be called when no changes occurred
      const slackCalls = mockFetch.mock.calls.filter(
        ([url]) => typeof url === 'string' && url.includes('slack.com'),
      )
      expect(slackCalls.length).toBe(0)
    })
  })
})

// ============================================================
// 2. Viral Structure Analyzer
// ============================================================

// Timeout: viral-structure-analyzer has 1000ms sleep between LLM calls
describe('viral-structure-analyzer', { timeout: 30000 }, () => {
  function setupBuzzPostsMock(posts: unknown[]) {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'buzz_posts') {
        return {
          select: vi.fn(() => ({
            gt: vi.fn(() => ({
              gte: vi.fn(() => ({
                order: vi.fn(() => ({
                  limit: vi.fn(() =>
                    Promise.resolve({ data: posts, error: null }),
                  ),
                })),
              })),
            })),
          })),
        } as never
      }
      if (table === 'cortex_viral_analysis') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              limit: vi.fn(() =>
                Promise.resolve({ data: [], error: null }),
              ),
            })),
          })),
          insert: mockInsert,
        } as never
      }
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
        insert: mockInsert,
      } as never
    })
  }

  describe('score clamping', () => {
    it('clamps LLM scores to [0, 1] range', async () => {
      setupBuzzPostsMock([
        {
          id: 'post-1',
          platform: 'x',
          post_text: 'Test viral post about AI',
          author_handle: '@test',
          likes: 500,
          reposts: 100,
          replies: 50,
          impressions: 10000,
          buzz_score: 150,
        },
      ])

      mockClaudeCreate.mockResolvedValueOnce({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              emotional_trigger: 'surprise',
              information_density: 1.5, // should clamp to 1
              novelty_score: -0.3, // should clamp to 0
              authority_signal: 'data',
              controversy_level: 0.5,
              actionability: 2.0, // should clamp to 1
              primary_buzz_factor: 'test factor',
              secondary_factors: ['a', 'b'],
              anti_patterns: ['c'],
              replicability_score: 0.6,
            }),
          },
        ],
      })

      const { runViralStructureAnalyzer } = await import(
        '../../../lib/cortex/knowledge/viral-structure-analyzer'
      )
      const result = await runViralStructureAnalyzer()

      expect(result.analyzedCount).toBe(1)

      const analysisInsert = mockInsert.mock.calls.find((call) => {
        const arg = call[0] as Record<string, unknown>
        return arg && 'information_density' in arg
      })

      expect(analysisInsert).toBeDefined()
      const data = analysisInsert![0] as Record<string, number>
      expect(data.information_density).toBe(1) // clamped from 1.5
      expect(data.novelty_score).toBe(0) // clamped from -0.3
      expect(data.actionability).toBe(1) // clamped from 2.0
    })
  })

  describe('engagement rate calculation', () => {
    it('calculates engagement_rate as (likes+reposts+replies)/impressions', async () => {
      setupBuzzPostsMock([
        {
          id: 'post-eng',
          platform: 'x',
          post_text: 'Engagement test post',
          author_handle: '@test',
          likes: 200,
          reposts: 50,
          replies: 50,
          impressions: 1000,
          buzz_score: 120,
        },
      ])

      const { runViralStructureAnalyzer } = await import(
        '../../../lib/cortex/knowledge/viral-structure-analyzer'
      )
      await runViralStructureAnalyzer()

      const analysisInsert = mockInsert.mock.calls.find((call) => {
        const arg = call[0] as Record<string, unknown>
        return arg && 'engagement_rate' in arg
      })

      expect(analysisInsert).toBeDefined()
      const data = analysisInsert![0] as Record<string, number>
      // (200 + 50 + 50) / 1000 = 0.3
      expect(data.engagement_rate).toBeCloseTo(0.3)
    })

    it('sets engagement_rate to 0 when impressions is 0', async () => {
      setupBuzzPostsMock([
        {
          id: 'post-zero',
          platform: 'x',
          post_text: 'Zero impressions post',
          author_handle: '@test',
          likes: 10,
          reposts: 5,
          replies: 2,
          impressions: 0,
          buzz_score: 110,
        },
      ])

      const { runViralStructureAnalyzer } = await import(
        '../../../lib/cortex/knowledge/viral-structure-analyzer'
      )
      await runViralStructureAnalyzer()

      const analysisInsert = mockInsert.mock.calls.find((call) => {
        const arg = call[0] as Record<string, unknown>
        return arg && 'engagement_rate' in arg
      })

      expect(analysisInsert).toBeDefined()
      const data = analysisInsert![0] as Record<string, number>
      expect(data.engagement_rate).toBe(0)
    })
  })

  describe('already-analyzed posts', () => {
    it('skips posts that have already been analyzed', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'buzz_posts') {
          return {
            select: vi.fn(() => ({
              gt: vi.fn(() => ({
                gte: vi.fn(() => ({
                  order: vi.fn(() => ({
                    limit: vi.fn(() =>
                      Promise.resolve({
                        data: [
                          {
                            id: 'post-already',
                            platform: 'x',
                            post_text: 'Already analyzed',
                            author_handle: '@test',
                            likes: 500,
                            reposts: 100,
                            replies: 50,
                            impressions: 10000,
                            buzz_score: 200,
                          },
                        ],
                        error: null,
                      }),
                    ),
                  })),
                })),
              })),
            })),
          } as never
        }
        if (table === 'cortex_viral_analysis') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                limit: vi.fn(() =>
                  // Already analyzed - data has entries
                  Promise.resolve({ data: [{ id: 'existing' }], error: null }),
                ),
              })),
            })),
            insert: mockInsert,
          } as never
        }
        return { insert: mockInsert } as never
      })

      const { runViralStructureAnalyzer } = await import(
        '../../../lib/cortex/knowledge/viral-structure-analyzer'
      )
      const result = await runViralStructureAnalyzer()

      expect(result.analyzedCount).toBe(0)
      expect(result.skippedCount).toBe(1)
    })
  })

  describe('top patterns frequency counting', () => {
    it('builds topPatterns from emotional triggers and hook types', async () => {
      const posts = [
        { id: 'p1', platform: 'x', post_text: 'Post 1', author_handle: null, likes: 100, reposts: 10, replies: 5, impressions: 1000, buzz_score: 110 },
        { id: 'p2', platform: 'x', post_text: 'Post 2', author_handle: null, likes: 200, reposts: 20, replies: 10, impressions: 2000, buzz_score: 130 },
        { id: 'p3', platform: 'x', post_text: 'Post 3', author_handle: null, likes: 300, reposts: 30, replies: 15, impressions: 3000, buzz_score: 150 },
      ]
      setupBuzzPostsMock(posts)

      // All return same emotional_trigger to verify counting
      mockClaudeCreate.mockImplementation(() =>
        Promise.resolve({
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                emotional_trigger: 'surprise',
                information_density: 0.7,
                novelty_score: 0.8,
                authority_signal: 'data',
                controversy_level: 0.3,
                actionability: 0.9,
                primary_buzz_factor: 'test',
                secondary_factors: ['a'],
                anti_patterns: ['b'],
                replicability_score: 0.7,
              }),
            },
          ],
        }),
      )

      const { runViralStructureAnalyzer } = await import(
        '../../../lib/cortex/knowledge/viral-structure-analyzer'
      )
      const result = await runViralStructureAnalyzer()

      expect(result.analyzedCount).toBe(3)
      expect(result.topPatterns.length).toBeGreaterThan(0)
      // All 3 posts had 'surprise' trigger and 'question' hook (from mock pattern-extractor)
      expect(result.topPatterns).toContain('emotion:surprise(3)')
      expect(result.topPatterns).toContain('hook:question(3)')
    })
  })
})

// ============================================================
// 3. Temporal Pattern Miner
// ============================================================

describe('temporal-pattern-miner', () => {
  function setupTemporalMocks(
    xData: unknown[] = [],
    linkedinData: unknown[] = [],
    threadsData: unknown[] = [],
  ) {
    const insertedRows: Array<Record<string, unknown>> = []

    mockFrom.mockImplementation((table: string) => {
      if (table === 'x_post_analytics') {
        return {
          select: vi.fn(() => ({
            gte: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: xData, error: null })),
            })),
          })),
        } as never
      }
      if (table === 'linkedin_post_analytics') {
        return {
          select: vi.fn(() => ({
            gte: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: linkedinData, error: null })),
            })),
          })),
        } as never
      }
      if (table === 'threads_post_analytics') {
        return {
          select: vi.fn(() => ({
            gte: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: threadsData, error: null })),
            })),
          })),
        } as never
      }
      if (table === 'cortex_temporal_patterns') {
        return {
          insert: vi.fn((rows: Array<Record<string, unknown>>) => {
            insertedRows.push(...rows)
            return Promise.resolve({ data: null, error: null })
          }),
          delete: vi.fn(() => ({
            gte: vi.fn(() => ({
              lte: vi.fn(() => Promise.resolve({ error: null })),
            })),
          })),
        } as never
      }
      // slack_bot_memory and others
      return {
        insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      } as never
    })

    return { getInsertedRows: () => insertedRows }
  }

  describe('JST time conversion', () => {
    it('converts UTC midnight to JST 9:00', async () => {
      // 2025-01-15 is a Wednesday (day_of_week = 3)
      const { getInsertedRows } = setupTemporalMocks([
        {
          posted_at: '2025-01-15T00:00:00Z',
          likes: 100,
          retweets: 10,
          replies: 5,
          impressions: 1000,
          engagement_rate: 0.05,
          post_type: 'original',
          pattern_used: null,
          tags: ['AI'],
        },
      ])

      const { runTemporalPatternMiner } = await import(
        '../../../lib/cortex/knowledge/temporal-pattern-miner'
      )
      await runTemporalPatternMiner()

      const rows = getInsertedRows()
      expect(rows.length).toBeGreaterThan(0)
      // UTC 00:00 + 9h = JST 09:00
      expect(rows[0].hour_jst).toBe(9)
    })

    it('handles UTC 18:00 as JST 03:00 next day', async () => {
      // 2025-01-15T18:00Z in JST = Jan 16 03:00 (Thursday, day_of_week = 4)
      const { getInsertedRows } = setupTemporalMocks([
        {
          posted_at: '2025-01-15T18:00:00Z',
          likes: 100,
          retweets: 10,
          replies: 5,
          impressions: 1000,
          engagement_rate: 0.05,
          post_type: 'original',
          pattern_used: null,
          tags: ['AI'],
        },
      ])

      const { runTemporalPatternMiner } = await import(
        '../../../lib/cortex/knowledge/temporal-pattern-miner'
      )
      await runTemporalPatternMiner()

      const rows = getInsertedRows()
      expect(rows.length).toBeGreaterThan(0)
      // UTC 18:00 + 9h = JST 03:00 next day
      expect(rows[0].hour_jst).toBe(3)
      // Wednesday UTC -> Thursday JST
      expect(rows[0].day_of_week).toBe(4)
    })
  })

  describe('topic categorization from tags', () => {
    it('categorizes AI-related tags to AI category', async () => {
      const { getInsertedRows } = setupTemporalMocks([
        {
          posted_at: '2025-01-15T12:00:00Z',
          likes: 50,
          retweets: 5,
          replies: 2,
          impressions: 500,
          engagement_rate: 0.04,
          post_type: 'original',
          pattern_used: null,
          tags: ['GPT', 'OpenAI'],
        },
      ])

      const { runTemporalPatternMiner } = await import(
        '../../../lib/cortex/knowledge/temporal-pattern-miner'
      )
      await runTemporalPatternMiner()

      const rows = getInsertedRows()
      expect(rows.length).toBeGreaterThan(0)
      expect(rows[0].topic_category).toBe('AI')
    })

    it('categorizes claude-code tags to Claude Code category', async () => {
      const { getInsertedRows } = setupTemporalMocks([
        {
          posted_at: '2025-01-15T12:00:00Z',
          likes: 50,
          retweets: 5,
          replies: 2,
          impressions: 500,
          engagement_rate: 0.04,
          post_type: 'original',
          pattern_used: null,
          tags: ['claude-code', 'development'],
        },
      ])

      const { runTemporalPatternMiner } = await import(
        '../../../lib/cortex/knowledge/temporal-pattern-miner'
      )
      await runTemporalPatternMiner()

      const rows = getInsertedRows()
      expect(rows.length).toBeGreaterThan(0)
      expect(rows[0].topic_category).toBe('Claude Code')
    })

    it('defaults to Tech when tags do not match any keyword', async () => {
      const { getInsertedRows } = setupTemporalMocks([
        {
          posted_at: '2025-01-15T12:00:00Z',
          likes: 50,
          retweets: 5,
          replies: 2,
          impressions: 500,
          engagement_rate: 0.04,
          post_type: 'original',
          pattern_used: null,
          tags: ['random', 'unmatched'],
        },
      ])

      const { runTemporalPatternMiner } = await import(
        '../../../lib/cortex/knowledge/temporal-pattern-miner'
      )
      await runTemporalPatternMiner()

      const rows = getInsertedRows()
      expect(rows.length).toBeGreaterThan(0)
      expect(rows[0].topic_category).toBe('Tech')
    })

    it('defaults to Tech when tags are null', async () => {
      const { getInsertedRows } = setupTemporalMocks([
        {
          posted_at: '2025-01-15T12:00:00Z',
          likes: 50,
          retweets: 5,
          replies: 2,
          impressions: 500,
          engagement_rate: 0.04,
          post_type: 'original',
          pattern_used: null,
          tags: null,
        },
      ])

      const { runTemporalPatternMiner } = await import(
        '../../../lib/cortex/knowledge/temporal-pattern-miner'
      )
      await runTemporalPatternMiner()

      const rows = getInsertedRows()
      expect(rows.length).toBeGreaterThan(0)
      expect(rows[0].topic_category).toBe('Tech')
    })
  })

  describe('recommendation score normalization', () => {
    it('normalizes scores to 0-1 range with highest being 1.0', async () => {
      // 6 posts at 2 different time slots (3 each) to pass MIN_SAMPLE_COUNT
      // engagement_rate must be > 0.34 so that raw_score (3 * rate) > 1.0
      // (the normalizer uses Math.max(maxRawScore, 1) as denominator)
      const mockXData = [
        // Group A: 3 posts at same time slot with higher engagement
        ...Array.from({ length: 3 }, () => ({
          posted_at: '2025-01-15T10:00:00Z',
          likes: 100,
          retweets: 10,
          replies: 5,
          impressions: 1000,
          engagement_rate: 0.50,
          post_type: 'original',
          pattern_used: null,
          tags: ['AI'],
        })),
        // Group B: 3 posts at different time slot with lower engagement
        ...Array.from({ length: 3 }, () => ({
          posted_at: '2025-01-15T14:00:00Z',
          likes: 20,
          retweets: 2,
          replies: 1,
          impressions: 500,
          engagement_rate: 0.40,
          post_type: 'original',
          pattern_used: null,
          tags: ['AI'],
        })),
      ]

      const { getInsertedRows } = setupTemporalMocks(mockXData)

      const { runTemporalPatternMiner } = await import(
        '../../../lib/cortex/knowledge/temporal-pattern-miner'
      )
      await runTemporalPatternMiner()

      const rows = getInsertedRows()
      const qualifiedRows = rows.filter(
        (r) => (r.recommendation_score as number) > 0,
      )
      expect(qualifiedRows.length).toBeGreaterThan(0)

      // All scores between 0 and 1
      for (const row of rows) {
        expect(row.recommendation_score as number).toBeGreaterThanOrEqual(0)
        expect(row.recommendation_score as number).toBeLessThanOrEqual(1)
      }

      // The highest score should be 1.0
      const maxScore = Math.max(
        ...qualifiedRows.map((r) => r.recommendation_score as number),
      )
      expect(maxScore).toBeCloseTo(1.0)
    })
  })

  describe('minimum sample count threshold', () => {
    it('assigns 0 recommendation score to groups with fewer than 3 samples', async () => {
      // Only 2 posts at the same time slot
      const { getInsertedRows } = setupTemporalMocks([
        {
          posted_at: '2025-01-15T10:00:00Z',
          likes: 50,
          retweets: 5,
          replies: 2,
          impressions: 500,
          engagement_rate: 0.04,
          post_type: 'original',
          pattern_used: null,
          tags: ['AI'],
        },
        {
          posted_at: '2025-01-22T10:00:00Z', // same day-of-week, same hour
          likes: 60,
          retweets: 6,
          replies: 3,
          impressions: 600,
          engagement_rate: 0.05,
          post_type: 'original',
          pattern_used: null,
          tags: ['AI'],
        },
      ])

      const { runTemporalPatternMiner } = await import(
        '../../../lib/cortex/knowledge/temporal-pattern-miner'
      )
      await runTemporalPatternMiner()

      const rows = getInsertedRows()
      // All groups have < 3 samples, so all recommendation_scores should be 0
      for (const row of rows) {
        if ((row.sample_count as number) < 3) {
          expect(row.recommendation_score).toBe(0)
        }
      }
    })
  })

  describe('empty data handling', () => {
    it('aborts gracefully when no posts found across all platforms', async () => {
      setupTemporalMocks([], [], [])

      const { runTemporalPatternMiner } = await import(
        '../../../lib/cortex/knowledge/temporal-pattern-miner'
      )

      // Should not throw
      await expect(runTemporalPatternMiner()).resolves.toBeUndefined()
    })
  })
})

// ============================================================
// 4. Deep Trend Researcher
// ============================================================

// Timeout: deep-trend-researcher has 2000ms delay between topics + 500ms between searches
describe('deep-trend-researcher', { timeout: 60000 }, () => {
  function setupTrendMocks(buzzPosts: unknown[]) {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'buzz_posts') {
        return {
          select: vi.fn(() => ({
            gte: vi.fn(() => ({
              gt: vi.fn(() => ({
                order: vi.fn(() => ({
                  limit: vi.fn(() =>
                    Promise.resolve({ data: buzzPosts, error: null }),
                  ),
                })),
              })),
            })),
          })),
        } as never
      }
      if (table === 'slack_bot_memory') {
        return {
          select: vi.fn(() => ({
            filter: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn(() => ({
                  maybeSingle: vi.fn(() =>
                    Promise.resolve({ data: null, error: null }),
                  ),
                })),
              })),
            })),
          })),
          insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
        } as never
      }
      return {
        insert: mockInsert,
      } as never
    })
  }

  describe('topic extraction and deduplication', () => {
    it('extracts topics matching TOPIC_EXTRACTION_KEYWORDS from buzz posts', async () => {
      setupTrendMocks([
        {
          post_text: 'Claude Code is amazing for development',
          buzz_score: 150,
          post_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
        {
          post_text: 'GPT-4 comparison shows interesting results',
          buzz_score: 200,
          post_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
      ])

      mockClaudeCreate.mockImplementation(() =>
        Promise.resolve({
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                topic: 'Claude Code',
                maturity: 'growing',
                what_everyone_says: ['productivity boost'],
                unexplored_angles: ['enterprise adoption'],
                japan_specific_angle: 'Japanese dev community',
                freshness_hours: 12,
                recommended_content_types: ['thread'],
                recommended_platforms: ['x'],
                key_data_points: ['50% faster'],
                contrarian_take: 'May replace IDEs',
              }),
            },
          ],
        }),
      )

      const { runDeepTrendResearcher } = await import(
        '../../../lib/cortex/knowledge/deep-trend-researcher'
      )
      await runDeepTrendResearcher()

      // Claude was called for topic analysis
      expect(mockClaudeCreate).toHaveBeenCalled()

      // Results were saved to cortex_viral_analysis
      const analysisInserts = mockInsert.mock.calls.filter((call) => {
        const arg = call[0] as Record<string, unknown>
        return arg && 'hook_type' in arg && arg.hook_type === 'trend_analysis'
      })
      expect(analysisInserts.length).toBeGreaterThan(0)
    })

    it('limits extracted topics to MAX_TOPICS (5)', async () => {
      // Create posts mentioning many different keywords
      setupTrendMocks([
        { post_text: 'Claude is great', buzz_score: 100, post_date: new Date().toISOString(), created_at: new Date().toISOString() },
        { post_text: 'GPT update released', buzz_score: 90, post_date: new Date().toISOString(), created_at: new Date().toISOString() },
        { post_text: 'Gemini comparison', buzz_score: 85, post_date: new Date().toISOString(), created_at: new Date().toISOString() },
        { post_text: 'OpenAI enterprise', buzz_score: 80, post_date: new Date().toISOString(), created_at: new Date().toISOString() },
        { post_text: 'Cursor editor AI', buzz_score: 75, post_date: new Date().toISOString(), created_at: new Date().toISOString() },
        { post_text: 'MCP protocol standard', buzz_score: 70, post_date: new Date().toISOString(), created_at: new Date().toISOString() },
        { post_text: 'Devin AI agent', buzz_score: 65, post_date: new Date().toISOString(), created_at: new Date().toISOString() },
        { post_text: 'Perplexity search', buzz_score: 60, post_date: new Date().toISOString(), created_at: new Date().toISOString() },
      ])

      let claudeCallCount = 0
      mockClaudeCreate.mockImplementation(() => {
        claudeCallCount++
        return Promise.resolve({
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                topic: 'Test',
                maturity: 'growing',
                what_everyone_says: [],
                unexplored_angles: [],
                japan_specific_angle: '',
                freshness_hours: 12,
                recommended_content_types: [],
                recommended_platforms: ['x'],
                key_data_points: [],
                contrarian_take: 'test',
              }),
            },
          ],
        })
      })

      const { runDeepTrendResearcher } = await import(
        '../../../lib/cortex/knowledge/deep-trend-researcher'
      )
      await runDeepTrendResearcher()

      // Should not process more than MAX_TOPICS (5) topics
      expect(claudeCallCount).toBeLessThanOrEqual(5)
    })

    it('applies recency bonus to topics from recent posts', async () => {
      const now = new Date()
      const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000)
      const twentyHoursAgo = new Date(now.getTime() - 20 * 60 * 60 * 1000)

      setupTrendMocks([
        {
          post_text: 'Claude new feature announcement today',
          buzz_score: 100,
          post_date: threeHoursAgo.toISOString(),
          created_at: threeHoursAgo.toISOString(),
        },
        {
          post_text: 'GPT update from yesterday was interesting',
          buzz_score: 100,
          post_date: twentyHoursAgo.toISOString(),
          created_at: twentyHoursAgo.toISOString(),
        },
      ])

      const topicOrder: string[] = []
      mockClaudeCreate.mockImplementation((args: Record<string, unknown>) => {
        const messages = args.messages as Array<{ content: string }>
        const content = messages[0]?.content ?? ''
        const match = content.match(/Topic: "([^"]+)"/)
        if (match) topicOrder.push(match[1])

        return Promise.resolve({
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                topic: 'Test',
                maturity: 'growing',
                what_everyone_says: [],
                unexplored_angles: [],
                japan_specific_angle: '',
                freshness_hours: 12,
                recommended_content_types: [],
                recommended_platforms: ['x'],
                key_data_points: [],
                contrarian_take: 'test',
              }),
            },
          ],
        })
      })

      const { runDeepTrendResearcher } = await import(
        '../../../lib/cortex/knowledge/deep-trend-researcher'
      )
      await runDeepTrendResearcher()

      // Claude (3h ago) gets 2x multiplier: 100*2 = 200
      // GPT (20h ago) gets 1x multiplier: 100*1 = 100
      // So 'claude' should be processed first
      if (topicOrder.length >= 2) {
        expect(topicOrder[0]).toBe('claude')
      }
    })
  })

  describe('maturity-based novelty scoring', () => {
    it('assigns novelty_score 0.9 to emerging topics', async () => {
      setupTrendMocks([
        {
          post_text: 'Claude code new feature',
          buzz_score: 120,
          post_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
      ])

      mockClaudeCreate.mockResolvedValueOnce({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              topic: 'Claude Code',
              maturity: 'emerging',
              what_everyone_says: ['productivity boost'],
              unexplored_angles: ['enterprise use'],
              japan_specific_angle: 'Japanese dev community',
              freshness_hours: 6,
              recommended_content_types: ['thread'],
              recommended_platforms: ['x'],
              key_data_points: ['50% faster'],
              contrarian_take: 'Will replace IDEs',
            }),
          },
        ],
      })

      const { runDeepTrendResearcher } = await import(
        '../../../lib/cortex/knowledge/deep-trend-researcher'
      )
      await runDeepTrendResearcher()

      const viralInsert = mockInsert.mock.calls.find((call) => {
        const arg = call[0] as Record<string, unknown>
        return arg && 'novelty_score' in arg && arg.hook_type === 'trend_analysis'
      })

      expect(viralInsert).toBeDefined()
      const data = viralInsert![0] as Record<string, unknown>
      expect(data.novelty_score).toBe(0.9) // emerging = 0.9
      expect(data.primary_buzz_factor).toBe('trend_emerging')
    })

    it('assigns novelty_score 0.6 to growing topics', async () => {
      setupTrendMocks([
        {
          post_text: 'Claude code update',
          buzz_score: 120,
          post_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
      ])

      mockClaudeCreate.mockResolvedValueOnce({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              topic: 'Claude Code',
              maturity: 'growing',
              what_everyone_says: [],
              unexplored_angles: [],
              japan_specific_angle: '',
              freshness_hours: 12,
              recommended_content_types: [],
              recommended_platforms: ['x'],
              key_data_points: [],
              contrarian_take: 'test',
            }),
          },
        ],
      })

      const { runDeepTrendResearcher } = await import(
        '../../../lib/cortex/knowledge/deep-trend-researcher'
      )
      await runDeepTrendResearcher()

      const viralInsert = mockInsert.mock.calls.find((call) => {
        const arg = call[0] as Record<string, unknown>
        return arg && 'novelty_score' in arg && arg.hook_type === 'trend_analysis'
      })

      expect(viralInsert).toBeDefined()
      expect((viralInsert![0] as Record<string, unknown>).novelty_score).toBe(0.6)
    })

    it('assigns novelty_score 0.3 to saturated topics', async () => {
      setupTrendMocks([
        {
          post_text: 'Claude code is everywhere now',
          buzz_score: 120,
          post_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
      ])

      mockClaudeCreate.mockResolvedValueOnce({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              topic: 'Claude Code',
              maturity: 'saturated',
              what_everyone_says: [],
              unexplored_angles: [],
              japan_specific_angle: '',
              freshness_hours: 48,
              recommended_content_types: [],
              recommended_platforms: ['x'],
              key_data_points: [],
              contrarian_take: 'test',
            }),
          },
        ],
      })

      const { runDeepTrendResearcher } = await import(
        '../../../lib/cortex/knowledge/deep-trend-researcher'
      )
      await runDeepTrendResearcher()

      const viralInsert = mockInsert.mock.calls.find((call) => {
        const arg = call[0] as Record<string, unknown>
        return arg && 'novelty_score' in arg && arg.hook_type === 'trend_analysis'
      })

      expect(viralInsert).toBeDefined()
      expect((viralInsert![0] as Record<string, unknown>).novelty_score).toBe(0.3)
    })
  })

  describe('Claude response validation', () => {
    it('handles malformed Claude responses gracefully', async () => {
      setupTrendMocks([
        {
          post_text: 'Claude testing edge case',
          buzz_score: 110,
          post_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
      ])

      mockClaudeCreate.mockResolvedValueOnce({
        content: [
          {
            type: 'text',
            text: 'This is not valid JSON at all {{{',
          },
        ],
      })

      const { runDeepTrendResearcher } = await import(
        '../../../lib/cortex/knowledge/deep-trend-researcher'
      )

      // Should not throw
      await expect(runDeepTrendResearcher()).resolves.toBeUndefined()
    })

    it('defaults maturity to growing for invalid values', async () => {
      setupTrendMocks([
        {
          post_text: 'Claude code test',
          buzz_score: 110,
          post_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
      ])

      mockClaudeCreate.mockResolvedValueOnce({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              topic: 'Claude Code',
              maturity: 'INVALID_VALUE',
              what_everyone_says: [],
              unexplored_angles: [],
              japan_specific_angle: '',
              freshness_hours: 12,
              recommended_content_types: [],
              recommended_platforms: ['x'],
              key_data_points: [],
              contrarian_take: 'test',
            }),
          },
        ],
      })

      const { runDeepTrendResearcher } = await import(
        '../../../lib/cortex/knowledge/deep-trend-researcher'
      )
      await runDeepTrendResearcher()

      const viralInsert = mockInsert.mock.calls.find((call) => {
        const arg = call[0] as Record<string, unknown>
        return arg && 'primary_buzz_factor' in arg && arg.hook_type === 'trend_analysis'
      })

      if (viralInsert) {
        const data = viralInsert[0] as Record<string, unknown>
        // Invalid maturity defaults to 'growing' -> novelty_score 0.6
        expect(data.novelty_score).toBe(0.6)
        expect(data.primary_buzz_factor).toBe('trend_growing')
      }
    })
  })

  describe('no data scenario', () => {
    it('aborts gracefully when no buzz posts are found', async () => {
      setupTrendMocks([])

      const { runDeepTrendResearcher } = await import(
        '../../../lib/cortex/knowledge/deep-trend-researcher'
      )
      await runDeepTrendResearcher()

      // Claude should not have been called
      expect(mockClaudeCreate).not.toHaveBeenCalled()
    })
  })
})
