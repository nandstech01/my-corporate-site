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
    `あなたはNANDSの司令塔に常駐するAI相棒「CORTEX」。あなた自身がClaude Code。オーナー(私)の発話を1回で判定し、JSONだけを返す。\n\n` +
    `【判定】\n` +
    `- 近況/雑談/質問/数値確認 = "chat"。会話で答える(reply)。\n` +
    `- ファイル/コード/コマンド/調査/実装/修正などの「作業依頼」 = "act"。本物のClaude Codeを起動する。\n` +
    `  - act時: say(着手の一言, 例「了解、READMEを読んで要点まとめるね」), task(Claude Codeへの具体的な実行指示・日本語可), perm を決める。\n` +
    `  - perm: 調査・読み取り・確認だけ = "plan" / ファイル編集や実装 = "acceptEdits" / 全部任せる明示があれば = "bypassPermissions"。迷ったら "plan"。\n\n` +
    `【chatのreply 数字ルール（厳守）】\n` +
    `- 数値は下の[データ]に明示された値だけを使う。書かれていない数字は作らない・概算しない。\n` +
    `- 指標(投稿数/閲覧数/問い合わせ数)を混同しない。単位もデータ通り。無い項目は「データなし」と言う。\n` +
    `- 「閲覧数」はGA4セッション＋GSC表示回数の合算。装飾記号やマークダウンは使わずプレーンな日本語。簡潔に2〜4文。\n\n` +
    `【出力】次のJSONのみ(前後に何も付けない): {"mode":"chat"|"act","reply":"chat時の返答","say":"act時の一言","task":"act時の実行指示","perm":"plan|acceptEdits|bypassPermissions"}\n\n` +
    `[データ]\n${buildContext(m, intel)}\n\n[学習済みの私(オーナー)の方針]\n${mem || '(まだなし)'}`

  const convo = messages.map((x) => `${x.role === 'user' ? '私' : 'CORTEX'}: ${x.content}`).join('\n')
  const prompt = `${convo}\n\n上記の最後の「私」の発話を判定し、JSONのみ出力:`

  const plain = (s: string) => (s || '').replace(/\*\*/g, '').replace(/(^|\n)\s*#{1,6}\s*/g, '$1').trim()

  try {
    const { text } = await invokeClaude(prompt, { system, timeoutMs: 60_000, retries: 1 })
    // Parse the router JSON (tolerate code fences / surrounding prose).
    let parsed: { mode?: string; reply?: string; say?: string; task?: string; perm?: string } = {}
    const match = (text || '').match(/\{[\s\S]*\}/)
    if (match) { try { parsed = JSON.parse(match[0]) } catch { /* fall through */ } }

    if (parsed.mode === 'act' && parsed.task) {
      const perm = parsed.perm === 'acceptEdits' || parsed.perm === 'bypassPermissions' ? parsed.perm : 'plan'
      const say = plain(parsed.say || '了解、やります。')
      void distillAndSave(lastUser, say)
      return NextResponse.json({ mode: 'act', say, task: parsed.task, perm })
    }

    const reply = plain(parsed.reply || text) || 'うまく聞き取れませんでした。もう一度お願いします。'
    void distillAndSave(lastUser, reply)
    return NextResponse.json({ mode: 'chat', reply })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'chat failed' }, { status: 500 })
  }
}
