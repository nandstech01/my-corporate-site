/**
 * Autonomous Claude Code self-reply thread for Threads (Meta).
 *
 * Same source/quality as the X Claude Code thread, but EXPRESSION optimized for
 * Threads (storytelling, ≤500 chars/post, no hashtag spam, educational tone).
 * Threads supports native reply chains, so we post via postThreadsChain
 * (parent + replies) with an optional banner image on the parent.
 *
 * Does NOT touch the X pipeline. Kill-switch: CC_THREADS_ENABLED.
 */

import { invokeClaude, parseClaudeJson } from '../../llm/claude-cli'
import { collectClaudeCodeDigest } from '../knowledge/claude-code-watcher'
import {
  postThreadsChain,
  isThreadsConfigured,
  isThreadsPostingEnabled,
} from '../../threads-api/client'
import { cortexReview } from '../review/pre-post-reviewer'
import { generateOrangeBanner } from '../blog/banner-thumbnail'

const GEN_MODEL = 'claude-sonnet-4-6'
const MAX_LEN = 480 // Threads hard limit is 500; keep headroom.

interface ThreadsThread {
  parent: string
  replies: string[]
  title: string
}

function buildPrompt(facts: readonly string[], angle: string): { system: string; user: string } {
  const system = `あなたは @nands_tech。Claude Codeを毎日使う実務家エンジニアで、Threads向けに「保存したくなる解説スレッド」を書く。
Threadsは X とは別物。最適化ルール:
- 1投稿あたり最大${MAX_LEN}文字（厳守）。親＋返信3〜5本のセルフリプライ・スレッド。
- ストーリー性(起承転結)＋教育的・丁寧。煽りすぎNG。ハッシュタグは使わない(Threadsでは不要)。
- 親投稿: 1行目で「何が変わったか/痛み」を置き、続きを読みたくさせる。
- 各返信: 具体的な使い方・コマンド/設定例を1つ以上。抽象論禁止。
- 検証済み事実(facts)に無いバージョン番号・数値・固有名は書かない。不確かな最新性は定性的に。
- 最後の返信に「詳しい手順はブログで」程度の自然な一言を添えてよい(URLは入れない)。

出力(JSONのみ・前置き不要):
{"title":"内部用タイトル","parent":"親投稿(${MAX_LEN}字以内)","replies":["返信1","返信2","返信3"]}`

  const user = `## テーマ
${angle}

## 検証済み事実(最新性の唯一の根拠)
${facts.length ? facts.map((f) => `- ${f}`).join('\n') : '(なし: バージョン固有の主張は避ける)'}`

  return { system, user }
}

async function notify(title: string, body: string, url: string): Promise<void> {
  const webhook = process.env.DISCORD_WEBHOOK_URL
  if (!webhook) { process.stdout.write(`[threads-cc] (no webhook) ${title}: ${body} ${url}\n`); return }
  try {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [{ title, description: body.slice(0, 1200), color: 0x000000, url: url || undefined, footer: { text: 'CORTEX Threads by NANDS' } }] }),
    })
  } catch { /* best-effort */ }
}

