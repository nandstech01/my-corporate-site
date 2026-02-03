import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import { SDLP_COMP_COLORS } from '../../types/constants';

const C = SDLP_COMP_COLORS;

interface ComparisonSceneProps {
  frame: number;
  opacity: number;
  title: string;
  traditionalLabel: string;
  traditionalItems: string[];
  nandsLabel: string;
  nandsItems: string[];
  sceneNumber: string;
  totalScenes: number;
  sceneIndex: number;
}

export const ComparisonScene: React.FC<ComparisonSceneProps> = ({
  frame,
  opacity,
  title,
  traditionalLabel,
  traditionalItems,
  nandsLabel,
  nandsItems,
  sceneNumber,
  totalScenes,
  sceneIndex,
}) => {
  // Title fade in + slide up
  const titleOpacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const titleY = interpolate(frame, [0, 8], [15, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Scene number fade in
  const sceneNumOpacity = interpolate(frame, [5, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Card containers scale in
  const cardScale = interpolate(frame, [8, 12], [0.95, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const cardOpacity = interpolate(frame, [8, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Traditional label
  const tradLabelOpacity = interpolate(frame, [10, 14], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // NANDS label
  const nandsLabelOpacity = interpolate(frame, [18, 22], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Fade out for scene transition
  const fadeOut = interpolate(frame, [70, 90], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const combinedOpacity = opacity * fadeOut;

  return (
    <AbsoluteFill style={{ opacity: combinedOpacity }}>
      {/* Scene number (top-right) */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          right: 28,
          fontSize: 14,
          fontFamily: 'monospace',
          color: C.text.muted,
          opacity: sceneNumOpacity,
          letterSpacing: 1,
        }}
      >
        {sceneNumber}
      </div>

      {/* Category title (text only, no emoji) */}
      <div
        style={{
          position: 'absolute',
          top: 24,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <span
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: C.text.primary,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            letterSpacing: 1,
          }}
        >
          {title}
        </span>
        {/* Gradient line */}
        <div
          style={{
            marginTop: 10,
            width: 140,
            height: 2,
            background: `linear-gradient(90deg, ${C.accent.blue}, ${C.accent.cyan})`,
            borderRadius: 1,
          }}
        />
      </div>

      {/* Two-column cards */}
      <div
        style={{
          position: 'absolute',
          top: 80,
          left: 28,
          right: 28,
          bottom: 40,
          display: 'flex',
          gap: 16,
          opacity: cardOpacity,
          transform: `scale(${cardScale})`,
        }}
      >
        {/* Traditional card */}
        <div
          style={{
            flex: 1,
            background: C.traditional.bg,
            border: `1px solid ${C.traditional.border}`,
            borderRadius: 12,
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Label */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 18,
              opacity: tradLabelOpacity,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: C.traditional.dot,
              }}
            />
            <span
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: C.traditional.label,
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              {traditionalLabel}
            </span>
          </div>

          {/* Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {traditionalItems.map((item, i) => {
              const startFrame = 14 + i * 5;
              const itemOpacity = interpolate(
                frame,
                [startFrame, startFrame + 4],
                [0, 1],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
              );
              const itemX = interpolate(
                frame,
                [startFrame, startFrame + 4],
                [-12, 0],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
              );
              // X icon pulse
              const pulseScale = interpolate(
                frame,
                [startFrame + 2, startFrame + 4, startFrame + 6],
                [0.8, 1.15, 1],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
              );

              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    opacity: itemOpacity,
                    transform: `translateX(${itemX}px)`,
                  }}
                >
                  <span
                    style={{
                      fontSize: 16,
                      color: C.traditional.icon,
                      flexShrink: 0,
                      marginTop: 1,
                      transform: `scale(${pulseScale})`,
                      display: 'inline-block',
                    }}
                  >
                    ✕
                  </span>
                  <span
                    style={{
                      fontSize: 15,
                      color: C.text.secondary,
                      lineHeight: 1.5,
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                    }}
                  >
                    {item}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* NANDS card */}
        <div
          style={{
            flex: 1,
            background: `linear-gradient(135deg, ${C.nands.bgFrom}, ${C.nands.bgTo})`,
            border: `1px solid ${C.nands.border}`,
            borderRadius: 12,
            padding: '18px 20px',
            boxShadow: `0 0 20px ${C.nands.glow}`,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Label */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 18,
              opacity: nandsLabelOpacity,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: C.nands.dot,
              }}
            />
            <span
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: C.nands.label,
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              {nandsLabel}
            </span>
          </div>

          {/* Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {nandsItems.map((item, i) => {
              const startFrame = 25 + i * 5;
              const itemOpacity = interpolate(
                frame,
                [startFrame, startFrame + 4],
                [0, 1],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
              );
              const itemX = interpolate(
                frame,
                [startFrame, startFrame + 4],
                [-12, 0],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
              );
              // Checkmark bounce
              const checkScale = interpolate(
                frame,
                [startFrame + 1, startFrame + 3, startFrame + 5],
                [0, 1.2, 1],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
              );

              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    opacity: itemOpacity,
                    transform: `translateX(${itemX}px)`,
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: C.nands.checkBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 1,
                      transform: `scale(${checkScale})`,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        color: C.nands.check,
                        fontWeight: 700,
                      }}
                    >
                      ✓
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 15,
                      color: C.text.primary,
                      lineHeight: 1.5,
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                    }}
                  >
                    {item}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Progress indicator (bottom) */}
      <div
        style={{
          position: 'absolute',
          bottom: 14,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        {Array.from({ length: totalScenes }).map((_, i) => (
          <div
            key={i}
            style={{
              width: i === sceneIndex ? 20 : 6,
              height: 6,
              borderRadius: 3,
              background:
                i === sceneIndex ? C.progress.active : C.progress.inactive,
              boxShadow:
                i === sceneIndex
                  ? `0 0 8px ${C.progress.active}`
                  : 'none',
              transition: 'all 0.3s',
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
