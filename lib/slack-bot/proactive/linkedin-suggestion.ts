/**
 * LinkedIn 投稿提案 (LinkedIn Suggestion)
 *
 * GitHub Actions cron (火-日 01:00 UTC = JST 10:00) で実行
 *
 * 1. slack_bot_memory から直近24時間の linkedin_sources を recall
 * 2. 上位2-3件を Slack にサジェスション送信
 */

import { recallMemories } from '../memory'
import { sendMessage, buildSuggestionBlocks } from '../slack-client'

export async function runLinkedInSuggestion(): Promise<void> {
  const channel = process.env.SLACK_DEFAULT_CHANNEL
  const userId = process.env.SLACK_ALLOWED_USER_IDS?.split(',')[0]

  if (!channel || !userId) {
    throw new Error(
      'SLACK_DEFAULT_CHANNEL and SLACK_ALLOWED_USER_IDS are required',
    )
  }

  // 直近の linkedin_sources メモリを取得
  const memories = await recallMemories({
    slackUserId: userId,
    query: 'linkedin_sources',
    limit: 5,
  })

  if (memories.length === 0) {
    await sendMessage({
      channel,
      text: ':briefcase: LinkedIn: No fresh source data today. Run the source collector first.',
    })
    return
  }

  // メモリからサジェスションを構築
  const suggestions = memories.slice(0, 3).map((m, i) => {
    const content = m.content.slice(0, 200)
    return {
      title: `LinkedIn Topic #${i + 1}`,
      description: content,
      actionId: `linkedin_suggestion_${Date.now()}_${i}`,
    }
  })

  const blocks = buildSuggestionBlocks({ suggestions })

  // ヘッダーを LinkedIn 用に変更して送信
  await sendMessage({
    channel,
    text: ':briefcase: LinkedIn Post Suggestions',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: ':briefcase: *Today\'s LinkedIn Post Suggestions*\nSlackで「LinkedIn投稿作って」と送ると、以下のトピックをベースに投稿を生成するよ！',
        },
      },
      { type: 'divider' },
      ...blocks.slice(2), // Skip the original header and divider
    ],
  })
}
