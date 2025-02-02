'use client';

import React from 'react';
import ArticleForm from '@/components/admin/ArticleForm';
import { BlogPost } from '@/types/blog';

export default function EditArticlePage({ params }: { params: { slug: string } }) {
  const handleSubmit = (data: Partial<BlogPost>) => {
    console.log('Submitting article:', data);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">記事の編集</h1>
      <ArticleForm onSubmit={handleSubmit} />
    </div>
  );
} 