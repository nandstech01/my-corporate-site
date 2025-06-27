import React from 'react';
import MCPHeroSection from './components/MCPHeroSection';
import MCPServicesSection from './components/MCPServicesSection';
import MCPTechStack from './components/MCPTechStack';
import MCPShowcase from './components/MCPShowcase';
import MCPPricingSection from './components/MCPPricingSection';
import MCPContactSection from './components/MCPContactSection';

export default function MCPServersPage() {
  return (
    <main className="min-h-screen">
      <MCPHeroSection />
      <MCPServicesSection />
      <MCPTechStack />
      <MCPShowcase />
      <MCPPricingSection />
      <MCPContactSection />
    </main>
  );
} 