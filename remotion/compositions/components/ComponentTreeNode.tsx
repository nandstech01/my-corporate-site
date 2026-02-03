import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { SDLP_VP_COLORS } from '../../types/constants';

interface ComponentTreeNodeProps {
  label: string;
  color: string;
  x: number;
  y: number;
  enterFrame: number;
  parentX?: number;
  parentY?: number;
  icon?: string;
}

export const ComponentTreeNode: React.FC<ComponentTreeNodeProps> = ({
  label,
  color,
  x,
  y,
  enterFrame,
  parentX,
  parentY,
  icon,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - enterFrame;

  if (localFrame < 0) return null;

  const scale = spring({
    frame: localFrame,
    fps,
    config: { damping: 12, mass: 0.5, stiffness: 120 },
  });

  const opacity = interpolate(localFrame, [0, 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <>
      {/* Connection line from parent */}
      {parentX !== undefined && parentY !== undefined && (
        <svg
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          <line
            x1={parentX}
            y1={parentY + 18}
            x2={x}
            y2={y - 18}
            stroke={color}
            strokeWidth={1.5}
            opacity={opacity * 0.35}
            strokeDasharray="4 3"
          />
        </svg>
      )}

      {/* Node */}
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
            inset: -4,
            borderRadius: 12,
            background: color,
            opacity: 0.12,
            filter: 'blur(8px)',
          }}
        />

        <div
          style={{
            position: 'relative',
            padding: '8px 14px',
            borderRadius: 10,
            background: `${color}15`,
            border: `1.5px solid ${color}50`,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {icon && (
            <span style={{ fontSize: 12 }}>{icon}</span>
          )}
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: SDLP_VP_COLORS.text.primary,
              fontFamily: 'Inter, system-ui, sans-serif',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </span>
        </div>
      </div>
    </>
  );
};
