import type { Metadata } from 'next';

// コンポーネントを直接インポート
import SeoHero from './components/SeoHero';
import SeoProblems from './components/SeoProblems';
import SeoMerits from './components/SeoMerits';
import SeoSubsidy from './components/SeoSubsidy';
import SeoFlow from './components/SeoFlow';
import ContactForm from '@/components/common/ContactForm';

export const metadata: Metadata = {
  title: '助成金活用SEO支援サービス | 株式会社エヌアンドエス',
  description: '助成金を活用したSEO対策を80%補助で実施！最先端のSEOサービスで、あなたのビジネスの成長をサポートします。',
};

export default function SeoSupportPage() {
  return (
    <main className="pt-16">
      <SeoHero />
      <SeoProblems />
      <SeoMerits />
      <SeoSubsidy />
      <SeoFlow />
      <ContactForm />
    </main>
  );
} 