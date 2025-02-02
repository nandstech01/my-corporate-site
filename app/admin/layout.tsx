'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import AdminHeader from '@/components/admin/Header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-100">
        <div className="flex flex-col min-h-screen">
          <AdminHeader />
          {/* メインコンテンツ */}
          <main className="flex-grow pt-16 px-4 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
} 