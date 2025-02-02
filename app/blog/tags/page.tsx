import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/supabase';
import Breadcrumb from '@/components/blog/Breadcrumb';
import Link from 'next/link';
import { normalizeTag } from '@/utils/url';

export const metadata: Metadata = {
  title: '退職代行に関するタグ一覧 | 退職代行案内',
  description: '退職代行に関する記事のタグ一覧です。気になるタグをクリックして、関連する記事をご覧ください。',
  openGraph: {
    title: '退職代行に関するタグ一覧 | 退職代行案内',
    description: '退職代行に関する記事のタグ一覧です。気になるタグをクリックして、関連する記事をご覧ください。',
  },
};

export default async function TagsPage() {
  const supabase = createClient();

  try {
    // 公開済みの記事を全て取得
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('seo_keywords')
      .eq('status', 'published');

    if (postsError) {
      console.error('Error fetching posts:', postsError);
      throw new Error('記事の取得中にエラーが発生しました');
    }

    // 全記事からタグを抽出し、出現回数をカウント
    const tagCount = new Map<string, number>();
    posts.forEach(post => {
      if (post.seo_keywords) {
        post.seo_keywords.forEach((tag: string) => {
          const normalizedTag = normalizeTag(tag);
          tagCount.set(normalizedTag, (tagCount.get(normalizedTag) || 0) + 1);
        });
      }
    });

    // タグを出現回数でソート
    const sortedTags = Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));

    // タグをカテゴリー分け
    const categorizedTags = {
      退職関連: sortedTags.filter(({ tag }) => tag.includes('退職')),
      労働問題: sortedTags.filter(({ tag }) => 
        tag.includes('労働') || tag.includes('トラブル') || tag.includes('ハラスメント')
      ),
      メンタルヘルス: sortedTags.filter(({ tag }) => 
        tag.includes('メンタル') || tag.includes('ストレス')
      ),
      その他: sortedTags.filter(({ tag }) => 
        !tag.includes('退職') && 
        !tag.includes('労働') && 
        !tag.includes('トラブル') && 
        !tag.includes('ハラスメント') && 
        !tag.includes('メンタル') && 
        !tag.includes('ストレス')
      )
    };

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[
            { label: 'ホーム', href: '/' },
            { label: 'ブログ', href: '/blog' },
            { label: 'タグ一覧' },
          ]}
        />
        
        <div className="mb-12 bg-gradient-to-r from-blue-50 to-white p-8 rounded-2xl">
          <h1 className="text-3xl font-bold mb-4">
            <span className="block text-xl text-gray-600 mb-2">退職代行に関する</span>
            <span className="block">タグ一覧</span>
          </h1>
          <p className="text-gray-600 max-w-3xl">
            記事に関連するタグの一覧です。気になるタグをクリックすると、関連する記事一覧をご覧いただけます。
            カテゴリー別に整理していますので、お探しの情報に関連するタグを見つけやすくなっています。
          </p>
        </div>

        {Object.entries(categorizedTags).map(([category, tags]) => tags.length > 0 && (
          <div key={category} className="mb-12 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-6 pb-2 border-b-2 border-blue-100 flex items-center">
              <span className="bg-blue-50 text-blue-700 px-4 py-1 rounded-full text-sm mr-3">
                {category}
              </span>
              <span>に関連するタグ</span>
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tags.map(({ tag, count }) => (
                <Link
                  key={tag}
                  href={`/blog/tags/${encodeURIComponent(tag)}`}
                  className="group p-5 border-2 border-gray-100 rounded-xl hover:border-blue-200 transition-all duration-200 hover:shadow-lg bg-white"
                >
                  <div className="font-medium text-lg mb-3 group-hover:text-blue-600 transition-colors flex items-center justify-between">
                    <span>{tag}</span>
                    <span className="inline-flex items-center justify-center bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm">
                      {count}件
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    関連記事を見る →
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-12">
          <Link 
            href="/blog" 
            className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <span className="mr-2">←</span>
            <span>ブログトップへ戻る</span>
          </Link>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in TagsPage:', error);
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[
            { label: 'ホーム', href: '/' },
            { label: 'ブログ', href: '/blog' },
            { label: 'タグ一覧' },
          ]}
        />
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-2xl font-bold mb-4">タグ一覧</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            申し訳ありませんが、タグ一覧の読み込み中にエラーが発生しました。
          </div>
          <div className="mt-6">
            <Link 
              href="/blog" 
              className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <span className="mr-2">←</span>
              <span>ブログトップへ戻る</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }
} 