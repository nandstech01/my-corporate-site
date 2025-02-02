'use client';

import React from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { marked } from 'marked';

interface Props {
  title: string;
  content: string;
  thumbnailUrl?: string;
  metaDescription?: string;
}

marked.setOptions({ async: false });

export default function PostPreview({ title, content, thumbnailUrl, metaDescription }: Props) {
  const sanitizedHtml = DOMPurify.sanitize(marked.parse(content) as string);

  return (
    <article className="prose prose-indigo max-w-none">
      <h1>{title}</h1>
      {thumbnailUrl && (
        <img
          src={thumbnailUrl}
          alt={title}
          className="w-full h-64 object-cover rounded-lg"
        />
      )}
      {metaDescription && <p className="text-gray-600">{metaDescription}</p>}
      <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
    </article>
  );
} 