'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/Header';
import { useState } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-black">
        {/* ヘッダー */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <AdminHeader 
            onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
            isSidebarOpen={isSidebarOpen}
          />
        </div>
        
        {/* モバイル用オーバーレイ */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* サイドバー */}
        <div className={`
          fixed top-0 bottom-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out
          lg:transform-none lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <AdminSidebar onItemClick={() => setIsSidebarOpen(false)} />
        </div>
          
        {/* メインコンテンツエリア */}
        <div className="lg:ml-64">
          {/* メインコンテンツ */}
          <main className="bg-gray-900 p-4 sm:p-6 min-h-screen pt-20 lg:pt-24">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
} 