'use client';

import React, { useEffect, useState } from 'react';
import { useSpring, animated } from '@react-spring/web';
import FukugyoHero from './components/FukugyoHero';
import FukugyoProblems from './components/FukugyoProblems';
import FukugyoMerits from './components/FukugyoMerits';
import FukugyoFlow from './components/FukugyoFlow';
import ContactForm from '@/components/common/ContactForm';
import BuzzWordSuccessSection from './components/BuzzWordSuccessSection';
import BuzzWordToolSection from './components/BuzzWordToolSection';

export default function FukugyoPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: {
      tension: 120,
      friction: 14,
    },
  });

  if (!isClient) {
    return null;
  }

  return (
    <animated.div style={fadeIn} className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <FukugyoHero />
        <FukugyoProblems />
        <FukugyoMerits />
        <FukugyoFlow />
        <BuzzWordToolSection />
        <BuzzWordSuccessSection />
        <ContactForm />
      </div>
    </animated.div>
  );
} 