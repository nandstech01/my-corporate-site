'use client';

import { Player } from '@remotion/player';
import { useClaviTheme } from '@/app/clavi/context';
import { BeforeCodeAnimation } from '@/remotion/compositions/BeforeCodeAnimation';
import { BEFORE_AFTER_CONFIG } from '@/remotion/types/constants';

export function BeforeCodePlayer() {
  const { theme } = useClaviTheme();
  const isDark = theme === 'dark';

  return (
    <Player
      key={theme}
      component={BeforeCodeAnimation}
      inputProps={{ isDark }}
      durationInFrames={BEFORE_AFTER_CONFIG.DURATION}
      fps={BEFORE_AFTER_CONFIG.FPS}
      compositionWidth={BEFORE_AFTER_CONFIG.WIDTH}
      compositionHeight={BEFORE_AFTER_CONFIG.HEIGHT}
      style={{
        width: '100%',
        borderRadius: '0.5rem',
        aspectRatio: `${BEFORE_AFTER_CONFIG.WIDTH}/${BEFORE_AFTER_CONFIG.HEIGHT}`,
      }}
      autoPlay
      loop
      acknowledgeRemotionLicense
    />
  );
}
