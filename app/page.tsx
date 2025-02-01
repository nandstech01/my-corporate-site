import HeroSection from './components/portal/HeroSection'
import ServicesSection from './components/portal/ServicesSection'
// import BlogSection from './components/portal/BlogSection'
import AboutSection from './components/portal/AboutSection'
import SustainabilitySection from './components/portal/SustainabilitySection'
import ContactSection from './components/portal/ContactSection'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <ServicesSection />
      {/* <BlogSection /> */}
      <AboutSection />
      <SustainabilitySection />
      <ContactSection />
    </main>
  )
} 