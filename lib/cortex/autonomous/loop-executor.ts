/**
 * CORTEX Loop Executor — AI-B (Claude Code) 側のループ実行エントリポイント
 *
 * AI-A (CORTEX-AI Bot) からの [CORTEX-LOOP] メッセージを受けて、
 * topic + phase に応じたスクリプトを実行し、結果をJSON出力する。
 * Claude Code が出力をパースして Discord に返信する。
 *
 * Usage: npx tsx lib/cortex/autonomous/loop-executor.ts --topic=buzz_post --phase=analyze --context="..."
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import type { LoopAgendaTopic, LoopAgendaPhase, LoopExecutorResult } from '../types'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase credentials not found in .env.local')
  return createClient(url, key)
}

// ============================================================
// Argument Parsing
// ============================================================

function parseArgs(): { topic: LoopAgendaTopic; phase: LoopAgendaPhase; turnNumber: number; context: string } {
  const args = process.argv.slice(2)
  const get = (key: string, fallback: string): string => {
    const arg = args.find(a => a.startsWith(`--${key}=`))
    return arg ? arg.split('=').slice(1).join('=') : fallback
  }
  return {
    topic: get('topic', 'performance') as LoopAgendaTopic,
    phase: get('phase', 'analyze') as LoopAgendaPhase,
    turnNumber: parseInt(get('turn', '0'), 10),
    context: get('context', ''),
  }
}

// ============================================================
// Handlers by Topic + Phase
// ============================================================

async function handlePerformanceAnalyze(): Promise<Partial<LoopExecutorResult>> {
  const supabase = getSupabase()
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: posts } = await supabase
    .from('x_post_analytics')
    .select('post_text, likes, retweets, replies, impressions, engagement_rate, pattern_used, posted_at')
    .gte('posted_at', since7d)
    .order('engagement_rate', { ascending: false })

  const { data: patterns } = await supabase
    .from('pattern_performance')
    .select('pattern_id, successes, failures, avg_engagement')
    .eq('platform', 'x')
    .order('avg_engagement', { ascending: false })
    .limit(5)

  const postCount = posts?.length ?? 0
  const avgER = postCount > 0
    ? posts!.reduce((s, p) => s + (p.engagement_rate ?? 0), 0) / postCount
    : 0

  const best = posts?.[0]
  const worst = posts?.[postCount - 1]

  const lines = [
    '📊 パフォーマンス分析レポート',
    '',
    `■ 直近7日の投稿: ${postCount}件`,
    `■ 平均ER: ${(avgER * 100).toFixed(2)}%`,
  ]

  if (best) {
    lines.push(`■ ベスト: 「${best.post_text?.slice(0, 60)}...」 ER: ${((best.engagement_rate ?? 0) * 100).toFixed(2)}%`)
  }
  if (worst && postCount > 1) {
    lines.push(`■ ワースト: 「${worst.post_text?.slice(0, 60)}...」 ER: ${((worst.engagement_rate ?? 0) * 100).toFixed(2)}%`)
  }

  if (patterns && patterns.length > 0) {
    lines.push('', '■ パターン成績 (Top 5):')
    for (const p of patterns) {
      const total = p.successes + p.failures
      const rate = total > 0 ? (p.successes / total * 100).toFixed(0) : 'N/A'
      lines.push(`  ${p.pattern_id}: 成功率${rate}% (${total}回使用) 平均ER: ${(p.avg_engagement ?? 0).toFixed(4)}`)
    }
  }

  // Check hook-template divergence
  const hookTemplatePath = path.resolve(__dirname, '../../viral-hooks/hook-templates.ts')
  const hookScores: Record<string, number> = {}
  try {
    const content = fs.readFileSync(hookTemplatePath, 'utf-8')
    const matches = Array.from(content.matchAll(/id:\s*'([^']+)'[\s\S]*?effectiveness_score:\s*([\d.]+)/g))
    for (const m of matches) hookScores[m[1]] = parseFloat(m[2])
  } catch { /* skip */ }

  const divergences: string[] = []
  if (patterns) {
    for (const p of patterns) {
      const total = p.successes + p.failures
      if (total < 5) continue
      const actual = p.successes / total
      const expected = hookScores[p.pattern_id]
      if (expected !== undefined && Math.abs(actual - expected) > 0.15) {
        divergences.push(`${p.pattern_id}: 実績${(actual * 100).toFixed(0)}% vs テンプレ${(expected * 100).toFixed(0)}%`)
      }
    }
  }

  if (divergences.length > 0) {
    lines.push('', '⚠️ パターン乖離検出:')
    for (const d of divergences) lines.push(`  ${d}`)
  }

  return {
    response_text: lines.join('\n'),
    actions_taken: ['7日間の投稿分析', 'パターン成績確認', 'hook-template乖離チェック'],
    next_action: divergences.length > 0 ? 'pattern_optimize' : 'check_buzz',
  }
}

