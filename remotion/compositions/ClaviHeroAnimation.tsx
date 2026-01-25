import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { ClaviHeroProps, SCENE_COLORS } from '../types/constants';
import { GradientBg } from './components/GradientBg';
import { ClaviLogo } from './components/ClaviLogo';
import { AiOrbitIcon } from './components/AiOrbitIcon';
import { ConnectionLines } from './components/ConnectionLines';

// Phase timings: 12 seconds = 360 frames @30fps
// Phase A: AI Orbit (frames 0-180)
// Phase B: SNS Flow (frames 180-360)
const PHASE_A = { start: 0, end: 180 };
const PHASE_B = { start: 180, end: 360 };

export const ClaviHeroAnimation: React.FC<ClaviHeroProps> = ({ isDark }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      {/* Background */}
      <GradientBg isDark={isDark} />

      {/* Phase A: AI Orbit Scene */}
      <AiOrbitScene isDark={isDark} frame={frame} />

      {/* Phase B: SNS Flow Scene */}
      <SnsFlowScene isDark={isDark} frame={frame} />

      {/* Central logo (always visible) */}
      <ClaviLogo isDark={isDark} />
    </AbsoluteFill>
  );
};

// Phase A: AI Orbit Scene (frames 0-180)
const AiOrbitScene: React.FC<{ isDark: boolean; frame: number }> = ({ isDark, frame }) => {
  // Fade out AI icons as we transition to Phase B
  const opacity = interpolate(frame, [150, 180], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{ opacity }}>
      {/* Connection lines (rendered before icons for layering) */}
      <ConnectionLines isDark={isDark} />

      {/* AI Icons orbiting */}
      <AiOrbitIcon
        isDark={isDark}
        aiType="chatgpt"
        orbitRadius={220}
        startAngle={0}
        orbitSpeed={0.8}
        enterDelay={15}
      />
      <AiOrbitIcon
        isDark={isDark}
        aiType="gemini"
        orbitRadius={220}
        startAngle={120}
        orbitSpeed={0.8}
        enterDelay={30}
      />
      <AiOrbitIcon
        isDark={isDark}
        aiType="perplexity"
        orbitRadius={220}
        startAngle={240}
        orbitSpeed={0.8}
        enterDelay={45}
      />
    </div>
  );
};

