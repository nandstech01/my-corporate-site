'use client';

import React from 'react';
import { createClient } from '@/lib/supabase/supabase';
import { Analytics } from '@/components/admin/Analytics';
import { useOverallStats } from '@/hooks/useOverallStats';
import type { Database } from '@/lib/supabase/database.types';

type Post = {
  slug: string;
  title: string;
};

export default function AnalyticsPage() {
  const [selectedSlug, setSelectedSlug] = React.useState<string>('');
  const [posts, setPosts] = React.useState<Post[]>([]);
  const { totalViews, deviceStats, countryStats, loading, error } = useOverallStats(30);

  React.useEffect(() => {
    async function fetchPosts() {
      const supabase = createClient();
      const { data } = await supabase
        .from('posts')
        .select('slug, title')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (data) {
        setPosts(data as Post[]);
        if (data.length > 0) {
          setSelectedSlug(data[0].slug as string);
        }
      }
    }

    fetchPosts();
  }, []);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">記事別の統計</h2>
        <div className="mb-6">
          <label htmlFor="post-select" className="block text-sm font-medium text-gray-700 mb-2">
            記事を選択
          </label>
          <select
            id="post-select"
            value={selectedSlug}
            onChange={(e) => setSelectedSlug(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            {posts.map((post) => (
              <option key={post.slug} value={post.slug}>
                {post.title}
              </option>
            ))}
          </select>
        </div>

        {selectedSlug && (
          <Analytics slug={selectedSlug} showSearchData={true} />
        )}
      </div>
    </div>
  );
} 