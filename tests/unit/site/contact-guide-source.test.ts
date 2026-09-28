import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'

const inserted: Record<string, unknown>[] = []
const sendMail = vi.fn(async () => ({}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: (table: string) => ({
      insert: async (row: Record<string, unknown>) => {
        inserted.push({ table, ...row })
        return { error: null }
      },
    }),
  }),
}))
vi.mock('nodemailer', () => ({ default: { createTransport: () => ({ sendMail }) } }))
vi.mock('googleapis', () => ({ google: {} }))

import { POST } from '@/app/api/contact/route'
import { contactMailSubject, normalizeContactSource } from '@/app/api/contact/source'
import { guideContactSource } from '@/components/guide/ConsultCta'
import { metadata as searchMetadata } from '@/app/search/layout'

const ENV_KEYS = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'DISCORD_WEBHOOK_URL', 'GA4_MP_API_SECRET', 'GOOGLE_SHEETS_SPREADSHEET_ID'] as const
const savedEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]))

const firstTouch = `nands_ft=${encodeURIComponent(JSON.stringify({ p: '/posts/claude-code-guide', r: 'https://chatgpt.com/' }))}`

beforeEach(() => {
  inserted.length = 0
  sendMail.mockClear()
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role'
  delete process.env.DISCORD_WEBHOOK_URL
  delete process.env.GA4_MP_API_SECRET
  delete process.env.GOOGLE_SHEETS_SPREADSHEET_ID
})

afterAll(() => {
  for (const key of ENV_KEYS) {
    if (savedEnv[key] === undefined) delete process.env[key]
    else process.env[key] = savedEnv[key]
  }
})

describe('/api/contact: ガイドの相談フォーム (source: guide:<slug>)', () => {
  it('JSON の送信を受け付け、inquiries に source と流入元 (landing_path・channel) を記録する', async () => {
    const response = await POST(
      new Request('https://nands.tech/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: `foo=1; ${firstTouch}` },
        body: JSON.stringify({
          name: '山田',
          email: 'yamada@example.com',
          company: '例社',
          message: '導入の相談',
          source: guideContactSource('claude-code-guide'),
        }),
      })
    )

    expect(response.status).toBe(200)
    expect(inserted).toHaveLength(1)
    expect(inserted[0]).toMatchObject({
      table: 'inquiries',
      source: 'guide:claude-code-guide',
      landing_path: '/posts/claude-code-guide',
      channel: 'ai',
      ai_engine: 'chatgpt',
      name: '山田',
      email: 'yamada@example.com',
    })
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: '【ガイド】ご相談がありました',
        text: expect.stringContaining('送信元: guide:claude-code-guide'),
      })
    )
  })

  it('JS が動かないとき (form の POST) も hidden の source を記録する。無ければ従来どおり corporate', async () => {
    const form = new FormData()
    form.set('name', '佐藤')
    form.set('email', 'sato@example.com')
    form.set('message', '相談')
    form.set('source', 'guide:codex-guide')
    await POST(new Request('https://nands.tech/api/contact', { method: 'POST', body: form }))

    const legacy = new FormData()
    legacy.set('name', '鈴木')
    await POST(new Request('https://nands.tech/api/contact', { method: 'POST', body: legacy }))

    expect(inserted.map((row) => row.source)).toEqual(['guide:codex-guide', 'corporate'])
  })

  it('送信元の値を整える (文字列以外・制御文字・長すぎる値)', () => {
    expect(normalizeContactSource(' guide:x ')).toBe('guide:x')
    expect(normalizeContactSource({ evil: true })).toBe('')
    expect(normalizeContactSource(undefined)).toBe('')
    expect(normalizeContactSource('guide:a\nb\u0000c')).toBe('guide:abc')
    expect(normalizeContactSource(`guide:${'x'.repeat(300)}`)).toHaveLength(200)
    expect(normalizeContactSource('=HYPERLINK("https://evil.example")')).toBe('HYPERLINK("https://evil.example")')
    expect(contactMailSubject('corporate')).toBe('【AI副業セミナー】お問い合わせがありました')
  })
})

describe('/search は noindex (リンクはたどる)', () => {
  it('robots: index=false, follow=true', () => {
    expect(searchMetadata.robots).toEqual({ index: false, follow: true })
  })
})
