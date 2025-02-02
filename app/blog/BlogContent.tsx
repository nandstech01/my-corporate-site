'use client';

import { useEffect, useState } from 'react';
import Image from "next/image";
import { createClient } from '@/lib/supabase';
import Footer from '@/components/common/Footer';
import './blog.css';
import Link from 'next/link';
import { PageViewTracker } from '@/components/blog/PageViewTracker';
import { PostgrestResponse } from '@supabase/supabase-js';
import { Phone, MessageCircle, Mail, Clock, Shield } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  slug: string;
  status: string;
  views: number;
  tags?: string[];
  likes: number;
  published_at?: string;
  created_at: string;
  updated_at?: string;
  thumbnail_url?: string;
  meta_description?: string;
  seo_keywords?: string[];
  category?: {
    id: number;
    name: string;
    slug: string;
  };
}

interface RawPost {
  id: string;
  title: string;
  content: string;
  slug: string;
  status: string;
  views: number | null;
  tags: string[] | null;
  likes: number | null;
  published_at: string | null;
  created_at: string;
  updated_at: string | null;
  thumbnail_url: string | null;
  meta_description: string | null;
  seo_keywords: string[] | null;
  category_slug: string | null;
}

const supabase = createClient();

const BlogStructuredData = ({ posts }: { posts: BlogPost[] }) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "あんしん退職コラム",
    "description": "退職に関する不安や悩みを解消する情報メディア。退職のノウハウから、キャリアプランまで、あなたの新しい一歩をサポートします。",
    "url": "https://taishoku-anshin-daiko.com/blog",
    "publisher": {
      "@type": "Organization",
      "name": "NANDS 退職あんしん代行",
      "logo": {
        "@type": "ImageObject",
        "url": "https://taishoku-anshin-daiko.com/images/logo.svg"
      }
    },
    "blogPost": posts.map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.meta_description,
      "datePublished": post.published_at || post.created_at,
      "dateModified": post.updated_at || post.created_at,
      "url": `https://taishoku-anshin-daiko.com/blog/${post.slug}`,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://taishoku-anshin-daiko.com/blog/${post.slug}`
      },
      "image": post.thumbnail_url || "https://taishoku-anshin-daiko.com/images/ogp.jpg",
      "keywords": Array.isArray(post.seo_keywords) ? post.seo_keywords.join(",") : "",
      "author": {
        "@type": "Organization",
        "name": "NANDS 退職あんしん代行"
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

export default function BlogContent() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        console.log('Fetching posts...');
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select(`
            id,
            title,
            content,
            slug,
            status,
            views,
            tags,
            likes,
            published_at,
            created_at,
            updated_at,
            thumbnail_url,
            meta_description,
            seo_keywords,
            category_slug
          `)
          .eq('status', 'published')
          .order('created_at', { ascending: false }) as PostgrestResponse<RawPost>;

        if (postsError) {
          console.error('Error fetching posts:', postsError);
          throw postsError;
        }

        // カテゴリーを別途取得
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*');

        if (categoriesError) {
          console.error('Error fetching categories:', categoriesError);
          throw categoriesError;
        }

        // 記事データにカテゴリー情報を追加
        const typedPostsData = (postsData || []).map((post: RawPost) => {
          const category = categoriesData?.find(cat => cat.slug === post.category_slug);
          let parsedTags = [];
          try {
            if (post.tags) {
              parsedTags = typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags;
            }
          } catch (e) {
            console.error('Error parsing tags for post:', post.slug, e);
          }

          return {
            id: post.id,
            title: post.title,
            content: post.content,
            slug: post.slug,
            status: post.status,
            views: post.views ?? 0,
            tags: Array.isArray(parsedTags) ? parsedTags : [],
            likes: post.likes ?? 0,
            published_at: post.published_at,
            created_at: post.created_at,
            updated_at: post.updated_at,
            thumbnail_url: post.thumbnail_url,
            meta_description: post.meta_description,
            seo_keywords: post.seo_keywords ?? [],
            category: category
          } as BlogPost;
        }) || [];
        
        setPosts(typedPostsData);
        setCategories(categoriesData || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setPosts([]);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // 人気記事を取得（views数でソート）
  const popularPosts = [...posts]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 1)[0];

  // タグ一覧を取得（全記事のタグを結合して重複を除去）
  const allTags = Array.from(
    new Map(
      posts.flatMap(post => 
        (post.seo_keywords || []).map(keyword => [
          keyword, // キーとして使用
          {
            name: keyword,
            slug: encodeURIComponent(keyword)
          }
        ])
      )
    ).values()
  ).filter(Boolean);

  // お知らせ記事を取得
  const newsArticles = posts.filter(post => post.category?.name === 'お知らせ').slice(0, 2);

  return (
    <>
      <PageViewTracker page_type="blog_top" />
      <BlogStructuredData posts={posts} />
      
      <div className="blog-container blog-container-top">
        {/* スクロールテキスト */}
        <div className="blog-marquee">
          <div className="blog-marquee-text">
            退職に関する不安や悩みを解消する情報メディア!!退職のノウハウから、キャリアプランまであなたの新しい一歩を、私たちがサポートします!!
          </div>
        </div>

        {/* ピックアップセクション */}
        <section className="blog-pickup blog-pickup-top">
          <div className="blog-pickup-inner">
            <div className="blog-pickup-decorations">
              <span className="decoration-text decoration-career">CAREER</span>
              <span className="decoration-text decoration-support">転職支援</span>
              <span className="decoration-text decoration-career-jp">キャリア</span>
              <span className="decoration-text decoration-success">SUCCESS</span>
              <span className="decoration-text decoration-retire">退職</span>
            </div>
            <div className="blog-pickup-header">
              <h2 className="blog-pickup-title">PICKUP</h2>
              <p className="blog-pickup-description">注目の記事を厳選してお届け！</p>
            </div>
            <div className="blog-pickup-slider" style={{ maxWidth: '744px', margin: '0 auto', overflow: 'hidden' }}>
              <Swiper
                modules={[Pagination, Autoplay]}
                spaceBetween={24}
                slidesPerView={1.2}
                centeredSlides={false}
                loop={true}
                pagination={{ clickable: true }}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                style={{ width: '100%', maxWidth: '744px' }}
                breakpoints={{
                  320: {
                    slidesPerView: 1.2,
                    spaceBetween: 24,
                    centeredSlides: true,
                    width: undefined
                  },
                  640: {
                    slidesPerView: 2.2,
                    spaceBetween: 24,
                    centeredSlides: false,
                    width: undefined
                  },
                  1024: {
                    slidesPerView: 2,
                    spaceBetween: 24,
                    centeredSlides: false,
                    width: 744
                  }
                }}
              >
                {posts.slice(0, 8).map((post) => (
                  <SwiperSlide key={post.id} style={{ width: '360px !important', maxWidth: '360px !important' }}>
                    <Link href={`/blog/${post.slug}`} className="block">
                      <div className="blog-pickup-card hover-effect-card">
                        {post.thumbnail_url && (
                          <Image
                            src={post.thumbnail_url}
                            alt={post.title}
                            width={360}
                            height={202}
                            className="blog-pickup-image"
                          />
                        )}
                        <div className="blog-pickup-content">
                          {post.category && (
                            <span className="blog-category">{post.category.name}</span>
                          )}
                          <h3 className="blog-pickup-heading">{post.title}</h3>
                        </div>
                      </div>
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </section>

        <main className="blog-main">
          {/* News Section */}
          <section className="blog-news">
            <h2 className="blog-news-title">News</h2>
            <div className="blog-news-list">
              <div><span className="blog-news-label">お知らせ</span>株式会社エヌアンドエスはAI副業支援プログラムを開始いたしました</div>
              <div><span className="blog-news-label">お知らせ</span>あんしん退職コラムオープンしました</div>
              {newsArticles.map((article) => (
                <div key={article.slug}>
                  {new Date(article.published_at || article.created_at).toLocaleDateString('ja-JP')}　{article.title}
                </div>
              ))}
            </div>
          </section>

          {/* Latest Posts */}
          <section className="blog-latest mt-12">
            <h2 className="blog-latest-title">NEW POSTS</h2>
            <div className="blog-latest-list">
              {posts.slice(0, 5).map((post, index) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="block">
                  <article className="blog-latest-item hover-effect-card">
                    <time className="blog-latest-date">
                      {new Date(post.published_at || post.created_at).toLocaleDateString('ja-JP')}
                    </time>
                    <div className="blog-latest-content-wrapper">
                      {post.thumbnail_url && (
                        <Image
                          src={post.thumbnail_url}
                          alt={post.title}
                          width={100}
                          height={50}
                          className="blog-latest-image"
                          style={{ height: 'auto' }}
                          priority={index === 0}
                        />
                      )}
                      <div className="blog-latest-content">
                        <h3 className="blog-latest-heading">
                          {post.title}
                        </h3>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
            <button className="blog-button">
              記事一覧を見る
            </button>
          </section>

          {/* Categories Section */}
          <section className="blog-categories mt-12 mb-24">
            <h2 className="blog-tags-title">CATEGORIES</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/blog/category/${category.slug}`}
                  className="block p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-gray-900">
                    {category.name}
                  </h3>
                </Link>
              ))}
            </div>
          </section>

          {/* Tags Section */}
          <section className="blog-tags-section mt-24 mb-24">
            <h2 className="blog-tags-title">TAGS</h2>
            <div className="blog-tags max-w-4xl mx-auto px-4">
              {allTags.map((tag) => (
                <Link
                  key={tag.slug}
                  href={`/blog/tags/${tag.slug}`}
                  className="blog-tag"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          </section>

          {/* Career Support */}
          <section className="blog-career mt-24">
            <h2 className="blog-career-title">キャリアサポートのお知らせ</h2>
            <Link href="https://nands.tech/" target="_blank" rel="noopener noreferrer" className="block">
              <div className="blog-career-card hover-effect-card">
                <Image
                  src="/images/career-support.jpg"
                  alt="Career Support"
                  width={600}
                  height={300}
                  className="blog-career-image"
                />
                <div className="blog-career-content">
                  退職あんしん代行を運営する「株式会社エヌアンドエス」では、
                  AI時代に合わせた副業・リスキリング支援プログラムを開始しました。
                  退職後のキャリア形成を一緒に考えませんか？
                </div>
              </div>
            </Link>
          </section>

          {/* Contact Section */}
          <section className="blog-contact mt-24 mb-24">
            <h2 className="blog-tags-title">ご相談はこちら</h2>
            <div className="blog-contact-grid">
              {/* 電話相談 */}
              <a href="tel:0120558551" className="blog-contact-card text-center hover-effect-card">
                <Phone className="w-12 h-12 text-orange-500 mx-auto mb-2" />
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  お電話でのご相談
                </h4>
                <p className="blog-contact-value">0120-558-551</p>
              </a>

              {/* LINE相談 */}
              <div className="blog-contact-card text-center hover-effect-card">
                <MessageCircle className="w-12 h-12 text-[#06C755] mx-auto mb-2" />
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  公式LINEでお気軽に相談
                </h4>
                <p className="text-gray-600 mb-4">
                  LINEなら、いつでも気軽にご相談いただけます
                </p>
                <a
                  href="https://lin.ee/h1kk42r"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-[#06C755] hover:bg-[#05b34c] text-white text-lg font-bold py-4 px-6 rounded-lg text-center transition-colors"
                >
                  LINEで相談する
                </a>
              </div>

              {/* メール相談 */}
              <a href="mailto:contact@taishoku-anshin-daiko.com" className="blog-contact-card text-center hover-effect-card">
                <Mail className="w-12 h-12 text-orange-500 mx-auto mb-2" />
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  メールでのご相談
                </h4>
                <p className="text-lg text-gray-600">24時間受付中</p>
              </a>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="blog-contact-card flex items-center gap-3">
                <Clock className="w-6 h-6 text-orange-500" />
                <p className="text-gray-900 font-medium">365日受付</p>
              </div>
              <div className="blog-contact-card flex items-center gap-3">
                <Shield className="w-6 h-6 text-orange-500" />
                <p className="text-gray-900 font-medium">相談無料</p>
              </div>
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </>
  );
}