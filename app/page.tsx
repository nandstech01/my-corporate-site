import type { Metadata } from 'next'
import HeroSection from './components/portal/HeroSection'
import ServicesSection from './components/portal/ServicesSection'
// import BlogSection from './components/portal/BlogSection'
import AboutSection from './components/portal/AboutSection'
import SustainabilitySection from './components/portal/SustainabilitySection'
import ContactSection from './components/portal/ContactSection'

export const metadata: Metadata = {
  title: "N&S - もはや人間業ではないHero",
  description: "AIリスキリング・副業支援・退職代行をワンストップで提供するN&Sが贈る、圧倒的没入感のHeroセクション。",
  openGraph: {
    title: "N&S - 人智を超えた3D＆パーティクル演出",
    description: "Three.js + framer-motion + GPUパーティクル + ポストプロセッシング等を詰め込み、世界一長いコードに挑戦。",
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