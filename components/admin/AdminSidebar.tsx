'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  DocumentTextIcon, 
  PlusIcon, 
  StarIcon,
  ChartBarIcon,
  UserGroupIcon,
  BoltIcon,
  GlobeAltIcon,
  CubeIcon,
  PlayIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

export default function AdminSidebar() {
  const pathname = usePathname();

  const navigation = [
    {
      name: 'ダッシュボード',
      href: '/admin/dashboard',
      icon: HomeIcon,
      current: pathname === '/admin/dashboard'
    },
    {
      name: '記事管理',
      icon: DocumentTextIcon,
      children: [
        {
          name: '記事一覧',
          href: '/admin/posts',
          current: pathname === '/admin/posts'
        },
        {
          name: '新規作成',
          href: '/admin/posts/new',
          current: pathname === '/admin/posts/new'
        }
      ]
    },
    {
      name: 'トリプルRAG',
      icon: CubeIcon,
      children: [
        {
          name: '自社RAG',
          href: '/admin/company-rag',
          current: pathname === '/admin/company-rag'
        },
        {
          name: 'トレンドRAG',
          href: '/admin/trend-rag',
          current: pathname === '/admin/trend-rag'
        },
        {
          name: 'YouTube RAG',
          href: '/admin/youtube-rag',
          current: pathname === '/admin/youtube-rag'
        },
        {
          name: 'コンテンツ生成',
          href: '/admin/content-generation',
          current: pathname === '/admin/content-generation'
        },
        {
          name: 'RAG削除管理',
          href: '/admin/rag-cleanup',
          current: pathname === '/admin/rag-cleanup'
        }
      ]
    },
    {
      name: 'レビュー管理',
      href: '/admin/reviews',
      icon: StarIcon,
      current: pathname === '/admin/reviews'
    },
    {
      name: 'アナリティクス',
      href: '/admin/analytics',
      icon: ChartBarIcon,
      current: pathname === '/admin/analytics'
    },
    {
      name: 'ユーザー管理',
      href: '/admin/users',
      icon: UserGroupIcon,
      current: pathname === '/admin/users'
    }
  ];

  return (
    <div className="flex flex-col w-64 h-full bg-gray-900 border-r border-gray-800 shadow-2xl">
      {/* ヘッダー高さ分のスペース */}
      <div className="h-16"></div>
      
      {/* ロゴエリア */}
      <div className="flex items-center justify-center h-16 px-4 bg-gradient-to-r from-purple-600 to-blue-600">
        <Link href="/admin/dashboard" className="text-xl font-bold text-white">
          <span className="flex items-center space-x-2">
            <BoltIcon className="w-6 h-6" />
            <span>NANDS Admin</span>
          </span>
        </Link>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigation.map((item) => (
          <div key={item.name}>
            {item.children ? (
              // サブメニューがある場合
              <div className="space-y-1">
                <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                  <item.icon className="w-5 h-5 mr-3 text-gray-400" />
                  {item.name}
                </div>
                <div className="ml-8 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`${
                        child.current
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg transform scale-105'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      } flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-md`}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              // 通常のメニューアイテム
              <Link
                href={item.href}
                className={`${
                  item.current
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg transform scale-105'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                } flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-md`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* フッター情報 */}
      <div className="p-4 border-t border-gray-800">
        <div className="text-xs text-gray-500 text-center">
          <p className="text-purple-400 font-semibold">NANDS Admin Panel</p>
          <p className="mt-1 text-gray-400">Triple RAG v2.0.0</p>
        </div>
      </div>
    </div>
  );
}