async function handleBuzzPostAnalyze(): Promise<Partial<LoopExecutorResult>> {
  const supabase = getSupabase()
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data: buzzPosts } = await supabase
    .from('buzz_posts')
    .select('post_text, author_handle, buzz_score, platform')
    .gte('collected_at', since24h)
    .order('buzz_score', { ascending: false })
    .limit(5)

  const now = new Date()
  const jstHour = (now.getUTCHours() + 9) % 24
  const jstDay = new Date(now.getTime() + 9 * 60 * 60 * 1000).getDay()
  const days = ['日', '月', '火', '水', '木', '金', '土']

  const { data: currentSlot } = await supabase
    .from('cortex_temporal_patterns')
    .select('recommendation_score, avg_engagement_rate')
    .eq('platform', 'x')
    .eq('day_of_week', jstDay)
    .eq('hour_jst', jstHour)
    .limit(1)

  const timingScore = currentSlot?.[0]?.recommendation_score ?? 0.5
  const isGoodTime = timingScore > 0.5

  const { data: topPatterns } = await supabase
    .from('pattern_performance')
    .select('pattern_id, avg_engagement')
    .eq('platform', 'x')
    .order('avg_engagement', { ascending: false })
    .limit(3)

  const lines = [
    '🔍 バズ分析レポート',
    '',
    `■ 24h以内のバズ: ${buzzPosts?.length ?? 0}件`,
    `■ 投稿適性: ${isGoodTime ? '✅ 良好' : '⚠️ 非推奨'} (${days[jstDay]}曜 ${jstHour}時 / スコア: ${timingScore.toFixed(2)})`,
    `■ 推奨パターン: ${topPatterns?.map(p => p.pattern_id).join(', ') ?? 'N/A'}`,
  ]

  if (buzzPosts && buzzPosts.length > 0) {
    lines.push('', '■ トップバズ:')
    for (const b of buzzPosts.slice(0, 3)) {
      lines.push(`  @${b.author_handle}: 「${b.post_text?.slice(0, 60)}...」 (スコア: ${b.buzz_score?.toFixed(2)})`)
    }
  }

  return {
    response_text: lines.join('\n'),
    actions_taken: ['バズ収集確認', 'タイミングチェック', 'パターン推奨'],
    next_action: (buzzPosts?.length ?? 0) > 0 && isGoodTime ? 'generate_post' : 'wait',
  }
}

// ============================================================
// Shared: Platform-aware review handler
// ============================================================

