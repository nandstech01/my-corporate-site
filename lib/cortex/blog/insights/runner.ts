/**
 * Daily SEO data collection runner: GSC + GA4 → Supabase.
 * On Mondays (JST), also posts a Discord SEO summary (opportunities) so the
 * user can act on strike-distance / rising-demand / title-improvement chances.
 */

import { collectGsc } from './gsc-collector'
import { collectGa4 } from './ga4-collector'

async function notify(title: string, body: string): Promise<void> {
  const webhook = process.env.DISCORD_WEBHOOK_URL
  if (!webhook) { process.stdout.write(`[seo] (no webhook) ${title}: ${body}\n`); return }
  try {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [{ title, description: body.slice(0, 1800), color: 0x4285f4, footer: { text: 'CORTEX SEO by NANDS' } }] }),
    })
  } catch { /* best-effort */ }
}

function isMondayJst(): boolean {
  const jst = new Date(Date.now() + 9 * 3600_000)
  return jst.getUTCDay() === 1
}

export async function runSeoCollect(): Promise<void> {
  process.stdout.write('\n=== SEO Collect (GSC + GA4) ===\n')

  const gsc = await collectGsc(3)
  const ga4 = await collectGa4(1)
  process.stdout.write(`[seo] gsc=${gsc.pages}(${gsc.error ?? 'ok'}) ga4=${ga4.pages}(${ga4.error ?? 'ok'})\n`)

  // Surface a setup warning once if credentials are missing (so it's not silent).
  if (gsc.error?.includes('未設定') || ga4.error?.includes('未設定')) {
    await notify('⚠️ SEO収集: 認証未設定', `GSC/GA4のサービスアカウント未設定のため収集スキップ。GSC_CREDENTIALS_JSON / GA4_PROPERTY_ID を設定してください。`)
    return
  }

  // Weekly summary (Mondays JST)
  if (isMondayJst()) {
    try {
      const { computeSeoInsights } = await import('./seo-insights')
      const ins = await computeSeoInsights()
      if (ins.opportunities.length === 0) {
        await notify('📊 週次SEOサマリ', 'まだ十分なGSCデータがありません（蓄積中）。')
      } else {
        const top = ins.opportunities.slice(0, 8)
          .map((o) => `・[${o.kind}] ${o.query} — ${o.reason}${o.pagePath ? ` (${o.pagePath})` : ''}`)
          .join('\n')
        await notify('📊 週次SEOサマリ（機会トップ）', `${top}\n\n需要クエリ: ${ins.demandQueries.slice(0, 8).join(' / ')}`)
      }
    } catch (e) {
      process.stdout.write(`[seo] summary failed: ${e instanceof Error ? e.message : e}\n`)
    }
  }
}
