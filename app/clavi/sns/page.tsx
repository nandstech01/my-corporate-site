'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useClaviTheme } from '@/app/clavi/context'
import {
  Sparkles,
  TrendingUp,
  Network,
  Clock,
  ChevronDown,
  Zap,
} from 'lucide-react'

const platforms = [
  {
    id: 'youtube',
    name: 'YouTube',
    color: '#FF0000',
    glow: 'rgba(255,0,0,0.4)',
    icon: '▶',
    count: 1,
    top: '18%',
    left: '22%',
    status: 'Ready',
    statusColor: 'emerald',
    draft: {
      title: '"AIがSEOを変える？ 2026年の最新トレンド"',
      label: 'Title Idea',
      action: 'スクリプト確認',
    },
  },
  {
    id: 'instagram',
    name: 'Instagram',
    color: '#E1306C',
    glow: 'rgba(225,48,108,0.4)',
    icon: '📷',
    count: 3,
    top: '18%',
    left: '78%',
    status: 'Editing',
    statusColor: 'amber',
    draft: {
      title: '🚀 コンテンツマーケティングの新時代！AI活用で効率3倍に。#SEO #ContentMarketing ...',
      label: 'Caption',
      action: 'キャプション編集',
    },
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    color: '#0077B5',
    glow: 'rgba(0,119,181,0.4)',
    icon: '💼',
    count: 1,
    top: '78%',
    left: '22%',
    status: 'Ready',
    statusColor: 'emerald',
    draft: {
      title: 'プロフェッショナル向けインサイト。生産性向上と戦略的優位性に焦点。',
      label: 'Focus',
      action: '投稿を確認',
    },
  },
  {
    id: 'x',
    name: 'X (Twitter)',
    color: '#FFFFFF',
    glow: 'rgba(255,255,255,0.2)',
    icon: '𝕏',
    count: 5,
    top: '78%',
    left: '78%',
    status: 'Ready',
    statusColor: 'emerald',
    draft: {
      title: '1/5 生成AIはバズワードではない。ワークフロー革命です。🧵👇',
      label: 'Thread',
      action: 'スレッド確認',
    },
  },
]

