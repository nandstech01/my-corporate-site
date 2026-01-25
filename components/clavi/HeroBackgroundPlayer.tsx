'use client';

import { Player } from '@remotion/player';
import { useClaviTheme } from '@/app/clavi/context';
import { HeroBackgroundAnimation } from '@/remotion/compositions/HeroBackgroundAnimation';
import { HERO_BG_CONFIG } from '@/remotion/types/constants';

export function HeroBackgroundPlayer() {
  const { theme } = useClaviTheme();
  const isDark = theme === 'dark';

  return (
    <Player
      key={theme}
      component={HeroBackgroundAnimation}
      inputProps={{ isDark }}
      durationInFrames={HERO_BG_CONFIG.DURATION}
      fps={HERO_BG_CONFIG.FPS}
      compositionWidth={HERO_BG_CONFIG.WIDTH}
      compositionHeight={HERO_BG_CONFIG.HEIGHT}
      style={{
        width: '100%',
        height: '100%',
      }}
      autoPlay
      loop={false}
    />
  );
}
