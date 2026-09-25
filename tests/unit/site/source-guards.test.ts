import { readFileSync, readdirSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

/**
 * ソースに事実と違う表示が戻ってこないかを文字列で見張る。
 * - X の @nands_tech は存在しない (正しくは @NANDS_AI)。
 * - ISO/IEC 27001 (ISMS) とプライバシーマークは登録がない (2026-09-26 に ISMS-AC・JIPDEC の公式検索で確認)。
 * - SOC 2 の報告書・認証はない。
 * - nands.jp は同名の別会社のドメイン。自社は nands.tech。
 * - Facebook の nands.tech と GitHub の nands-tech は別人のアカウント (自社 GitHub は nandstech01)。
 * - 政府機関を装った @id (gov.japan) を作らない。
 */

const ROOT = path.resolve(__dirname, '../../..')
const SOURCE_DIRS = ['app', 'lib', 'components', 'src']
const SKIP_DIRS = new Set(['node_modules', '.next'])
const TEXT_FILE = /\.(ts|tsx|js|jsx|mjs|cjs|md|mdx|json)$/

function listFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return SKIP_DIRS.has(entry.name) ? [] : listFiles(full)
    return TEXT_FILE.test(entry.name) ? [full] : []
  })
}

const SOURCE_FILES = SOURCE_DIRS.flatMap((dir) => listFiles(path.join(ROOT, dir)))

/** pattern に一致する行を "path:line: text" で返す */
function findLines(pattern: RegExp): string[] {
  return SOURCE_FILES.flatMap((file) =>
    readFileSync(file, 'utf8')
      .split('\n')
      .flatMap((line, index) =>
        pattern.test(line) ? [`${path.relative(ROOT, file)}:${index + 1}: ${line.trim()}`] : []
      )
  )
}

/**
 * 当社の主張ではない正当な言及だけを行単位で許可する。理由を必ず書き、増やすときは出典を確認する。
 */
const ALLOWED_LINES: ReadonlyArray<{ file: string; includes: string; reason: string }> = [
  {
    file: 'app/ai-agents/components/AIAgentTechStack.tsx',
    includes: '"セキュリティ": "SOC2・GDPR準拠"',
    reason:
      '他社製品 Zapier Enterprise の仕様欄。Zapier 自身が SOC 2 Type II 取得と GDPR 準拠を公表している ' +
      '(zapier.com/legal/data-privacy・trust.zapier.com を 2026-09-26 に確認)。当社の認証の主張ではない',
  },
]

function isAllowed(hit: string): boolean {
  return ALLOWED_LINES.some(({ file, includes }) => hit.startsWith(`${file}:`) && hit.includes(includes))
}

/** 許可リストを除いた一致行 */
function findClaims(pattern: RegExp): string[] {
  return findLines(pattern).filter((hit) => !isAllowed(hit))
}

