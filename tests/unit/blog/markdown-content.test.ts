import { readFileSync, writeFileSync } from 'fs'
import path from 'path'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

// vitest の esbuild は tsconfig の jsx: preserve により classic 変換 (React.createElement) になる
vi.stubGlobal('React', React)

import MarkdownContent from '@/components/blog/MarkdownContent'
import GuideHero from '@/components/guide/GuideHero'
import GuideToc from '@/components/guide/GuideToc'
import { splitGuideHero } from '@/app/posts/_lib/guide-blocks'
import { extractGuideToc, postModifiedAt } from '@/app/posts/_lib/post-text'

const FIXTURE = readFileSync(path.join(__dirname, '../site/fixtures/guide-sample.md'), 'utf8')

const render = (content: string, guide?: { slug: string }) =>
  renderToStaticMarkup(React.createElement(MarkdownContent, { content, guide }))

afterEach(() => {
  vi.restoreAllMocks()
})

describe('MarkdownContent (サーバー部品) の出力', () => {
  it('nands-* ブロックは部品として描き、JSON の文字を出さない', () => {
    const html = render(
      [
        '## 見出し {#h}',
        '```nands-stats',
        '{"items":[{"label":"月額","value":20,"unit":"ドル"}]}',
        '```',
        '```nands-callout',
        '{"tone":"warning","body":"注意の本文"}',
        '```',
      ].join('\n')
    )
    expect(html).toContain('data-guide-block="stats"')
    expect(html).toContain('<dd class="guide-stats__value">20ドル</dd>')
    expect(html).toContain('data-tone="warning"')
    expect(html).not.toContain('{&quot;items&quot;')
    expect(html).not.toContain('"items"')
    expect(html).not.toMatch(/<pre[^>]*>\s*<pre/) // ブロックを <pre> で包まない
  })

  it('検査に通らないブロックは何も描かず、サーバーのログに警告を残す', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const html = render(
      ['前の段落', '```nands-stats', '{"items":[{"label":"<script>alert(1)</script>","value":1}]}', '```', '```nands-unknown', '{}', '```', '後の段落'].join('\n')
    )
    expect(html).not.toContain('script')
    expect(html).not.toContain('items')
    expect(html).not.toContain('<pre')
    expect(html).toContain('前の段落')
    expect(html).toContain('後の段落')
    expect(warn).toHaveBeenCalledTimes(2)
    expect(warn.mock.calls[0][0]).toContain('[guide-block]')
  })

  it('普通のコードブロックは従来どおり (中の # は見出しにならない)', () => {
    const html = render(['```bash', '# コメント', 'echo hi', '```'].join('\n'))
    expect(html).toContain('<code class="language-bash font-mono text-sm"># コメント\necho hi</code>')
    expect(html).not.toContain('<h1')
  })

  it('見出しの id は {#id} 優先、FAQ の Q は faq-N、本文の # (h1) は描かない', () => {
    const html = render(['# タイトル', '## 料金 {#pricing}', '### Setup Guide', '#### Q: 無料ですか', '#### Q: 解約できますか'].join('\n\n'))
    expect(html).not.toContain('タイトル')
    expect(html).toMatch(/<h2 id="pricing"[^>]*>料金<\/h2>/)
    expect(html).toMatch(/<h3 id="setup-guide"[^>]*>Setup Guide<\/h3>/)
    expect(html).toMatch(/<h4 id="faq-1"[^>]*>Q: 無料ですか<\/h4>/)
    expect(html).toMatch(/<h4 id="faq-2"[^>]*>Q: 解約できますか<\/h4>/)
  })

  it('通常の記事: 3 つ目の h2 の後と FAQ の前に LINE の導線。ガイドでは出さない', () => {
    const md = ['## 一 {#a}', '## 二 {#b}', '## 三 {#c}', '## よくある質問 {#faq}'].join('\n\n')
    const lineLinks = (html: string) => (html.match(/lin\.ee/g) ?? []).length
    expect(lineLinks(render(md))).toBe(2)
    expect(lineLinks(render(md, { slug: 'x' }))).toBe(0)
  })

  it('画像: 幅・高さ・遅延読み込みを付け、段落の中にブロック要素を入れない', () => {
    const html = render('![構成図](https://example.com/a.png "800x600")\n\n![](https://example.com/b.png)')
    expect(html).toContain('width="800" height="600" loading="lazy" decoding="async"')
    expect(html).toContain('src="https://example.com/b.png" alt="" width="1200" height="630" loading="lazy"')
    expect(html).not.toMatch(/<p[^>]*>(?:(?!<\/p>).)*<(div|p)[\s>]/s)
  })

  it('生の HTML は文字として出す (実行されない)', () => {
    const html = render('<script>alert(1)</script>')
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })
})

