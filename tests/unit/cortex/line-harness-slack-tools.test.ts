import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---- Mocks ----

const mockIsConfigured = vi.fn()
const mockGetClient = vi.fn()
const mockFriendsCount = vi.fn()
const mockFriendsList = vi.fn()
const mockTagsList = vi.fn()
const mockRichMenusList = vi.fn()
const mockCreateStepScenario = vi.fn()
const mockFriendsSetRichMenu = vi.fn()

vi.mock('@line-harness/sdk', () => ({
  LineHarness: vi.fn(),
}))

vi.mock('@/lib/cortex/line-harness/client', () => ({
  getLineHarnessClient: (...args: unknown[]) => mockGetClient(...args),
  isLineHarnessConfigured: (...args: unknown[]) => mockIsConfigured(...args),
}))

vi.mock('@/lib/slack-bot/memory', () => ({
  createPendingAction: vi.fn().mockResolvedValue({
    id: 'action-123',
    status: 'pending',
  }),
}))

vi.mock('@/lib/slack-bot/slack-client', () => ({
  sendMessage: vi.fn().mockResolvedValue(undefined),
  buildApprovalBlocks: vi.fn().mockReturnValue([]),
}))

import { createLineHarnessTools } from '@/lib/cortex/line-harness/slack-tools'
import type { AgentContext } from '@/lib/slack-bot/types'

const mockContext: AgentContext = {
  slackChannelId: 'C-test-channel',
  slackUserId: 'U-test-user',
  slackThreadTs: 'ts-123',
} as AgentContext

describe('LINE Harness Slack Tools', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockGetClient.mockReturnValue({
      friends: {
        count: mockFriendsCount,
        list: mockFriendsList,
        setRichMenu: mockFriendsSetRichMenu,
      },
      tags: { list: mockTagsList },
      richMenus: { list: mockRichMenusList },
      createStepScenario: mockCreateStepScenario,
    })
  })

  describe('createLineHarnessTools', () => {
    it('returns array of 5 tools', () => {
      const tools = createLineHarnessTools(mockContext)

      expect(Array.isArray(tools)).toBe(true)
      expect(tools).toHaveLength(5)
    })

    it('each tool has correct name', () => {
      const tools = createLineHarnessTools(mockContext)
      const names = tools.map((t) => t.name)

      expect(names).toContain('broadcast_to_line')
      expect(names).toContain('segment_broadcast')
      expect(names).toContain('get_line_analytics')
      expect(names).toContain('create_scenario')
      expect(names).toContain('switch_rich_menu')
    })
  })

  describe('Tools return error when LINE Harness not configured', () => {
    it('broadcast_to_line returns error', async () => {
      mockIsConfigured.mockReturnValue(false)

      const tools = createLineHarnessTools(mockContext)
      const broadcastTool = tools.find((t) => t.name === 'broadcast_to_line')!

      const result = await broadcastTool.invoke({ message: 'Hello LINE!' })
      const parsed = JSON.parse(result as string)

      expect(parsed.success).toBe(false)
      expect(parsed.error).toContain('LINE Harness is not configured')
    })

    it('segment_broadcast returns error', async () => {
      mockIsConfigured.mockReturnValue(false)

      const tools = createLineHarnessTools(mockContext)
      const segmentTool = tools.find((t) => t.name === 'segment_broadcast')!

      const result = await segmentTool.invoke({
        tagName: 'test-tag',
        message: 'Hello segment!',
      })
      const parsed = JSON.parse(result as string)

      expect(parsed.success).toBe(false)
      expect(parsed.error).toContain('LINE Harness is not configured')
    })

    it('get_line_analytics returns error', async () => {
      mockIsConfigured.mockReturnValue(false)

      const tools = createLineHarnessTools(mockContext)
      const analyticsTool = tools.find((t) => t.name === 'get_line_analytics')!

      const result = await analyticsTool.invoke({})
      const parsed = JSON.parse(result as string)

      expect(parsed.success).toBe(false)
      expect(parsed.error).toContain('LINE Harness is not configured')
    })

    it('create_scenario returns error', async () => {
      mockIsConfigured.mockReturnValue(false)

      const tools = createLineHarnessTools(mockContext)
      const scenarioTool = tools.find((t) => t.name === 'create_scenario')!

      const result = await scenarioTool.invoke({
        name: 'test',
        triggerType: 'friend_add',
        steps: [{ delayMinutes: 0, message: 'Hello' }],
      })
      const parsed = JSON.parse(result as string)

      expect(parsed.success).toBe(false)
      expect(parsed.error).toContain('LINE Harness is not configured')
    })

    it('switch_rich_menu returns error', async () => {
      mockIsConfigured.mockReturnValue(false)

      const tools = createLineHarnessTools(mockContext)
      const richMenuTool = tools.find((t) => t.name === 'switch_rich_menu')!

      const result = await richMenuTool.invoke({ richMenuId: 'rm-123' })
      const parsed = JSON.parse(result as string)

      expect(parsed.success).toBe(false)
      expect(parsed.error).toContain('LINE Harness is not configured')
    })
  })

  describe('broadcast_to_line', () => {
    it('creates pending action for HITL approval', async () => {
      mockIsConfigured.mockReturnValue(true)
      mockFriendsCount.mockResolvedValue(150)

      const { createPendingAction } = await import('@/lib/slack-bot/memory')

      const tools = createLineHarnessTools(mockContext)
      const broadcastTool = tools.find((t) => t.name === 'broadcast_to_line')!

      const result = await broadcastTool.invoke({
        message: 'Important announcement',
      })
      const parsed = JSON.parse(result as string)

      expect(parsed.success).toBe(true)
      expect(parsed.actionId).toBe('action-123')
      expect(parsed.friendCount).toBe(150)
      expect(createPendingAction).toHaveBeenCalledWith(
        expect.objectContaining({
          slackChannelId: 'C-test-channel',
          slackUserId: 'U-test-user',
          payload: expect.objectContaining({
            type: 'line_broadcast',
            message: 'Important announcement',
            friendCount: 150,
          }),
        }),
      )
    })
  })

  describe('get_line_analytics', () => {
    it('returns structured response with friend count, tags, and score tiers', async () => {
      mockIsConfigured.mockReturnValue(true)
      mockFriendsCount.mockResolvedValue(200)
      mockTagsList.mockResolvedValue([
        { name: 'utm:x' },
        { name: 'utm:linkedin' },
      ])
      mockFriendsList.mockResolvedValue({
        data: [
          { tags: ['utm:x'], score: 120 },
          { tags: ['utm:x', 'utm:linkedin'], score: 50 },
          { tags: [], score: 5 },
        ],
      })

      const tools = createLineHarnessTools(mockContext)
      const analyticsTool = tools.find((t) => t.name === 'get_line_analytics')!

      const result = await analyticsTool.invoke({})
      const parsed = JSON.parse(result as string)

      expect(parsed.success).toBe(true)
      expect(parsed.friendCount).toBe(200)
      expect(parsed.tagDistribution).toBeDefined()
      expect(Array.isArray(parsed.tagDistribution)).toBe(true)
      expect(parsed.scoreTiers).toBeDefined()
      expect(parsed.scoreTiers).toHaveProperty('cold')
      expect(parsed.scoreTiers).toHaveProperty('warm')
      expect(parsed.scoreTiers).toHaveProperty('hot')
    })
  })
})
