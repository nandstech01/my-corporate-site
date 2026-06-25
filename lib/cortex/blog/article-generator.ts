/**
 * Article generator: chunked claude -p generation to avoid the long-output
 * timeout that breaks the app/ route. Outline (Opus) → per-section bodies
 * (Sonnet, retry Haiku) → assembled Markdown with {#fragment} anchors.
 */

import { invokeClaude, parseClaudeJson } from '../../llm/claude-cli'
import {
  buildOutlinePrompt,
  buildSectionPrompt,
  buildHookPrompt,
  buildConclusionPrompt,
} from './prompts'
import type { TopicPlan, GeneratedArticle } from './types'

const TIMEOUT = 180_000

interface Outline {
  title: string
  slugBase: string
  metaDescription: string
  metaKeywords: string[]
  categoryTags: string[]
  hookBrief: string
  mechanismBrief: string
  sections: Array<{ h2: string; fragmentId: string; brief: string }>
  conclusionBrief: string
}

function sanitizeFragment(id: string, i: number): string {
  const s = (id || '').toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  return s || `section-${i + 1}`
}

/** One body section via claude -p; retry on empty/timeout with a cheaper model; null if both fail. */
async function writeSection(
  system: string,
  user: string,
): Promise<string | null> {
  for (const model of ['claude-sonnet-4-6', 'claude-haiku-4-5-20251001'] as const) {
    try {
      const { text } = await invokeClaude(user, { system, model, timeoutMs: TIMEOUT })
      const body = text.trim()
      if (body.length > 80) return body
    } catch (e) {
      process.stdout.write(`[blog-gen] section ${model} failed: ${e instanceof Error ? e.message : e}\n`)
    }
  }
  return null
}

export async function generateArticle(plan: TopicPlan): Promise<GeneratedArticle | null> {
  // 1) Outline (Opus, JSON)
  const op = buildOutlinePrompt(plan)
  let outline: Outline
  try {
    const { text } = await invokeClaude(op.user, { system: op.system, model: 'claude-opus-4-8', timeoutMs: TIMEOUT })
    outline = parseClaudeJson<Outline>(text)
  } catch (e) {
    process.stdout.write(`[blog-gen] outline failed: ${e instanceof Error ? e.message : e}\n`)
    return null
  }
  if (!outline?.title || !Array.isArray(outline.sections) || outline.sections.length === 0) {
    process.stdout.write('[blog-gen] outline missing title/sections\n')
    return null
  }

  const title = outline.title.trim()
  const facts = plan.changelogFacts

  // 2) Hook
  const hp = buildHookPrompt(title, outline.hookBrief || plan.topic)
  const hook = (await writeSection(hp.system, hp.user)) ?? ''

  // 3) Mechanism ("そもそも仕組み")
  const mp = buildSectionPrompt(title, 'そもそもどう動くのか', outline.mechanismBrief || 'この記事の前提となる仕組みを噛み砕いて説明する。', facts)
  const mechanism = await writeSection(mp.system, mp.user)

  // 4) Body sections (sequential)
  const parts: string[] = []
  if (hook) parts.push(hook)
  if (mechanism) parts.push(`## そもそもどう動くのか {#how-it-works}\n\n${mechanism}`)

  let written = 0
  for (let i = 0; i < outline.sections.length; i++) {
    const s = outline.sections[i]
    const sp = buildSectionPrompt(title, s.h2, s.brief, facts)
    const body = await writeSection(sp.system, sp.user)
    if (!body) continue // drop a failed section, keep going
    const frag = sanitizeFragment(s.fragmentId, i)
    parts.push(`## ${s.h2.trim()} {#${frag}}\n\n${body}`)
    written++
  }
  if (written < 3) {
    process.stdout.write(`[blog-gen] only ${written} sections succeeded — aborting\n`)
    return null
  }

  // 5) Conclusion
  const cp = buildConclusionPrompt(title, outline.conclusionBrief || '要点を振り返り次の一歩を示す。')
  const conclusion = await writeSection(cp.system, cp.user)
  if (conclusion) parts.push(`## まとめ {#conclusion}\n\n${conclusion}`)

  const markdown = parts.join('\n\n')

  return {
    title,
    slugBase: sanitizeFragment(outline.slugBase, 0),
    metaDescription: (outline.metaDescription || '').slice(0, 160),
    metaKeywords: Array.isArray(outline.metaKeywords) ? outline.metaKeywords.slice(0, 8) : [],
    categoryTags: Array.isArray(outline.categoryTags) && outline.categoryTags.length
      ? outline.categoryTags.slice(0, 5)
      : ['Claude Code', 'AI', '生成AI'],
    markdown,
    kind: plan.kind,
  }
}
