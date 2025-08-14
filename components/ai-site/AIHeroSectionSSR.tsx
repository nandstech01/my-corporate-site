import dynamic from 'next/dynamic'

const AIHeroSection = dynamic(() => import('./AIHeroSection'), {
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

export default function AIHeroSectionSSR() {
	return <AIHeroSection />
} 