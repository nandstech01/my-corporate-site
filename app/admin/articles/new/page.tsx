'use client';

import { useRouter } from 'next/navigation';
import ArticleForm from '@/components/admin/ArticleForm';
import type { BlogPost } from '@/types/blog';

export default function NewArticlePage() {
  const router = useRouter();

  const handleSubmit = async (data: Partial<BlogPost>) => {
    try {
      // 実際のアプリケーションでは、ここでAPIを呼び出して記事を保存します
      console.log('Create new article:', data);
      // await fetch('/api/articles', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });
      router.push('/admin/articles');
    } catch (error) {
      console.error('Failed to create article:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">新規記事作成</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <ArticleForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
} 