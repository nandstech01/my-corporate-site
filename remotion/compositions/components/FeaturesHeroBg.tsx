import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { COLORS } from '../../types/constants';

interface FeaturesHeroBgProps {
  isDark: boolean;
}

export const FeaturesHeroBg: React.FC<FeaturesHeroBgProps> = ({ isDark }) => {
  const frame = useCurrentFrame();

  // Subtle background animation - rotating gradient (same as main hero)
  const rotation = interpolate(frame, [0, 180], [0, 360], {
    extrapolateRight: 'extend',
  });

  const bgColor = isDark ? COLORS.dark.bg : COLORS.light.bg;
  const gradientColor1 = isDark ? 'rgba(37, 99, 235, 0.12)' : 'rgba(37, 99, 235, 0.08)';
  const gradientColor2 = isDark ? 'rgba(6, 182, 212, 0.1)' : 'rgba(6, 182, 212, 0.06)';

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bgColor,
        overflow: 'hidden',
      }}
    >
      {/* Rotating gradient orbs - simple and elegant */}
      <div
        style={{
          position: 'absolute',
          width: '120%',
          height: '120%',
          top: '-10%',
          left: '-10%',
          transform: `rotate(${rotation}deg)`,
          transformOrigin: 'center center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '5%',
            right: '15%',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: gradientColor1,
            filter: 'blur(100px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
            left: '20%',
            width: 350,
            height: 350,
            borderRadius: '50%',
            background: gradientColor2,
            filter: 'blur(100px)',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
