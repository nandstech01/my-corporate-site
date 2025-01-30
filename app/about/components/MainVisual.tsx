import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { AnimationConfig } from '../types';

interface MainVisualProps {
  animations: AnimationConfig;
}

const MainVisual: React.FC<MainVisualProps> = ({ animations }) => {
  return (
    <div className="relative h-screen bg-black">
      <motion.div
        variants={animations.headerParallax}
        initial="initial"
        animate="animate"
        className="absolute inset-0"
      >
        <Image
          src="/images/company.jpg"
          alt="NANDS office"
          fill
          className="object-cover opacity-70 mix-blend-overlay"
          priority
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50" />
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.5 }}
        className="relative z-20 h-full flex items-center justify-center text-white"
      >
        <div className="text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="text-6xl md:text-7xl font-bold mb-6 tracking-tight"
          >
            NANDS
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="text-xl md:text-2xl tracking-widest"
          >
            NEXT SOLUTIONS
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export default MainVisual; 