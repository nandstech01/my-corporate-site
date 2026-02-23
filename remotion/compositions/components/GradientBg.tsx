import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { COLORS } from '../../types/constants';

interface GradientBgProps {
  isDark: boolean;
}

// Deterministic sparkle data generated from index
const SPARKLES = Array.from({ length: 10 }, (_, i) => ({
  x: ((i * 73 + 17) % 100), // pseudo-random x position (%)
  y: ((i * 47 + 31) % 100), // pseudo-random y position (%)
  size: 2 + (i % 3),        // 2-4px
  freqX: 0.02 + (i * 0.007),
  freqY: 0.03 + (i * 0.005),
  phaseX: i * 1.2,
  phaseY: i * 0.9,
  color: i % 3 === 0
    ? 'rgba(6, 182, 212, 0.3)'   // cyan
    : 'rgba(37, 99, 235, 0.3)',   // blue
  opacityFreq: 0.04 + (i * 0.006),
  opacityPhase: i * 0.7,
}));

export const GradientBg: React.FC<GradientBgProps> = ({ isDark }) => {
  const frame = useCurrentFrame();

  // Subtle background animation - rotating gradient
  const rotation = interpolate(frame, [0, 180], [0, 360], {
    extrapolateRight: 'extend',
  });

  const bgColor = isDark ? COLORS.dark.bg : COLORS.light.bg;
  const gradientColor1 = isDark ? 'rgba(37, 99, 235, 0.15)' : 'rgba(37, 99, 235, 0.1)';
  const gradientColor2 = isDark ? 'rgba(6, 182, 212, 0.15)' : 'rgba(6, 182, 212, 0.1)';

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bgColor,
        overflow: 'hidden',
      }}
    >
      {/* Rotating gradient orbs */}
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
            top: '10%',
            right: '10%',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: gradientColor1,
            filter: 'blur(80px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
            left: '10%',
            width: 250,
            height: 250,
            borderRadius: '50%',
            background: gradientColor2,
            filter: 'blur(80px)',
          }}
        />
      </div>

      {/* Ambient sparkle dots */}
      {SPARKLES.map((sparkle, i) => {
        const offsetX = Math.sin(frame * sparkle.freqX + sparkle.phaseX) * 8;
        const offsetY = Math.sin(frame * sparkle.freqY + sparkle.phaseY) * 6;
        const opacity = 0.1 + 0.3 * ((Math.sin(frame * sparkle.opacityFreq + sparkle.opacityPhase) + 1) / 2);

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${sparkle.x}%`,
              top: `${sparkle.y}%`,
              width: sparkle.size,
              height: sparkle.size,
              borderRadius: '50%',
              background: sparkle.color,
              opacity,
              transform: `translate(${offsetX}px, ${offsetY}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
