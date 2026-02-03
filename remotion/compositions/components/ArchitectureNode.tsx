import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

interface ArchitectureNodeProps {
  label: string;
  color: string;
  x: number;
  y: number;
  enterFrame: number;
  icon: 'frontend' | 'api' | 'database' | 'auth';
}

const ICONS: Record<string, React.ReactNode> = {
  frontend: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  api: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
  database: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  ),
  auth: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
};

export const ArchitectureNode: React.FC<ArchitectureNodeProps> = ({
  label,
  color,
  x,
  y,
  enterFrame,
  icon,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - enterFrame;

  if (localFrame < 0) return null;

  const opacity = interpolate(localFrame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scale = interpolate(localFrame, [0, 15], [0.5, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const glowPulse = interpolate(
    (frame % 90) / 90,
    [0, 0.5, 1],
    [0.3, 0.7, 0.3],
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
      }}
    >
      {/* Glow */}
      <div
        style={{
          position: 'absolute',
          inset: -8,
          borderRadius: 20,
          background: color,
          opacity: glowPulse * 0.2,
          filter: 'blur(12px)',
        }}
      />

      {/* Node card */}
      <div
        style={{
          position: 'relative',
          width: 110,
          padding: '14px 12px',
          borderRadius: 14,
          background: 'rgba(15, 23, 42, 0.9)',
          border: `1.5px solid ${color}40`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {/* Icon circle */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: `${color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color,
          }}
        >
          {ICONS[icon]}
        </div>

        {/* Label */}
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#E2E8F0',
            fontFamily: 'Inter, system-ui, sans-serif',
            textAlign: 'center',
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
};
