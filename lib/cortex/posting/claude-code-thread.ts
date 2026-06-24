/**
 * Claude Code Explainer Thread Generator
 *
 * Turns a ClaudeCodeDigest (real changelog + community buzz) into a
 * "textbook-style" self-reply thread:
 *   - main tweet: a scroll-stopping hook about the newest real change
 *   - replies: step-by-step "what changed + how to use it + caveat"
 *
 * Style: we keep our own voice but imitate the STRUCTURE of buzzing Claude Code
 * accounts (passed as few-shot examples). X-algorithm hygiene is enforced:
 *   - no external link in the main tweet (links suppress reach) → link goes in
 *     the final reply
 *   - at most 2 hashtags
 *
 * Generation only — posting is handled by the caller (daily-buzz thread path),
 * so this module is safe to run for previews without touching the live account.
 */

import { createAnthropicCompatible } from '@/lib/llm/claude-cli'
import {
  collectClaudeCodeDigest,
  type ClaudeCodeDigest,
} from '../knowledge/claude-code-watcher'

const GEN_MODEL = 'claude-sonnet-4-20250514'

export interface ClaudeCodeThreadContent {
  readonly mainTweet: string
  readonly replies: readonly string[]
  readonly infographicTitle: string
  readonly infographicPoints: readonly string[]
  /** The changelog/source link surfaced in the final reply. */
  readonly sourceUrl: string
  /** Version this thread teaches, when known. */
  readonly version: string | null
}

function buildPrompt(digest: ClaudeCodeDigest): string {
  const top = digest.changelog[0]
  const changelogBlock = digest.changelog
    .map((u) => `- ${u.title}: ${u.summary}`)
    .join('\n')

  // Buzz examples are STYLE references only — imitate structure, not content.
  const styleExamples = digest.community
    .slice(0, 4)
    .map((u, i) => `[例${i + 1}] @${u.authorHandle ?? '?'}: ${u.title} — ${u.summary.slice(0, 160)}`)
    .join('\n')

  return `あなたは @nands_tech。Claude Codeを毎日使い倒している実務家エンジニアだ。
公式CHANGELOGの「本当の最新変更」を、フォロワーが保存したくなる教科書スレッドに変換する。

## 今日教える本命（公式CHANGELOG = ground truth。ここから1つに絞る）
${changelogBlock}

## バズっているClaude Code垢の「型」（文体ではなく構造だけ真似る・内容は流用しない）
${styleExamples || '(なし)'}

## 作るもの: セルフリプライ解説スレッド
- mainTweet: 1行目で「何が変わったか」を結論として置きスクロールを止める。読み切りたくなるフック。
  - 外部リンクは絶対に入れない（リーチが落ちる）。ハッシュタグは最大2つ。
- replies: 2〜4本。教科書のように「具体的な使い方→コマンド/設定例→ハマりどころ/注意点」を順に。
  - コードや設定は \`backtick\` で示す。抽象論禁止、必ず手を動かせる粒度。
  - 最後のリプライにのみ出典リンクを入れる: ${top?.sourceUrl ?? ''}

## 文体（現状維持）
- 「だ・である」調。実装していないことは語らない。中身のない煽りは禁止、必ず具体で裏付ける。
- 絵文字は1文に最大1つ。①②③や▪️で構造化してよい。

## 出力（JSONのみ・前置き不要）
{
  "version": "${top?.version ?? ''}",
  "mainTweet": "280加重文字以内・リンクなし・ハッシュタグ最大2",
  "replies": ["リプ1（使い方）", "リプ2（例）", "リプ3（注意点＋末尾に出典URL）"],
  "infographicTitle": "15文字以内",
  "infographicPoints": ["20文字以内", "...", "最大5個"]
}`
}

/**
 * Generate a Claude Code explainer thread from a digest (or freshly collected).
 * Returns null when there is no changelog substance to teach.
 */
export async function generateClaudeCodeThread(
  digest?: ClaudeCodeDigest,
): Promise<ClaudeCodeThreadContent | null> {
  const data = digest ?? (await collectClaudeCodeDigest())

  if (data.changelog.length === 0) {
    process.stdout.write('[claude-code-thread] no changelog substance — skipping\n')
    return null
  }

  const anthropic = createAnthropicCompatible()
  const response = await anthropic.messages.create({
    model: GEN_MODEL,
    max_tokens: 4096,
    messages: [{ role: 'user', content: buildPrompt(data) }],
  })

  const block = response.content.find(
    (b: { type: string }) => b.type === 'text',
  ) as { text?: string } | undefined
  const raw = block?.text ?? '{}'
  const jsonMatch = raw.match(/\{[\s\S]*\}/)

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(jsonMatch?.[0] ?? '{}')
  } catch {
    throw new Error(`Failed to parse generation response: ${raw.slice(0, 200)}`)
  }

  const top = data.changelog[0]
  const replies = Array.isArray(parsed.replies)
    ? (parsed.replies as unknown[]).map((r) => String(r)).filter((r) => r.length > 0)
    : []

  return {
    version: (parsed.version as string) || top.version,
    mainTweet: String(parsed.mainTweet ?? ''),
    replies,
    infographicTitle: String(parsed.infographicTitle ?? `Claude Code ${top.version ?? '最新'}`),
    infographicPoints: Array.isArray(parsed.infographicPoints)
      ? (parsed.infographicPoints as unknown[]).map((p) => String(p)).slice(0, 5)
      : [],
    sourceUrl: top.sourceUrl,
  }
}
