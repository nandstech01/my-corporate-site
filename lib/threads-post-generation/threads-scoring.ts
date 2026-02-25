/**
 * Threads 候補スコアリング型定義
 *
 * scoreCandidates ノードが LLM から返す JSON の
 * パース/バリデーションに使用。
 */

import { z } from 'zod'

// ============================================================
// 型定義
// ============================================================

export interface ThreadsCandidateScore {
  readonly index: number
  readonly narrativeDepth: number // ストーリー性 (0-10)
  readonly accuracy: number // 事実正確性 (0-10)
  readonly conversationPotential: number // リプライ誘発力 (0-10)
  readonly lengthFit: number // 200-400文字の最適範囲 (0-10)
  readonly hookStrength: number // 冒頭の引き (0-10)
  readonly total: number
}

// ============================================================
// Zod スキーマ
// ============================================================

export const ThreadsCandidateScoreSchema = z.array(
  z.object({
    index: z.number(),
    narrativeDepth: z.number().default(5),
    accuracy: z.number().default(5),
    conversationPotential: z.number().default(5),
    lengthFit: z.number().default(5),
    hookStrength: z.number().default(5),
    total: z.number().default(25),
  }),
)
