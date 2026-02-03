import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { SDLP_VP_COLORS } from '../../types/constants';

interface MetricCardProps {
  value: string;
  suffix?: string;
  label: string;
  color: string;
  x: number;
  y: number;
  enterFrame: number;
  filledDots: number;
  totalDots?: number;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  value,
  suffix = '',
  label,
  color,
  x,
  y,
  enterFrame,
  filledDots,
  totalDots = 5,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - enterFrame;

  if (localFrame < 0) return null;

  const scale = spring({
    frame: localFrame,
    fps,
    config: { damping: 10, mass: 0.6, stiffness: 100 },
  });

  const opacity = interpolate(localFrame, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Counter animation: extract numeric portion
  const numericPart = parseFloat(value.replace(/[^0-9.]/g, ''));
  const isDecimal = value.includes('.');
  const counterProgress = interpolate(localFrame, [5, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const currentValue = numericPart * counterProgress;
  const displayValue = isDecimal
    ? currentValue.toFixed(1)
    : Math.round(currentValue).toString();

  // Reconstruct with prefix/suffix from the value string
  const prefix = value.match(/^[^0-9]*/)?.[0] ?? '';
  const valueSuffix = value.match(/[^0-9.]*$/)?.[0] ?? '';

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
          inset: -6,
          borderRadius: 18,
          background: color,
          opacity: 0.1,
          filter: 'blur(12px)',
        }}
      />

      <div
        style={{
          position: 'relative',
          width: 180,
          padding: '20px 16px',
          borderRadius: 16,
          background: 'rgba(15, 23, 42, 0.9)',
          border: `1.5px solid ${color}40`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
        }}
      >
        {/* Value */}
        <span
          style={{
            fontSize: 32,
            fontWeight: 800,
            color,
            fontFamily: 'Inter, system-ui, sans-serif',
            letterSpacing: -1,
          }}
        >
          {prefix}{displayValue}{valueSuffix}{suffix}
        </span>

        {/* Label */}
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: SDLP_VP_COLORS.text.primary,
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          {label}
        </span>

        {/* Dot progress */}
        <div style={{ display: 'flex', gap: 5 }}>
          {Array.from({ length: totalDots }).map((_, i) => {
            const dotFilled = i < filledDots;
            const dotProgress = interpolate(
              localFrame,
              [10 + i * 3, 15 + i * 3],
              [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
            );

            return (
              <div
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: dotFilled ? color : 'rgba(51, 65, 85, 0.5)',
                  opacity: dotFilled ? dotProgress : 0.4,
                  transform: `scale(${dotFilled ? 0.5 + dotProgress * 0.5 : 1})`,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
