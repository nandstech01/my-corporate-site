/**
 * Command-center knowledge (Phase 4). Distills durable owner preferences/decisions
 * from 司令塔 conversations into Supabase, and recalls them to inject into future
 * Claude Code runs — so the assistant "learns me". Scope: command-center only.
 */

import { createClient } from '@supabase/supabase-js'
import { invokeClaude } from '@/lib/llm/claude-cli'

function sb() {
  const u = process.env.NEXT_PUBLIC_SUPABASE_URL
  const k = process.env.SUPABASE_SERVICE_ROLE_KEY
  return u && k ? createClient(u, k) : null
}

/** Most-recent durable knowledge as a bullet list, for prompt injection. */
export async function recallKnowledge(limit = 12): Promise<string> {
  const c = sb()
  if (!c) return ''
  try {
    const { data } = await c
      .from('command_knowledge')
      .select('content')
      .eq('source', 'command-center')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (!data?.length) return ''
    return data.map((r) => `- ${r.content as string}`).join('\n')
  } catch {
    return ''
  }
}

/** Extract ≤3 durable facts from one exchange and store them (best-effort, async). */
export async function distillAndSave(userText: string, resultText: string): Promise<void> {
  const c = sb()
  if (!c || !userText.trim()) return
  try {
    const prompt =
      `次は「NANDS司令塔」でのオーナー(私)とAIのやり取り。ここから、今後も役立つ「私の恒久的な嗜好・方針・決定・事実」だけを最大3件、それぞれ日本語1行で抽出してください。一時的な依頼・雑談・手順は除外。該当が無ければ NONE とだけ出力。\n\n` +
      `[私]\n${userText.slice(0, 1500)}\n\n[AIの結果]\n${(resultText || '(なし)').slice(0, 1500)}\n\n出力(箇条書きのみ):`
    const { text } = await invokeClaude(prompt, { timeoutMs: 60_000, retries: 0 })
    const lines = text
      .split('\n')
      .map((s) => s.replace(/^[-・*\d.\)\s]+/, '').trim())
      .filter(Boolean)
      .filter((s) => !/^none$/i.test(s))
    const rows = lines.slice(0, 3).map((content) => ({ content: content.slice(0, 500), source: 'command-center', tags: [] as string[] }))
    if (rows.length) await c.from('command_knowledge').insert(rows)
  } catch {
    /* best-effort: never break the run */
  }
}
