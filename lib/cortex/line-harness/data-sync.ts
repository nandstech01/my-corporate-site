import { getLineHarnessClientSafe } from './client'
import { getSupabase } from '../discord/context-builder'
import { SCORE_TIERS } from './types'
import type { Friend } from '@line-harness/sdk'
import type { SupabaseClient } from '@supabase/supabase-js'

const BATCH_SIZE = 100
const MAX_PAGES = 50 // Safety limit: 5000 friends max per sync

/**
 * Sync LINE Harness friend data to Supabase cortex_line_friends.
 * Runs as a cron job (daily or more frequent).
 */
export async function runLineHarnessSync(): Promise<{
  synced: number
  errors: number
}> {
  const client = getLineHarnessClientSafe()
  if (!client) {
    console.log('[line-harness-sync] LINE Harness not configured, skipping')
    return { synced: 0, errors: 0 }
  }

  const supabase = getSupabase()
  let synced = 0
  let errors = 0
  let page = 0

  console.log('[line-harness-sync] Starting sync...')

  try {
    let hasMore = true

    while (hasMore && page < MAX_PAGES) {
      const result = await client.friends.list({
        limit: BATCH_SIZE,
        offset: page * BATCH_SIZE,
      })

      if (result.items.length === 0) break

      for (const friend of result.items) {
        try {
          await syncFriend(supabase, friend)
          synced++
        } catch (err) {
          console.error(
            `[line-harness-sync] Failed to sync friend ${friend.id}:`,
            err,
          )
          errors++
        }
      }

      hasMore = result.hasNextPage
      page++

      // Rate limit: small delay between pages
      if (hasMore) {
        await new Promise((r) => setTimeout(r, 500))
      }
    }

    console.log(
      `[line-harness-sync] Done! Synced: ${synced}, Errors: ${errors}`,
    )
  } catch (err) {
    console.error('[line-harness-sync] Fatal error:', err)
  }

  return { synced, errors }
}

async function syncFriend(
  supabase: SupabaseClient,
  friend: Friend,
): Promise<void> {
  const tags = friend.tags?.map((t) => t.name) || []

  // Determine score tier
  // Note: LINE Harness tracks scores internally, but we may not have direct access
  // to the aggregate score. For now, we'll read from our scoring log.
  const { data: scoreData } = await supabase
    .from('cortex_line_scoring_log')
    .select('score_after')
    .eq('line_user_id', friend.lineUserId)
    .order('created_at', { ascending: false })
    .limit(1)

  const currentScore = scoreData?.[0]?.score_after ?? 0
  const scoreTier = getScoreTier(currentScore)

  await supabase.from('cortex_line_friends').upsert(
    {
      line_user_id: friend.lineUserId,
      harness_friend_id: friend.id,
      display_name: friend.displayName,
      tags,
      current_score: currentScore,
      score_tier: scoreTier,
      synced_at: new Date().toISOString(),
    },
    { onConflict: 'line_user_id' },
  )
}

function getScoreTier(score: number): 'cold' | 'warm' | 'hot' {
  for (const tier of SCORE_TIERS) {
    if (score >= tier.min_score) return tier.name
  }
  return 'cold'
}
