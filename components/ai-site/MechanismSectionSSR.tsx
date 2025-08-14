import dynamic from 'next/dynamic'

const MechanismSection = dynamic(() => import('./MechanismSection'), {
	ssr: true,
	loading: () => (
		<section className="py-16">
			<div className="container mx-auto px-4">
				<div className="animate-pulse text-center">
					<div className="h-6 w-56 bg-gray-200/60 rounded mx-auto mb-3" />
					<div className="h-4 w-80 bg-gray-200/60 rounded mx-auto" />
				</div>
			</div>
		</section>
	)
})

export default function MechanismSectionSSR() {
	return <MechanismSection />
} 