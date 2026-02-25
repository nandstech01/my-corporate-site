/**
 * LinkedIn 投稿テンプレート（6パターン）
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
    sourceTypes: ['new_release', 'official_announcement'],
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
  {
    id: 'risk_analysis',
    name: 'リスク分析',
    description: 'AI導入のリスクと対策をプロフェッショナル視点で分析',
    structure: `フック（1-2行）→ リスクシナリオの提示（3-4行）→ 実際に起きた問題事例（3-4行）→ 実務的な対策と教訓（3-4行）→ 問いかけ（1行）→ ハッシュタグ`,
    sourceTypes: ['trend_analysis', 'practitioner_experience'],
  },
  {
    id: 'failure_case_study',
    name: '失敗事例研究',
    description: '失敗から得た学びをケーススタディ形式で共有',
    structure: `フック（1-2行）→ 試みた内容と背景（3-4行）→ 何が起きたか・失敗の分析（3-4行）→ 学びと改善後のアプローチ（3-4行）→ 問いかけ（1行）→ ハッシュタグ`,
    sourceTypes: ['practitioner_experience'],
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
