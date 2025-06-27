import VideoHeroSection from './components/VideoHeroSection';
import VideoServicesSection from './components/VideoServicesSection';
import VideoTechStack from './components/VideoTechStack';
import VideoShowcase from './components/VideoShowcase';
import VideoPricingSection from './components/VideoPricingSection';
import VideoContactSection from './components/VideoContactSection';

export default function VideoGenerationPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <VideoHeroSection />
      <VideoServicesSection />
      <VideoTechStack />
      <VideoShowcase />
      <VideoPricingSection />
      <VideoContactSection />
    </main>
  );
} 