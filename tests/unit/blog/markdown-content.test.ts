import { readFileSync, writeFileSync } from 'fs'
import path from 'path'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

// vitest の esbuild は tsconfig の jsx: preserve により classic 変換 (React.createElement) になる
vi.stubGlobal('React', React)

import MarkdownContent, { GuideBody, renderMarkdown } from '@/components/blog/MarkdownContent'
import GuideHero from '@/components/guide/GuideHero'
import GuideToc from '@/components/guide/GuideToc'
import { splitGuideHero } from '@/app/posts/_lib/guide-blocks'
import { postModifiedAt } from '@/app/posts/_lib/post-text'

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
    expect(html).toContain('<dd class="guide-stats__value">20<span class="guide-stats__unit">ドル</span></dd>')
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

  it('画像: 遅延読み込み。幅・高さは title の "幅x高さ" があるときだけ (推測で引き伸ばさない)。段落の中にブロック要素を入れない', () => {
    const html = render('![構成図](https://example.com/a.png "800x600")\n\n![](https://example.com/b.png)')
    expect(html).toContain('width="800" height="600" loading="lazy" decoding="async"')
    expect(html).toContain('<img src="https://example.com/b.png" alt="" loading="lazy" decoding="async"')
    expect(html).not.toMatch(/<p[^>]*>(?:(?!<\/p>).)*<(div|p)[\s>]/s)
  })

  it('見出しのインラインの装飾はそのまま描き ({#id} だけ消す)、[object Object] にしない', () => {
    const html = render('## `gws` CLI の **使い方** {#usage}\n\n## Use `npm` here')
    expect(html).toMatch(/<h2 id="usage"[^>]*><code[^>]*>gws<\/code> CLI の <span class="font-bold highlight-marker">使い方<\/span><\/h2>/)
    expect(html).toMatch(/<h2 id="use-npm-here"/)
    expect(html).not.toContain('object Object')
    expect(html).not.toContain('{#usage}')
  })

  it('生の HTML は文字として出す (実行されない)', () => {
    const html = render('<script>alert(1)</script>')
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })
})

describe('renderMarkdown: ガイドの目次は描画した見出しから作る (リンク先の id が必ずある)', () => {
  it.each([
    ['## Using _foo_ in API', 'using-foo-in-api'],
    ['## A &amp; B', 'a-b'],
    ['## ![icon](/i.png) Setup', '-setup'],
    ['## 料金 {#pricing}', 'pricing'],
  ])('%s', (md, id) => {
    const { element, headings } = renderMarkdown(md)
    expect(headings.map((heading) => heading.id)).toEqual([id])
    expect(renderToStaticMarkup(element)).toContain(`id="${id}"`)
  })

  it('HTML コメントの中の ## や、コードの中の # は目次に入らない。id が空・重複の見出しも入らない', () => {
    const md = ['<!--', '## コメントの中', '-->', '', '```', '## コードの中', '```', '', '## 日本語だけ', '## Same', '## Same', '### Sub {#sub}'].join('\n')
    expect(renderMarkdown(md).headings).toEqual([
      { id: 'same', text: 'Same', level: 2 },
      { id: 'sub', text: 'Sub', level: 3 },
    ])
  })

  it('CRLF の本文でもブロックと見出しを読む', () => {
    const md = '## A {#a}\r\n\r\n```nands-callout\r\n{"tone":"tip","body":"x"}\r\n```\r\n'
    const { element, headings } = renderMarkdown(md)
    expect(headings.map((heading) => heading.id)).toEqual(['a'])
    expect(renderToStaticMarkup(element)).toContain('data-guide-block="callout"')
    expect(splitGuideHero(FIXTURE.replace(/\n/g, '\r\n')).hero?.answer).toHaveLength(4)
  })
})

