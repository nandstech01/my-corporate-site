'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  DocumentTextIcon, 
  PlusIcon, 
  StarIcon,
  ChartBarIcon,
  UserGroupIcon 
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
    <div className="flex flex-col w-64 bg-white shadow-lg">
      {/* ロゴエリア */}
      <div className="flex items-center justify-center h-16 px-4 bg-blue-600">
        <Link href="/admin/dashboard" className="text-xl font-bold text-white">
          NANDS Admin
        </Link>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigation.map((item) => (
          <div key={item.name}>
            {item.children ? (
              // サブメニューがある場合
              <div className="space-y-1">
                <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-700">
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
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150`}
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
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150`}
              >
                <item.icon className="w-5 h-5 mr-3 text-gray-400" />
                {item.name}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* フッター情報 */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          <p>NANDS Admin Panel</p>
          <p className="mt-1">v2.0.0</p>
        </div>
      </div>
    </div>
  );
}
