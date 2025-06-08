"use client";

import React from "react";
import dynamic from 'next/dynamic';
import Squares from './Squares';
import Masonry from './Masonry';

// ギャラリーアイテムの定義
const GALLERY_ITEMS = [
  {
    id: "manufacturing",
    image: "/images/industries/manufacturing.jpg",
    link: "/categories/manufacturing",
    alt: "製造業",
    height: 300
  },
  {
    id: "finance",
    image: "/images/industries/finance.jpg",
    link: "/categories/finance",
    alt: "金融",
    height: 400
  },
  {
    id: "medical-care",
    image: "/images/industries/medical-care.jpg",
    link: "/categories/medical-care",
    alt: "医療・ヘルスケア",
    height: 300
  },
  {
    id: "retail",
    image: "/images/industries/retail.jpg",
    link: "/categories/retail",
    alt: "小売・流通",
    height: 350
  },
  {
    id: "construction",
    image: "/images/industries/construction.jpg",
    link: "/categories/construction",
    alt: "建設・不動産",
    height: 300
  },
  {
    id: "it-software",
    image: "/images/industries/it-software.jpg",
    link: "/categories/it-software",
    alt: "IT・ソフトウェア",
    height: 400
  },
  {
    id: "logistics",
    image: "/images/industries/logistics.jpg",
    link: "/categories/logistics",
    alt: "物流",
    height: 350
  },
  {
    id: "government",
    image: "/images/industries/government.jpg",
    link: "/categories/government",
    alt: "官公庁・自治体",
    height: 300
  },
  {
    id: "hr-service",
    image: "/images/industries/hr-service.jpg",
    link: "/categories/hr-service",
    alt: "人材サービス",
    height: 400
  },
  {
    id: "marketing",
    image: "/images/industries/marketing.jpg",
    link: "/categories/marketing",
    alt: "マーケティング",
    height: 350
  }
];

const HeroSection = () => {
  const scrollToConsultation = () => {
    const consultationSection = document.getElementById('consultation-section');
    if (consultationSection) {
      consultationSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden bg-black">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70 z-[1]" />

      {/* Animated squares background - CSR only */}
      <div className="absolute inset-0 z-[2]">
        <Squares 
          speed={0.4} 
          squareSize={45}
          direction='diagonal'
          borderColor='rgba(255, 255, 255, 0.15)'
          hoverFillColor='rgba(255, 255, 255, 0.08)'
        />
      </div>

      {/* SEO重要部分（SSR対応） */}
      <div className="relative z-10 container mx-auto px-4 text-center pt-32 md:pt-40">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
          Corporate Solutions
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
          ビジネスの成長を加速させる、最先端のソリューションを提供します
        </p>
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          <button
            onClick={scrollToConsultation}
            className="px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm transition-all duration-300 group"
            type="button"
          >
            <span className="relative z-10 flex items-center text-white/90 text-lg">
              無料相談はこちら
              <svg
                className="w-4 h-4 ml-2 transform transition-transform group-hover:translate-y-1 opacity-70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </span>
          </button>
        </div>

        {/* Masonry gallery below the button */}
        <div className="flex justify-center w-full pt-12 px-0 sm:px-2">
          <Masonry 
            items={GALLERY_ITEMS.map(item => ({
              id: item.id,
              image: item.image,
              slug: item.link.replace('/categories/', ''),
              height: item.height,
              text: item.alt,
              width: 280 // デフォルト幅
            }))} 
            columnWidth={230}
            gap={16}
            maxColumns={4}
            maxContentWidth={1050}
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

