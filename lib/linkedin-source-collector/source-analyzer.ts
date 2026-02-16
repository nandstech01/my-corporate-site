/**
 * LinkedIn ソース分析
 *
 * GPT-4o-mini で収集ソースを LinkedIn 投稿候補に選別。
 * 優先度: (1) 具体的な体験談 > (2) 重要リリース > (3) トレンド分析
 */

import { z } from 'zod'
import { ChatOpenAI } from '@langchain/openai'
import { getLinkedInLearnings } from '../slack-bot/proactive/linkedin-learnings'

// ============================================================
// 型定義
// ============================================================

export interface CollectedSource {
  readonly id: string
  readonly sourceType: 'reddit' | 'github_release' | 'hackernews' | 'devto' | 'official_blog'
  readonly title: string
  readonly body: string
  readonly url: string
  readonly score: number
}

export interface LinkedInTopicCandidate {
  readonly title: string
  readonly sourceType: 'practitioner_experience' | 'new_release' | 'trend_analysis' | 'official_announcement'
  readonly sourceBody: string
  readonly sourceUrl: string
  readonly japanAngle: string
  readonly keyTakeaways: readonly string[]
  readonly suggestedHashtags: readonly string[]
}

const LinkedInTopicCandidateSchema = z.object({
  title: z.string(),
  sourceType: z.enum(['practitioner_experience', 'new_release', 'trend_analysis', 'official_announcement']),
  sourceBody: z.string(),
  sourceUrl: z.string(),
  japanAngle: z.string(),
  keyTakeaways: z.array(z.string()),
  suggestedHashtags: z.array(z.string()),
})

const AnalysisResultSchema = z.object({
  candidates: z.array(LinkedInTopicCandidateSchema),
  summaryForMemory: z.string(),
})

// ============================================================
// LLM モデル
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

export async function analyzeSourcesForLinkedIn(
  sources: readonly CollectedSource[],
): Promise<{
  readonly candidates: readonly LinkedInTopicCandidate[]
  readonly summaryForMemory: string
}> {
  if (sources.length === 0) {
    return { candidates: [], summaryForMemory: '' }
  }

  const model = createMiniModel()

  // 学習データの取得（コールドスタート時は null）
  const userId = process.env.SLACK_ALLOWED_USER_IDS?.split(',')[0]
  const learnings = userId ? await getLinkedInLearnings(userId) : null

  const sourceList = sources
    .slice(0, 20)
    .map(
      (s, i) =>
        `${i + 1}. [${s.sourceType}] ${s.title} (score: ${s.score})\nURL: ${s.url}\n${s.body.slice(0, 300)}`,
    )
    .join('\n\n')

  const learningsSection = learnings
    ? `\n\n## 過去のエンゲージメント分析から学んだこと:\n${learnings.highPerformerSummary}\n\nこの情報を参考に、高エンゲージメントが期待できるソースを優先的に選択してください。`
    : ''

  const response = await model.invoke([
    {
      role: 'system' as const,
      content: `あなたはLinkedIn投稿のためのソース選別者です。
以下の海外ソースから、LinkedIn投稿に最適な3-5件を選び、日本市場への切り口を提案してください。

優先度:
1. official_announcement: 公式ブログの重要発表（OpenAI, Anthropic等）
2. practitioner_experience: 具体的な「使ってみた」体験談（Reddit等）
3. new_release: 重要なAIツールのリリース（GitHub）
4. trend_analysis: 複数ソースにまたがるトレンド

JSON形式のみで出力:
{
  "candidates": [
    {
      "title": "投稿タイトル案",
      "sourceType": "official_announcement|practitioner_experience|new_release|trend_analysis",
      "sourceBody": "元ソースの要約（200文字）",
      "sourceUrl": "元ソースのURL",
      "japanAngle": "日本市場への示唆・切り口",
      "keyTakeaways": ["要点1", "要点2", "要点3"],
      "suggestedHashtags": ["#AI活用", "#LLM"]
    }
  ],
  "summaryForMemory": "全体をまとめた200文字程度のテキスト（slack_bot_memory保存用）"
}

注意:
- 日本のビジネスパーソンが関心を持つ切り口を必ず付ける
- ハッシュタグは日英ミックスで2-3個
- 元ソースへの帰属を明確に${learningsSection}`,
    },
    {
      role: 'user' as const,
      content: `収集ソース一覧:\n${sourceList}`,
    },
  ])

  const text =
    typeof response.content === 'string'
      ? response.content
      : JSON.stringify(response.content)

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Failed to parse LinkedIn source analysis JSON from LLM response')
  }

  const parsed = AnalysisResultSchema.parse(JSON.parse(jsonMatch[0]))

  return {
    candidates: parsed.candidates as unknown as readonly LinkedInTopicCandidate[],
    summaryForMemory: parsed.summaryForMemory,
  }
}
