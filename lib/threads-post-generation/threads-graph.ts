/**
 * Threads 投稿生成パイプライン
 *
 * Threads向けの会話型投稿を生成。
 * 500文字制限、問いかけ形式、ハッシュタグ最大1個。
 */

import { ChatOpenAI } from '@langchain/openai'
import { getThreadsLearnings } from '../slack-bot/proactive/threads-learnings'

// ============================================================
// 型定義
// ============================================================

export interface ThreadsGraphInput {
  readonly content: string
  readonly topic?: string
  readonly sourceUrl?: string
}

export interface ThreadsGraphOutput {
  readonly finalPost: string
  readonly patternUsed: string
  readonly tags: readonly string[]
}

// ============================================================
// ヘルパー
// ============================================================

function createModel() {
  return new ChatOpenAI({
    modelName: 'gpt-5.2',
    apiKey: process.env.OPENAI_API_KEY,
  })
}

// ============================================================
// メイン生成関数
// ============================================================

export async function generateThreadsPost(
  input: ThreadsGraphInput,
): Promise<ThreadsGraphOutput> {
  const model = createModel()

  // 学習データ注入（コールドスタート時はスキップ）
  let learningsHint = ''
  try {
    const userId = process.env.SLACK_ALLOWED_USER_IDS?.split(',')[0]
    if (userId) {
      const learnings = await getThreadsLearnings(userId)
      if (learnings) {
        learningsHint = `\n\n過去のエンゲージメント分析から学んだ高パフォーマンス投稿の特徴:\n${learnings.highPerformerSummary}\nこれらの特徴を参考に、エンゲージメントが高い投稿を生成してください。`
      }
    }
  } catch {
    // Learnings fetch failure should not block generation
  }

  const response = await model.invoke([
    {
      role: 'system' as const,
      content: `あなたは@nands_techのThreads投稿アドバイザーです。
以下のルールに厳密に従い、Threads向け投稿を3候補作成してください。

## Threadsプラットフォームルール
- 500文字以内（厳守）
- 会話調トーン（「です・ます」ではなく「〜だよね」「〜と思う」のカジュアルさ）
- 問いかけ形式で締める（「〜についてどう思いますか？」「〜な経験ありませんか？」）
- ハッシュタグは最大1個（付けなくてもOK）
- リンクURLは本文に含めない（エンゲージメント低下を回避）
- 絵文字は控えめに（0-2個）

## 投稿スタイル
- 思考リーダーシップ型: 自分の考え・実体験を軸に語る
- 具体的な数字やファクトを1つ以上含める
- 1行目でフック（注目を引く一言）
- 最後に問いかけで会話を誘発

## NGパターン
- ニュースbot的な「〜を発表」口調
- 煽り表現（「ヤバい」「致命的」等）
- 抽象的すぎる感想（「すごい」「画期的」のみ）
- URL/リンクプレースホルダー

3候補を「---」で区切って出力。候補のみ、説明不要。${learningsHint}`,
    },
    {
      role: 'user' as const,
      content: `${input.topic ? `トピック: ${input.topic}\n` : ''}コンテンツ:\n${input.content.slice(0, 4000)}`,
    },
  ])

  const text =
    typeof response.content === 'string'
      ? response.content
      : String(response.content)

  const candidates = text
    .split('---')
    .map((c) => c.trim())
    .filter((c) => c.length > 0)

  if (candidates.length === 0) {
    throw new Error('Threads post generation produced no candidates')
  }

  // 500文字制限で最初の候補を選定（最も良い候補はLLMが最初に出す傾向）
  const bestCandidate = candidates.find((c) => c.length <= 500) ?? candidates[0]
  const finalPost = bestCandidate.length > 500
    ? bestCandidate.slice(0, 497) + '...'
    : bestCandidate

  // タグ抽出
  const tagMatch = finalPost.match(/#[\w\u3000-\u9FFF]+/g)
  const tags = tagMatch ? tagMatch.slice(0, 1) : []

  return {
    finalPost,
    patternUsed: 'threads_conversational',
    tags,
  }
}
