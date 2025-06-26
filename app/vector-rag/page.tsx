import Header from '@/app/components/common/Header'
import VectorRagHeroSection from './components/VectorRagHeroSection'
import VectorRagServicesSection from './components/VectorRagServicesSection'
import VectorRagTechStack from './components/VectorRagTechStack'
import VectorRagShowcase from './components/VectorRagShowcase'
import VectorRagPricingSection from './components/VectorRagPricingSection'
import VectorRagContactSection from './components/VectorRagContactSection'

export default function VectorRagPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <VectorRagHeroSection />
      <VectorRagServicesSection />
      <VectorRagTechStack />
      <VectorRagShowcase />
      <VectorRagPricingSection />
      <VectorRagContactSection />
    </main>
  )
} 