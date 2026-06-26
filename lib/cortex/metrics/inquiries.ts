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

/** Insert an inquiry. Best-effort (logs + swallows errors so it never breaks the form). */
export async function recordInquiry(input: InquiryInput): Promise<void> {
  try {
    const sb = getSupabase()
    if (!sb) return
    await sb.from('inquiries').insert({
      source: input.source ?? 'general-contact',
      name: input.name ?? null,
      email: input.email ?? null,
      company: input.company ?? null,
      phone: input.phone ?? null,
      message: input.message ?? null,
      meta: input.meta ?? null,
    })
  } catch (e) {
    console.error('recordInquiry failed (non-blocking):', e instanceof Error ? e.message : e)
  }
}
