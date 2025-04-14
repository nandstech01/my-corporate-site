'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import Lightning from './Lightning';

const GlitchText = ({ text }: { text: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !textRef.current) return;

    const container = containerRef.current;
    const textElement = textRef.current;
    const originalText = text;
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let interval: NodeJS.Timeout | null = null;

    const startGlitchEffect = () => {
      let iteration = 0;
      const maxIterations = 3;
      
      clearInterval(interval as NodeJS.Timeout);
      
      interval = setInterval(() => {
        textElement.innerText = originalText
          .split("")
          .map((letter, index) => {
            if (letter === " ") return letter;
            if (index < iteration) return originalText[index];
            return letters[Math.floor(Math.random() * 26)];
          })
          .join("");
        
        if (iteration >= originalText.length) {
          clearInterval(interval as NodeJS.Timeout);
          setTimeout(startGlitchEffect, 3000);
        }
        
        iteration += 1/3;
      }, 30);
    };

    startGlitchEffect();
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [text]);

  return (
    <div ref={containerRef} className="glitch-container">
      <div ref={textRef} className="glitch-text">
        {text}
      </div>
    </div>
  );
};

export default function FukugyoHero() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Lightning背景 */}
      <div className="absolute inset-0">
        <Lightning
          hue={220}
          xOffset={0}
          speed={0.8}
          intensity={1.2}
          size={1}
        />
      </div>

      {/* オーバーレイグラデーション */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.8,
          ease: "easeOut"
        }}
        className="relative z-30 text-center max-w-4xl mx-auto px-4"
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
          <GlitchText text="AI副業で" />
          <br className="md:hidden" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-200">
            <GlitchText text="新しい可能性" />
          </span>
          <GlitchText text="を見つけよう" />
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto"
        >
          AIを活用したスキルを身につけ、副業で収入を増やしませんか？<br />
          プロのエンジニアが、あなたのAI副業の第一歩をサポートします。
        </motion.p>
        <a
          href="https://lin.ee/gUyPhHa"
          className="neon-button group"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="relative z-10 flex items-center">
            無料セミナーに申し込む
            <svg
              className="w-5 h-5 ml-2 transform transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </span>
        </a>
      </motion.div>
    </section>
  );
} 