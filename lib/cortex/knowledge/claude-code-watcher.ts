/**
 * Claude Code Watcher
 *
 * Fetches the REAL latest Claude Code updates from authoritative sources
 * (the official GitHub CHANGELOG) plus live community buzz, and returns
 * structured topic candidates that downstream generators can turn into
 * "textbook-style" explainer threads ("何が変わったか + 使い方").
 *
 * Why this exists:
 *   The existing daily-buzz `claude-code` category only searches X for what
 *   people are tweeting about. It never reads the actual release notes, so it
 *   cannot explain a new feature accurately. This collector closes that gap —
 *   it pulls the ground-truth changelog so posts teach the real change.
 *
 * Zero additional cost: GitHub raw needs no key; community buzz reuses Brave.
 */

import { braveWebSearch } from '../../web-search/brave'

// ============================================================
// Types
// ============================================================

export type ClaudeCodeSource = 'changelog' | 'community'

export interface ClaudeCodeUpdate {
  /** Semantic version when known (e.g. "1.0.40"), else null. */
  readonly version: string | null
  /** Short headline for the update. */
  readonly title: string
  /** What actually changed — the teachable substance. */
  readonly summary: string
  /** Canonical link (changelog anchor or source tweet). */
  readonly sourceUrl: string
  readonly source: ClaudeCodeSource
  /** Author handle for community items (for quote-RT / style imitation). */
  readonly authorHandle: string | null
}

// ============================================================
// Config
// ============================================================

const CHANGELOG_RAW =
  'https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md'
const CHANGELOG_HUMAN =
  'https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md'

const FETCH_TIMEOUT_MS = 15000

// ============================================================
// Official changelog
// ============================================================

/**
 * Fetch and parse the official Claude Code CHANGELOG.
 * Returns the newest `limit` versions, each with its bullet points joined.
 */
export async function fetchChangelog(limit = 3): Promise<readonly ClaudeCodeUpdate[]> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const res = await fetch(CHANGELOG_RAW, {
      headers: { Accept: 'text/plain' },
      signal: controller.signal,
    })
    if (!res.ok) {
      throw new Error(`changelog fetch failed: ${res.status}`)
    }

    const markdown = await res.text()
    return parseChangelog(markdown, limit)
  } catch (error) {
    process.stdout.write(
      `[claude-code-watcher] changelog error: ${error instanceof Error ? error.message : String(error)}\n`,
    )
    return []
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * Parse CHANGELOG markdown shaped as `## <version>` sections followed by
 * `- bullet` lines. Pure function — no I/O — so it is unit-testable.
 */
export function parseChangelog(
  markdown: string,
  limit: number,
): readonly ClaudeCodeUpdate[] {
  // Split on version headers ("## 1.0.40"). The first chunk is the file title.
  const sections = markdown.split(/^##\s+/m).slice(1)
  const updates: ClaudeCodeUpdate[] = []

  for (const section of sections) {
    if (updates.length >= limit) break

    const newlineIdx = section.indexOf('\n')
    const heading = (newlineIdx === -1 ? section : section.slice(0, newlineIdx)).trim()
    const body = newlineIdx === -1 ? '' : section.slice(newlineIdx + 1)

    const versionMatch = heading.match(/\d+\.\d+\.\d+/)
    const version = versionMatch ? versionMatch[0] : null

    const bullets = body
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.startsWith('-') || line.startsWith('*'))
      .map((line) => line.replace(/^[-*]\s*/, '').trim())
      .filter((line) => line.length > 0)

    // Skip empty version stubs.
    if (bullets.length === 0) continue

    updates.push({
      version,
      title: version ? `Claude Code ${version}` : `Claude Code ${heading}`,
      summary: bullets.join(' / '),
      sourceUrl: version ? `${CHANGELOG_HUMAN}#${version.replace(/\./g, '')}` : CHANGELOG_HUMAN,
      source: 'changelog',
      authorHandle: 'AnthropicAI',
    })
  }

  return updates
}

// ============================================================
// Community buzz (topics + accounts to imitate / quote-RT)
// ============================================================

const COMMUNITY_QUERIES: readonly string[] = [
  'x.com status "Claude Code" tips',
  'x.com status "Claude Code" workflow',
  'x.com status "Claude Code" subagents OR hooks OR MCP',
]

/**
 * Live community buzz around Claude Code — used both as fresh topic angles and
 * as the pool of accounts whose style we imitate and whose posts we quote-RT.
 */
export async function fetchCommunityBuzz(limit = 6): Promise<readonly ClaudeCodeUpdate[]> {
  const seen = new Set<string>()
  const updates: ClaudeCodeUpdate[] = []

  for (const query of COMMUNITY_QUERIES) {
    if (updates.length >= limit) break
    try {
      const results = await braveWebSearch(query, { count: 10, freshness: 'pw' })
      for (const r of results) {
        if (updates.length >= limit) break
        const isStatus = r.url.includes('x.com/') && r.url.includes('/status/')
        if (!isStatus || seen.has(r.url)) continue
        seen.add(r.url)

        const handleMatch = r.url.match(/(?:x\.com|twitter\.com)\/([^/]+)\/status/)
        updates.push({
          version: null,
          title: r.title,
          summary: r.description,
          sourceUrl: r.url,
          source: 'community',
          authorHandle: handleMatch ? handleMatch[1] : null,
        })
      }
    } catch (error) {
      process.stdout.write(
        `[claude-code-watcher] buzz query failed "${query}": ${error instanceof Error ? error.message : String(error)}\n`,
      )
    }
    // Brave rate-limit buffer (mirror multiSearch).
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  return updates
}

// ============================================================
// Combined collection
// ============================================================

export interface ClaudeCodeDigest {
  readonly changelog: readonly ClaudeCodeUpdate[]
  readonly community: readonly ClaudeCodeUpdate[]
  /** Distinct community handles — candidates for quote-RT / style imitation. */
  readonly communityHandles: readonly string[]
}

/**
 * One call to get everything: ground-truth changelog + live community buzz.
 */
export async function collectClaudeCodeDigest(options?: {
  changelogLimit?: number
  communityLimit?: number
}): Promise<ClaudeCodeDigest> {
  const [changelog, community] = await Promise.all([
    fetchChangelog(options?.changelogLimit ?? 3),
    fetchCommunityBuzz(options?.communityLimit ?? 6),
  ])

  const handles = Array.from(
    new Set(
      community
        .map((u) => u.authorHandle)
        .filter((h): h is string => Boolean(h) && h !== 'i' && h !== 'home'),
    ),
  )

  return { changelog, community, communityHandles: handles }
}
