/**
 * LINE Harness Slack Bot ツール定義 (5ツール)
 *
 * LangGraph ReAct エージェントにバインドする LINE 操作用 LangChain ツール群。
 * 既存の @line-harness/sdk クライアントを使用。
 */

import { z } from 'zod'
import { tool } from '@langchain/core/tools'
import { getLineHarnessClient, isLineHarnessConfigured } from './client'
import { createPendingAction } from '@/lib/slack-bot/memory'
import { sendMessage, buildApprovalBlocks } from '@/lib/slack-bot/slack-client'
import type { AgentContext } from '@/lib/slack-bot/types'

// ============================================================
// ツール生成 (AgentContextをクロージャで注入)
// ============================================================

export function createLineHarnessTools(ctx: AgentContext) {
  // ----------------------------------------------------------
  // 1. broadcast_to_line: 全LINE友だちにテキスト一斉送信 (HITL)
  // ----------------------------------------------------------
  // @ts-expect-error TS2589: LangChain tool() deep type instantiation with Zod
  const broadcastToLineTool = tool(
    async (input) => {
      try {
        if (!isLineHarnessConfigured()) {
          return JSON.stringify({
            success: false,
            error: 'LINE Harness is not configured. Set LINE_HARNESS_API_URL and LINE_HARNESS_API_KEY.',
          })
        }

        const client = getLineHarnessClient()
        const friendCount = await client.friends.count()

        const action = await createPendingAction({
          slackChannelId: ctx.slackChannelId,
          slackUserId: ctx.slackUserId,
          slackThreadTs: ctx.slackThreadTs,
          // Cast needed: action_type union doesn't include LINE types yet
          actionType: 'post_x' as 'post_x',
          payload: {
            type: 'line_broadcast',
            message: input.message,
            friendCount,
          },
          previewText: input.message,
        })

        const blocks = buildApprovalBlocks({
          title: `:speech_balloon: *LINE Broadcast Preview* (${friendCount} friends)`,
          previewText: input.message.length > 500
            ? `${input.message.slice(0, 500)}...`
            : input.message,
          actionId: action.id,
          actionType: 'post',
        })

        await sendMessage({
          channel: ctx.slackChannelId,
          text: `LINE Broadcast Preview: ${input.message.slice(0, 100)}...`,
          threadTs: ctx.slackThreadTs ?? undefined,
          blocks,
        })

        return JSON.stringify({
          success: true,
          message: `Approval request sent for LINE broadcast to ${friendCount} friends. Waiting for confirmation.`,
          actionId: action.id,
          friendCount,
        })
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error'
        return JSON.stringify({ success: false, error: message })
      }
    },
    {
      name: 'broadcast_to_line',
      description:
        'LINE友だち全員にテキストメッセージを一斉送信する。送信前にSlackの承認ボタンで確認を求める（HITL）。',
      schema: z.object({
        message: z.string().describe('送信するメッセージテキスト'),
      }),
    },
  )

  // ----------------------------------------------------------
  // 2. segment_broadcast: タグセグメント別送信 (HITL)
  // ----------------------------------------------------------
  // @ts-expect-error TS2589: LangChain tool() deep type instantiation with Zod
  const segmentBroadcastTool = tool(
    async (input) => {
      try {
        if (!isLineHarnessConfigured()) {
          return JSON.stringify({
            success: false,
            error: 'LINE Harness is not configured. Set LINE_HARNESS_API_URL and LINE_HARNESS_API_KEY.',
          })
        }

        const client = getLineHarnessClient()
        const tags = await client.tags.list()
        const targetTag = tags.find(
          (t) => t.name.toLowerCase() === input.tagName.toLowerCase(),
        )

        if (!targetTag) {
          const available = tags.map((t) => t.name).join(', ')
          return JSON.stringify({
            success: false,
            error: `Tag "${input.tagName}" not found. Available tags: ${available}`,
          })
        }

        const action = await createPendingAction({
          slackChannelId: ctx.slackChannelId,
          slackUserId: ctx.slackUserId,
          slackThreadTs: ctx.slackThreadTs,
          actionType: 'post_x' as 'post_x',
          payload: {
            type: 'line_segment_broadcast',
            tagId: targetTag.id,
            tagName: targetTag.name,
            message: input.message,
            messageType: input.messageType ?? 'text',
          },
          previewText: input.message,
        })

        const blocks = buildApprovalBlocks({
          title: `:label: *LINE Segment Broadcast Preview*\nTag: \`${targetTag.name}\` | Type: ${input.messageType ?? 'text'}`,
          previewText: input.message.length > 500
            ? `${input.message.slice(0, 500)}...`
            : input.message,
          actionId: action.id,
          actionType: 'post',
        })

        await sendMessage({
          channel: ctx.slackChannelId,
          text: `LINE Segment Broadcast to "${targetTag.name}": ${input.message.slice(0, 100)}...`,
          threadTs: ctx.slackThreadTs ?? undefined,
          blocks,
        })

        return JSON.stringify({
          success: true,
          message: `Approval request sent for segment broadcast to tag "${targetTag.name}". Waiting for confirmation.`,
          actionId: action.id,
          tagName: targetTag.name,
        })
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error'
        return JSON.stringify({ success: false, error: message })
      }
    },
    {
      name: 'segment_broadcast',
      description:
        '特定のタグセグメントのLINE友だちにメッセージを送信する。送信前にSlack承認あり（HITL）。',
      schema: z.object({
        tagName: z.string().describe('送信先タグ名'),
        message: z.string().describe('送信するメッセージテキスト'),
        messageType: z
          .enum(['text', 'flex'])
          .optional()
          .default('text')
          .describe('メッセージタイプ（text or flex）'),
      }),
    },
  )

  // ----------------------------------------------------------
  // 3. get_line_analytics: LINE分析データ取得
  // ----------------------------------------------------------
  // @ts-expect-error TS2589: LangChain tool() deep type instantiation with Zod
  const getLineAnalyticsTool = tool(
    async () => {
      try {
        if (!isLineHarnessConfigured()) {
          return JSON.stringify({
            success: false,
            error: 'LINE Harness is not configured. Set LINE_HARNESS_API_URL and LINE_HARNESS_API_KEY.',
          })
        }

        const client = getLineHarnessClient()

        const [friendCount, tags, friends] = await Promise.all([
          client.friends.count(),
          client.tags.list(),
          client.friends.list({ limit: 1000 }),
        ])

        // Tag distribution: count friends per tag
        const tagCountMap = new Map<string, number>()
        for (const friend of friends.data) {
          const friendTags = (friend as Record<string, unknown>).tags as string[] | undefined
          if (friendTags) {
            for (const tagName of friendTags) {
              tagCountMap.set(tagName, (tagCountMap.get(tagName) ?? 0) + 1)
            }
          }
        }

        const tagDistribution = tags.map((t) => ({
          name: t.name,
          count: tagCountMap.get(t.name) ?? 0,
        }))

        // Score tiers based on friend scores
        const scoreTiers = { cold: 0, warm: 0, hot: 0 }
        for (const friend of friends.data) {
          const score = (friend as Record<string, unknown>).score as number | undefined
          const s = score ?? 0
          if (s >= 100) {
            scoreTiers.hot += 1
          } else if (s >= 30) {
            scoreTiers.warm += 1
          } else {
            scoreTiers.cold += 1
          }
        }

        return JSON.stringify({
          success: true,
          friendCount,
          tagDistribution,
          scoreTiers,
        })
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error'
        return JSON.stringify({ success: false, error: message })
      }
    },
    {
      name: 'get_line_analytics',
      description:
        'LINE友だち数、タグ分布、スコア分布（cold/warm/hot）を取得する。',
      schema: z.object({}),
    },
  )

  // ----------------------------------------------------------
  // 4. create_scenario: ステップ配信シナリオ作成
  // ----------------------------------------------------------
  // @ts-expect-error TS2589: LangChain tool() deep type instantiation with Zod
  const createScenarioTool = tool(
    async (input) => {
      try {
        if (!isLineHarnessConfigured()) {
          return JSON.stringify({
            success: false,
            error: 'LINE Harness is not configured. Set LINE_HARNESS_API_URL and LINE_HARNESS_API_KEY.',
          })
        }

        const client = getLineHarnessClient()

        const steps = input.steps.map((step) => ({
          delayMinutes: step.delayMinutes,
          messageType: 'text' as const,
          content: { text: step.message },
        }))

        const scenario = await client.createStepScenario(
          input.name,
          input.triggerType,
          steps,
        )

        return JSON.stringify({
          success: true,
          scenario: {
            id: scenario.id,
            name: scenario.name,
            triggerType: input.triggerType,
            stepCount: steps.length,
          },
          message: `Scenario "${input.name}" created with ${steps.length} steps.`,
        })
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error'
        return JSON.stringify({ success: false, error: message })
      }
    },
    {
      name: 'create_scenario',
      description:
        'LINEステップ配信シナリオを作成する。トリガータイプと配信ステップを指定。',
      schema: z.object({
        name: z.string().describe('シナリオ名'),
        triggerType: z
          .enum(['friend_add', 'tag_added', 'manual'])
          .describe('トリガータイプ'),
        steps: z
          .array(
            z.object({
              delayMinutes: z.number().describe('前ステップからの遅延（分）'),
              message: z.string().describe('送信メッセージテキスト'),
            }),
          )
          .describe('配信ステップ配列'),
      }),
    },
  )

  // ----------------------------------------------------------
  // 5. switch_rich_menu: リッチメニュー切替
  // ----------------------------------------------------------
  // @ts-expect-error TS2589: LangChain tool() deep type instantiation with Zod
  const switchRichMenuTool = tool(
    async (input) => {
      try {
        if (!isLineHarnessConfigured()) {
          return JSON.stringify({
            success: false,
            error: 'LINE Harness is not configured. Set LINE_HARNESS_API_URL and LINE_HARNESS_API_KEY.',
          })
        }

        const client = getLineHarnessClient()

        // Verify the rich menu exists
        const richMenus = await client.richMenus.list()
        const targetMenu = richMenus.find((m) => m.id === input.richMenuId)

        if (!targetMenu) {
          const available = richMenus
            .map((m) => `${m.id} (${(m as Record<string, unknown>).name ?? 'unnamed'})`)
            .join(', ')
          return JSON.stringify({
            success: false,
            error: `Rich menu "${input.richMenuId}" not found. Available: ${available}`,
          })
        }

        if (input.friendId) {
          // Set for specific user
          await client.friends.setRichMenu(input.friendId, input.richMenuId)
          return JSON.stringify({
            success: true,
            message: `Rich menu switched to "${(targetMenu as Record<string, unknown>).name ?? input.richMenuId}" for friend ${input.friendId}.`,
            richMenuId: input.richMenuId,
            friendId: input.friendId,
          })
        }

        // Set as default (apply to all friends without a specific menu)
        const friends = await client.friends.list({ limit: 1000 })
        let updatedCount = 0
        for (const friend of friends.data) {
          await client.friends.setRichMenu(
            (friend as Record<string, unknown>).id as string,
            input.richMenuId,
          )
          updatedCount += 1
        }

        return JSON.stringify({
          success: true,
          message: `Rich menu "${(targetMenu as Record<string, unknown>).name ?? input.richMenuId}" set as default for ${updatedCount} friends.`,
          richMenuId: input.richMenuId,
          updatedCount,
        })
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error'
        return JSON.stringify({ success: false, error: message })
      }
    },
    {
      name: 'switch_rich_menu',
      description:
        'リッチメニューを切り替える。friendIdを指定すると特定ユーザーのみ、省略すると全友だちに適用。',
      schema: z.object({
        richMenuId: z.string().describe('適用するリッチメニューID'),
        friendId: z
          .string()
          .optional()
          .describe('特定友だちID（省略時は全員に適用）'),
      }),
    },
  )

  return [
    broadcastToLineTool,
    segmentBroadcastTool,
    getLineAnalyticsTool,
    createScenarioTool,
    switchRichMenuTool,
  ]
}
