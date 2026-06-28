/**
 * LinkedIn OAuth ヘルパー（トークン再取得）
 *
 * LinkedInのアクセストークンは60日で失効する。自動リフレッシュは無いため、
 * このスクリプトで3-legged OAuthをやり直し、新しいトークンを取得する。
 *
 * やること:
 *   1. ローカルにコールバック用サーバーを立てる (http://localhost:53682/callback)
 *   2. 認可URLをブラウザで開く → あなたが「許可」をクリック
 *   3. 返ってきた code をアクセストークンに交換
 *   4. userinfo から person id を取得
 *   5. .env.local の LINKEDIN_ACCESS_TOKEN / LINKEDIN_PERSON_ID /
 *      LINKEDIN_TOKEN_EXPIRES_AT を自動更新（他の行は触らない）
 *
 * 事前準備（.env.local に必要）:
 *   LINKEDIN_CLIENT_ID=...        ← LinkedIn Developer Portal の Auth タブ
 *   LINKEDIN_CLIENT_SECRET=...    ← 同上
 * 任意:
 *   LINKEDIN_REDIRECT_URI=http://localhost:53682/callback （既定値。Portalに登録した値と一致させる）
 *
 * 実行: npx tsx scripts/linkedin-oauth.ts
 */

import { createServer } from 'node:http'
import { randomBytes } from 'node:crypto'
import { spawn } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { config } from 'dotenv'

config({ path: '.env.local' })

const ENV_PATH = '.env.local'
const REDIRECT_URI =
  process.env.LINKEDIN_REDIRECT_URI ?? 'http://localhost:53682/callback'
const PORT = Number(new URL(REDIRECT_URI).port || '53682')
// openid+profile で person id を取得、w_member_social で投稿権限
const SCOPE = 'openid profile w_member_social'

function fail(msg: string): never {
  process.stderr.write(`\n❌ ${msg}\n`)
  process.exit(1)
}

function upsertEnv(content: string, key: string, value: string): string {
  const line = `${key}=${value}`
  const re = new RegExp(`^${key}=.*$`, 'm')
  return re.test(content) ? content.replace(re, line) : `${content.trimEnd()}\n${line}\n`
}

async function exchangeCodeForToken(code: string, clientId: string, clientSecret: string) {
  const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: REDIRECT_URI,
    }),
  })
  const json = (await res.json()) as { access_token?: string; expires_in?: number; error_description?: string }
  if (!res.ok || !json.access_token) {
    fail(`トークン交換に失敗 (${res.status}): ${json.error_description ?? JSON.stringify(json)}`)
  }
  return { accessToken: json.access_token!, expiresIn: json.expires_in ?? 60 * 24 * 3600 }
}

async function fetchPersonId(accessToken: string): Promise<string> {
  const res = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const json = (await res.json()) as { sub?: string; message?: string }
  if (!res.ok || !json.sub) {
    fail(`person id 取得に失敗 (${res.status}): ${json.message ?? JSON.stringify(json)}`)
  }
  return json.sub!
}

async function main(): Promise<void> {
  const clientId = process.env.LINKEDIN_CLIENT_ID
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    fail(
      '.env.local に LINKEDIN_CLIENT_ID と LINKEDIN_CLIENT_SECRET を設定してください。\n' +
        '   （LinkedIn Developer Portal → 対象アプリ → Auth タブ からコピー）',
    )
  }

  const state = randomBytes(16).toString('hex')
  const authUrl =
    'https://www.linkedin.com/oauth/v2/authorization?' +
    new URLSearchParams({
      response_type: 'code',
      client_id: clientId!,
      redirect_uri: REDIRECT_URI,
      scope: SCOPE,
      state,
    }).toString()

  const done = new Promise<void>((resolve) => {
    const server = createServer(async (req, res) => {
      if (!req.url?.startsWith('/callback')) {
        res.writeHead(404).end('not found')
        return
      }
      const url = new URL(req.url, REDIRECT_URI)
      const code = url.searchParams.get('code')
      const returnedState = url.searchParams.get('state')
      const error = url.searchParams.get('error')

      if (error) {
        res
          .writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' })
          .end(`<h2>認可エラー: ${error}</h2><p>${url.searchParams.get('error_description') ?? ''}</p>`)
        fail(`認可が拒否されました: ${error}`)
      }
      if (returnedState !== state) {
        res.writeHead(400).end('state mismatch')
        fail('state不一致（CSRF防止）。もう一度実行してください。')
      }
      if (!code) {
        res.writeHead(400).end('no code')
        fail('認可コードが取得できませんでした。')
      }

      process.stdout.write('\n🔑 認可コード受領 → トークンに交換中...\n')
      const { accessToken, expiresIn } = await exchangeCodeForToken(code!, clientId!, clientSecret!)
      process.stdout.write('👤 person id を取得中...\n')
      const personId = await fetchPersonId(accessToken)
      const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

      let env = readFileSync(ENV_PATH, 'utf8')
      env = upsertEnv(env, 'LINKEDIN_ACCESS_TOKEN', accessToken)
      env = upsertEnv(env, 'LINKEDIN_PERSON_ID', personId)
      env = upsertEnv(env, 'LINKEDIN_TOKEN_EXPIRES_AT', expiresAt)
      writeFileSync(ENV_PATH, env)

      res
        .writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        .end('<h2>✅ LinkedInトークンを更新しました</h2><p>このタブは閉じてOKです。ターミナルに戻ってください。</p>')
      process.stdout.write(
        `\n✅ .env.local を更新しました。\n` +
          `   LINKEDIN_PERSON_ID = ${personId}\n` +
          `   有効期限 = ${expiresAt}（約60日）\n` +
          `   ※アクセストークンの値はセキュリティのため表示しません。\n\n` +
          `次の手順: GitHub Secrets も同じ3値に更新 → cron再開。私が案内します。\n`,
      )
      server.close()
      resolve()
    })
    server.listen(PORT, () => {
      process.stdout.write(
        `\n🌐 ブラウザで以下を開いて「許可」してください（自動で開きます）:\n\n${authUrl}\n\n` +
          `（待機中... コールバック ${REDIRECT_URI} を受け付けます）\n`,
      )
      // macOSなら自動でブラウザを開く（失敗してもURLを手動で開けばOK）
      spawn('open', [authUrl], { stdio: 'ignore' }).on('error', () => {})
    })
  })

  await done
  process.exit(0)
}

main().catch((e) => fail(e instanceof Error ? e.message : String(e)))
