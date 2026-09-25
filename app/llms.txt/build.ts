/**
 * /llms.txt (https://llmstxt.org/ の形式) の組み立て (純関数)。記事の取得は route.ts。
 * 形式: H1 社名 → 要約の引用 → 会社情報 → ## サービス → ## 記事 (公開中の全記事) → ## Optional。
 * 会社情報は site-entities (= /legal・/about と同じ事実) だけから作る。旧 public/llms.txt の
 * 独自ディレクティブ (Priority: など) と 404 のカテゴリリンクは載せない。
 */
import { FEED_ITEM_LIMIT, FEED_URL } from '@/app/feed.xml/build'
import type { PublishedPostSummary } from '@/app/posts/_lib/public-client'
import { parseDate, postLastModified, toOneLine } from '@/app/posts/_lib/syndication'
import { AUTHOR, ORGANIZATION, SITE_URL, postUrl } from '@/lib/structured-data/site-entities'

/** /legal の特定商取引法表記と同じ連絡先 */
const CONTACT_EMAIL = 'contact@nands.tech'

export interface LlmsLink {
  title: string
  url: string
  description?: string
}

const page = (path: string): string => `${SITE_URL}${path}`

/** 主要サービス (2026-09-26 に本番で 200 を確認)。説明は各ページの meta description を事実だけに縮めたもの */
export const SERVICE_LINKS: readonly LlmsLink[] = [
  {
    title: '法人向けAIリスキリング研修・業務効率化支援',
    url: page('/corporate'),
    description: '生成AIを使った業務改善・DX推進・人材育成のための法人研修',
  },
  {
    title: 'AIシステム開発',
    url: page('/system-development'),
    description: 'RAG・ベクトル検索を組み込んだ業務システムの設計・開発・運用',
  },
  {
    title: 'AIO対策・GEO・レリバンスエンジニアリング',
    url: page('/aio-seo'),
    description: 'ChatGPT・Perplexity・Google AI Overviews などの AI 検索に向けたサイト構造と構造化データの最適化',
  },
  {
    title: 'AIエージェント開発',
    url: page('/ai-agents'),
    description: 'ChatGPT・Claude などの LLM とツール呼び出しを使った業務自動化エージェントの開発',
  },
  {
    title: 'ベクトルRAG開発',
    url: page('/vector-rag'),
    description: 'Embedding とベクトル検索による社内ナレッジ検索・知識ベースの構築',
  },
  {
    title: 'AIサイト開発',
    url: page('/ai-site'),
    description: 'RAG・自動ブログ・構造化データを備えた、AI 検索に引用されることを前提にしたサイト制作',
  },
  {
    title: 'チャットボット開発',
    url: page('/chatbot-development'),
    description: 'GPT-4・Claude とベクトル RAG を使った自動応答チャットボットの開発',
  },
  {
    title: 'MCPサーバー開発',
    url: page('/mcp-servers'),
    description: 'Model Context Protocol (MCP) で AI と社内システム・データベースをつなぐサーバーの開発',
  },
]

/** 省略してもよい補足ページ (2026-09-26 に本番で 200 を確認。著者ページはこのブランチで新設) */
export const OPTIONAL_LINKS: readonly LlmsLink[] = [
  { title: '会社概要', url: page('/about'), description: '沿革・事業内容・代表メッセージ' },
  { title: '著者プロフィール', url: AUTHOR.url, description: `${AUTHOR.name}のプロフィールと執筆記事の一覧` },
  { title: '記事一覧', url: page('/posts') },
  { title: 'RSS フィード', url: FEED_URL, description: `最新 ${FEED_ITEM_LIMIT} 件` },
  { title: 'HR支援・人事DXソリューション', url: page('/hr-solutions'), description: '人事業務の自動化・労働法相談などの人事DX支援' },
  { title: 'SNS自動化システム開発', url: page('/sns-automation'), description: 'X・Instagram・Facebook の投稿を自動化するシステムの開発' },
  { title: '動画生成AI開発', url: page('/video-generation'), description: '動画生成AIを使った動画制作の自動化' },
  { title: '個人向けAIリスキリング研修', url: page('/reskilling'), description: '生成AIの活用スキルを身につける個人向け研修' },
  { title: 'AI副業支援', url: page('/fukugyo'), description: '生成AIを使った副業のスキル習得支援' },
  { title: 'よくある質問', url: page('/faq') },
  { title: '法的情報 (特定商取引法に基づく表記)', url: page('/legal') },
  { title: 'プライバシーポリシー', url: page('/privacy') },
  { title: '利用規約', url: page('/terms') },
]

