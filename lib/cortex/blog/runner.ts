/**
 * Fully-automated Claude Code blog runner.
 *
 *   planTopic → generateArticle → banner → qualityGate → publish → cross-post → notify
 *
 * Safety: CC_BLOG_ENABLED must be 'true' (kill-switch). CC_BLOG_DRY_RUN='true'
 * forces draft + dry-run cross-post. Otherwise quality-gate decides publish vs
 * draft, and a passing article is auto-published + auto cross-posted.
 */

import { planTopic } from './topic-planner'
import { generateArticle } from './article-generator'
import { generateOrangeBanner } from './banner-thumbnail'
import { runQualityGate } from './quality-gate'
import { publishPost } from './publisher'
import type { BlogRunResult } from './types'

async function notify(title: string, body: string, url: string): Promise<void> {
  const webhook = process.env.DISCORD_WEBHOOK_URL
  if (!webhook) {
    process.stdout.write(`[blog] (no webhook) ${title}: ${body} ${url}\n`)
    return
  }
  try {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{ title, description: body.slice(0, 1500), color: 0xd97757, url: url || undefined, footer: { text: 'CORTEX Blog by NANDS' } }],
      }),
    })
  } catch (e) {
    process.stdout.write(`[blog] notify failed: ${e instanceof Error ? e.message : e}\n`)
  }
}

export async function runClaudeCodeBlog(): Promise<BlogRunResult> {
  process.stdout.write('\n=== Claude Code Auto Blog ===\n')

  if (process.env.CC_BLOG_ENABLED !== 'true') {
    process.stdout.write('[blog] CC_BLOG_ENABLED!=true — disabled. Skipping.\n')
    return { ok: false, skipped: 'disabled' }
  }
  const dryRun = process.env.CC_BLOG_DRY_RUN === 'true'

  // 1. Topic
  const plan = await planTopic()
  if (!plan) {
    await notify('🟡 ブログ: トピックなし', '新鮮で重複しないトピックが見つからずスキップしました。', '')
    return { ok: false, skipped: 'no-topic' }
  }
  process.stdout.write(`[blog] topic: [${plan.kind}] ${plan.topic}\n`)

  // 2. Generate
  const article = await generateArticle(plan)
  if (!article) {
    await notify('🔴 ブログ: 生成失敗', `「${plan.topic}」の本文生成に失敗しました。`, '')
    return { ok: false, error: 'generation-failed' }
  }

  // 3. Quality gate
  const quality = await runQualityGate(article, plan.changelogFacts)
  const publish = !dryRun && quality.passed

  // 4. Banner (best-effort)
  const banner = await generateOrangeBanner(article.title, article.kind)

  // 5. Publish (published if gate passed & not dry-run; else draft)
  let publishResult
  try {
    publishResult = await publishPost(article, plan.categorySlug, banner, publish)
  } catch (e) {
    await notify('🔴 ブログ: 保存失敗', `${article.title}\n${e instanceof Error ? e.message : e}`, '')
    return { ok: false, error: 'publish-failed', quality }
  }
  process.stdout.write(`[blog] ${publishResult.status}: ${publishResult.url} (score=${quality.score.toFixed(2)})\n`)

  // 6. Cross-post (only when published; draft → skip, notify 要確認)
  let crossPost
  if (publishResult.status === 'published') {
    try {
      const { crossPostArticle } = await import('../../cross-post/pipeline')
      const results = await crossPostArticle({
        slug: publishResult.slug,
        platforms: ['zenn', 'qiita', 'note'],
        dryRun,
      })
      crossPost = results.map((r) => ({ platform: r.platform, success: r.success, url: r.url, error: r.error }))
    } catch (e) {
      process.stdout.write(`[blog] cross-post failed: ${e instanceof Error ? e.message : e}\n`)
    }
  }

  // 7. Notify
  const bannerNote = banner ? '' : '\n⚠️ サムネ生成失敗'
  if (publishResult.status === 'published') {
    const cp = (crossPost ?? []).map((r) => `${r.success ? '✅' : '❌'}${r.platform}`).join(' ')
    await notify(
      `🟢 ブログ公開: ${article.title}`,
      `[${plan.kind}] score=${quality.score.toFixed(2)}\nクロスポスト: ${cp || '(なし)'}${bannerNote}`,
      publishResult.url,
    )
  } else {
    await notify(
      `🟡 要確認(下書き): ${article.title}`,
      `品質ゲート未通過のため下書き保存。理由:\n- ${quality.reasons.join('\n- ')}${bannerNote}`,
      publishResult.url,
    )
  }

  return { ok: true, publish: publishResult, crossPost, quality }
}
