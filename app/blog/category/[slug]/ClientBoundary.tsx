'use client';

import { Suspense } from 'react';
import CategoryBreadcrumbs from './CategoryBreadcrumbs';
import CategoryPosts from './CategoryPosts';

export default function ClientBoundary({ slug }: { slug: string }) {
  console.log('ClientBoundary rendering with slug:', decodeURIComponent(slug));

  return (
    <div className="space-y-8">
      <div className="relative">
        <Suspense fallback={<div className="h-8 bg-gray-100 animate-pulse rounded"></div>}>
          <CategoryBreadcrumbs slug={slug} />
        </Suspense>
      </div>
      <div className="relative">
        <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse rounded"></div>}>
          <CategoryPosts slug={slug} />
        </Suspense>
      </div>
    </div>
  );
} 