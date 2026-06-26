'use client'

/**
 * CORTEX COMMAND CENTER — 司令塔
 * Always-on mission-control dashboard for a 75" monitor.
 * Live KPIs: 本日の自動投稿 / 閲覧 / 問い合わせ + 7日トレンド + radar + system status.
 * Polls /api/admin/command-metrics every 30s. Tech: Next client + recharts + framer-motion.
 */

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Orbitron, IBM_Plex_Mono } from 'next/font/google'
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from 'recharts'

const orbitron = Orbitron({ subsets: ['latin'], weight: ['500', '700', '900'] })
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600'] })

const ORANGE = '#E8845C'
const CYAN = '#38E1D8'
const GREEN = '#3DDC91'

interface Metrics {
  today: string
  postsToday: { total: number; x: number; threads: number; blog: number; crosspost: number }
  viewsLatest: { date: string; ga4Sessions: number; gscImpressions: number; gscClicks: number; total: number }
  inquiriesToday: number
  series: { days: string[]; posts: number[]; views: number[]; inquiries: number[] }
  totals7d: { posts: number; views: number; inquiries: number }
  generatedAt: string
}

// ── animated count-up number ───────────────────────────────
function Count({ value, dur = 900 }: { value: number; dur?: number }) {
  const [n, setN] = useState(0)
  const prev = useRef(0)
  useEffect(() => {
    const from = prev.current
    const to = value
    const start = performance.now()
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur)
      const eased = 1 - Math.pow(1 - p, 3)
      setN(Math.round(from + (to - from) * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
      else prev.current = to
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, dur])
  return <>{n.toLocaleString()}</>
}

// ── HUD corner brackets ────────────────────────────────────
function Brackets() {
  const c = 'absolute w-5 h-5 border-[#E8845C]/40'
  return (
    <>
      <span className={`${c} top-0 left-0 border-t border-l`} />
      <span className={`${c} top-0 right-0 border-t border-r`} />
      <span className={`${c} bottom-0 left-0 border-b border-l`} />
      <span className={`${c} bottom-0 right-0 border-b border-r`} />
    </>
  )
}

function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative bg-[#0a0f1c]/80 border border-[#1d2a44] rounded-lg ${className}`}
      style={{ boxShadow: 'inset 0 0 40px rgba(56,225,216,0.04)' }}>
      <Brackets />
      {children}
    </div>
  )
}

// ── KPI tile ───────────────────────────────────────────────
function Kpi({ label, value, unit, accent, sub, delay }: {
  label: string; value: number; unit: string; accent: string; sub: string; delay: number
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.6 }}>
      <Panel className="px-7 py-6 h-full overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: accent, boxShadow: `0 0 10px ${accent}` }} />
          <span className={`${mono.className} text-[13px] tracking-[0.25em] text-slate-400 uppercase`}>{label}</span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className={`${orbitron.className} font-black leading-none`}
            style={{ fontSize: 'clamp(48px,6vw,96px)', color: accent, textShadow: `0 0 28px ${accent}66` }}>
            <Count value={value} />
          </span>
          <span className={`${mono.className} text-lg text-slate-500`}>{unit}</span>
        </div>
        <div className={`${mono.className} mt-2 text-sm text-slate-400`}>{sub}</div>
        <div className="absolute right-4 bottom-3 opacity-[0.06]" style={{ fontSize: 90 }}>{/* watermark */}</div>
      </Panel>
    </motion.div>
  )
}

