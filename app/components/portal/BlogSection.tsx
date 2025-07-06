'use client'

import React, { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'

type BlogPost = {
  id: number
  title: string
  excerpt: string
  imageUrl: string
  date: string
  link: string
  table_type: 'posts' | 'chatgpt_posts'
}

const fadeInUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

// ReflectionOverlay コンポーネント
function ReflectionOverlay({ hovered }: { hovered: boolean }) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!overlayRef.current) return;

    if (hovered) {
      overlayRef.current.animate(
        [
          { transform: "translateX(-120%)", opacity: 0 },
          { transform: "translateX(120%)", opacity: 0.2 },
        ],
        {
          duration: 800,
          easing: "ease-out",
          fill: "forwards",
        }
      );
    } else {
      overlayRef.current.animate(
        [{ transform: "translateX(-120%)", opacity: 0 }],
        {
          duration: 300,
          fill: "forwards",
        }
      );
    }
  }, [hovered]);

  return (
    <div
      ref={overlayRef}
      className="absolute top-0 left-0 w-1/3 h-full
      bg-white bg-opacity-20
      pointer-events-none
      mix-blend-screen
      rounded-full"
      style={{
        borderRadius: "9999px",
      }}
    ></div>
  );
}

export default function BlogSection() {
  const [hovered, setHovered] = useState(false);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const supabase = createClient();
        
        // postsテーブルから記事を取得（RAG記事）
        const { data: newPosts, error: newError } = await supabase
          .from('posts')
          .select('id, title, meta_description, thumbnail_url, created_at, slug')
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(3);

        // chatgpt_postsテーブルから記事を取得（ChatGPT記事）
        const { data: oldPosts, error: oldError } = await supabase
          .from('chatgpt_posts')
          .select('id, title, excerpt, thumbnail_url, featured_image, created_at, slug, is_chatgpt_special')
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(3);

        if (newError) console.error('Error fetching new posts:', newError);
        if (oldError) console.error('Error fetching old posts:', oldError);

        // データを統一フォーマットに変換
        const formattedNewPosts: BlogPost[] = (newPosts || []).map(post => ({
          id: post.id,
          title: post.title,
          excerpt: post.meta_description || `${post.title}の記事です。`,
          imageUrl: post.thumbnail_url || "/images/default-post.jpg",
          date: new Date(post.created_at).toLocaleDateString('ja-JP'),
          link: `/posts/${post.slug}`,
          table_type: 'posts' as const
        }));

        const formattedOldPosts: BlogPost[] = (oldPosts || []).map(post => {
          const imageUrl = post.thumbnail_url || post.featured_image;
          const finalImageUrl = imageUrl 
            ? imageUrl.startsWith('http') 
              ? imageUrl 
              : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${imageUrl}`
            : "/images/default-post.jpg";
          
          return {
            id: post.id,
            title: post.title,
            excerpt: post.excerpt || `${post.title}の記事です。`,
            imageUrl: finalImageUrl,
            date: new Date(post.created_at).toLocaleDateString('ja-JP'),
            link: `/posts/${post.slug}`,
            table_type: 'chatgpt_posts' as const
          };
        });

        // 両方のテーブルの記事を合体して日付順でソート
        const allPosts = [...formattedNewPosts, ...formattedOldPosts];
        allPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // 最大3件に制限
        setPosts(allPosts.slice(0, 3));
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // ローディング中の表示
  if (loading) {
    return (
      <section className="w-full py-16 bg-gray-50 text-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6 text-center">最新ブログ記事</h2>
          <p className="text-center text-gray-600 mb-10">
            各事業の最新情報をピックアップ。トレンドを逃さずチェック！
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-gray-200 shadow overflow-hidden animate-pulse">
                <div className="w-full h-48 bg-gray-300"></div>
                <div className="p-4">
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-4"></div>
                  <div className="h-20 bg-gray-300 rounded mb-4"></div>
                  <div className="h-6 bg-gray-300 rounded w-32"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-16 bg-gray-50 text-gray-800">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6 text-center">最新ブログ記事</h2>
        <p className="text-center text-gray-600 mb-10">
          各事業の最新情報をピックアップ。トレンドを逃さずチェック！
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post) => (
            <div key={post.id} className="bg-white border border-gray-200 shadow hover:shadow-lg overflow-hidden">
              <img src={post.imageUrl} alt={post.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold line-clamp-2">{post.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${
                    post.table_type === 'posts' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {post.table_type === 'posts' ? 'RAG記事' : 'ChatGPT記事'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-4">{post.date}</p>
                <p className="text-gray-700 mb-4 line-clamp-3">{post.excerpt}</p>
                <a
                  href={post.link}
                  className="text-indigo-500 hover:underline font-medium"
                >
                  続きを読む →
                </a>
              </div>
            </div>
          ))}
        </div>
        <motion.div
          className="text-center mt-12"
          variants={fadeInUpVariants}
          initial={{ scale: 1 }}
          whileHover={{
            scale: 1.03,
            transition: { duration: 0.3 }
          }}
          whileTap={{
            scale: 0.97,
            transition: { duration: 0.2 }
          }}
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
        >
          <a
            href="/blog"
            className="relative overflow-hidden px-12 py-5 font-bold text-white
            bg-gradient-to-r from-blue-800 via-blue-600 to-blue-500
            hover:from-blue-900 hover:via-blue-700 hover:to-blue-600
            transition-all duration-300"
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            {/* 外側の白い枠 - より細く洗練された印象に */}
            <div className="absolute inset-0 border border-white opacity-30"></div>
            
            {/* 内側の白い枠 - アクセントとして */}
            <div 
              className="absolute inset-[2px]"
              style={{
                border: '1px solid rgba(255, 255, 255, 0.6)',
                background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.1) 100%)',
                opacity: 0.2,
              }}
            ></div>

            {/* ボタンテキスト */}
            <span className="relative z-10 tracking-wider">ブログ一覧へ</span>

            {/* 光沢エフェクト */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.1) 100%)",
                mixBlendMode: "overlay",
              }}
            ></div>

            {/* 反射レイヤー */}
            <ReflectionOverlay hovered={hovered} />

            {/* ホバー時のグロー効果 - より繊細に */}
            <div
              className="absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none"
              style={{
                background: "radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 70%)",
                opacity: hovered ? 0.6 : 0,
              }}
            ></div>
          </a>
        </motion.div>
      </div>
    </section>
  )
} 