async function handlePlatformReviewAnalyze(
  platformFilter: string,
  analyticsTable: string,
  idColumn: string,
): Promise<Partial<LoopExecutorResult>> {
  const supabase = getSupabase()

  const { data: pending } = await supabase
    .from('cortex_pending_posts')
    .select('id, post_text, platform, pattern_used, status, created_at')
    .eq('status', 'pending')
    .eq('platform', platformFilter)
    .order('created_at', { ascending: false })
    .limit(5)

  if (!pending || pending.length === 0) {
    return {
      response_text: `✅ ${platformFilter}保留投稿なし。次のアジェンダに進みます。`,
      actions_taken: [`${platformFilter}保留投稿チェック`],
      next_action: 'skip_to_next_topic',
    }
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data: recentPosts } = await supabase
    .from(analyticsTable)
    .select('*')
    .gte('created_at', thirtyDaysAgo)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existingTexts = (recentPosts ?? []).map((p: any) => ({
    post_text: p.post_text as string | null,
    post_id: p[idColumn] as string | null,
  }))

  const lines = [`📋 ${platformFilter}保留投稿レビュー`, '']
  const reviewResults: { id: string; text: string; isDuplicate: boolean; overlap: number }[] = []

  for (const post of pending) {
    let maxOverlap = 0
    let duplicateOf: string | undefined
    for (const existing of existingTexts) {
      if (!existing.post_text || !post.post_text) continue
      const overlap = bigramOverlap(post.post_text, existing.post_text)
      if (overlap > maxOverlap) {
        maxOverlap = overlap
        if (overlap >= 0.35) duplicateOf = existing.post_id ?? undefined
      }
    }

    const isDup = maxOverlap >= 0.35
    reviewResults.push({ id: post.id, text: post.post_text?.slice(0, 60) ?? '', isDuplicate: isDup, overlap: maxOverlap })

    const status = isDup ? '❌ 重複' : '✅ OK'
    lines.push(`${status} [${post.platform}] 「${post.post_text?.slice(0, 60)}...」`)
    lines.push(`  パターン: ${post.pattern_used ?? 'none'} | 類似度: ${(maxOverlap * 100).toFixed(0)}%${duplicateOf ? ` (id: ${duplicateOf})` : ''}`)
    lines.push('')
  }

  const approved = reviewResults.filter(r => !r.isDuplicate)
  const rejected = reviewResults.filter(r => r.isDuplicate)

  for (const rej of rejected) {
    await supabase
      .from('cortex_pending_posts')
      .update({ status: 'rejected' })
      .eq('id', rej.id)
  }

  // Check for stuck 'posting' state
  const { data: stuckPosts } = await supabase
    .from('cortex_pending_posts')
    .select('id, created_at')
    .eq('status', 'posting')
    .eq('platform', platformFilter)
  if (stuckPosts && stuckPosts.length > 0) {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    for (const sp of stuckPosts) {
      if (sp.created_at < fiveMinAgo) {
        await supabase
          .from('cortex_pending_posts')
          .update({ status: 'pending' })
          .eq('id', sp.id)
          .eq('status', 'posting')
      }
    }
  }

  if (rejected.length > 0) {
    lines.push(`🗑️ ${rejected.length}件の重複投稿を拒否しました。`)
  }
  if (approved.length > 0) {
    lines.push(`🚀 ${approved.length}件が自動投稿可能。ゲートチェックに進みます。`)
  }

  return {
    response_text: lines.join('\n'),
    actions_taken: [`${platformFilter}保留投稿取得`, '重複チェック (30日分)', `${rejected.length}件拒否`],
    next_action: approved.length > 0 ? 'execute_auto_post' : 'skip_to_next_topic',
  }
}

async function handlePostReviewAnalyze(): Promise<Partial<LoopExecutorResult>> {
  return handlePlatformReviewAnalyze('x', 'x_post_analytics', 'tweet_id')
}

async function handleLinkedInReviewAnalyze(): Promise<Partial<LoopExecutorResult>> {
  return handlePlatformReviewAnalyze('linkedin', 'linkedin_post_analytics', 'linkedin_post_id')
}

async function handleThreadsReviewAnalyze(): Promise<Partial<LoopExecutorResult>> {
  return handlePlatformReviewAnalyze('threads', 'threads_post_analytics', 'threads_media_id')
}

