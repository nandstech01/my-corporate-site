'use client';

import { Player } from '@remotion/player';
import { SdlpComparisonAnimation } from '@/remotion/compositions/SdlpComparisonAnimation';
import { SDLP_COMPARISON_CONFIG } from '@/remotion/types/constants';

export function SdlpComparisonPlayerInner() {
  return (
    <Player
      component={SdlpComparisonAnimation}
      inputProps={{ isDark: true }}
      durationInFrames={SDLP_COMPARISON_CONFIG.DURATION}
      fps={SDLP_COMPARISON_CONFIG.FPS}
      compositionWidth={SDLP_COMPARISON_CONFIG.WIDTH}
      compositionHeight={SDLP_COMPARISON_CONFIG.HEIGHT}
      style={{
        width: '100%',
        borderRadius: '0.75rem',
        aspectRatio: `${SDLP_COMPARISON_CONFIG.WIDTH}/${SDLP_COMPARISON_CONFIG.HEIGHT}`,
      }}
      autoPlay
      loop
      acknowledgeRemotionLicense
    />
  );
}
