/**
 * Tool Execution Tracker
 *
 * セッション内のツール実行を追跡し、重複呼び出しを防止する。
 * OpenClaw のセッション JSONL パターンを参考。
 *
 * 主要機能:
 * - 同一ツール + 同一引数の重複検出
 * - 実行履歴のサマリー生成（システムプロンプト注入用）
 * - ツール結果のキャッシュ（重複時に前回結果を返却）
 */

// ============================================================
// 型定義
// ============================================================

export interface ToolExecution {
  readonly toolName: string
  readonly args: Record<string, unknown>
  readonly resultSummary: string
  readonly timestamp: number
}

export interface ToolTracker {
  readonly executions: readonly ToolExecution[]
}

// ============================================================
// トラッカー生成
// ============================================================

export function createToolTracker(): ToolTracker {
  return { executions: [] }
}

// ============================================================
// 重複チェック
// ============================================================

function normalizeArgs(args: Record<string, unknown>): string {
  const sorted = Object.keys(args)
    .sort()
    .reduce<Record<string, unknown>>((acc, key) => {
      const value = args[key]
      if (value !== undefined && value !== null && value !== '') {
        return { ...acc, [key]: value }
      }
      return acc
    }, {})
  return JSON.stringify(sorted)
}

export function isDuplicate(
  tracker: ToolTracker,
  toolName: string,
  args: Record<string, unknown>,
): boolean {
  const normalizedArgs = normalizeArgs(args)
  return tracker.executions.some(
    (exec) =>
      exec.toolName === toolName &&
      normalizeArgs(exec.args as Record<string, unknown>) === normalizedArgs,
  )
}

/**
 * 重複実行の場合、前回の結果サマリーを返す
 */
export function getCachedResult(
  tracker: ToolTracker,
  toolName: string,
  args: Record<string, unknown>,
): string | null {
  const normalizedArgs = normalizeArgs(args)
  const cached = tracker.executions.find(
    (exec) =>
      exec.toolName === toolName &&
      normalizeArgs(exec.args as Record<string, unknown>) === normalizedArgs,
  )
  return cached?.resultSummary ?? null
}

// ============================================================
// 実行記録
// ============================================================

export function recordExecution(
  tracker: ToolTracker,
  toolName: string,
  args: Record<string, unknown>,
  result: string,
): ToolTracker {
  const resultSummary =
    result.length > 300 ? `${result.slice(0, 150)}...${result.slice(-150)}` : result

  const execution: ToolExecution = {
    toolName,
    args,
    resultSummary,
    timestamp: Date.now(),
  }

  return {
    executions: [...tracker.executions, execution],
  }
}

// ============================================================
// サマリー生成（システムプロンプト注入用）
// ============================================================

export function buildExecutionSummary(tracker: ToolTracker): string {
  if (tracker.executions.length === 0) return ''

  const lines = tracker.executions.map((exec) => {
    const argsStr = Object.entries(exec.args)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `${k}=${typeof v === 'string' ? v : JSON.stringify(v)}`)
      .join(', ')
    return `- ${exec.toolName}(${argsStr}) → ${exec.resultSummary.slice(0, 80)}`
  })

  return `## このセッションで実行済みのツール（再実行するな）
${lines.join('\n')}`
}