export default function SnsPage() {
  const { theme } = useClaviTheme()
  const isDark = theme === 'dark'
  const [scheduleAll, setScheduleAll] = useState(true)
  const [autoPost, setAutoPost] = useState(false)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            SNS Auto-Generation
            <span
              className="px-2 py-0.5 rounded text-[10px] font-bold"
              style={{
                background: isDark ? 'rgba(6,182,212,0.1)' : '#ECFEFF',
                color: '#06B6D4',
                border: `1px solid ${isDark ? 'rgba(6,182,212,0.2)' : '#A5F3FC'}`,
              }}
            >
              BETA
            </span>
          </h1>
          <p className="text-xs mt-0.5" style={{ color: isDark ? '#90c1cb' : '#64748B' }}>
            ブログ記事からSNS投稿を自動生成・配信
          </p>
        </div>
      </div>

      {/* Source Selector + KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-5 flex-shrink-0">
        <div className="lg:col-span-8">
          <div
            className="rounded-xl p-1 flex items-center gap-2"
            style={{
              background: isDark ? '#182f34' : '#FFFFFF',
              border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
            }}
          >
            <div
              className="flex-1 flex items-center gap-3 px-4 py-2 rounded-lg"
              style={{
                background: isDark ? '#102023' : '#F8FAFC',
                border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>
                Source
              </span>
              <div className="h-4 w-px" style={{ background: isDark ? '#224249' : '#E2E8F0' }} />
              <span className="text-xs font-medium flex-1" style={{ color: isDark ? '#E2E8F0' : '#334155' }}>
                AI Trends in 2026: The Generative Shift
              </span>
              <ChevronDown className="w-4 h-4" style={{ color: isDark ? '#56737a' : '#94A3B8' }} />
            </div>
            <button className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold text-white bg-[#06B6D4] hover:bg-[#0891B2] transition-colors shadow-lg shadow-cyan-500/20 whitespace-nowrap">
              <Sparkles className="w-4 h-4" />
              全て再生成
            </button>
          </div>
        </div>

        <div className="lg:col-span-4 grid grid-cols-2 gap-3">
          <div
            className="rounded-xl p-3.5 relative overflow-hidden group"
            style={{
              background: isDark ? '#182f34' : '#FFFFFF',
              border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
            }}
          >
            <TrendingUp className="absolute top-2 right-2 w-8 h-8 opacity-5 group-hover:opacity-10 transition-opacity" style={{ color: '#06B6D4' }} />
            <div className="text-[10px] font-medium mb-1" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>
              予測エンゲージメント
            </div>
            <div className="flex items-end gap-1.5">
              <span className="text-xl font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>+450%</span>
              <span className="text-[10px] font-medium text-emerald-500 mb-0.5">▲ High</span>
            </div>
            <div className="w-full h-1 rounded-full mt-2.5 overflow-hidden" style={{ background: isDark ? '#224249' : '#E2E8F0' }}>
              <div className="h-full w-[85%] rounded-full bg-[#06B6D4]" style={{ boxShadow: '0 0 8px #06B6D4' }} />
            </div>
          </div>
          <div
            className="rounded-xl p-3.5 relative overflow-hidden group"
            style={{
              background: isDark ? '#182f34' : '#FFFFFF',
              border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
            }}
          >
            <Network className="absolute top-2 right-2 w-8 h-8 opacity-5 group-hover:opacity-10 transition-opacity" style={{ color: '#A855F7' }} />
            <div className="text-[10px] font-medium mb-1" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>
              リーチ倍率
            </div>
            <div className="flex items-end gap-1.5">
              <span className="text-xl font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>12.4x</span>
              <span className="text-[10px] font-medium text-purple-400 mb-0.5">Cross-platform</span>
            </div>
            <div className="w-full h-1 rounded-full mt-2.5 overflow-hidden" style={{ background: isDark ? '#224249' : '#E2E8F0' }}>
              <div className="h-full w-[65%] rounded-full bg-purple-500" style={{ boxShadow: '0 0 8px #A855F7' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Main: Visual Flow + Automation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6 flex-shrink-0">
        {/* Visual Flow Graph */}
        <div
          className="lg:col-span-2 rounded-xl overflow-hidden relative"
          style={{
            background: isDark ? '#0d1a1d' : '#F8FAFC',
            border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
            minHeight: '380px',
          }}
        >
          {/* Label */}
          <div className="absolute top-3 left-3 z-10">
            <span
              className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded"
              style={{
                background: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.9)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`,
                color: isDark ? '#6a8b94' : '#94A3B8',
              }}
            >
              Visual Flow
            </span>
          </div>

          {/* Dot Grid Background */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(${isDark ? 'rgba(6,182,212,0.15)' : '#CBD5E1'} 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
              opacity: 0.3,
            }}
          />

          {/* Radial gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: isDark
                ? 'radial-gradient(ellipse at center, rgba(6,182,212,0.05) 0%, transparent 70%)'
                : 'radial-gradient(ellipse at center, rgba(6,182,212,0.03) 0%, transparent 70%)',
            }}
          />

          {/* SVG Lines with gradients */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-[1]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="grad-yt" x1="50%" y1="50%" x2="22%" y2="18%">
                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#FF0000" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="grad-ig" x1="50%" y1="50%" x2="78%" y2="18%">
                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#E1306C" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="grad-li" x1="50%" y1="50%" x2="22%" y2="78%">
                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0077B5" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="grad-x" x1="50%" y1="50%" x2="78%" y2="78%">
                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.8)" stopOpacity="0.8" />
              </linearGradient>
              <filter id="glow-line">
                <feGaussianBlur result="coloredBlur" stdDeviation="2" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <line x1="50%" y1="50%" x2="22%" y2="18%" stroke="url(#grad-yt)" strokeWidth="2" filter="url(#glow-line)" opacity="0.6" />
            <line x1="50%" y1="50%" x2="78%" y2="18%" stroke="url(#grad-ig)" strokeWidth="2" filter="url(#glow-line)" opacity="0.6" />
            <line x1="50%" y1="50%" x2="22%" y2="78%" stroke="url(#grad-li)" strokeWidth="2" filter="url(#glow-line)" opacity="0.6" />
            <line x1="50%" y1="50%" x2="78%" y2="78%" stroke="url(#grad-x)" strokeWidth="2" filter="url(#glow-line)" opacity="0.6" />

            {/* Animated particles */}
            <circle r="3" fill="#06B6D4" opacity="0">
              <animate attributeName="cx" values="50%;22%" dur="3s" repeatCount="indefinite" />
              <animate attributeName="cy" values="50%;18%" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;1;1;0" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle r="3" fill="#06B6D4" opacity="0">
              <animate attributeName="cx" values="50%;78%" dur="3.5s" repeatCount="indefinite" />
              <animate attributeName="cy" values="50%;18%" dur="3.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;1;1;0" dur="3.5s" repeatCount="indefinite" />
            </circle>
            <circle r="3" fill="#06B6D4" opacity="0">
              <animate attributeName="cx" values="50%;22%" dur="4s" repeatCount="indefinite" />
              <animate attributeName="cy" values="50%;78%" dur="4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;1;1;0" dur="4s" repeatCount="indefinite" />
            </circle>
            <circle r="3" fill="#06B6D4" opacity="0">
              <animate attributeName="cx" values="50%;78%" dur="2.8s" repeatCount="indefinite" />
              <animate attributeName="cy" values="50%;78%" dur="2.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;1;1;0" dur="2.8s" repeatCount="indefinite" />
            </circle>
          </svg>

          {/* Center Node - Source Content */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="relative" style={{ animation: 'centerFloat 5s ease-in-out infinite' }}>
              <div className="absolute inset-0 bg-[#06B6D4] blur-xl opacity-30 rounded-full animate-pulse" />
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center relative z-10"
                style={{
                  background: isDark ? '#102023' : '#FFFFFF',
                  border: '2px solid #06B6D4',
                  boxShadow: '0 0 30px rgba(6,182,212,0.4)',
                }}
              >
                <span className="text-2xl">📝</span>
              </div>
              <div
                className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-0.5 rounded-full text-[10px] font-mono"
                style={{
                  background: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.9)',
                  border: `1px solid ${isDark ? 'rgba(6,182,212,0.3)' : '#A5F3FC'}`,
                  color: isDark ? '#67E8F9' : '#0E7490',
                }}
              >
                Source Content
              </div>
            </div>
          </div>

          {/* Platform Nodes */}
          {platforms.map((p) => (
            <div
              key={p.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer hover:scale-110 transition-transform"
              style={{ top: p.top, left: p.left }}
            >
              <div className="relative">
                <div
                  className="absolute -inset-1 blur opacity-20 group-hover:opacity-40 transition-opacity rounded-2xl"
                  style={{ background: p.color }}
                />
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center relative"
                  style={{
                    background: isDark ? '#102023' : '#FFFFFF',
                    border: `1px solid ${p.color}50`,
                    boxShadow: `0 0 20px ${p.glow}`,
                  }}
                >
                  <span className="text-xl">{p.icon}</span>
                  <div
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                    style={{
                      background: p.color === '#FFFFFF' ? '#6B7280' : p.color,
                      border: `2px solid ${isDark ? '#0d1a1d' : '#F8FAFC'}`,
                    }}
                  >
                    {p.count}
                  </div>
                </div>
                <div
                  className="absolute top-16 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold tracking-wider"
                  style={{ color: p.color === '#FFFFFF' ? (isDark ? '#E2E8F0' : '#334155') : p.color }}
                >
                  {p.name.toUpperCase()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Automation Panel */}
        <div
          className="rounded-xl p-4 flex flex-col"
          style={{
            background: isDark ? '#182f34' : '#FFFFFF',
            border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
          }}
        >
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            <Zap className="w-4 h-4 text-[#06B6D4]" />
            Automation
          </h3>

          <div className="space-y-3 mb-5">
            <div
              className="flex items-center justify-between p-3 rounded-lg"
              style={{
                background: isDark ? '#102023' : '#F8FAFC',
                border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
              }}
            >
              <div className="flex flex-col">
                <span className="text-xs font-medium" style={{ color: isDark ? '#E2E8F0' : '#334155' }}>Schedule All</span>
                <span className="text-[10px]" style={{ color: isDark ? '#56737a' : '#94A3B8' }}>最適な時間に自動投稿</span>
              </div>
              <button
                onClick={() => setScheduleAll(!scheduleAll)}
                className="relative w-10 h-5 rounded-full transition-colors"
                style={{ background: scheduleAll ? '#06B6D4' : isDark ? '#224249' : '#E2E8F0' }}
              >
                <div
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow"
                  style={{ left: scheduleAll ? '22px' : '2px' }}
                />
              </button>
            </div>
            <div
              className="flex items-center justify-between p-3 rounded-lg"
              style={{
                background: isDark ? '#102023' : '#F8FAFC',
                border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
              }}
            >
              <div className="flex flex-col">
                <span className="text-xs font-medium" style={{ color: isDark ? '#E2E8F0' : '#334155' }}>Auto-Post</span>
                <span className="text-[10px]" style={{ color: isDark ? '#56737a' : '#94A3B8' }}>即時公開</span>
              </div>
              <button
                onClick={() => setAutoPost(!autoPost)}
                className="relative w-10 h-5 rounded-full transition-colors"
                style={{ background: autoPost ? '#10B981' : isDark ? '#224249' : '#E2E8F0' }}
              >
                <div
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow"
                  style={{ left: autoPost ? '22px' : '2px' }}
                />
              </button>
            </div>
          </div>

          {/* Real-time Tracking */}
          <div className="flex-1 flex flex-col" style={{ borderTop: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`, paddingTop: '16px' }}>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>
                Real-time Tracking
              </span>
              <span
                className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded animate-pulse"
                style={{
                  background: isDark ? 'rgba(239,68,68,0.1)' : '#FEF2F2',
                  color: '#EF4444',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                LIVE
              </span>
            </div>

            <div
              className="flex-1 rounded-lg relative overflow-hidden p-3 min-h-[120px]"
              style={{
                background: isDark ? '#102023' : '#F8FAFC',
                border: `1px solid ${isDark ? '#1e3a3f' : '#E2E8F0'}`,
              }}
            >
              {/* Mini chart */}
              <svg className="w-full h-full absolute inset-0 p-3" preserveAspectRatio="none" viewBox="0 0 100 50">
                <defs>
                  <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,50 L10,45 L20,48 L30,30 L40,35 L50,20 L60,25 L70,15 L80,18 L90,5 L100,10 L100,50 Z"
                  fill="url(#chartFill)"
                />
                <path
                  d="M0,50 L10,45 L20,48 L30,30 L40,35 L50,20 L60,25 L70,15 L80,18 L90,5 L100,10"
                  fill="none"
                  stroke="#06B6D4"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              {/* Activity notification */}
              <div
                className="absolute bottom-3 left-3 right-3 flex items-center gap-2 px-2.5 py-1.5 rounded text-[10px]"
                style={{
                  background: isDark ? 'rgba(24,47,52,0.9)' : 'rgba(255,255,255,0.9)',
                  border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
                  animation: 'float 3s ease-in-out infinite',
                }}
              >
                <span>👍</span>
                <span style={{ color: isDark ? '#E2E8F0' : '#334155' }}>
                  New like on <strong>X Thread</strong>
                </span>
                <span className="ml-auto" style={{ color: isDark ? '#56737a' : '#94A3B8' }}>Now</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Drafts */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            <Clock className="w-4 h-4 text-[#06B6D4]" />
            Generated Drafts
          </h2>
          <button className="text-[11px] font-medium hover:underline" style={{ color: isDark ? '#6a8b94' : '#94A3B8' }}>
            トーンをカスタマイズ
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {platforms.map((p) => {
            const statusColors: Record<string, { bg: string; text: string }> = {
              emerald: {
                bg: isDark ? 'rgba(16,185,129,0.1)' : '#ECFDF5',
                text: isDark ? '#6EE7B7' : '#065F46',
              },
              amber: {
                bg: isDark ? 'rgba(245,158,11,0.1)' : '#FFFBEB',
                text: isDark ? '#FBBF24' : '#92400E',
              },
            }
            const sc = statusColors[p.statusColor]

            return (
              <div
                key={p.id}
                className="rounded-xl p-4 flex flex-col transition-all hover:-translate-y-0.5"
                style={{
                  background: isDark ? '#182f34' : '#FFFFFF',
                  border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
                  borderTop: `3px solid ${p.color === '#FFFFFF' ? (isDark ? '#6B7280' : '#334155') : p.color}`,
                }}
              >
                {/* Platform Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{p.icon}</span>
                    <span className="text-xs font-bold" style={{ color: isDark ? '#E2E8F0' : '#334155' }}>
                      {p.name}
                    </span>
                  </div>
                  <span
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                    style={{ background: sc.bg, color: sc.text }}
                  >
                    {p.status}
                  </span>
                </div>

                {/* Preview placeholder */}
                <div
                  className="rounded-lg h-16 mb-3 flex items-center justify-center"
                  style={{
                    background: isDark ? '#102023' : '#F8FAFC',
                    border: `1px solid ${isDark ? '#1e3a3f' : '#E2E8F0'}`,
                  }}
                >
                  {p.id === 'x' ? (
                    <div className="px-3 text-left w-full">
                      <div className="flex gap-2">
                        <div className="w-0.5 rounded-full" style={{ background: isDark ? '#224249' : '#E2E8F0', minHeight: '30px' }} />
                        <div className="space-y-1">
                          <div className="h-1.5 w-20 rounded" style={{ background: isDark ? '#224249' : '#E2E8F0' }} />
                          <div className="h-1.5 w-16 rounded" style={{ background: isDark ? '#1e3a3f' : '#F1F5F9' }} />
                        </div>
                      </div>
                    </div>
                  ) : p.id === 'linkedin' ? (
                    <div className="px-3 w-full">
                      <div className="flex gap-2 mb-1.5">
                        <div className="w-4 h-4 rounded-full" style={{ background: isDark ? '#224249' : '#E2E8F0' }} />
                        <div className="h-1.5 w-12 rounded mt-1" style={{ background: isDark ? '#224249' : '#E2E8F0' }} />
                      </div>
                      <div className="space-y-1">
                        <div className="h-1.5 w-full rounded" style={{ background: isDark ? '#1e3a3f' : '#F1F5F9' }} />
                        <div className="h-1.5 w-3/4 rounded" style={{ background: isDark ? '#1e3a3f' : '#F1F5F9' }} />
                      </div>
                    </div>
                  ) : (
                    <div
                      className="w-full h-full rounded-lg flex items-center justify-center"
                      style={{ background: isDark ? '#0d1a1d' : '#F1F5F9' }}
                    >
                      <span className="text-lg opacity-40">{p.icon}</span>
                    </div>
                  )}
                </div>

                {/* Draft Content */}
                <div className="space-y-1 mb-3 flex-1">
                  <div className="text-[10px] font-bold uppercase" style={{ color: isDark ? '#56737a' : '#94A3B8' }}>
                    {p.draft.label}
                  </div>
                  <p className="text-[11px] line-clamp-2" style={{ color: isDark ? '#E2E8F0' : '#334155' }}>
                    {p.draft.title}
                  </p>
                </div>

                {/* Action */}
                <button
                  className="mt-auto w-full py-1.5 rounded-lg text-[11px] font-medium transition-colors"
                  style={{
                    background: isDark ? '#102023' : '#F8FAFC',
                    border: `1px solid ${isDark ? '#224249' : '#E2E8F0'}`,
                    color: isDark ? '#E2E8F0' : '#334155',
                  }}
                >
                  {p.draft.action}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Float animation */}
      <style jsx>{`
        @keyframes centerFloat {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </motion.div>
  )
}
