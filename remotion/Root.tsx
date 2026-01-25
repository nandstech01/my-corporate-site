import React from 'react';
import { Composition } from 'remotion';
import { ClaviHeroAnimation } from './compositions/ClaviHeroAnimation';
import { HeroBackgroundAnimation } from './compositions/HeroBackgroundAnimation';
import { BeforeCodeAnimation } from './compositions/BeforeCodeAnimation';
import { AfterCodeAnimation } from './compositions/AfterCodeAnimation';
import { FeaturesHeroAnimation } from './compositions/FeaturesHeroAnimation';
import { VIDEO_CONFIG, HERO_BG_CONFIG, BEFORE_AFTER_CONFIG, FEATURES_HERO_CONFIG } from './types/constants';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* AI Orbit Animation (existing) */}
      <Composition
        id="ClaviHero"
        component={ClaviHeroAnimation}
        durationInFrames={VIDEO_CONFIG.DURATION}
        fps={VIDEO_CONFIG.FPS}
        width={VIDEO_CONFIG.WIDTH}
        height={VIDEO_CONFIG.HEIGHT}
        defaultProps={{
          isDark: false,
        }}
      />
      <Composition
        id="ClaviHeroDark"
        component={ClaviHeroAnimation}
        durationInFrames={VIDEO_CONFIG.DURATION}
        fps={VIDEO_CONFIG.FPS}
        width={VIDEO_CONFIG.WIDTH}
        height={VIDEO_CONFIG.HEIGHT}
        defaultProps={{
          isDark: true,
        }}
      />

      {/* Hero Background Animation (3 scenes) */}
      <Composition
        id="HeroBackground"
        component={HeroBackgroundAnimation}
        durationInFrames={HERO_BG_CONFIG.DURATION}
        fps={HERO_BG_CONFIG.FPS}
        width={HERO_BG_CONFIG.WIDTH}
        height={HERO_BG_CONFIG.HEIGHT}
        defaultProps={{
          isDark: false,
        }}
      />
      <Composition
        id="HeroBackgroundDark"
        component={HeroBackgroundAnimation}
        durationInFrames={HERO_BG_CONFIG.DURATION}
        fps={HERO_BG_CONFIG.FPS}
        width={HERO_BG_CONFIG.WIDTH}
        height={HERO_BG_CONFIG.HEIGHT}
        defaultProps={{
          isDark: true,
        }}
      />

      {/* Before/After Code Animations */}
      <Composition
        id="BeforeCode"
        component={BeforeCodeAnimation}
        durationInFrames={BEFORE_AFTER_CONFIG.DURATION}
        fps={BEFORE_AFTER_CONFIG.FPS}
        width={BEFORE_AFTER_CONFIG.WIDTH}
        height={BEFORE_AFTER_CONFIG.HEIGHT}
        defaultProps={{
          isDark: false,
        }}
      />
      <Composition
        id="BeforeCodeDark"
        component={BeforeCodeAnimation}
        durationInFrames={BEFORE_AFTER_CONFIG.DURATION}
        fps={BEFORE_AFTER_CONFIG.FPS}
        width={BEFORE_AFTER_CONFIG.WIDTH}
        height={BEFORE_AFTER_CONFIG.HEIGHT}
        defaultProps={{
          isDark: true,
        }}
      />
      <Composition
        id="AfterCode"
        component={AfterCodeAnimation}
        durationInFrames={BEFORE_AFTER_CONFIG.DURATION}
        fps={BEFORE_AFTER_CONFIG.FPS}
        width={BEFORE_AFTER_CONFIG.WIDTH}
        height={BEFORE_AFTER_CONFIG.HEIGHT}
        defaultProps={{
          isDark: false,
        }}
      />
      <Composition
        id="AfterCodeDark"
        component={AfterCodeAnimation}
        durationInFrames={BEFORE_AFTER_CONFIG.DURATION}
        fps={BEFORE_AFTER_CONFIG.FPS}
        width={BEFORE_AFTER_CONFIG.WIDTH}
        height={BEFORE_AFTER_CONFIG.HEIGHT}
        defaultProps={{
          isDark: true,
        }}
      />

      {/* Features Hero Animation */}
      <Composition
        id="FeaturesHero"
        component={FeaturesHeroAnimation}
        durationInFrames={FEATURES_HERO_CONFIG.DURATION}
        fps={FEATURES_HERO_CONFIG.FPS}
        width={FEATURES_HERO_CONFIG.WIDTH}
        height={FEATURES_HERO_CONFIG.HEIGHT}
        defaultProps={{
          isDark: false,
        }}
      />
      <Composition
        id="FeaturesHeroDark"
        component={FeaturesHeroAnimation}
        durationInFrames={FEATURES_HERO_CONFIG.DURATION}
        fps={FEATURES_HERO_CONFIG.FPS}
        width={FEATURES_HERO_CONFIG.WIDTH}
        height={FEATURES_HERO_CONFIG.HEIGHT}
        defaultProps={{
          isDark: true,
        }}
      />
    </>
  );
};
