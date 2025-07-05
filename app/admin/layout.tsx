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
        <div className="flex h-screen">
          {/* サイドバー */}
          <AdminSidebar />
          
          {/* メインコンテンツエリア */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* ヘッダー */}
            <AdminHeader />
            
            {/* メインコンテンツ */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-6">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
} 