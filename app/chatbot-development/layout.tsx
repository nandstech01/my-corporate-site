import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | チャットボット開発 | 株式会社エヌアンドエス',
    default: 'チャットボット開発サービス | 株式会社エヌアンドエス',
  },
}

export default function ChatbotDevelopmentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
} 