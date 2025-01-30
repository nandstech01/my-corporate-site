import { AnimationConfig } from './types';

const PHI = (1 + Math.sqrt(5)) / 2;

export const getAnimationConfig = (): AnimationConfig => {
  const sectionSpacing = "py-20 md:py-32";
  const cardSpacing = "p-8 md:p-10";
  const cardStyle = `
    relative z-10 bg-white/95 backdrop-blur-md rounded-2xl
    shadow-[0_4px_20px_rgba(0,0,0,0.06)]
    transition-all duration-700
    group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)]
    border border-black/5
  `;

  const cardHover = {
    rest: { 
      scale: 1,
      transition: { 
        duration: 0.8 / PHI,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    hover: { 
      scale: 1 + (1 / (PHI * PHI)),
      transition: { 
        duration: 0.8 / PHI,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const headerParallax = {
    initial: { scale: 1.1 },
    animate: { 
      scale: 1,
      transition: {
        duration: 1.5,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const fadeIn = {
    initial: { opacity: 0, y: 30 / PHI },
    animate: { opacity: 1, y: 0 },
    transition: { 
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1]
    }
  };

  const sectionGap = Math.round(100 / PHI);
  const elementGap = Math.round(sectionGap / PHI);

  return {
    sectionSpacing,
    cardSpacing,
    cardStyle,
    cardHover,
    headerParallax,
    fadeIn,
    sectionGap,
    elementGap
  };
};

export { PHI }; 