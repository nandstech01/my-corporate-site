import { NextResponse } from 'next/server'
import { invokeClaude } from '@/lib/llm/claude-cli'
import { computeCommandMetrics } from '@/lib/cortex/metrics/command-metrics'
import { computeCommandIntel } from '@/lib/cortex/metrics/command-intel'
import { recallKnowledge, distillAndSave } from '@/lib/command-center/knowledge'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Msg = { role: 'user' | 'assistant'; content: string }

function buildContext(
  m: Awaited<ReturnType<typeof computeCommandMetrics>> | null,
  intel: Awaited<ReturnType<typeof computeCommandIntel>> | null,
): string {
  // One unambiguous "label: 数値 単位" per line so the model never mixes metrics.
  const lines: string[] = []
  if (m) {
    const p = m.postsToday
    lines.push(`本日の自動投稿数: ${p.total} 件 (内訳 X ${p.x}件 / Threads ${p.threads}件 / ブログ ${p.blog}件 / クロス投稿 ${p.crosspost}件)`)
    lines.push(`本日の問い合わせ数: ${m.inquiriesToday} 件`)
    lines.push(`閲覧数(最新の集計日 ${m.viewsLatest.date || '不明'}): 合計 ${m.viewsLatest.total} (内訳 GA4セッション ${m.viewsLatest.ga4Sessions} ＋ GSC表示回数 ${m.viewsLatest.gscImpressions})`)
    lines.push(`直近7日合計 — 投稿数: ${m.totals7d.posts} 件 / 閲覧数: ${m.totals7d.views} / 問い合わせ数: ${m.totals7d.inquiries} 件`)
    lines.push(`最新の問い合わせ: ${m.latestInquiry ? `${m.latestInquiry.name ?? '匿名'} (経路 ${m.latestInquiry.source})` : 'なし'}`)
  }
  if (intel) {
    lines.push(`公式Claude Code最新版: ${intel.claudeCodeNews ? `${intel.claudeCodeNews.title}${intel.claudeCodeNews.isNew ? '（新着）' : ''} — ${intel.claudeCodeNews.summary.slice(0, 120)}` : '取得中'}`)
    lines.push(`SEOの次の一手: ${intel.nextAction.topOpportunity ? `「${intel.nextAction.topOpportunity.query}」 ${intel.nextAction.topOpportunity.reason}` : 'データ蓄積中'}`)
    const stale = intel.cronHealth.filter((j) => j.status === 'stale').map((j) => j.label)
    lines.push(`停滞中の自動運用: ${stale.length ? stale.join('・') : 'なし（全て正常）'}`)
  }
  return lines.join('\n') || '(データ取得中)'
}

export async function POST(req: Request) {
  let messages: Msg[] = []
  try {
    const body = (await req.json()) as { messages?: Msg[] }
    messages = (body.messages ?? []).slice(-12)
  } catch {
    return NextResponse.json({ error: 'bad request' }, { status: 400 })
  }
  const lastUser = [...messages].reverse().find((x) => x.role === 'user')?.content ?? ''
  if (!lastUser) return NextResponse.json({ error: 'empty' }, { status: 400 })

  const [m, intel, mem] = await Promise.all([
    computeCommandMetrics().catch(() => null),
    computeCommandIntel().catch(() => null),
    recallKnowledge(10).catch(() => ''),
  ])

  const system =
    `あなたはNANDSの司令塔に常駐するAI相棒「CORTEX」。オーナー(私)の相棒として、SNS自動運用の近況報告や相談に、LINEのチャットのように親しみやすく簡潔に答える(2〜4文、長くしない)。絵文字は控えめに可。\n\n` +
    `【数字ルール（厳守）】\n` +
    `- 数値は下の[データ]に明示された値だけを使う。書かれていない数字は決して作らない・概算しない。\n` +
    `- 各数値は[データ]のラベルと正確に対応させる。指標(投稿数/閲覧数/問い合わせ数)を絶対に混同しない。単位(件など)もデータ通りに。\n` +
    `- 該当データが無い項目は「データなし」と正直に言う。1つの文の中で違う指標の数字を混ぜない。\n` +
    `- 「閲覧数」はGA4セッション＋GSC表示回数の合算であり、問い合わせ数とは無関係。閲覧数を聞かれたら原則この合計で答える。\n` +
    `- 装飾記号やマークダウン(**、#、- 等)は使わず、プレーンな日本語の文章で話す（箇条書きが必要なら「・」を文中で使う程度）。\n\n` +
    `[データ]\n${buildContext(m, intel)}\n\n[学習済みの私(オーナー)の方針]\n${mem || '(まだなし)'}`

  const convo = messages.map((x) => `${x.role === 'user' ? '私' : 'CORTEX'}: ${x.content}`).join('\n')
  const prompt = `${convo}\nCORTEX:`

  try {
    const { text } = await invokeClaude(prompt, { system, timeoutMs: 60_000, retries: 1 })
    // Bubbles render plain text → strip any markdown the model emits (**, #, leading -).
    const clean = (text || '')
      .replace(/\*\*/g, '')
      .replace(/(^|\n)\s*#{1,6}\s*/g, '$1')
      .replace(/(^|\n)\s*[-*]\s+/g, '$1・')
      .trim()
    const reply = clean || 'うまく聞き取れませんでした。もう一度お願いします。'
    void distillAndSave(lastUser, reply)
    return NextResponse.json({ reply })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'chat failed' }, { status: 500 })
  }
}
