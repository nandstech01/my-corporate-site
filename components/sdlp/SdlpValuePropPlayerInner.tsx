'use client';

import { Player } from '@remotion/player';
import { SdlpValuePropAnimation } from '@/remotion/compositions/SdlpValuePropAnimation';
import { SDLP_VALUEPROP_CONFIG } from '@/remotion/types/constants';

export function SdlpValuePropPlayerInner() {
  return (
    <Player
      component={SdlpValuePropAnimation}
      inputProps={{ isDark: true }}
      durationInFrames={SDLP_VALUEPROP_CONFIG.DURATION}
      fps={SDLP_VALUEPROP_CONFIG.FPS}
      compositionWidth={SDLP_VALUEPROP_CONFIG.WIDTH}
      compositionHeight={SDLP_VALUEPROP_CONFIG.HEIGHT}
      style={{
        width: '100%',
        borderRadius: '0.75rem',
        aspectRatio: `${SDLP_VALUEPROP_CONFIG.WIDTH}/${SDLP_VALUEPROP_CONFIG.HEIGHT}`,
      }}
      autoPlay
      loop
      acknowledgeRemotionLicense
    />
  );
}
