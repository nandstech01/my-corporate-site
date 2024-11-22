import { Metadata } from 'next';
import '@/styles/globals.css';
import Header from '@/components/common/Header';

export const metadata: Metadata = {
  metadataBase: new URL('https://nands.tech'),
  title: {
    default: '株式会社エヌアンドエス | 退職代行・生成AI活用のキャリア支援',
    template: '%s | 株式会社エヌアンドエス'
  },
  description: '株式会社エヌアンドエスは、退職代行から生成AI活用のリスキリング研修、キャリアコンサルティングまで、全ての働く人の「次のステージ」をサポートする総合キャリア支援企業です。2008年の設立以来、時代に寄り添ったソリューションを提供しています。',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon.svg', type: 'image/svg+xml' }
    ],
    shortcut: '/favicon.ico',
    apple: { url: '/apple-touch-icon.png', sizes: '180x180' }
  },
  manifest: '/manifest.json',
  openGraph: {
    title: '株式会社エヌアンドエス | 退職代行・生成AI活用のキャリア支援',
    description: '株式会社エヌアンドエスは、退職代行から生成AI活用のリスキリング研修、キャリアコンサルティングまで、全ての働く人の「次のステージ」をサポートする総合キャリア支援企業です。',
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
    title: '株式会社エヌアンドエス | 退職代行・生成AI活用のキャリア支援',
    description: '株式会社エヌアンドエスは、退職代行から生成AI活用のリスキリング研修、キャリアコンサルティングまで、全ての働く人の「次のステージ」をサポートする総合キャリア支援企業です。',
    images: ['/images/ogp.jpg'],
  },
  alternates: {
    canonical: 'https://nands.tech'
  },
  keywords: '退職代行,エヌアンドエス,NANDS,退職支援,AI研修,リスキリング,キャリア支援,転職支援,生成AI,人材育成',
  robots: {
    index: true,
    follow: true,
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
  },
  category: 'キャリア支援',
  formatDetection: {
    telephone: false
  },
  authors: [{ name: '株式会社エヌアンドエス' }],
  creator: '株式会社エヌアンドエス',
  publisher: '株式会社エヌアンドエス',
  other: {
    'format-detection': 'telephone=no',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head />
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}