'use client';

import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

type Props = {
  title: string;
  content: string;
  thumbnailUrl?: string;
  metaDescription?: string;
};

export default function PostPreview({ title, content, thumbnailUrl, metaDescription }: Props) {
  const sanitizedHtml = DOMPurify.sanitize(marked(content));

  return (
    <article className="prose prose-indigo max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{title}</h1>
      
      {thumbnailUrl && (
        <img
          src={thumbnailUrl}
          alt={title}
          className="w-full h-64 object-cover rounded-lg mb-8"
        />
      )}

      {metaDescription && (
        <p className="text-gray-600 text-lg mb-8">
          {metaDescription}
        </p>
      )}

      <div
        className="markdown-content"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    </article>
  );
} 