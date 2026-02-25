/**
 * Threads パターン選択（Bandit wrapper）
 *
 * 既存の Thompson Sampling ベースの pattern-bandit を
 * Threads パターンテンプレートに接続する薄いラッパー。
 */

import { selectPatternByBandit } from '../learning/pattern-bandit'
import {
  threadsPatternTemplates,
  type ThreadsPatternTemplate,
  THREADS_PATTERN_IDS,
} from './threads-templates'

// ============================================================
// Bandit Selection
// ============================================================

export async function selectThreadsPattern(): Promise<ThreadsPatternTemplate> {
  try {
    const selectedId = await selectPatternByBandit(
      THREADS_PATTERN_IDS,
      'threads',
    )

    const template = threadsPatternTemplates.find((t) => t.id === selectedId)
    if (template) {
      return template
    }

    // ID not found in templates -- fallback to random
    return getRandomThreadsPattern()
  } catch {
    return getRandomThreadsPattern()
  }
}

// ============================================================
// Random Fallback (cold start)
// ============================================================

export function getRandomThreadsPattern(): ThreadsPatternTemplate {
  const index = Math.floor(Math.random() * threadsPatternTemplates.length)
  return threadsPatternTemplates[index]
}