describe('source guards', () => {
  it('scans the source tree', () => {
    expect(SOURCE_FILES.length).toBeGreaterThan(100)
  })

  it('never refers to the non-existent X account nands_tech', () => {
    expect(findLines(/nands_tech/i)).toEqual([])
  })

  it('does not claim ISO 27001 or Privacy Mark status the company does not hold', () => {
    const claims = /ISO\s*\/?\s*(IEC\s*)?27001(\s*:\s*20\d\d|[^、。'"]{0,12}(準拠|認証取得|取得済))|プライバシーマーク\s*(認定|取得|付与)/
    expect(findClaims(claims)).toEqual([])
  })

  it('does not claim SOC 2 status the company does not hold', () => {
    expect(findClaims(/SOC\s?2[^、。'"]{0,12}(準拠|認証|取得)/i)).toEqual([])
  })

  it('never uses nands.jp (a different company with the same name)', () => {
    expect(findClaims(/\bnands\.jp\b/i)).toEqual([])
  })

  it('never links the Facebook / GitHub accounts that belong to other people', () => {
    expect(findClaims(/facebook\.com\/nands\.tech|github\.com\/nands-tech\b/i)).toEqual([])
  })

  it('never invents a government @id', () => {
    expect(findClaims(/gov\.japan/i)).toEqual([])
  })

  it('keeps every allowlist entry pointed at a line that still exists', () => {
    for (const { file, includes } of ALLOWED_LINES) {
      expect(readFileSync(path.join(ROOT, file), 'utf8')).toContain(includes)
    }
  })
})

describe('app/layout.tsx', () => {
  const layout = readFileSync(path.join(ROOT, 'app/layout.tsx'), 'utf8')

  it('renders the site graph as a plain script so it is in the server HTML', () => {
    expect(layout).toContain('toJsonLdScript(buildSiteGraph())')
    expect(layout).not.toMatch(/<Script[^>]*application\/ld\+json/)
  })

  it('does not declare hreflang alternates that point every page at the home page', () => {
    expect(layout).not.toMatch(/hrefLang/i)
    expect(layout).not.toMatch(/languages\s*:/)
  })

  it('does not set a site-wide canonical or og:url (pages without their own would point at the home page)', () => {
    expect(layout).not.toMatch(/^\s*canonical\s*:/m)
    const openGraph = layout.match(/\n  openGraph: \{\n([\s\S]*?)\n  \},\n/)
    expect(openGraph).not.toBeNull()
    // 直下の url (4 スペース) だけを見る。images[].url は残す
    expect(openGraph![1]).not.toMatch(/^ {4}url\s*:/m)
  })
})

describe('key routes', () => {
  const read = (file: string) => readFileSync(path.join(ROOT, file), 'utf8')

  it.each([
    ['app/page.tsx', "'https://nands.tech'"],
    ['app/about/page.tsx', "'https://nands.tech/about'"],
    ['app/faq/page.tsx', "'https://nands.tech/faq'"],
    ['app/corporate/page.tsx', "'https://nands.tech/corporate'"],
    ['app/ai-agents/page.tsx', '`${SITE_URL}/ai-agents`'],
    ['app/system-development/page.tsx', "'https://nands.tech/system-development'"],
    ['app/aio-seo/page.tsx', '`${SITE_URL}/aio-seo`'],
    ['app/vector-rag/page.tsx', "'https://nands.tech/vector-rag'"],
    ['app/mcp-servers/page.tsx', "'https://nands.tech/mcp-servers'"],
    ['app/sns-automation/page.tsx', "'https://nands.tech/sns-automation'"],
    ['app/hr-solutions/page.tsx', '`${SITE_URL}/hr-solutions`'],
    ['app/video-generation/page.tsx', "'https://nands.tech/video-generation'"],
    ['app/chatbot-development/page.tsx', "'https://nands.tech/chatbot-development'"],
  ])('%s declares its own canonical', (file, url) => {
    expect(read(file)).toContain(`canonical: ${url}`)
  })
})

describe('app/page.tsx (home)', () => {
  const home = readFileSync(path.join(ROOT, 'app/page.tsx'), 'utf8')

  it('builds its #organization node from the single-source organizationNode()', () => {
    expect(home).toContain('...organizationNode(),')
  })

  it('has no inline founder Person, invented credentials or subsidy markup', () => {
    expect(home).not.toMatch(/"founder"\s*:/)
    expect(home).not.toContain('hasCredential')
    expect(home).not.toMatch(/includeGovernmentBenefits:\s*true/)
  })
})

describe('app/lp/page.tsx', () => {
  it('does not emit its own Organization node (the layout provides #organization)', () => {
    const lp = readFileSync(path.join(ROOT, 'app/lp/page.tsx'), 'utf8')
    const orgLines = lp.split('\n').filter((line) => /'@type':\s*'Organization'/.test(line))
    expect(orgLines.length).toBeGreaterThan(0)
    for (const line of orgLines) expect(line).toContain("'@id'")
  })
})
