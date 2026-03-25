/**
 * Zenn Publisher
 *
 * Publishes articles to Zenn via GitHub repository integration (zenn-cli format).
 * Creates markdown files in nandstech01/zenn-content repo using GitHub Contents API.
 *
 * Account: 原田賢治 (個人アカウント)
 */

import type { RewrittenArticle, CrossPostResult } from './types'

// ============================================================
// Constants
// ============================================================

const GITHUB_API_BASE = 'https://api.github.com'
const REPO_OWNER = 'nandstech01'
const REPO_NAME = 'zenn-content'
const ZENN_SLUG_MAX_LENGTH = 50
const ZENN_BASE_URL = 'https://zenn.dev/kenji_harada/articles'

// ============================================================
// Helpers
// ============================================================

function getGitHubToken(): string {
  const token = process.env.GITHUB_TOKEN
  if (!token) {
    throw new Error('GITHUB_TOKEN is not configured')
  }
  return token
}

/**
 * Generate a Zenn-safe slug: lowercase, alphanumeric + hyphens, max 50 chars.
 */
function toZennSlug(slug: string): string {
  const sanitized = slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return sanitized.slice(0, ZENN_SLUG_MAX_LENGTH)
}

/**
 * Build Zenn frontmatter + body markdown content.
 */
function buildZennMarkdown(article: RewrittenArticle): string {
  const emoji = article.emoji ?? '📝'
  const topics = article.tags
    .slice(0, 5)
    .map((tag) => `"${tag}"`)
    .join(', ')

  const frontmatterLines = [
    '---',
    `title: "${article.title.replace(/"/g, '\\"')}"`,
    `emoji: "${emoji}"`,
    'type: "tech"',
    `topics: [${topics}]`,
    'published: true',
  ]

  // canonical_urlがあれば追加（SEO: 元記事への正規URLを設定）
  if (article.canonicalUrl) {
    frontmatterLines.push(`canonical_url: "${article.canonicalUrl}"`)
  }

  frontmatterLines.push('---')
  const frontmatter = frontmatterLines.join('\n')

  return `${frontmatter}\n\n${article.body}`
}

/**
 * Check if a file already exists in the repo (for update vs create).
 */
async function getExistingFileSha(
  path: string,
  token: string,
): Promise<string | null> {
  const url = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  })

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    return null
  }

  const data = (await response.json()) as { readonly sha?: string }
  return data.sha ?? null
}

// ============================================================
// Main Export
// ============================================================

export async function publishToZenn(
  article: RewrittenArticle,
): Promise<CrossPostResult> {
  try {
    const token = getGitHubToken()
    const slug = toZennSlug(article.title.replace(/\s+/g, '-'))
    const filePath = `articles/${slug}.md`
    const content = buildZennMarkdown(article)
    const encodedContent = Buffer.from(content, 'utf-8').toString('base64')

    process.stdout.write(`[zenn] Publishing: ${filePath}\n`)

    // Check if file exists (update requires sha)
    const existingSha = await getExistingFileSha(filePath, token)

    const body: Record<string, unknown> = {
      message: `publish: ${article.title}`,
      content: encodedContent,
      branch: 'main',
    }

    if (existingSha) {
      body.sha = existingSha
      process.stdout.write(`[zenn] Updating existing article (sha: ${existingSha.slice(0, 7)})\n`)
    }

    const url = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = (await response.json()) as { readonly message?: string }
      const detail = errorData.message ?? `HTTP ${response.status}`
      throw new Error(`GitHub API error: ${detail}`)
    }

    const articleUrl = `${ZENN_BASE_URL}/${slug}`
    process.stdout.write(`[zenn] Published: ${articleUrl}\n`)

    return {
      platform: 'zenn',
      success: true,
      url: articleUrl,
      externalId: slug,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    process.stdout.write(`[zenn] Failed: ${message}\n`)

    return {
      platform: 'zenn',
      success: false,
      error: message,
    }
  }
}
