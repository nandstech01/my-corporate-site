/**
 * Hard gate for the command-center agent routes (Phase 3).
 * These spawn the real Claude Code CLI in full-auto, so they MUST only ever be
 * reachable on the local kiosk machine — never on public Vercel.
 *
 * Double gate: env flag (set only in the kiosk's .env.local) AND localhost host.
 */
export function isLocalCommandCenter(req: Request): boolean {
  if (process.env.COMMAND_CENTER_LOCAL !== '1') return false
  try {
    const host = new URL(req.url).hostname
    return host === 'localhost' || host === '127.0.0.1' || host === '::1'
  } catch {
    return false
  }
}
