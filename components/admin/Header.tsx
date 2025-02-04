'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminHeader() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  const navigation = [
    { name: 'ダッシュボード', href: '/admin/dashboard' },
    { name: '記事一覧', href: '/blog' },
    { name: '新規作成', href: '/blog/new' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-50">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-full flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/admin/dashboard" className="text-xl font-bold text-gray-900">
              NANDS Admin
            </Link>
            <nav className="hidden md:flex space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${
                    pathname === item.href
                      ? 'text-blue-600'
                      : 'text-gray-500 hover:text-gray-900'
                  } px-3 py-2 rounded-md text-sm font-medium`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <button
            onClick={() => signOut()}
            className="text-gray-500 hover:text-gray-900 text-sm font-medium"
          >
            ログアウト
          </button>
        </div>
      </div>
    </header>
  );
} 