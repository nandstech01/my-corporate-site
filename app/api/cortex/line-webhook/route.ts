import { NextRequest, NextResponse } from 'next/server'
import { verifyLineSignature, handleLineWebhook } from '@/lib/cortex/line/webhook-handler'

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-line-signature')
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    const bodyText = await request.text()

    if (!verifyLineSignature(bodyText, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const body = JSON.parse(bodyText)

    // Process asynchronously - LINE expects 200 within 1 second
    handleLineWebhook(body).catch(err => {
      console.error('[cortex-line-webhook] Background processing error:', err)
    })

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('[cortex-line-webhook] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// LINE webhook verification (GET request for URL verification)
export async function GET() {
  return NextResponse.json({ status: 'ok' })
}
