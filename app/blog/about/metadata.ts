const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nands.ai';

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'NANDS編集部',
  description: '生成AI時代の総合情報メディア。副業支援、法人向けAI導入、個人向けリスキリングなど、最新のAI活用情報を提供します。',
  url: `${baseUrl}/blog/about`,
  sameAs: [
    `${baseUrl}/blog`
  ]
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      item: {
        '@id': baseUrl,
        name: 'ホーム'
      }
    },
    {
      '@type': 'ListItem',
      position: 2,
      item: {
        '@id': `${baseUrl}/blog`,
        name: 'NANDSブログ'
      }
    },
    {
      '@type': 'ListItem',
      position: 3,
      item: {
        '@id': `${baseUrl}/blog/about`,
        name: 'NANDS編集部について'
      }
    }
  ]
};

export const metadata = {
  title: 'NANDS編集部について | 生成AI時代の総合情報メディア',
  description: '生成AI時代を生き抜くための総合情報メディア。副業支援、法人向けAI導入、個人向けリスキリングなど、最新のAI活用情報を提供します。',
  keywords: '生成AI,ChatGPT,副業支援,リスキリング,AI導入,DX推進,キャリアアップ,AI活用,NANDS',
  alternates: {
    canonical: `${baseUrl}/blog/about`
  },
  openGraph: {
    title: 'NANDS編集部について | 生成AI時代の総合情報メディア',
    description: '生成AI時代を生き抜くための総合情報メディア。副業支援、法人向けAI導入、個人向けリスキリングなど、最新のAI活用情報を提供します。',
    url: `${baseUrl}/blog/about`,
    siteName: 'NANDS',
    locale: 'ja_JP',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NANDS編集部について',
    description: '生成AI時代を生き抜くための総合情報メディア。副業支援、法人向けAI導入、個人向けリスキリングなど、最新のAI活用情報を提供します。',
  },
  verification: {
    'ld+json': JSON.stringify([organizationSchema, breadcrumbSchema])
  }
}; 