/**
 * Weekly Claude Code SEO blog orchestrator.
 *
 * Ties existing pieces together so a SEO blog about the REAL latest Claude Code
 * release gets published to nands.tech and cross-posted to Zenn / Qiita / note
 * (each platform-optimized + canonical_url back to the self-blog).
 *
 * The blog generator (app/api/generate-hybrid-blog) only runs against a LOCAL
 * Next server (claude -p / Cloudflare 524 on prod), so generation is delegated
 * to localhost:3000 — exactly like the cortex-blog-seo scheduled task.
 *
 * Modes (CC_BLOG_MODE, default "topic"):
 *   topic     - print a changelog-grounded blog-topic spec (JSON). Offline-safe.
 *   generate  - POST the spec to local Next → returns the draft slug.
 *   crosspost - cross-post an existing slug (CC_BLOG_SLUG) to zenn/qiita/note.
 *   full      - generate then crosspost.
 *
 * Env:
 *   CC_BLOG_MODE        topic | generate | crosspost | full   (default: topic)
 *   CC_BLOG_SLUG        slug to cross-post (crosspost mode)
 *   CC_BLOG_PLATFORMS   comma list (default: zenn,qiita,note)
 *   CC_BLOG_CATEGORY    category slug (default: programming)
 *   CC_BLOG_BUSINESS    businessCategory string (required for generate/full)
 *   CC_BLOG_BASE_URL    Next base (default: http://localhost:3000)
 *   DRY_RUN             "true" → cross-post preview only (default: true)
 */

// Load .env.local BEFORE any heavy module evaluates (some modules init API
// clients at import time). dotenv does not override env already set by the
// GitHub Actions runner, so this is safe in production too.
import { config } from 'dotenv'
config({ path: '.env.local' })

import type { CrossPostPlatform } from '../lib/cross-post/types'

interface BlogTopicSpec {
  readonly topic: string
  readonly targetKeyword: string
  readonly categorySlug: string
  readonly businessCategory: string
  readonly scrapeQuery1: string
  readonly scrapeQuery2: string
  readonly researchQuery1: string
  readonly researchQuery2: string
  /** Verified facts from the official changelog (accuracy anchor for review). */
  readonly changelogFacts: readonly string[]
}

/** Build a blog-topic spec grounded in the REAL latest Claude Code changelog. */
async function buildTopicSpec(): Promise<BlogTopicSpec | null> {
  const { collectClaudeCodeDigest } = await import('../lib/cortex/knowledge/claude-code-watcher')
  const digest = await collectClaudeCodeDigest({ changelogLimit: 3, communityLimit: 0 })
  const top = digest.changelog[0]
  if (!top) {
    process.stdout.write('[cc-blog] No changelog data — skipping.\n')
    return null
  }

  const version = top.version ?? '最新版'
  return {
    topic: `Claude Code ${version} の新機能と実践的な使い方`,
    targetKeyword: `Claude Code 最新 使い方`,
    categorySlug: process.env.CC_BLOG_CATEGORY || 'programming',
    businessCategory: process.env.CC_BLOG_BUSINESS || 'AI開発',
    scrapeQuery1: `Claude Code ${version}`,
    scrapeQuery2: `Claude Code 使い方 tips workflow`,
    researchQuery1: `Claude Code 最新アップデート ${version}`,
    researchQuery2: `Claude Code 活用 事例 開発効率`,
    changelogFacts: digest.changelog.map((u) => `${u.title}: ${u.summary.slice(0, 160)}`),
  }
}

