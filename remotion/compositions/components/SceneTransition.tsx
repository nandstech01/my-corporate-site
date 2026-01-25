import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { ReactNode } from 'react';

interface SceneTransitionProps {
  children: ReactNode;
  startFrame: number;
  endFrame: number;
  fadeInDuration?: number;
  fadeOutDuration?: number;
}

export const SceneTransition: React.FC<SceneTransitionProps> = ({
  children,
  startFrame,
  endFrame,
  fadeInDuration = 20,
  fadeOutDuration = 20,
}) => {
  const frame = useCurrentFrame();

  // Fade in at start
  const fadeIn = interpolate(
    frame,
    [startFrame, startFrame + fadeInDuration],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // Fade out at end
  const fadeOut = interpolate(
    frame,
    [endFrame - fadeOutDuration, endFrame],
    [1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const opacity = Math.min(fadeIn, fadeOut);

  // Only render if within the scene bounds (with some buffer for transitions)
  if (frame < startFrame - 10 || frame > endFrame + 10) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity,
      }}
    >
      {children}
    </div>
  );
};
