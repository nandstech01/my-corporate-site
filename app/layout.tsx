import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from "next/font/google";
import Header from './components/common/Header';
import Footer from '../src/components/common/Footer';
import AIDetectionTracker from '../components/common/AIDetectionTracker';
import Script from 'next/script';
import type { ReactNode } from 'react';

const inter = Inter({ subsets: ["latin"] });

// Define viewport settings separately
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#4a6cf7' },
    { media: '(prefers-color-scheme: dark)', color: '#1e293b' }
  ],
  colorScheme: 'light dark',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://nands.tech'),
  title: {
    default: '株式会社エヌアンドエス | 総合人材支援・生成AIリスキリング研修',
    template: '%s | 株式会社エヌアンドエス'
  },
  description: '株式会社エヌアンドエスは、生成AIを活用したリスキリング研修やキャリアコンサルティング、退職支援まで、全ての働く人の「次のステージ」をサポートする総合人材支援企業です。2008年の設立以来、時代に寄り添ったソリューションを提供しています。',
  icons: [
    { rel: 'icon', url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
    { rel: 'apple-touch-icon', url: '/apple-touch-icon.png' },
    { rel: 'icon', url: '/favicon.ico', sizes: 'any' },
  ],
  manifest: '/manifest.json',
  openGraph: {
    title: '株式会社エヌアンドエス | 総合人材支援・生成AIリスキリング研修',
    description: '株式会社エヌアンドエスは、生成AIを活用したリスキリング研修やキャリアコンサルティング、退職支援まで、全ての働く人の「次のステージ」をサポートする総合人材支援企業です。',
    url: 'https://nands.tech',
    siteName: '株式会社エヌアンドエス',
    images: [
      {
        url: '/images/default-og-image.jpg',
        width: 1200,
        height: 630,
        alt: '株式会社エヌアンドエス - 総合人材支援・生成AIリスキリング研修'
      }
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '株式会社エヌアンドエス | 総合人材支援・生成AIリスキリング研修',
    description: '株式会社エヌアンドエスは、生成AIを活用したリスキリング研修やキャリアコンサルティング、退職支援まで、全ての働く人の「次のステージ」をサポートする総合人材支援企業です。',
    images: ['/images/default-og-image.jpg'],
    site: '@nands_tech',
    creator: '@nands_tech',
  },
  alternates: {
    canonical: 'https://nands.tech',
    languages: {
      'ja-JP': 'https://nands.tech',
      'en-US': 'https://nands.tech/en'
    }
  },
  keywords: '総合人材支援,キャリアコンサルティング,生成AI研修,リスキリング,人材育成,キャリア支援,退職支援,エヌアンドエス,NANDS,転職支援,ChatGPT,AI活用,人材開発',
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'IO9fU_SSYnQy3hee-8zcGtWVbDMsopot5fU2kLBhw3k',
    yandex: 'verification_code',
    yahoo: 'verification_code',
    other: {
      'msvalidate.01': 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', // Bingウェブマスターツールの検証コード
      'norton-safeweb-site-verification': 'norton_verification_code', // ノートンセーフウェブ
    },
  },
  category: 'キャリア支援',
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
    url: false
  },
  authors: [{ name: '株式会社エヌアンドエス', url: 'https://nands.tech' }],
  creator: '株式会社エヌアンドエス',
  publisher: '株式会社エヌアンドエス',
  other: {
    'format-detection': 'telephone=no',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'application-name': 'N&S',
  },
  appLinks: {
    ios: {
      url: 'https://nands.tech/',
      app_store_id: 'app_store_id'
    },
    android: {
      package: 'com.nands.app',
      app_name: 'N&S App'
    }
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  // 開発環境かどうかを判定
  const isDev = process.env.NODE_ENV === 'development';
  
  // 組織の構造化データ
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "株式会社エヌアンドエス",
    "alternateName": "N&S",
    "url": "https://nands.tech",
    "logo": "https://nands.tech/images/logo.png",
    "description": "滋賀県を拠点とする総合人材支援・生成AIリスキリング研修企業。生成AI活用のリスキリング研修から、キャリアコンサルティング、退職支援まで、全ての働く人の「次のステージ」をサポートする総合キャリア支援企業です。",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "滋賀県内主要拠点",
      "addressLocality": "滋賀県",
      "addressRegion": "関西地方",
      "addressCountry": "JP"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+81-77-0000-0000",
      "contactType": "customer service",
      "email": "contact@nands.tech",
      "availableLanguage": ["日本語"],
      "areaServed": ["JP", "関西地方", "滋賀県"]
    },
    "sameAs": [
      "https://twitter.com/nands_tech",
      "https://www.facebook.com/nands.tech",
      "https://www.linkedin.com/company/nands-tech"
    ],
    "foundingDate": "2008",
    "founders": [
      {
        "@type": "Person",
        "name": "代表取締役"
      }
    ],
    "numberOfEmployees": {
      "@type": "QuantitativeValue",
      "value": "10-50"
    },
    "slogan": "次のステージへ"
  };

  return (
    <html lang="ja">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 
                    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  // フォールバック: システム設定をチェック
                  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.classList.add('dark');
                  }
                }
                
                // システムテーマ変更をリアルタイムで監視
                const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
                const handleThemeChange = (e) => {
                  if (!localStorage.getItem('theme')) {
                    if (e.matches) {
                      document.documentElement.classList.add('dark');
                    } else {
                      document.documentElement.classList.remove('dark');
                    }
                  }
                };
                
                mediaQuery.addEventListener('change', handleThemeChange);
              })();
            `
          }}
        />
        {/* DNS-Prefetch */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        
        {/* Preconnect */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        
        {/* Preload Critical Resources - 本番環境でのみ適用 */}
        {!isDev && (
          <>
            
          </>
        )}
        
        {/* Hreflang タグ - 多言語サポート */}
        <link rel="alternate" hrefLang="ja" href="https://nands.tech" />
        <link rel="alternate" hrefLang="ja-jp" href="https://nands.tech" />
        <link rel="alternate" hrefLang="x-default" href="https://nands.tech" />
        
        {/* Security Headers - 本番環境用 (開発環境ではHTTPヘッダーで制御) */}
        {process.env.NODE_ENV === 'production' && (
          <>
            <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co https://www.google-analytics.com; frame-src 'self' https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'" />
            <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
            <meta httpEquiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=(), interest-cohort=()" />
            <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
          </>
        )}
        
        {/* SEO関連のmeta tags (Metadata APIによって自動で挿入されます) */}
      </head>
      <body className={inter.className}>
        <Header />
        {children}
        <Footer />
        
        {/* AI引用自動検出トラッカー */}
        <AIDetectionTracker />
        
        {/* 組織情報の構造化データ */}
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        
        {/* Google Analytics - 本番環境のみ */}
        {process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                  'anonymize_ip': true,
                  'cookie_flags': 'SameSite=None;Secure'
                });
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}