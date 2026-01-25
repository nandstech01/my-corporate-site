import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface ContentNodeProps {
  isDark: boolean;
  startFrame: number;
}

export const ContentNode: React.FC<ContentNodeProps> = ({
  isDark,
  startFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - startFrame;

  if (localFrame < 0) return null;

  // Entrance spring
  const scale = spring({
    frame: localFrame,
    fps,
    config: {
      damping: 12,
      stiffness: 100,
      mass: 0.8,
    },
  });

  // Opacity
  const opacity = interpolate(localFrame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Pulse glow
  const pulsePhase = (localFrame * 0.05) % (Math.PI * 2);
  const pulseIntensity = 0.5 + Math.sin(pulsePhase) * 0.3;

  const bgColor = isDark ? '#1E293B' : '#FFFFFF';
  const borderColor = isDark ? '#334155' : '#E2E8F0';

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
      }}
    >
      <div
        style={{
          width: 100,
          height: 100,
          borderRadius: 24,
          background: bgColor,
          border: `3px solid ${borderColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `
            0 0 ${30 * pulseIntensity}px rgba(37, 99, 235, ${pulseIntensity * 0.4}),
            0 20px 40px rgba(0, 0, 0, ${isDark ? 0.4 : 0.15})
          `,
        }}
      >
        {/* Document icon */}
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect
            x="10"
            y="6"
            width="28"
            height="36"
            rx="4"
            fill={isDark ? '#334155' : '#E2E8F0'}
          />
          <rect
            x="14"
            y="12"
            width="20"
            height="4"
            rx="2"
            fill="#2563EB"
          />
          <rect
            x="14"
            y="20"
            width="16"
            height="3"
            rx="1.5"
            fill={isDark ? '#64748B' : '#94A3B8'}
          />
          <rect
            x="14"
            y="26"
            width="18"
            height="3"
            rx="1.5"
            fill={isDark ? '#64748B' : '#94A3B8'}
          />
          <rect
            x="14"
            y="32"
            width="12"
            height="3"
            rx="1.5"
            fill={isDark ? '#64748B' : '#94A3B8'}
          />
        </svg>
      </div>
    </div>
  );
};