// ============================================================
// Platform-specific post analysis handlers
// ============================================================

async function handlePlatformPostAnalyze(
  platform: string,
  analyticsTable: string,
): Promise<Partial<LoopExecutorResult>> {
  const supabase = getSupabase()
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: posts } = await supabase
    .from(analyticsTable)
    .select('*')
    .gte('posted_at', since7d)
    .order('engagement_rate', { ascending: false })

  const { data: patterns } = await supabase
    .from('pattern_performance')
    .select('pattern_id, successes, failures, avg_engagement')
    .eq('platform', platform)
    .order('avg_engagement', { ascending: false })
    .limit(5)

  const postCount = posts?.length ?? 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const avgER = postCount > 0
    ? posts!.reduce((s: number, p: any) => s + (p.engagement_rate ?? 0), 0) / postCount
    : 0

  const lines = [
    `📊 ${platform}パフォーマンス分析`,
    '',
    `■ 直近7日の投稿: ${postCount}件`,
    `■ 平均ER: ${(avgER * 100).toFixed(2)}%`,
  ]

  if (patterns && patterns.length > 0) {
    lines.push('', `■ ${platform}パターン成績 (Top 5):`)
    for (const p of patterns) {
      const total = p.successes + p.failures
      const rate = total > 0 ? (p.successes / total * 100).toFixed(0) : 'N/A'
      lines.push(`  ${p.pattern_id}: 成功率${rate}% (${total}回使用)`)
    }
  }

  return {
    response_text: lines.join('\n'),
    actions_taken: [`${platform} 7日間投稿分析`, `${platform}パターン成績確認`],
    next_action: 'skip_to_next_topic',
  }
}

async function handleLinkedInPostAnalyze(): Promise<Partial<LoopExecutorResult>> {
  return handlePlatformPostAnalyze('linkedin', 'linkedin_post_analytics')
}

async function handleThreadsPostAnalyze(): Promise<Partial<LoopExecutorResult>> {
  return handlePlatformPostAnalyze('threads', 'threads_post_analytics')
}

async function handlePatternOptimizeAnalyze(): Promise<Partial<LoopExecutorResult>> {
  const supabase = getSupabase()
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: patterns } = await supabase
    .from('pattern_performance')
    .select('pattern_id, successes, failures, avg_engagement')
    .eq('platform', 'x')
    .order('total_uses', { ascending: false })

  const hookTemplatePath = path.resolve(__dirname, '../../viral-hooks/hook-templates.ts')
  const hookScores: Record<string, number> = {}
  try {
    const content = fs.readFileSync(hookTemplatePath, 'utf-8')
    const matches = Array.from(content.matchAll(/id:\s*'([^']+)'[\s\S]*?effectiveness_score:\s*([\d.]+)/g))
    for (const m of matches) hookScores[m[1]] = parseFloat(m[2])
  } catch { /* skip */ }

  const { data: viralNew } = await supabase
    .from('cortex_viral_analysis')
    .select('hook_type, primary_buzz_factor, replicability_score')
    .gte('analyzed_at', since7d)
    .gte('replicability_score', 0.7)
    .order('replicability_score', { ascending: false })
    .limit(5)

  const lines = ['🔧 パターン最適化分析', '']
  const improvements: string[] = []

  if (patterns) {
    for (const p of patterns) {
      const total = p.successes + p.failures
      if (total < 5) continue
      const actual = p.successes / total
      const expected = hookScores[p.pattern_id]
      if (expected !== undefined && Math.abs(actual - expected) > 0.15) {
        improvements.push(`${p.pattern_id}: effectiveness_score ${expected} → ${actual.toFixed(2)}`)
        lines.push(`⚠️ ${p.pattern_id}: テンプレ${(expected * 100).toFixed(0)}% vs 実績${(actual * 100).toFixed(0)}% (${total}回使用)`)
      }
    }
  }

  if (viralNew && viralNew.length > 0) {
    lines.push('', '✨ 新パターン候補:')
    for (const v of viralNew) {
      if (v.hook_type && !hookScores[v.hook_type]) {
        improvements.push(`新規: ${v.hook_type} (再現性: ${((v.replicability_score ?? 0) * 100).toFixed(0)}%)`)
        lines.push(`  ${v.hook_type}: 再現性${((v.replicability_score ?? 0) * 100).toFixed(0)}% (要因: ${v.primary_buzz_factor})`)
      }
    }
  }

  if (improvements.length === 0) {
    lines.push('✅ パターンスコアは実績と整合。改善不要。')
  } else {
    lines.push('', `📝 ${improvements.length}件の改善提案。hook-templates.tsの更新が必要です。`)
  }

  return {
    response_text: lines.join('\n'),
    actions_taken: ['パターン実績分析', 'hook-template乖離チェック', 'バイラル分析から新パターン抽出'],
    next_action: improvements.length > 0 ? 'create_improvement_pr' : 'skip_to_next_topic',
  }
}

