/**
 * Topic bank for the Claude Code blog pipeline.
 *
 * Angles mirror the user's example articles (accessible, hook-driven listicles
 * and complete guides). `requiresChangelog` angles are version/news oriented and
 * must be grounded in collectClaudeCodeDigest facts.
 */

import type { ContentKind } from './types'

export interface Angle {
  readonly kind: ContentKind
  /** Topic template; {v} is replaced with the latest version when available. */
  readonly topic: string
  readonly targetKeyword: string
  readonly requiresChangelog: boolean
}

/** Category slug used for Claude Code articles (resolved against `categories`). */
export const CLAUDE_CODE_CATEGORY = 'programming'
/** Category slug for company AI/tech showcase articles. */
export const COMPANY_CATEGORY = 'ai-consultant'

export const CLAUDE_CODE_HOWTO: readonly Angle[] = [
  { kind: 'claude-code-howto', topic: 'スマホだけで作業が完結する Claude Code 活用術 7選', targetKeyword: 'Claude Code スマホ 活用', requiresChangelog: false },
  { kind: 'claude-code-howto', topic: 'Claude Code のサブエージェント実践ガイド｜並列で開発を加速する', targetKeyword: 'Claude Code サブエージェント', requiresChangelog: false },
  { kind: 'claude-code-howto', topic: 'Claude Code の hooks 完全ガイド｜自動化のレシピ集', targetKeyword: 'Claude Code hooks 使い方', requiresChangelog: false },
  { kind: 'claude-code-howto', topic: 'Claude Code × MCP 連携ガイド｜外部ツールを繋いで何でもやらせる', targetKeyword: 'Claude Code MCP 連携', requiresChangelog: false },
  { kind: 'claude-code-howto', topic: 'Claude Code のコスト最適化 7つの方法｜サブスクを使い倒す', targetKeyword: 'Claude Code コスト 節約', requiresChangelog: false },
  { kind: 'claude-code-howto', topic: '初心者がやりがちな Claude Code の失敗 7選と対策', targetKeyword: 'Claude Code 失敗 コツ', requiresChangelog: false },
  { kind: 'claude-code-howto', topic: 'Claude Code のスラッシュコマンド使いこなし術', targetKeyword: 'Claude Code コマンド 一覧', requiresChangelog: false },
  { kind: 'claude-code-howto', topic: 'デザイン未経験が Claude Design で提案資料も LP も数分で作る手順', targetKeyword: 'Claude Design 使い方', requiresChangelog: false },
  { kind: 'claude-code-howto', topic: 'Claude Code でリサーチ・記事・分析を自動化するワークフロー', targetKeyword: 'Claude Code 自動化 ワークフロー', requiresChangelog: false },
]

export const CLAUDE_CODE_NEWS: readonly Angle[] = [
  { kind: 'claude-code-news', topic: 'Claude Code {v} の新機能と実践的な使い方', targetKeyword: 'Claude Code 最新 アップデート', requiresChangelog: true },
  { kind: 'claude-code-news', topic: 'Claude Code {v} で変わったこと総まとめ｜今日から使える', targetKeyword: 'Claude Code 新機能', requiresChangelog: true },
]

export const COMPANY_AI: readonly Angle[] = [
  { kind: 'company-ai', topic: 'AI検索最適化(AIO/GEO)の実装｜フラグメントで引用される設計', targetKeyword: 'AIO GEO 対策', requiresChangelog: false },
  { kind: 'company-ai', topic: 'BM25＋ベクトル＋鮮度RRF のハイブリッド検索を実装する', targetKeyword: 'ハイブリッド検索 RAG 実装', requiresChangelog: false },
  { kind: 'company-ai', topic: '自己修復するRAGの作り方｜失敗を検知して再検索する設計', targetKeyword: 'RAG 自己修復 設計', requiresChangelog: false },
  { kind: 'company-ai', topic: '構造化データ(hasPart)でAIに引用される記事を作る', targetKeyword: '構造化データ AI 引用', requiresChangelog: false },
]

/** Deterministic-ish pick using a numeric seed (no Math.random for reproducibility in tests). */
export function pickAngle(angles: readonly Angle[], seed: number): Angle {
  return angles[Math.abs(seed) % angles.length]
}