export type LlmsPost = Pick<
  PublishedPostSummary,
  'slug' | 'title' | 'meta_description' | 'published_at' | 'created_at' | 'updated_at'
>

/** "2008-04" → "2008年4月" ("2008-04-01" → "2008年4月1日")。形式が違えばそのまま返す */
export function formatFoundingDate(value: string): string {
  const match = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(value)
  if (!match) return value
  const [, year, month, day] = match
  return `${year}年${Number(month)}月${day ? `${Number(day)}日` : ''}`
}

/** リンク文字列の中で意味を持つ \ [ ] をエスケープし、1 行にする */
function escapeLinkText(text: string): string {
  return toOneLine(text).replace(/[\\[\]]/g, (ch) => `\\${ch}`)
}

/** encodeURIComponent は ( ) を残すため、リンク先の終わりと誤読されないよう % エンコードする */
function escapeLinkUrl(url: string): string {
  return url.replace(/\(/g, '%28').replace(/\)/g, '%29')
}

/** "- [title](url): description" (description が空なら ": " 以降を付けない) */
export function markdownLink(title: string, url: string, description?: string | null): string {
  const detail = toOneLine(description)
  return `- [${escapeLinkText(title)}](${escapeLinkUrl(url)})${detail ? `: ${detail}` : ''}`
}

function lastModifiedTime(post: LlmsPost): number {
  return parseDate(postLastModified(post))?.getTime() ?? 0
}

function companySection(): string[] {
  const { address } = ORGANIZATION
  const summary =
    `${ORGANIZATION.name}（${ORGANIZATION.alternateName[0]}）は${address.region}${address.locality}の会社です。` +
    'AIシステム開発（AIエージェント・RAG・チャットボット・MCPサーバー）、AI 検索向けのサイト最適化、' +
    '法人向けの生成AIリスキリング研修を提供し、キャリアコンサルティングと退職支援の事業も行っています。'

  return [
    `# ${ORGANIZATION.name}`,
    '',
    `> ${summary}`,
    '',
    `- 名称: ${ORGANIZATION.legalName}（${ORGANIZATION.alternateName.join('、')}）`,
    `- 代表者: ${AUTHOR.name}（${AUTHOR.jobTitle}、ORCID ${AUTHOR.orcid}）`,
    `- 設立: ${formatFoundingDate(ORGANIZATION.foundingDate)}`,
    `- 所在地: ${ORGANIZATION.addressText}`,
    `- 電話: ${ORGANIZATION.telephone}`,
    `- メール: ${CONTACT_EMAIL}`,
    `- 法人番号: ${ORGANIZATION.corporateNumber}`,
    `- ウェブサイト: ${ORGANIZATION.url}`,
    '',
    `ブログ（${page('/posts')}、RSS ${FEED_URL}）の著者は${AUTHOR.name}です。` +
      '下の「記事」には公開中の全記事を、最終更新日の新しい順に載せています。',
  ]
}

/** 公開中の全記事を最終更新日 (updated_at ?? published_at ?? created_at) の新しい順に載せる */
export function buildLlmsTxt(posts: readonly LlmsPost[]): string {
  const articles = [...posts].sort(
    (a, b) => lastModifiedTime(b) - lastModifiedTime(a) || a.slug.localeCompare(b.slug)
  )

  return [
    ...companySection(),
    '',
    '## サービス',
    '',
    ...SERVICE_LINKS.map((link) => markdownLink(link.title, link.url, link.description)),
    '',
    '## 記事',
    '',
    ...articles.map((post) => markdownLink(post.title, postUrl(post.slug), post.meta_description)),
    '',
    '## Optional',
    '',
    ...OPTIONAL_LINKS.map((link) => markdownLink(link.title, link.url, link.description)),
    '',
  ].join('\n')
}
