'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Database } from '@/lib/supabase/database.types';

type Post = Database['public']['Tables']['chatgpt_posts']['Row'];
type Analytics = Database['public']['Tables']['analytics']['Row'];
type DashboardPost = Pick<Post, 'id' | 'title' | 'slug' | 'created_at'>;

interface PageTypeStat {
  page_type: string;
  label: string;
  count: number;
}

interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  recentPosts: DashboardPost[];
  monthlyViews: number;
  recentVisitors: number;
  deviceStats: Array<{ device_type: string; count: number }>;
  countryStats: Array<{ country: string; count: number }>;
  pageTypeStats: PageTypeStat[];
}

// ページタイプのラベルを取得する関数
function getPageTypeLabel(pageType: string): string {
  switch (pageType) {
    case 'lp':
      return 'トップページ';
    case 'blog_top':
      return 'ブログトップ';
    case 'blog_post':
      return 'ブログ記事';
    default:
      return 'その他';
  }
}

// 集計用のヘルパー関数
function aggregateAnalytics(analyticsData: Analytics[] | null) {
  if (!analyticsData) return {
    deviceStats: [] as Array<{ device_type: string; count: number }>,
    countryStats: [] as Array<{ country: string; count: number }>,
    recentVisitors: 0,
    pageTypeStats: [] as PageTypeStat[]
  };

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentData = analyticsData.filter(d => 
    d.created_at && new Date(d.created_at) >= thirtyDaysAgo
  );

  // デバイス別統計
  const deviceMap = recentData.reduce((acc, curr) => {
    const device = curr.device_type || 'unknown';
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const deviceStats = Object.entries(deviceMap).map(([device_type, count]) => ({
    device_type,
    count: count as number
  }));

  // 国別統計
  const countryMap = recentData.reduce((acc, curr) => {
    const country = curr.country || 'unknown';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const countryStats = Object.entries(countryMap)
    .map(([country, count]) => ({
      country,
      count: count as number
    }))
    .sort((a, b) => (b.count as number) - (a.count as number));

  // ページタイプ別統計
  const pageTypeMap = recentData.reduce((acc, curr) => {
    const path = curr.page_path;
    let pageType = 'unknown';
    
    if (path === '/') {
      pageType = 'lp';
    } else if (path === '/blog') {
      pageType = 'blog_top';
    } else if (path.startsWith('/blog/')) {
      pageType = 'blog_post';
    }

    acc[pageType] = (acc[pageType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pageTypeStats = Object.entries(pageTypeMap)
    .map(([page_type, count]) => ({
      page_type,
      label: getPageTypeLabel(page_type),
      count: count as number
    }))
    .sort((a, b) => (b.count as number) - (a.count as number));

  return {
    deviceStats,
    countryStats,
    recentVisitors: new Set(recentData.map(d => d.visitor_id).filter(Boolean)).size,
    pageTypeStats
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, session, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    recentPosts: [],
    monthlyViews: 0,
    recentVisitors: 0,
    deviceStats: [],
    countryStats: [],
    pageTypeStats: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 認証チェック
  useEffect(() => {
    if (!authLoading && !session) {
      console.log('Dashboard - No session, redirecting to login...');
      router.push('/admin');
      return;
    }
  }, [session, authLoading, router]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // 記事データの取得
        const { data: posts, error: queryError } = await supabase
          .from('chatgpt_posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (queryError) throw queryError;

        // カテゴリー情報を別途取得
        const { data: categories } = await supabase
          .from('chatgpt_sections')
          .select('*');

        // 記事データにカテゴリー情報を追加
        const postsWithCategories = posts?.map((post: Post) => ({
          ...post,
          category: categories?.find((cat) => cat.id === post.chatgpt_section_id)
        })) || [];

        // 月間PV数の取得（count集計を使用）
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const { count: monthlyViewCount, error: viewCountError } = await supabase
          .from('analytics')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', thirtyDaysAgo);

        if (viewCountError) throw viewCountError;

        // 詳細な分析用のデータ取得（最新1000件）
        const { data: analyticsData, error: analyticsError } = await supabase
          .from('analytics')
          .select('*')
          .gte('created_at', thirtyDaysAgo)
          .order('created_at', { ascending: false })
          .limit(1000);

        if (analyticsError) throw analyticsError;

        // 統計データの集計
        const {
          deviceStats,
          countryStats,
          recentVisitors,
          pageTypeStats
        } = aggregateAnalytics(analyticsData);

        if (!posts) {
          setStats({
            totalPosts: 0,
            publishedPosts: 0,
            draftPosts: 0,
            recentPosts: [],
            monthlyViews: monthlyViewCount || 0,
            recentVisitors,
            deviceStats,
            countryStats,
            pageTypeStats
          });
          return;
        }

        const publishedPosts = postsWithCategories.filter((post: Post) => post.created_at !== null);
        const draftPosts = postsWithCategories.filter((post: Post) => post.created_at === null);

        setStats({
          totalPosts: postsWithCategories.length,
          publishedPosts: publishedPosts.length,
          draftPosts: draftPosts.length,
          recentPosts: postsWithCategories.slice(0, 5),
          monthlyViews: monthlyViewCount || 0,
          recentVisitors,
          deviceStats,
          countryStats,
          pageTypeStats
        });
      } catch (err) {
        console.error('[Dashboard] Error:', err);
        setError(err instanceof Error ? err.message : '統計情報の取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && session) {
      fetchStats();
    }
  }, [session, authLoading]);

  // 認証のローディング中
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">読み込み中...</h2>
        </div>
      </div>
    );
  }

  // 未認証の場合は何も表示しない（リダイレクト中）
  if (!session) {
    return null;
  }

  // データ取得のローディング中
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        <span className="ml-2 text-gray-600">データを読み込み中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm text-red-600 hover:text-red-500"
              >
                再読み込み
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* サイドバー */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white border-r">
            <div className="flex flex-col flex-grow px-4">
              <nav className="flex-1 space-y-1">
                <Link
                  href="/admin/dashboard"
                  className="flex items-center px-2 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-md group"
                >
                  <svg className="w-6 h-6 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  ダッシュボード
                </Link>

                <Link
                  href="/admin/posts"
                  className="flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 group"
                >
                  <svg className="w-6 h-6 mr-3 text-gray-400 group-hover:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
                  </svg>
                  記事一覧
                </Link>

                <Link
                  href="/admin/posts/new"
                  className="flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 group"
                >
                  <svg className="w-6 h-6 mr-3 text-gray-400 group-hover:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  新規作成
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 overflow-auto">
        <main className="flex-1 relative pb-8 z-0 overflow-y-auto">
          <div className="mt-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-2xl font-semibold text-gray-900">ダッシュボード</h1>

              {/* 統計カード */}
              <div className="mt-8">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {/* 総記事数 */}
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
                          </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">総記事数</dt>
                            <dd className="flex items-baseline">
                              <div className="text-2xl font-semibold text-gray-900">{stats.totalPosts}</div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 月間PV */}
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">月間PV</dt>
                            <dd className="flex items-baseline">
                              <div className="text-2xl font-semibold text-gray-900">{stats.monthlyViews}</div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ユニークビジター */}
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">月間ユニークビジター</dt>
                            <dd className="flex items-baseline">
                              <div className="text-2xl font-semibold text-gray-900">{stats.recentVisitors}</div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ページタイプ別統計 */}
              <div className="mt-8">
                <div className="bg-white shadow rounded-lg">
                  <div className="px-5 py-4 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      ページタイプ別アクセス数（月間）
                    </h3>
                  </div>
                  <div className="p-5">
                    <div className="grid grid-cols-1 gap-4">
                      {stats.pageTypeStats.map((stat) => (
                        <div key={stat.page_type} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900">{stat.label}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="px-2.5 py-1.5 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                              {stat.count} PV
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 最近の記事 */}
              <div className="bg-white shadow rounded-lg mb-8">
                <div className="px-5 py-4 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    最近の記事
                  </h3>
                </div>
                <div className="p-5">
                  <div className="flow-root">
                    <ul className="-my-5 divide-y divide-gray-200">
                      {stats.recentPosts.map((post) => (
                        <li key={post.id} className="py-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {post.title}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(post.created_at).toLocaleDateString('ja-JP')}
                              </p>
                            </div>
                            <div>
                              <Link
                                href={`/admin/posts/${post.slug}/edit`}
                                className="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50"
                              >
                                編集
                              </Link>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* デバイス統計 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white shadow rounded-lg">
                  <div className="px-5 py-4 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      デバイス別アクセス
                    </h3>
                  </div>
                  <div className="p-5">
                    <div className="flow-root">
                      <ul className="-my-4 divide-y divide-gray-200">
                        {stats.deviceStats.map(({ device_type, count }) => (
                          <li key={device_type} className="py-4">
                            <div className="flex items-center space-x-4">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">
                                  {device_type}
                                </p>
                              </div>
                              <div>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {count}
                                </span>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 国別統計 */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-5 py-4 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      国別アクセス
                    </h3>
                  </div>
                  <div className="p-5">
                    <div className="flow-root">
                      <ul className="-my-4 divide-y divide-gray-200">
                        {stats.countryStats.map(({ country, count }) => (
                          <li key={country} className="py-4">
                            <div className="flex items-center space-x-4">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">
                                  {country}
                                </p>
                              </div>
                              <div>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {count}
                                </span>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 