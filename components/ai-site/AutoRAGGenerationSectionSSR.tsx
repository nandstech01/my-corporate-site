import dynamic from 'next/dynamic'

const AutoRAGGenerationSection = dynamic(() => import('./AutoRAGGenerationSection'), {
	ssr: true,
	loading: () => (
		<section className="py-20 bg-gradient-to-br from-slate-900 via-gray-900 to-black">
			<div className="container mx-auto px-4">
				<div className="animate-pulse text-center">
					<div className="h-8 w-80 bg-gray-200/60 rounded mx-auto mb-4" />
					<div className="h-4 w-96 bg-gray-200/60 rounded mx-auto mb-2" />
					<div className="h-4 w-72 bg-gray-200/60 rounded mx-auto mb-8" />
					<div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
						{Array.from({length: 4}).map((_, i) => (
							<div key={i} className="bg-white/5 rounded-xl border border-white/10 p-6">
								<div className="h-8 w-16 bg-gray-200/60 rounded mx-auto mb-2" />
								<div className="h-4 w-24 bg-gray-200/60 rounded mx-auto mb-1" />
								<div className="h-3 w-20 bg-gray-200/60 rounded mx-auto" />
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	)
})

export default function AutoRAGGenerationSectionSSR() {
	return <AutoRAGGenerationSection />
} 