'use client';

import { Player } from '@remotion/player';
import { useClaviTheme } from '@/app/clavi/context';
import { ClaviHeroAnimation } from '@/remotion/compositions/ClaviHeroAnimation';
import { VIDEO_CONFIG } from '@/remotion/types/constants';

export function ClaviHeroPlayer() {
  const { theme } = useClaviTheme();
  const isDark = theme === 'dark';

  return (
    <Player
      key={theme}
      component={ClaviHeroAnimation}
      inputProps={{ isDark }}
      durationInFrames={VIDEO_CONFIG.DURATION}
      fps={VIDEO_CONFIG.FPS}
      compositionWidth={VIDEO_CONFIG.WIDTH}
      compositionHeight={VIDEO_CONFIG.HEIGHT}
      style={{
        width: '100%',
        borderRadius: '1rem',
        aspectRatio: `${VIDEO_CONFIG.WIDTH}/${VIDEO_CONFIG.HEIGHT}`,
      }}
      autoPlay
      loop
      acknowledgeRemotionLicense
    />
  );
}
