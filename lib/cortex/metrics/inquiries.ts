/**
 * Unified inquiry capture (司令塔「問い合わせ件数」用).
 * Contact forms call recordInquiry() in addition to their existing email/Sheets
 * flow, so inquiries become countable in Supabase. Best-effort: never throws.
 */

import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export interface InquiryInput {
  readonly source?: string
  readonly name?: string
  readonly email?: string
  readonly company?: string
  readonly phone?: string
  readonly message?: string
  readonly meta?: Record<string, unknown>
}

/** Instant Discord alert when an inquiry arrives (best-effort, no PII beyond name/company). */
async function notifyInquiry(input: InquiryInput): Promise<void> {
  const webhook = process.env.DISCORD_WEBHOOK_URL
  if (!webhook) return
  try {
    const jst = new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 16).replace('T', ' ')
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: '@here',
        embeds: [{
          title: '🟢 問い合わせ着信',
          description: `**${input.company || '—'}** / ${input.name || '—'}\nsource: ${input.source ?? 'general-contact'}\n${jst} JST`,
          color: 0x3ddc91,
          footer: { text: 'CORTEX 司令塔 by NANDS' },
        }],
      }),
    })
  } catch (e) {
    console.error('notifyInquiry failed (non-blocking):', e instanceof Error ? e.message : e)
  }
}

/**
 * Insert an inquiry + (optionally) fire an instant Discord alert.
 * Best-effort (never breaks the form). Pass { notify:false } when the caller
 * already sends its own Discord notification (e.g. system-dev-lead → notifyNewLead).
 */
export async function recordInquiry(input: InquiryInput, opts: { notify?: boolean } = {}): Promise<void> {
  try {
    const sb = getSupabase()
    if (sb) {
      await sb.from('inquiries').insert({
        source: input.source ?? 'general-contact',
        name: input.name ?? null,
        email: input.email ?? null,
        company: input.company ?? null,
        phone: input.phone ?? null,
        message: input.message ?? null,
        meta: input.meta ?? null,
      })
    }
  } catch (e) {
    console.error('recordInquiry insert failed (non-blocking):', e instanceof Error ? e.message : e)
  }
  if (opts.notify !== false) await notifyInquiry(input)
}
