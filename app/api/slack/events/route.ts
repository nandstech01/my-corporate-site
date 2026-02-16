/**
 * Slack Events API ルート
 *
 * 3秒問題対策: waitUntil で即座に ack → バックグラウンドでエージェント実行
 */

import { NextRequest, NextResponse } from 'next/server'
import * as crypto from 'crypto'
import { ChatOpenAI } from '@langchain/openai'
import { runAgent } from '@/lib/slack-bot/agent-graph'
import { sendMessage, buildApprovalBlocks } from '@/lib/slack-bot/slack-client'
import {
  getPendingEditForThread,
  resolvePendingAction,
  createPendingAction,
} from '@/lib/slack-bot/memory'
import type { SlackEventPayload } from '@/lib/slack-bot/types'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

// ============================================================
// Slack HMAC SHA256 署名検証
// ============================================================

function verifySlackSignature(
  signingSecret: string,
  timestamp: string,
  body: string,
  signature: string,
): boolean {
  const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 60 * 5
  if (parseInt(timestamp, 10) < fiveMinutesAgo) {
    return false
  }

  const sigBasestring = `v0:${timestamp}:${body}`
  const hmac = crypto.createHmac('sha256', signingSecret)
  hmac.update(sigBasestring)
  const mySignature = `v0=${hmac.digest('hex')}`

  return crypto.timingSafeEqual(
    Buffer.from(mySignature),
    Buffer.from(signature),
  )
}

// ============================================================
// ユーザー許可リスト検証
// ============================================================

function isAllowedUser(userId: string): boolean {
  const allowed = process.env.SLACK_ALLOWED_USER_IDS
  if (!allowed) return false
  return allowed.split(',').includes(userId)
}

// ============================================================
// Edit フロー処理
// ============================================================

async function processEditInstruction(
  event: NonNullable<SlackEventPayload['event']>,
  pendingAction: {
    readonly id: string
    readonly slack_channel_id: string
    readonly slack_user_id: string
    readonly slack_thread_ts: string | null
    readonly payload: Record<string, unknown>
    readonly action_type: string
  },
): Promise<void> {
  const { text, channel, ts, thread_ts } = event
  const originalText = (pendingAction.payload.text as string) ?? ''
  const editInstruction = text

  // LLMで編集
  const model = new ChatOpenAI({
    modelName: 'gpt-4o',
    temperature: 0.7,
    apiKey: process.env.OPENAI_API_KEY,
  })

  const response = await model.invoke([
    {
      role: 'system',
      content: `あなたはX (Twitter) 投稿の編集者。ユーザーの編集指示に従って投稿文を修正して。
修正後の投稿文のみ出力して。説明は不要。280文字以内。`,
    },
    {
      role: 'user',
      content: `【元の投稿文】
${originalText}

【編集指示】
${editInstruction}

修正後の投稿文:`,
    },
  ])

  const editedText =
    typeof response.content === 'string'
      ? response.content
      : JSON.stringify(response.content)

  // 元のアクションを rejected にする
  await resolvePendingAction(pendingAction.id, 'rejected')

  // 新しい pending action を作成
  const isLong = pendingAction.action_type === 'post_x_long'
  const newAction = await createPendingAction({
    slackChannelId: channel,
    slackUserId: pendingAction.slack_user_id,
    slackThreadTs: thread_ts ?? ts,
    actionType: isLong ? 'post_x_long' : 'post_x',
    payload: { text: editedText, longForm: isLong },
    previewText: editedText,
  })

  // 新しい承認ボタンを表示
  const blocks = buildApprovalBlocks({
    title: ':pencil: *Edited X Post Preview*',
    previewText:
      editedText.length > 500
        ? `${editedText.slice(0, 500)}...`
        : editedText,
    actionId: newAction.id,
    actionType: 'post',
  })

  await sendMessage({
    channel,
    text: `Edited post: ${editedText.slice(0, 100)}...`,
    threadTs: thread_ts ?? ts,
    blocks,
  })
}

// ============================================================
// バックグラウンド処理
// ============================================================

async function processSlackMessage(
  event: NonNullable<SlackEventPayload['event']>,
) {
  const { user, text, channel, ts, thread_ts } = event

  try {
    // Edit フロー: このスレッドに編集待ちの pending action があるか確認
    const threadTs = thread_ts ?? ts
    if (threadTs) {
      const pendingEdit = await getPendingEditForThread({
        slackChannelId: channel,
        slackThreadTs: threadTs,
      })

      if (pendingEdit) {
        await processEditInstruction(event, pendingEdit)
        return
      }
    }

    // 通常フロー: エージェント実行
    const response = await runAgent({
      message: text,
      slackChannelId: channel,
      slackUserId: user,
      slackThreadTs: thread_ts ?? ts,
    })

    await sendMessage({
      channel,
      text: response,
      threadTs: thread_ts ?? ts,
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'

    await sendMessage({
      channel,
      text: `:warning: Error: ${errorMessage}`,
      threadTs: thread_ts ?? ts,
    })
  }
}

// ============================================================
// Route Handler
// ============================================================

export async function POST(request: NextRequest) {
  // 署名検証用の raw body
  const rawBody = await request.text()
  let body: SlackEventPayload

  try {
    body = JSON.parse(rawBody) as SlackEventPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // 1. URL verification (Slack App 初回設定時)
  if (body.type === 'url_verification') {
    return NextResponse.json({ challenge: body.challenge })
  }

  // 2. リトライ防止 (Slack は3秒超でリトライする)
  if (request.headers.get('x-slack-retry-num')) {
    return new Response('OK', { status: 200 })
  }

  // 3. HMAC SHA256 署名検証
  const signingSecret = process.env.SLACK_SIGNING_SECRET
  if (!signingSecret) {
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 },
    )
  }

  const timestamp = request.headers.get('x-slack-request-timestamp') ?? ''
  const signature = request.headers.get('x-slack-signature') ?? ''

  if (!verifySlackSignature(signingSecret, timestamp, rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // 4. イベントタイプチェック
  if (body.type !== 'event_callback' || !body.event) {
    return new Response('OK', { status: 200 })
  }

  const event = body.event

  // Bot メッセージは無視 (ループ防止)
  if (event.bot_id || event.type !== 'message') {
    return new Response('OK', { status: 200 })
  }

  // サブタイプ付きメッセージは無視 (edited, deleted 等)
  if ((event as unknown as Record<string, unknown>).subtype) {
    return new Response('OK', { status: 200 })
  }

  // 5. ユーザー許可リスト検証
  if (!isAllowedUser(event.user)) {
    return new Response('OK', { status: 200 })
  }

  // 6. 即座に ack → バックグラウンドでエージェント実行
  const waitUntilFn = await import('@vercel/functions')
    .then((m) => m.waitUntil)
    .catch(() => null)

  if (waitUntilFn) {
    waitUntilFn(processSlackMessage(event))
  } else {
    processSlackMessage(event).catch(() => {})
  }

  return new Response('OK', { status: 200 })
}
