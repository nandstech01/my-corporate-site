import { cache } from 'react'
import { notFound, permanentRedirect } from 'next/navigation'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { RefreshCw } from 'lucide-react'
import MarkdownContent from '@/components/blog/MarkdownContent'
import TOCComponent from '@/components/blog/TOCComponent'
// 🆕 YouTubeショート動画スライダー
import YouTubeShortSlider, { type YouTubeShortVideo } from '@/components/blog/YouTubeShortSlider'
import Breadcrumbs from '@/app/components/common/Breadcrumbs'
import { AutoTOCSystem, type TOCItem } from '@/lib/structured-data/auto-toc-system'
import { HowToFAQSchemaSystem, type QuestionAnswerPair } from '@/lib/structured-data/howto-faq-schema'
import { cleanFaqText } from '../_lib/faq-clean'
import {
  AUTHOR,
  ORGANIZATION,
  SITE_URL,
  decodePostSlug,
  organizationNode,
  organizationRef,
  personNode,
  personRef,
  postUrl,
  toJsonLdScript,
} from '@/lib/structured-data/site-entities'
import {
  getPublicSupabase,
  getPublishedPostBySlug,
  type PublishedPost,
} from '@/app/posts/_lib/public-client'

// 関連情報抽出関数
interface RelatedInfoLink {
  title: string;
  url: string;
  type: 'related' | 'faq';
}

function extractRelatedInfo(content: string): RelatedInfoLink[] {
  let relatedInfoSection = content.match(/###\s*📚\s*関連情報[\s\S]*?(?=\n##|\n---|\n$)/i);

  if (!relatedInfoSection) {
    const altPattern = content.match(/📚\s*関連情報[\s\S]*$/i);
    if (!altPattern) return [];
    relatedInfoSection = altPattern;
  }

  const links = relatedInfoSection[0].match(/\d+\.\s*\[([^\]]+)\]\(([^)]+)\)/g);
  if (!links) return [];

  const result: RelatedInfoLink[] = [];
  for (const link of links) {
    const match = link.match(/\d+\.\s*\[([^\]]+)\]\(([^)]+)\)/);
    if (match) {
      const title = match[1];
      const url = match[2];
      const type: 'related' | 'faq' = title.includes('よくある質問') ? 'faq' : 'related';
      result.push({ title, url, type });
    }
  }
  return result;
}

// BreadcrumbItemの型定義
interface BreadcrumbItem {
  name: string;
  path: string;
}

interface PageProps {
  params: {
    slug: string
  }
}

// 🚀 ISR（Incremental Static Regeneration）設定
// 記事・動画とも cookie を使わない anon クライアント (app/posts/_lib/public-client.ts) で取得するので静的再生成が効く
export const revalidate = 300 // 5分間隔でISR実行

// Next 14 では revalidate だけだと動的ルートは ISR にならない (毎回 SSR・no-store)。
// 空配列を返すとビルド時には何も作らず、各記事を初回アクセス時に生成して 300 秒キャッシュする
export async function generateStaticParams() {
  return []
}

/**
 * 公開済み記事を slug の完全一致で取得する (posts → chatgpt_posts)。部分一致で別の記事を返すことはしない。
 * generateMetadata とページ本体で同じリクエスト内の結果を共有する。DB エラーは throw (ISR が 404 をキャッシュしないように)。
 */
const getPost = cache(getPublishedPostBySlug)

// ---------------------------------------------------------------------------
// YouTube 動画 (company_youtube_shorts)
// ---------------------------------------------------------------------------

/** ページで使う列だけを取る (embedding などの重い列は取らない) */
const VIDEO_COLUMNS: string =
  'id,content_type,youtube_video_id,youtube_url,script_title,title,script_hook,description,fragment_id,complete_uri,published_at,youtube_uploaded_at,created_at,duration_seconds'

interface VideoRow {
  id: number
  content_type: string
  youtube_video_id: string
  youtube_url: string | null
  script_title: string | null
  title: string | null
  script_hook: string | null
  description: string | null
  fragment_id: string | null
  complete_uri: string | null
  published_at: string | null
  youtube_uploaded_at: string | null
  created_at: string | null
  duration_seconds: number | null
}

type VideoRowRaw = Omit<VideoRow, 'youtube_video_id'> & { youtube_video_id: string | null }

