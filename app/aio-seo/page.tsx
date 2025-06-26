import { Metadata } from 'next'
import AIOHeroSection from './components/AIOHeroSection'
import AIOServicesSection from './components/AIOServicesSection'
import AIOCaseStudiesSection from './components/AIOCaseStudiesSection'
import AIOMethodologySection from './components/AIOMethodologySection'
import AIOPricingSection from './components/AIOPricingSection'
import AIOContactSection from './components/AIOContactSection'

export const metadata: Metadata = {
  title: 'AIO対策・レリバンスエンジニアリング | 株式会社エヌアンドエス',
  description: 'Google AI Mode対策・レリバンスエンジニアリングの専門サービス。Mike King理論に基づくAI検索最適化で、あなたのサイトをAI検索結果で上位表示させます。',
  keywords: 'AIO対策,レリバンスエンジニアリング,Google AI Mode,Mike King理論,AI検索最適化,SEO,検索エンジン最適化',
  openGraph: {
    title: 'AIO対策・レリバンスエンジニアリング | 株式会社エヌアンドエス',
    description: 'Google AI Mode対策・レリバンスエンジニアリングの専門サービス。Mike King理論に基づくAI検索最適化で、あなたのサイトをAI検索結果で上位表示させます。',
    type: 'website',
    url: 'https://nands.tech/aio-seo',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AIO対策・レリバンスエンジニアリング | 株式会社エヌアンドエス',
    description: 'Google AI Mode対策・レリバンスエンジニアリングの専門サービス。Mike King理論に基づくAI検索最適化で、あなたのサイトをAI検索結果で上位表示させます。',
  },
}

export default function AIOPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AIOHeroSection />
      <AIOServicesSection />
      <AIOMethodologySection />
      <AIOCaseStudiesSection />
      <AIOPricingSection />
      <AIOContactSection />
    </div>
  )
} 