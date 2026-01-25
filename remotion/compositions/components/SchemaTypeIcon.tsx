import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { SCENE_COLORS } from '../../types/constants';

interface SchemaTypeIconProps {
  isDark: boolean;
  type: 'article' | 'product' | 'faq' | 'service';
  startFrame: number;
  x: number;
  y: number;
}

const SCHEMA_CONFIG = {
  article: {
    color: SCENE_COLORS.schema.article,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
    ),
    label: 'Article',
  },
  product: {
    color: SCENE_COLORS.schema.product,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      </svg>
    ),
    label: 'Product',
  },
  faq: {
    color: SCENE_COLORS.schema.faq,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="#fff" strokeWidth="2" fill="none" />
        <circle cx="12" cy="17" r="1" />
      </svg>
    ),
    label: 'FAQ',
  },
  service: {
    color: SCENE_COLORS.schema.service,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    label: 'Service',
  },
};

export const SchemaTypeIcon: React.FC<SchemaTypeIconProps> = ({
  isDark,
  type,
  startFrame,
  x,
  y,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const config = SCHEMA_CONFIG[type];

  const localFrame = frame - startFrame;

  // Spring entrance
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
  const opacity = interpolate(localFrame, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Floating animation
  const floatY = Math.sin((frame * 0.05) + (x * 0.1)) * 5;

  if (localFrame < 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) scale(${scale}) translateY(${floatY}px)`,
        opacity,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: config.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 8px 24px ${config.color}40`,
          }}
        >
          {config.icon}
        </div>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: isDark ? '#94A3B8' : '#64748B',
            background: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            padding: '4px 10px',
            borderRadius: 6,
          }}
        >
          {config.label}
        </span>
      </div>
    </div>
  );
};
