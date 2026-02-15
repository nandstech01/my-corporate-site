/**
 * LinkedIn ハッシュタグ生成
 *
 * X の TagGenerator と同パターン。2-3個のハッシュタグ生成。
 */

// ============================================================
// 定数
// ============================================================

const PRIMARY_TAGS = ['#AI活用', '#LLM', '#AIエージェント', '#エンタープライズAI']
const SECONDARY_TAGS = ['#DX', '#生成AI', '#ChatGPT', '#Claude']

const KEYWORD_TAG_MAP: readonly [readonly string[], string][] = [
  [['agent', 'エージェント', 'crew', 'autogen'], '#AIエージェント'],
  [['rag', 'retrieval', '検索拡張'], '#AI活用'],
  [['llm', 'large language', '大規模言語'], '#LLM'],
  [['enterprise', 'エンタープライズ', '企業', 'business'], '#エンタープライズAI'],
  [['claude', 'anthropic'], '#Claude'],
  [['gpt', 'openai', 'chatgpt'], '#ChatGPT'],
  [['dx', 'デジタルトランスフォーメーション', '変革'], '#DX'],
  [['生成ai', 'generative', 'genai'], '#生成AI'],
]

// ============================================================
// エクスポート
// ============================================================

export interface LinkedInTags {
  readonly primary: readonly string[]
  readonly secondary: readonly string[]
  readonly all: readonly string[]
}

export function generateLinkedInTags(content: string): LinkedInTags {
  const lowerContent = content.toLowerCase()
  const matchedPrimary: string[] = []
  const matchedSecondary: string[] = []

  for (const [keywords, tag] of KEYWORD_TAG_MAP) {
    if (keywords.some((kw) => lowerContent.includes(kw))) {
      if (PRIMARY_TAGS.includes(tag) && !matchedPrimary.includes(tag)) {
        matchedPrimary.push(tag)
      } else if (SECONDARY_TAGS.includes(tag) && !matchedSecondary.includes(tag)) {
        matchedSecondary.push(tag)
      }
    }
  }

  // デフォルト: #AI活用 を必ず含める
  if (matchedPrimary.length === 0) {
    matchedPrimary.push('#AI活用')
  }

  // 合計2-3個に収める
  const all = [...matchedPrimary.slice(0, 2), ...matchedSecondary.slice(0, 1)]

  return {
    primary: matchedPrimary,
    secondary: matchedSecondary,
    all,
  }
}
