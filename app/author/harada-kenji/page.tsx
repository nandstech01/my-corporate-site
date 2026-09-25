import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Breadcrumbs from '@/app/components/common/Breadcrumbs'
import { listPublishedPosts, type PublishedPostSummary } from '@/app/posts/_lib/public-client'
import {
  AUTHOR,
  ORGANIZATION,
  SITE_URL,
  organizationNode,
  personNode,
  postUrl,
  toJsonLdScript,
} from '@/lib/structured-data/site-entities'

/**
 * 著者ページ /author/harada-kenji (Person の url / @id の実体)。
 * 記事の JSON-LD は author をこのページの Person (AUTHOR.id) で参照する。
 *
 * - JSON-LD は素の <script> で出す (next/script だと初期 HTML に出ず、JS を実行しないクローラに見えない)
 * - 人物・会社の事実は site-entities だけから取る。経歴は記事の著者ボックスの記述の範囲に留め、
 *   資格・年数・受賞などは足さない
 * - 記事一覧は cookie を使わない public client で取る (ISR が効く)。DB エラーは throw のまま
 *   → 再生成が失敗しても Next は直前の正常なページを出し続ける
 */

export const revalidate = 3600

const LATEST_POSTS_LIMIT = 20

const ROLE = `${ORGANIZATION.name} ${AUTHOR.jobTitle}`
/** layout の title.template が「 | 株式会社エヌアンドエス」を付ける。og/twitter には template が効かないので自前で付ける */
const FULL_TITLE = `${AUTHOR.name} | ${ORGANIZATION.name}`
const PROFILE_LABELS = AUTHOR.profiles.map((profile) => profile.label).join('・')
const DESCRIPTION = `${ROLE}、${AUTHOR.name}のプロフィール。${PROFILE_LABELS} の外部プロフィールと、nands.tech で公開している記事の一覧をまとめています。`

const [FOUNDING_YEAR, FOUNDING_MONTH] = ORGANIZATION.foundingDate.split('-')
const COMPANY_SUMMARY = `${FOUNDING_YEAR}年${Number(FOUNDING_MONTH)}月設立、${ORGANIZATION.address.region}${ORGANIZATION.address.locality}`

/** Person.description と本文の 1 段落目で同じ文を使う (構造化データと表示を食い違わせない) */
const PERSON_DESCRIPTION = `${ORGANIZATION.name}の${AUTHOR.jobTitle}。生成AI検索最適化（ChatGPT・Perplexity に対応した GEO の実装）と、企業向けの AI 研修を手がけています。`

/** 見出しに添える英字表記 (alternateName のうちラテン文字のもの) */
const LATIN_NAME = AUTHOR.alternateName.find((name) => /^[A-Za-z .-]+$/.test(name))
const AUTHOR_PATH = `/author/${AUTHOR.slug}`

const PROFILE_PAGE_ID = `${AUTHOR.url}#profilepage`
const BREADCRUMB_ID = `${AUTHOR.url}#breadcrumb`

export const metadata: Metadata = {
  title: AUTHOR.name,
  description: DESCRIPTION,
  authors: [{ name: AUTHOR.name, url: AUTHOR.url }],
  alternates: {
    canonical: AUTHOR.url,
  },
  openGraph: {
    type: 'profile',
    title: FULL_TITLE,
    description: DESCRIPTION,
    url: AUTHOR.url,
    siteName: ORGANIZATION.name,
    locale: 'ja_JP',
    images: [
      {
        url: '/images/default-og-image.jpg',
        width: 1200,
        height: 630,
        alt: ORGANIZATION.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: FULL_TITLE,
    description: DESCRIPTION,
    images: ['/images/default-og-image.jpg'],
  },
}

const dateFormatter = new Intl.DateTimeFormat('ja-JP', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

/** 一覧・sitemap と同じく published_at ?? created_at を公開日とする */
function publishedDate(post: PublishedPostSummary): { iso: string; label: string } | null {
  const time = Date.parse(post.published_at ?? post.created_at)
  if (Number.isNaN(time)) return null
  const date = new Date(time)
  return { iso: date.toISOString(), label: dateFormatter.format(date) }
}

/** サイト内リンク用のパス。canonical (postUrl) と同じエンコードにする */
function postPath(slug: string): string {
  return postUrl(slug).slice(SITE_URL.length)
}

/** 表示用の「ホスト + パス」(LinkedIn のパーセントエンコードも読める形に戻す) */
function displayUrl(url: string): string {
  const { host, pathname } = new URL(url)
  try {
    return `${host}${decodeURIComponent(pathname)}`
  } catch {
    return `${host}${pathname}`
  }
}

function buildJsonLd(totalPosts: number) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfilePage',
        '@id': PROFILE_PAGE_ID,
        url: AUTHOR.url,
        name: FULL_TITLE,
        description: DESCRIPTION,
        inLanguage: 'ja-JP',
        breadcrumb: { '@id': BREADCRUMB_ID },
        mainEntity: {
          ...personNode(),
          description: PERSON_DESCRIPTION,
          agentInteractionStatistic: {
            '@type': 'InteractionCounter',
            interactionType: 'https://schema.org/WriteAction',
            userInteractionCount: totalPosts,
          },
        },
      },
      organizationNode(),
      {
        '@type': 'BreadcrumbList',
        '@id': BREADCRUMB_ID,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'ホーム', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: AUTHOR.name, item: AUTHOR.url },
        ],
      },
    ],
  }
}

