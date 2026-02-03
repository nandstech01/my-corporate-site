import type { Metadata } from 'next'
import SDLPHeader from './components/SDLPHeader'
import SDLPHero from './components/SDLPHero'
import SDLPValueProp from './components/SDLPValueProp'
import SDLPDeliverables from './components/SDLPDeliverables'
import SDLPCta from './components/SDLPCta'
import SDLPCoverage from './components/SDLPCoverage'
import SDLPAbout from './components/SDLPAbout'
import SDLPFooter from './components/SDLPFooter'

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
        <SDLPCta variant="gradient" />
        <SDLPAbout />
        <SDLPCta />
      </main>
      <SDLPFooter />

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
