'use client';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <main className="min-h-screen">
      {children}
    </main>
  );
} 