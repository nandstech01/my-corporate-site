import React from 'react';
import { interpolate } from 'remotion';
import { SDLP_ABOUT_COLORS } from '../../types/constants';

const C = SDLP_ABOUT_COLORS.scene1;

interface NodeDef {
  label: string;
  color: string;
  angle: number;
  icon: string;
}

const SATELLITE_NODES: NodeDef[] = [
  { label: 'GPT', color: C.gpt, angle: -90, icon: '🧠' },
  { label: 'Claude', color: C.claude, angle: -18, icon: '💬' },
  { label: 'RAG', color: C.rag, angle: 54, icon: '📚' },
  { label: 'Vision', color: C.vision, angle: 126, icon: '👁' },
  { label: 'Code', color: C.code, angle: 198, icon: '⚡' },
];

const HUB_X = 400;
const HUB_Y = 240;
const ORBIT_R = 140;

export const AiBrainNetwork: React.FC<{ frame: number; opacity: number }> = ({
  frame,
  opacity,
}) => {
  if (opacity <= 0) return null;

  const hubScale = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const hubGlow = interpolate(frame, [0, 30, 60, 80], [0, 0.6, 0.8, 0.5], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{ opacity, position: 'absolute', inset: 0 }}>
      {/* Title */}
      <SceneTitle frame={frame} />

      {/* Connection lines drawn first (behind nodes) */}
      <svg
        style={{ position: 'absolute', inset: 0 }}
        viewBox="0 0 800 500"
      >
        {SATELLITE_NODES.map((node, i) => {
          const lineProgress = interpolate(
            frame,
            [12 + i * 6, 22 + i * 6],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
          );
          const rad = (node.angle * Math.PI) / 180;
          const nx = HUB_X + Math.cos(rad) * ORBIT_R;
          const ny = HUB_Y + Math.sin(rad) * ORBIT_R;

          return (
            <line
              key={node.label}
              x1={HUB_X}
              y1={HUB_Y}
              x2={HUB_X + (nx - HUB_X) * lineProgress}
              y2={HUB_Y + (ny - HUB_Y) * lineProgress}
              stroke={C.connection}
              strokeWidth={2}
              strokeDasharray="4 4"
            />
          );
        })}
      </svg>

      {/* Central hub */}
      <div
        style={{
          position: 'absolute',
          left: HUB_X - 36,
          top: HUB_Y - 36,
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${C.hub}, ${SDLP_ABOUT_COLORS.bg.mid})`,
          border: `2px solid ${C.hub}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${hubScale})`,
          boxShadow: `0 0 ${20 + hubGlow * 20}px ${C.hub}`,
        }}
      >
        <span style={{ fontSize: 28 }}>🤖</span>
      </div>
      <div
        style={{
          position: 'absolute',
          left: HUB_X - 20,
          top: HUB_Y + 42,
          width: 40,
          textAlign: 'center',
          fontSize: 10,
          fontWeight: 700,
          color: SDLP_ABOUT_COLORS.text.primary,
          fontFamily: 'Inter, system-ui, sans-serif',
          opacity: hubScale,
        }}
      >
        AI Hub
      </div>

      {/* Satellite nodes */}
      {SATELLITE_NODES.map((node, i) => (
        <SatelliteNode key={node.label} node={node} index={i} frame={frame} />
      ))}

      {/* Flowing particles along connections */}
      <FlowParticles frame={frame} />
    </div>
  );
};

const SceneTitle: React.FC<{ frame: number }> = ({ frame }) => {
  const titleOpacity = interpolate(frame, [5, 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const titleY = interpolate(frame, [5, 18], [10, 0], {
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
        AI INTEGRATION NETWORK
      </span>
      <div
        style={{
          marginTop: 6,
          width: 50,
          height: 2,
          background: `linear-gradient(90deg, ${C.hub}, ${C.code})`,
          borderRadius: 1,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      />
    </div>
  );
};

const SatelliteNode: React.FC<{
  node: NodeDef;
  index: number;
  frame: number;
}> = ({ node, index, frame }) => {
  const enterFrame = 10 + index * 6;
  const scale = interpolate(frame, [enterFrame, enterFrame + 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const rad = (node.angle * Math.PI) / 180;
  const nx = HUB_X + Math.cos(rad) * ORBIT_R;
  const ny = HUB_Y + Math.sin(rad) * ORBIT_R;

  const pulse = interpolate(
    frame % 60,
    [0, 30, 60],
    [1, 1.08, 1],
    { extrapolateRight: 'clamp' },
  );

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: nx - 26,
          top: ny - 26,
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: SDLP_ABOUT_COLORS.bg.card,
          border: `2px solid ${node.color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${scale * pulse})`,
          boxShadow: `0 0 12px ${node.color}40`,
        }}
      >
        <span style={{ fontSize: 20 }}>{node.icon}</span>
      </div>
      <div
        style={{
          position: 'absolute',
          left: nx - 22,
          top: ny + 30,
          width: 44,
          textAlign: 'center',
          fontSize: 10,
          fontWeight: 600,
          color: node.color,
          fontFamily: 'Inter, system-ui, sans-serif',
          opacity: scale,
        }}
      >
        {node.label}
      </div>
    </>
  );
};

const FlowParticles: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < 30) return null;

  return (
    <>
      {SATELLITE_NODES.map((node, i) => {
        const rad = (node.angle * Math.PI) / 180;
        const nx = HUB_X + Math.cos(rad) * ORBIT_R;
        const ny = HUB_Y + Math.sin(rad) * ORBIT_R;

        const cycleLength = 40;
        const offset = i * 8;
        const cycleFrame = ((frame - 30 + offset) % cycleLength) / cycleLength;

        const px = nx + (HUB_X - nx) * cycleFrame;
        const py = ny + (HUB_Y - ny) * cycleFrame;

        const pOpacity = interpolate(
          cycleFrame,
          [0, 0.1, 0.85, 1],
          [0, 0.8, 0.8, 0],
        );

        return (
          <div
            key={node.label}
            style={{
              position: 'absolute',
              left: px - 3,
              top: py - 3,
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: node.color,
              opacity: pOpacity,
              boxShadow: `0 0 6px ${node.color}`,
            }}
          />
        );
      })}
    </>
  );
};
