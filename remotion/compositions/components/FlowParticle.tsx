import { interpolate, useCurrentFrame } from 'remotion';

interface FlowParticleProps {
  isDark: boolean;
  startFrame: number;
  endFrame: number;
  targetAngle: number; // 0, 90, 180, 270
  distance: number;
  color: string;
  delay: number;
}

export const FlowParticle: React.FC<FlowParticleProps> = ({
  isDark,
  startFrame,
  endFrame,
  targetAngle,
  distance,
  color,
  delay,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame - delay;
  const duration = endFrame - startFrame - delay;

  if (localFrame < 0 || localFrame > duration) return null;

  // Progress along path
  const progress = interpolate(localFrame, [0, duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Easing for natural movement
  const easedProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out

  // Calculate position
  const angleRad = (targetAngle * Math.PI) / 180;
  const currentDistance = easedProgress * distance;
  const x = Math.cos(angleRad) * currentDistance;
  const y = Math.sin(angleRad) * currentDistance;

  // Fade in/out
  const opacity = interpolate(
    progress,
    [0, 0.1, 0.8, 1],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // Trail effect - multiple particles
  const trailOpacity = interpolate(progress, [0, 0.5, 1], [0.3, 0.6, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <>
      {/* Main particle */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: color,
          transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
          opacity,
          boxShadow: `0 0 12px ${color}`,
        }}
      />
      {/* Trail particles */}
      {[0.15, 0.3].map((trailDelay, i) => {
        const trailProgress = Math.max(0, easedProgress - trailDelay);
        const trailX = Math.cos(angleRad) * (trailProgress * distance);
        const trailY = Math.sin(angleRad) * (trailProgress * distance);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 5 - i,
              height: 5 - i,
              borderRadius: '50%',
              background: color,
              transform: `translate(calc(-50% + ${trailX}px), calc(-50% + ${trailY}px))`,
              opacity: trailOpacity * (1 - i * 0.3),
            }}
          />
        );
      })}
    </>
  );
};
