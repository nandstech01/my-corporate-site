'use client';

import { Player } from '@remotion/player';
import { SdlpAboutAnimation } from '@/remotion/compositions/SdlpAboutAnimation';
import { SDLP_ABOUT_CONFIG } from '@/remotion/types/constants';

export function SdlpAboutPlayerInner() {
  return (
    <Player
      component={SdlpAboutAnimation}
      inputProps={{ isDark: true }}
      durationInFrames={SDLP_ABOUT_CONFIG.DURATION}
      fps={SDLP_ABOUT_CONFIG.FPS}
      compositionWidth={SDLP_ABOUT_CONFIG.WIDTH}
      compositionHeight={SDLP_ABOUT_CONFIG.HEIGHT}
      style={{
        width: '100%',
        borderRadius: '0.75rem',
        aspectRatio: `${SDLP_ABOUT_CONFIG.WIDTH}/${SDLP_ABOUT_CONFIG.HEIGHT}`,
      }}
      autoPlay
      loop
      acknowledgeRemotionLicense
    />
  );
}
