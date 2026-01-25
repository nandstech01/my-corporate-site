import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS } from '../../types/constants';

interface ClaviLogoProps {
  isDark: boolean;
}

export const ClaviLogo: React.FC<ClaviLogoProps> = ({ isDark }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Spring animation for logo entrance (frames 0-30)
  const logoScale = spring({
    frame,
    fps,
    config: {
      damping: 12,
      stiffness: 100,
      mass: 0.8,
    },
  });

  const logoOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Subtle pulse animation
  const pulseScale = interpolate(
    frame % 60,
    [0, 30, 60],
    [1, 1.03, 1],
    { extrapolateRight: 'clamp' }
  );

  const textColor = isDark ? COLORS.dark.text : COLORS.light.text;
  const glowColor = isDark ? 'rgba(37, 99, 235, 0.4)' : 'rgba(37, 99, 235, 0.2)';

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) scale(${logoScale * pulseScale})`,
        opacity: logoOpacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {/* Logo circle with gradient */}
      <div
        style={{
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 40px ${glowColor}`,
        }}
      >
        {/* Key icon */}
        <svg
          width="50"
          height="50"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
        </svg>
      </div>

      {/* CLAVI text */}
      <div
        style={{
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: 32,
          fontWeight: 900,
          letterSpacing: '0.1em',
          color: textColor,
        }}
      >
        CLAVI
      </div>
    </div>
  );
};
