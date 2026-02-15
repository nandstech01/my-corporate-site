/**
 * トレンドトピック分析
 *
 * GPT-4o-mini でトレンド記事を「今バズっているトピック」の
 * 日本語サマリーに変換する。1回のLLMコールで完了。
 */

import { z } from 'zod'
import { ChatOpenAI } from '@langchain/openai'
import type { TrendingStory } from './trending-client'

// ============================================================
// 型定義
// ============================================================

const TrendingTopicSummarySchema = z.object({
  hotTopics: z.array(z.string()).min(1).max(5),
  discussionAngles: z.array(z.string()).min(1).max(5),
  keyTalkingPoints: z.array(z.string()).min(1).max(5),
  summaryText: z.string(),
})

export type TrendingTopicSummary = z.infer<typeof TrendingTopicSummarySchema>

// ============================================================
// LLMモデル
// ============================================================

function createMiniModel() {
  return new ChatOpenAI({
    modelName: 'gpt-4o-mini',
    temperature: 0.3,
    apiKey: process.env.OPENAI_API_KEY,
  })
}

// ============================================================
// メイン分析関数
// ============================================================

export async function analyzeTrendingTopics(
  stories: readonly TrendingStory[],
): Promise<TrendingTopicSummary> {
  const model = createMiniModel()

  const top15 = stories.slice(0, 15)

  const storyList = top15
    .map(
      (s, i) =>
        `${i + 1}. [${s.source}] ${s.title} (${s.points}pt, ${s.comments}comments)`,
    )
    .join('\n')

  const response = await model.invoke([
    {
      role: 'system' as const,
      content: `あなたはAI/テック業界のトレンド分析者です。
以下のHacker News / Dev.to のトレンド記事リストから、
「今AIコミュニティで話題のトピック」を日本語で要約してください。

JSON形式のみで出力:
{
  "hotTopics": ["話題1", "話題2", ...],
  "discussionAngles": ["議論を呼ぶ切り口1", "切り口2", ...],
  "keyTalkingPoints": ["具体的な言及ポイント1", "ポイント2", ...],
  "summaryText": "全体をまとめた1段落のテキスト（slack_bot_memory保存用）"
}

hotTopics: 3-5個の話題トピック（日本語、簡潔に）
discussionAngles: 議論を呼びそうな切り口（X投稿のネタになるもの）
keyTalkingPoints: 具体的に言及できるポイント（数字、企業名、技術名など）
summaryText: 200文字程度の要約テキスト`,
    },
    {
      role: 'user' as const,
      content: `トレンド記事リスト:\n${storyList}`,
    },
  ])

  const text =
    typeof response.content === 'string'
      ? response.content
      : JSON.stringify(response.content)

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Failed to parse trending topics JSON from LLM response')
  }

  return TrendingTopicSummarySchema.parse(JSON.parse(jsonMatch[0]))
}
