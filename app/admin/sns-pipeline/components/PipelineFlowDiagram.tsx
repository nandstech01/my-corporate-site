'use client'

import { useState } from 'react'

interface PipelineFlowDiagramProps {
  xPostCount: number
  linkedinPostCount: number
  instagramPostCount: number
  blogTopicCount: number
  xActive: boolean
  linkedinActive: boolean
  instagramActive: boolean
  blogActive: boolean
  onPlatformClick: (platform: string) => void
}

const COLORS = {
  bg: '#0d1a1d',
  card: '#182f34',
  cardInner: '#102023',
  border: '#224249',
  accent: '#06B6D4',
  text: '#F8FAFC',
  textMuted: '#6a8b94',
} as const

const PLATFORMS = [
  {
    id: 'x',
    label: 'X',
    icon: '\u{1D54F}',
    color: '#FFFFFF',
    cx: '22%',
    cy: '18%',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: '\uD83D\uDCBC',
    color: '#0077B5',
    cx: '78%',
    cy: '18%',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    icon: '\uD83D\uDCF7',
    color: '#E1306C',
    cx: '22%',
    cy: '78%',
  },
  {
    id: 'blog',
    label: 'Blog RSS',
    icon: '\uD83D\uDCF0',
    color: '#F97316',
    cx: '78%',
    cy: '78%',
  },
] as const

