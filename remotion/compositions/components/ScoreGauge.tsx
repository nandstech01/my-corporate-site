import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { SCENE_COLORS } from '../../types/constants';

interface ScoreGaugeProps {
  isDark: boolean;
  startFrame: number;
  targetScore: number;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  isDark,
  startFrame,
  targetScore,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - startFrame;

  if (localFrame < 0) return null;

  // Entrance
  const entranceOpacity = interpolate(localFrame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const entranceScale = spring({
    frame: localFrame,
    fps,
    config: {
      damping: 15,
      stiffness: 100,
      mass: 0.8,
    },
  });

  // Score animation
  const scoreProgress = interpolate(localFrame, [20, 90], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const easedProgress = 1 - Math.pow(1 - scoreProgress, 3); // Cubic ease-out
  const currentScore = Math.round(easedProgress * targetScore);

  const size = 140;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = easedProgress * (targetScore / 100);
  const strokeDashoffset = circumference * (1 - progress * 0.75); // 270 degrees max

  const bgColor = isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)';
  const borderColor = isDark ? '#334155' : '#E2E8F0';
  const trackColor = isDark ? '#1E293B' : '#F1F5F9';

  // Get score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return SCENE_COLORS.graph.gauge;
    if (score >= 40) return '#F59E0B';
    return '#EF4444';
  };

  const scoreColor = getScoreColor(currentScore);

  return (
    <div
      style={{
        position: 'absolute',
        right: '12%',
        top: '35%',
        transform: `translateY(-50%) scale(${entranceScale})`,
        opacity: entranceOpacity,
      }}
    >
      <div
        style={{
          background: bgColor,
          border: `2px solid ${borderColor}`,
          borderRadius: 20,
          padding: 20,
          boxShadow: isDark
            ? '0 20px 40px rgba(0, 0, 0, 0.5)'
            : '0 20px 40px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: isDark ? '#64748B' : '#94A3B8',
            marginBottom: 12,
            textAlign: 'center',
          }}
        >
          AI Visibility Score
        </div>

        <div style={{ position: 'relative', width: size, height: size }}>
          <svg width={size} height={size} style={{ transform: 'rotate(-135deg)' }}>
            {/* Background track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={trackColor}
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference * 0.75} ${circumference}`}
              strokeLinecap="round"
            />
            {/* Progress arc */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={scoreColor}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{
                filter: `drop-shadow(0 0 8px ${scoreColor}80)`,
              }}
            />
          </svg>

          {/* Score text */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontSize: 36,
                fontWeight: 800,
                color: scoreColor,
                lineHeight: 1,
              }}
            >
              {currentScore}
            </span>
            <span
              style={{
                fontSize: 12,
                color: isDark ? '#64748B' : '#94A3B8',
                marginTop: 4,
              }}
            >
              / 100
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
