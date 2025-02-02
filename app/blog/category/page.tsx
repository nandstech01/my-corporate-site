import { Suspense } from 'react';
import { PageViewTracker } from '@/components/analytics/PageViewTracker';
import Breadcrumbs, { Breadcrumb } from '@/components/common/Breadcrumbs';
import CategoriesList from '../categories/CategoriesList';

export const dynamic = 'force-static';
export const revalidate = false;

export default function CategoryIndexPage() {
  const breadcrumbs: Breadcrumb[] = [
    { label: 'ブログ', href: '/blog' },
    { label: 'カテゴリ一覧', href: '/blog/category' },
  ];

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageViewTracker />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="mb-4">
        <Breadcrumbs items={breadcrumbs} />
      </div>
      
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          カテゴリ一覧
        </h1>
        
        <div className="mb-6 text-gray-600">
          <p>
            退職に関する様々な情報をカテゴリ別に整理しています。
            気になるカテゴリから、あなたに必要な情報を見つけてください。
          </p>
        </div>

        <Suspense fallback={
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        }>
          <CategoriesList />
        </Suspense>
      </div>
    </div>
  );
} 