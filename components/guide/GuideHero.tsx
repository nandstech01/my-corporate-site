import Image from 'next/image'
import './guide.css'
import type { HeroBlock } from '@/app/posts/_lib/guide-blocks'
import { formatJstDate } from '@/app/posts/_lib/post-text'

export const DEFAULT_AI_NOTE = 'この記事の作成には生成 AI を利用しています。'

export interface HeroImage {
  readonly src: string
  readonly alt: string
  readonly width: number
  readonly height: number
}

interface GuideHeroProps {
  readonly title: string
  /** 本文冒頭の ```nands-hero (無ければタイトルと日付・著者だけ) */
  readonly hero: HeroBlock | null
  /** dateModified と同じ値 (ISO 8601) */
  readonly modifiedAt: string
  readonly author: { readonly name: string; readonly href: string }
  /** hero.image が無いときの画像 (記事のサムネイル) */
  readonly fallbackImage: HeroImage | null
}

/**
 * ガイドの冒頭: タイトル (h1)・冒頭の答え・最終更新日・著者・AI 利用の明記・ヒーロー画像。
 * ヒーロー画像は LCP の候補なので priority (fetchpriority=high + preload)。幅と高さを必ず持たせる。
 * 見た目は guide.css の .guide-hero* で決める (ここは構造だけ)。
 */
export default function GuideHero({ title, hero, modifiedAt, author, fallbackImage }: GuideHeroProps) {
  const image = hero?.image ?? fallbackImage
  return (
    <header className="guide-hero" data-guide-block="hero">
      <h1 id="main-title" className="guide-hero__title">
        {title}
      </h1>
      {hero && (
        <div className="guide-hero__answer" data-role="answer">
          <p className="guide-hero__answer-label">この記事の答え</p>
          {hero.answer.map((line, index) => (
            <p className="guide-hero__answer-line" key={index}>
              {line}
            </p>
          ))}
        </div>
      )}
      <dl className="guide-hero__meta">
        <div className="guide-hero__meta-item">
          <dt>最終更新</dt>
          <dd>
            <time dateTime={modifiedAt}>{formatJstDate(modifiedAt, { year: 'numeric', month: 'long', day: 'numeric' })}</time>
          </dd>
        </div>
        <div className="guide-hero__meta-item">
          <dt>著者</dt>
          <dd>
            <a href={author.href} rel="author">
              {author.name}
            </a>
          </dd>
        </div>
        <div className="guide-hero__meta-item">
          <dt>AI の利用</dt>
          <dd>{hero?.aiNote ?? DEFAULT_AI_NOTE}</dd>
        </div>
      </dl>
      {image && (
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
      )}
    </header>
  )
}
