import { Metadata } from 'next'
import dynamic from 'next/dynamic'

// SSR ラッパー（各セクションはテキストSSR・アニメCSR方針）
import AIHeader from '@/components/ai-site/AIHeader'
import AIHeroSectionSSR from '@/components/ai-site/AIHeroSectionSSR'
import EmpathySectionSSR from '@/components/ai-site/EmpathySectionSSR'
import MechanismSectionSSR from '@/components/ai-site/MechanismSectionSSR'
import FeaturesSectionSSR from '@/components/ai-site/FeaturesSectionSSR'
import DemoSectionSSR from '@/components/ai-site/DemoSectionSSR'
import PricingSectionSSR from '@/components/ai-site/PricingSectionSSR'
import SubsidySectionSSR from '@/components/ai-site/SubsidySectionSSR'
import ROISectionSSR from '@/components/ai-site/ROISectionSSR'
import UseCasesSectionSSR from '@/components/ai-site/UseCasesSectionSSR'
import FAQSectionSSR from '@/components/ai-site/FAQSectionSSR'
import ContactSectionSSR from '@/components/ai-site/ContactSectionSSR'

export const revalidate = 300

export const metadata: Metadata = {
	metadataBase: new URL('https://nands.tech'),
	title: 'AIサイト｜自立して育つ、24時間365日 無人営業マン搭載の“AIに引用される”サイト',
	description: 'Triple RAG × 自動ベクトルブログ × 構造化データ。AIに引用される設計を標準搭載。IT補助金活用可。まずは30分デモ。',
	openGraph: {
		title: 'AIサイト｜自立して育つ、24時間365日 無人営業マン',
		description: 'Triple RAG × 自動ベクトルブログ × 構造化データ。AIに“引用され続ける”設計を標準搭載。',
		url: 'https://nands.tech/ai-site',
		siteName: '株式会社エヌアンドエス',
		images: [{ url: '/og-ai-site.jpg', width: 1200, height: 630, alt: 'AIサイト' }],
		locale: 'ja_JP',
		type: 'website'
	},
	twitter: {
		card: 'summary_large_image',
		title: 'AIサイト｜自立して育つ、24時間365日 無人営業マン',
		description: 'Triple RAG × 自動ベクトルブログ × 構造化データ。AIに“引用され続ける”設計を標準搭載。',
		images: ['/og-ai-site.jpg']
	},
	alternates: { canonical: 'https://nands.tech/ai-site' },
	robots: { index: true, follow: true }
}

export default function AISitePage() {
	return (
		<main className="relative min-h-screen overflow-hidden">
			{/* 背景（/lp と同等の黒×シアン基調） */}
			<div className="pointer-events-none absolute inset-0 -z-10">
				<div className="absolute inset-0 bg-gradient-to-b from-[#0b1f3b] via-[#0a1b33] to-[#08152a]" />
				<div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-10" />
			</div>

			<AIHeader />
			<AIHeroSectionSSR />
			<EmpathySectionSSR />
			<MechanismSectionSSR />
			<FeaturesSectionSSR />
			<DemoSectionSSR />
			<PricingSectionSSR />
			<SubsidySectionSSR />
			<ROISectionSSR />
			<UseCasesSectionSSR />
			<FAQSectionSSR />
			<ContactSectionSSR />
		</main>
	)
} 