import type { Metadata } from 'next';
import HeroSection from './components/HeroSection';
import LogosSection from './components/LogosSection';
import NewsSection from './components/NewsSection';
import ServicesSection from './components/ServicesSection';
import CaseStudiesSection from './components/CaseStudiesSection';
import FeatureSection from './components/FeatureSection';
import FlowSection from './components/FlowSection';
import FaqSection from './components/FaqSection';

export const metadata: Metadata = {
  title: 'NANDS - AI活用支援サービス',
  description: 'AIエージェントとエンジニアコンサルタントによる二重サポート。企業のAI活用を包括的に支援します。',
};

export default function CorporatePage() {
  return (
    <main>
      <HeroSection />
      <NewsSection />
      <ServicesSection />
      <FeatureSection />
      <CaseStudiesSection />
      <FlowSection />
      <FaqSection />
    </main>
  );
}
