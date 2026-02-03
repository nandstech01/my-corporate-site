import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { SdlpValuePropProps, SDLP_VP_COLORS } from '../types/constants';
import { ChatBubble } from './components/ChatBubble';
import { TypingIndicator } from './components/TypingIndicator';
import { AiCodeEditor } from './components/AiCodeEditor';
import { ComponentTreeNode } from './components/ComponentTreeNode';
import { MetricCard } from './components/MetricCard';

// 3 scenes across 210 frames (7 seconds @ 30fps)
// Scene A: AI Chat (0–75)
// Scene B: Code Generation (65–145) — 10f overlap for crossfade
// Scene C: Metrics (135–210) — 10f overlap for crossfade

export const SdlpValuePropAnimation: React.FC<SdlpValuePropProps> = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <ValuePropBackground frame={frame} />
      <SceneAChat frame={frame} />
      <SceneBCodeGen frame={frame} />
      <SceneCMetrics frame={frame} />
    </AbsoluteFill>
  );
};

// --- Background ---
const ValuePropBackground: React.FC<{ frame: number }> = ({ frame }) => {
  const rotation = interpolate(frame, [0, 210], [0, 180], {
    extrapolateRight: 'extend',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: SDLP_VP_COLORS.bg.dark,
        overflow: 'hidden',
      }}
    >
      {/* Subtle grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(37, 99, 235, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(37, 99, 235, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
        }}
      />

      {/* Gradient orbs */}
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
            top: '20%',
            right: '20%',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(37, 99, 235, 0.1)',
            filter: 'blur(50px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '20%',
            left: '20%',
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: 'rgba(6, 182, 212, 0.08)',
            filter: 'blur(50px)',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// --- Scene A: AI Chat (frames 0–75) ---
const SceneAChat: React.FC<{ frame: number }> = ({ frame }) => {
  const fadeIn = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const fadeOut = interpolate(frame, [65, 75], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  if (frame > 80) return null;

  return (
    <div style={{ opacity: fadeIn * fadeOut }}>
      {/* Header */}
      <ChatHeader frame={frame} />

      {/* Chat messages container */}
      <div
        style={{
          position: 'absolute',
          left: 40,
          right: 40,
          top: 70,
          bottom: 30,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        {/* User message (right-aligned) */}
        <div style={{ alignSelf: 'flex-end', maxWidth: '75%' }}>
          <ChatBubble
            segments={[{ text: '予約管理システムを作りたい' }]}
            side="right"
            avatarColor={SDLP_VP_COLORS.chat.userAvatar}
            avatarLabel="U"
            enterFrame={10}
          />
        </div>

        {/* Typing indicator */}
        <TypingIndicator
          startFrame={25}
          endFrame={32}
          x={52}
          y={165}
        />

        {/* AI response (left-aligned) */}
        <div style={{ alignSelf: 'flex-start', maxWidth: '80%', marginTop: 10 }}>
          <ChatBubble
            segments={[
              { text: '承知しました。以下で設計します:\n' },
              { text: '▸ ', color: SDLP_VP_COLORS.text.secondary },
              { text: 'Next.js', color: SDLP_VP_COLORS.code.nextjs, bold: true },
              { text: ' + ', color: SDLP_VP_COLORS.text.secondary },
              { text: 'TypeScript', color: SDLP_VP_COLORS.code.typescript, bold: true },
              { text: '\n▸ ', color: SDLP_VP_COLORS.text.secondary },
              { text: 'Supabase', color: SDLP_VP_COLORS.code.supabase, bold: true },
              { text: ' Auth / DB\n', color: SDLP_VP_COLORS.text.secondary },
              { text: '▸ AI予測エンジン搭載 ', color: SDLP_VP_COLORS.text.primary },
              { text: '✨', color: SDLP_VP_COLORS.code.ai },
            ]}
            side="left"
            avatarColor={SDLP_VP_COLORS.chat.aiAvatar}
            avatarLabel="AI"
            enterFrame={30}
            typewriter
            charsPerFrame={1.8}
          />
        </div>
      </div>

      {/* Sparkle particles from AI avatar area */}
      <SparkleParticles frame={frame} startFrame={58} />
    </div>
  );
};

// Chat header bar
const ChatHeader: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: 20,
        left: 40,
        right: 40,
        opacity,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 16px',
        borderRadius: 12,
        background: 'rgba(15, 23, 42, 0.8)',
        border: '1px solid rgba(51, 65, 85, 0.4)',
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#10B981',
        }}
      />
      <span
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: SDLP_VP_COLORS.text.primary,
          fontFamily: 'Inter, system-ui, sans-serif',
          letterSpacing: 0.5,
        }}
      >
        NANDS AI Dev
      </span>
    </div>
  );
};

