import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MCPサーバー開発 | 株式会社エヌアンドエス',
  description: 'Model Context Protocol（MCP）サーバーの開発・構築サービス。AIシステム間の高度な連携と拡張機能を実現します。',
  keywords: [
    'MCPサーバー開発',
    'Model Context Protocol',
    'AI連携システム',
    'プロトコル開発',
    'AIシステム統合',
    'サーバー構築',
    'API開発',
    'システム連携',
    'エヌアンドエス'
  ],
  openGraph: {
    title: 'MCPサーバー開発 | 株式会社エヌアンドエス',
    description: 'Model Context Protocol（MCP）サーバーの開発・構築サービス。AIシステム間の高度な連携と拡張機能を実現。',
    url: 'https://nands.tech/mcp-servers',
    siteName: '株式会社エヌアンドエス',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MCPサーバー開発 | 株式会社エヌアンドエス',
    description: 'Model Context Protocol（MCP）サーバーの開発・構築サービス。AIシステム間の高度な連携と拡張機能を実現。',
  },
  alternates: {
    canonical: 'https://nands.tech/mcp-servers',
  },
};

export default function MCPServersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 