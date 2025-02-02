const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://taishoku-anshin-daiko.com';

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: '退職あんしん代行編集部',
  description: '退職に関する専門知識を持つ編集チーム。退職代行の現場経験を活かし、正確で実践的な情報を提供します。',
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
        name: 'あんしん退職コラム'
      }
    },
    {
      '@type': 'ListItem',
      position: 3,
      item: {
        '@id': `${baseUrl}/blog/about`,
        name: '退職あんしん代行編集部について'
      }
    }
  ]
};

export const metadata = {
  title: '退職あんしん代行編集部について | 退職あんしん代行',
  description: '退職に関する専門知識を持つ編集チームが、あなたの退職に関する不安や悩みを解消するための情報を提供します。',
  keywords: '退職代行,退職相談,編集部,専門知識,退職ノウハウ',
  alternates: {
    canonical: `${baseUrl}/blog/about`
  },
  openGraph: {
    title: '退職あんしん代行編集部について | 退職あんしん代行',
    description: '退職に関する専門知識を持つ編集チームが、あなたの退職に関する不安や悩みを解消するための情報を提供します。',
    url: `${baseUrl}/blog/about`,
    siteName: '退職あんしん代行',
    locale: 'ja_JP',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: '退職あんしん代行編集部について',
    description: '退職に関する専門知識を持つ編集チームが、あなたの退職に関する不安や悩みを解消するための情報を提供します。',
  },
  verification: {
    'ld+json': JSON.stringify([organizationSchema, breadcrumbSchema])
  }
}; 