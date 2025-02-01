'use client';

import React from 'react';
import { useSpring, animated } from '@react-spring/web';
import RefinedCourseDates from '@/components/RefinedCourseDates';
import SeminarBenefits from '@/components/SeminarBenefits';
import AboutNands from '@/components/AboutNands';
import CourseFeatures from '@/components/CourseFeatures';
import CourseList from '@/components/CourseList';
import WhyChooseDmmAiCamp from '@/components/WhyChooseDmmAiCamp';
import Testimonials from '@/components/Testimonials';
import MentorIntroduction from '@/components/MentorIntroduction';
import LearningPlans from '@/components/LearningPlans';
import SubsidyInformation from '@/components/SubsidyInformation';
import EnrollmentProcess from '@/components/EnrollmentProcess';
import EnhancedContactForm from '@/components/EnhancedContactForm';
import FixedButtons from '@/components/ui/FixedButtons';
import ConcernsSection from '@/components/common/ConcernsSection';
import AILaborMarketImpact from '@/components/AILaborMarketImpact';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import Footer from '@/components/common/Footer';

const Home: React.FC = () => {
  const fadeInProps = useSpring({ from: { opacity: 0 }, to: { opacity: 1 }, delay: 200 });
  const slideInProps = useSpring({ from: { opacity: 0, transform: 'translateY(-20px)' }, to: { opacity: 1, transform: 'translateY(0)' }, delay: 400 });

  return (
    <div className="flex flex-col">
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

export default Home;
