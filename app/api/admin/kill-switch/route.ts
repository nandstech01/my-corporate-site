/**
 * AI Judge Kill Switch API
 *
 * GET  - キルスイッチ状態取得
 * POST - キルスイッチ有効化/無効化
 *
 * 認証: Authorization: Bearer {ADMIN_API_SECRET}
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  getKillSwitchStatus,
  activateKillSwitch,
  deactivateKillSwitch,
} from '@/lib/ai-judge/emergency'

export const dynamic = 'force-dynamic'

// ============================================================
// Auth
// ============================================================

function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return false

  const secret = process.env.ADMIN_API_SECRET
  if (!secret) return false

  const token = authHeader.replace('Bearer ', '')
  return token === secret
}

// ============================================================
// GET - Kill Switch Status
// ============================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 },
    )
  }

  try {
    const status = await getKillSwitchStatus()
    return NextResponse.json({ success: true, data: status })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: `Failed to get kill switch status: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    )
  }
}

// ============================================================
// POST - Activate / Deactivate
// ============================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 },
    )
  }

  let body: { action?: string; reason?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON body' },
      { status: 400 },
    )
  }

  const { action, reason } = body

  if (action !== 'activate' && action !== 'deactivate') {
    return NextResponse.json(
      { success: false, error: 'action must be "activate" or "deactivate"' },
      { status: 400 },
    )
  }

  try {
    if (action === 'activate') {
      await activateKillSwitch(reason ?? 'Activated via admin API', 'api')
    } else {
      await deactivateKillSwitch()
    }

    const status = await getKillSwitchStatus()
    return NextResponse.json({ success: true, data: status })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: `Failed to ${action} kill switch: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    )
  }
}
