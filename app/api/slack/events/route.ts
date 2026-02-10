/**
 * Slack Events API ルート
 *
 * 3秒問題対策: waitUntil で即座に ack → バックグラウンドでエージェント実行
 */

import { NextRequest, NextResponse } from 'next/server'
import * as crypto from 'crypto'
import { runAgent } from '@/lib/slack-bot/agent-graph'
import { sendMessage } from '@/lib/slack-bot/slack-client'
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
// バックグラウンド処理
// ============================================================

async function processSlackMessage(event: SlackEventPayload['event']) {
  if (!event) return

  const { user, text, channel, ts, thread_ts } = event

  try {
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
    console.log('[slack-bot] Retry detected, skipping')
    return new Response('OK', { status: 200 })
  }

  // 3. HMAC SHA256 署名検証
  const signingSecret = process.env.SLACK_SIGNING_SECRET
  if (!signingSecret) {
    console.error('[slack-bot] SLACK_SIGNING_SECRET is not set')
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 },
    )
  }

  const timestamp = request.headers.get('x-slack-request-timestamp') ?? ''
  const signature = request.headers.get('x-slack-signature') ?? ''

  if (!verifySlackSignature(signingSecret, timestamp, rawBody, signature)) {
    console.error('[slack-bot] Invalid signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  console.log('[slack-bot] Signature verified, event type:', body.type)

  // 4. イベントタイプチェック
  if (body.type !== 'event_callback' || !body.event) {
    console.log('[slack-bot] Not event_callback, ignoring')
    return new Response('OK', { status: 200 })
  }

  const event = body.event
  console.log('[slack-bot] Event:', JSON.stringify({
    type: event.type,
    user: event.user,
    channel: event.channel,
    bot_id: event.bot_id,
    subtype: (event as Record<string, unknown>).subtype,
    text: event.text?.slice(0, 50),
  }))

  // Bot メッセージは無視 (ループ防止)
  if (event.bot_id || event.type !== 'message') {
    console.log('[slack-bot] Ignored: bot_id or not message type')
    return new Response('OK', { status: 200 })
  }

  // サブタイプ付きメッセージは無視 (edited, deleted 等)
  if ((event as Record<string, unknown>).subtype) {
    console.log('[slack-bot] Ignored: has subtype')
    return new Response('OK', { status: 200 })
  }

  // 5. ユーザー許可リスト検証
  if (!isAllowedUser(event.user)) {
    console.log('[slack-bot] User not allowed:', event.user)
    return new Response('OK', { status: 200 })
  }

  console.log('[slack-bot] Processing message from:', event.user)

  // 6. 即座に ack → バックグラウンドでエージェント実行
  // waitUntil はVercel環境でのみ利用可能。ローカルでは直接実行。
  const waitUntilFn = await import('@vercel/functions')
    .then((m) => m.waitUntil)
    .catch(() => null)

  if (waitUntilFn) {
    console.log('[slack-bot] Using waitUntil for background processing')
    waitUntilFn(processSlackMessage(event))
  } else {
    console.log('[slack-bot] No waitUntil, running directly')
    processSlackMessage(event).catch((err) =>
      console.error('[slack-bot] processSlackMessage error:', err),
    )
  }
  return new Response('OK', { status: 200 })
}