export default async function HaradaKenjiAuthorPage() {
  const posts = await listPublishedPosts()
  const latestPosts = posts.slice(0, LATEST_POSTS_LIMIT)

  return (
    <main className="bg-white text-gray-900 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLdScript(buildJsonLd(posts.length)) }}
      />

      <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">
        {/* BreadcrumbList は上の @graph に含めるので、コンポーネント側の JSON-LD は出さない */}
        <Breadcrumbs customItems={[{ name: AUTHOR.name, path: AUTHOR_PATH }]} withSchema={false} />

        <header className="flex items-center gap-5 mb-10">
          <Image
            src="/images/author/harada-kenji.jpg"
            alt={AUTHOR.name}
            width={80}
            height={80}
            className="flex-shrink-0 rounded-full border-2 border-gray-300"
            unoptimized={true}
            priority
          />
          <div>
            <h1 className="text-3xl font-bold">{AUTHOR.name}</h1>
            <p className="mt-1 text-gray-600">
              {LATIN_NAME && (
                <>
                  <span lang="en">{LATIN_NAME}</span>
                  <span aria-hidden="true"> ・ </span>
                </>
              )}
              {ROLE}
            </p>
          </div>
        </header>

        <section aria-labelledby="author-profile-heading" className="mb-10">
          <h2 id="author-profile-heading" className="text-xl font-bold mb-4">
            プロフィール
          </h2>
          <p className="leading-relaxed text-gray-700 mb-3">{PERSON_DESCRIPTION}</p>
          <p className="leading-relaxed text-gray-700 mb-6">
            このページでは、nands.tech で公開している記事と、外部のプロフィールをまとめています。
          </p>

          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm bg-gray-50 border border-gray-200 rounded-lg p-5">
            <dt className="font-semibold text-gray-600">所属</dt>
            <dd>
              <Link href="/about" className="text-blue-700 hover:underline">
                {ORGANIZATION.name}
              </Link>
              <span className="text-gray-600">（{COMPANY_SUMMARY}）</span>
            </dd>
            <dt className="font-semibold text-gray-600">役職</dt>
            <dd>{AUTHOR.jobTitle}</dd>
            <dt className="font-semibold text-gray-600">ORCID iD</dt>
            <dd>{AUTHOR.orcid}</dd>
          </dl>
        </section>

        <section aria-labelledby="author-links-heading" className="mb-10">
          <h2 id="author-links-heading" className="text-xl font-bold mb-4">
            外部プロフィール
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {AUTHOR.profiles.map((profile) => (
              <li key={profile.url}>
                <a
                  href={profile.url}
                  target="_blank"
                  rel="me noopener noreferrer"
                  className="block rounded-lg border border-gray-200 px-4 py-3 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <span className="block font-semibold text-gray-900">{profile.label}</span>
                  <span className="block text-sm text-gray-600 break-all">{displayUrl(profile.url)}</span>
                  <span className="sr-only">（新しいタブで開きます）</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="author-posts-heading">
          <h2 id="author-posts-heading" className="text-xl font-bold mb-4">
            最新の記事
          </h2>
          {latestPosts.length === 0 ? (
            <p className="text-gray-600">公開中の記事はまだありません。</p>
          ) : (
            <ol className="divide-y divide-gray-200 border-y border-gray-200">
              {latestPosts.map((post) => {
                const date = publishedDate(post)
                return (
                  <li key={`${post.source}-${post.id}`} className="py-4">
                    <Link
                      href={postPath(post.slug)}
                      className="font-semibold text-gray-900 hover:text-blue-700 hover:underline"
                    >
                      {post.title}
                    </Link>
                    {date && (
                      <p className="mt-1 text-sm text-gray-600">
                        公開日 <time dateTime={date.iso}>{date.label}</time>
                      </p>
                    )}
                  </li>
                )
              })}
            </ol>
          )}
          {posts.length > latestPosts.length && (
            <p className="mt-6">
              <Link href="/posts" className="text-blue-700 hover:underline">
                記事一覧をすべて見る（全{posts.length}件）
              </Link>
            </p>
          )}
        </section>
      </div>
    </main>
  )
}
