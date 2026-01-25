import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { COLORS } from '../../types/constants';

interface GradientBgProps {
  isDark: boolean;
}

export const GradientBg: React.FC<GradientBgProps> = ({ isDark }) => {
  const frame = useCurrentFrame();

  // Subtle background animation - rotating gradient
  const rotation = interpolate(frame, [0, 180], [0, 360], {
    extrapolateRight: 'extend',
  });

  const bgColor = isDark ? COLORS.dark.bg : COLORS.light.bg;
  const gradientColor1 = isDark ? 'rgba(37, 99, 235, 0.15)' : 'rgba(37, 99, 235, 0.1)';
  const gradientColor2 = isDark ? 'rgba(6, 182, 212, 0.15)' : 'rgba(6, 182, 212, 0.1)';

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bgColor,
        overflow: 'hidden',
      }}
    >
      {/* Rotating gradient orbs */}
      <div
        style={{
          position: 'absolute',
          width: '120%',
          height: '120%',
          top: '-10%',
          left: '-10%',
          transform: `rotate(${rotation}deg)`,
          transformOrigin: 'center center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '10%',
            right: '10%',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: gradientColor1,
            filter: 'blur(80px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
            left: '10%',
            width: 250,
            height: 250,
            borderRadius: '50%',
            background: gradientColor2,
            filter: 'blur(80px)',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
