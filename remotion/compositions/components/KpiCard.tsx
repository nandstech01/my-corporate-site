import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface KpiCardProps {
  isDark: boolean;
  startFrame: number;
  value: string;
  label: string;
  color: string;
  index: number;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  isDark,
  startFrame,
  value,
  label,
  color,
  index,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const delay = index * 15;
  const localFrame = frame - startFrame - delay;

  if (localFrame < 0) return null;

  // Entrance spring
  const scale = spring({
    frame: localFrame,
    fps,
    config: {
      damping: 12,
      stiffness: 120,
      mass: 0.6,
    },
  });

  // Opacity
  const opacity = interpolate(localFrame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Slide up
  const y = interpolate(localFrame, [0, 20], [30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const bgColor = isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)';
  const borderColor = isDark ? '#334155' : '#E2E8F0';

  return (
    <div
      style={{
        transform: `scale(${scale}) translateY(${y}px)`,
        opacity,
      }}
    >
      <div
        style={{
          background: bgColor,
          border: `2px solid ${borderColor}`,
          borderRadius: 12,
          padding: '14px 20px',
          minWidth: 100,
          textAlign: 'center',
          boxShadow: isDark
            ? '0 8px 24px rgba(0, 0, 0, 0.4)'
            : '0 8px 24px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            color,
            lineHeight: 1.2,
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 500,
            color: isDark ? '#64748B' : '#94A3B8',
            marginTop: 4,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
};
