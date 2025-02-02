'use client';

import React from 'react';
import FukugyoHero from './components/FukugyoHero';
import FukugyoProblems from './components/FukugyoProblems';
import FukugyoMerits from './components/FukugyoMerits';
import FukugyoFlow from './components/FukugyoFlow';
import ContactForm from '../../components/common/ContactForm';
import BuzzWordSuccessSection from './components/BuzzWordSuccessSection';
import BuzzWordToolSection from './components/BuzzWordToolSection';

export default function FukugyoPage() {
  return (
    <main>
      <div className="min-h-screen">
        <FukugyoHero />
        <FukugyoProblems />
        <FukugyoMerits />
        <FukugyoFlow />
        <BuzzWordSuccessSection />
        <BuzzWordToolSection />
        <ContactForm />
      </div>
    </main>
  );
} 