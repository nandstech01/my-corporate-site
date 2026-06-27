/**
 * Local Claude Code agent runtime (Phase 3, LOCAL ONLY — gated by local-guard).
 * Spawns the real `claude` CLI in full-auto streaming mode, tracks running
 * children for STOP, and audits every run to Supabase (command_agent_runs).
 */

import { spawn, type ChildProcessWithoutNullStreams } from 'child_process'
import { createClient } from '@supabase/supabase-js'

const runners = new Map<string, ChildProcessWithoutNullStreams>()

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

export function killRun(runId: string): boolean {
  const p = runners.get(runId)
  if (!p) return false
  try { p.kill('SIGTERM') } catch { /* ignore */ }
  runners.delete(runId)
  return true
}

export interface AgentHandle {
  runId: string
  child: ChildProcessWithoutNullStreams
}

/** Start a full-auto Claude Code run; caller wires child stdout/stderr to SSE. */
export function startAgent(prompt: string): AgentHandle {
  const runId = `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const bin = process.env.CLAUDE_CLI_BIN || 'claude'
  const args = ['-p', '--output-format', 'stream-json', '--verbose', '--dangerously-skip-permissions']
  const child = spawn(bin, args, {
    cwd: process.env.AGENT_CWD || process.cwd(),
    env: { ...process.env, CLAUDE_VOICE_HOOK_SUPPRESS: '1' },
  })
  runners.set(runId, child)
  try { child.stdin.write(prompt); child.stdin.end() } catch { /* ignore */ }
  auditStart(runId, prompt)
  return { runId, child }
}

export function unregister(runId: string): void {
  runners.delete(runId)
}
