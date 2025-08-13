import { Metadata } from 'next'
import { Suspense } from 'react'
import PartnerHeroSection from '@/components/partners/PartnerHeroSection'
import PartnerBenefits from '@/components/partners/PartnerBenefits'
import PartnerTypes from '@/components/partners/PartnerTypes'
import PartnerApplication from '@/components/partners/PartnerApplication'
import PartnerFAQ from '@/components/partners/PartnerFAQ'

export const metadata: Metadata = {
  title: 'パートナープログラム | AIリスキリング×SNS マーケティング | NANDS',
  description: 'インフルエンサー・法人様向けパートナープログラム。月額10万円でAI検索時代の最先端技術パッケージの販売権を獲得。高額パートナー報酬。',
  keywords: 'パートナープログラム,インフルエンサー,法人,AI,リスキリング,SNS,マーケティング,パートナー報酬',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  openGraph: {
    title: 'パートナープログラム | AIリスキリング×SNS マーケティング',
    description: '月額10万円で最先端技術パッケージの販売権獲得。高額パートナー報酬の収益パートナーシップ',
    url: 'https://nands.tech/partners',
    siteName: 'NANDS Corporation',
    images: [
      {
        url: '/og-partners.jpg',
        width: 1200,
        height: 630,
        alt: 'NANDSパートナープログラム',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
}

export default function PartnersPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      <PartnerHeroSection />
      <PartnerBenefits />
      <PartnerTypes />
      <PartnerApplication />
      <PartnerFAQ />
    </main>
  )
} 