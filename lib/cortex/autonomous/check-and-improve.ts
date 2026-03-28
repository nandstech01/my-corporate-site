/**
 * CORTEX Autonomous Check & Improve
 *
 * Called by Claude Code Channels when user sends "CORTEXチェック" on Discord.
 * Checks Supabase for pending tasks, analyzes post performance,
 * and outputs improvement recommendations as JSON.
 *
 * Usage: npx tsx lib/cortex/autonomous/check-and-improve.ts
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase credentials not found in .env.local')
  return createClient(url, key)
}

interface AnalysisResult {
  timestamp: string
  pending_tasks: number
  post_performance: {
    total_posts_7d: number
    avg_engagement_rate: number
    best_post: { text: string; likes: number; er: number } | null
    worst_post: { text: string; likes: number; er: number } | null
  }
  pattern_analysis: {
    pattern_id: string
    successes: number
    failures: number
    success_rate: number
    avg_engagement: number
    hook_score: number | null
    divergence: number // difference between DB success rate and hook effectiveness_score
  }[]
  improvements_needed: {
    type: 'score_update' | 'new_pattern' | 'timing_change'
    description: string
    file: string
    current_value: string
    proposed_value: string
  }[]
  temporal_insights: {
    best_slot: string
    worst_slot: string
  }
  summary: string
}

async function main(): Promise<void> {
  const supabase = getSupabase()
  const result: AnalysisResult = {
    timestamp: new Date().toISOString(),
    pending_tasks: 0,
    post_performance: { total_posts_7d: 0, avg_engagement_rate: 0, best_post: null, worst_post: null },
    pattern_analysis: [],
    improvements_needed: [],
    temporal_insights: { best_slot: 'N/A', worst_slot: 'N/A' },
    summary: '',
  }

  // 1. Check pending tasks
  const { data: pendingTasks } = await supabase
    .from('cortex_conversation_log')
    .select('id, summary, priority, action_items')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(10)

  result.pending_tasks = pendingTasks?.length || 0

  // 2. Post performance (last 7 days)
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: xPosts } = await supabase
    .from('x_post_analytics')
    .select('post_text, likes, retweets, replies, impressions, engagement_rate, pattern_used, posted_at')
    .gte('posted_at', since)
    .order('posted_at', { ascending: false })

  if (xPosts && xPosts.length > 0) {
    result.post_performance.total_posts_7d = xPosts.length
    const totalER = xPosts.reduce((sum, p) => sum + (p.engagement_rate || 0), 0)
    result.post_performance.avg_engagement_rate = totalER / xPosts.length

    const sorted = [...xPosts].sort((a, b) => (b.engagement_rate || 0) - (a.engagement_rate || 0))
    const best = sorted[0]
    const worst = sorted[sorted.length - 1]

    result.post_performance.best_post = {
      text: best.post_text?.slice(0, 80) || '',
      likes: best.likes || 0,
      er: best.engagement_rate || 0,
    }
    result.post_performance.worst_post = {
      text: worst.post_text?.slice(0, 80) || '',
      likes: worst.likes || 0,
      er: worst.engagement_rate || 0,
    }
  }

  // 3. Pattern performance vs hook-templates.ts
  const { data: patterns } = await supabase
    .from('pattern_performance')
    .select('pattern_id, successes, failures, total_uses, avg_engagement')
    .eq('platform', 'x')
    .order('total_uses', { ascending: false })

  // Read hook-templates.ts to get effectiveness_scores
  const hookTemplatePath = path.resolve(__dirname, '../../viral-hooks/hook-templates.ts')
  let hookScores: Record<string, number> = {}
  try {
    const hookContent = fs.readFileSync(hookTemplatePath, 'utf-8')
    const scoreMatches = hookContent.matchAll(/id:\s*'([^']+)'[\s\S]*?effectiveness_score:\s*([\d.]+)/g)
    for (const match of scoreMatches) {
      hookScores[match[1]] = parseFloat(match[2])
    }
  } catch {
    console.error('[check] Could not read hook-templates.ts')
  }

  if (patterns) {
    for (const p of patterns) {
      const totalUses = p.successes + p.failures
      if (totalUses === 0) continue

      const successRate = p.successes / totalUses
      const hookScore = hookScores[p.pattern_id] ?? null
      const divergence = hookScore !== null ? Math.abs(successRate - hookScore) : 0

      result.pattern_analysis.push({
        pattern_id: p.pattern_id,
        successes: p.successes,
        failures: p.failures,
        success_rate: Math.round(successRate * 100) / 100,
        avg_engagement: p.avg_engagement,
        hook_score: hookScore,
        divergence: Math.round(divergence * 100) / 100,
      })

      // Flag for improvement if divergence > 0.15
      if (hookScore !== null && divergence > 0.15 && totalUses >= 5) {
        result.improvements_needed.push({
          type: 'score_update',
          description: `パターン "${p.pattern_id}" のeffectiveness_scoreが実績と乖離 (${hookScore} → ${successRate.toFixed(2)})`,
          file: 'lib/viral-hooks/hook-templates.ts',
          current_value: `effectiveness_score: ${hookScore}`,
          proposed_value: `effectiveness_score: ${successRate.toFixed(2)}`,
        })
      }
    }
  }

  // 4. Temporal insights
  const { data: temporal } = await supabase
    .from('cortex_temporal_patterns')
    .select('platform, day_of_week, hour_jst, avg_engagement_rate, sample_count')
    .eq('platform', 'x')
    .order('recommendation_score', { ascending: false })
    .limit(1)

  const { data: worstTemporal } = await supabase
    .from('cortex_temporal_patterns')
    .select('platform, day_of_week, hour_jst, avg_engagement_rate')
    .eq('platform', 'x')
    .gt('sample_count', 2)
    .order('avg_engagement_rate', { ascending: true })
    .limit(1)

  const days = ['日', '月', '火', '水', '木', '金', '土']
  if (temporal?.[0]) {
    const t = temporal[0]
    result.temporal_insights.best_slot = `${days[t.day_of_week]}曜 ${t.hour_jst}時 (ER: ${(t.avg_engagement_rate * 100).toFixed(1)}%)`
  }
  if (worstTemporal?.[0]) {
    const w = worstTemporal[0]
    result.temporal_insights.worst_slot = `${days[w.day_of_week]}曜 ${w.hour_jst}時 (ER: ${(w.avg_engagement_rate * 100).toFixed(1)}%)`
  }

  // 5. Check for new viral patterns
  const { data: viralAnalysis } = await supabase
    .from('cortex_viral_analysis')
    .select('hook_type, primary_buzz_factor, replicability_score')
    .gte('analyzed_at', since)
    .gte('replicability_score', 0.7)
    .order('replicability_score', { ascending: false })
    .limit(5)

  if (viralAnalysis) {
    for (const v of viralAnalysis) {
      if (v.hook_type && !hookScores[v.hook_type]) {
        result.improvements_needed.push({
          type: 'new_pattern',
          description: `新パターン候補: "${v.hook_type}" (再現性: ${((v.replicability_score || 0) * 100).toFixed(0)}%, 要因: ${v.primary_buzz_factor})`,
          file: 'lib/viral-hooks/hook-templates.ts',
          current_value: '存在しない',
          proposed_value: `新規追加 (effectiveness_score: ${((v.replicability_score || 0) * 0.9).toFixed(2)})`,
        })
      }
    }
  }

  // 6. Generate summary
  const improvementCount = result.improvements_needed.length
  result.summary = improvementCount > 0
    ? `${result.post_performance.total_posts_7d}投稿を分析。${improvementCount}件の改善提案あり。`
    : `${result.post_performance.total_posts_7d}投稿を分析。現状のパターンスコアは実績と整合。改善不要。`

  // 7. Mark pending tasks as in_progress
  if (pendingTasks) {
    for (const task of pendingTasks) {
      await supabase
        .from('cortex_conversation_log')
        .update({ status: 'in_progress' })
        .eq('id', task.id)
    }
  }

  // Output as JSON for Claude Code to read
  console.log(JSON.stringify(result, null, 2))
}

main().catch(err => {
  console.error('CORTEX check failed:', err)
  process.exit(1)
})
