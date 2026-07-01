/**
 * Local Claude Code agent runtime (Phase 3, LOCAL ONLY — gated by local-guard).
 * Spawns the real `claude` CLI with streaming JSON in/out, keeps stdin open so
 * the user can inject follow-up instructions mid-run (割り込み), auto-ends idle
 * sessions, tracks children for STOP, and audits runs to Supabase.
 */

import { spawn, type ChildProcessWithoutNullStreams } from 'child_process'
import { createClient } from '@supabase/supabase-js'

const runners = new Map<string, ChildProcessWithoutNullStreams>()
const idleTimers = new Map<string, ReturnType<typeof setTimeout>>()
const IDLE_MS = 90_000 // close stdin (graceful exit) if no follow-up for 90s

function sb() {
  const u = process.env.NEXT_PUBLIC_SUPABASE_URL
  const k = process.env.SUPABASE_SERVICE_ROLE_KEY
  return u && k ? createClient(u, k) : null
}

function auditStart(runId: string, prompt: string): void {
  const c = sb()
  if (!c) return
  void c.from('command_agent_runs')
    .insert({ run_id: runId, prompt: prompt.slice(0, 5000), status: 'running', started_at: new Date().toISOString() })
    .then(() => {}, () => {})
}

export function finishAudit(runId: string, output: string, code: number | null): void {
  const c = sb()
  if (!c) return
  void c.from('command_agent_runs')
    .update({ output: output.slice(0, 100_000), status: code === 0 ? 'done' : 'error', ended_at: new Date().toISOString() })
    .eq('run_id', runId)
    .then(() => {}, () => {})
}

/** Write one user message as a stream-json input line (does NOT close stdin). */
function writeUserMsg(child: ChildProcessWithoutNullStreams, text: string): void {
  try {
    child.stdin.write(`${JSON.stringify({ type: 'user', message: { role: 'user', content: text } })}\n`)
  } catch { /* ignore */ }
}

function clearIdle(runId: string): void {
  const t = idleTimers.get(runId)
  if (t) { clearTimeout(t); idleTimers.delete(runId) }
}
function armIdle(runId: string): void {
  clearIdle(runId)
  idleTimers.set(runId, setTimeout(() => endRun(runId), IDLE_MS))
}

/** Gracefully end a session: close stdin so claude finishes and exits. */
export function endRun(runId: string): void {
  const c = runners.get(runId)
  if (c) { try { c.stdin.end() } catch { /* ignore */ } }
  clearIdle(runId)
}

/** Keep a session alive while it's actively producing output (reset idle). */
export function touchRun(runId: string): void {
  if (runners.has(runId)) armIdle(runId)
}

/** Inject a follow-up instruction into a running session (割り込み). */
export function sendToRun(runId: string, text: string): boolean {
  const c = runners.get(runId)
  if (!c) return false
  writeUserMsg(c, text)
  armIdle(runId)
  return true
}

export function killRun(runId: string): boolean {
  const p = runners.get(runId)
  clearIdle(runId)
  if (!p) return false
  try { p.kill('SIGTERM') } catch { /* ignore */ }
  runners.delete(runId)
  return true
}

export function unregister(runId: string): void {
  clearIdle(runId)
  runners.delete(runId)
}

export interface AgentHandle {
  runId: string
  child: ChildProcessWithoutNullStreams
}

export type PermMode = 'default' | 'plan' | 'acceptEdits' | 'bypassPermissions'

/** Start a Claude Code session (streaming in/out). stdin stays open for follow-ups.
 *  'default' = read-only tools auto-allowed (Read/Grep), writes blocked — good for
 *  investigate-and-answer. 'plan' only proposes a plan. */
export function startAgent(prompt: string, perm: PermMode = 'default'): AgentHandle {
  const runId = `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const bin = process.env.CLAUDE_CLI_BIN || 'claude'
  const args = [
    '-p',
    '--input-format', 'stream-json',
    '--output-format', 'stream-json',
    '--include-partial-messages',
    '--verbose',
    '--permission-mode', perm,
  ]
  const child = spawn(bin, args, {
    cwd: process.env.AGENT_CWD || process.cwd(),
    env: { ...process.env, CLAUDE_VOICE_HOOK_SUPPRESS: '1' },
  })
  runners.set(runId, child)
  writeUserMsg(child, prompt)
  try { child.stdin.end() } catch { /* ignore */ } // one-shot: the turn completes & emits a result reliably
  auditStart(runId, prompt)
  return { runId, child }
}