// Phase B: SNS Flow Scene (frames 180-360)
const SnsFlowScene: React.FC<{ isDark: boolean; frame: number }> = ({ isDark, frame }) => {
  // Fade in as we enter Phase B
  const opacity = interpolate(frame, [180, 210], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Fade out at end for seamless loop
  const fadeOut = interpolate(frame, [330, 360], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const sceneStart = 180;
  const distance = 200;

  return (
    <div style={{ opacity: opacity * fadeOut }}>
      {/* SNS Icons in 4 directions */}
      <SnsOrbitIcon
        isDark={isDark}
        platform="youtube"
        startFrame={sceneStart + 10}
        activeFrame={sceneStart + 70}
        angle={-45} // Top-right
        distance={distance}
      />
      <SnsOrbitIcon
        isDark={isDark}
        platform="linkedin"
        startFrame={sceneStart + 20}
        activeFrame={sceneStart + 90}
        angle={45} // Bottom-right
        distance={distance}
      />
      <SnsOrbitIcon
        isDark={isDark}
        platform="x"
        startFrame={sceneStart + 30}
        activeFrame={sceneStart + 110}
        angle={135} // Bottom-left
        distance={distance}
      />
      <SnsOrbitIcon
        isDark={isDark}
        platform="instagram"
        startFrame={sceneStart + 40}
        activeFrame={sceneStart + 130}
        angle={-135} // Top-left
        distance={distance}
      />

      {/* Flow particles from center to each SNS */}
      {[0, 1, 2].map((wave) => (
        <SnsFlowParticle
          key={`youtube-${wave}`}
          isDark={isDark}
          startFrame={sceneStart + 60}
          endFrame={sceneStart + 140}
          targetAngle={-45}
          distance={distance - 32}
          color={SCENE_COLORS.sns.youtube}
          delay={wave * 15}
        />
      ))}
      {[0, 1, 2].map((wave) => (
        <SnsFlowParticle
          key={`linkedin-${wave}`}
          isDark={isDark}
          startFrame={sceneStart + 60}
          endFrame={sceneStart + 140}
          targetAngle={45}
          distance={distance - 32}
          color={SCENE_COLORS.sns.linkedin}
          delay={wave * 15 + 5}
        />
      ))}
      {[0, 1, 2].map((wave) => (
        <SnsFlowParticle
          key={`x-${wave}`}
          isDark={isDark}
          startFrame={sceneStart + 60}
          endFrame={sceneStart + 140}
          targetAngle={135}
          distance={distance - 32}
          color="#000000"
          delay={wave * 15 + 10}
        />
      ))}
      {[0, 1, 2].map((wave) => (
        <SnsFlowParticle
          key={`instagram-${wave}`}
          isDark={isDark}
          startFrame={sceneStart + 60}
          endFrame={sceneStart + 140}
          targetAngle={-135}
          distance={distance - 32}
          color={SCENE_COLORS.sns.instagram}
          delay={wave * 15 + 15}
        />
      ))}
    </div>
  );
};

// SNS Icon Component (similar to SnsIcon but adapted for orbit position)
interface SnsOrbitIconProps {
  isDark: boolean;
  platform: 'youtube' | 'instagram' | 'linkedin' | 'x';
  startFrame: number;
  activeFrame: number;
  angle: number;
  distance: number;
}

const SNS_CONFIG = {
  youtube: {
    color: SCENE_COLORS.sns.youtube,
    icon: (
      <svg width="56" height="56" viewBox="0 0 24 24" fill="white">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  instagram: {
    color: SCENE_COLORS.sns.instagram,
    icon: (
      <svg width="56" height="56" viewBox="0 0 24 24" fill="white">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  linkedin: {
    color: SCENE_COLORS.sns.linkedin,
    icon: (
      <svg width="56" height="56" viewBox="0 0 24 24" fill="white">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  x: {
    color: '#000000',
    icon: (
      <svg width="56" height="56" viewBox="0 0 24 24" fill="white">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
};

const SnsOrbitIcon: React.FC<SnsOrbitIconProps> = ({
  isDark,
  platform,
  startFrame,
  activeFrame,
  angle,
  distance,
}) => {
  const frame = useCurrentFrame();
  const config = SNS_CONFIG[platform];

  const localFrame = frame - startFrame;
  const activeLocalFrame = frame - activeFrame;

  if (localFrame < 0) return null;

  // Calculate position
  const angleRad = (angle * Math.PI) / 180;
  const x = Math.cos(angleRad) * distance;
  const y = Math.sin(angleRad) * distance;

  // Entrance animation
  const entranceScale = interpolate(localFrame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Active pulse
  const isActive = activeLocalFrame >= 0;
  const activeScale = isActive
    ? interpolate(activeLocalFrame, [0, 10, 30], [1, 1.15, 1.05], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  const glowIntensity = isActive
    ? interpolate(activeLocalFrame, [0, 20, 60], [0, 1, 0.6], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  const opacity = interpolate(localFrame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scale = entranceScale * activeScale;
  const bgColor = isDark ? '#1E293B' : '#FFFFFF';
  const borderColor = isActive ? config.color : isDark ? '#334155' : '#E2E8F0';

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${scale})`,
        opacity,
      }}
    >
      <div
        style={{
          width: 128,
          height: 128,
          borderRadius: 32,
          background: bgColor,
          border: `3px solid ${borderColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isActive
            ? `0 0 ${20 + glowIntensity * 30}px ${config.color}${Math.round(glowIntensity * 100).toString(16).padStart(2, '0')}`
            : isDark
              ? '0 8px 24px rgba(0, 0, 0, 0.4)'
              : '0 8px 24px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: 20,
            background: config.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {config.icon}
        </div>
      </div>
    </div>
  );
};

// Flow Particle Component
interface SnsFlowParticleProps {
  isDark: boolean;
  startFrame: number;
  endFrame: number;
  targetAngle: number;
  distance: number;
  color: string;
  delay: number;
}

const SnsFlowParticle: React.FC<SnsFlowParticleProps> = ({
  startFrame,
  endFrame,
  targetAngle,
  distance,
  color,
  delay,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame - delay;
  const duration = endFrame - startFrame - delay;

  if (localFrame < 0 || localFrame > duration) return null;

  // Progress along path
  const progress = interpolate(localFrame, [0, duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Easing for natural movement
  const easedProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out

  // Calculate position
  const angleRad = (targetAngle * Math.PI) / 180;
  const currentDistance = easedProgress * distance;
  const x = Math.cos(angleRad) * currentDistance;
  const y = Math.sin(angleRad) * currentDistance;

  // Fade in/out
  const opacity = interpolate(
    progress,
    [0, 0.1, 0.8, 1],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // Trail effect
  const trailOpacity = interpolate(progress, [0, 0.5, 1], [0.3, 0.6, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <>
      {/* Main particle */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: color,
          transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
          opacity,
          boxShadow: `0 0 12px ${color}`,
        }}
      />
      {/* Trail particles */}
      {[0.15, 0.3].map((trailDelay, i) => {
        const trailProgress = Math.max(0, easedProgress - trailDelay);
        const trailX = Math.cos(angleRad) * (trailProgress * distance);
        const trailY = Math.sin(angleRad) * (trailProgress * distance);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 5 - i,
              height: 5 - i,
              borderRadius: '50%',
              background: color,
              transform: `translate(calc(-50% + ${trailX}px), calc(-50% + ${trailY}px))`,
              opacity: trailOpacity * (1 - i * 0.3),
            }}
          />
        );
      })}
    </>
  );
};
