import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---- Mocks ----

const mockFriendsList = vi.fn()
const mockTagsList = vi.fn()
const mockTagsCreate = vi.fn()
const mockFriendsAddTag = vi.fn()
const mockScenariosList = vi.fn()
const mockScenariosEnroll = vi.fn()

vi.mock('@line-harness/sdk', () => ({
  LineHarness: vi.fn(),
}))

const mockClientInstance = {
  friends: {
    list: mockFriendsList,
    addTag: mockFriendsAddTag,
  },
  tags: {
    list: mockTagsList,
    create: mockTagsCreate,
  },
  scenarios: {
    list: mockScenariosList,
    enroll: mockScenariosEnroll,
  },
}

vi.mock('@/lib/cortex/line-harness/client', () => ({
  getLineHarnessClientSafe: vi.fn(),
}))

const mockUpsert = vi.fn().mockResolvedValue({ data: null, error: null })
const mockFrom = vi.fn().mockReturnValue({ upsert: mockUpsert })

vi.mock('@/lib/cortex/discord/context-builder', () => ({
  getSupabase: vi.fn().mockReturnValue({
    from: (...args: unknown[]) => mockFrom(...args),
  }),
}))

import { getLineHarnessClientSafe } from '@/lib/cortex/line-harness/client'
import { bridgeFollowToHarness } from '@/lib/cortex/line-harness/funnel-bridge'

const mockedGetClient = vi.mocked(getLineHarnessClientSafe)

describe('Funnel Bridge - bridgeFollowToHarness', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns early when LINE Harness not configured', async () => {
    mockedGetClient.mockReturnValue(null)

    await bridgeFollowToHarness('U1234567890', 'x')

    expect(mockFriendsList).not.toHaveBeenCalled()
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('tags friend with correct UTM tag for source platform', async () => {
    const friendData = {
      id: 'friend-123',
      lineUserId: 'U1234567890',
      displayName: 'Test User',
      tags: [{ name: 'utm:x' }],
    }

    mockedGetClient.mockReturnValue(mockClientInstance as never)
    mockFriendsList.mockResolvedValue({ items: [friendData] })
    mockTagsList.mockResolvedValue([{ id: 'tag-1', name: 'utm:x' }])
    mockScenariosList.mockResolvedValue([])

    await bridgeFollowToHarness('U1234567890', 'x')

    expect(mockFriendsAddTag).toHaveBeenCalledWith('friend-123', 'tag-1')
  })

  it('creates tag if it does not exist', async () => {
    const friendData = {
      id: 'friend-123',
      lineUserId: 'U1234567890',
      displayName: 'Test User',
      tags: [],
    }

    mockedGetClient.mockReturnValue(mockClientInstance as never)
    mockFriendsList.mockResolvedValue({ items: [friendData] })
    mockTagsList.mockResolvedValue([]) // No existing tags
    mockTagsCreate.mockResolvedValue({ id: 'new-tag-1', name: 'utm:linkedin' })
    mockScenariosList.mockResolvedValue([])

    await bridgeFollowToHarness('U1234567890', 'linkedin')

    expect(mockTagsCreate).toHaveBeenCalledWith({
      name: 'utm:linkedin',
      color: '#4A9EFF',
    })
    expect(mockFriendsAddTag).toHaveBeenCalledWith('friend-123', 'new-tag-1')
  })

  it('enrolls friend in welcome scenario', async () => {
    const friendData = {
      id: 'friend-456',
      lineUserId: 'U9876543210',
      displayName: 'Scenario User',
      tags: [],
    }

    mockedGetClient.mockReturnValue(mockClientInstance as never)
    mockFriendsList.mockResolvedValue({ items: [friendData] })
    mockTagsList.mockResolvedValue([])
    mockScenariosList.mockResolvedValue([
      { id: 'scenario-1', name: 'cortex-welcome', isActive: true },
    ])

    await bridgeFollowToHarness('U9876543210')

    expect(mockScenariosEnroll).toHaveBeenCalledWith('scenario-1', 'friend-456')
  })

  it('upserts to cortex_line_friends in Supabase', async () => {
    const friendData = {
      id: 'friend-789',
      lineUserId: 'U5555555555',
      displayName: 'Supabase User',
      tags: [{ name: 'utm:blog' }],
    }

    mockedGetClient.mockReturnValue(mockClientInstance as never)
    mockFriendsList.mockResolvedValue({ items: [friendData] })
    mockTagsList.mockResolvedValue([{ id: 'tag-blog', name: 'utm:blog' }])
    mockScenariosList.mockResolvedValue([])

    await bridgeFollowToHarness('U5555555555', 'blog', 'spring-campaign')

    expect(mockFrom).toHaveBeenCalledWith('cortex_line_friends')
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        line_user_id: 'U5555555555',
        harness_friend_id: 'friend-789',
        display_name: 'Supabase User',
        source_platform: 'blog',
        source_campaign: 'spring-campaign',
        tags: ['utm:blog'],
        current_score: 0,
        score_tier: 'cold',
      }),
      { onConflict: 'line_user_id' },
    )
  })

  it('handles errors gracefully without throwing', async () => {
    mockedGetClient.mockReturnValue(mockClientInstance as never)
    mockFriendsList.mockRejectedValue(new Error('API connection failed'))

    // Should not throw
    await expect(
      bridgeFollowToHarness('U1234567890', 'x'),
    ).resolves.toBeUndefined()
  })
})
