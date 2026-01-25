import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { ClaviHeroProps, COLORS } from '../types/constants';
import { JsonCodeBlock } from './components/JsonCodeBlock';
import { ValidationCheck } from './components/ValidationCheck';

// 3 seconds = 90 frames @30fps
// Structured data animation only, then fades out

export const HeroBackgroundAnimation: React.FC<ClaviHeroProps> = ({ isDark }) => {
  const frame = useCurrentFrame();
  const bgColor = isDark ? COLORS.dark.bg : COLORS.light.bg;

  // Fade out at the end (frames 60-90)
  const fadeOut = interpolate(frame, [60, 90], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ background: bgColor, opacity: fadeOut }}>
      {/* 3x larger scale for the entire animation */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) scale(3)',
          transformOrigin: 'center center',
        }}
      >
        <StructuredDataScene isDark={isDark} />
      </div>
    </AbsoluteFill>
  );
};

// Scene 1: Structured Data (compressed timeline for 3 seconds)
const StructuredDataScene: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  return (
    <div style={{ position: 'relative', width: 400, height: 400 }}>
      {/* JSON Code Block typing animation - starts immediately */}
      <JsonCodeBlock isDark={isDark} startFrame={0} />

      {/* Validation check - appears quickly */}
      <ValidationCheck isDark={isDark} startFrame={50} />
    </div>
  );
};
