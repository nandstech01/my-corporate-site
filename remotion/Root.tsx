import { Composition } from 'remotion';
import { ClaviHeroAnimation } from './compositions/ClaviHeroAnimation';
import { HeroBackgroundAnimation } from './compositions/HeroBackgroundAnimation';
import { VIDEO_CONFIG, HERO_BG_CONFIG } from './types/constants';

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
    </>
  );
};
