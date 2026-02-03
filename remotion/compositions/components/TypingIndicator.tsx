import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

interface TypingIndicatorProps {
  startFrame: number;
  endFrame: number;
  x: number;
  y: number;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  startFrame,
  endFrame,
  x,
  y,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  if (localFrame < 0 || frame > endFrame) return null;

  const opacity = interpolate(localFrame, [0, 5], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        opacity,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '10px 16px',
        borderRadius: 16,
        borderTopLeftRadius: 4,
        background: 'rgba(30, 41, 59, 0.9)',
        border: '1px solid rgba(51, 65, 85, 0.5)',
      }}
    >
      {[0, 1, 2].map((i) => {
        const bounce = Math.sin((localFrame * 0.3) - i * 1.2);
        const yOffset = bounce > 0 ? -bounce * 4 : 0;

        return (
          <div
            key={i}
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#94A3B8',
              transform: `translateY(${yOffset}px)`,
            }}
          />
        );
      })}
    </div>
  );
};
