import React from 'react';
import { interpolate } from 'remotion';
import { SDLP_ABOUT_COLORS } from '../../types/constants';

const C = SDLP_ABOUT_COLORS.scene4;

interface BadgeDef {
  label: string;
  value: string;
  icon: string;
  color: string;
  enterDelay: number;
}

const STATUS_BADGES: BadgeDef[] = [
  { label: '稼働率', value: '99.9%', icon: '⬆', color: C.uptime, enterDelay: 20 },
  { label: '監視', value: 'AI監視', icon: '🤖', color: C.badge, enterDelay: 28 },
  { label: 'サポート', value: '3ヶ月無料', icon: '🎁', color: C.shield, enterDelay: 36 },
];

export const SupportShield: React.FC<{ frame: number; opacity: number }> = ({
  frame,
  opacity,
}) => {
  if (opacity <= 0) return null;

  return (
    <div style={{ opacity, position: 'absolute', inset: 0 }}>
      <SceneTitle frame={frame} />
      <ShieldIcon frame={frame} />
      <HeartbeatLine frame={frame} />
      <Badges frame={frame} />
    </div>
  );
};

const SceneTitle: React.FC<{ frame: number }> = ({ frame }) => {
  const titleOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const titleY = interpolate(frame, [0, 12], [10, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: 30,
        width: '100%',
        textAlign: 'center',
        opacity: titleOpacity,
        transform: `translateY(${titleY}px)`,
      }}
    >
      <span
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: SDLP_ABOUT_COLORS.text.primary,
          fontFamily: 'Inter, system-ui, sans-serif',
          letterSpacing: 2,
        }}
      >
        24/7 SUPPORT SYSTEM
      </span>
      <div
        style={{
          marginTop: 6,
          width: 50,
          height: 2,
          background: `linear-gradient(90deg, ${C.shield}, ${C.heartbeat})`,
          borderRadius: 1,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      />
    </div>
  );
};

const ShieldIcon: React.FC<{ frame: number }> = ({ frame }) => {
  const scale = interpolate(frame, [5, 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const pulse = interpolate(frame % 60, [0, 30, 60], [1, 1.05, 1]);

  const glowIntensity = interpolate(frame, [15, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: 400 - 55,
        top: 110,
        width: 110,
        height: 130,
        transform: `scale(${scale * pulse})`,
        transformOrigin: 'center center',
      }}
    >
      {/* Shield shape via SVG */}
      <svg viewBox="0 0 110 130" style={{ width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={C.shield} stopOpacity={0.8} />
            <stop offset="100%" stopColor={C.badge} stopOpacity={0.6} />
          </linearGradient>
          <filter id="shieldGlow">
            <feGaussianBlur stdDeviation={4 * glowIntensity} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M55 8 L100 30 L95 85 Q55 120 55 120 Q55 120 15 85 L10 30 Z"
          fill="url(#shieldGrad)"
          stroke={C.shield}
          strokeWidth={2}
          filter="url(#shieldGlow)"
        />
        {/* Check mark */}
        <path
          d="M38 65 L50 78 L75 50"
          fill="none"
          stroke="#fff"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={60}
          strokeDashoffset={interpolate(frame, [15, 30], [60, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })}
        />
      </svg>
    </div>
  );
};

const HeartbeatLine: React.FC<{ frame: number }> = ({ frame }) => {
  const lineOpacity = interpolate(frame, [20, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Scrolling heartbeat pattern
  const scrollOffset = frame * 3;

  return (
    <div
      style={{
        position: 'absolute',
        left: 80,
        right: 80,
        top: 275,
        height: 60,
        opacity: lineOpacity,
        overflow: 'hidden',
      }}
    >
      <svg
        viewBox="0 0 640 60"
        style={{ width: '100%', height: '100%' }}
        preserveAspectRatio="none"
      >
        <HeartbeatPath scrollOffset={scrollOffset} />
      </svg>
      {/* Label */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: -18,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: C.heartbeat,
            boxShadow: `0 0 6px ${C.heartbeat}`,
          }}
        />
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: C.heartbeat,
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          System Health
        </span>
      </div>
    </div>
  );
};

const HeartbeatPath: React.FC<{ scrollOffset: number }> = ({ scrollOffset }) => {
  // Generate a repeating heartbeat pattern
  const patternWidth = 160;
  const numRepeats = 6;

  let d = '';
  for (let r = 0; r < numRepeats; r++) {
    const baseX = r * patternWidth - (scrollOffset % patternWidth);
    d += `${r === 0 ? 'M' : 'L'}${baseX} 30 `;
    d += `L${baseX + 40} 30 `;
    d += `L${baseX + 55} 10 `;
    d += `L${baseX + 70} 50 `;
    d += `L${baseX + 85} 15 `;
    d += `L${baseX + 100} 35 `;
    d += `L${baseX + 120} 30 `;
    d += `L${baseX + 160} 30 `;
  }

  return (
    <path
      d={d}
      fill="none"
      stroke={C.heartbeat}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ filter: `drop-shadow(0 0 4px ${C.heartbeat}80)` }}
    />
  );
};

const Badges: React.FC<{ frame: number }> = ({ frame }) => {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 60,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        gap: 30,
      }}
    >
      {STATUS_BADGES.map((badge) => {
        const enterFrame = badge.enterDelay;
        const scale = interpolate(frame, [enterFrame, enterFrame + 10], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        const y = interpolate(frame, [enterFrame, enterFrame + 10], [15, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        return (
          <div
            key={badge.label}
            style={{
              transform: `scale(${scale}) translateY(${y}px)`,
              transformOrigin: 'center bottom',
              textAlign: 'center',
              padding: '12px 20px',
              borderRadius: 12,
              background: `${SDLP_ABOUT_COLORS.bg.card}CC`,
              border: `1px solid ${badge.color}30`,
              minWidth: 120,
            }}
          >
            <span style={{ fontSize: 18 }}>{badge.icon}</span>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: badge.color,
                fontFamily: 'Inter, system-ui, sans-serif',
                marginTop: 4,
              }}
            >
              {badge.value}
            </div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: SDLP_ABOUT_COLORS.text.secondary,
                fontFamily: 'Inter, system-ui, sans-serif',
                marginTop: 2,
              }}
            >
              {badge.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};
