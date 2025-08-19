'use client';

import { useAuth } from '@/contexts/AuthContext';
import { BellIcon, UserCircleIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

interface AdminHeaderProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

export default function AdminHeader({ onMenuClick, isSidebarOpen }: AdminHeaderProps) {
  const { user, signOut } = useAuth();

  return (
    <header className="h-16 bg-gray-800 border-b border-gray-700 shadow-lg">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between">
        {/* 左側：ハンバーガーメニュー + タイトル */}
        <div className="flex items-center space-x-3">
          {/* ハンバーガーメニューボタン（モバイルのみ） */}
          <button
            onClick={onMenuClick}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors lg:hidden"
          >
            {isSidebarOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
          
          <h1 className="text-lg font-semibold text-white">
            管理画面
          </h1>
        </div>

        {/* 右側のユーティリティ */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* 通知アイコン */}
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors">
            <BellIcon className="w-5 h-5" />
          </button>

          {/* ユーザーメニュー */}
          <div className="relative flex items-center space-x-2 sm:space-x-3">
            <div className="flex items-center space-x-2">
              <UserCircleIcon className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400" />
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-white">管理者</p>
                <p className="text-xs text-gray-400">{user?.email || 'admin@nands.tech'}</p>
              </div>
            </div>
            
            {/* ログアウトボタン */}
            <button
              onClick={() => signOut()}
              className="px-2 py-1.5 sm:px-3 text-xs sm:text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
            >
              <span className="hidden sm:inline">ログアウト</span>
              <span className="sm:hidden">OUT</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
} 