'use client';

import { Player } from '@remotion/player';
import { SdlpHeroAnimation } from '@/remotion/compositions/SdlpHeroAnimation';
import { SDLP_HERO_CONFIG } from '@/remotion/types/constants';

export function SdlpHeroPlayer() {
  return (
    <Player
      component={SdlpHeroAnimation}
      inputProps={{ isDark: true }}
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
