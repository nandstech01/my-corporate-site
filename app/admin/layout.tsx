'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/Header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-black">
        {/* ヘッダー */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <AdminHeader />
        </div>
        
        {/* サイドバー - 画面の一番上から開始 */}
        <div className="fixed top-0 bottom-0 left-0 z-40 w-64">
          <AdminSidebar />
        </div>
        
        {/* メインコンテンツエリア */}
        <div className="ml-64">
          {/* メインコンテンツ */}
          <main className="bg-gray-900 p-6 min-h-screen pt-16">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
} 