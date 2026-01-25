import { interpolate, useCurrentFrame } from 'remotion';
import { COLORS } from '../../types/constants';

interface ConnectionLinesProps {
  isDark: boolean;
}

export const ConnectionLines: React.FC<ConnectionLinesProps> = ({ isDark }) => {
  const frame = useCurrentFrame();

  // Start after AI icons appear (frame 60)
  const startFrame = 60;
  const isVisible = frame >= startFrame;

  if (!isVisible) {
    return null;
  }

  // Fade out at the end
  const fadeOut = interpolate(frame, [160, 180], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Pulse animation for lines
  const pulseOpacity = interpolate(
    (frame - startFrame) % 30,
    [0, 15, 30],
    [0.3, 0.8, 0.3],
    { extrapolateRight: 'clamp' }
  );

  // Connection line animation - dash offset
  const dashOffset = interpolate(frame - startFrame, [0, 60], [100, 0], {
    extrapolateRight: 'clamp',
  });

  const lineColor = isDark ? COLORS.primary : COLORS.accent;

  // Calculate line positions based on AI icon orbit positions
  const lines = [
    { angle: 0, orbitRadius: 180 },
    { angle: 120, orbitRadius: 180 },
    { angle: 240, orbitRadius: 180 },
  ];

  return (
    <svg
      width="100%"
      height="100%"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        opacity: fadeOut,
      }}
    >
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={COLORS.primary} stopOpacity="0" />
          <stop offset="50%" stopColor={COLORS.primary} stopOpacity={pulseOpacity} />
          <stop offset="100%" stopColor={COLORS.secondary} stopOpacity="0" />
        </linearGradient>
      </defs>

      {lines.map((line, index) => {
        const orbitSpeed = 0.8;
        const currentAngle = line.angle + (frame * orbitSpeed);
        const angleRad = (currentAngle * Math.PI) / 180;

        const endX = 400 + Math.cos(angleRad) * line.orbitRadius;
        const endY = 300 + Math.sin(angleRad) * line.orbitRadius * 0.5;

        const individualPulse = interpolate(
          (frame - startFrame + index * 10) % 30,
          [0, 15, 30],
          [0.2, 0.7, 0.2],
          { extrapolateRight: 'clamp' }
        );

        return (
          <line
            key={index}
            x1="400"
            y1="300"
            x2={endX}
            y2={endY}
            stroke={lineColor}
            strokeWidth="2"
            strokeOpacity={individualPulse}
            strokeDasharray="8,4"
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
};
