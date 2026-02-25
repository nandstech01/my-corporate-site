/**
 * Content Critique Engine
 *
 * Self-Refine パターン（Generate → Critique → Revise）の共有モジュール。
 * X / Threads / LinkedIn 全プラットフォームで使用。
 *
 * - critiquePost(): gpt-4.1-mini で5次元評価 + 弱点リスト + 改善案
 * - revisePost(): gpt-5.2 で改善案を反映した改訂版生成
 * - Adaptive exit: overallScore >= 40/50 なら改善スキップ
 */

import { z } from 'zod'
import { ChatOpenAI } from '@langchain/openai'
import type { Platform } from '../ai-judge/types'
import { getConstitution } from './platform-constitutions'

// ============================================================
// 型定義
// ============================================================

export interface CritiqueDimensions {
  readonly hookStrength: number       // 0-10: 1行目の引き
  readonly voiceAuthenticity: number  // 0-10: bot感のなさ
  readonly engagementTrigger: number  // 0-10: 問いかけ・議論誘発
  readonly platformFit: number        // 0-10: 文字数・フォーマット
  readonly factualGrounding: number   // 0-10: ソースへの忠実さ
}

export interface CritiqueResult {
  readonly passed: boolean             // 閾値超え → 改善不要
  readonly overallScore: number        // 0-50
  readonly dimensions: CritiqueDimensions
  readonly strengths: readonly string[]
  readonly weaknesses: readonly string[]
  readonly revision?: string           // 改善案（passedならundefined）
}

// ============================================================
// 定数
// ============================================================

/** Adaptive exit 閾値: この点数以上なら改善スキップ */
const ADAPTIVE_EXIT_THRESHOLD = 40

// ============================================================
// Zod スキーマ
// ============================================================

const CritiqueResponseSchema = z.object({
  hookStrength: z.number().min(0).max(10).default(5),
  voiceAuthenticity: z.number().min(0).max(10).default(5),
  engagementTrigger: z.number().min(0).max(10).default(5),
  platformFit: z.number().min(0).max(10).default(5),
  factualGrounding: z.number().min(0).max(10).default(5),
  overallScore: z.number().min(0).max(50).default(25),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  revision: z.string().optional(),
})

// ============================================================
// モデル生成
// ============================================================

function createCritiqueModel() {
  return new ChatOpenAI({
    modelName: 'gpt-4.1-mini',
    apiKey: process.env.OPENAI_API_KEY,
  })
}

function createRevisionModel() {
  return new ChatOpenAI({
    modelName: 'gpt-5.2',
    apiKey: process.env.OPENAI_API_KEY,
  })
}

// ============================================================
// critiquePost
// ============================================================

export async function critiquePost(params: {
  readonly text: string
  readonly platform: Platform
  readonly mode: string
  readonly sourceContent?: string
  readonly highPerformerExamples?: readonly string[]
}): Promise<CritiqueResult> {
  const { text, platform, mode, sourceContent, highPerformerExamples } = params
  const constitution = getConstitution(platform, mode)
  const model = createCritiqueModel()

  const principlesText = constitution.principles
    .map((p, i) => `${i + 1}. ${p}`)
    .join('\n')

  const antiPatternsText = constitution.antiPatterns
    .map((a) => `- ${a}`)
    .join('\n')

  const highPerformerSection = highPerformerExamples && highPerformerExamples.length > 0
    ? `\n## 過去の高パフォーマンス投稿の特徴（参考）\n${highPerformerExamples.join('\n')}`
    : ''

  const sourceSection = sourceContent
    ? `\n## ソースコンテンツ（先頭1000文字）\n${sourceContent.slice(0, 1000)}`
    : ''

  const response = await model.invoke([
    {
      role: 'system' as const,
      content: `あなたは@nands_techのSNS投稿品質クリティックです。
以下の品質憲法に基づき、投稿を厳密に評価してください。

## 品質憲法（${platform} - ${mode}）
### ポジティブ行動原則
${principlesText}

### アンチパターン（検出したら減点）
${antiPatternsText}
${highPerformerSection}

## 評価ルール
${constitution.scoringPrompt}

overallScoreは5次元の合計（0-50）。
weaknessesが空の場合、revisionは不要。
weaknessesがある場合、revisionに改善版の全文テキストを記載。`,
    },
    {
      role: 'user' as const,
      content: `投稿テキスト:\n${text}${sourceSection}`,
    },
  ])

  const responseText =
    typeof response.content === 'string'
      ? response.content
      : JSON.stringify(response.content)

  const fallbackResult: CritiqueResult = {
    passed: true,
    overallScore: ADAPTIVE_EXIT_THRESHOLD,
    dimensions: {
      hookStrength: 8,
      voiceAuthenticity: 8,
      engagementTrigger: 8,
      platformFit: 8,
      factualGrounding: 8,
    },
    strengths: ['評価パース失敗 — フォールバック'],
    weaknesses: [],
  }

  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return fallbackResult

    const parsed = CritiqueResponseSchema.parse(JSON.parse(jsonMatch[0]))
    const overallScore = parsed.overallScore
    const passed = overallScore >= ADAPTIVE_EXIT_THRESHOLD

    return {
      passed,
      overallScore,
      dimensions: {
        hookStrength: parsed.hookStrength,
        voiceAuthenticity: parsed.voiceAuthenticity,
        engagementTrigger: parsed.engagementTrigger,
        platformFit: parsed.platformFit,
        factualGrounding: parsed.factualGrounding,
      },
      strengths: parsed.strengths,
      weaknesses: parsed.weaknesses,
      revision: passed ? undefined : parsed.revision,
    }
  } catch {
    return fallbackResult
  }
}

// ============================================================
// revisePost
// ============================================================

export async function revisePost(params: {
  readonly originalText: string
  readonly critique: CritiqueResult
  readonly platform: Platform
  readonly mode: string
}): Promise<string> {
  const { originalText, critique, platform, mode } = params
  const constitution = getConstitution(platform, mode)
  const model = createRevisionModel()

  // クリティックに改善案が含まれていればそれを利用
  if (critique.revision && critique.revision.length > 10) {
    return critique.revision
  }

  const principlesText = constitution.principles
    .map((p, i) => `${i + 1}. ${p}`)
    .join('\n')

  const weaknessesText = critique.weaknesses
    .map((w) => `- ${w}`)
    .join('\n')

  const response = await model.invoke([
    {
      role: 'system' as const,
      content: `あなたは@nands_tech。以下の弱点を修正した改訂版を作成してください。

## 品質憲法（${platform} - ${mode}）
${principlesText}

## 修正すべき弱点
${weaknessesText}

## ルール
- 元の投稿の良い部分（強み）は維持する
- 弱点のみ改善する
- プラットフォームの文字数制限を守る
- 改訂版テキストのみ出力（説明不要）`,
    },
    {
      role: 'user' as const,
      content: `元の投稿:\n${originalText}`,
    },
  ])

  const revised =
    typeof response.content === 'string'
      ? response.content.trim()
      : String(response.content).trim()

  // 空の場合はオリジナルを返す
  return revised.length > 0 ? revised : originalText
}