interface PageVideos {
  /** 本文上部に埋め込む中尺動画 (この記事に紐づくもの) */
  medium: VideoRow | null
  /** スライダーに出すショート: この記事に紐づくもの + 3 件に満たなければ最新ショートで補完 (補完分は表示だけ) */
  sliderShorts: VideoRow[]
  /** 構造化データに載せる動画 = この記事に実際に紐づき、ページに表示されるものだけ */
  linked: VideoRow[]
}

const SLIDER_SIZE = 3

/** YouTube の動画 ID は 11 文字。company_youtube_shorts は anon から書き込めるため、形式の合わない行は使わない */
const YOUTUBE_VIDEO_ID = /^[A-Za-z0-9_-]{11}$/
const YOUTUBE_URL = /^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//

function hasValidVideoId(row: VideoRowRaw): row is VideoRow {
  return typeof row.youtube_video_id === 'string' && YOUTUBE_VIDEO_ID.test(row.youtube_video_id)
}

/**
 * この記事に紐づく公開済み動画。related_blog_post_id は posts.id への外部キー (fk_blog_post) なので、
 * chatgpt_posts の記事には id が重なっても紐づけない。
 * 動画は記事の付属物なので、取得に失敗しても記事は出す (空配列)。
 */
async function fetchLinkedVideos(post: PublishedPost): Promise<VideoRow[]> {
  if (post.source !== 'posts') return []

  const { data, error } = await getPublicSupabase()
    .from('company_youtube_shorts')
    .select(VIDEO_COLUMNS)
    .eq('related_blog_post_id', post.id)
    .eq('status', 'published')
    .order('id', { ascending: true })

  if (error) {
    console.error('⚠️ 紐づくYouTube動画の取得エラー:', error.message)
    return []
  }
  return ((data ?? []) as unknown as VideoRowRaw[]).filter(hasValidVideoId)
}

/** スライダーの埋め草用の最新ショート。表示だけに使い、構造化データには載せない */
async function fetchLatestShorts(excludeIds: readonly number[], limit: number): Promise<VideoRow[]> {
  if (limit <= 0) return []

  let query = getPublicSupabase()
    .from('company_youtube_shorts')
    .select(VIDEO_COLUMNS)
    .eq('content_type', 'youtube-short')
    .eq('status', 'published')
    .not('youtube_video_id', 'is', null)
  if (excludeIds.length > 0) {
    query = query.not('id', 'in', `(${excludeIds.join(',')})`)
  }
  const { data, error } = await query.order('created_at', { ascending: false }).limit(limit)

  if (error) {
    console.error('⚠️ 最新ショート動画の取得エラー:', error.message)
    return []
  }
  return ((data ?? []) as unknown as VideoRowRaw[]).filter(hasValidVideoId)
}

async function getPageVideos(post: PublishedPost): Promise<PageVideos> {
  const linkedVideos = await fetchLinkedVideos(post)
  const medium = linkedVideos.find((video) => video.content_type === 'youtube-medium') ?? null
  const linkedShorts = linkedVideos
    .filter((video) => video.content_type === 'youtube-short')
    .slice(0, SLIDER_SIZE)
  const latestShorts = await fetchLatestShorts(
    linkedShorts.map((video) => video.id),
    SLIDER_SIZE - linkedShorts.length
  )

  return {
    medium,
    sliderShorts: [...linkedShorts, ...latestShorts],
    linked: medium ? [medium, ...linkedShorts] : linkedShorts,
  }
}

function toSliderVideo(video: VideoRow, fallbackTitle: string): YouTubeShortVideo {
  const videoId = video.youtube_video_id
  return {
    id: video.id,
    videoId,
    // href に使うので YouTube の https URL 以外は動画 ID から組み立てる
    url: video.youtube_url && YOUTUBE_URL.test(video.youtube_url)
      ? video.youtube_url
      : `https://youtube.com/shorts/${videoId}`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
    title: video.script_title || fallbackTitle,
    hookText: video.script_hook ?? undefined,
    fragmentId: video.fragment_id ?? '',
    completeUri: video.complete_uri ?? undefined,
  }
}

// ---------------------------------------------------------------------------
// メタデータと構造化データの共通部品
// ---------------------------------------------------------------------------

