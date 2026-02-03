import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'AI搭載システム開発 | 株式会社エヌアンドエス',
  description:
    'AI実装の業務システム開発を圧倒的コスパで。ChatGPT連携・AIチャットボット・データ分析自動化など、要件定義から納品まで一貫対応。無料シミュレーションで今すぐ概算見積もりを確認できます。',
  openGraph: {
    title: 'AI搭載システム開発 | 株式会社エヌアンドエス',
    description:
      'AI実装の業務システム開発を圧倒的コスパで。ChatGPT連携からRAG構築まで一貫対応。',
    url: 'https://nands.tech/system-dev-lp',
    siteName: '株式会社エヌアンドエス',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI搭載システム開発 | 株式会社エヌアンドエス',
    description:
      'AI実装の業務システム開発を圧倒的コスパで。無料シミュレーションで今すぐAI込みの概算見積もりを確認。',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function SDLPLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/*
        Hide the root layout's Header and Footer on SDLP pages.
        The root layout renders Header/Footer as direct children of <body>,
        so we target them with adjacent-sibling-safe selectors.
        This avoids modifying the root layout.tsx or Header/Footer components.
      */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            body > header:not([data-sdlp]),
            body > footer:not([data-sdlp]) { display: none !important; }
          `,
        }}
      />
      {children}
    </>
  )
}