// ── radar ──────────────────────────────────────────────────
function Radar({ posts }: { posts: Metrics['postsToday'] }) {
  const blips = [
    { label: 'X', v: posts.x, a: 20 },
    { label: 'BLOG', v: posts.blog, a: 90 },
    { label: 'CROSS', v: posts.crosspost, a: 160 },
    { label: 'THREADS', v: posts.threads, a: 250 },
  ]
  return (
    <div className="relative aspect-square w-full max-w-[440px] mx-auto">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
          <radialGradient id="rg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={CYAN} stopOpacity="0.10" />
            <stop offset="100%" stopColor={CYAN} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="sweep" x1="50%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor={ORANGE} stopOpacity="0.55" />
            <stop offset="100%" stopColor={ORANGE} stopOpacity="0" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="96" fill="url(#rg)" />
        {[28, 52, 76, 96].map((r) => (
          <circle key={r} cx="100" cy="100" r={r} fill="none" stroke={CYAN} strokeOpacity="0.16" strokeWidth="0.6" />
        ))}
        <line x1="4" y1="100" x2="196" y2="100" stroke={CYAN} strokeOpacity="0.16" strokeWidth="0.6" />
        <line x1="100" y1="4" x2="100" y2="196" stroke={CYAN} strokeOpacity="0.16" strokeWidth="0.6" />
        {/* rotating sweep */}
        <g style={{ transformOrigin: '100px 100px', animation: 'radar-spin 4s linear infinite' }}>
          <path d="M100 100 L196 100 A96 96 0 0 1 100 196 Z" fill="url(#sweep)" />
          <line x1="100" y1="100" x2="196" y2="100" stroke={ORANGE} strokeWidth="1" strokeOpacity="0.8" />
        </g>
        {/* blips */}
        {blips.map((b) => {
          const rad = (b.a * Math.PI) / 180
          const dist = 30 + Math.min(60, b.v * 14)
          const x = 100 + dist * Math.cos(rad)
          const y = 100 + dist * Math.sin(rad)
          return (
            <g key={b.label}>
              <circle cx={x} cy={y} r={b.v > 0 ? 3 : 1.6} fill={b.v > 0 ? ORANGE : '#33405e'}
                style={b.v > 0 ? { filter: `drop-shadow(0 0 5px ${ORANGE})` } : undefined} />
              <text x={x} y={y - 5} fontSize="5.5" fill="#8aa0c0" textAnchor="middle" className={mono.className}>{b.label}</text>
              {b.v > 0 && <text x={x} y={y + 9} fontSize="5" fill={ORANGE} textAnchor="middle" className={mono.className}>{b.v}</text>}
            </g>
          )
        })}
        <circle cx="100" cy="100" r="2.5" fill={CYAN} />
      </svg>
      <div className={`${mono.className} absolute inset-x-0 -bottom-1 text-center text-[11px] tracking-[0.3em] text-slate-500`}>
        AUTONOMOUS POSTING GRID
      </div>
    </div>
  )
}

