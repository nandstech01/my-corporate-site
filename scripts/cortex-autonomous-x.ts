/**
 * CORTEX 自己完結 X 自動投稿（常時稼働・コレクター非依存）
 *
 * 目的: GitHub Actions cron(Mac runner)で、ローカルアプリ起動や
 * buzz/trending コレクターの状態に依存せず、毎回自前でリサーチして高品質投稿する。
 *
 * フロー: プレイブック領域選定 → Brave自前リサーチ → generateXPost(領域の許可パターン+意図注入)
 *        → Typefully(next-free-slot)投入。
 *
 * 実行: npx tsx scripts/cortex-autonomous-x.ts
 * 既存の x-auto-post(コレクター依存)とは別経路の、自己完結フォールバック。
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { selectPlaybookArea, formatPlaybookForPrompt } from '../lib/cortex/playbook/config'
import { braveWebSearch } from '../lib/web-search/brave'
import { generateXPost } from '../lib/x-post-generation/post-graph'
import { createTypefullyDraft } from '../lib/typefully/client'
import { getRecentXPostTexts } from '../lib/slack-bot/memory'

const RESEARCH_QUERIES = [
  'Claude Code Anthropic 最新 アップデート',
  '生成AI エージェント 最新ニュース',
  'AI開発 実践 Tips 効率化',
  'LLM Claude GPT 比較 最新',
]

async function main(): Promise<void> {
  const area = selectPlaybookArea()
  console.log(`[cortex-autonomous-x] area=${area.id} (${area.label}) mode=${area.mode}`)

  // 1) 自前リサーチ（Brave、直近1週間）。クエリは領域に応じて軽く変動
  const q = RESEARCH_QUERIES[Math.floor(Math.random() * RESEARCH_QUERIES.length)]
  let results: readonly { title: string; url: string; description: string }[] = []
  try {
    results = await braveWebSearch(q, { count: 8, freshness: 'pw' })
  } catch (e) {
    console.log('[cortex-autonomous-x] brave失敗:', e instanceof Error ? e.message : String(e))
  }
  if (results.length === 0) {
    console.log('[cortex-autonomous-x] リサーチ結果0件。投稿せず終了。')
    return
  }
  const top = results.slice(0, 5)
  const topic = top[0].title.slice(0, 80)
  const content = top.map((r) => `・${r.title}: ${r.description}`).join('\n').slice(0, 2000)
  console.log(`[cortex-autonomous-x] topic="${topic}"`)

  // 2) 重複回避用に直近投稿を渡す（生成側でdedup）
  let recent: readonly string[] = []
  try {
    recent = await getRecentXPostTexts(30)
  } catch { /* best-effort */ }

  // 3) 生成（プレイブックの許可パターン＋意図を注入）
  const res = await generateXPost({
    mode: area.mode,
    topic,
    content,
    tags: ['AI'],
    recentPostTexts: recent,
    allowedPatternIds: area.eligiblePatternIds,
    playbookInstructions: formatPlaybookForPrompt(area),
  })
  console.log(`[cortex-autonomous-x] pattern=${res.patternUsed} chars=${res.finalPost.length}`)

  // 4) Typefullyへ next-free-slot で投入（枠で自動配信）
  const pub = await createTypefullyDraft(res.finalPost, {
    scheduleDate: process.env.TYPEFULLY_SCHEDULE_DATE || 'next-free-slot',
    share: true,
  })
  if (!pub.success) {
    console.log('[cortex-autonomous-x] Typefully投入失敗:', pub.error)
    process.exitCode = 1
    return
  }
  console.log(`[cortex-autonomous-x] 投入成功 draftId=${pub.draftId} area=${area.tag}`)
}

main().catch((e) => {
  console.error('[cortex-autonomous-x] FATAL:', e instanceof Error ? e.message : String(e))
  process.exitCode = 1
})
