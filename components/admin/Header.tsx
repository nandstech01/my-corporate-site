'use client';

import { useAuth } from '@/contexts/AuthContext';
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export default function AdminHeader() {
  const { signOut } = useAuth();

  return (
    <header className="h-16 bg-white shadow-sm border-b border-gray-200">
      <div className="h-full px-6 flex items-center justify-between">
        {/* ページタイトルエリア */}
        <div className="flex items-center">
          <h1 className="text-lg font-semibold text-gray-900">
            管理画面
          </h1>
        </div>

        {/* 右側のユーティリティ */}
        <div className="flex items-center space-x-4">
          {/* 通知アイコン */}
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <BellIcon className="w-5 h-5" />
          </button>

          {/* ユーザーメニュー */}
          <div className="relative flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <UserCircleIcon className="w-8 h-8 text-gray-400" />
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-700">管理者</p>
                <p className="text-xs text-gray-500">admin@nands.tech</p>
              </div>
            </div>
            
            {/* ログアウトボタン */}
            <button
              onClick={() => signOut()}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              ログアウト
            </button>
          </div>
        </div>
      </div>
    </header>
  );
} 