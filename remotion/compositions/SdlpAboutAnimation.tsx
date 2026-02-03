import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { SdlpAboutProps, SDLP_ABOUT_COLORS } from '../types/constants';
import { AiBrainNetwork } from './components/AiBrainNetwork';
import { CostComparisonBars } from './components/CostComparisonBars';
import { AgileSprintBoard } from './components/AgileSprintBoard';
import { SupportShield } from './components/SupportShield';

// 4 scenes across 300 frames (10 seconds @ 30fps)
// Scene 1: AI Brain Network  (0–80)    15-frame crossfade overlap
// Scene 2: Cost Bars         (65–155)   15-frame crossfade overlap
// Scene 3: Agile Board       (140–225)  15-frame crossfade overlap
// Scene 4: Support Shield    (210–300)  fades out at end for loop

export const SdlpAboutAnimation: React.FC<SdlpAboutProps> = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <Background frame={frame} />
      <Scene1 frame={frame} />
      <Scene2 frame={frame} />
      <Scene3 frame={frame} />
      <Scene4 frame={frame} />
    </AbsoluteFill>
  );
};

// --- Shared Background ---
const Background: React.FC<{ frame: number }> = ({ frame }) => {
  const rotation = interpolate(frame, [0, 300], [0, 180], {
    extrapolateRight: 'extend',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: SDLP_ABOUT_COLORS.bg.dark,
        overflow: 'hidden',
      }}
    >
      {/* Grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(37, 99, 235, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(37, 99, 235, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
        }}
      />

      {/* Gradient orbs */}
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
            top: '15%',
            right: '20%',
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: `rgba(37, 99, 235, 0.08)`,
            filter: 'blur(60px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '15%',
            left: '15%',
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: `rgba(6, 182, 212, 0.06)`,
            filter: 'blur(60px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: `rgba(139, 92, 246, 0.05)`,
            filter: 'blur(50px)',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// --- Scene 1: AI Brain Network (frames 0–80) ---
const Scene1: React.FC<{ frame: number }> = ({ frame }) => {
  const fadeIn = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const fadeOut = interpolate(frame, [65, 80], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  if (frame > 85) return null;

  return <AiBrainNetwork frame={frame} opacity={fadeIn * fadeOut} />;
};

// --- Scene 2: Cost Comparison (frames 65–155) ---
const Scene2: React.FC<{ frame: number }> = ({ frame }) => {
  const fadeIn = interpolate(frame, [65, 80], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const fadeOut = interpolate(frame, [140, 155], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  if (frame < 60 || frame > 160) return null;

  const localFrame = frame - 65;
  return <CostComparisonBars frame={localFrame} opacity={fadeIn * fadeOut} />;
};

// --- Scene 3: Agile Board (frames 140–225) ---
const Scene3: React.FC<{ frame: number }> = ({ frame }) => {
  const fadeIn = interpolate(frame, [140, 155], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const fadeOut = interpolate(frame, [210, 225], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  if (frame < 135 || frame > 230) return null;

  const localFrame = frame - 140;
  return <AgileSprintBoard frame={localFrame} opacity={fadeIn * fadeOut} />;
};

// --- Scene 4: Support Shield (frames 210–300) ---
const Scene4: React.FC<{ frame: number }> = ({ frame }) => {
  const fadeIn = interpolate(frame, [210, 225], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Fade out at end for seamless loop back to scene 1
  const fadeOut = interpolate(frame, [285, 300], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  if (frame < 205) return null;

  const localFrame = frame - 210;
  return <SupportShield frame={localFrame} opacity={fadeIn * fadeOut} />;
};