// Sparkle particles
const SparkleParticles: React.FC<{ frame: number; startFrame: number }> = ({
  frame,
  startFrame,
}) => {
  const localFrame = frame - startFrame;
  if (localFrame < 0 || localFrame > 20) return null;

  const particles = [
    { x: 60, y: 200, delay: 0 },
    { x: 75, y: 185, delay: 2 },
    { x: 50, y: 210, delay: 4 },
    { x: 85, y: 195, delay: 1 },
    { x: 45, y: 190, delay: 3 },
  ];

  return (
    <>
      {particles.map((p, i) => {
        const pFrame = localFrame - p.delay;
        if (pFrame < 0) return null;

        const pOpacity = interpolate(pFrame, [0, 5, 12, 17], [0, 1, 1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        const pY = p.y - pFrame * 2.5;
        const pScale = interpolate(pFrame, [0, 6, 15], [0.3, 1, 0.5], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: p.x,
              top: pY,
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: SDLP_VP_COLORS.code.ai,
              opacity: pOpacity,
              transform: `scale(${pScale})`,
              boxShadow: `0 0 8px ${SDLP_VP_COLORS.code.ai}`,
            }}
          />
        );
      })}
    </>
  );
};

// --- Scene B: Code Generation (frames 65–145) ---
const SceneBCodeGen: React.FC<{ frame: number }> = ({ frame }) => {
  const fadeIn = interpolate(frame, [65, 80], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const fadeOut = interpolate(frame, [135, 145], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  if (frame < 60 || frame > 150) return null;

  // Component tree nodes (right panel)
  const treeNodes = [
    { label: 'ReservationApp', color: SDLP_VP_COLORS.code.nextjs, x: 580, y: 80, enterFrame: 85, icon: '📦' },
    { label: 'Auth', color: SDLP_VP_COLORS.code.supabase, x: 510, y: 160, enterFrame: 95, parentX: 580, parentY: 80, icon: '🔐' },
    { label: 'Dashboard', color: SDLP_VP_COLORS.code.typescript, x: 650, y: 160, enterFrame: 100, parentX: 580, parentY: 80, icon: '📊' },
    { label: 'Calendar', color: SDLP_VP_COLORS.code.keyword, x: 510, y: 240, enterFrame: 108, parentX: 510, parentY: 160, icon: '📅' },
    { label: 'Analytics', color: SDLP_VP_COLORS.code.ai, x: 650, y: 240, enterFrame: 113, parentX: 650, parentY: 160, icon: '📈' },
    { label: 'AI Engine ✨', color: SDLP_VP_COLORS.code.ai, x: 580, y: 330, enterFrame: 120, parentX: 650, parentY: 240, icon: '🤖' },
  ];

  return (
    <div style={{ opacity: fadeIn * fadeOut }}>
      {/* Left panel: Code editor */}
      <AiCodeEditor startFrame={75} fileName="editor.tsx" />

      {/* Vertical divider */}
      <div
        style={{
          position: 'absolute',
          left: 390,
          top: 20,
          bottom: 20,
          width: 1,
          background: 'rgba(51, 65, 85, 0.3)',
          opacity: fadeIn,
        }}
      />

      {/* Right panel: Component tree */}
      {treeNodes.map((node) => (
        <ComponentTreeNode
          key={node.label}
          label={node.label}
          color={node.color}
          x={node.x}
          y={node.y}
          enterFrame={node.enterFrame}
          parentX={node.parentX}
          parentY={node.parentY}
          icon={node.icon}
        />
      ))}

      {/* Right panel title */}
      <SceneBTitle frame={frame} />
    </div>
  );
};

const SceneBTitle: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [70, 82], [0, 0.6], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        right: 40,
        bottom: 30,
        opacity,
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: SDLP_VP_COLORS.text.secondary,
          fontFamily: 'Inter, system-ui, sans-serif',
          letterSpacing: 1,
          textTransform: 'uppercase',
        }}
      >
        Component Architecture
      </span>
    </div>
  );
};

