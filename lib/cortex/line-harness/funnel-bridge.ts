import { getLineHarnessClientSafe } from './client'
import { UTM_TAG_MAP } from './types'
import { getSupabase } from '../discord/context-builder'

const WELCOME_SCENARIO_NAME = 'cortex-welcome'

/**
 * Bridge a LINE friend follow event to LINE Harness CRM.
 * Called from funnel-tracker.ts handleFollow().
 *
 * 1. Find or create the friend in LINE Harness by LINE user ID
 * 2. Auto-tag based on UTM source (if tracked)
 * 3. Enroll in welcome scenario
 * 4. Mirror to cortex_line_friends in Supabase
 */
export async function bridgeFollowToHarness(
  lineUserId: string,
  utmSource?: string,
  utmCampaign?: string,
): Promise<void> {
  const client = getLineHarnessClientSafe()
  if (!client) {
    console.log('[funnel-bridge] LINE Harness not configured, skipping')
    return
  }

  try {
    // 1. Find the friend in LINE Harness
    const friends = await client.friends.list({ limit: 1 })
    // The friend should already exist if webhook is configured - LINE Harness creates them on friend_add
    // We search by checking recent additions
    const friend = friends.items.find(
      (f: { lineUserId: string }) => f.lineUserId === lineUserId,
    )

    if (!friend) {
      console.log(
        `[funnel-bridge] Friend ${lineUserId} not found in LINE Harness, will be synced later`,
      )
    }

    // 2. Auto-tag based on UTM source
    if (friend && utmSource) {
      const tagName =
        UTM_TAG_MAP[utmSource.toLowerCase()] || `utm:${utmSource}`
      await ensureTagAndApply(client, friend.id, tagName)
    }

    // 3. Enroll in welcome scenario
    if (friend) {
      await enrollInWelcomeScenario(client, friend.id)
    }

    // 4. Mirror to Supabase
    const supabase = getSupabase()
    await supabase.from('cortex_line_friends').upsert(
      {
        line_user_id: lineUserId,
        harness_friend_id: friend?.id || null,
        display_name: friend?.displayName || null,
        source_platform: utmSource || null,
        source_campaign: utmCampaign || null,
        tags: friend ? friend.tags.map((t: { name: string }) => t.name) : [],
        current_score: 0,
        score_tier: 'cold',
        friend_added_at: new Date().toISOString(),
        synced_at: new Date().toISOString(),
      },
      { onConflict: 'line_user_id' },
    )

    console.log(
      `[funnel-bridge] Bridged follow for ${lineUserId} (source: ${utmSource || 'direct'})`,
    )
  } catch (err) {
    console.error('[funnel-bridge] Error:', err)
    // Don't throw - LINE Harness errors must not break the main flow
  }
}

async function ensureTagAndApply(
  client: ReturnType<typeof getLineHarnessClientSafe> & object,
  friendId: string,
  tagName: string,
): Promise<void> {
  try {
    // Get existing tags
    const tags = await client.tags.list()
    let tag = tags.find((t: { name: string }) => t.name === tagName)

    // Create tag if it doesn't exist
    if (!tag) {
      tag = await client.tags.create({ name: tagName, color: '#4A9EFF' })
    }

    // Apply tag to friend
    await client.friends.addTag(friendId, tag.id)
    console.log(
      `[funnel-bridge] Applied tag "${tagName}" to friend ${friendId}`,
    )
  } catch (err) {
    console.error(`[funnel-bridge] Failed to apply tag "${tagName}":`, err)
  }
}

async function enrollInWelcomeScenario(
  client: ReturnType<typeof getLineHarnessClientSafe> & object,
  friendId: string,
): Promise<void> {
  try {
    const scenarios = await client.scenarios.list()
    const welcome = scenarios.find(
      (s: { name: string; isActive: boolean }) =>
        s.name === WELCOME_SCENARIO_NAME && s.isActive,
    )

    if (welcome) {
      await client.scenarios.enroll(welcome.id, friendId)
      console.log(
        `[funnel-bridge] Enrolled friend ${friendId} in welcome scenario`,
      )
    }
  } catch (err) {
    // Enrollment failure is non-critical
    console.error(
      '[funnel-bridge] Failed to enroll in welcome scenario:',
      err,
    )
  }
}
