'use client';

import { Player } from '@remotion/player';
import { useClaviTheme } from '@/app/clavi/context';
import { FeaturesHeroAnimation } from '@/remotion/compositions/FeaturesHeroAnimation';
import { FEATURES_HERO_CONFIG } from '@/remotion/types/constants';

export function FeaturesHeroPlayer() {
  const { theme } = useClaviTheme();
  const isDark = theme === 'dark';

  return (
    <Player
      key={theme}
      component={FeaturesHeroAnimation}
      inputProps={{ isDark }}
      durationInFrames={FEATURES_HERO_CONFIG.DURATION}
      fps={FEATURES_HERO_CONFIG.FPS}
      compositionWidth={FEATURES_HERO_CONFIG.WIDTH}
      compositionHeight={FEATURES_HERO_CONFIG.HEIGHT}
      style={{
        width: '100%',
        height: '100%',
      }}
      autoPlay
      loop
    />
  );
}
