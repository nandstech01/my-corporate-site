import { readFileSync, readdirSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { GUIDE_UI_TEXT, MAX_TEXT_PARAM, guideFontCharacters, guideFontHref } from '@/components/guide/guide-font'

const BASE = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+JP:wght@400;700&display=swap'

describe('ガイドの書体の URL (ページの文字だけの部分集合)', () => {
  it('ページの文字 + 部品の文字 + 英数字を重複なく入れる (改行などは入れない)', () => {
    const chars = guideFontCharacters(['完全ガイド\n完全', 'Opus 5.5'])
    expect(chars).toContain('完')
    expect(chars.match(/完/g)).toHaveLength(1)
    expect(chars).not.toContain('\n')
    for (const char of 'AZaz09$~  図目次') expect(chars).toContain(char)
  })

  it('text= 付きの URL。長すぎるページは text= を付けない (Google が無視するため小分けの CSS)', () => {
    expect(guideFontHref(['完全ガイド'])).toMatch(/^https:\/\/fonts\.googleapis\.com\/css2\?family=IBM\+Plex\+Sans\+JP:wght@400;700&display=swap&text=/)
    const manyKanji = Array.from({ length: 1200 }, (_, i) => String.fromCodePoint(0x4e00 + i)).join('')
    expect(guideFontHref([manyKanji])).toBe(BASE)
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
