/**
 * CORTEX 自己完結 X 自動投稿 + 学習クローズ（常時稼働・コレクター/アプリ非依存）
 *
 * 各実行で:
 *  0) 前回までにTypefullyへ投入した投稿を照合 → 公開済みなら tweet_id を取得し
 *     x_post_analytics に pattern_used 付きで記録（engagement-learnerが計測→bandit学習）
 *  1) プレイブック領域選定 → Brave自前リサーチ → generateXPost(許可パターン+意図)
 *  2) Typefully(next-free-slot)投入 → cortex_pending_posts に下書きIDと pattern_used を保存
 *
 * 学習の輪: 投稿→(次回照合でtweet_id記録)→engagement-learner計測→recordPatternOutcome→bandit。
 * 実行: npx tsx scripts/cortex-autonomous-x.ts
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
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

const TF_BASE = 'https://api.typefully.com'
const SOCIAL_SET = process.env.TYPEFULLY_SOCIAL_SET_ID || '315461'

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  )
}

function tweetIdFromUrl(url?: string | null): string | null {
  if (!url) return null
  const m = url.split('/status/')[1]
  return m ? m.split(/[?#/]/)[0] : null
}

/**
 * 前回投入分(status=scheduled)を照合し、公開済みなら tweet_id を x_post_analytics に記録。
 * これで学習器(engagement-learner)が pattern_used 単位でエンゲージを計測できる。
 */
async function reconcilePublished(): Promise<number> {
  const db = sb()
  // x_post_analytics に tweet_id='pending:<draftId>' で仮記録した行を照合する
  const { data: pend } = await db
    .from('x_post_analytics')
    .select('id, tweet_id')
    .like('tweet_id', 'pending:%')
    .limit(20)
  if (!pend || pend.length === 0) return 0

  let reconciled = 0
  for (const row of pend) {
    const draftId = String(row.tweet_id).slice('pending:'.length)
    if (!draftId) continue
    try {
      const r = await fetch(`${TF_BASE}/v2/social-sets/${SOCIAL_SET}/drafts/${draftId}`, {
        headers: { Authorization: `Bearer ${process.env.TYPEFULLY_API_KEY}` },
      })
      if (!r.ok) continue
      const d = (await r.json()) as {
        publish_state?: string
        x_published_url?: string
        x_post_published_at?: string
      }
      if (d.publish_state !== 'finished') continue
      const tweetId = tweetIdFromUrl(d.x_published_url)
      if (tweetId) {
        // 仮行のtweet_idを実IDに更新（重複時はその仮行を削除）
        const { data: dup } = await db.from('x_post_analytics').select('id').eq('tweet_id', tweetId).limit(1)
        if (dup && dup.length > 0) {
          await db.from('x_post_analytics').delete().eq('id', row.id)
        } else {
          await db
            .from('x_post_analytics')
            .update({ tweet_id: tweetId, posted_at: d.x_post_published_at || new Date().toISOString() })
            .eq('id', row.id)
        }
        reconciled++
      }
    } catch { /* best-effort */ }
  }
  return reconciled
}

async function main(): Promise<void> {
  // 0) 学習クローズ: 前回投稿の照合
  try {
    const n = await reconcilePublished()
    console.log(`[cortex-autonomous-x] reconciled=${n} (x_post_analytics へ記録)`)
  } catch (e) {
    console.log('[cortex-autonomous-x] reconcile失敗:', e instanceof Error ? e.message : String(e))
  }

  const area = selectPlaybookArea()
  console.log(`[cortex-autonomous-x] area=${area.id} (${area.label}) mode=${area.mode}`)

  // 1) 自前リサーチ
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

  let recent: readonly string[] = []
  try {
    recent = await getRecentXPostTexts(30)
  } catch { /* best-effort */ }

  // 2) 生成（プレイブックの許可パターン＋意図）
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

  // 3) Typefully投入
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

  // 4) 学習用に仮記録（tweet_id='pending:<draftId>'。次回 reconcile で実tweet_idへ更新）
  try {
    await sb().from('x_post_analytics').insert({
      tweet_id: `pending:${pub.draftId}`,
      post_text: res.finalPost,
      pattern_used: res.patternUsed,
      posted_at: new Date().toISOString(),
    })
  } catch (e) {
    console.log('[cortex-autonomous-x] 記録失敗(投稿は成功):', e instanceof Error ? e.message : String(e))
  }
}

main().catch((e) => {
  console.error('[cortex-autonomous-x] FATAL:', e instanceof Error ? e.message : String(e))
  process.exitCode = 1
})
