import './globals.css';
import type { Metadata } from 'next';
import { Inter } from "next/font/google";
import Header from './components/common/Header';
import Footer from '../src/components/common/Footer';
import Script from 'next/script';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://nands.tech'),
  title: {
    default: '株式会社エヌアンドエス | 総合人材支援・生成AIリスキリング研修',
    template: '%s | 株式会社エヌアンドエス'
  },
  description: '株式会社エヌアンドエスは、生成AIを活用したリスキリング研修やキャリアコンサルティング、退職支援まで、全ての働く人の「次のステージ」をサポートする総合人材支援企業です。2008年の設立以来、時代に寄り添ったソリューションを提供しています。',
  icons: [
    { rel: 'icon', url: '/favicon.ico' },
    { rel: 'apple-touch-icon', url: '/apple-touch-icon.png' },
    { rel: 'icon', url: '/favicon-32x32.png', sizes: '32x32' },
    { rel: 'icon', url: '/favicon-16x16.png', sizes: '16x16' }
  ],
  manifest: '/manifest.json',
  openGraph: {
    title: '株式会社エヌアンドエス | 総合人材支援・生成AIリスキリング研修',
    description: '株式会社エヌアンドエスは、生成AIを活用したリスキリング研修やキャリアコンサルティング、退職支援まで、全ての働く人の「次のステージ」をサポートする総合人材支援企業です。',
    url: 'https://nands.tech',
    siteName: '株式会社エヌアンドエス',
    images: [
      {
        url: '/images/ogp.jpg',
        width: 1200,
        height: 630,
        alt: '株式会社エヌアンドエス - キャリア支援サービス'
      }
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '株式会社エヌアンドエス | 総合人材支援・生成AIリスキリング研修',
    description: '株式会社エヌアンドエスは、生成AIを活用したリスキリング研修やキャリアコンサルティング、退職支援まで、全ての働く人の「次のステージ」をサポートする総合人材支援企業です。',
    images: ['/images/ogp.jpg'],
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
      'norton-safeweb-site-verification': 'norton_verification_code' // ノートンセーフウェブ
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
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'application-name': 'N&S',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#4a6cf7' },
    { media: '(prefers-color-scheme: dark)', color: '#1e293b' }
  ],
  colorScheme: 'light dark',
  appLinks: {
    ios: {
      url: 'https://nands.tech/',
      app_store_id: 'app_store_id'
    },
    android: {
      package: 'com.nands.app',
      app_name: 'N&S App'
    }
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 組織の構造化データ
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "株式会社エヌアンドエス",
    "alternateName": "N&S",
    "url": "https://nands.tech",
    "logo": "https://nands.tech/images/logo.png",
    "description": "生成AI活用のリスキリング研修から、キャリアコンサルティング、退職支援まで、全ての働く人の「次のステージ」をサポートする総合キャリア支援企業です。",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "渋谷区道玄坂1-10-8 渋谷道玄坂東急ビル2F-C",
      "addressLocality": "渋谷区",
      "addressRegion": "東京都",
      "postalCode": "150-0043",
      "addressCountry": "JP"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+81-03-0000-0000",
      "contactType": "customer service",
      "email": "contact@nands.tech",
      "availableLanguage": ["日本語"]
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
        {/* DNS-Prefetch */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        
        {/* Preconnect */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        
        {/* Preload Critical Resources */}
        <link rel="preload" href="/images/logo.png" as="image" type="image/png" />
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        
        {/* Hreflang タグ - 多言語サポート */}
        <link rel="alternate" hrefLang="ja" href="https://nands.tech" />
        <link rel="alternate" hrefLang="ja-jp" href="https://nands.tech" />
        <link rel="alternate" hrefLang="x-default" href="https://nands.tech" />
        
        {/* Security Headers */}
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co; frame-src 'self'; object-src 'none'" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="SAMEORIGIN" />
        <meta httpEquiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=(), interest-cohort=()" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        
        {/* SEO関連のmeta tags (Metadata APIによって自動で挿入されます) */}
      </head>
      <body className={inter.className}>
        <Header />
        {children}
        <Footer />
        
        {/* 組織情報の構造化データ */}
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX', {
              'anonymize_ip': true,
              'cookie_flags': 'SameSite=None;Secure'
            });
          `}
        </Script>
      </body>
    </html>
  );
}