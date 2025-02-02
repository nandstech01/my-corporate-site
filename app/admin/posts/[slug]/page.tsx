'use client';

import React, { useEffect } from 'react';
import { supabase } from '@/lib/supabase/supabase';
import ContentImageManager from '@/components/admin/ContentImageManager';
import MarkdownContent from '@/components/blog/MarkdownContent';

export default function PostPage({
  params
}: {
  params: { slug: string }
}) {
  const [content, setContent] = React.useState('');
  const [post, setPost] = React.useState<any>(null);

  useEffect(() => {
    const fetchPost = async () => {
      console.log('Fetching post for slug:', params.slug);
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', params.slug)
        .single();

      if (error) {
        console.error('Error fetching post:', error);
        return;
      }

      if (data) {
        console.log('Post data:', data);
        console.log('Post content:', data.content);
        setPost(data);
        setContent(data.content);
      }
    };

    fetchPost();
  }, [params.slug]);

  const handleImageSelect = (imageId: string) => {
    console.log('Image selected:', imageId);
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (!textarea) return;

    const { selectionStart, selectionEnd } = textarea;
    const currentContent = textarea.value;
    const newContent = 
      currentContent.substring(0, selectionStart) +
      `![[${imageId}]]` +
      currentContent.substring(selectionEnd);

    console.log('New content:', newContent);
    setContent(newContent);
  };

  if (!post) {
    return <div>Loading...</div>;
  }

  console.log('Rendering with content:', content);
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="prose max-w-none">
        <MarkdownContent content={content} />
      </div>
      <ContentImageManager
        postId={post.id}
        onImageSelect={handleImageSelect}
      />
    </div>
  );
} 