describe('見本のガイドをページの部品で描く', () => {
  const { hero, body } = splitGuideHero(FIXTURE)
  const toc = extractGuideToc(body)
  const modifiedAt = postModifiedAt(
    { content: FIXTURE, published_at: '2026-09-01T00:00:00Z', created_at: '2026-09-01T00:00:00Z', updated_at: '2026-09-28T05:00:00Z' },
    new Date('2026-09-28T00:00:00Z')
  )
  const html = renderToStaticMarkup(
    React.createElement(
      'article',
      { 'data-layout': 'guide' },
      React.createElement(GuideHero, {
        title: 'Claude Code 完全ガイド (見本)',
        hero,
        modifiedAt,
        author: { name: '原田賢治', href: '/author/harada-kenji' },
        fallbackImage: { src: 'https://example.com/banner.png', alt: 'バナー', width: 1200, height: 630 },
      }),
      React.createElement(GuideToc, { items: toc }),
      React.createElement(MarkdownContent, { content: body, guide: { slug: 'claude-code-guide' } })
    )
  )

  it('冒頭: h1・答え・最終更新 (= 更新履歴の最新日)・著者・AI 利用・ヒーロー画像 (priority)', () => {
    expect(modifiedAt).toBe('2026-09-27T00:00:00+09:00')
    expect(html).toContain('<h1 id="main-title" class="guide-hero__title">Claude Code 完全ガイド (見本)</h1>')
    expect(html).toContain('これはガイドのブロックを確認するための見本の本文です')
    expect(html).toContain('<time dateTime="2026-09-27T00:00:00+09:00">2026年9月27日</time>')
    expect(html).toContain('<a href="/author/harada-kenji" rel="author">原田賢治</a>')
    expect(html).toContain('見本のため、この本文は人が手で書いています。')
    expect(html).toMatch(/<img[^>]*fetch[pP]riority="high"[^>]*>/)
    expect(html).toMatch(/<img[^>]*width="1200"[^>]*height="630"/)
  })

  it('目次のリンクはすべて本文の見出しの id を指し、コードの中の # は目次に入らない', () => {
    const hrefs = Array.from(html.matchAll(/class="guide-toc__link" href="#([^"]+)"/g), (m) => decodeURIComponent(m[1]))
    expect(hrefs).toEqual(['summary', 'pricing', 'flow', 'code-example', 'choose', 'history', 'changelog', 'sources'])
    for (const id of hrefs) expect(html).toContain(`id="${id}"`)
    const nav = html.slice(html.indexOf('<nav class="guide-toc"'), html.indexOf('</nav>'))
    expect(nav).not.toContain('コードの中のコメント')
    expect(html).toContain('# これはコードの中のコメントで、目次には入らない')
  })

  it('9 種類のブロックがすべて描かれ、JSON は出ない', () => {
    for (const type of ['hero', 'stats', 'chart', 'callout', 'diagram', 'decide', 'changelog', 'sources', 'cta']) {
      expect(html, type).toContain(`data-guide-block="${type}"`)
    }
    expect(html).not.toMatch(/&quot;(items|rows|nodes|entries|root)&quot;/)
  })

  it('選び方: JS なしの入れ子の <details> と、常に見える結論の一覧', () => {
    expect((html.match(/<details class="guide-decide__option">/g) ?? []).length).toBe(4)
    expect(html).toContain('<span class="guide-decide__path">はい → はい</span>')
    expect(html).toContain('<strong class="guide-decide__result-title">Max 20x</strong>')
    expect(html).toMatch(/<div class="guide-decide__summary">(?:(?!<details).)*Pro/s)
  })

  it('相談フォーム: source は guide:<slug>、JS なしでも POST (URL に個人情報を載せない)', () => {
    expect(html).toContain('<form class="guide-form" method="post" action="/api/contact" data-source="guide:claude-code-guide">')
    expect(html).toContain('<input type="hidden" name="source" value="guide:claude-code-guide"/>')
  })

  it('更新履歴は新しい順、出典の外部リンクは新しいタブ', () => {
    expect(html.indexOf('2026年9月27日</time><span class="guide-changelog__change">')).toBeLessThan(
      html.indexOf('2026年9月20日</time><span class="guide-changelog__change">')
    )
    expect(html).toContain('<a class="guide-sources__link" href="https://example.com/pricing" target="_blank" rel="noopener noreferrer">')
    expect(html).toContain('<a class="guide-sources__link" href="/posts/example">')
  })

  it('レビュー用に HTML を書き出せる (GUIDE_FIXTURE_OUT を指定したときだけ)', () => {
    const out = process.env.GUIDE_FIXTURE_OUT
    if (out) writeFileSync(out, html)
    expect(html.length).toBeGreaterThan(1000)
  })
})