async function handleStrategyAnalyze(): Promise<Partial<LoopExecutorResult>> {
  const supabase = getSupabase()
  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const { data: posts } = await supabase
    .from('x_post_analytics')
    .select('engagement_rate, pattern_used, posted_at')
    .gte('posted_at', since30d)

  const { data: conversations } = await supabase
    .from('cortex_conversation_log')
    .select('conversation_type, key_decisions, status')
    .gte('created_at', since30d)
    .eq('status', 'completed')

  const { count: friendCount } = await supabase
    .from('cortex_line_friends')
    .select('id', { count: 'exact', head: true })

  const postCount = posts?.length ?? 0
  const avgER = postCount > 0
    ? posts!.reduce((s, p) => s + (p.engagement_rate ?? 0), 0) / postCount
    : 0

  const lines = [
    '🎯 戦略レビュー (30日総括)',
    '',
    `■ 総投稿数: ${postCount}件`,
    `■ 平均ER: ${(avgER * 100).toFixed(2)}%`,
    `■ 完了した改善: ${conversations?.length ?? 0}件`,
    `■ LINE友だち: ${friendCount ?? 0}人`,
    '',
    '■ 次サイクルの方針:',
    '  - ERが低いパターンの使用頻度を下げる',
    '  - 高ER投稿のパターンを重点的に使用',
    '  - 投稿時間帯の最適化継続',
  ]

  return {
    response_text: lines.join('\n'),
    actions_taken: ['30日間総括', 'conversation_log振り返り', 'LINE友だち数確認'],
    next_action: 'start_new_cycle',
  }
}

// ============================================================
// Bigram overlap (duplicated from pre-post-reviewer for standalone use)
// ============================================================

function bigramOverlap(a: string, b: string): number {
  const bg = (s: string) => {
    const grams = new Set<string>()
    const lower = s.replace(/\s+/g, ' ').trim().toLowerCase()
    for (let i = 0; i < lower.length - 1; i++) grams.add(lower.slice(i, i + 2))
    return grams
  }
  const setA = bg(a), setB = bg(b)
  let intersection = 0
  for (const g of Array.from(setA)) if (setB.has(g)) intersection++
  const union = new Set([...Array.from(setA), ...Array.from(setB)]).size
  return union === 0 ? 0 : intersection / union
}

// ============================================================
// Topic completion tracking — prevents repeated execution of the same topic
// ============================================================

const TOPIC_ROTATION: readonly LoopAgendaTopic[] = ['post_review', 'linkedin_review', 'threads_review', 'buzz_post', 'linkedin_post', 'threads_post', 'blog_research', 'performance', 'pattern_optimize', 'strategy']

