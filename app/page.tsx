import type { Metadata } from 'next'
import HeroSection from './components/portal/HeroSection'
import ServicesSection from './components/portal/ServicesSection'
// import BlogSection from './components/portal/BlogSection'
import AboutSection from './components/portal/AboutSection'
import SustainabilitySection from './components/portal/SustainabilitySection'
import ContactSection from './components/portal/ContactSection'

export const metadata: Metadata = {
  title: "株式会社エヌアンドエス | 生成AI活用・リスキリング研修のプロフェッショナル",
  description: "株式会社エヌアンドエスは、生成AIを活用したリスキリング研修やキャリアコンサルティング、AI導入支援まで、企業と個人の成長をサポートする総合ソリューション企業です。",
  openGraph: {
    title: "株式会社エヌアンドエス | 生成AI活用・リスキリング研修のプロフェッショナル",
    description: "生成AIを活用したリスキリング研修やキャリアコンサルティング、AI導入支援まで、企業と個人の成長をサポートする総合ソリューション企業です。",
    url: "https://nands.tech",
    images: [
      {
        url: "https://nands.tech/ogp-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
}

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <ServicesSection />
      {/* <BlogSection /> */}
      <AboutSection />
      <SustainabilitySection />
      <ContactSection />
    </main>
  )
} 