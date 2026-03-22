/**
 * note Publisher
 *
 * Posts articles to note.com via API.
 *
 * NOTE: The note API is non-official and may be unstable.
 * If the API call fails, this publisher saves the markdown content
 * to a temp file as a fallback for manual posting.
 *
 * Account: 原田賢治 (個人アカウント)
 */

import { writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'

import type { RewrittenArticle, CrossPostResult } from './types'

// ============================================================
// Constants
// ============================================================

const NOTE_API_BASE = 'https://note.com/api/v1'

// ============================================================
// Types
// ============================================================

interface NotePayload {
  readonly name: string
  readonly body: string
  readonly status: 'published'
}

interface NoteResponse {
  readonly data?: {
    readonly id?: number
    readonly key?: string
    readonly user?: {
      readonly urlname?: string
    }
  }
}

// ============================================================
// Helpers
// ============================================================

function getNoteToken(): string {
  const token = process.env.NOTE_ACCESS_TOKEN
  if (!token) {
    throw new Error('NOTE_ACCESS_TOKEN is not configured')
  }
  return token
}

/**
 * Build fallback file path for manual posting.
 */
function buildFallbackPath(title: string): string {
  const timestamp = Date.now()
  const safeName = title
    .replace(/[^a-zA-Z0-9\u3040-\u9fff-]/g, '_')
    .slice(0, 40)
  return join(tmpdir(), `note-draft-${safeName}-${timestamp}.md`)
}

/**
 * Save article as markdown file for manual posting.
 */
async function saveFallbackMarkdown(
  article: RewrittenArticle,
): Promise<string> {
  const filePath = buildFallbackPath(article.title)

  const content = [
    `# ${article.title}`,
    '',
    `> Tags: ${article.tags.join(', ')}`,
    `> Canonical: ${article.canonicalUrl}`,
    '',
    article.body,
  ].join('\n')

  await writeFile(filePath, content, 'utf-8')

  return filePath
}

// ============================================================
// Main Export
// ============================================================

/**
 * Publish article to note.com.
 *
 * The note API is non-official and may change without notice.
 * On API failure, the article is saved to a temp file as a fallback.
 */
export async function publishToNote(
  article: RewrittenArticle,
): Promise<CrossPostResult> {
  try {
    const token = getNoteToken()

    const payload: NotePayload = {
      name: article.title,
      body: article.body,
      status: 'published',
    }

    process.stdout.write(`[note] Publishing: ${article.title}\n`)

    const response = await fetch(`${NOTE_API_BASE}/text_notes`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const statusText = `HTTP ${response.status}`
      let detail = statusText
      try {
        const errorData = (await response.json()) as { readonly message?: string }
        detail = errorData.message ?? statusText
      } catch {
        // Response body may not be JSON
      }
      throw new Error(`note API error: ${detail}`)
    }

    const data = (await response.json()) as NoteResponse
    const noteKey = data.data?.key
    const urlname = data.data?.user?.urlname

    const articleUrl = noteKey && urlname
      ? `https://note.com/${urlname}/n/${noteKey}`
      : undefined

    process.stdout.write(`[note] Published: ${articleUrl ?? '(URL unavailable)'}\n`)

    return {
      platform: 'note',
      success: true,
      url: articleUrl,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    process.stdout.write(`[note] API failed: ${message}\n`)

    // Fallback: save to temp file for manual posting
    try {
      const fallbackPath = await saveFallbackMarkdown(article)
      process.stdout.write(`[note] Fallback saved: ${fallbackPath}\n`)

      return {
        platform: 'note',
        success: false,
        error: `${message} (fallback saved: ${fallbackPath})`,
      }
    } catch (fallbackError) {
      const fallbackMessage = fallbackError instanceof Error
        ? fallbackError.message
        : 'Unknown error'
      process.stdout.write(`[note] Fallback save also failed: ${fallbackMessage}\n`)

      return {
        platform: 'note',
        success: false,
        error: message,
      }
    }
  }
}
