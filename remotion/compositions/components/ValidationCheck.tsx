import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { SCENE_COLORS } from '../../types/constants';

interface ValidationCheckProps {
  isDark: boolean;
  startFrame: number;
}

export const ValidationCheck: React.FC<ValidationCheckProps> = ({
  isDark,
  startFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - startFrame;

  if (localFrame < 0) return null;

  // Scale spring
  const scale = spring({
    frame: localFrame,
    fps,
    config: {
      damping: 10,
      stiffness: 150,
      mass: 0.5,
    },
  });

  // Check path animation
  const pathLength = interpolate(localFrame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Glow pulse
  const glowIntensity = interpolate(
    localFrame,
    [20, 30, 50],
    [0, 1, 0.5],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: '32%',
        top: '75%',
        transform: `translate(-50%, -50%) scale(${scale})`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          padding: '8px 14px',
          borderRadius: 10,
          border: `2px solid ${SCENE_COLORS.json.check}`,
          boxShadow: `0 0 ${20 + glowIntensity * 30}px ${SCENE_COLORS.json.check}${Math.round(glowIntensity * 80).toString(16).padStart(2, '0')}`,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 28 28">
          <circle
            cx="14"
            cy="14"
            r="12"
            fill={SCENE_COLORS.json.check}
            opacity={0.2}
          />
          <circle
            cx="14"
            cy="14"
            r="12"
            fill="none"
            stroke={SCENE_COLORS.json.check}
            strokeWidth="2"
          />
          <path
            d="M8 14l4 4 8-8"
            fill="none"
            stroke={SCENE_COLORS.json.check}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={20}
            strokeDashoffset={20 * (1 - pathLength)}
          />
        </svg>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: SCENE_COLORS.json.check,
          }}
        >
          Schema Valid
        </span>
      </div>
    </div>
  );
};
