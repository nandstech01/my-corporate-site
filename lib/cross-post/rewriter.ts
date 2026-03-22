/**
 * Cross-Post Rewriter
 *
 * nands.tech blog articles -> Zenn / Qiita / note platform-optimized rewrites.
 * Uses Claude API to substantially rewrite content for each platform.
 */

import Anthropic from '@anthropic-ai/sdk'
import type { CrossPostPlatform, RewrittenArticle } from './types'

// ============================================================
// Constants
// ============================================================

const REWRITER_MODEL = 'claude-sonnet-4-20250514'
const REWRITER_MAX_TOKENS = 16384
const CANONICAL_BASE = 'https://nands.tech/posts'

// ============================================================
// Anthropic Client
// ============================================================

function getAnthropic(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is required')
  return new Anthropic({ apiKey })
}

// ============================================================
// Article Input
// ============================================================

interface ArticleInput {
  readonly title: string
  readonly content: string
  readonly slug: string
  readonly tags: readonly string[]
}

// ============================================================
// Platform System Prompts
// ============================================================

const SHARED_RULES = (slug: string): string => `
## 共通ルール
- 著者ペルソナ: 原田賢治（個人アカウント）。一人称は「自分」または「僕」を使う。
- オリジナル記事とのコンテンツ重複率30%未満を目指し、大幅にリライトすること。
- 構成、切り口、具体例を変えること。
- canonical_url: ${CANONICAL_BASE}/${slug}
- 記事の最後に自然なバックリンクを入れる: 「詳細な実装手順はこちら → ${CANONICAL_BASE}/${slug}」
- 日本語で書くこと。
`.trim()

const OUTPUT_FORMAT = `
## 出力形式（厳守）
以下のXMLタグ形式で出力してください。タグの外にテキストを書かないでください。

<title>記事タイトル</title>
<emoji>絵文字1つ（Zennの場合のみ）</emoji>
<tags>tag1, tag2, tag3</tags>
<body>
マークダウン本文をここに書く
</body>
`.trim()

function getSystemPrompt(platform: CrossPostPlatform, slug: string): string {
  const shared = SHARED_RULES(slug)

  switch (platform) {
    case 'zenn':
      return `あなたはZenn向けの技術記事リライターです。

${shared}

## Zenn固有ルール
- 技術記事フォーマット、type: tech
- 実装コード例を重視する
- 見出しに絵文字を使わない
- topics/tagsはコンテンツに関連するものを最大5つ選ぶ
- frontmatter用に記事の内容に合った絵文字を1つ選ぶ
- 「この記事の詳しい内容は自社ブログに書いています」と自然に言及する

${OUTPUT_FORMAT}`

    case 'qiita':
      return `あなたはQiita向けの技術記事リライターです。

${shared}

## Qiita固有ルール
- タグ重視（最大5つのタグ）
- コードブロックを多用し、実践的な「やってみた」トーンで書く
- 冒頭に「この記事は自社ブログ([nands.tech](${CANONICAL_BASE}/${slug}))の要約版です」を入れる
- 実践的でハンズオンなスタイル

${OUTPUT_FORMAT}`

    case 'note':
      return `あなたはnote向けの読み物記事リライターです。

${shared}

## note固有ルール
- 読み物形式、ストーリーテリングアプローチ
- 専門用語を非エンジニアにも分かるように簡略化する
- カジュアルで会話的なトーン
- コードは少なめ、説明とナラティブを重視
- 幅広い読者層を意識する
- 【重要】記事の末尾に必ず「---」の区切り線を入れ、その後に以下を含めること:
  - 「この記事の元ネタはこちら」として元記事へのリンクを入れる: [元記事タイトル](${CANONICAL_BASE}/${slug})
  - バックリンクは記事本文の最後に自然な文脈で含めること（絶対に省略しない）

${OUTPUT_FORMAT}`
  }
}

// ============================================================
// User Prompt
// ============================================================

function buildUserPrompt(article: ArticleInput): string {
  return [
    `# 元記事タイトル`,
    article.title,
    '',
    `# タグ`,
    article.tags.join(', '),
    '',
    `# 元記事本文`,
    article.content,
  ].join('\n')
}

// ============================================================
// Response Parsing (XML tags)
// ============================================================

interface ParsedResponse {
  readonly title: string
  readonly body: string
  readonly tags: readonly string[]
  readonly emoji?: string
}

function extractTag(raw: string, tagName: string): string | null {
  const regex = new RegExp(`<${tagName}>([\\s\\S]*?)</${tagName}>`)
  const match = raw.match(regex)
  return match ? match[1].trim() : null
}

function parseResponse(raw: string, platform: CrossPostPlatform): ParsedResponse {
  const title = extractTag(raw, 'title')
  const body = extractTag(raw, 'body')
  const tagsRaw = extractTag(raw, 'tags')

  if (!title) {
    throw new Error('Rewriter response missing <title> tag')
  }
  if (!body) {
    throw new Error('Rewriter response missing <body> tag')
  }
  if (!tagsRaw) {
    throw new Error('Rewriter response missing <tags> tag')
  }

  const tags = tagsRaw.split(',').map((t) => t.trim()).filter(Boolean)

  const result: ParsedResponse = { title, body, tags }

  if (platform === 'zenn') {
    const emoji = extractTag(raw, 'emoji')
    if (!emoji) {
      throw new Error('Rewriter response missing <emoji> tag for Zenn')
    }
    return { ...result, emoji }
  }

  return result
}

// ============================================================
// Main Export
// ============================================================

export async function rewriteForPlatform(
  platform: CrossPostPlatform,
  article: { title: string; content: string; slug: string; tags: string[] },
): Promise<RewrittenArticle> {
  const anthropic = getAnthropic()
  const canonicalUrl = `${CANONICAL_BASE}/${article.slug}`

  const systemPrompt = getSystemPrompt(platform, article.slug)
  const userPrompt = buildUserPrompt(article)

  process.stdout.write(`Rewriter: Generating ${platform} version of "${article.title}"...\n`)

  const response = await anthropic.messages.create({
    model: REWRITER_MODEL,
    max_tokens: REWRITER_MAX_TOKENS,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const textBlock = response.content.find(
    (block): block is Anthropic.Messages.TextBlock => block.type === 'text',
  )

  if (!textBlock) {
    throw new Error(`Rewriter: No text response from Claude for ${platform}`)
  }

  const parsed = parseResponse(textBlock.text, platform)

  process.stdout.write(`Rewriter: ${platform} rewrite complete - "${parsed.title}"\n`)

  return {
    platform,
    title: parsed.title,
    body: parsed.body,
    tags: parsed.tags,
    ...(parsed.emoji ? { emoji: parsed.emoji } : {}),
    canonicalUrl,
  }
}
