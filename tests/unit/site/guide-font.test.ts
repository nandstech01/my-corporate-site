import { readFileSync, readdirSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import {
  GOOGLE_CSS_BASE,
  GUIDE_UI_TEXT,
  MAX_TEXT_PARAM,
  googleCssUrl,
  gstaticUrl,
  guideFontCharacters,
  guideFontHref,
  rewriteGuideFontCss,
} from '@/components/guide/guide-font'

const SUBSET_400 = '/l/font?kit=Z9XNDn9KbTDf6_f7dISNqYf_tvPT1C_4jtJ_jSJeMjdBvTA8nXyfgNcJtxx0Mb_ZUiVCUT-Ga4RpWgXy-d-stzI&skey=72bca9e466ce144b&v=v7'
const SUBSET_700 = '/l/font?kit=Z9XKDn9KbTDf6_f7dISNqYf_tvPT7JbXrN9VvQ5-LiYi3GQbt3GLls6aRvB0MYLZUipCUTiGaqBpWgT0__6snBbNyy4&skey=c0b260884c85040c&v=v7'
const SLICE = '/s/ibmplexsansjp/v7/Z9XNDn9KbTDf6_f7dISNqYf_tvPT1C_4jtJ__RJ0DGhjgjA2nWOKrMaPU-Ti328q0A.0.woff2'

/** Google が text= に返す CSS (2026-09-29 に取得した形) */
const GOOGLE_SUBSET_CSS = `@font-face {
  font-family: 'IBM Plex Sans JP';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(https://fonts.gstatic.com${SUBSET_400}) format('woff2');
  unicode-range: U+20, U+2e, U+35, U+43, U+4f, U+61, U+64-65, U+3099, U+30a4, U+5b8c;
}
@font-face {
  font-family: 'IBM Plex Sans JP';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url(https://fonts.gstatic.com${SUBSET_700}) format('woff2');
  unicode-range: U+20, U+2e, U+35, U+43, U+4f, U+61, U+64-65, U+3099, U+30a4, U+5b8c;
}
`

const fileHref = (upstreamPath: string) => `/api/guide-font/file?u=${encodeURIComponent(upstreamPath)}`

describe('ガイドの書体の URL (ページの文字だけの部分集合)', () => {
  it('ページの文字 + 部品の文字 + 英数字を重複なく入れる (改行などは入れない)', () => {
    const chars = guideFontCharacters(['完全ガイド\n完全', 'Opus 5.5'])
    expect(chars).toContain('完')
    expect(chars.match(/完/g)).toHaveLength(1)
    expect(chars).not.toContain('\n')
    for (const char of 'AZaz09$~  図目次') expect(chars).toContain(char)
  })

  it('自社のドメインの CSS を指す (本番の CSP が Google Fonts を止めるため)。長すぎるページは text= を付けない', () => {
    const href = guideFontHref(['完全ガイド'])
    expect(href).toMatch(/^\/api\/guide-font\?text=/)
    expect(new URLSearchParams(href.slice(href.indexOf('?') + 1)).get('text')).toBe(guideFontCharacters(['完全ガイド']))
    const manyKanji = Array.from({ length: 1200 }, (_, i) => String.fromCodePoint(0x4e00 + i)).join('')
    expect(guideFontHref([manyKanji])).toBe('/api/guide-font')
    expect(encodeURIComponent(guideFontCharacters(['完全ガイド'])).length).toBeLessThan(MAX_TEXT_PARAM)
  })

  it('ガイドの部品のソースに書かれた日本語の文字は、すべて GUIDE_UI_TEXT に入っている (部品に語を足したら書体にも足す)', () => {
    const dir = path.join(__dirname, '../../../components/guide')
    const files = readdirSync(dir).filter((file) => /\.(tsx|ts|css)$/.test(file) && file !== 'guide-font.ts')
    const missing = new Set<string>()
    for (const file of files) {
      const source = readFileSync(path.join(dir, file), 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
        .replace(/^\s*\/\/.*$/gm, '')
        .replace(/\s\/\/ .*$/gm, '')
        // 画面に出ない文字: サーバーのログと読み上げ用の aria-label
        .replace(/^.*warnServer\(.*$/gm, '')
        .replace(/aria-label="[^"]*"/g, '')
      // 文字列・JSX の文字・CSS の content にある日本語 (コメントを除いたもの)
      const strings = source.match(/'[^'\n]*'|"[^"\n]*"|`[^`]*`|>[^<>{}\n]+</g) ?? []
      for (const literal of strings) {
        for (const char of literal) {
          if (/[぀-ヿ㐀-鿿！-｠→]/.test(char) && !GUIDE_UI_TEXT.includes(char)) missing.add(`${char} (${file})`)
        }
      }
    }
    // 見出しの語の判定に使う正規表現の文字 (約・各・年・月、行頭に置かない約物) は画面に出ない
    const ignored = /^[約各全第計毎最大小平均合直近年月、。，．・：；？！）」』】〕〉》”’ー…％ぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮヵヶ々（ヿ-]/
    expect([...missing].filter((entry) => !ignored.test(entry))).toEqual([])
  })
})

describe('Google の CSS の URL (自社の CSS の道の text= から)', () => {
  it('text= があれば付け、無い・空なら小分けの CSS', () => {
    expect(googleCssUrl('完全ガイド')).toBe(`${GOOGLE_CSS_BASE}&text=${encodeURIComponent('完全ガイド')}`)
    expect(googleCssUrl(null)).toBe(GOOGLE_CSS_BASE)
    expect(googleCssUrl('')).toBe(GOOGLE_CSS_BASE)
  })

  it('長すぎる text= と制御文字は受け付けない', () => {
    expect(googleCssUrl('あ'.repeat(3000))).toBeNull()
    expect(googleCssUrl('a\nb')).toBeNull()
    expect(googleCssUrl('a\u007fb')).toBeNull()
  })
})

describe('書体のファイルの取り寄せ先 (fonts.gstatic.com の決まった形だけ)', () => {
  it('部分集合と小分けのファイルは通す (Google が初めて見る文字の組の長い kit も)', () => {
    expect(gstaticUrl(SUBSET_400)).toBe(`https://fonts.gstatic.com${SUBSET_400}`)
    expect(gstaticUrl(SLICE)).toBe(`https://fonts.gstatic.com${SLICE}`)
    // text= の上限の 759 字で kit は約 3,000 字 (2026-09-29 に実測)
    const longKit = `/l/font?kit=${'Ab_9-'.repeat(620)}&skey=72bca9e466ce144b&v=v7`
    expect(gstaticUrl(longKit)).toBe(`https://fonts.gstatic.com${longKit}`)
    expect(gstaticUrl(`/l/font?kit=${'A'.repeat(8193)}&skey=72bca9e466ce144b&v=v7`)).toBeNull()
  })

  it('ほかのホスト・ほかの書体・道の上り・余計な引数・空は通さない', () => {
    for (const bad of [
      null,
      '',
      '//evil.example/x.woff2',
      'https://evil.example/l/font?kit=abcdefgh&skey=0123456789abcdef&v=v7',
      '@evil.example/l/font?kit=abcdefgh&skey=0123456789abcdef&v=v7',
      '/s/notosansjp/v7/abcdefghij.0.woff2',
      '/s/ibmplexsansjp/v7/../../../etc/passwd.0.woff2',
      `${SUBSET_400}&x=1`,
      `${SUBSET_400}#frag`,
      '/l/font?kit=abc<d&skey=0123456789abcdef&v=v7',
    ]) {
      expect(gstaticUrl(bad)).toBeNull()
    }
  })
})

describe('Google の CSS の組み立て直し (検査した @font-face の値だけ)', () => {
  it('書体のファイルを自社の道に向け、unicode-range と太さを残す', () => {
    const css = rewriteGuideFontCss(GOOGLE_SUBSET_CSS)
    expect(css).not.toBeNull()
    expect(css).not.toContain('fonts.gstatic.com')
    expect(css).toContain(`src: url(${fileHref(SUBSET_400)}) format('woff2');`)
    expect(css).toContain(`src: url(${fileHref(SUBSET_700)}) format('woff2');`)
    expect(css?.match(/@font-face/g)).toHaveLength(2)
    expect(css).toContain('font-weight: 700;')
    expect(css).toContain('font-display: swap;')
    expect(css).toContain('unicode-range: U+20, U+2e, U+35, U+43, U+4f, U+61, U+64-65, U+3099, U+30a4, U+5b8c;')
  })

  it('小分けの CSS (text= が長すぎるページ) も同じく組み立て直す', () => {
    const css = rewriteGuideFontCss(GOOGLE_SUBSET_CSS.replace(SUBSET_400, SLICE))
    expect(css).toContain(`src: url(${fileHref(SLICE)}) format('woff2');`)
  })

  it('よその URL・ほかの書体・余計な宣言・壊れた値は捨てる (CSS や HTML を差し込ませない)', () => {
    const hostile = [
      "@font-face { font-family: 'IBM Plex Sans JP'; font-style: normal; font-weight: 400; src: url(https://evil.example/x.woff2) format('woff2'); }",
      "@font-face { font-family: 'Evil'; font-style: normal; font-weight: 400; src: url(https://fonts.gstatic.com" + SUBSET_400 + ") format('woff2'); }",
      "@font-face { font-family: 'IBM Plex Sans JP'; font-style: normal; font-weight: 400; src: url(https://fonts.gstatic.com" + SUBSET_400 + ") format('woff2'); unicode-range: U+20</style><script>alert(1)</script>; }",
      "body { background: url(https://evil.example/track.png) }",
      "@font-face { font-family: 'IBM Plex Sans JP'; font-style: oblique 10deg; font-weight: 400; src: url(https://fonts.gstatic.com" + SUBSET_400 + ") format('woff2'); }",
    ].join('\n')
    expect(rewriteGuideFontCss(hostile)).toBeNull()

    const mixed = rewriteGuideFontCss(`${hostile}\n${GOOGLE_SUBSET_CSS}\n@font-face { font-family: 'IBM Plex Sans JP'; font-style: normal; font-weight: 400; src: url(https://fonts.gstatic.com${SUBSET_400}) format('woff2'); background: red; }`)
    expect(mixed?.match(/@font-face/g)).toHaveLength(3)
    expect(mixed).not.toMatch(/evil|script|background|<|>/)
  })

  it('@font-face が 1 つも無ければ null', () => {
    expect(rewriteGuideFontCss('')).toBeNull()
    expect(rewriteGuideFontCss('<html>error</html>')).toBeNull()
  })
})
