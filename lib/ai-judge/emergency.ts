/**
 * AI Judge 緊急停止システム
 *
 * キルスイッチ・自動停止条件・Slack連携停止
 */

import { createClient } from '@supabase/supabase-js'
import { AUTO_STOP_ZERO_ENGAGEMENT_COUNT } from './config'
import { notifySafetyEvent } from './slack-notifier'
import type { KillSwitchStatus } from './types'

// ============================================================
// Supabase Client
// ============================================================

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  }
  return createClient(url, key)
}

// ============================================================
// Kill Switch 状態確認
// ============================================================

export async function isKillSwitchActive(): Promise<boolean> {
  if (process.env.AI_JUDGE_ENABLED !== 'true') {
    return true
  }

  try {
    const supabase = getSupabase()
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('safety_events')
      .select('id')
      .eq('event_type', 'manual_pause')
      .eq('active', true)
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .limit(1)

    if (error) {
      throw new Error(`Failed to check kill switch: ${error.message}`)
    }

    return (data?.length ?? 0) > 0
  } catch (error) {
    throw new Error(
      `Kill switch check failed: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

// ============================================================
// Kill Switch 有効化
// ============================================================

export async function activateKillSwitch(
  reason: string,
  activatedBy: KillSwitchStatus['activatedBy'],
): Promise<void> {
  try {
    const supabase = getSupabase()

    const { error } = await supabase.from('safety_events').insert({
      event_type: 'manual_pause',
      description: reason,
      severity: 'critical',
      platforms_affected: ['x', 'linkedin', 'instagram'],
      keywords: [],
      active: true,
      created_by: activatedBy,
    })

    if (error) {
      throw new Error(`Failed to activate kill switch: ${error.message}`)
    }

    await notifySafetyEvent({
      eventType: 'kill_switch',
      severity: 'critical',
      summary: reason,
    })
  } catch (error) {
    throw new Error(
      `Kill switch activation failed: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

// ============================================================
// Kill Switch 無効化
// ============================================================

export async function deactivateKillSwitch(): Promise<void> {
  try {
    const supabase = getSupabase()
    const now = new Date().toISOString()

    const { error } = await supabase
      .from('safety_events')
      .update({ active: false, resolved_at: now })
      .eq('event_type', 'manual_pause')
      .eq('active', true)

    if (error) {
      throw new Error(`Failed to deactivate kill switch: ${error.message}`)
    }

    await notifySafetyEvent({
      eventType: 'kill_switch',
      severity: 'medium',
      summary: 'キルスイッチを解除しました',
    })
  } catch (error) {
    throw new Error(
      `Kill switch deactivation failed: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

// ============================================================
// 自動停止条件チェック
// ============================================================

export async function checkAutoStopConditions(): Promise<boolean> {
  try {
    const supabase = getSupabase()
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from('ai_judge_decisions')
      .select('actual_engagement, posted_at')
      .eq('was_posted', true)
      .order('created_at', { ascending: false })
      .limit(AUTO_STOP_ZERO_ENGAGEMENT_COUNT)

    if (error) {
      throw new Error(`Failed to check auto-stop conditions: ${error.message}`)
    }

    if (!data || data.length < AUTO_STOP_ZERO_ENGAGEMENT_COUNT) {
      return false
    }

    const allZeroEngagement = data.every((record) => {
      if (!record.posted_at || record.posted_at > twentyFourHoursAgo) {
        return false
      }

      if (!record.actual_engagement) {
        return true
      }

      const engagement = record.actual_engagement as Record<string, number>
      const totalEngagement = Object.values(engagement).reduce(
        (sum, val) => sum + (typeof val === 'number' ? val : 0),
        0,
      )

      return totalEngagement === 0
    })

    if (allZeroEngagement) {
      await activateKillSwitch(
        `${AUTO_STOP_ZERO_ENGAGEMENT_COUNT}件連続ゼロエンゲージメント自動停止`,
        'auto',
      )
      return true
    }

    return false
  } catch (error) {
    throw new Error(
      `Auto-stop check failed: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

// ============================================================
// Slack Kill Switch ハンドラー
// ============================================================

export async function handleSlackKillSwitch(text: string): Promise<boolean> {
  const normalized = text.toLowerCase().trim()

  if (!normalized.includes('stop auto')) {
    return false
  }

  await activateKillSwitch('Slack DMからの手動停止', 'slack')
  return true
}

// ============================================================
// Kill Switch ステータス取得
// ============================================================

export async function getKillSwitchStatus(): Promise<KillSwitchStatus> {
  try {
    const supabase = getSupabase()
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('safety_events')
      .select('description, created_at, created_by, expires_at')
      .eq('event_type', 'manual_pause')
      .eq('active', true)
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      throw new Error(`Failed to get kill switch status: ${error.message}`)
    }

    if (!data || data.length === 0) {
      return {
        active: false,
        activatedBy: 'manual',
      }
    }

    const record = data[0]
    return {
      active: true,
      reason: record.description,
      activatedAt: record.created_at,
      activatedBy: record.created_by as KillSwitchStatus['activatedBy'],
      expiresAt: record.expires_at ?? undefined,
    }
  } catch (error) {
    throw new Error(
      `Kill switch status check failed: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}
