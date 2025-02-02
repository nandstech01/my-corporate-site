'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import Breadcrumbs, { Breadcrumb } from '@/components/common/Breadcrumbs';

interface Category {
  name: string;
}

export default function CategoryBreadcrumbs({ slug }: { slug: string }) {
  const decodedSlug = decodeURIComponent(slug);
  console.log('CategoryBreadcrumbs rendering with slug:', { original: slug, decoded: decodedSlug });
  
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchCategory = async () => {
      try {
        console.log('CategoryBreadcrumbs fetching category for slug:', decodedSlug);
        const supabase = createClient();
        const { data, error } = await supabase
          .from('categories')
          .select('name')
          .eq('slug', decodedSlug)
          .single<Pick<Category, 'name'>>();

        console.log('CategoryBreadcrumbs fetch result:', { data, error });

        if (error) {
          throw error;
        }

        if (mounted) {
          setCategory(data);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching category:', err);
        if (mounted) {
          setError(err as Error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchCategory();

    return () => {
      mounted = false;
    };
  }, [decodedSlug]);

  console.log('CategoryBreadcrumbs state:', { loading, category, error });

  if (loading) {
    console.log('CategoryBreadcrumbs showing loading state');
    return <div className="h-8 bg-gray-100 animate-pulse rounded"></div>;
  }

  if (error) {
    console.error('CategoryBreadcrumbs showing error state:', error);
    return <div className="text-red-600">Error: {error.message}</div>;
  }

  if (!category) {
    console.log('CategoryBreadcrumbs showing not found state');
    return <div className="text-gray-600">Category not found</div>;
  }

  const breadcrumbs: Breadcrumb[] = [
    { label: 'ブログ', href: '/blog' },
    { label: 'カテゴリ一覧', href: '/blog/categories' },
    { label: category.name, href: `/blog/category/${slug}` },
  ];

  // ホームは Breadcrumbs コンポーネントで自動的に追加されるため、スキーマでは2番目以降の項目から開始
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `https://taishoku-anshin-daiko.com${item.href}`
    }))
  };

  console.log('CategoryBreadcrumbs rendering breadcrumbs:', breadcrumbs);

  return (
    <div className="mb-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Breadcrumbs items={breadcrumbs} />
    </div>
  );
} 