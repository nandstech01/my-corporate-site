import Image from 'next/image'
import './guide.css'
import type { HeroBlock, TerminalBlock } from '@/app/posts/_lib/guide-blocks'
import { Phrases, bindSpaces, phrases } from './phrases'
import { textUnits } from './text-wrap'

export const DEFAULT_AI_NOTE = 'この記事の作成には生成 AI を利用しています。'

export interface HeroImage {
  readonly src: string
  readonly alt: string
  readonly width: number
  readonly height: number
}

interface GuideHeroProps {
  /** 記事のタイトル (<title> と同じ)。hero.heading が無ければ h1 に使う */
  readonly title: string
  /** 本文冒頭の ```nands-hero (無ければタイトルと日付・著者だけ) */
  readonly hero: HeroBlock | null
  /** dateModified と同じ値 (ISO 8601) */
  readonly modifiedAt: string
  readonly author: { readonly name: string; readonly href: string; readonly role?: string }
  /** hero.image も terminal も無いときの画像 (記事のサムネイル) */
  readonly fallbackImage: HeroImage | null
}

/** 日本時間の YYYY-MM-DD (仕様書の日付の書き方) */
export function isoDateJst(iso: string): string {
  const time = Date.parse(iso)
  if (Number.isNaN(time)) return iso.slice(0, 10)
  return new Date(time + 9 * 3600_000).toISOString().slice(0, 10)
}

/**
 * タイトルの文字の大きさを 3 段階に (62 / 48 / 38px)。
 * 長いタイトルを 5 行にしない (全体の長さ) + 途中で折れない並び (Claude Opus 5.5 など) が PC の 2 列の表紙の幅 (約 409px) に入る
 */
export function titleSize(title: string): 'l' | 'm' | 's' {
  const units = textUnits(title)
  const longestRun = Math.max(
    ...phrases(bindSpaces(title))
      .flatMap((phrase) => phrase.split(' '))
      .map((run) => textUnits(run.trim()))
  )
  // textUnits は英字を実際の IBM Plex Sans JP より 15〜20% 広く見積もるので、幅の上限 (409 / 62 = 6.6、409 / 48 = 8.5) をその分だけ広げる
  if (units <= 16 && longestRun <= 7.5) return 'l'
  if (units <= 26 && longestRun <= 9.8) return 'm'
  return 's'
}

/**
 * 表紙の h1 の文字: 「主題｜副題」は主題を大きく、副題を下の行に小さく描く (｜ は読み上げ・コピー用に残し、画面には出さない)。
 * これで ｜ が行末に残らない。区切りが無ければそのまま
 */
export function splitHeading(heading: string): { main: string; sub: string | null } {
  const index = heading.indexOf('｜')
  if (index <= 0 || index === heading.length - 1) return { main: heading, sub: null }
  return { main: heading.slice(0, index).trim(), sub: heading.slice(index + 1).trim() || null }
}

/** ターミナルの 1 行を空白の所でだけ折り返す (--max-budget-usd や claude-opus-5-5 のハイフンで折らない) */
function TerminalText({ text }: { text: string }) {
  return (
    <>
      {text.split(/( +)/).map((token, index) =>
        token === '' ? null : /^ +$/.test(token) ? (
          token
        ) : (
          <span className="guide-term__tok" key={index}>
            {token}
          </span>
        )
      )}
    </>
  )
}

/** 実際に実行したコマンドと出力。窓の飾りは描かない (本物の出力だけ) */
export function Terminal({ terminal }: { terminal: TerminalBlock }) {
  return (
    <figure className="guide-term" data-guide-block="terminal">
      <pre className="guide-term__screen" aria-label="コマンドと出力">
        <code>
          {terminal.lines.map((line, index) =>
            line.kind === 'cmd' ? (
              <span className="guide-term__cmd" key={index} data-first={index === 0 ? '' : undefined}>
                <span className="guide-term__prompt" aria-hidden="true">
                  ${' '}
                </span>
                <TerminalText text={line.text} />
                {'\n'}
              </span>
            ) : (
              <span className="guide-term__out" key={index}>
                <TerminalText text={line.text} />
                {'\n'}
              </span>
            )
          )}
        </code>
      </pre>
      {terminal.caption && (
        <figcaption className="guide-term__caption">
          <Phrases text={terminal.caption} />
        </figcaption>
      )}
    </figure>
  )
}

/**
 * ガイドの冒頭 (仕様書の表紙): タイトル (h1)・一文の説明・冒頭の答え / 実際のコマンドの出力 (または画像)、
 * その下に「最終更新・書いた人・AI の使い方・検証の環境」の行。
 * 画像は LCP の候補なので priority (fetchpriority=high + preload)。幅と高さを必ず持たせる。
 */
export default function GuideHero({ title, hero, modifiedAt, author, fallbackImage }: GuideHeroProps) {
  const terminal = hero?.terminal
  const image = terminal ? null : hero?.image ?? fallbackImage
  const hasAside = Boolean(terminal || image)
  const heading = splitHeading(hero?.heading ?? title)
  return (
    <>
      <header className="guide-band guide-hero" data-guide-block="hero">
        <div className="guide-frame guide-hero__grid" data-aside={hasAside ? 'true' : 'false'}>
          <div className="guide-hero__text">
            <h1 id="main-title" className="guide-hero__title" data-size={titleSize(heading.main)}>
              {heading.sub === null ? (
                <Phrases text={heading.main} />
              ) : (
                <>
                  <span className="guide-hero__title-main">
                    <Phrases text={heading.main} />
                  </span>
                  <span className="guide-sr">｜</span>
                  <span className="guide-hero__title-sub">
                    <Phrases text={heading.sub} />
                  </span>
                </>
              )}
            </h1>
            {hero?.lead && (
              <p className="guide-hero__lead">
                <Phrases text={hero.lead} />
              </p>
            )}
            {hero && (
              <ul className="guide-hero__answer" data-role="answer" aria-label="この記事の要点">
                {hero.answer.map((line, index) => (
                  <li className="guide-hero__answer-line" key={index}>
                    <Phrases text={line} />
                  </li>
                ))}
              </ul>
            )}
          </div>
          {hasAside && (
            <div className="guide-hero__aside">
              {terminal ? (
                <Terminal terminal={terminal} />
              ) : (
                image && (
                  <figure className="guide-hero__media">
                    <Image
                      className="guide-hero__image"
                      src={image.src}
                      alt={image.alt}
                      width={image.width}
                      height={image.height}
                      priority
                      unoptimized
                    />
                  </figure>
                )
              )}
            </div>
          )}
        </div>
      </header>
      <section className="guide-band guide-meta" aria-label="このページについて">
        <dl className="guide-frame guide-meta__list">
          <div className="guide-meta__cell">
            <dt>最終更新</dt>
            <dd>
              <time dateTime={modifiedAt}>{isoDateJst(modifiedAt)}</time>
            </dd>
          </div>
          <div className="guide-meta__cell">
            <dt>書いた人</dt>
            <dd>
              <a href={author.href} rel="author">
                {author.name}
              </a>
              {author.role && <span className="guide-meta__role">{author.role}</span>}
            </dd>
          </div>
          <div className="guide-meta__cell">
            <dt>AI の使い方</dt>
            <dd>
              <Phrases text={hero?.aiNote ?? DEFAULT_AI_NOTE} />
            </dd>
          </div>
          {hero?.env && (
            <div className="guide-meta__cell">
              <dt>検証の環境</dt>
              <dd>
                <Phrases text={hero.env} />
              </dd>
            </div>
          )}
        </dl>
      </section>
    </>
  )
}
