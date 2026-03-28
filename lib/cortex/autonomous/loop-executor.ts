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

async function handlePostReviewAnalyze(): Promise<Partial<LoopExecutorResult>> {
  const supabase = getSupabase()

  const { data: pending } = await supabase
    .from('cortex_pending_posts')
    .select('id, post_text, platform, pattern_used, status, created_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(5)

  if (!pending || pending.length === 0) {
    return {
      response_text: '✅ 保留投稿なし。次のアジェンダに進みます。',
      actions_taken: ['保留投稿チェック'],
      next_action: 'skip_to_next_topic',
    }
  }

  // Check for duplicates against recent posts
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data: recentPosts } = await supabase
    .from('x_post_analytics')
    .select('post_text, tweet_id')
    .gte('created_at', thirtyDaysAgo)

  const existingTexts = recentPosts ?? []

  const lines = ['📋 保留投稿レビュー', '']
  const reviewResults: { id: string; text: string; isDuplicate: boolean; overlap: number }[] = []

  for (const post of pending) {
    let maxOverlap = 0
    let duplicateOf: string | undefined
    for (const existing of existingTexts) {
      if (!existing.post_text || !post.post_text) continue
      const overlap = bigramOverlap(post.post_text, existing.post_text)
      if (overlap > maxOverlap) {
        maxOverlap = overlap
        if (overlap >= 0.35) duplicateOf = existing.tweet_id
      }
    }

    const isDup = maxOverlap >= 0.35
    reviewResults.push({ id: post.id, text: post.post_text?.slice(0, 60) ?? '', isDuplicate: isDup, overlap: maxOverlap })

    const status = isDup ? '❌ 重複' : '✅ OK'
    lines.push(`${status} [${post.platform}] 「${post.post_text?.slice(0, 60)}...」`)
    lines.push(`  パターン: ${post.pattern_used ?? 'none'} | 類似度: ${(maxOverlap * 100).toFixed(0)}%${duplicateOf ? ` (tweet: ${duplicateOf})` : ''}`)
    lines.push('')
  }

  const approved = reviewResults.filter(r => !r.isDuplicate)
  const rejected = reviewResults.filter(r => r.isDuplicate)

  // Reject duplicate posts in DB
  for (const rej of rejected) {
    await supabase
      .from('cortex_pending_posts')
      .update({ status: 'rejected' })
      .eq('id', rej.id)
  }

  if (rejected.length > 0) {
    lines.push(`🗑️ ${rejected.length}件の重複投稿を拒否しました。`)
  }
  if (approved.length > 0) {
    lines.push(`🚀 ${approved.length}件が自動投稿可能。ゲートチェックに進みます。`)
  }

  return {
    response_text: lines.join('\n'),
    actions_taken: ['保留投稿取得', '重複チェック (30日分)', `${rejected.length}件拒否`],
    next_action: approved.length > 0 ? 'execute_auto_post' : 'skip_to_next_topic',
  }
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
// Router
// ============================================================

type Handler = () => Promise<Partial<LoopExecutorResult>>

const handlers: Record<string, Handler> = {
  'performance:analyze': handlePerformanceAnalyze,
  'buzz_post:analyze': handleBuzzPostAnalyze,
  'post_review:analyze': handlePostReviewAnalyze,
  'pattern_optimize:analyze': handlePatternOptimizeAnalyze,
  'strategy:analyze': handleStrategyAnalyze,
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

main().catch(err => {
  console.error('Loop executor error:', err)
  process.exit(1)
})
