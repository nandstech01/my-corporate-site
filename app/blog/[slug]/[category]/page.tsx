'use client';

import React from 'react';
import { Database } from '@/lib/supabase/database.types';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Props = {
  params: {
    slug: string;
    category: string;
  };
};

export default function CategoryBlogPage({ params }: Props) {
  const router = useRouter();
  const [posts, setPosts] = React.useState<any[]>([]);
  const [business, setBusiness] = React.useState<any>(null);
  const [category, setCategory] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const supabase = createClientComponentClient<Database>();

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // 事業を取得
        const { data: businessData, error: businessError } = await supabase
          .from('businesses')
          .select('*')
          .eq('slug', params.slug)
          .single();

        if (businessError || !businessData) {
          router.push('/404');
          return;
        }

        setBusiness(businessData);

        // カテゴリーを取得
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('*')
          .eq('business_id', businessData.id)
          .eq('slug', params.category)
          .single();

        if (categoryError || !categoryData) {
          router.push('/404');
          return;
        }

        setCategory(categoryData);

        // 記事を取得
        const { data: postsData, error: postsError } = await supabase
          .from('chatgpt_posts')
          .select('*')
          .eq('business_id', businessData.id)
          .eq('category_id', categoryData.id)
          .eq('status', 'published')
          .order('published_at', { ascending: false });

        if (postsError) {
          console.error('Error fetching posts:', postsError);
          return;
        }

        setPosts(postsData || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.slug, params.category, router, supabase]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          href={`/blog/${params.slug}`}
          className="text-blue-600 hover:text-blue-800"
        >
          ← {business?.name}の記事一覧に戻る
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">{category?.name}の記事一覧</h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
            {post.featured_image && (
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            <h2 className="text-xl font-semibold mb-4">{post.title}</h2>
            <p className="text-gray-600 mb-4">{post.excerpt}</p>
            <Link
              href={`/blog/${params.slug}/${params.category}/${post.slug}`}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              記事を読む →
            </Link>
          </div>
        ))}

        {posts.length === 0 && (
          <p className="text-gray-600">
            まだ記事が投稿されていません。
          </p>
        )}
      </div>
    </div>
  );
} 