import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import PostsGrid from '@/components/common/PostsGrid';

export default async function CategoryPage({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const supabase = createClient();

  // カテゴリー情報の取得
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (categoryError || !category) {
    console.error('Error fetching category:', categoryError);
    notFound();
  }

  // カテゴリーに属する記事の取得
  const { data: postsData, error: postsError } = await supabase
    .from('chatgpt_posts')
    .select(`
      id,
      title,
      slug,
      excerpt,
      thumbnail_url,
      featured_image,
      category:categories(name, slug)
    `)
    .eq('category_id', category.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (postsError) {
    console.error('Error fetching posts:', postsError);
    return null;
  }

  // 画像URLの処理
  const posts = (postsData || []).map((post: any) => {
    const imageUrl = post.thumbnail_url || post.featured_image;
    const finalImageUrl = imageUrl 
      ? imageUrl.startsWith('http') 
        ? imageUrl 
        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${imageUrl}`
      : null;

    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      thumbnail_url: finalImageUrl,
      featured_image: finalImageUrl,
      category: post.category?.[0] ? {
        name: post.category[0].name,
        slug: post.category[0].slug
      } : undefined
    };
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">{category.name}</h1>
      {category.description && (
        <p className="text-gray-600 mb-8">{category.description}</p>
      )}
      <PostsGrid initialPosts={posts} />
    </div>
  );
} 