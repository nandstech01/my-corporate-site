import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Script from 'next/script'
import SdlpThemeProvider from './components/SdlpThemeProvider'

export const metadata: Metadata = {
  title: 'AI搭載システム開発・ホームページ制作 | 費用70%OFF | 株式会社エヌアンドエス',
  description:
    'ホームページ10万円〜、AI搭載システム80万円〜。無料AIシミュレーションで概算費用を即確認。500件以上の開発実績。IT導入補助金対応で最大50%補助。要件定義から納品まで一貫対応。',
  openGraph: {
    title: 'AI搭載システム開発・ホームページ制作 | 費用70%OFF | 株式会社エヌアンドエス',
    description:
      'ホームページ10万円〜、AI搭載システム80万円〜。無料AIシミュレーションで概算費用を即確認。500件以上の開発実績。',
    url: 'https://nands.tech/system-dev-lp',
    siteName: '株式会社エヌアンドエス',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI搭載システム開発・ホームページ制作 | 費用70%OFF | 株式会社エヌアンドエス',
    description:
      'ホームページ10万円〜、AI搭載システム80万円〜。無料AIシミュレーションで概算費用を即確認。IT導入補助金対応で最大50%補助。',
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
      <SdlpThemeProvider>
        {children}
      </SdlpThemeProvider>

      {/* Meta Pixel */}
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','XXXXXXXXXXXXXXXXX');fbq('track','PageView');`}
      </Script>

      {/* Google Ads Remarketing */}
      <Script src="https://www.googletagmanager.com/gtag/js?id=AW-XXXXXXXXXXX" strategy="afterInteractive" />
      <Script id="google-ads" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','AW-XXXXXXXXXXX');`}
      </Script>
    </>
  )
}
