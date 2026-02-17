/**
 * Slack WebAPI ラッパー + Block Kit ビルダー
 */

import { WebClient } from '@slack/web-api'
import type { Block, KnownBlock } from '@slack/types'

type SlackBlock = Block | KnownBlock

// ============================================================
// Client
// ============================================================

let slackClient: WebClient | null = null

function getSlackClient(): WebClient {
  if (slackClient) return slackClient

  const token = process.env.SLACK_BOT_TOKEN
  if (!token) {
    throw new Error('SLACK_BOT_TOKEN is required')
  }

  slackClient = new WebClient(token)
  return slackClient
}

// ============================================================
// メッセージ送信
// ============================================================

export async function sendMessage(params: {
  readonly channel: string
  readonly text: string
  readonly threadTs?: string
  readonly blocks?: readonly SlackBlock[]
}): Promise<string | undefined> {
  const client = getSlackClient()

  const result = await client.chat.postMessage({
    channel: params.channel,
    text: params.text,
    thread_ts: params.threadTs,
    blocks: params.blocks as SlackBlock[] | undefined,
  })

  return result.ts
}

export async function updateMessage(params: {
  readonly channel: string
  readonly ts: string
  readonly text: string
  readonly blocks?: readonly SlackBlock[]
}): Promise<void> {
  const client = getSlackClient()

  await client.chat.update({
    channel: params.channel,
    ts: params.ts,
    text: params.text,
    blocks: params.blocks as SlackBlock[] | undefined,
  })
}

// ============================================================
// ファイルアップロード
// ============================================================

export async function uploadFile(params: {
  readonly channelId: string
  readonly buffer: Buffer
  readonly filename: string
  readonly title?: string
  readonly threadTs?: string
  readonly initialComment?: string
}): Promise<string | undefined> {
  const client = getSlackClient()

  const uploadParams: any = {
    channel_id: params.channelId,
    file: params.buffer,
    filename: params.filename,
  }

  if (params.title) uploadParams.title = params.title
  if (params.threadTs) uploadParams.thread_ts = params.threadTs
  if (params.initialComment) uploadParams.initial_comment = params.initialComment

  const result = await client.filesUploadV2(uploadParams)

  return (result.files?.[0] as any)?.id
}

// ============================================================
// Block Kit ビルダー
// ============================================================

export function buildApprovalBlocks(params: {
  readonly title: string
  readonly previewText: string
  readonly actionId: string
  readonly actionType: 'post' | 'blog' | 'linkedin' | 'instagram_story'
}): readonly SlackBlock[] {
  const actionIdMap = {
    post: { approve: 'approve_post', reject: 'reject_post' },
    blog: { approve: 'approve_blog', reject: 'reject_blog' },
    linkedin: { approve: 'approve_linkedin', reject: 'reject_linkedin' },
    instagram_story: { approve: 'approve_instagram_story', reject: 'reject_instagram_story' },
  }
  const ids = actionIdMap[params.actionType]
  const approveActionId = ids.approve
  const rejectActionId = ids.reject

  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: params.title,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: params.previewText,
      },
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: 'Approve', emoji: true },
          action_id: approveActionId,
          value: params.actionId,
          style: 'primary',
        },
        {
          type: 'button',
          text: { type: 'plain_text', text: 'Edit', emoji: true },
          action_id: 'edit_action',
          value: params.actionId,
        },
        {
          type: 'button',
          text: { type: 'plain_text', text: 'Reject', emoji: true },
          action_id: rejectActionId,
          value: params.actionId,
          style: 'danger',
        },
      ],
    },
  ]
}

export function buildAnalyticsBlocks(params: {
  readonly title: string
  readonly body: string
}): readonly SlackBlock[] {
  return [
    {
      type: 'header',
      text: { type: 'plain_text', text: params.title, emoji: true },
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: params.body },
    },
  ]
}

export function buildSuggestionBlocks(params: {
  readonly suggestions: readonly {
    readonly title: string
    readonly description: string
    readonly actionId: string
  }[]
}): readonly SlackBlock[] {
  const blocks: SlackBlock[] = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: ':robot_face: *Today\'s Post Suggestions*',
      },
    },
    { type: 'divider' },
  ]

  for (const suggestion of params.suggestions) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${suggestion.title}*\n${suggestion.description}`,
      },
      accessory: {
        type: 'button',
        text: { type: 'plain_text', text: 'Create', emoji: true },
        action_id: 'create_suggested_post',
        value: suggestion.actionId,
      },
    })
  }

  blocks.push({
    type: 'actions',
    elements: [
      {
        type: 'button',
        text: { type: 'plain_text', text: 'Skip Today', emoji: true },
        action_id: 'skip_suggestions',
        value: 'skip',
      },
    ],
  })

  return blocks
}