describe('見本のガイドをページの部品で描く', () => {
  const { hero, body } = splitGuideHero(FIXTURE)
  const rendered = renderMarkdown(body, { slug: 'claude-code-guide' })
  const toc = rendered.headings
  const modifiedAt = postModifiedAt(
    { content: FIXTURE, published_at: '2026-09-01T00:00:00Z', created_at: '2026-09-01T00:00:00Z', updated_at: '2026-09-28T05:00:00Z' },
    new Date('2026-09-28T00:00:00Z')
  )
  const html = renderToStaticMarkup(
    React.createElement(
      'article',
      { 'data-layout': 'guide' },
      React.createElement(GuideHero, {
        title: 'Claude Code 完全ガイド',
        hero,
        modifiedAt,
        author: { name: '原田賢治', href: '/author/harada-kenji', role: '代表取締役' },
        fallbackImage: { src: 'https://example.com/banner.png', alt: 'バナー', width: 1200, height: 630 },
      }),
      React.createElement(GuideToc, { items: toc }),
      React.createElement(GuideBody, null, rendered.element)
    )
  )
  const TOC_IDS = ['summary', 'compare', 'mcp', 'mcp-commands', 'choose', 'history', 'changelog', 'sources']

  it('冒頭: h1 (文節の区切りに <wbr>)・一文の説明・答え・最終更新 (= 更新履歴の最新日)・書いた人・AI の使い方・検証の環境', () => {
    expect(modifiedAt).toBe('2026-09-27T00:00:00+09:00')
    expect(html).toContain('<h1 id="main-title" class="guide-hero__title" data-size="l">Claude\u00a0Code 完全ガイド</h1>')
    expect(html).toContain('<p class="guide-hero__lead">使い方、<wbr/>MCP\u00a0での<wbr/>')
    expect(html).toContain('<ul class="guide-hero__answer" data-role="answer" aria-label="この記事の要点">')
    expect((html.match(/class="guide-hero__answer-line"/g) ?? []).length).toBe(4)
    expect(html).toContain('<time dateTime="2026-09-27T00:00:00+09:00">2026-09-27</time>')
    expect(html).toContain('<a href="/author/harada-kenji" rel="author">原田賢治</a><span class="guide-meta__role">代表取締役</span>')
    expect(html).toContain('<dt>AI の使い方</dt>')
    expect(html).toContain('<dt>検証の環境</dt>')
  })

  it('ヒーローの右側は実際のコマンドの出力 (窓の飾りなし)。terminal があれば画像は出さない', () => {
    expect(html).toContain('<figure class="guide-term" data-guide-block="terminal">')
    expect(html).toContain('<span class="guide-term__cmd" data-first=""><span class="guide-term__prompt" aria-hidden="true">$ </span>claude --version\n</span>')
    expect(html).toContain('<span class="guide-term__out">2.1.283 (Claude Code)\n</span>')
    expect(html).toContain('<figcaption class="guide-term__caption">')
    expect(html).not.toMatch(/term-bar|<i><\/i>/)
    expect(html).not.toContain('<img')
  })

  it('terminal が無ければヒーローの画像 (LCP の候補なので priority、幅と高さつき)', () => {
    const imageHero = renderToStaticMarkup(
      React.createElement(GuideHero, {
        title: 't',
        hero: hero ? { ...hero, terminal: undefined } : null,
        modifiedAt,
        author: { name: '原田賢治', href: '/author/harada-kenji' },
        fallbackImage: { src: 'https://example.com/banner.png', alt: 'バナー', width: 1200, height: 630 },
      })
    )
    expect(imageHero).toMatch(/<img[^>]*fetch[pP]riority="high"[^>]*>/)
    expect(imageHero).toMatch(/<img[^>]*width="1200"[^>]*height="630"/)
  })

  it('目次のリンクはすべて本文の見出しの id を指し、コードの中の # は目次に入らない', () => {
    const hrefs = Array.from(html.matchAll(/class="guide-toc__link" href="#([^"]+)"/g), (m) => decodeURIComponent(m[1]))
    expect(hrefs).toEqual(TOC_IDS)
    for (const id of hrefs) expect(html).toContain(`id="${id}"`)
    const nav = html.slice(html.indexOf('<nav class="guide-band guide-toc"'), html.indexOf('</nav>'))
    expect(nav).not.toContain('手元で動く')
    expect(html).toContain('# 手元で動く MCP サーバー (stdio)')
  })

  it('本文は h2 ごとの区画。左の列の番号は目次の番号と同じ。最後の相談は独立した区画 (見出しは h2)', () => {
    const sections = Array.from(html.matchAll(/<section class="guide-band guide-section"([^>]*)>/g), (m) => m[1])
    expect(sections).toHaveLength(8)
    expect(sections[0]).toBe(' aria-labelledby="summary" data-section="1"')
    expect(sections[6]).toBe(' aria-labelledby="sources" data-section="7"')
    expect(sections[7]).toBe(' data-kind="cta"')
    expect(html).toContain('<div class="guide-rail"><span class="guide-rail__num" aria-hidden="true">3</span></div>')
    const tocNumbers = Array.from(html.matchAll(/<span class="guide-toc__num" aria-hidden="true">(\d+)<\/span>/g), (m) => m[1])
    expect(tocNumbers).toEqual(['1', '2', '3', '4', '5', '6', '7'])
    expect(html).toMatch(/<section class="guide-cta" data-guide-block="cta" data-placement="end" aria-label="Claude Code の導入を相談する"><h2 class="guide-cta__title" id="guide-consult">/)
  })

  it('本文の素の要素にはクラスを付けない (Tailwind の見た目を持ち込まない)。見出しと表の見出しは文節の区切りに <wbr>', () => {
    expect(html).toMatch(/<h2 id="compare" class="guide-h2">どの<wbr\/>モデルを<wbr\/>選べばいい？<wbr\/>同じ<wbr\/>課題で<wbr\/>測りました<\/h2>/)
    expect(html).toContain('<div class="guide-table"><table>')
    expect(html).toContain('<th style="text-align:right">時間の<wbr/>中央値 (秒)</th>')
    expect(html).toContain('<td style="text-align:right">0.15</td>')
    expect(html).toMatch(/<p>この<wbr\/>難しさの<wbr\/>課題では、/)
    expect(html).not.toMatch(/class="[^"]*(text-gray|bg-gray|border-l-4|highlight-marker|prose)/)
    expect(html).toContain('<pre class="guide-code"><code class="language-bash">')
  })

  it('10 種類のブロックがすべて描かれ、JSON は出ない', () => {
    for (const type of ['hero', 'terminal', 'stats', 'chart', 'callout', 'diagram', 'decide', 'changelog', 'sources', 'cta']) {
      expect(html, type).toContain(`data-guide-block="${type}"`)
    }
    expect(html).not.toMatch(/&quot;(items|rows|nodes|entries|root|lines)&quot;/)
  })

  it('選び方: JS なしの入れ子の <details> と、常に見える結論の一覧', () => {
    expect((html.match(/<details class="guide-decide__option">/g) ?? []).length).toBe(4)
    expect(html).toContain('<span class="guide-decide__path">はい → はい</span>')
    expect(html).toContain('<strong class="guide-decide__result-title">Opus\u00a05.5\u00a0の<wbr/> high</strong>')
    expect(html).toMatch(/<div class="guide-decide__summary">(?:(?!<details).)*まずは/s)
  })

  it('相談フォーム: source は guide:<slug>、JS なしでも POST (URL に個人情報を載せない)。送信後の文章は :target で出す', () => {
    expect(html).toContain('<form class="guide-form" method="post" action="/api/contact" data-source="guide:claude-code-guide">')
    expect(html).toContain('<input type="hidden" name="source" value="guide:claude-code-guide"/>')
    expect(html).toContain('<p id="guide-contact-sent" class="guide-form__notice" data-kind="sent" role="status">')
    expect(html).toContain('<p id="guide-contact-error" class="guide-form__notice" data-kind="error">')
    // 主の操作 (送信) と副の操作 (関連記事) の 2 つだけ
    expect(html).toContain('<button class="guide-button" data-kind="primary" type="submit">相談を送る</button>')
    expect(html).toContain('<a class="guide-button" data-kind="secondary" href="/posts/opus-5-5-vs-opus-5-fable-5-1-measured-ep619n">実測の比較記事を読む</a>')
  })

  it('更新履歴は新しい順 (日付は YYYY-MM-DD)、出典の外部リンクは新しいタブ', () => {
    expect(html.indexOf('2026-09-27</time><span class="guide-changelog__change">')).toBeGreaterThan(-1)
    expect(html.indexOf('2026-09-27</time><span class="guide-changelog__change">')).toBeLessThan(
      html.indexOf('2026-09-20</time><span class="guide-changelog__change">')
    )
    expect(html).toContain('<a class="guide-sources__link" href="https://docs.claude.com/en/docs/claude-code/mcp" target="_blank" rel="noopener noreferrer">')
    expect(html).toContain('<a class="guide-sources__link" href="/posts/opus-5-5-vs-opus-5-fable-5-1-measured-ep619n">')
  })

  it('レビュー用に HTML を書き出せる (GUIDE_FIXTURE_OUT を指定したときだけ)', () => {
    const out = process.env.GUIDE_FIXTURE_OUT
    if (out) writeFileSync(out, html)
    expect(html.length).toBeGreaterThan(1000)
  })
})
