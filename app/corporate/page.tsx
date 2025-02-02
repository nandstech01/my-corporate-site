"use client";

import React from "react";
import HeroSection from './components/HeroSection';
import LogosSection from './components/LogosSection';
// import NewsSection from './components/NewsSection';
import ServicesSection from './components/ServicesSection';
import CaseStudiesSection from './components/CaseStudiesSection';
import FeatureSection from './components/FeatureSection';
import FlowSection from './components/FlowSection';
import FaqSection from './components/FaqSection';
import ContactSection from './components/ContactSection';

export default function CorporatePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      {/* <NewsSection /> */}
      <ServicesSection />
      <FeatureSection />
      <CaseStudiesSection />
      <FlowSection />
      <FaqSection />
      <ContactSection />
    </main>
  );
}
