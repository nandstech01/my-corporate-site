/**
 * Thread Composer
 *
 * 長文コンテンツをスレッド形式に分割し、投稿する。
 * 構成: 1st=フック（最重要）, 中間=本論, 最後=CTA/問いかけ
 */

import { ChatOpenAI } from '@langchain/openai'
import { getTwitterWeightedLength, postThread as postThreadApi, replyToTweet } from '../x-api/client'
import { X_TWITTER_RULES } from '../prompts/sns/x-twitter'

// LangChain usage_metadata type helper
interface LangChainUsageMetadata {
  readonly input_tokens: number
  readonly output_tokens: number
  readonly total_tokens: number
}

// ============================================================
// 型定義
// ============================================================

export interface ThreadComposerInput {
  readonly topic: string
  readonly content: string
  readonly segmentCount?: number
}

export interface ThreadComposerOutput {
  readonly segments: readonly string[]
  readonly promptTokens: number
  readonly completionTokens: number
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

const WEIGHTED_LIMIT = 280

/**
 * LLM出力からスレッドセグメントをパースする
 * セパレーター: === で区切り
 */
function parseThreadSegments(text: string): readonly string[] {
  return text
    .split('===')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

/**
 * セグメントが文字数制限を満たしているか検証
 */
function validateSegments(segments: readonly string[]): readonly string[] {
  return segments.map((segment) => {
    if (getTwitterWeightedLength(segment) <= WEIGHTED_LIMIT) {
      return segment
    }
    // Truncate if over limit
    let truncated = segment
    while (getTwitterWeightedLength(truncated) > WEIGHTED_LIMIT - 3 && truncated.length > 0) {
      truncated = truncated.slice(0, -1)
    }
    return truncated + '...'
  })
}

// ============================================================
// スレッド生成
// ============================================================

/**
 * トピックとコンテンツからスレッド形式の投稿を生成する
 */
export async function composeThread(
  input: ThreadComposerInput,
): Promise<ThreadComposerOutput> {
  const model = createModel()
  const segmentCount = input.segmentCount ?? 3

  const response = await model.invoke([
    {
      role: 'system' as const,
      content: `あなたは@nands_tech。以下のコンテンツを${segmentCount}セグメントのスレッドにする。

${X_TWITTER_RULES}

## スレッド構成ルール
- 1st（フック）: 読者の注意を引く最も重要な一言。これだけで読みたくなる
- 中間（本論）: 核心の情報・分析・実体験
- 最後（CTA）: 問いかけ or アクション促進で締める
- 各セグメントは日本語120文字以内（CJK=2カウント、280カウント上限）
- URLは入れない
- ハッシュタグは最後のセグメントにのみ0-1個

各セグメントを「===」で区切って出力。セグメントのみ、番号や説明不要。`,
    },
    {
      role: 'user' as const,
      content: `トピック: ${input.topic}\n\nコンテンツ:\n${input.content.slice(0, 4000)}`,
    },
  ])

  const text = typeof response.content === 'string'
    ? response.content
    : String(response.content)

  const rawSegments = parseThreadSegments(text)
  const segments = validateSegments(rawSegments)

  if (segments.length === 0) {
    throw new Error('Thread composition produced no segments')
  }

  const usage = response.usage_metadata as LangChainUsageMetadata | undefined

  return {
    segments,
    promptTokens: usage?.input_tokens ?? 0,
    completionTokens: usage?.output_tokens ?? 0,
  }
}

/**
 * スレッドセグメントを原子的に投稿する
 */
export async function postComposedThread(
  segments: readonly string[],
): Promise<{
  readonly rootTweetId?: string
  readonly rootTweetUrl?: string
  readonly error?: string
}> {
  if (segments.length === 0) {
    return { error: 'No segments to post' }
  }

  const result = await postThreadApi(segments)

  if (!result.success) {
    return { error: result.error }
  }

  return {
    rootTweetId: result.tweetId,
    rootTweetUrl: result.tweetUrl,
  }
}

/**
 * 既存ツイートに自己リプライでスレッドを追加する
 */
export async function addSelfReply(
  parentTweetId: string,
  text: string,
): Promise<{
  readonly tweetId?: string
  readonly error?: string
}> {
  if (getTwitterWeightedLength(text) > WEIGHTED_LIMIT) {
    return { error: 'Self-reply text exceeds character limit' }
  }

  const result = await replyToTweet(text, parentTweetId)

  if (!result.success) {
    return { error: result.error }
  }

  return { tweetId: result.tweetId }
}
