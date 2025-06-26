import { Metadata } from 'next'
import ChatbotHeroSection from './components/ChatbotHeroSection'
import ChatbotServicesSection from './components/ChatbotServicesSection'
import ChatbotTechStack from './components/ChatbotTechStack'
import ChatbotShowcase from './components/ChatbotShowcase'
import ChatbotPricingSection from './components/ChatbotPricingSection'
import ChatbotContactSection from './components/ChatbotContactSection'

export const metadata: Metadata = {
  title: 'チャットボット開発サービス | 株式会社エヌアンドエス',
  description: 'GPT-4活用の高性能チャットボット開発。24時間自動応答、多言語対応、カスタマイズ可能。工数80%削減の実績。',
  keywords: 'チャットボット開発,GPT-4,AI開発,自動応答,カスタマーサポート,多言語対応',
  openGraph: {
    title: 'チャットボット開発サービス | 株式会社エヌアンドエス',
    description: 'GPT-4活用の高性能チャットボット開発。24時間自動応答、多言語対応、カスタマイズ可能。',
    url: 'https://nands.tech/chatbot-development',
    siteName: '株式会社エヌアンドエス',
    images: [
      {
        url: '/images/chatbot-og.jpg',
        width: 1200,
        height: 630,
        alt: 'チャットボット開発サービス',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'チャットボット開発サービス | 株式会社エヌアンドエス',
    description: 'GPT-4活用の高性能チャットボット開発。24時間自動応答、多言語対応、カスタマイズ可能。',
    images: ['/images/chatbot-og.jpg'],
  },
}

export default function ChatbotDevelopmentPage() {
  return (
    <main className="min-h-screen bg-white">
      <ChatbotHeroSection />
      <ChatbotServicesSection />
      <ChatbotTechStack />
      <ChatbotShowcase />
      <ChatbotPricingSection />
      <ChatbotContactSection />
    </main>
  )
} 