// --- Scene C: Metrics (frames 135–210) ---
const SceneCMetrics: React.FC<{ frame: number }> = ({ frame }) => {
  const fadeIn = interpolate(frame, [135, 150], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const fadeOut = interpolate(frame, [195, 210], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  if (frame < 130) return null;

  const metrics = [
    {
      value: '3x',
      label: '開発速度',
      color: SDLP_VP_COLORS.metrics.speed,
      x: 180,
      enterFrame: 145,
      filledDots: 4,
    },
    {
      value: '40%',
      label: 'コスト削減',
      color: SDLP_VP_COLORS.metrics.cost,
      x: 400,
      enterFrame: 155,
      filledDots: 4,
    },
    {
      value: '99.2%',
      label: '稼働率',
      color: SDLP_VP_COLORS.metrics.uptime,
      x: 620,
      enterFrame: 165,
      filledDots: 5,
    },
  ];

  return (
    <div style={{ opacity: fadeIn * fadeOut }}>
      {/* Title */}
      <MetricsTitle frame={frame} />

      {/* Metric cards */}
      {metrics.map((m) => (
        <MetricCard
          key={m.label}
          value={m.value}
          label={m.label}
          color={m.color}
          x={m.x}
          y={260}
          enterFrame={m.enterFrame}
          filledDots={m.filledDots}
        />
      ))}

      {/* Flow particles between cards */}
      <MetricsFlowParticles frame={frame} />
    </div>
  );
};

const MetricsTitle: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [135, 150], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const y = interpolate(frame, [135, 150], [15, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: 60,
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
          color: SDLP_VP_COLORS.text.primary,
          fontFamily: 'Inter, system-ui, sans-serif',
          letterSpacing: 2,
        }}
      >
        AI DEVELOPMENT RESULTS
      </span>
      <div
        style={{
          marginTop: 8,
          width: 60,
          height: 2,
          background: `linear-gradient(90deg, ${SDLP_VP_COLORS.metrics.speed}, ${SDLP_VP_COLORS.metrics.uptime})`,
          borderRadius: 1,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      />
    </div>
  );
};

// Flow particles between metric cards
const MetricsFlowParticles: React.FC<{ frame: number }> = ({ frame }) => {
  const startFrame = 170;
  const localFrame = frame - startFrame;
  if (localFrame < 0) return null;

  const cardPositions = [180, 400, 620];
  const y = 360;

  return (
    <>
      {[0, 1].map((segIdx) => {
        const fromX = cardPositions[segIdx];
        const toX = cardPositions[segIdx + 1];

        return [0, 1].map((wave) => {
          const waveFrame = localFrame - wave * 15 - segIdx * 8;
          if (waveFrame < 0) return null;

          const cycleLength = 50;
          const cycleFrame = waveFrame % cycleLength;
          const progress = interpolate(cycleFrame, [0, cycleLength], [0, 1]);

          const particleX = fromX + (toX - fromX) * progress;

          const pOpacity = interpolate(
            progress,
            [0, 0.1, 0.85, 1],
            [0, 0.8, 0.8, 0],
          );

          return (
            <React.Fragment key={`${segIdx}-${wave}`}>
              <div
                style={{
                  position: 'absolute',
                  left: particleX,
                  top: y,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: SDLP_VP_COLORS.metrics.cost,
                  transform: 'translate(-50%, -50%)',
                  opacity: pOpacity,
                  boxShadow: `0 0 8px ${SDLP_VP_COLORS.metrics.cost}`,
                }}
              />
              {/* Trail dot */}
              <div
                style={{
                  position: 'absolute',
                  left: fromX + (toX - fromX) * Math.max(0, progress - 0.1),
                  top: y,
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: SDLP_VP_COLORS.metrics.cost,
                  transform: 'translate(-50%, -50%)',
                  opacity: pOpacity * 0.4,
                }}
              />
            </React.Fragment>
          );
        });
      })}
    </>
  );
};
