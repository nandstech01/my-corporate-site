/**
 * サーバー側の警告ログ。
 * next.config.js の compiler.removeConsole (本番) は `console.xxx(...)` の呼び出しを消すため、
 * 本番でも Vercel のログに残したい警告は globalThis 経由で呼ぶ。
 */
export function warnServer(message: string, detail?: Record<string, unknown>): void {
  const logger = globalThis.console
  if (detail) logger.warn(message, detail)
  else logger.warn(message)
}
