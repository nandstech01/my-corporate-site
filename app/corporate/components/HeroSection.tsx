'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';

export default function HeroSection() {
  const [isClient, setIsClient] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    setIsClient(true);
    mountedRef.current = true;

    const timer = setTimeout(() => {
      if (mountedRef.current) {
        setIsVisible(true);
      }
    }, 100);

    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
    };
  }, []);

  const scrollToContact = useCallback(() => {
    const contactSection = document.querySelector('#contact-section');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <section className="relative h-[500px] md:h-[600px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-slate-900 to-blue-900">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/grid.svg')] opacity-5"></div>

        <div
          className={`absolute top-10 left-10 w-48 h-48 bg-blue-500 rounded-full filter blur-[100px] transition-all duration-1000 ease-out ${
            isVisible ? 'opacity-25 scale-100' : 'opacity-0 scale-50'
          }`}
          style={{ transitionDelay: '0ms' }}
        />
        <div
          className={`absolute top-[40%] right-20 w-72 h-72 bg-cyan-400 rounded-full filter blur-[120px] transition-all duration-1000 ease-out ${
            isVisible ? 'opacity-20 scale-100' : 'opacity-0 scale-50'
          }`}
          style={{ transitionDelay: '200ms' }}
        />
        <div
          className={`absolute bottom-20 left-1/3 w-56 h-56 bg-blue-300 rounded-full filter blur-[100px] transition-all duration-1000 ease-out ${
            isVisible ? 'opacity-20 scale-100' : 'opacity-0 scale-50'
          }`}
          style={{ transitionDelay: '400ms' }}
        />
      </div>

      <div
        className={`relative z-10 w-full max-w-4xl mx-auto px-4 flex flex-col items-center transition-all duration-700 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        style={{ transitionDelay: '600ms' }}
      >
        <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mt-8 md:mt-12 mb-6 text-center w-full">
          <span className="block text-blue-300 mb-4">NANDS</span>
          法人向け AI導入支援
        </h1>
        <p className="text-lg md:text-xl text-blue-100 mb-10 md:mb-12 text-center w-full">
          生成AIとChatGPT、AIエージェントを活用し、
          <br className="hidden md:block" />
          ビジネスの課題を包括的に解決！
        </p>

        <button
          onClick={scrollToContact}
          className="relative bg-blue-600 text-white py-3 px-8 rounded-full text-lg font-semibold hover:bg-blue-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg mb-8 md:mb-12"
        >
          無料相談はこちら
        </button>
      </div>
    </section>
  );
}
