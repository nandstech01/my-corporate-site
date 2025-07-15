import { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import LPHeader from '@/components/lp/LPHeader'
import LPHeroSection from '@/components/lp/LPHeroSection'
import ProblemsSection from '@/components/lp/ProblemsSection'
import SubsidySection from '@/components/lp/SubsidySection'
import TechResultsSection from '@/components/lp/TechResultsSection'
import ServicesSection from '@/components/lp/ServicesSection'
import ContactSection from '@/components/lp/ContactSection'
import LPFooter from '@/components/lp/LPFooter'

export const metadata: Metadata = {
  title: '人材開発支援助成金75%還付でAIモードも怖くない | 株式会社エヌアンドエス',
  description: '人材開発支援助成金で75%還付！SNS自動運用＆コンサル・システム開発で実証済み。AIモードも怖くない、94%SNS運用効率化実績あり。',
  keywords: '人材開発支援助成金,リスキリング,AI研修,SNS自動運用,コンサル,システム開発,AI対策,75%還付',

  openGraph: {
    title: '人材開発支援助成金75%還付でAIモードも怖くない',
    description: '75%還付でSNS自動運用を実現。94%SNS運用効率化の実証済み技術',
    url: 'https://nands.tech/lp',
    siteName: '株式会社エヌアンドエス',
    images: [
      {
        url: '/og-lp.jpg',
        width: 1200,
        height: 630,
        alt: '人材開発支援助成金75%還付でAIモードも怖くない',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '人材開発支援助成金75%還付でAIモードも怖くない',
    description: '75%還付でSNS自動運用を実現。94%SNS運用効率化の実証済み技術',
    images: ['/og-lp.jpg'],
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

// 構造化データ
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: '株式会社エヌアンドエス',
  url: 'https://nands.tech',
  logo: 'https://nands.tech/logo.png',
  sameAs: [
    'https://twitter.com/nands_tech',
    'https://www.linkedin.com/company/nands-tech'
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '0120-558-551',
    contactType: 'customer service',
    availableLanguage: 'Japanese'
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: '皇子が丘２丁目10−25−3004号',
    addressLocality: '大津市',
    addressRegion: '滋賀県',
    addressCountry: 'JP'
  }
}

export default function LPPage() {
  return (
    <main className="min-h-screen">
      <LPHeader />
      <LPHeroSection />
      <ProblemsSection />
      <SubsidySection />
      <TechResultsSection />
      <ServicesSection />
      <ContactSection />
      <LPFooter />
    </main>
  )
} 