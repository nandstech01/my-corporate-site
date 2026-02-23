import type { Metadata } from 'next'

export const revalidate = 3600

import SDLPHeader from './components/SDLPHeader'
import SDLPHero from './components/SDLPHero'
import SDLPValueProp from './components/SDLPValueProp'
import SDLPDeliverables from './components/SDLPDeliverables'
import SDLPCta from './components/SDLPCta'
import SDLPCoverage from './components/SDLPCoverage'
import SDLPTrust from './components/SDLPTrust'
import SDLPSubsidy from './components/SDLPSubsidy'
import SDLPAbout from './components/SDLPAbout'
import SDLPFooter from './components/SDLPFooter'
import SDLPStickyCTA from './components/SDLPStickyCTA'

export const metadata: Metadata = {
  title: 'システム開発 | 株式会社エヌアンドエス',
  description:
    'ホームページ制作・業務システム開発を圧倒的コスパで。要件定義から納品まで一貫対応。無料シミュレーションで今すぐ概算見積もりを確認できます。',
}

export default function SystemDevLPPage() {
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'システム開発 | 株式会社エヌアンドエス',
    description:
      'ホームページ制作・業務システム開発を圧倒的コスパで。要件定義から納品まで一貫対応。',
    url: 'https://nands.tech/system-dev-lp',
    provider: {
      '@type': 'Organization',
      name: '株式会社エヌアンドエス',
      url: 'https://nands.tech',
    },
  }

  const offerSchema = {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    name: 'システム開発サービス',
    description: 'ホームページ制作・業務システム開発',
    priceCurrency: 'JPY',
    price: '300000',
    priceSpecification: {
      '@type': 'PriceSpecification',
      priceCurrency: 'JPY',
      price: '300000',
      description: 'ホームページ制作 30万円〜',
    },
    seller: {
      '@type': 'Organization',
      name: '株式会社エヌアンドエス',
    },
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'システム開発の費用はいくらですか？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'ホームページ制作は30万円〜、業務システム開発は80万円〜となっております。詳細は無料シミュレーションでご確認ください。',
        },
      },
      {
        '@type': 'Question',
        name: '開発期間はどのくらいですか？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'ホームページ制作は最短2週間、業務システムは約2〜3ヶ月が目安です。規模や要件により異なります。',
        },
      },
      {
        '@type': 'Question',
        name: '見積もりは無料ですか？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'はい、見積もりは完全無料です。オンラインシミュレーションで概算をすぐに確認でき、詳細見積もりも無料でお作りします。',
        },
      },
      {
        '@type': 'Question',
        name: 'IT導入補助金は使えますか？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'はい、IT導入補助金の対象となるサービスです。最大50%（上限450万円）の補助を受けられます。補助金申請のサポートも行っております。',
        },
      },
      {
        '@type': 'Question',
        name: '保守・運用サポートはありますか？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'はい、納品後の保守・運用サポートも承っております。月額プランでの継続的なサポートや、スポットでの改修対応も可能です。',
        },
      },
      {
        '@type': 'Question',
        name: 'セキュリティ対策はどうなっていますか？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'SSL/TLS暗号化、SQLインジェクション対策、XSS対策など、OWASP Top 10に準拠したセキュリティ対策を標準で実装しています。',
        },
      },
      {
        '@type': 'Question',
        name: '支払い方法は？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '銀行振込（分割払い対応）、クレジットカード払いに対応しています。着手金50%・納品時50%の分割払いが標準です。',
        },
      },
      {
        '@type': 'Question',
        name: '他社との違いは何ですか？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'AI技術を全サービスに標準搭載している点と、少数精鋭チームによる圧倒的コストパフォーマンスが特徴です。大手SIerの約30-70%のコストで同等以上の品質を実現します。',
        },
      },
    ],
  }

  return (
    <>
      <SDLPHeader />
      <main>
        <SDLPHero />
        <SDLPValueProp />
        <SDLPDeliverables />
        <SDLPCta />
        <SDLPCoverage />
        <SDLPSubsidy />
        <SDLPTrust />
        <SDLPCta variant="gradient" />
        <SDLPAbout />
        <SDLPCta />
      </main>
      <SDLPFooter />
      <SDLPStickyCTA />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(offerSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  )
}
