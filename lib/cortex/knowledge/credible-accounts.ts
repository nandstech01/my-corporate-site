/**
 * Credible Claude Code / Anthropic accounts.
 *
 * Our own account has little credibility yet, so reach is borrowed by
 * quote-RTing posts from accounts the audience already trusts. We ONLY quote
 * from this curated list — never random search hits — so every repost lends us
 * authority instead of noise.
 *
 * Tunable: add/remove handles as the credible Claude Code circle shifts.
 * Keep handles lowercase, without the leading "@".
 */

export const CREDIBLE_CC_ACCOUNTS: readonly string[] = [
  // Anthropic official
  'anthropicai',
  'claudeai',
  'claudedevs',
  // Anthropic team / DevRel (authoritative on Claude Code)
  'alexalbert__',
  // Widely-trusted AI engineering voices who cover Claude Code substantively
  'swyx',
  'simonw',
  'mckaywrigley',
]

/** Accounts whose posts we never quote (our own + obvious noise handles). */
export const REPOST_EXCLUDE_HANDLES: ReadonlySet<string> = new Set([
  'nands_tech',
  'i',
  'home',
])

/**
 * Brave query for a handle's recent posts. Uses the reactor-proven
 * `x.com <handle> ... status` shape (NOT `site:`, which returns profile pages
 * instead of individual tweets).
 */
export function credibleAccountQuery(handle: string): string {
  return `x.com ${handle} Claude Code status`
}
