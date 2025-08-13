import dynamic from 'next/dynamic'

const SubsidySection = dynamic(() => import('./SubsidySection'), {
  ssr: true,
  loading: () => (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="animate-pulse max-w-4xl mx-auto">
          <div className="h-6 w-64 bg-gray-200/60 rounded mb-3 mx-auto" />
          <div className="h-4 w-80 bg-gray-200/60 rounded mx-auto" />
        </div>
      </div>
    </section>
  )
})

export default function SubsidySectionSSR() {
  return <SubsidySection />
} 