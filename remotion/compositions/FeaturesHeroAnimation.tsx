import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FeaturesHeroBg } from './components/FeaturesHeroBg';
import { FeaturesHeroText } from './components/FeaturesHeroText';
import { FeaturesHeroProps } from '../types/constants';

export const FeaturesHeroAnimation: React.FC<FeaturesHeroProps> = ({ isDark }) => {
  return (
    <AbsoluteFill>
      <FeaturesHeroBg isDark={isDark} />
      <FeaturesHeroText isDark={isDark} />
    </AbsoluteFill>
  );
};