export default function PipelineFlowDiagram({
  xPostCount,
  linkedinPostCount,
  instagramPostCount,
  blogTopicCount,
  xActive,
  linkedinActive,
  instagramActive,
  blogActive,
  onPlatformClick,
}: PipelineFlowDiagramProps) {
  const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null)

  const counts: Record<string, number> = {
    x: xPostCount,
    linkedin: linkedinPostCount,
    instagram: instagramPostCount,
    blog: blogTopicCount,
  }

  const actives: Record<string, boolean> = {
    x: xActive,
    linkedin: linkedinActive,
    instagram: instagramActive,
    blog: blogActive,
  }

  return (
    <div
      className="relative rounded-xl overflow-hidden"
      style={{
        background: COLORS.bg,
        border: `1px solid ${COLORS.border}`,
        minHeight: 380,
      }}
    >
      {/* Dot grid background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(${COLORS.border} 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Radial gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, transparent 30%, ${COLORS.bg} 80%)`,
        }}
      />

      {/* Pipeline Flow badge */}
      <div
        className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase"
        style={{
          background: COLORS.card,
          border: `1px solid ${COLORS.border}`,
          color: COLORS.textMuted,
        }}
      >
        Pipeline Flow
      </div>

      {/* LIVE indicator */}
      <div
        className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wider"
        style={{
          background: COLORS.card,
          border: `1px solid ${COLORS.border}`,
          color: '#EF4444',
        }}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
        </span>
        LIVE
      </div>

      {/* SVG layer with lines, glows, and particles */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {PLATFORMS.map((p) => (
            <linearGradient
              key={`grad-${p.id}`}
              id={`grad-${p.id}`}
              x1="50%"
              y1="50%"
              x2={p.cx}
              y2={p.cy}
            >
              <stop offset="0%" stopColor={COLORS.accent} />
              <stop offset="100%" stopColor={p.color} />
            </linearGradient>
          ))}
          <filter id="glow">
            <feGaussianBlur stdDeviation="0.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Gradient lines from center to each platform */}
        {PLATFORMS.map((p) => (
          <line
            key={`line-${p.id}`}
            x1="50"
            y1="50"
            x2={parseFloat(p.cx)}
            y2={parseFloat(p.cy)}
            stroke={`url(#grad-${p.id})`}
            strokeWidth="0.3"
            strokeLinecap="round"
            filter="url(#glow)"
            opacity="0.7"
          />
        ))}

        {/* Animated particles flowing from center to each platform */}
        {PLATFORMS.map((p, i) => {
          const durations = ['2.8s', '3.2s', '3.6s', '4s']
          const endX = parseFloat(p.cx)
          const endY = parseFloat(p.cy)
          return (
            <circle
              key={`particle-${p.id}`}
              r="0.6"
              fill={p.color}
              filter="url(#glow)"
              opacity="0.9"
            >
              <animate
                attributeName="cx"
                values={`50;${endX};${endX};50`}
                dur={durations[i]}
                repeatCount="indefinite"
                keyTimes="0;0.45;0.55;1"
              />
              <animate
                attributeName="cy"
                values={`50;${endY};${endY};50`}
                dur={durations[i]}
                repeatCount="indefinite"
                keyTimes="0;0.45;0.55;1"
              />
              <animate
                attributeName="opacity"
                values="0;0.9;0.9;0"
                dur={durations[i]}
                repeatCount="indefinite"
                keyTimes="0;0.3;0.7;1"
              />
            </circle>
          )
        })}
      </svg>

      {/* Node layer */}
      <div className="relative w-full h-full" style={{ minHeight: 380 }}>
        {/* Center node: Slack Bot */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 center-float"
          style={{ animation: 'centerFloat 3s ease-in-out infinite' }}
        >
          <button
            type="button"
            className="flex flex-col items-center gap-1 px-6 py-4 rounded-2xl cursor-default"
            style={{
              background: COLORS.cardInner,
              border: `2px solid ${COLORS.accent}`,
              boxShadow: `0 0 24px ${COLORS.accent}33, 0 0 48px ${COLORS.accent}15`,
            }}
          >
            <span className="text-2xl" role="img" aria-label="robot">
              {'\uD83E\uDD16'}
            </span>
            <span
              className="text-sm font-bold tracking-wide"
              style={{ color: COLORS.text }}
            >
              Slack Bot
            </span>
          </button>
        </div>

        {/* Platform nodes */}
        {PLATFORMS.map((p) => {
          const isActive = actives[p.id]
          const count = counts[p.id]

          const positionMap: Record<string, string> = {
            x: 'left-[22%] top-[18%]',
            linkedin: 'left-[78%] top-[18%]',
            instagram: 'left-[22%] top-[78%]',
            blog: 'left-[78%] top-[78%]',
          }

          return (
            <div
              key={p.id}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 ${positionMap[p.id]}`}
            >
              <button
                type="button"
                onClick={() => onPlatformClick(p.id)}
                className="group flex flex-col items-center gap-1.5 px-5 py-3 rounded-xl transition-all duration-200 hover:scale-105"
                style={{
                  background: COLORS.card,
                  border: `1.5px solid ${hoveredPlatform === p.id ? p.color : COLORS.border}`,
                  boxShadow: hoveredPlatform === p.id ? `0 0 16px ${p.color}33` : 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={() => setHoveredPlatform(p.id)}
                onMouseLeave={() => setHoveredPlatform(null)}
              >
                {/* Status indicator */}
                <div className="absolute -top-1.5 -right-1.5">
                  <span
                    className="block h-3 w-3 rounded-full border-2"
                    style={{
                      background: isActive ? '#22C55E' : '#6B7280',
                      borderColor: COLORS.card,
                    }}
                  />
                </div>

                <span className="text-lg" role="img" aria-label={p.label}>
                  {p.icon}
                </span>
                <span
                  className="text-xs font-semibold"
                  style={{ color: p.color }}
                >
                  {p.label}
                </span>

                {/* Post count badge */}
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{
                    background: `${p.color}20`,
                    color: p.color,
                  }}
                >
                  {count} {p.id === 'blog' ? 'topics' : 'posts'}
                </span>
              </button>
            </div>
          )
        })}
      </div>

      {/* eslint-disable-next-line react/no-unknown-property */}
      <style jsx>{`
        @keyframes centerFloat {
          0%,
          100% {
            transform: translate(-50%, -50%) translateY(0px);
          }
          50% {
            transform: translate(-50%, -50%) translateY(-6px);
          }
        }
      `}</style>
    </div>
  )
}
