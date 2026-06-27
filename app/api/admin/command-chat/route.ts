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
  const lines: string[] = []
  if (m) {
    const p = m.postsToday
    lines.push(`本日の自動投稿: 合計${p.total}(X${p.x}/Threads${p.threads}/ブログ${p.blog}/クロス${p.crosspost})`)
    lines.push(`閲覧(最新日): ${m.viewsLatest.total}(GA4${m.viewsLatest.ga4Sessions}+GSC表示${m.viewsLatest.gscImpressions})`)
    lines.push(`本日の問い合わせ: ${m.inquiriesToday}件 / 直近7日: 投稿${m.totals7d.posts}・閲覧${m.totals7d.views}・問い合わせ${m.totals7d.inquiries}`)
    if (m.latestInquiry) lines.push(`最新の問い合わせ: ${m.latestInquiry.name ?? '匿名'}(${m.latestInquiry.source})`)
  }
  if (intel) {
    if (intel.claudeCodeNews) lines.push(`公式Claude Code最新: ${intel.claudeCodeNews.title}${intel.claudeCodeNews.isNew ? '（新着）' : ''} — ${intel.claudeCodeNews.summary.slice(0, 120)}`)
    if (intel.nextAction.topOpportunity) lines.push(`次の一手(SEO): 「${intel.nextAction.topOpportunity.query}」 ${intel.nextAction.topOpportunity.reason}`)
    const stale = intel.cronHealth.filter((j) => j.status === 'stale').map((j) => j.label)
    if (stale.length) lines.push(`⚠️ 停滞中: ${stale.join('・')}`)
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
    `あなたはNANDSの司令塔に常駐するAI相棒「CORTEX」。オーナー(私)の相棒として、SNS自動運用の近況報告や相談に、LINEのチャットのように親しみやすく簡潔に答える(2〜4文、長くしない)。` +
    `絵文字は控えめに可。憶測せず、下のリアルタイム状況と学習済み方針に基づいて話す。数字を聞かれたら具体的に答える。\n\n` +
    `[リアルタイム状況]\n${buildContext(m, intel)}\n\n[学習済みの私(オーナー)の方針]\n${mem || '(まだなし)'}`

  const convo = messages.map((x) => `${x.role === 'user' ? '私' : 'CORTEX'}: ${x.content}`).join('\n')
  const prompt = `${convo}\nCORTEX:`

  try {
    const { text } = await invokeClaude(prompt, { system, timeoutMs: 60_000, retries: 1 })
    const reply = (text || '').trim() || 'うまく聞き取れませんでした。もう一度お願いします。'
    void distillAndSave(lastUser, reply)
    return NextResponse.json({ reply })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'chat failed' }, { status: 500 })
  }
}
