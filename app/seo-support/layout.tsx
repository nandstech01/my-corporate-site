import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '助成金活用SEO支援サービス | 株式会社エヌアンドエス',
  description: '助成金を活用したSEO対策を80%補助で実施！最先端のSEOサービスで、あなたのビジネスの成長をサポートします。',
};

export default function SeoSupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 