async function getCompletedTopicsToday(supabase: ReturnType<typeof getSupabase>): Promise<Set<string>> {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { data } = await supabase
    .from('cortex_loop_state')
    .select('agenda_topic, updated_at')
    .gte('updated_at', todayStart.toISOString())

  if (!data || data.length === 0) return new Set()

  // Extract completed topics from the most recent state row's context_summary
  const { data: stateRow } = await supabase
    .from('cortex_loop_state')
    .select('context_summary')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  const completedRaw = stateRow?.context_summary ?? ''
  try {
    const parsed = JSON.parse(completedRaw)
    if (parsed.completed_topics_today && Array.isArray(parsed.completed_topics_today)) {
      return new Set(parsed.completed_topics_today as string[])
    }
  } catch { /* not JSON yet, fresh start */ }
  return new Set()
}

async function markTopicCompleted(supabase: ReturnType<typeof getSupabase>, topic: string, turnNumber: number): Promise<void> {
  const completed = await getCompletedTopicsToday(supabase)
  completed.add(topic)

  const contextData = JSON.stringify({
    completed_topics_today: Array.from(completed),
    last_completed_turn: turnNumber,
    last_completed_at: new Date().toISOString(),
  })

  // Upsert the state row
  const { data: existing } = await supabase
    .from('cortex_loop_state')
    .select('id')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  if (existing) {
    await supabase
      .from('cortex_loop_state')
      .update({
        agenda_topic: topic,
        turn_number: turnNumber,
        context_summary: contextData,
        last_turn_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
  }
}

function suggestNextTopic(completedTopics: Set<string>): LoopAgendaTopic | null {
  for (const t of TOPIC_ROTATION) {
    if (!completedTopics.has(t)) return t
  }
  return null // All topics completed
}

// ============================================================
// Dedup guard for scheduled/auto post execution
// ============================================================

async function acquirePendingPostForExecution(
  supabase: ReturnType<typeof getSupabase>,
  postId: string,
): Promise<boolean> {
  // Atomic status check: only transition pending → posting
  // This prevents double-posting if multiple processes try to execute the same post
  const { data, error } = await supabase
    .from('cortex_pending_posts')
    .update({ status: 'posting' })
    .eq('id', postId)
    .eq('status', 'pending') // Only if still pending
    .select('id')

  if (error || !data || data.length === 0) return false
  return true
}

async function releasePendingPost(
  supabase: ReturnType<typeof getSupabase>,
  postId: string,
  status: 'posted' | 'pending',
): Promise<void> {
  await supabase
    .from('cortex_pending_posts')
    .update({ status })
    .eq('id', postId)
}

// ============================================================
// Router
// ============================================================

type Handler = () => Promise<Partial<LoopExecutorResult>>

const handlers: Record<string, Handler> = {
  'performance:analyze': handlePerformanceAnalyze,
  'buzz_post:analyze': handleBuzzPostAnalyze,
  'post_review:analyze': handlePostReviewAnalyze,
  'linkedin_review:analyze': handleLinkedInReviewAnalyze,
  'threads_review:analyze': handleThreadsReviewAnalyze,
  'linkedin_post:analyze': handleLinkedInPostAnalyze,
  'threads_post:analyze': handleThreadsPostAnalyze,
  'pattern_optimize:analyze': handlePatternOptimizeAnalyze,
  'strategy:analyze': handleStrategyAnalyze,
  'blog_research:analyze': handleBlogResearchAnalyze,
  'blog_draft:execute': handleBlogDraftExecute,
  'blog_review:analyze': handleBlogReviewAnalyze,
  'blog_publish:execute': handleBlogPublishExecute,
}

async function main(): Promise<void> {
  const { topic, phase, turnNumber, context } = parseArgs()
  const key = `${topic}:${phase}`
  const handler = handlers[key]

  // Footer map: what AI-A should do next based on the result
  const footerMap: Record<string, string> = {
    'check_buzz': 'バズネタの有無を確認し、次のアジェンダを選択してください',
    'pattern_optimize': 'パターン乖離のあるhook-templates.tsの更新を検討してください',
    'generate_post': 'バズネタから投稿案を生成し、cortex_pending_postsに保存してください',
    'execute_auto_post': '投稿のゲートチェック結果を確認し、投稿実行の判断をしてください',
    'skip_to_next_topic': '次のアジェンダトピックに進んでください',
    'create_improvement_pr': 'hook-templates.tsの改善内容を確認し、次のアクションを決定してください',
    'start_new_cycle': '新しいサイクルを開始し、優先度の高いトピックを選択してください',
    'wait': '次の好適時間帯まで待機し、データの蓄積を確認してください',
    'reject': '重複投稿を削除し、別のアジェンダに進んでください',
    'manual_handling': 'このフェーズの処理結果を確認し、次のアクションを決定してください',
    'topic_already_done': '※このトピックは本日処理済みです。未処理のトピックに切り替えてください',
    'blog_select_topic': 'トピック候補から最適な1つを選定し、blog_draft:executeを開始してください',
    'blog_write_draft': '第一稿を執筆してください。Brave Searchで一次情報を取得し、RAGデータを活用してください',
    'blog_critique': '第一稿を批評してください。ファクトチェック、深さ、人間性を評価してください',
    'blog_revise': '批評に基づいて推敲してください。修正が完了したらblog_publish:executeを開始してください',
    'blog_publish_now': '記事をpostsテーブルに保存し、/api/blog-post-processで処理してください',
    'blog_skip': '直近2日以内に記事を公開済みのため、次のトピックに進んでください',
  }

  // Check if this topic was already completed today
  const supabase = getSupabase()
  const completedTopics = await getCompletedTopicsToday(supabase)

  if (completedTopics.has(topic)) {
    const nextTopic = suggestNextTopic(completedTopics)
    const suggestion = nextTopic
      ? `推奨トピック: ${nextTopic}`
      : '全トピック処理済み。次サイクルまで待機してください'

    const result: LoopExecutorResult = {
      topic,
      phase,
      turn_number: turnNumber,
      response_text: `⏭️ トピック「${topic}」は本日処理済みです（スキップ）。\n${suggestion}`,
      actions_taken: ['トピック重複チェック', 'スキップ'],
      next_action: nextTopic ? 'skip_to_next_topic' : 'wait',
      posts_published: 0,
      footer: `[NEXT: ai_a | Action: ${nextTopic ? `トピックを「${nextTopic}」に切り替えてください` : '全トピック完了。次サイクルまで待機してください'}]`,
    }
    console.log(JSON.stringify(result, null, 2))
    return
  }

  if (!handler) {
    const result: LoopExecutorResult = {
      topic,
      phase,
      turn_number: turnNumber,
      response_text: `⚠️ ハンドラ未定義: ${key}。このフェーズはClaude Codeが直接処理してください。\nコンテキスト: ${context.slice(0, 200)}`,
      actions_taken: [],
      next_action: 'manual_handling',
      posts_published: 0,
      footer: `[NEXT: ai_a | Action: ${footerMap['manual_handling']}]`,
    }
    console.log(JSON.stringify(result, null, 2))
    return
  }

  const partial = await handler()
  const nextAction = partial.next_action ?? 'wait'

  // Mark this topic as completed for today
  await markTopicCompleted(supabase, topic, turnNumber)

  const result: LoopExecutorResult = {
    topic,
    phase,
    turn_number: turnNumber,
    response_text: partial.response_text ?? '',
    actions_taken: partial.actions_taken ?? [],
    next_action: nextAction,
    posts_published: 0,
    footer: `[NEXT: ai_a | Action: ${footerMap[nextAction] ?? footerMap['wait']}]`,
  }

  console.log(JSON.stringify(result, null, 2))
}

// Export dedup guard for use by Claude Code when executing scheduled posts
export { acquirePendingPostForExecution, releasePendingPost, bigramOverlap }

main().catch(err => {
  console.error('Loop executor error:', err)
  process.exit(1)
})
