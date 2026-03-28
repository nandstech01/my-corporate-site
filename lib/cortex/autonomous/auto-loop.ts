/**
 * CORTEX Auto Loop — 永久自律ループ
 *
 * Claude Code Channelsから呼ばれる。
 * Supabaseをチェックし、保留投稿があれば改善+投稿、なければバズ収集+投稿候補生成。
 * 結果をJSON出力。Claude Codeが読んでDiscordに報告。
 *
 * Usage: npx tsx lib/cortex/autonomous/auto-loop.ts
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase credentials not found')
  return createClient(url, key)
}

interface LoopResult {
  timestamp: string
  action_taken: string
  details: Record<string, unknown>
  next_action: string
  discord_message: string
}

async function main(): Promise<void> {
  const supabase = getSupabase()
  const result: LoopResult = {
    timestamp: new Date().toISOString(),
    action_taken: 'none',
    details: {},
    next_action: '',
    discord_message: '',
  }

  // Step 1: Check for pending posts that need review
  const { data: pendingPosts } = await supabase
    .from('cortex_pending_posts')
    .select('id, post_text, platform, pattern_used, status, created_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(3)

  if (pendingPosts && pendingPosts.length > 0) {
    result.action_taken = 'review_pending_posts'
    result.details = {
      count: pendingPosts.length,
      posts: pendingPosts.map(p => ({
        id: p.id,
        text_preview: p.post_text?.slice(0, 80),
        platform: p.platform,
        pattern: p.pattern_used,
      })),
    }
    result.next_action = 'approve_or_improve'
    result.discord_message = `📋 保留投稿 ${pendingPosts.length}件\n\n` +
      pendingPosts.map((p, i) =>
        `${i + 1}. [${p.platform}] ${p.post_text?.slice(0, 60)}...\n   Pattern: ${p.pattern_used || 'none'} | ID: ${p.id.slice(0, 8)}`
      ).join('\n\n') +
      '\n\n改善して投稿しますか？「投稿実行」で実行します。'

    console.log(JSON.stringify(result, null, 2))
    return
  }

  // Step 2: Check recent post performance (learning) — multi-platform
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: recentPosts } = await supabase
    .from('x_post_analytics')
    .select('post_text, likes, retweets, replies, impressions, engagement_rate, pattern_used, posted_at')
    .gte('posted_at', since7d)
    .order('posted_at', { ascending: false })

  const { data: linkedinPosts } = await supabase
    .from('linkedin_post_analytics')
    .select('post_text, likes, comments, reposts, impressions, engagement_rate, pattern_used, posted_at')
    .gte('posted_at', since7d)
    .order('posted_at', { ascending: false })

  const { data: threadsPosts } = await supabase
    .from('threads_post_analytics')
    .select('post_text, likes, replies, reposts, views, engagement_rate, pattern_used, posted_at')
    .gte('posted_at', since7d)
    .order('posted_at', { ascending: false })

  const postCount = recentPosts?.length || 0
  const linkedinPostCount = linkedinPosts?.length || 0
  const threadsPostCount = threadsPosts?.length || 0
  const avgER = postCount > 0
    ? recentPosts!.reduce((s, p) => s + (p.engagement_rate || 0), 0) / postCount
    : 0

  // Step 3: Check buzz posts for new content opportunities
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { data: buzzPosts } = await supabase
    .from('buzz_posts')
    .select('post_text, author_handle, buzz_score, platform')
    .gte('collected_at', since24h)
    .order('buzz_score', { ascending: false })
    .limit(5)

  const buzzCount = buzzPosts?.length || 0

  // Step 4: Check pattern performance trends
  const { data: patterns } = await supabase
    .from('pattern_performance')
    .select('pattern_id, successes, failures, avg_engagement')
    .eq('platform', 'x')
    .order('avg_engagement', { ascending: false })
    .limit(5)

  // Step 5: Check temporal patterns for optimal posting time
  const now = new Date()
  const jstHour = (now.getUTCHours() + 9) % 24
  const jstDay = new Date(now.getTime() + 9 * 60 * 60 * 1000).getDay()

  const { data: currentSlot } = await supabase
    .from('cortex_temporal_patterns')
    .select('recommendation_score, avg_engagement_rate, sample_count')
    .eq('platform', 'x')
    .eq('day_of_week', jstDay)
    .eq('hour_jst', jstHour)
    .limit(1)

  const isGoodTime = currentSlot?.[0]?.recommendation_score > 0.5
  const days = ['日', '月', '火', '水', '木', '金', '土']

  // Step 6: Build status report
  result.action_taken = 'status_report'
  result.details = {
    posts_7d: postCount,
    avg_er: Math.round(avgER * 10000) / 100,
    buzz_24h: buzzCount,
    top_pattern: patterns?.[0]?.pattern_id || 'N/A',
    current_time_quality: isGoodTime ? 'good' : 'suboptimal',
  }

  // Determine next action
  if (buzzCount > 0 && isGoodTime) {
    result.next_action = 'generate_post_from_buzz'
    result.discord_message = `🔄 CORTEX自律ループ\n\n` +
      `■ 投稿成績 (7日): ${postCount}件 / 平均ER ${(avgER * 100).toFixed(2)}%\n` +
      `■ バズ検出 (24h): ${buzzCount}件\n` +
      `■ 現在の投稿適性: ${isGoodTime ? '✅ 良好' : '⚠️ 非推奨'} (${days[jstDay]}曜 ${jstHour}時)\n` +
      `■ 推奨パターン: ${patterns?.[0]?.pattern_id || 'N/A'}\n\n` +
      `🔥 バズネタあり + 投稿好適時間帯。投稿候補を生成しますか？`
  } else if (buzzCount > 0) {
    result.next_action = 'save_for_later'
    result.discord_message = `🔄 CORTEX自律ループ\n\n` +
      `■ 投稿成績 (7日): ${postCount}件 / 平均ER ${(avgER * 100).toFixed(2)}%\n` +
      `■ バズ検出 (24h): ${buzzCount}件\n` +
      `■ 現在の投稿適性: ⚠️ 非推奨 (${days[jstDay]}曜 ${jstHour}時)\n\n` +
      `バズネタはありますが、投稿に不適な時間帯です。次の好適時間帯まで待ちます。`
  } else {
    result.next_action = 'wait'
    result.discord_message = `🔄 CORTEX自律ループ\n\n` +
      `■ 投稿成績 (7日): ${postCount}件 / 平均ER ${(avgER * 100).toFixed(2)}%\n` +
      `■ バズ検出 (24h): なし\n` +
      `■ パターン状況: ${patterns?.length || 0}パターン稼働中\n\n` +
      `新しいバズネタなし。次回チェックまで待機します。`
  }

  // Step 7: Check LINE Harness
  const { count: friendCount } = await supabase
    .from('cortex_line_friends')
    .select('id', { count: 'exact', head: true })

  // Step 8: Check blog status
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  const { data: recentBlog } = await supabase
    .from('posts')
    .select('title, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(1)

  const lastBlogDate = recentBlog?.[0]?.published_at
  const blogDaysAgo = lastBlogDate ? Math.round((Date.now() - new Date(lastBlogDate).getTime()) / (24 * 60 * 60 * 1000)) : 999
  const blogReady = blogDaysAgo >= 2

  const { data: blogDrafts } = await supabase
    .from('cortex_pending_posts')
    .select('id, status')
    .eq('platform', 'blog')
    .in('status', ['draft', 'reviewed'])

  result.discord_message += `\n\n■ LinkedIn (7日): ${linkedinPostCount}件`
  result.discord_message += `\n■ Threads (7日): ${threadsPostCount}件`
  result.discord_message += `\n■ ブログ: ${blogDaysAgo === 999 ? '公開記事なし' : `直近${blogDaysAgo}日前`} ${blogReady ? '📝 新規記事生成可能' : ''} ${(blogDrafts?.length ?? 0) > 0 ? `| ドラフト${blogDrafts!.length}件` : ''}`
  result.discord_message += `\n■ LINE Harness: 友だち${friendCount || 0}人`

  console.log(JSON.stringify(result, null, 2))
}

main().catch(err => {
  console.error('CORTEX loop error:', err)
  process.exit(1)
})