/** POST the spec to the local Next generate-hybrid-blog endpoint → draft slug. */
async function generateBlog(spec: BlogTopicSpec): Promise<string | null> {
  const base = process.env.CC_BLOG_BASE_URL || 'http://localhost:3000'
  const url = `${base}/api/generate-hybrid-blog`
  process.stdout.write(`[cc-blog] Generating via ${url} (topic="${spec.topic}")\n`)

  // 生成は claude -p Opus で実行され、長文(30k字)は ~300秒の壁でタイムアウトしやすい。
  // 完走させるため記事長を抑えめ(既定12000字)にし、クライアントの待ち時間も延長する。
  const targetLength = Number(process.env.CC_BLOG_LENGTH || 12000)
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(900_000), // 15分: 既定300秒のfetch中断を回避
    body: JSON.stringify({
      topic: spec.topic,
      targetKeyword: spec.targetKeyword,
      categorySlug: spec.categorySlug,
      businessCategory: spec.businessCategory,
      scrapeQuery1: spec.scrapeQuery1,
      scrapeQuery2: spec.scrapeQuery2,
      researchQuery1: spec.researchQuery1,
      researchQuery2: spec.researchQuery2,
      targetLength,
      generationModel: 'deepseek',
      researchModel: 'deepseek',
      enableH2Diagrams: true,
      maxH2Diagrams: 4,
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`generate-hybrid-blog ${res.status}: ${text.slice(0, 300)}`)
  }

  const data = (await res.json()) as { slug?: string; post?: { slug?: string } }
  const slug = data.slug ?? data.post?.slug ?? null
  if (!slug) {
    throw new Error(`generation succeeded but no slug in response: ${JSON.stringify(data).slice(0, 200)}`)
  }
  process.stdout.write(`[cc-blog] Draft created: slug=${slug} (status=draft, /posts/${slug})\n`)
  return slug
}

/** Cross-post a published slug to Zenn / Qiita / note (per-platform optimized). */
async function crossPost(slug: string): Promise<void> {
  const platforms = (process.env.CC_BLOG_PLATFORMS || 'zenn,qiita,note')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean) as CrossPostPlatform[]
  const dryRun = process.env.DRY_RUN !== 'false' // default: dry-run (safe)

  const { crossPostArticle } = await import('../lib/cross-post/pipeline')
  process.stdout.write(`[cc-blog] Cross-posting slug=${slug} → [${platforms.join(',')}] dryRun=${dryRun}\n`)
  const results = await crossPostArticle({ slug, platforms, dryRun })
  for (const r of results) {
    process.stdout.write(`  [${r.success ? 'OK' : 'FAIL'}] ${r.platform}: ${r.url ?? r.error}\n`)
  }
}

async function main(): Promise<void> {
  const mode = process.env.CC_BLOG_MODE || 'topic'
  process.stdout.write(`\n=== Weekly Claude Code Blog (mode=${mode}) ===\n`)

  if (mode === 'crosspost') {
    const slug = process.env.CC_BLOG_SLUG
    if (!slug) throw new Error('CC_BLOG_SLUG is required for crosspost mode')
    await crossPost(slug)
    return
  }

  const spec = await buildTopicSpec()
  if (!spec) return

  if (mode === 'topic') {
    // Offline-safe: emit the grounded spec for the generator / human review.
    process.stdout.write(JSON.stringify(spec, null, 2) + '\n')
    return
  }

  if (mode === 'generate' || mode === 'full') {
    if (!process.env.CC_BLOG_BUSINESS) {
      process.stdout.write('[cc-blog] WARN: CC_BLOG_BUSINESS unset, using default "AI開発"\n')
    }
    const slug = await generateBlog(spec)
    if (mode === 'full' && slug) {
      // 自社ブログを下書きで作成。公開は人間承認後。crosspostは published 後に実行する想定。
      process.stdout.write('[cc-blog] NOTE: draft created. Cross-post runs after human publish.\n')
      if (process.env.CC_BLOG_FORCE_CROSSPOST === 'true') await crossPost(slug)
    }
    return
  }

  throw new Error(`Unknown CC_BLOG_MODE: ${mode}`)
}

main().catch((e) => {
  process.stdout.write(`[cc-blog] FAILED: ${e instanceof Error ? e.message : String(e)}\n`)
  process.exit(1)
})
