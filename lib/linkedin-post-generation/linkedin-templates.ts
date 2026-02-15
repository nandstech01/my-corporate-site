/**
 * LinkedIn 投稿テンプレート（4パターン）
 */

export interface LinkedInTemplate {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly structure: string
  readonly sourceTypes: readonly string[]
}

export const linkedInTemplates: readonly LinkedInTemplate[] = [
  {
    id: 'overseas_experience_commentary',
    name: '海外事例コメンタリー',
    description: 'Reddit「使ってみた」→ 日本市場の視点を加える',
    structure: `フック（1-2行） → 海外事例の要約（3-4行） → 日本市場への示唆（3-4行） → テイクアウェイ（箇条書き2-3点） → 問いかけ（1行） → ハッシュタグ`,
    sourceTypes: ['practitioner_experience'],
  },
  {
    id: 'release_analysis',
    name: 'リリース分析',
    description: 'GitHub新リリース → 実務インパクト解説',
    structure: `フック（1-2行） → リリース内容の要約（2-3行） → 実務へのインパクト（3-4行） → 導入時の注意点（2-3行） → 問いかけ（1行） → ハッシュタグ`,
    sourceTypes: ['new_release'],
  },
  {
    id: 'trend_bridge',
    name: 'トレンドブリッジ',
    description: '海外トレンドと日本のギャップを橋渡し',
    structure: `フック（1-2行） → 海外で今起きていること（3-4行） → 日本との温度差・ギャップ（3-4行） → 今後の展望（2-3行） → 問いかけ（1行） → ハッシュタグ`,
    sourceTypes: ['trend_analysis', 'practitioner_experience'],
  },
  {
    id: 'tool_comparison',
    name: 'ツール比較',
    description: '複数ソースをまとめて比較',
    structure: `フック（1-2行） → 比較対象の紹介（2-3行） → 各ツールの強み・弱み（4-5行） → 選定基準の提案（2-3行） → 問いかけ（1行） → ハッシュタグ`,
    sourceTypes: ['practitioner_experience', 'new_release'],
  },
]

export function findTemplate(id: string): LinkedInTemplate {
  return (
    linkedInTemplates.find((t) => t.id === id) ?? linkedInTemplates[0]
  )
}

export function findTemplateForSourceType(
  sourceType: string,
): LinkedInTemplate {
  return (
    linkedInTemplates.find((t) => t.sourceTypes.includes(sourceType)) ??
    linkedInTemplates[0]
  )
}