// ── trend chart ────────────────────────────────────────────
function Trend({ title, days, data, color, kind }: {
  title: string; days: string[]; data: number[]; color: string; kind: 'area' | 'bar'
}) {
  const rows = days.map((d, i) => ({ d: d.slice(5), v: data[i] }))
  return (
    <Panel className="p-4 h-full">
      <div className={`${mono.className} text-[12px] tracking-[0.2em] text-slate-400 uppercase mb-1`}>{title}</div>
      <div className="h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          {kind === 'area' ? (
            <AreaChart data={rows} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id={`g-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity="0.5" />
                  <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
              </defs>
              <XAxis dataKey="d" tick={{ fill: '#5b6b86', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0a0f1c', border: `1px solid ${color}55`, borderRadius: 6, color: '#fff', fontSize: 12 }} />
              <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#g-${title})`} dot={{ r: 2, fill: color }} />
            </AreaChart>
          ) : (
            <BarChart data={rows} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
              <XAxis dataKey="d" tick={{ fill: '#5b6b86', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0a0f1c', border: `1px solid ${color}55`, borderRadius: 6, color: '#fff', fontSize: 12 }} />
              <Bar dataKey="v" fill={color} radius={[3, 3, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </Panel>
  )
}

const SYSTEMS = ['X', 'Threads', 'Blog', 'Zenn', 'Qiita', 'note', 'GSC', 'GA4', 'SEO学習']

export default function CommandCenter() {
  const [m, setM] = useState<Metrics | null>(null)
  const [clock, setClock] = useState('')
  const [updatedAgo, setUpdatedAgo] = useState(0)

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch('/api/admin/command-metrics', { cache: 'no-store' })
        if (r.ok) { setM(await r.json()); setUpdatedAgo(0) }
      } catch { /* keep last */ }
    }
    load()
    const poll = setInterval(load, 30_000)
    const ago = setInterval(() => setUpdatedAgo((s) => s + 1), 1000)
    return () => { clearInterval(poll); clearInterval(ago) }
  }, [])

  useEffect(() => {
    const t = setInterval(() => {
      const jst = new Date(Date.now() + 9 * 3600_000)
      setClock(jst.toISOString().slice(11, 19))
    }, 1000)
    return () => clearInterval(t)
  }, [])

  const days = m?.series.days ?? []
  return (
    <div className={`min-h-screen w-full text-slate-200 ${mono.className}`}
      style={{
        background: 'radial-gradient(1200px 800px at 70% -10%, #0d1830 0%, #05070d 60%)',
      }}>
      {/* grid + scanline overlay */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.5]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(56,225,216,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(56,225,216,0.035) 1px, transparent 1px)',
          backgroundSize: '46px 46px',
        }} />
      <div className="pointer-events-none fixed inset-0 z-0"
        style={{ background: 'repeating-linear-gradient(0deg, transparent 0 3px, rgba(0,0,0,0.18) 3px 4px)' }} />

      <style>{`@keyframes radar-spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>

      <div className="relative z-10 p-6 xl:p-10 max-w-[2200px] mx-auto">
        {/* header */}
        <header className="flex items-center justify-between border-b border-[#1d2a44] pb-5">
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 rounded-full" style={{ background: ORANGE, boxShadow: `0 0 16px ${ORANGE}` }} />
            <h1 className={`${orbitron.className} font-black tracking-[0.18em]`}
              style={{ fontSize: 'clamp(22px,2.4vw,40px)', color: '#fff' }}>
              CORTEX <span style={{ color: ORANGE }}>COMMAND</span>
            </h1>
            <span className="hidden md:inline text-[12px] tracking-[0.3em] text-slate-500">NANDS AUTONOMOUS SNS</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: GREEN, boxShadow: `0 0 10px ${GREEN}` }} />
              <span className="text-[13px] tracking-[0.25em]" style={{ color: GREEN }}>ALL SYSTEMS OPERATIONAL</span>
            </div>
            <div className={`${orbitron.className} text-2xl xl:text-3xl text-white tabular-nums`}>{clock} <span className="text-sm text-slate-500">JST</span></div>
          </div>
        </header>

        {/* KPI row */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-7">
          <Kpi label="本日の自動投稿" value={m?.postsToday.total ?? 0} unit="件" accent={ORANGE} delay={0.05}
            sub={`X ${m?.postsToday.x ?? 0} ・ Threads ${m?.postsToday.threads ?? 0} ・ Blog ${m?.postsToday.blog ?? 0} ・ Cross ${m?.postsToday.crosspost ?? 0}`} />
          <Kpi label="閲覧 (7日)" value={m?.totals7d.views ?? 0} unit="views" accent={CYAN} delay={0.12}
            sub={`最新 ${m?.viewsLatest.date ?? '—'}: GA4 ${m?.viewsLatest.ga4Sessions ?? 0} ・ GSC表示 ${m?.viewsLatest.gscImpressions ?? 0}`} />
          <Kpi label="本日の問い合わせ" value={m?.inquiriesToday ?? 0} unit="件" accent={GREEN} delay={0.19}
            sub={`7日累計 ${m?.totals7d.inquiries ?? 0} 件`} />
        </section>

        {/* radar + trends */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-5 mt-5">
          <Panel className="p-6 xl:row-span-1 flex items-center justify-center">
            {m ? <Radar posts={m.postsToday} /> : <div className="text-slate-600">SCANNING…</div>}
          </Panel>
          <div className="xl:col-span-2 grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Trend title="投稿 / 日" days={days} data={m?.series.posts ?? []} color={ORANGE} kind="bar" />
            <Trend title="閲覧 / 日" days={days} data={m?.series.views ?? []} color={CYAN} kind="area" />
            <Trend title="問い合わせ / 日" days={days} data={m?.series.inquiries ?? []} color={GREEN} kind="bar" />
          </div>
        </section>

        {/* system status strip */}
        <section className="mt-5">
          <Panel className="px-6 py-4">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              <span className="text-[12px] tracking-[0.3em] text-slate-500">SYSTEMS</span>
              {SYSTEMS.map((s) => (
                <span key={s} className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 rounded-full" style={{ background: GREEN, boxShadow: `0 0 8px ${GREEN}` }} />
                  <span className="text-slate-300">{s}</span>
                </span>
              ))}
              <span className="ml-auto text-[12px] text-slate-500">
                last sync {updatedAgo}s ago ・ poll 30s ・ {m ? new Date(m.generatedAt).toLocaleString('ja-JP') : '—'}
              </span>
            </div>
          </Panel>
        </section>

        <footer className="mt-6 text-center text-[11px] tracking-[0.3em] text-slate-600">
          CORTEX COMMAND CENTER ・ AUTONOMOUS X / THREADS / BLOG / ZENN / QIITA / NOTE ・ NANDS
        </footer>
      </div>
    </div>
  )
}
