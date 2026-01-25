'use client';

import { motion, Variants } from 'framer-motion';
import { useClaviTheme } from '@/app/clavi/context';

interface TypewriterHeroProps {
  className?: string;
}

export function TypewriterHero({ className = '' }: TypewriterHeroProps) {
  const { theme } = useClaviTheme();
  const isDark = theme === 'dark';

  const line1 = 'AIに見つかるための';
  const line2 = '鍵-Key';
  const line3 = 'クラヴィ';

  // Main container - controls overall visibility
  const containerVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 60,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1.0,
        ease: [0.25, 0.46, 0.45, 0.94],
        when: 'beforeChildren',
        staggerChildren: 0.06,
        delayChildren: 0.5,
      },
    },
  };

  // Character variants for typewriter effect
  const charVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 10,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.1,
        ease: 'easeOut',
      },
    },
  };

  // Line 2 (鍵-Key) animation
  const line2Variants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
        delay: line1.length * 0.06 + 0.3,
      },
    },
  };

  // Line 3 (クラヴィ) animation
  const line3Variants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
        delay: line1.length * 0.06 + 0.8,
      },
    },
  };

  // Enhanced text shadow for better readability over background
  const textShadow = isDark
    ? '0 4px 20px rgba(0, 0, 0, 0.8), 0 2px 8px rgba(0, 0, 0, 0.6)'
    : '0 2px 10px rgba(255, 255, 255, 0.8), 0 1px 4px rgba(255, 255, 255, 0.6)';

  // Text color based on theme
  const textColor = isDark ? '#FFFFFF' : '#1E3A8A';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h1
        className={`text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-6 ${className}`}
        style={{
          color: textColor,
          textShadow,
        }}
      >
        {/* Line 1 - Typewriter effect */}
        <span className="inline-block">
          {line1.split('').map((char, index) => (
            <motion.span
              key={`line1-${index}`}
              variants={charVariants}
              className="inline-block"
              style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
            >
              {char}
            </motion.span>
          ))}
        </span>
        <br />

        {/* Line 2 - 鍵-Key (smaller) */}
        <motion.span
          variants={line2Variants}
          className="relative block text-center text-3xl sm:text-4xl lg:text-5xl mt-3"
          style={{ color: textColor }}
        >
          {line2}
        </motion.span>

        {/* Line 3 - クラヴィ (large, prominent) */}
        <motion.span
          variants={line3Variants}
          className="relative block text-center text-5xl sm:text-6xl lg:text-7xl mt-2"
          style={{ color: textColor }}
        >
          {line3}
        </motion.span>
      </h1>
    </motion.div>
  );
}
