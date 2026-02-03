import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { SdlpHeroProps, SDLP_SCENE_COLORS } from '../types/constants';
import { CodeTypewriter } from './components/CodeTypewriter';
import { ArchitectureNode } from './components/ArchitectureNode';
import { PipelineStage } from './components/PipelineStage';

// Phase timings: 12 seconds = 360 frames @30fps
// Phase A: Code Architecture (frames 0-180)
// Phase B: Pipeline Flow (frames 180-360)
const PHASE_A = { start: 0, end: 180 };
const PHASE_B = { start: 180, end: 360 };

const ARCHITECTURE_NODES = [
  { label: 'AI Engine', icon: 'frontend' as const, color: SDLP_SCENE_COLORS.architecture.frontend, x: 580, y: 120 },
  { label: 'API', icon: 'api' as const, color: SDLP_SCENE_COLORS.architecture.api, x: 680, y: 280 },
  { label: 'Vector DB', icon: 'database' as const, color: SDLP_SCENE_COLORS.architecture.database, x: 580, y: 440 },
  { label: 'RAG', icon: 'auth' as const, color: SDLP_SCENE_COLORS.architecture.auth, x: 440, y: 280 },
];

const PIPELINE_STAGES = [
  { label: 'AI要件定義', color: SDLP_SCENE_COLORS.pipeline.requirements },
  { label: 'AI設計', color: SDLP_SCENE_COLORS.pipeline.design },
  { label: 'AI開発', color: SDLP_SCENE_COLORS.pipeline.development },
  { label: 'AIテスト', color: SDLP_SCENE_COLORS.pipeline.testing },
  { label: 'デプロイ', color: SDLP_SCENE_COLORS.pipeline.deploy },
];

export const SdlpHeroAnimation: React.FC<SdlpHeroProps> = ({ isDark }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      {/* Background */}
      <SdlpBackground frame={frame} />

      {/* Phase A: Code Architecture Scene */}
      <ArchitectureScene frame={frame} />

      {/* Phase B: Pipeline Flow Scene */}
      <PipelineScene frame={frame} />
    </AbsoluteFill>
  );
};

// Background with animated gradient orbs
const SdlpBackground: React.FC<{ frame: number }> = ({ frame }) => {
  const rotation = interpolate(frame, [0, 360], [0, 360], {
    extrapolateRight: 'extend',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: SDLP_SCENE_COLORS.bg.dark,
        overflow: 'hidden',
      }}
    >
      {/* Grid pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(37, 99, 235, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(37, 99, 235, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

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
            top: '15%',
            right: '15%',
            width: 250,
            height: 250,
            borderRadius: '50%',
            background: 'rgba(37, 99, 235, 0.12)',
            filter: 'blur(60px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '15%',
            left: '15%',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(6, 182, 212, 0.1)',
            filter: 'blur(60px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: 'rgba(168, 85, 247, 0.08)',
            filter: 'blur(50px)',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// Phase A: Architecture Scene (frames 0-180)
const ArchitectureScene: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [150, 180], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{ opacity }}>
      {/* Code typewriter on left */}
      <CodeTypewriter startFrame={5} />

      {/* Architecture nodes on right */}
      {ARCHITECTURE_NODES.map((node, i) => (
        <ArchitectureNode
          key={node.label}
          label={node.label}
          icon={node.icon}
          color={node.color}
          x={node.x}
          y={node.y}
          enterFrame={40 + i * 18}
        />
      ))}

      {/* Connection lines between nodes */}
      <ConnectionParticles frame={frame} />
    </div>
  );
};

// Animated connection particles between architecture nodes
const ConnectionParticles: React.FC<{ frame: number }> = ({ frame }) => {
  const connections = [
    { from: ARCHITECTURE_NODES[0], to: ARCHITECTURE_NODES[1], startFrame: 100 },
    { from: ARCHITECTURE_NODES[1], to: ARCHITECTURE_NODES[2], startFrame: 110 },
    { from: ARCHITECTURE_NODES[3], to: ARCHITECTURE_NODES[0], startFrame: 105 },
    { from: ARCHITECTURE_NODES[3], to: ARCHITECTURE_NODES[2], startFrame: 115 },
  ];

  return (
    <>
      {connections.map((conn, i) => (
        <ConnectionLine
          key={i}
          fromX={conn.from.x}
          fromY={conn.from.y}
          toX={conn.to.x}
          toY={conn.to.y}
          color={SDLP_SCENE_COLORS.glow.cyan}
          startFrame={conn.startFrame}
        />
      ))}
    </>
  );
};

// Single connection line with flowing particle
interface ConnectionLineProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color: string;
  startFrame: number;
}

