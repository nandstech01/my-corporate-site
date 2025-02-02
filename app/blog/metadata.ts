// 型定義
export type Category = {
  slug: string;
  name: string;
};

export type BusinessCategory = {
  name: string;
  description: string;
  categories: Category[];
};

export type BusinessCategories = {
  [key: string]: BusinessCategory;
};

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const BUSINESS_CATEGORIES: BusinessCategories = {
  fukugyo: {
    name: '副業支援',
    description: 'AIツールを活用した副業支援情報を提供。効率的な収入獲得をサポートします。',
    categories: [
      { slug: 'ai-short-video', name: 'AIショート動画/UGCマーケ支援' },
      { slug: 'ai-translation', name: 'AI翻訳・字幕作成' },
      { slug: 'ai-voice', name: 'AI音声合成/ナレーション' },
      { slug: 'nocode-ai', name: 'No-code × AIアプリ構築' },
      { slug: 'seo-writing', name: 'SEOライティング' },
      { slug: 'data-analysis', name: 'データ分析' },
      { slug: 'business-admin', name: 'ビジネス事務' },
      { slug: 'programming', name: 'プログラミング' },
      { slug: 'ai-consultant', name: '生成AIコンサルタント' },
      { slug: 'image-video-generation', name: '画像・動画生成' }
    ]
  },
  reskilling: {
    name: '法人向けリスキリング',
    description: '業界別のAI導入・リスキリングソリューションを提供。企業のDX推進を支援します。',
    categories: [
      { slug: 'it-software', name: 'IT・ソフトウェア業界向けリスキリング' },
      { slug: 'hr-services', name: '人材サービス業界向けリスキリング' },
      { slug: 'medical-care', name: '医療・介護業界向けリスキリング' },
      { slug: 'retail-ec', name: '小売・EC業界向けリスキリング' },
      { slug: 'ad-marketing', name: '広告・マーケティング業界向けリスキリング' },
      { slug: 'construction-real-estate', name: '建設・不動産業界向けリスキリング' },
      { slug: 'logistics-transport', name: '物流・運輸業界向けリスキリング' },
      { slug: 'government', name: '自治体・公共機関向けリスキリング' },
      { slug: 'manufacturing', name: '製造業界向けリスキリング' },
      { slug: 'finance', name: '金融業界向けリスキリング' }
    ]
  },
  corporate: {
    name: '個人向けリスキリング',
    description: 'AI時代に必要なスキルを効率的に習得。個人のキャリアアップを支援します。',
    categories: [
      { slug: 'ai-tools', name: 'AIツール紹介' },
      { slug: 'ai-news', name: 'AIニュース・トレンド' },
      { slug: 'ai-basics', name: 'AI基礎知識' },
      { slug: 'chatgpt', name: 'ChatGPT活用' },
      { slug: 'python', name: 'Python入門' },
      { slug: 'data-analytics', name: 'データ分析' },
      { slug: 'side-job-ai', name: '副業向けAIスキル' },
      { slug: 'projects', name: '実践プロジェクト' },
      { slug: 'certifications', name: '資格・認定' },
      { slug: 'career', name: '転職・キャリア' }
    ]
  }
} as const;

type SchemaOrg = {
  '@context': 'https://schema.org';
  '@type': string;
  [key: string]: any;
};

const blogSchema: SchemaOrg = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  headline: 'NANDSブログ',
  description: '生成AI時代を生き抜くための総合情報メディア。副業支援、法人向けAI導入、個人向けリスキリングなど、最新のAI活用情報を提供します。',
  url: `${baseUrl}/blog`,
  publisher: {
    '@type': 'Organization',
    name: 'NANDS',
    url: baseUrl
  }
};

const breadcrumbSchema: SchemaOrg = {
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
    }
  ]
};

export const metadata = {
  title: 'NANDSブログ | 生成AI時代の総合情報メディア',
  description: '生成AI時代を生き抜くための総合情報メディア。副業支援、法人向けAI導入、個人向けリスキリングなど、最新のAI活用情報を提供します。',
  keywords: '生成AI,ChatGPT,副業支援,リスキリング,AI導入,DX推進,キャリアアップ,AI活用,NANDS',
  alternates: {
    canonical: `${baseUrl}/blog`
  },
  openGraph: {
    title: 'NANDSブログ | 生成AI時代の総合情報メディア',
    description: '生成AI時代を生き抜くための総合情報メディア。副業支援、法人向けAI導入、個人向けリスキリングなど、最新のAI活用情報を提供します。',
    url: `${baseUrl}/blog`,
    siteName: 'NANDS',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NANDSブログ | 生成AI時代の総合情報メディア',
    description: '生成AI時代を生き抜くための総合情報メディア。副業支援、法人向けAI導入、個人向けリスキリングなど、最新のAI活用情報を提供します。',
  },
  other: {
    'format-detection': 'telephone=no'
  },
  verification: {
    'ld+json': JSON.stringify([blogSchema, breadcrumbSchema])
  }
} as const; 