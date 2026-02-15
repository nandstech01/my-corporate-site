/**
 * トレンド収集オーケストレーター
 *
 * GitHub Actions cron (毎日 14:00 UTC = JST 23:00) で実行
 *
 * 1. fetchTrendingStories() → HN + Dev.to から取得
 * 2. 記事が0件なら早期リターン
 * 3. analyzeTrendingTopics() → GPT-4o-mini 要約
 * 4. slack_bot_memory に保存 (context: { source: 'trending_topics' })
 */

import { createClient } from '@supabase/supabase-js'
import { fetchTrendingStories } from './trending-client'
import { analyzeTrendingTopics } from './trending-analyzer'

// ============================================================
// slack_bot_memory 保存
// ============================================================

async function saveTrendingSummaryToMemory(
  summaryText: string,
): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  }

  const userId = process.env.SLACK_ALLOWED_USER_IDS?.split(',')[0]
  if (!userId) return

  const supabase = createClient(url, key)

  const { error } = await supabase.from('slack_bot_memory').insert({
    slack_user_id: userId,
    memory_type: 'fact',
    content: summaryText,
    context: { source: 'trending_topics' },
    importance: 0.7,
  })

  if (error) {
    throw new Error(
      `Failed to save trending summary to memory: ${error.message}`,
    )
  }
}

// ============================================================
// メインオーケストレーター
// ============================================================

export async function runTrendingCollector(): Promise<void> {
  // 1. トレンド記事取得（HN + Dev.to）
  process.stdout.write('Fetching trending stories...\n')
  const stories = await fetchTrendingStories()
  process.stdout.write(`Found ${stories.length} trending stories\n`)

  if (stories.length === 0) return

  // 2. GPT-4o-mini でトピック要約
  process.stdout.write('Analyzing trending topics...\n')
  const summary = await analyzeTrendingTopics(stories)
  process.stdout.write(
    `Extracted ${summary.hotTopics.length} hot topics\n`,
  )

  // 3. slack_bot_memory に保存
  await saveTrendingSummaryToMemory(summary.summaryText)
  process.stdout.write('Saved trending summary to memory\n')
}
