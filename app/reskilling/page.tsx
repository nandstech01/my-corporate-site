import React from 'react';
import { useSpring, animated } from '@react-spring/web';
import RefinedCourseDates from '../../src/components/RefinedCourseDates';
import SeminarBenefits from '../../src/components/SeminarBenefits';
import AboutNands from '../../src/components/AboutNands';
import CourseFeatures from '../../src/components/CourseFeatures';
import CourseList from '../../src/components/CourseList';
import WhyChooseDmmAiCamp from '../../src/components/WhyChooseDmmAiCamp';
import Testimonials from '../../src/components/Testimonials';
import MentorIntroduction from '../../src/components/MentorIntroduction';
import LearningPlans from '../../src/components/LearningPlans';
import SubsidyInformation from '../../src/components/SubsidyInformation';
import EnrollmentProcess from '../../src/components/EnrollmentProcess';
import EnhancedContactForm from '../../src/components/EnhancedContactForm';
import FixedButtons from '../../src/components/ui/FixedButtons';
import ConcernsSection from '../../src/components/common/ConcernsSection';
import AILaborMarketImpact from '../../src/components/AILaborMarketImpact';
import Card, { CardContent, CardHeader, CardTitle } from '../../src/components/common/Card';
import Footer from '../../src/components/common/Footer';
import type { Metadata } from 'next';
import Script from 'next/script';
import Breadcrumbs from '../components/common/Breadcrumbs';

// メタデータの定義
export const metadata: Metadata = {
  title: 'AI時代のリスキリング研修・AI活用スキル習得 | 株式会社エヌアンドエス',
  description: '2025年に向けた個人向けAIリスキリング研修。ChatGPTなどの生成AIを活用したスキルアップ、キャリアアップを支援します。初心者でも安心して学べる実践的なカリキュラムで、AI時代に必須のスキルを習得できます。',
  keywords: 'リスキリング,AI研修,生成AI,ChatGPT,スキルアップ,キャリアアップ,AI教育,プロンプトエンジニアリング,2025年対策,個人向けAI研修',
  openGraph: {
    title: 'AI時代のリスキリング研修・AI活用スキル習得 | 株式会社エヌアンドエス',
    description: '2025年に向けた個人向けAIリスキリング研修。ChatGPTなどの生成AIを活用したスキルアップ、キャリアアップを支援します。初心者でも安心して学べる実践的なカリキュラムで、AI時代に必須のスキルを習得できます。',
    url: 'https://nands.tech/reskilling',
    siteName: '株式会社エヌアンドエス',
    images: ['/images/reskilling-ogp.jpg'],
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@nands_tech',
    creator: '@nands_tech',
  },
  alternates: {
    canonical: 'https://nands.tech/reskilling'
  },
}

// クライアントコンポーネント
const ReskillPage = () => {
  const fadeInProps = useSpring({ from: { opacity: 0 }, to: { opacity: 1 }, delay: 200 });
  const slideInProps = useSpring({ from: { opacity: 0, transform: 'translateY(-20px)' }, to: { opacity: 1, transform: 'translateY(0)' }, delay: 400 });

  // 構造化データ
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": "AI時代のリスキリング研修プログラム",
    "description": "2025年に向けた個人向けAIリスキリング研修。ChatGPTなどの生成AIを活用したスキルアップ、キャリアアップを支援します。",
    "provider": {
      "@type": "Organization",
      "name": "株式会社エヌアンドエス",
      "sameAs": "https://nands.tech"
    },
    "offers": {
      "@type": "Offer",
      "category": "個人向けAIリスキリング",
      "availability": "https://schema.org/InStock",
      "priceCurrency": "JPY"
    },
    "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": "online",
      "instructor": {
        "@type": "Person",
        "name": "エヌアンドエスメンター"
      }
    }
  };

  return (
    <div className="flex flex-col">
      <Script
        id="structured-data-reskilling"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="container mx-auto px-4">
        <Breadcrumbs customItems={[
          { name: 'ホーム', path: '/' },
          { name: 'リスキリング研修', path: '/reskilling' }
        ]} />
      </div>
      {/* ビデオセクション */}
      <div className="relative min-h-screen flex flex-col">
        <div className="absolute inset-0 z-0">
          <video 
            src="/images/background.mp4"
            autoPlay 
            muted 
            playsInline 
            className="w-full h-full object-cover"
            onEnded={(e) => e.currentTarget.pause()}
          />
        </div>
        <div className="relative z-10 flex flex-col min-h-screen text-black">
          <animated.div style={fadeInProps} className="flex flex-col items-center justify-center mt-32">
            <h1 className="text-xl sm:text-3xl font-bold mb-2">2025年</h1>
            <h2 className="text-xl sm:text-2xl font-bold">準備は万全ですか？</h2>
          </animated.div>
          <main className="flex-grow flex flex-col items-center justify-start p-2 space-y-4 text-center mt-4">
            <animated.h1 style={slideInProps} className="text-3xl md:text-4xl font-bold leading-tight">
              <br />
              <span className="text-4xl md:text-5xl"> </span>
            </animated.h1>
            <animated.p style={slideInProps} className="text-xl max-w-2xl">
              {/* テキストを追加 */}
            </animated.p>
          </main>
        </div>
      </div>

      <RefinedCourseDates />
      <SeminarBenefits />
      <AboutNands />
      <ConcernsSection />
      <AILaborMarketImpact />
      <CourseFeatures />
      <CourseList />
      <WhyChooseDmmAiCamp />
      <Testimonials />
      <MentorIntroduction />
      <SubsidyInformation />
      <EnrollmentProcess />
      <EnhancedContactForm />
      <FixedButtons />
      <Footer />
    </div>
  );
};

export default ReskillPage;