function postDescription(post: PublishedPost): string {
  return post.meta_description || post.excerpt || `${post.content.substring(0, 160)}...`
}

function postKeywords(post: PublishedPost): string[] {
  return post.meta_keywords || post.seo_keywords || []
}

/** 記事画像の絶対 URL。http(s) はそのまま、/ 始まりはサイト内、それ以外は Storage の public パス */
function resolveImageUrl(path: string | null | undefined): string {
  if (!path) return `${SITE_URL}/images/default-og-image.jpg`
  if (/^https?:\/\//.test(path)) return path
  if (path.startsWith('/')) return `${SITE_URL}${path}`
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${path}`
}

/** 目次ツリーを表示順 (深さ優先) の 1 列にする */
function flattenToc(toc: readonly TOCItem[]): TOCItem[] {
  return toc.flatMap((item) => [item, ...flattenToc(item.children ?? [])])
}

/**
 * 本文に明示された見出し ID ({#id} または id="id") か。
 * 明示がない見出しは、目次 (auto-toc-system) と本文 (MarkdownContent) で ID の作り方が違い
 * (日本語を残す / 落とす)、ページ上に同じ id の要素が無いことがある
 */
function hasExplicitAnchor(content: string, id: string): boolean {
  return content.includes(`{#${id}}`) || content.includes(`id="${id}"`)
}

/**
 * 目次の見出しを hasPart の WebPageElement にする。ページ上に実在するアンカーだけを載せる。
 * @id / url の # は 1 つ (TOCItem.anchor は "#id" なので使わない)
 */
function sectionNodes(toc: readonly TOCItem[], content: string, articleUrl: string) {
  const seen = new Set<string>()
  const nodes: Array<{ '@type': 'WebPageElement'; '@id': string; name: string; url: string; position: number }> = []
  for (const item of flattenToc(toc)) {
    // 本文中の # (h1) は MarkdownContent が描画しない (ページの h1 は id="main-title" のみ) ので載せない
    if (item.level === 1 && item.id !== 'main-title') continue
    if (!item.id || seen.has(item.id) || !hasExplicitAnchor(content, item.id)) continue
    seen.add(item.id)
    const url = `${articleUrl}#${encodeURIComponent(item.id)}`
    nodes.push({ '@type': 'WebPageElement', '@id': url, name: item.title, url, position: nodes.length + 1 })
  }
  return nodes
}

/** この記事に紐づく YouTube 動画の最小限の VideoObject (再生数や評価などの派生値は載せない) */
function videoNode(video: VideoRow, articleUrl: string, fallbackTitle: string) {
  const videoId = video.youtube_video_id
  const name = video.script_title || video.title || fallbackTitle
  const duration = video.duration_seconds && video.duration_seconds > 0
    ? `PT${Math.round(video.duration_seconds)}S`
    : undefined

  return {
    '@type': 'VideoObject' as const,
    '@id': `${articleUrl}#video-${videoId}`,
    name,
    description: video.description || video.script_hook || name,
    thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    uploadDate: video.youtube_uploaded_at ?? video.published_at ?? video.created_at ?? undefined,
    duration,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    url: `https://www.youtube.com/watch?v=${videoId}`,
  }
}

interface ArticleJsonLdInput {
  post: PublishedPost
  articleUrl: string
  toc: readonly TOCItem[]
  faqs: readonly QuestionAnswerPair[]
  videos: readonly VideoRow[]
}

/**
 * 記事ページの JSON-LD (1 つの @graph)。
 * BlogPosting / BreadcrumbList / Person / Organization と、この記事に実際に紐づく動画の VideoObject だけを出す。
 * Person と Organization は site-entities の単一定義を 1 回だけ置き、ほかからは @id で参照する。
 */
function buildArticleJsonLd({ post, articleUrl, toc, faqs, videos }: ArticleJsonLdInput) {
  const datePublished = post.published_at ?? post.created_at
  const keywords = postKeywords(post)
  const breadcrumbId = `${articleUrl}#breadcrumb`
  const sections = sectionNodes(toc, post.content, articleUrl)
  const videoNodes = videos.map((video) => videoNode(video, articleUrl, post.title))

  const blogPosting = {
    '@type': 'BlogPosting',
    '@id': `${articleUrl}#article`,
    headline: post.title,
    description: postDescription(post),
    image: {
      '@type': 'ImageObject',
      url: resolveImageUrl(post.thumbnail_url || post.featured_image),
    },
    datePublished,
    dateModified: post.updated_at ?? datePublished,
    author: personRef(),
    publisher: organizationRef(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
      url: articleUrl,
      name: post.title,
      inLanguage: 'ja',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      breadcrumb: { '@id': breadcrumbId },
    },
    inLanguage: 'ja',
    isAccessibleForFree: true,
    ...(keywords.length > 0 ? { keywords } : {}),
    ...(videoNodes.length > 0 ? { video: videoNodes.map((node) => ({ '@id': node['@id'] })) } : {}),
    ...(sections.length > 0 ? { hasPart: sections } : {}),
    // AIO LLMO: FAQ（本文から自動抽出）
    ...(faqs.length > 0
      ? {
          mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
              author: personRef(),
            },
          })),
        }
      : {}),
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', 'h2'],
    },
  }

  const breadcrumbList = {
    '@type': 'BreadcrumbList',
    '@id': breadcrumbId,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '記事一覧', item: `${SITE_URL}/posts` },
      { '@type': 'ListItem', position: 3, name: post.title, item: articleUrl },
    ],
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [blogPosting, breadcrumbList, personNode(), organizationNode(), ...videoNodes],
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getPost(params.slug)

  if (!post) {
    // 社名は layout の title.template が付ける
    return {
      title: '記事が見つかりません',
      description: 'お探しの記事が見つかりませんでした。'
    }
  }

  const title = post.title
  const description = postDescription(post)
  const keywords = postKeywords(post)
  const fullImageUrl = resolveImageUrl(post.thumbnail_url || post.featured_image)
  // canonical / og:url はリクエストの slug ではなく記事の slug から作る
  const articleUrl = postUrl(post.slug)
  const publishedTime = post.published_at ?? post.created_at

  return {
    // 社名は layout の title.template (`%s | 株式会社エヌアンドエス`) が付けるので、ここでは付けない
    title,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: AUTHOR.name, url: AUTHOR.url }],
    openGraph: {
      title: `${title} | ${ORGANIZATION.name}`,
      description,
      type: 'article',
      url: articleUrl,
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: title
        }
      ],
      siteName: ORGANIZATION.name,
      locale: 'ja_JP',
      publishedTime,
      modifiedTime: post.updated_at ?? undefined,
      authors: [AUTHOR.url],
      tags: ['AI', 'ビジネス', 'テクノロジー', ...keywords].filter(Boolean)
    },
    twitter: {
      card: 'summary_large_image',
      site: '@nands_tech',
      creator: '@nands_tech',
      title: `${title} | ${ORGANIZATION.name}`,
      description,
      images: [fullImageUrl]
    },
    alternates: {
      canonical: articleUrl
    }
  }
}

