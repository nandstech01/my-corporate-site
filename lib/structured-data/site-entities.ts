/**
 * サイト共通エンティティ (著者 Person / 運営 Organization) の単一定義元。
 *
 * 記事・一覧・著者ページ・feed・llms.txt の JSON-LD とメタデータはここだけを参照し、
 * 同じ人物・組織を別の @id や別の事実で書かない。
 * 事実の出典: tasks/phase3-blog.md 決定事項 3a-1 (外部プロフィールは全て 200 を確認済み)。
 * 会社情報は /legal と同じ (法人番号は gBizINFO で住所一致を確認済み)。
 */

export const SITE_URL = 'https://nands.tech'

export interface ExternalProfile {
  /** 画面表示用のサービス名 */
  readonly label: string
  readonly url: string
}

export interface JsonLdRef {
  '@id': string
}

/** 本人のアカウントだけ。会社アカウントは ORGANIZATION.sameAs に置く (混ぜると Person＝会社 の宣言になる) */
const AUTHOR_PROFILES: readonly ExternalProfile[] = [
  { label: 'ORCID', url: 'https://orcid.org/0009-0007-2241-9100' },
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/%E8%B3%A2%E6%B2%BB-%E5%8E%9F%E7%94%B0-77a4b7353' },
  { label: 'YouTube', url: 'https://www.youtube.com/@kenjiharada_ai_site' },
  { label: 'Zenn', url: 'https://zenn.dev/kenji_harada' },
  { label: 'Qiita', url: 'https://qiita.com/kenji_harada' },
  { label: 'note', url: 'https://note.com/kenji_h_ai' },
]

export const AUTHOR = {
  id: `${SITE_URL}/author/harada-kenji#person`,
  slug: 'harada-kenji',
  url: `${SITE_URL}/author/harada-kenji`,
  name: '原田賢治',
  alternateName: ['原田 賢治', 'Kenji Harada'] as readonly string[],
  jobTitle: '代表取締役',
  image: `${SITE_URL}/images/author/harada-kenji.jpg`,
  orcid: '0009-0007-2241-9100',
  profiles: AUTHOR_PROFILES,
  sameAs: AUTHOR_PROFILES.map((profile) => profile.url) as readonly string[],
} as const

export const ORGANIZATION = {
  id: `${SITE_URL}/#organization`,
  name: '株式会社エヌアンドエス',
  legalName: '株式会社エヌアンドエス',
  alternateName: ['NANDS', 'エヌアンドエス'] as readonly string[],
  url: SITE_URL,
  /** /images/logo.png は 0 バイトのため svg を使う */
  logo: `${SITE_URL}/images/logo.svg`,
  /** 法人番号。滋賀県内の同名別会社と区別する識別子 */
  corporateNumber: '2160001004065',
  foundingDate: '2008-04',
  telephone: '0120-407-638',
  address: {
    postalCode: '520-0025',
    region: '滋賀県',
    locality: '大津市',
    street: '皇子が丘2丁目10-25-3004号',
    country: 'JP',
  },
  /** 表示用の 1 行住所 (llms.txt など) */
  addressText: '〒520-0025 滋賀県大津市皇子が丘2丁目10-25-3004号',
  sameAs: ['https://x.com/NANDS_AI', 'https://github.com/nandstech01'] as readonly string[],
} as const

export function personRef(): JsonLdRef {
  return { '@id': AUTHOR.id }
}

export function organizationRef(): JsonLdRef {
  return { '@id': ORGANIZATION.id }
}

/** @graph に 1 回だけ置く Person の完全ノード。他の場所からは personRef() で参照する */
export function personNode() {
  return {
    '@type': 'Person' as const,
    '@id': AUTHOR.id,
    name: AUTHOR.name,
    alternateName: [...AUTHOR.alternateName],
    url: AUTHOR.url,
    image: AUTHOR.image,
    jobTitle: AUTHOR.jobTitle,
    worksFor: organizationRef(),
    identifier: {
      '@type': 'PropertyValue' as const,
      propertyID: 'ORCID',
      value: AUTHOR.orcid,
      url: `https://orcid.org/${AUTHOR.orcid}`,
    },
    sameAs: [...AUTHOR.sameAs],
  }
}

/** @graph に 1 回だけ置く Organization の完全ノード。他の場所からは organizationRef() で参照する */
export function organizationNode() {
  const { address } = ORGANIZATION
  return {
    '@type': 'Organization' as const,
    '@id': ORGANIZATION.id,
    name: ORGANIZATION.name,
    legalName: ORGANIZATION.legalName,
    alternateName: [...ORGANIZATION.alternateName],
    url: ORGANIZATION.url,
    logo: { '@type': 'ImageObject' as const, url: ORGANIZATION.logo },
    identifier: {
      '@type': 'PropertyValue' as const,
      propertyID: '法人番号',
      value: ORGANIZATION.corporateNumber,
    },
    foundingDate: ORGANIZATION.foundingDate,
    telephone: ORGANIZATION.telephone,
    address: {
      '@type': 'PostalAddress' as const,
      postalCode: address.postalCode,
      addressRegion: address.region,
      addressLocality: address.locality,
      streetAddress: address.street,
      addressCountry: address.country,
    },
    founder: personRef(),
    sameAs: [...ORGANIZATION.sameAs],
  }
}

/**
 * <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLdScript(obj) }} /> 用の文字列。
 * "<" を < にして、値に含まれる </script> や <!-- でタグを抜けられないようにする
 * (company_youtube_shorts などは anon から書き込めるため必須)。JSON としての意味は変わらない。
 */
export function toJsonLdScript(obj: object): string {
  return JSON.stringify(obj).replace(/</g, '\\u003c')
}

/**
 * URL 上の slug (params.slug はパーセントエンコード済み) を DB の slug に戻す。
 * 生の slug を渡しても変わらない。不正な "%" を含むときはそのまま返す。
 */
export function decodePostSlug(slug: string): string {
  try {
    return decodeURIComponent(slug)
  } catch {
    return slug
  }
}

/**
 * 記事の絶対 URL。本番 canonical と同じく slug を encodeURIComponent する (日本語 slug は %E3%.. の大文字表記)。
 * 生の DB slug と、すでにエンコード済みの params.slug のどちらを渡しても同じ結果になる。
 */
export function postUrl(slug: string): string {
  return `${SITE_URL}/posts/${encodeURIComponent(decodePostSlug(slug))}`
}
