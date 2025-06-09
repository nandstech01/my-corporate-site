'use client';

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
import Footer from '../../src/components/common/Footer';
import Script from 'next/script';
import Breadcrumbs from '../components/common/Breadcrumbs';
import Orb from './Orb';
import './Orb.css';
import GradientText from './GradientText';
import './GradientText.css';

// クライアントコンポーネント
const ReskillPage = () => {
  const fadeInProps = useSpring({ from: { opacity: 0 }, to: { opacity: 1 }, delay: 200 });
  const slideInProps = useSpring({ from: { opacity: 0, transform: 'translateY(-20px)' }, to: { opacity: 1, transform: 'translateY(0)' }, delay: 400 });

  // 構造化データ
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Course",
      "name": "AI時代のリスキリング研修プログラム",
      "description": "2025年に向けた個人向けAIリスキリング研修。ChatGPTなどの生成AIを活用したスキルアップ、キャリアアップを支援します。実践的なカリキュラムでAI時代に必須のスキルを習得できます。",
      "courseCode": "NANDS-AI-RESKILL-2025",
      "educationalLevel": "Beginner to Intermediate",
      "teaches": [
        "ChatGPT活用スキル",
        "プロンプトエンジニアリング",
        "生成AI実践活用",
        "AIツール統合",
        "デジタル変革対応",
        "キャリアアップ戦略"
      ],
      "provider": {
        "@type": "Organization",
        "name": "株式会社エヌアンドエス",
        "sameAs": "https://nands.tech",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "皇子が丘2丁目10番25-3004号",
          "addressLocality": "大津市",
          "addressRegion": "滋賀県",
          "postalCode": "520-0025",
          "addressCountry": "JP"
        }
      },
      "offers": {
        "@type": "Offer",
        "name": "個人向けAIリスキリング研修",
        "category": "教育・研修サービス",
        "availability": "https://schema.org/InStock",
        "priceCurrency": "JPY",
        "priceValidUntil": "2025-12-31",
        "eligibleRegion": "JP",
        "businessFunction": "https://schema.org/Sell"
      },
             "hasCourseInstance": [
                  {
           "@type": "CourseInstance",
           "name": "2025年春期AIリスキリング研修",
           "description": "ChatGPTと生成AIを活用した実践的なリスキリング研修プログラム",
           "courseMode": "OnlineOnly",
           "startDate": "2025-01-15",
           "endDate": "2025-04-15",
           "duration": "P3M",
           "instructor": [
             {
               "@type": "Person",
               "name": "エヌアンドエス認定メンター",
               "jobTitle": "AIリスキリング専門講師",
               "worksFor": {
                 "@type": "Organization",
                 "name": "株式会社エヌアンドエス"
               }
             }
           ],
           "location": {
             "@type": "VirtualLocation",
             "name": "オンライン研修プラットフォーム",
             "url": "https://nands.tech/reskilling"
           },
           "offers": {
             "@type": "Offer",
             "name": "個人向けAIリスキリング研修プログラム",
             "price": "応相談", 
             "priceCurrency": "JPY",
             "availability": "https://schema.org/InStock",
             "validFrom": "2024-12-01",
             "validThrough": "2025-01-14",
             "category": "教育・研修サービス"
           }
         }
       ],
      "audience": {
        "@type": "EducationalAudience",
        "educationalRole": "Professional",
        "audienceType": "Working Professionals"
      },
      "about": [
        "人工知能",
        "機械学習",
        "生成AI",
        "ChatGPT",
        "プロンプトエンジニアリング",
        "デジタル変革",
        "キャリア開発"
      ]
    }
  ];

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
      <div style={{ width: '100%', height: '600px', position: 'relative', marginBottom: '2rem' }}>
        <Orb
          hoverIntensity={0.5}
          rotateOnHover={true}
          hue={0}
          forceHoverState={false}
        />
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white pointer-events-none">
          <animated.div style={fadeInProps} className="flex flex-col items-center justify-center">
            {/* Mobile H1 */}
            <h1 className="text-3xl font-bold mb-4 text-center px-4 sm:hidden">
              <GradientText
                  colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
                  animationSpeed={4}
                  showBorder={false}
              >
                  AI時代のスキルを習得<br />リスキリングプログラム
              </GradientText>
            </h1>
            {/* Desktop H1 */}
            <h1 className="hidden sm:block text-5xl font-bold mb-4 text-center px-4">
               <GradientText
                  colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
                  animationSpeed={4}
                  showBorder={false}
              >
                  AI時代のスキルを習得！個人向けリスキリングプログラム
              </GradientText>
            </h1>
            {/* Mobile H2 */}
            <h2 className="text-xl font-bold text-center px-4 sm:hidden">
               <GradientText
                  colors={["#ffae40", "#ff4079", "#ae40ff", "#ffae40"]}
                  animationSpeed={6}
                  showBorder={false}
                >
                   ChatGPT活用で未来を切り拓く<br />キャリアアップ支援
               </GradientText>
            </h2>
            {/* Desktop H2 */}
            <h2 className="hidden sm:block text-3xl font-bold text-center px-4">
               <GradientText
                  colors={["#ffae40", "#ff4079", "#ae40ff", "#ffae40"]}
                  animationSpeed={6}
                  showBorder={false}
                >
                   ChatGPT活用で未来を切り拓くキャリアアップ支援
               </GradientText>
            </h2>
          </animated.div>
        </div>
      </div>

      {/* <RefinedCourseDates /> */}
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
