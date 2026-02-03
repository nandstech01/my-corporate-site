import React from 'react';
import { interpolate } from 'remotion';
import { SDLP_ABOUT_COLORS } from '../../types/constants';

const C = SDLP_ABOUT_COLORS.scene2;

interface BarDef {
  label: string;
  traditional: number;
  nands: number;
  enterDelay: number;
}

const BARS: BarDef[] = [
  { label: '人件費', traditional: 0.85, nands: 0.45, enterDelay: 0 },
  { label: 'オフィス維持費', traditional: 0.6, nands: 0.15, enterDelay: 4 },
  { label: '管理コスト', traditional: 0.7, nands: 0.25, enterDelay: 8 },
  { label: '開発工数', traditional: 0.9, nands: 0.5, enterDelay: 12 },
];

const BAR_AREA_LEFT = 80;
const BAR_AREA_RIGHT = 620;
const BAR_HEIGHT = 28;

export const CostComparisonBars: React.FC<{ frame: number; opacity: number }> = ({
  frame,
  opacity,
}) => {
  if (opacity <= 0) return null;

  // Scene-local frame (scene2 starts at frame 65 in the composition)
  const localFrame = frame;

  return (
    <div style={{ opacity, position: 'absolute', inset: 0 }}>
      {/* Title */}
      <SceneTitle frame={localFrame} />

      {/* Legend */}
      <Legend frame={localFrame} />

      {/* Bars */}
      {BARS.map((bar, i) => (
        <BarRow key={bar.label} bar={bar} index={i} frame={localFrame} />
      ))}

      {/* Counter */}
      <SavingsCounter frame={localFrame} />
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
        COST STRUCTURE COMPARISON
      </span>
      <div
        style={{
          marginTop: 6,
          width: 50,
          height: 2,
          background: `linear-gradient(90deg, ${C.traditional}, ${C.nands})`,
          borderRadius: 1,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      />
    </div>
  );
};

const Legend: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [5, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: 70,
        left: BAR_AREA_LEFT,
        display: 'flex',
        gap: 24,
        opacity,
      }}
    >
      <LegendItem color={C.traditional} label="従来の開発会社" />
      <LegendItem color={C.nands} label="NANDS (AI活用)" />
    </div>
  );
};

const LegendItem: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
    <div
      style={{
        width: 12,
        height: 12,
        borderRadius: 3,
        background: color,
      }}
    />
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: SDLP_ABOUT_COLORS.text.secondary,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {label}
    </span>
  </div>
);

const BarRow: React.FC<{ bar: BarDef; index: number; frame: number }> = ({
  bar,
  index,
  frame,
}) => {
  const enterFrame = 10 + bar.enterDelay;
  const maxWidth = BAR_AREA_RIGHT - BAR_AREA_LEFT;
  const y = 105 + index * 85;

  const tradWidth = interpolate(
    frame,
    [enterFrame, enterFrame + 20],
    [0, bar.traditional * maxWidth],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  const nandsWidth = interpolate(
    frame,
    [enterFrame + 8, enterFrame + 28],
    [0, bar.nands * maxWidth],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  const labelOpacity = interpolate(frame, [enterFrame, enterFrame + 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{ position: 'absolute', left: BAR_AREA_LEFT, top: y }}>
      {/* Label */}
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: SDLP_ABOUT_COLORS.text.primary,
          fontFamily: 'Inter, system-ui, sans-serif',
          opacity: labelOpacity,
        }}
      >
        {bar.label}
      </span>

      {/* Traditional bar */}
      <div
        style={{
          marginTop: 6,
          width: tradWidth,
          height: BAR_HEIGHT,
          borderRadius: 6,
          background: `linear-gradient(90deg, ${C.traditional}CC, ${C.traditional}88)`,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 8,
        }}
      >
        {tradWidth > 60 && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: '#fff',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            ¥{Math.round(bar.traditional * 100)}
          </span>
        )}
      </div>

      {/* NANDS bar */}
      <div
        style={{
          marginTop: 4,
          width: nandsWidth,
          height: BAR_HEIGHT,
          borderRadius: 6,
          background: `linear-gradient(90deg, ${C.nands}, ${C.nands}CC)`,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 8,
          boxShadow: `0 0 10px ${C.nands}40`,
        }}
      >
        {nandsWidth > 60 && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: '#fff',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            ¥{Math.round(bar.nands * 100)}
          </span>
        )}
      </div>

      {/* AI badge next to NANDS bar */}
      {nandsWidth > 30 && (
        <AiBadge
          x={nandsWidth + 8}
          frame={frame}
          enterFrame={enterFrame + 25}
        />
      )}
    </div>
  );
};

const AiBadge: React.FC<{ x: number; frame: number; enterFrame: number }> = ({
  x,
  frame,
  enterFrame,
}) => {
  const scale = interpolate(frame, [enterFrame, enterFrame + 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: BAR_HEIGHT + 12,
        transform: `scale(${scale})`,
        transformOrigin: 'left center',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        borderRadius: 10,
        background: `${C.aiBadge}20`,
        border: `1px solid ${C.aiBadge}60`,
      }}
    >
      <span style={{ fontSize: 10 }}>⚡</span>
      <span
        style={{
          fontSize: 9,
          fontWeight: 700,
          color: C.aiBadge,
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        AI
      </span>
    </div>
  );
};

const SavingsCounter: React.FC<{ frame: number }> = ({ frame }) => {
  const counterOpacity = interpolate(frame, [50, 60], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const countValue = interpolate(frame, [50, 75], [0, 40], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scale = interpolate(frame, [50, 58], [0.8, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        right: 60,
        bottom: 40,
        opacity: counterOpacity,
        transform: `scale(${scale})`,
        textAlign: 'center',
        padding: '16px 24px',
        borderRadius: 16,
        background: `${SDLP_ABOUT_COLORS.bg.card}CC`,
        border: `1px solid ${C.counter}40`,
        boxShadow: `0 0 20px ${C.counter}20`,
      }}
    >
      <div
        style={{
          fontSize: 32,
          fontWeight: 800,
          color: C.counter,
          fontFamily: 'Inter, system-ui, sans-serif',
          lineHeight: 1,
        }}
      >
        {Math.round(countValue)}%
      </div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: SDLP_ABOUT_COLORS.text.secondary,
          fontFamily: 'Inter, system-ui, sans-serif',
          marginTop: 4,
        }}
      >
        コスト削減
      </div>
    </div>
  );
};
