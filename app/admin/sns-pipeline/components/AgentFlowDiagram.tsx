'use client'

import { useMemo, useState } from 'react'
import type { LangSmithTrace } from '../use-langsmith-data'

const COLORS = {
  bg: '#0d1a1d',
  card: '#182f34',
  cardInner: '#102023',
  border: '#224249',
  borderSubtle: '#1e3a3f',
  accent: '#06B6D4',
  accentGlow: 'rgba(6,182,212,0.4)',
  text: '#F8FAFC',
  textMuted: '#6a8b94',
  textDim: '#56737a',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  purple: '#8B5CF6',
} as const

interface AgentFlowDiagramProps {
  readonly latestTrace: LangSmithTrace | null
}

const NODE_POSITIONS = {
  start: { top: '50%', left: '8%' },
  loadMemory: { top: '50%', left: '28%' },
  agent: { top: '50%', left: '50%' },
  shouldContinue: { top: '75%', left: '50%' },
  tools: { top: '75%', left: '28%' },
  end: { top: '75%', left: '72%' },
} as const

const EDGES = [
  { id: 'start-load', from: { x: '8%', y: '50%' }, to: { x: '28%', y: '50%' }, color1: COLORS.accent, color2: COLORS.success, dur: '2.8s' },
  { id: 'load-agent', from: { x: '28%', y: '50%' }, to: { x: '50%', y: '50%' }, color1: COLORS.success, color2: COLORS.accent, dur: '3.2s' },
  { id: 'agent-should', from: { x: '50%', y: '50%' }, to: { x: '50%', y: '75%' }, color1: COLORS.accent, color2: COLORS.warning, dur: '3.5s' },
  { id: 'should-tools', from: { x: '50%', y: '75%' }, to: { x: '28%', y: '75%' }, color1: COLORS.warning, color2: COLORS.purple, dur: '3.8s' },
  { id: 'should-end', from: { x: '50%', y: '75%' }, to: { x: '72%', y: '75%' }, color1: COLORS.warning, color2: COLORS.accent, dur: '4.0s' },
] as const

