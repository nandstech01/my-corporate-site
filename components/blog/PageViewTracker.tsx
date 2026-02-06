'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/supabase';

interface PageViewTrackerProps {
  slug: string;
}

export const PageViewTracker: React.FC<PageViewTrackerProps> = ({ slug }) => {
  useEffect(() => {
    const incrementPageView = async () => {
      try {
        // TODO: blog_posts テーブルが存在しないため、page_views テーブルを使用するか確認が必要
        // 現在は page view tracking を無効化
        /*
        const { data, error } = await supabase
          .from('blog_posts')
          .select('views')
          .eq('slug', slug)
          .single();

        if (error) throw error;

        const currentViews = data?.views || 0;

        await supabase
          .from('blog_posts')
          .update({ views: currentViews + 1 })
          .eq('slug', slug);
        */
      } catch (error) {
        console.error('Error incrementing page view:', error);
      }
    };

    incrementPageView();
  }, [slug]);

  return null;
}; 