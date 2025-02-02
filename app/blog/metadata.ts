const baseUrl = 'https://taishoku-anshin-daiko.com';

const blogSchema = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  headline: 'あんしん退職コラム',
  description: '退職に関する不安や悩みを解消する情報メディア。退職のノウハウから、キャリアプランまで、あなたの新しい一歩を、私たちがサポートします。',
  url: `${baseUrl}/blog`,
  publisher: {
    '@type': 'Organization',
    name: '退職あんしん代行',
    url: baseUrl
  }
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
    }
  ]
};

export const metadata = {
  title: 'あんしん退職コラム | 退職あんしん代行',
  description: '退職に関する不安や悩みを解消する情報メディア。退職のノウハウから、キャリアプランまで、あなたの新しい一歩を、私たちがサポートします。',
  keywords: '退職代行,退職代行料金,退職代行とは,退職代行弁護士,退職相談,即日対応,無料相談',
  alternates: {
    canonical: `${baseUrl}/blog`
  },
  openGraph: {
    title: 'あんしん退職コラム | 退職あんしん代行',
    description: '退職に関する不安や悩みを解消する情報メディア。退職のノウハウから、キャリアプランまで、あなたの新しい一歩を、私たちがサポートします。',
    url: `${baseUrl}/blog`,
    siteName: '退職あんしん代行',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'あんしん退職コラム | 退職あんしん代行',
    description: '退職に関する不安や悩みを解消する情報メディア。退職のノウハウから、キャリアプランまで、あなたの新しい一歩を、私たちがサポートします。',
  },
  other: {
    'format-detection': 'telephone=no'
  },
  // Next.js 13でJSON-LDを正しく出力するための方法
  verification: {
    'ld+json': JSON.stringify([blogSchema, breadcrumbSchema])
  }
}; 