export async function runClaudeCodeThreads(): Promise<void> {
  process.stdout.write('\n=== Claude Code Threads (self-reply) ===\n')

  if (process.env.CC_THREADS_ENABLED !== 'true') {
    process.stdout.write('[threads-cc] CC_THREADS_ENABLED!=true — disabled. Skipping.\n')
    return
  }
  if (!isThreadsConfigured() || !isThreadsPostingEnabled()) {
    process.stdout.write('[threads-cc] Threads not configured/enabled. Skipping.\n')
    return
  }

  // トークン失効ガード: 期限14日以内でDiscord警告(秘密は出さない)。
  // Threadsトークンは約60日で失効するが、cronからGitHub Secretを自動更新できないため、
  // 失効前に必ず通知して手動再発行(2分)を促す = 二度と無言で死なせない。
  const expISO = process.env.THREADS_TOKEN_EXPIRES_AT
  if (expISO) {
    const days = Math.round((new Date(expISO).getTime() - Date.now()) / 864e5)
    if (days <= 14) {
      await notify(
        '⚠️ Threadsトークン失効間近',
        `あと${days}日で失効(${expISO.slice(0, 10)})。Meta開発者ページ→該当アプリ→Threads API→「アクセストークンを生成」で再発行し、THREADS_ACCESS_TOKEN(.env.local + GitHub Secret)を更新してください。`,
        '',
      )
    }
  }

  const dryRun = process.env.CC_THREADS_DRY_RUN === 'true'

  // Source: same as X (overlap is fine), expression optimized for Threads.
  const digest = await collectClaudeCodeDigest({ changelogLimit: 3, communityLimit: 4 }).catch(() => null)
  const facts = (digest?.changelog ?? []).map((u) => `${u.title}: ${u.summary.slice(0, 180)}`)
  const angle = digest?.changelog[0]
    ? `Claude Code ${digest.changelog[0].version ?? '最新'} の新機能と実践的な使い方`
    : 'Claude Code を実務で使い倒す実践Tips'

  // Generate
  let thread: ThreadsThread
  try {
    const p = buildPrompt(facts, angle)
    const { text } = await invokeClaude(p.user, { system: p.system, model: GEN_MODEL, timeoutMs: 180_000 })
    thread = parseClaudeJson<ThreadsThread>(text)
  } catch (e) {
    await notify('🔴 Threads: 生成失敗', `${angle}\n${e instanceof Error ? e.message : e}`, '')
    return
  }

  const parent = (thread.parent ?? '').trim()
  const replies = Array.isArray(thread.replies) ? thread.replies.map((r) => String(r).trim()).filter(Boolean) : []
  // Structural gate
  const tooLong = [parent, ...replies].find((s) => s.length > 500)
  if (!parent || replies.length < 2 || tooLong) {
    await notify('🟡 Threads: 構造NG', `parent=${parent.length}字 replies=${replies.length} ${tooLong ? '(500字超あり)' : ''}`, '')
    return
  }

  // Quality gate (cortexReview uses threads_post_analytics for dedup)
  try {
    const reviewed = await cortexReview([{ text: `${parent}\n${replies.join('\n')}`, platform: 'threads', sourceTitle: thread.title || angle }])
    const r = reviewed[0]
    if (r?.duplicate_of) {
      await notify('🟡 Threads: 重複スキップ', `重複: ${r.duplicate_of}`, '')
      return
    }
  } catch (e) {
    process.stdout.write(`[threads-cc] cortexReview skipped: ${e instanceof Error ? e.message : e}\n`)
  }

  // Banner image on parent (best-effort)
  const bannerUrl = await generateOrangeBanner(thread.title || angle, 'claude-code-howto').catch(() => null)

  if (dryRun) {
    process.stdout.write('[threads-cc] DRY-RUN (投稿せず)\n')
    process.stdout.write(`PARENT(${parent.length}): ${parent}\n`)
    replies.forEach((r, i) => process.stdout.write(`REPLY${i + 1}(${r.length}): ${r}\n`))
    process.stdout.write(`banner: ${bannerUrl ?? '(none)'}\n`)
    return
  }

  // Post the native Threads self-reply chain
  const result = await postThreadsChain({
    parentText: parent,
    parentImageUrl: bannerUrl ?? undefined,
    replies,
  })

  if (!result.parentId) {
    await notify('🔴 Threads: 投稿失敗', result.errors.join(' / '), '')
    return
  }
  process.stdout.write(`[threads-cc] posted: ${result.parentUrl} (replies ${result.replyCount}/${replies.length})\n`)
  await notify(
    `🟢 Threads公開: ${thread.title || angle}`,
    `親＋返信${result.replyCount}/${replies.length}${bannerUrl ? '・画像付き' : ''}${result.errors.length ? '\n⚠️ ' + result.errors.join(' / ') : ''}`,
    result.parentUrl ?? '',
  )
}