export default function AgentFlowDiagram({ latestTrace }: AgentFlowDiagramProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  const nodeLatencies = useMemo(() => {
    if (!latestTrace) return new Map<string, string>()
    const map = new Map<string, string>()
    if (latestTrace.latencyMs > 0) {
      map.set('agent', `${(latestTrace.latencyMs / 1000).toFixed(1)}s`)
    }
    if (latestTrace.toolCalls.length > 0) {
      map.set('tools', `${latestTrace.toolCalls.length} calls`)
    }
    if (latestTrace.totalTokens > 0) {
      map.set('loadMemory', `${latestTrace.totalTokens.toLocaleString()} tok`)
    }
    return map
  }, [latestTrace])

  const isEdgeConnected = (edgeId: string): boolean => {
    if (!hoveredNode) return false
    const connections: Record<string, readonly string[]> = {
      start: ['start-load'],
      loadMemory: ['start-load', 'load-agent'],
      agent: ['load-agent', 'agent-should', 'tools-agent'],
      shouldContinue: ['agent-should', 'should-tools', 'should-end'],
      tools: ['should-tools', 'tools-agent'],
      end: ['should-end'],
    }
    return connections[hoveredNode]?.includes(edgeId) ?? false
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}
    >
      {/* Header */}
      <div className="px-5 py-4">
        <h3 className="text-sm font-bold" style={{ color: COLORS.text }}>
          Agent Flow (LangGraph DAG)
        </h3>
        <p className="text-[10px] mt-0.5" style={{ color: COLORS.textMuted }}>
          START → loadMemory → agent → [shouldContinue] → tools → agent → END
        </p>
      </div>

      {/* Flow container */}
      <div
        className="relative mx-2 mb-4 rounded-lg overflow-hidden"
        style={{
          background: COLORS.bg,
          border: `1px solid ${COLORS.borderSubtle}`,
          minHeight: '380px',
        }}
      >
        {/* AGENT FLOW label */}
        <div className="absolute top-3 left-3 z-10">
          <span
            className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded"
            style={{
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: COLORS.textMuted,
            }}
          >
            Agent Flow
          </span>
        </div>

        {/* Dot grid background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(rgba(6,182,212,0.15) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            opacity: 0.3,
          }}
        />

        {/* Radial gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(6,182,212,0.05) 0%, transparent 70%)',
          }}
        />

        {/* SVG overlay for edges + particles */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-[1]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="glow-line">
              <feGaussianBlur result="coloredBlur" stdDeviation="2" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Edge gradients */}
            <linearGradient id="grad-start-load" x1="8%" y1="50%" x2="28%" y2="50%">
              <stop offset="0%" stopColor={COLORS.accent} stopOpacity="0.8" />
              <stop offset="100%" stopColor={COLORS.success} stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="grad-load-agent" x1="28%" y1="50%" x2="50%" y2="50%">
              <stop offset="0%" stopColor={COLORS.success} stopOpacity="0.8" />
              <stop offset="100%" stopColor={COLORS.accent} stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="grad-agent-should" x1="50%" y1="50%" x2="50%" y2="75%">
              <stop offset="0%" stopColor={COLORS.accent} stopOpacity="0.8" />
              <stop offset="100%" stopColor={COLORS.warning} stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="grad-should-tools" x1="50%" y1="75%" x2="28%" y2="75%">
              <stop offset="0%" stopColor={COLORS.warning} stopOpacity="0.8" />
              <stop offset="100%" stopColor={COLORS.purple} stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="grad-should-end" x1="50%" y1="75%" x2="72%" y2="75%">
              <stop offset="0%" stopColor={COLORS.warning} stopOpacity="0.8" />
              <stop offset="100%" stopColor={COLORS.accent} stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="grad-tools-agent" x1="28%" y1="75%" x2="50%" y2="50%">
              <stop offset="0%" stopColor={COLORS.purple} stopOpacity="0.8" />
              <stop offset="100%" stopColor={COLORS.accent} stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Straight edges */}
          {EDGES.map((edge) => (
            <line
              key={edge.id}
              x1={edge.from.x}
              y1={edge.from.y}
              x2={edge.to.x}
              y2={edge.to.y}
              stroke={`url(#grad-${edge.id})`}
              strokeWidth="2"
              filter="url(#glow-line)"
              opacity={isEdgeConnected(edge.id) ? 1.0 : 0.6}
              style={{ transition: 'opacity 0.3s ease' }}
            />
          ))}

          {/* Curved tools→agent loop-back */}
          <path
            d="M 28% 75% C 15% 75%, 15% 50%, 28% 50%"
            fill="none"
            stroke="url(#grad-tools-agent)"
            strokeWidth="2"
            filter="url(#glow-line)"
            opacity={isEdgeConnected('tools-agent') ? 1.0 : 0.6}
            style={{ transition: 'opacity 0.3s ease' }}
          />

          {/* Animated particles for straight edges */}
          {EDGES.map((edge) => (
            <circle key={`p-${edge.id}`} r="3" fill={COLORS.accent} opacity="0">
              <animate attributeName="cx" values={`${edge.from.x};${edge.to.x}`} dur={edge.dur} repeatCount="indefinite" />
              <animate attributeName="cy" values={`${edge.from.y};${edge.to.y}`} dur={edge.dur} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;1;1;0" dur={edge.dur} repeatCount="indefinite" />
            </circle>
          ))}

          {/* Particle for curved tools→agent path */}
          <circle r="3" fill={COLORS.accent} opacity="0">
            <animate attributeName="cx" values="28%;15%;15%;28%" dur="4.4s" repeatCount="indefinite" keyTimes="0;0.3;0.7;1" />
            <animate attributeName="cy" values="75%;75%;50%;50%" dur="4.4s" repeatCount="indefinite" keyTimes="0;0.3;0.7;1" />
            <animate attributeName="opacity" values="0;1;1;0" dur="4.4s" repeatCount="indefinite" />
          </circle>
        </svg>

        {/* ===== HTML NODES ===== */}

        {/* START node (pill) */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
          style={{
            top: NODE_POSITIONS.start.top,
            left: NODE_POSITIONS.start.left,
            transition: 'transform 0.2s ease',
            transform: `translate(-50%, -50%) ${hoveredNode === 'start' ? 'scale(1.1)' : 'scale(1)'}`,
          }}
          onMouseEnter={() => setHoveredNode('start')}
          onMouseLeave={() => setHoveredNode(null)}
        >
          <div
            className="px-4 py-2 rounded-full font-mono text-xs font-bold"
            style={{
              background: 'rgba(6,182,212,0.1)',
              border: '1px solid rgba(6,182,212,0.5)',
              boxShadow: '0 0 12px rgba(6,182,212,0.15)',
              color: COLORS.accent,
            }}
          >
            START
          </div>
        </div>

        {/* loadMemory node */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
          style={{
            top: NODE_POSITIONS.loadMemory.top,
            left: NODE_POSITIONS.loadMemory.left,
            transition: 'transform 0.2s ease',
            transform: `translate(-50%, -50%) ${hoveredNode === 'loadMemory' ? 'scale(1.1)' : 'scale(1)'}`,
          }}
          onMouseEnter={() => setHoveredNode('loadMemory')}
          onMouseLeave={() => setHoveredNode(null)}
        >
          <div
            className="px-4 py-2.5 rounded-xl font-mono text-xs"
            style={{
              background: COLORS.cardInner,
              border: `1px solid ${COLORS.border}`,
              borderLeft: `3px solid ${COLORS.success}`,
              color: COLORS.text,
            }}
          >
            loadMemory
            {nodeLatencies.get('loadMemory') && (
              <div className="text-[9px] mt-1 font-mono" style={{ color: COLORS.accent }}>
                {nodeLatencies.get('loadMemory')}
              </div>
            )}
          </div>
        </div>

        {/* agent (center hub) */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
          style={{
            top: NODE_POSITIONS.agent.top,
            left: NODE_POSITIONS.agent.left,
            transition: 'transform 0.2s ease',
            transform: `translate(-50%, -50%) ${hoveredNode === 'agent' ? 'scale(1.1)' : 'scale(1)'}`,
          }}
          onMouseEnter={() => setHoveredNode('agent')}
          onMouseLeave={() => setHoveredNode(null)}
        >
          <div className="relative" style={{ animation: 'centerFloat 5s ease-in-out infinite' }}>
            <div className="absolute inset-0 bg-[#06B6D4] blur-xl opacity-30 rounded-full animate-pulse" />
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center relative z-10"
              style={{
                background: COLORS.cardInner,
                border: `2px solid ${COLORS.accent}`,
                boxShadow: `0 0 30px ${COLORS.accentGlow}`,
              }}
            >
              <span className="text-2xl">🤖</span>
            </div>
            <div
              className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-0.5 rounded-full text-[10px] font-mono"
              style={{
                background: 'rgba(0,0,0,0.6)',
                border: '1px solid rgba(6,182,212,0.3)',
                color: '#67E8F9',
              }}
            >
              agent
            </div>
            {nodeLatencies.get('agent') && (
              <div
                className="absolute -bottom-[42px] left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-mono"
                style={{ color: COLORS.accent }}
              >
                {nodeLatencies.get('agent')}
              </div>
            )}
          </div>
        </div>

        {/* shouldContinue (diamond) */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
          style={{
            top: NODE_POSITIONS.shouldContinue.top,
            left: NODE_POSITIONS.shouldContinue.left,
            transition: 'transform 0.2s ease',
            transform: `translate(-50%, -50%) ${hoveredNode === 'shouldContinue' ? 'scale(1.1)' : 'scale(1)'}`,
          }}
          onMouseEnter={() => setHoveredNode('shouldContinue')}
          onMouseLeave={() => setHoveredNode(null)}
        >
          <div style={{ animation: 'float 4s ease-in-out infinite' }}>
            <div
              className="w-14 h-14 flex items-center justify-center"
              style={{
                transform: 'rotate(45deg)',
                background: COLORS.cardInner,
                border: '1px solid rgba(245,158,11,0.5)',
                boxShadow: '0 0 16px rgba(245,158,11,0.15)',
                borderRadius: '4px',
              }}
            >
              <span
                className="text-lg font-bold"
                style={{ transform: 'rotate(-45deg)', color: COLORS.warning }}
              >
                ?
              </span>
            </div>
            <div
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-mono"
              style={{ color: COLORS.warning }}
            >
              shouldContinue
            </div>
          </div>
        </div>

        {/* tools node */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
          style={{
            top: NODE_POSITIONS.tools.top,
            left: NODE_POSITIONS.tools.left,
            transition: 'transform 0.2s ease',
            transform: `translate(-50%, -50%) ${hoveredNode === 'tools' ? 'scale(1.1)' : 'scale(1)'}`,
          }}
          onMouseEnter={() => setHoveredNode('tools')}
          onMouseLeave={() => setHoveredNode(null)}
        >
          <div
            className="px-4 py-2.5 rounded-xl font-mono text-xs"
            style={{
              background: COLORS.cardInner,
              border: `1px solid ${COLORS.border}`,
              borderLeft: `3px solid ${COLORS.purple}`,
              color: COLORS.text,
            }}
          >
            tools
            {nodeLatencies.get('tools') && (
              <div className="text-[9px] mt-1 font-mono" style={{ color: COLORS.purple }}>
                {nodeLatencies.get('tools')}
              </div>
            )}
          </div>
        </div>

        {/* END node (pill) */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
          style={{
            top: NODE_POSITIONS.end.top,
            left: NODE_POSITIONS.end.left,
            transition: 'transform 0.2s ease',
            transform: `translate(-50%, -50%) ${hoveredNode === 'end' ? 'scale(1.1)' : 'scale(1)'}`,
          }}
          onMouseEnter={() => setHoveredNode('end')}
          onMouseLeave={() => setHoveredNode(null)}
        >
          <div
            className="px-4 py-2 rounded-full font-mono text-xs font-bold"
            style={{
              background: 'rgba(6,182,212,0.1)',
              border: '1px solid rgba(6,182,212,0.5)',
              boxShadow: '0 0 12px rgba(6,182,212,0.15)',
              color: COLORS.accent,
            }}
          >
            END
          </div>
        </div>
      </div>

      {/* CSS keyframes */}
      <style jsx>{`
        @keyframes centerFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  )
}
