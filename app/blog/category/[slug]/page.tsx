import { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase';
import { PageViewTracker } from '@/components/analytics/PageViewTracker';
import ClientBoundary from './ClientBoundary';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from './ErrorFallback';
import { generateBreadcrumbSchema } from '@/schemas/breadcrumb';

interface Category {
  id: number;
  name: string;
  description: string | null;
  slug: string;
}

interface Props {
  params: {
    slug: string;
  };
}

// メタデータを動的に生成
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createServerClient();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://taishoku-anshin-daiko.com';
  
  const { data: category } = await supabase
    .from('categories')
    .select('name, description')
    .eq('slug', params.slug)
    .single<Pick<Category, 'name' | 'description'>>();

  if (!category) {
    return {
      title: 'カテゴリが見つかりません',
      description: 'お探しのカテゴリページは存在しません。',
    };
  }

  // Generate breadcrumb items for structured data
  const breadcrumbItems = [
    { name: 'ホーム', url: '/' },
    { name: 'ブログ', url: '/blog' },
    { name: category.name, url: `/blog/category/${params.slug}` }
  ];

  // Generate structured data
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${category.name}の記事一覧`,
      description: category.description || `${category.name}に関する記事の一覧です。`,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${baseUrl}/blog/category/${params.slug}`
      },
      isPartOf: {
        '@type': 'Blog',
        name: 'あんしん退職コラム',
        url: `${baseUrl}/blog`
      }
    },
    generateBreadcrumbSchema(breadcrumbItems, baseUrl)
  ];

  const title = `${category.name}の記事一覧 | 退職代行なら退職安心代行`;
  const description = category.description || `${category.name}に関する記事の一覧です。`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${baseUrl}/blog/category/${params.slug}`,
      siteName: '退職代行なら退職安心代行',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    other: {
      'application/ld+json': structuredData.map(item => JSON.stringify(item)).join('\n')
    }
  };
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <ClientBoundary slug={params.slug} />
      </ErrorBoundary>
    </div>
  );
} 