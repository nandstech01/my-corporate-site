/**
 * note Publisher
 *
 * Posts articles to note.com via unofficial API (3-step flow).
 *
 * Flow:
 *   1. POST /api/v1/text_notes        — create blank draft (get article ID)
 *   2. POST /api/v1/text_notes/draft_save?id={id} — save title + HTML body
 *   3. PUT  /api/v1/text_notes/{id}    — publish
 *
 * NOTE: The note API is non-official and may be unstable.
 * If the API call fails, this publisher saves the markdown content
 * to a temp file as a fallback for manual posting.
 *
 * Account: 原田賢治｜AI/LLMエンジニア (note.com/kenji_h_ai)
 */

import { randomUUID } from 'crypto'
import { writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'

import type { RewrittenArticle, CrossPostResult } from './types'

// ============================================================
// Constants
// ============================================================

const NOTE_API_BASE = 'https://note.com/api/v1'

const NOTE_HEADERS = {
  'Content-Type': 'application/json',
  'X-Requested-With': 'XMLHttpRequest',
} as const

// ============================================================
// Types
// ============================================================

interface NoteCreateResponse {
  readonly data?: {
    readonly id?: number
    readonly key?: string
  }
}

interface NoteDraftSaveResponse {
  readonly data?: {
    readonly result?: boolean
  }
}

interface NotePublishResponse {
  readonly data?: {
    readonly id?: number
    readonly key?: string
    readonly note_url?: string
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

function buildHeaders(token: string): Record<string, string> {
  return {
    ...NOTE_HEADERS,
    Cookie: `_note_session_v5=${token}`,
  }
}

/**
 * Apply inline markdown formatting to text.
 */
function applyInlineFormatting(text: string): string {
  return text
    // Bold: **text** → <b>text</b>
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    // Italic: *text* → <i>text</i>
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<i>$1</i>')
    // Links: [text](url) → <a href="url">text</a>
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Bare URLs: https://... → <a href="url">url</a> (only if not already inside an <a> tag)
    .replace(/(?<!href="|">)(https?:\/\/[^\s<)]+)/g, '<a href="$1">$1</a>')
    // Inline code: `code` → <code>code</code>
    .replace(/`([^`]+)`/g, '<code>$1</code>')
}

/**
 * Convert markdown body to note.com HTML format.
 * Each paragraph/block gets a unique UUID as name/id attributes.
 */
function markdownToNoteHtml(markdown: string): string {
  return markdown
    .split('\n\n')
    .filter((block) => block.trim().length > 0)
    .map((block) => {
      const uuid = randomUUID()
      const trimmed = block.trim()

      // Skip h1 headings (title is set separately, h1 in body is a duplicate)
      if (/^# [^#]/.test(trimmed)) {
        return ''
      }

      // Headings
      const h3Match = trimmed.match(/^### (.+)$/)
      if (h3Match) {
        return `<h3 name="${uuid}" id="${uuid}">${applyInlineFormatting(h3Match[1])}</h3>`
      }
      const h2Match = trimmed.match(/^## (.+)$/)
      if (h2Match) {
        return `<h2 name="${uuid}" id="${uuid}">${applyInlineFormatting(h2Match[1])}</h2>`
      }

      // Unordered list block (lines starting with -)
      if (/^- /.test(trimmed)) {
        const items = trimmed
          .split('\n')
          .filter((line) => line.trim().startsWith('- '))
          .map((line) => {
            const itemUuid = randomUUID()
            const content = applyInlineFormatting(line.replace(/^- /, '').trim())
            return `<li name="${itemUuid}" id="${itemUuid}">${content}</li>`
          })
          .join('')
        return `<ul name="${uuid}" id="${uuid}">${items}</ul>`
      }

      // Regular paragraph (join single newlines with <br>)
      const text = applyInlineFormatting(trimmed.replace(/\n/g, '<br>'))
      return `<p name="${uuid}" id="${uuid}">${text}</p>`
    })
    .join('')
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
// API Steps
// ============================================================

/**
 * Step 1: Create a blank draft on note.com.
 */
async function createDraft(
  headers: Record<string, string>,
): Promise<{ id: number; key: string }> {
  const response = await fetch(`${NOTE_API_BASE}/text_notes`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ template_key: null }),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`Draft creation failed: HTTP ${response.status} ${body}`)
  }

  const data = (await response.json()) as NoteCreateResponse
  const id = data.data?.id
  const key = data.data?.key

  if (!id || !key) {
    throw new Error('Draft creation returned no id/key')
  }

  return { id, key }
}

/**
 * Step 2: Save title and body to the draft.
 */
async function saveDraft(
  headers: Record<string, string>,
  articleId: number,
  title: string,
  htmlBody: string,
): Promise<void> {
  const response = await fetch(
    `${NOTE_API_BASE}/text_notes/draft_save?id=${articleId}&is_temp_saved=true`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: title,
        body: htmlBody,
        body_length: htmlBody.replace(/<[^>]+>/g, '').length,
        index: false,
        is_lead_form: false,
      }),
    },
  )

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`Draft save failed: HTTP ${response.status} ${body}`)
  }

  const data = (await response.json()) as NoteDraftSaveResponse
  if (!data.data?.result) {
    throw new Error('Draft save returned result=false')
  }
}

/**
 * Step 3: Publish the draft.
 */
async function publishDraft(
  headers: Record<string, string>,
  articleId: number,
  noteKey: string,
  title: string,
  htmlBody: string,
  hashtags: readonly string[],
): Promise<NotePublishResponse> {
  const response = await fetch(`${NOTE_API_BASE}/text_notes/${articleId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      author_ids: [],
      body_length: htmlBody.replace(/<[^>]+>/g, '').length,
      disable_comment: false,
      exclude_from_creator_top: false,
      exclude_ai_learning_reward: false,
      free_body: htmlBody,
      hashtags: hashtags.map((tag) => tag.replace(/^#/, '')),
      image_keys: [],
      index: false,
      is_refund: false,
      limited: false,
      magazine_ids: [],
      magazine_keys: [],
      name: title,
      pay_body: '',
      price: 0,
      send_notifications_flag: true,
      separator: null,
      slug: `slug-${noteKey}`,
      status: 'published',
      circle_permissions: [],
      discount_campaigns: [],
      lead_form: { is_active: false, consent_url: '' },
      line_add_friend: { is_active: false, keyword: '', add_friend_url: '' },
    }),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`Publish failed: HTTP ${response.status} ${body}`)
  }

  return (await response.json()) as NotePublishResponse
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
    const headers = buildHeaders(token)

    process.stdout.write(`[note] Publishing: ${article.title}\n`)

    // Step 1: Create blank draft
    const { id: articleId, key: noteKey } = await createDraft(headers)
    process.stdout.write(`[note] Draft created: id=${articleId}, key=${noteKey}\n`)

    // Step 2: Convert markdown to HTML and save draft
    const htmlBody = markdownToNoteHtml(article.body)
    await saveDraft(headers, articleId, article.title, htmlBody)
    process.stdout.write(`[note] Draft saved\n`)

    // Step 3: Publish
    const publishData = await publishDraft(
      headers,
      articleId,
      noteKey,
      article.title,
      htmlBody,
      article.tags,
    )

    const articleUrl = publishData.data?.note_url
      ?? `https://note.com/kenji_h_ai/n/${noteKey}`

    process.stdout.write(`[note] Published: ${articleUrl}\n`)

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
