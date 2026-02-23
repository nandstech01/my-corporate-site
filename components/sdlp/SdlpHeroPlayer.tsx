'use client';

import { Player } from '@remotion/player';
import { SdlpHeroAnimation } from '@/remotion/compositions/SdlpHeroAnimation';
import { SDLP_HERO_CONFIG } from '@/remotion/types/constants';
import { useSdlpTheme } from '@/app/(sdlp)/system-dev-lp/context';

export function SdlpHeroPlayer() {
  const { theme } = useSdlpTheme();
  const isDark = theme === 'dark';

  return (
    <Player
      key={theme}
      component={SdlpHeroAnimation}
      inputProps={{ isDark }}
      durationInFrames={SDLP_HERO_CONFIG.DURATION}
      fps={SDLP_HERO_CONFIG.FPS}
      compositionWidth={SDLP_HERO_CONFIG.WIDTH}
      compositionHeight={SDLP_HERO_CONFIG.HEIGHT}
      style={{
        width: '100%',
        borderRadius: '1rem',
        aspectRatio: `${SDLP_HERO_CONFIG.WIDTH}/${SDLP_HERO_CONFIG.HEIGHT}`,
      }}
      autoPlay
      loop
      acknowledgeRemotionLicense
    />
  );
}