export default async function PostPage({ params }: PageProps) {
  const post = await getPost(params.slug)

  if (!post) {
    notFound()
  }

  // canonical は記事の slug。別の表記で届いたリクエストは正規の URL へ 308 で寄せる
  if (decodePostSlug(params.slug) !== post.slug) {
    permanentRedirect(`/posts/${encodeURIComponent(post.slug)}`)
  }

  const articleUrl = postUrl(post.slug)

  // 🎬 YouTube動画（中尺動画 + ショート動画スライダー）
  const videos = await getPageVideos(post)
  const youtubeScript = videos.medium // 中尺動画（サムネの代わり）
  const youtubeShortVideos: YouTubeShortVideo[] = videos.sliderShorts.map((video) =>
    toSliderVideo(video, post.title)
  )

  // 記事内容からTOC抽出（見出し分析）
  const autoTOCSystem = new AutoTOCSystem({
    minLevel: 1,  // H1から含める
    maxLevel: 3   // H3まで含める
  })
  const tocData = autoTOCSystem.generateTOCFromHTML(post.content)

  // 関連情報抽出
  const relatedInfo = extractRelatedInfo(post.content)

  // 記事内容からFAQ自動抽出（構造化データ用）
  // 抽出結果は Markdown の残骸を掃除し、質問か回答が空になったものは載せない
  const faqData = new HowToFAQSchemaSystem()
    .extractFAQFromContent(post.content)
    .map((faq) => ({ ...faq, question: cleanFaqText(faq.question), answer: cleanFaqText(faq.answer) }))
    .filter((faq) => faq.question.length > 0 && faq.answer.length > 0)

  // パンくずリスト（表示用。BreadcrumbList の JSON-LD はページの @graph で出す）
  const breadcrumbItems: BreadcrumbItem[] = [
    { name: '記事一覧', path: '/posts' },
    { name: post.title, path: `/posts/${encodeURIComponent(post.slug)}` }
  ]

  const jsonLd = buildArticleJsonLd({
    post,
    articleUrl,
    toc: tocData.toc,
    faqs: faqData,
    videos: videos.linked,
  })

  return (
    <div className="container mx-auto px-4 py-8 bg-white dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
      {/* 構造化データ: 1 つの @graph を素の <script> で出す（JS を実行しないクローラにも届くよう HTML に含める） */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLdScript(jsonLd) }}
      />

      <div className="mt-16">
        <Breadcrumbs customItems={breadcrumbItems} withSchema={false} />
      </div>

      <article className="max-w-4xl mx-auto">
        {/* 記事タイトル - Fragment ID対応 */}
        <h1 id="main-title" className="text-xl sm:text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">{post.title}</h1>
        
        {/* 記事メタ情報 */}
        <div className="flex items-center gap-2 sm:gap-4 mb-6 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-1">
            <RefreshCw size={10} className="sm:w-3 sm:h-3" />
            <span className="hidden sm:inline">最終更新: </span>
            <span className="sm:hidden">更新: </span>
            <span className="hidden sm:inline">{new Date(post.updated_at || post.created_at).toLocaleDateString('ja-JP')}</span>
            <span className="sm:hidden">{new Date(post.updated_at || post.created_at).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}</span>
          </div>
          <div>
            <span className="hidden sm:inline">読了時間: 約</span>
            <span className="sm:hidden">読了: 約</span>
            {Math.ceil(post.content.replace(/\s+/g, '').length / 400)}分
          </div>
          <div>
            <span className="hidden sm:inline">文字数: </span>
            <span className="sm:hidden">字数: </span>
            {post.content.replace(/\s+/g, '').length.toLocaleString()}文字
          </div>
        </div>

        {/* 🎬 YouTube動画埋め込み（youtube_script_idがあり、動画が公開されている場合） */}
        {youtubeScript && youtubeScript.youtube_video_id && (
          <div 
            id={youtubeScript.fragment_id || 'youtube-short-video'} 
            className="my-8 bg-gradient-to-br from-green-800 to-emerald-900 dark:from-green-900 dark:to-emerald-950 rounded p-6 sm:p-8 border-2 border-green-500 dark:border-green-600 shadow-2xl scroll-mt-20"
          >
            <div className="flex items-center gap-3 mb-5">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" viewBox="0 0 24 24">
                {/* YouTubeロゴ背景（赤色） */}
                <path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/>
                {/* 再生ボタン三角形（白色） */}
                <path fill="#FFFFFF" d="M9.545 8.432v7.136L15.818 12z"/>
              </svg>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                この記事を動画で見る（100秒）
              </h3>
            </div>
            
            <p className="text-sm sm:text-base text-green-100 dark:text-green-200 mb-5 leading-relaxed">
              {youtubeScript.script_hook || 'YouTube動画で要点を簡潔に解説しています'}
            </p>
            
            {/* スマホ対応強化：min-heightを追加 */}
            <div className="relative w-full bg-black rounded overflow-hidden" style={{ paddingBottom: '56.25%', minHeight: '200px' }}>
              <iframe
                src={`https://www.youtube.com/embed/${youtubeScript.youtube_video_id}`}
                title={youtubeScript.script_title || post.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                className="absolute top-0 left-0 w-full h-full"
                style={{ border: 'none', minHeight: '200px' }}
              />
            </div>
            
            {/* 🎯 YouTube CTAボタン（魅力的なデザイン） */}
            <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`https://www.youtube.com/watch?v=${youtubeScript.youtube_video_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <span className="relative z-10 text-sm sm:text-base">高評価お願いします</span>
              </a>
              
              <a
                href="https://www.youtube.com/@kenjiharada_ai_site?sub_confirmation=1"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-900 hover:to-gray-800 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden border-2 border-red-500"
              >
                <span className="absolute inset-0 bg-red-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span className="relative z-10 text-sm sm:text-base">チャンネル登録</span>
              </a>
            </div>
            
            <div className="mt-5 pt-5 border-t border-green-600 dark:border-green-700">
              <p className="text-xs sm:text-sm text-green-200 dark:text-green-300 text-center font-medium">
                ✨ 詳細な解説はこの後のテキストで！動画とテキストで完全理解 ✨
              </p>
            </div>
          </div>
        )}
        
        {/* YouTube動画がない場合のみサムネイル画像を表示 */}
        {!youtubeScript?.youtube_video_id && (post.thumbnail_url || post.featured_image) && (
          <div className="relative mb-8">
            <Image
              src={post.thumbnail_url || post.featured_image || ''}
              alt={post.title}
              width={800}
              height={400}
              className="rounded-lg shadow-md w-full"
              unoptimized={true}
              priority={true}
            />
            </div>
        )}

        {/* TOC表示（Fragment ID付き・水色デザイン） */}
        <TOCComponent toc={tocData.toc} relatedInfo={relatedInfo} />

        {post.content && (
          <div className="mt-8">
            <MarkdownContent content={post.content
              .replace(/---\s*$/i, '')
              .trim()
            } />
          </div>
        )}

        {/* FAQ表示（自動抽出） - 重複防止のため無効化（記事本文内FAQを使用） */}
        {/* {faqData.length > 0 && (
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6 faq-section">
            <h2 className="text-xl font-bold mb-6 text-blue-900">よくある質問</h2>
            <div className="space-y-6">
              {faqData.map((faq: any, index: number) => (
                <div key={index} className="border-b border-blue-200 pb-4 last:border-b-0">
                  <h3 className="font-semibold text-blue-800 mb-2">Q. {faq.question}</h3>
                  <p className="text-blue-700">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )} */}

        {/* HOW TO表示（自動抽出） - 非表示に変更 */}
        {/* {howToData.steps.length > 0 && (
          <div className="mt-12 bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6 text-green-900">実装ガイド</h2>
            <div className="space-y-4">
              {howToData.steps.map((step: any, index: number) => (
                <div key={index} className="flex gap-4" id={`step-${index + 1}`}>
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800 mb-2">{step.title}</h3>
                    <p className="text-green-700">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )} */}

        {/* 📱 YouTubeショート動画スライダー（新規追加） */}
        {youtubeShortVideos.length > 0 && (
          <YouTubeShortSlider 
            videos={youtubeShortVideos} 
            currentArticleTitle={post.title} 
          />
        )}

        {/* 著者セクション - Fragment ID付き */}
        <div className="mt-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6" id="author-profile">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">著者について</h2>
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <Image
                src="/images/author/harada-kenji.jpg"
                alt="原田賢治"
                width={80}
                height={80}
                className="rounded-full border-2 border-gray-300"
                unoptimized={true}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">原田賢治</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{AUTHOR.jobTitle}</p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Mike King理論に基づくレリバンスエンジニアリング専門家。生成AI検索最適化、ChatGPT・Perplexity対応のGEO実装、企業向けAI研修を手がける。
                15年以上のAI・システム開発経験を持ち、全国で企業のDX・AI活用、退職代行サービスを支援。
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                <a 
                  href="https://x.com/NANDS_AI" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  X (Twitter)
                </a>
                <a 
                  href="https://www.youtube.com/@kenjiharada_ai_site?sub_confirmation=1" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  YouTube
                </a>
                <a 
                  href="https://www.linkedin.com/in/%E8%B3%A2%E6%B2%BB-%E5%8E%9F%E7%94%B0-77a4b7353/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </a>
                <a 
                  href={AUTHOR.url.replace(SITE_URL, '')} 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  詳細プロフィール
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* 記事タグがあれば表示 */}
        {(post.meta_keywords || post.seo_keywords) && (post.meta_keywords || post.seo_keywords)!.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {(post.meta_keywords || post.seo_keywords)!.map((keyword: string, index: number) => (
              <Link 
                key={index} 
                href={`/search?keyword=${encodeURIComponent(keyword)}`}
                className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm transition-colors"
              >
                #{keyword}
              </Link>
            ))}
          </div>
        )}
      </article>
    </div>
  )
}
