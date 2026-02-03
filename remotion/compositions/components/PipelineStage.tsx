import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

interface PipelineStageProps {
  label: string;
  color: string;
  x: number;
  y: number;
  activateFrame: number;
  index: number;
}

export const PipelineStage: React.FC<PipelineStageProps> = ({
  label,
  color,
  x,
  y,
  activateFrame,
  index,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - activateFrame;

  const opacity = interpolate(localFrame, [-5, 5], [0.3, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const isActive = localFrame >= 0;

  const progress = interpolate(localFrame, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const checkScale = interpolate(localFrame, [25, 35], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const glowIntensity = interpolate(localFrame, [0, 15, 45], [0, 1, 0.5], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const pulseScale = isActive
    ? 1 + Math.sin((frame - activateFrame) * 0.1) * 0.02
    : 1;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${pulseScale})`,
        opacity,
      }}
    >
      {/* Glow behind */}
      {isActive && (
        <div
          style={{
            position: 'absolute',
            inset: -6,
            borderRadius: 16,
            background: color,
            opacity: glowIntensity * 0.15,
            filter: 'blur(10px)',
          }}
        />
      )}

      {/* Stage card */}
      <div
        style={{
          position: 'relative',
          width: 120,
          padding: '12px 10px',
          borderRadius: 12,
          background: isActive ? `${color}15` : 'rgba(15, 23, 42, 0.6)',
          border: `1.5px solid ${isActive ? `${color}60` : 'rgba(51, 65, 85, 0.4)'}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {/* Step number */}
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: isActive ? color : 'rgba(51, 65, 85, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 700,
            color: '#FFFFFF',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          {checkScale > 0.5 ? (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transform: `scale(${checkScale})` }}
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            index + 1
          )}
        </div>

        {/* Label */}
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: isActive ? '#E2E8F0' : '#64748B',
            fontFamily: 'Inter, system-ui, sans-serif',
            textAlign: 'center',
          }}
        >
          {label}
        </span>

        {/* Progress bar */}
        <div
          style={{
            width: '100%',
            height: 3,
            borderRadius: 2,
            background: 'rgba(51, 65, 85, 0.3)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progress * 100}%`,
              height: '100%',
              borderRadius: 2,
              background: color,
              transition: 'none',
            }}
          />
        </div>
      </div>
    </div>
  );
};
