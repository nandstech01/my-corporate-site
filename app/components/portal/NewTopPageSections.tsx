'use client'

/**
 * NewTopPageSections - 新トップページセクション統合コンポーネント
 * 
 * 「見た目はApple、中身はデジライズ」コンセプトに基づく
 * Hybrid Architecture デザインシステムを実装
 * 
 * ModeProvider: 個人/法人モードの切り替え
 * ThemeProvider: ダークモード/ライトモードの切り替え（トップページ専用）
 * GatewayScreen: 初回訪問時の個人/法人選択画面
 */

import { ModeProvider } from './ModeContext'
import { ThemeProvider } from './ThemeContext'
import DevResetButton from './DevResetButton'
import GatewayScreen, { useGatewayState } from './GatewayScreen'
import NewHeroSection from './NewHeroSection'
import ProblemSection from './ProblemSection'
import PhilosophySection from './PhilosophySection'
import SolutionBentoGrid from './SolutionBentoGrid'
import PricingSection from './PricingSection'
import CTASection from './CTASection'
import FAQSection from './FAQSection'
import ContactSection from './ContactSection'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  thumbnail_url: string | null
  created_at: string
  table_type: 'posts' | 'chatgpt_posts'
}

interface YouTubeShort {
  id: number
  videoId: string
  url: string
  embedUrl: string
  title: string
  hookText?: string
  fragmentId: string
  completeUri?: string
}

interface NewTopPageSectionsProps {
  posts?: BlogPost[]
  youtubeShorts?: YouTubeShort[]
}

function TopPageContent({ posts, youtubeShorts }: NewTopPageSectionsProps) {
  const { showGateway, isLoading, completeGateway } = useGatewayState()

  // ローディング中は何も表示しない（ちらつき防止）
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black z-[100]" />
    )
  }

  return (
    <>
      {/* ゲートウェイ画面（初回訪問時のみ） */}
      {showGateway && (
        <GatewayScreen onComplete={completeGateway} />
      )}

      {/* 開発用リセットボタン（本番では削除） */}
      <DevResetButton />
      
      {/* Hero Area - ファーストビュー */}
      <section id="hero" className="scroll-mt-0">
        <NewHeroSection posts={posts} youtubeShorts={youtubeShorts} />
      </section>

      {/* Problem Section - 課題提起 */}
      <section id="problem" className="scroll-mt-20">
        <ProblemSection />
      </section>

      {/* Philosophy Section - 原田賢治の哲学 */}
      <PhilosophySection />

      {/* Solution Section - Bento Grid */}
      <section id="solution" className="scroll-mt-20">
        <SolutionBentoGrid />
      </section>

      {/* Pricing & Subsidy Section */}
      <section id="pricing" className="scroll-mt-20">
        <PricingSection />
      </section>

      {/* CTA Section */}
      <section id="cta" className="scroll-mt-20">
        <CTASection />
      </section>

      {/* FAQ Section */}
      <section id="faq-support" className="scroll-mt-20">
        <FAQSection />
      </section>

      {/* Contact Section */}
      <section id="contact" className="scroll-mt-20">
        <ContactSection />
      </section>
    </>
  )
}

export default function NewTopPageSections({ posts = [], youtubeShorts = [] }: NewTopPageSectionsProps) {
  return (
    <ThemeProvider>
      <ModeProvider>
        <TopPageContent posts={posts} youtubeShorts={youtubeShorts} />
      </ModeProvider>
    </ThemeProvider>
  )
}

