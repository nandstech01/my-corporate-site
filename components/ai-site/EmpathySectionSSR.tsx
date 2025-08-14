import dynamic from 'next/dynamic'

const EmpathySection = dynamic(() => import('./EmpathySection'), {
	ssr: true,
	loading: () => (
		<section className="py-16">
			<div className="container mx-auto px-4">
				<div className="animate-pulse max-w-3xl mx-auto text-center">
					<div className="h-6 w-56 bg-gray-200/60 rounded mx-auto mb-4" />
					<div className="h-4 w-72 bg-gray-200/60 rounded mx-auto" />
				</div>
			</div>
		</section>
	)
})

export default function EmpathySectionSSR() {
	return <EmpathySection />
} 