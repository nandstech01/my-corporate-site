import HRHeroSection from './components/HRHeroSection';
import HRServicesSection from './components/HRServicesSection';
import HRTechStack from './components/HRTechStack';
import HRShowcase from './components/HRShowcase';
import HRPricingSection from './components/HRPricingSection';
import HRContactSection from './components/HRContactSection';

export default function HRSolutionsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <HRHeroSection />
      <HRServicesSection />
      <HRTechStack />
      <HRShowcase />
      <HRPricingSection />
      <HRContactSection />
    </main>
  );
} 