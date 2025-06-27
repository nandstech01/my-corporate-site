import AIAgentHeroSection from './components/AIAgentHeroSection';
import AIAgentServicesSection from './components/AIAgentServicesSection';
import AIAgentTechStack from './components/AIAgentTechStack';
import AIAgentShowcase from './components/AIAgentShowcase';
import AIAgentPricingSection from './components/AIAgentPricingSection';
import AIAgentContactSection from './components/AIAgentContactSection';

export default function AIAgentsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <AIAgentHeroSection />
      <AIAgentServicesSection />
      <AIAgentTechStack />
      <AIAgentShowcase />
      <AIAgentPricingSection />
      <AIAgentContactSection />
    </main>
  );
} 