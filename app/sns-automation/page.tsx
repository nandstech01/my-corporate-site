import SNSHeroSection from './components/SNSHeroSection';
import SNSServicesSection from './components/SNSServicesSection';
import SNSTechStack from './components/SNSTechStack';
import SNSShowcase from './components/SNSShowcase';
import SNSPricingSection from './components/SNSPricingSection';
import SNSContactSection from './components/SNSContactSection';

export default function SNSAutomationPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <SNSHeroSection />
      <SNSServicesSection />
      <SNSTechStack />
      <SNSShowcase />
      <SNSPricingSection />
      <SNSContactSection />
    </main>
  );
} 