const ConnectionLine: React.FC<ConnectionLineProps> = ({
  fromX,
  fromY,
  toX,
  toY,
  color,
  startFrame,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  if (localFrame < 0) return null;

  const lineOpacity = interpolate(localFrame, [0, 10], [0, 0.3], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Looping particle along line
  const cycleLength = 60;
  const cycleFrame = localFrame % cycleLength;
  const particleProgress = interpolate(cycleFrame, [0, cycleLength], [0, 1]);

  const particleX = fromX + (toX - fromX) * particleProgress;
  const particleY = fromY + (toY - fromY) * particleProgress;

  const particleOpacity = interpolate(
    particleProgress,
    [0, 0.1, 0.9, 1],
    [0, 1, 1, 0],
  );

  // Line angle for SVG
  const angle = Math.atan2(toY - fromY, toX - fromX);
  const length = Math.sqrt((toX - fromX) ** 2 + (toY - fromY) ** 2);

  return (
    <>
      {/* Static line */}
      <svg
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <line
          x1={fromX}
          y1={fromY}
          x2={toX}
          y2={toY}
          stroke={color}
          strokeWidth={1}
          opacity={lineOpacity}
          strokeDasharray="4 4"
        />
      </svg>

      {/* Flowing particle */}
      <div
        style={{
          position: 'absolute',
          left: particleX,
          top: particleY,
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: color,
          transform: 'translate(-50%, -50%)',
          opacity: particleOpacity * lineOpacity * 3,
          boxShadow: `0 0 8px ${color}`,
        }}
      />
    </>
  );
};

// Phase B: Pipeline Scene (frames 180-360)
const PipelineScene: React.FC<{ frame: number }> = ({ frame }) => {
  const fadeIn = interpolate(frame, [180, 210], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const fadeOut = interpolate(frame, [330, 360], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const stageSpacing = 140;
  const startX = 400 - ((PIPELINE_STAGES.length - 1) * stageSpacing) / 2;
  const centerY = 300;

  return (
    <div style={{ opacity: fadeIn * fadeOut }}>
      {/* Title */}
      <PipelineTitle frame={frame} />

      {/* Connecting line between stages */}
      <svg
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <line
          x1={startX}
          y1={centerY}
          x2={startX + (PIPELINE_STAGES.length - 1) * stageSpacing}
          y2={centerY}
          stroke="rgba(51, 65, 85, 0.3)"
          strokeWidth={2}
          strokeDasharray="6 4"
        />
      </svg>

      {/* Pipeline stages */}
      {PIPELINE_STAGES.map((stage, i) => (
        <PipelineStage
          key={stage.label}
          label={stage.label}
          color={stage.color}
          x={startX + i * stageSpacing}
          y={centerY}
          activateFrame={210 + i * 20}
          index={i}
        />
      ))}

      {/* Flow particles */}
      <PipelineFlowParticles frame={frame} startX={startX} centerY={centerY} stageSpacing={stageSpacing} />
    </div>
  );
};

// Pipeline title
const PipelineTitle: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [190, 210], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const y = interpolate(frame, [190, 210], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: 80,
        width: '100%',
        textAlign: 'center',
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      <span
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: SDLP_SCENE_COLORS.text.primary,
          fontFamily: 'Inter, system-ui, sans-serif',
          letterSpacing: 2,
        }}
      >
        DEVELOPMENT PIPELINE
      </span>
      <div
        style={{
          marginTop: 8,
          width: 60,
          height: 2,
          background: `linear-gradient(90deg, ${SDLP_SCENE_COLORS.glow.cyan}, ${SDLP_SCENE_COLORS.glow.blue})`,
          borderRadius: 1,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      />
    </div>
  );
};

// Flow particles moving left to right across pipeline
const PipelineFlowParticles: React.FC<{
  frame: number;
  startX: number;
  centerY: number;
  stageSpacing: number;
}> = ({ frame, startX, centerY, stageSpacing }) => {
  const sceneStart = 220;
  const localFrame = frame - sceneStart;

  if (localFrame < 0) return null;

  const totalWidth = (PIPELINE_STAGES.length - 1) * stageSpacing;

  return (
    <>
      {[0, 1, 2].map((wave) => {
        const waveFrame = localFrame - wave * 25;
        if (waveFrame < 0) return null;

        const cycleLength = 90;
        const cycleFrame = waveFrame % cycleLength;
        const progress = interpolate(cycleFrame, [0, cycleLength], [0, 1]);
        const eased = 1 - Math.pow(1 - progress, 2);

        const particleX = startX + eased * totalWidth;
        const particleY = centerY - 55;

        const opacity = interpolate(
          progress,
          [0, 0.05, 0.9, 1],
          [0, 0.8, 0.8, 0],
        );

        return (
          <React.Fragment key={wave}>
            <div
              style={{
                position: 'absolute',
                left: particleX,
                top: particleY,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: SDLP_SCENE_COLORS.glow.cyan,
                transform: 'translate(-50%, -50%)',
                opacity,
                boxShadow: `0 0 12px ${SDLP_SCENE_COLORS.glow.cyan}`,
              }}
            />
            {/* Trail */}
            {[0.08, 0.16].map((delay, j) => {
              const trailProgress = Math.max(0, eased - delay);
              const trailX = startX + trailProgress * totalWidth;
              return (
                <div
                  key={j}
                  style={{
                    position: 'absolute',
                    left: trailX,
                    top: particleY,
                    width: 5 - j,
                    height: 5 - j,
                    borderRadius: '50%',
                    background: SDLP_SCENE_COLORS.glow.cyan,
                    transform: 'translate(-50%, -50%)',
                    opacity: opacity * (0.5 - j * 0.15),
                  }}
                />
              );
            })}
          </React.Fragment>
        );
      })}
    </>
  );
};
