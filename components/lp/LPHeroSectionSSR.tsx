import dynamic from 'next/dynamic'

// 既存のクライアント実装（アニメーション等を含む）
const LPHeroSection = dynamic(() => import('./LPHeroSection'), {
  ssr: true,
  loading: () => (
    <section className="relative">
      <div className="container mx-auto px-4 py-16">
        <div className="animate-pulse">
          <div className="h-6 w-48 bg-gray-200/60 rounded mb-4" />
          <div className="h-10 w-80 bg-gray-200/60 rounded mb-6" />
          <div className="h-5 w-64 bg-gray-200/60 rounded" />
        </div>
      </div>
    </section>
  )
})

export default function LPHeroSectionSSR() {
  // そのまま既存のデザインを表示（テキストはSSR、アニメはクライアントで実行）
  return <LPHeroSection />
} 