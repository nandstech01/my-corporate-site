/**
 * Blog Topic Buzz Scorer
 *
 * Scores potential blog topics on 5 factors (0-100 total):
 * - Freshness (20%): How recent the source is
 * - Source Authority (20%): OpenAI/Anthropic/Google=20, Meta/MS=15, HF/LC=10
 * - Topic Relevance (25%): Match with SERVICE_ENTITIES
 * - SEO Opportunity (20%): Existing GSC coverage check
 * - Buzz Potential (15%): Social media mentions
 */

interface ScoreInput {
  title: string
  sourceAuthority: number
  publishedAt: Date
  description?: string
}

interface ScoreResult {
  totalScore: number
  breakdown: {
    freshness: number
    authority: number
    relevance: number
    seoOpportunity: number
    buzzPotential: number
  }
  suggestedTopic: string | null
  suggestedKeyword: string | null
}

// Keywords from entity-relationships.ts (read-only reference)
const RELEVANT_KEYWORDS = [
  'ai', 'artificial intelligence', '人工知能', 'llm', 'rag',
  'chatgpt', 'claude', 'gemini', 'gpt',
  'agent', 'エージェント', 'mcp', 'model context protocol',
  'seo', 'aio', 'search', '検索',
  'reskilling', 'リスキリング', 'career', 'キャリア',
  'automation', '自動化', 'chatbot', 'チャットボット',
  'web development', 'ウェブ開発', 'system', 'システム',
  'vector', 'embedding', 'ベクトル',
  'structured data', '構造化データ',
  'video', '動画', 'sns', 'marketing', 'マーケティング',
]

function scoreFreshness(publishedAt: Date): number {
  const hoursAgo = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60)
  if (hoursAgo <= 6) return 20
  if (hoursAgo <= 12) return 15
  if (hoursAgo <= 24) return 10
  if (hoursAgo <= 48) return 5
  return 0
}

function scoreRelevance(title: string, description?: string): number {
  const text = `${title} ${description || ''}`.toLowerCase()
  let matchCount = 0

  for (const keyword of RELEVANT_KEYWORDS) {
    if (text.includes(keyword.toLowerCase())) {
      matchCount++
    }
  }

  if (matchCount >= 5) return 25
  if (matchCount >= 3) return 20
  if (matchCount >= 2) return 15
  if (matchCount >= 1) return 10
  return 0
}

function scoreSeoOpportunity(title: string): number {
  // Heuristic: newer AI topics have better SEO opportunity
  const highOpportunityTerms = ['new', 'launch', 'release', 'update', 'announce', '新', 'リリース', '発表']
  const text = title.toLowerCase()
  const hasHighOpp = highOpportunityTerms.some(term => text.includes(term))
  return hasHighOpp ? 15 : 8
}

function scoreBuzzPotential(title: string): number {
  // Heuristic: certain words indicate viral potential
  const buzzTerms = ['breakthrough', 'revolutionary', 'open source', 'free', 'benchmark', 'state-of-the-art', 'gpt-5', 'claude', 'gemini']
  const text = title.toLowerCase()
  const buzzCount = buzzTerms.filter(term => text.includes(term)).length
  if (buzzCount >= 2) return 15
  if (buzzCount >= 1) return 10
  return 5
}

function suggestTopic(title: string): string | null {
  // Simple heuristic: transform source title into a Japanese blog angle
  const text = title.toLowerCase()
  if (text.includes('gpt') || text.includes('openai')) return `OpenAI最新動向: ${title} - 日本企業への影響と活用法`
  if (text.includes('claude') || text.includes('anthropic')) return `Anthropic Claude最新情報: ${title} - ビジネス活用ガイド`
  if (text.includes('gemini') || text.includes('google')) return `Google AI最新アップデート: ${title} - 実務への応用`
  if (text.includes('agent')) return `AIエージェント最前線: ${title} - 業務自動化の新潮流`
  if (text.includes('rag') || text.includes('search')) return `AI検索技術進化: ${title} - SEO・AIO対策への示唆`
  return `AI技術最新トレンド: ${title} - ビジネスインパクト分析`
}

function suggestKeyword(title: string): string | null {
  const text = title.toLowerCase()
  if (text.includes('gpt') || text.includes('openai')) return 'OpenAI 最新 活用方法'
  if (text.includes('claude') || text.includes('anthropic')) return 'Claude AI ビジネス活用'
  if (text.includes('gemini') || text.includes('google')) return 'Google AI 最新アップデート'
  if (text.includes('agent')) return 'AIエージェント 業務自動化'
  if (text.includes('rag')) return 'RAG AI検索 最新技術'
  return 'AI 最新動向 ビジネス活用'
}

export async function scoreBlogTopic(input: ScoreInput): Promise<ScoreResult> {
  const freshness = scoreFreshness(input.publishedAt)
  const authority = input.sourceAuthority
  const relevance = scoreRelevance(input.title, input.description)
  const seoOpportunity = scoreSeoOpportunity(input.title)
  const buzzPotential = scoreBuzzPotential(input.title)

  const totalScore = freshness + authority + relevance + seoOpportunity + buzzPotential

  return {
    totalScore: Math.min(100, totalScore),
    breakdown: {
      freshness,
      authority,
      relevance,
      seoOpportunity,
      buzzPotential,
    },
    suggestedTopic: suggestTopic(input.title),
    suggestedKeyword: suggestKeyword(input.title),
  }
}
