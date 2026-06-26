'use client'

/**
 * CORTEX COMMAND CENTER — 司令塔 (3D edition)
 * Full-bleed glowing 3D globe with data arcs + glassmorphism HUD overlay.
 * Live KPIs (本日の自動投稿 / 閲覧 / 問い合わせ) + 7-day trends + system status.
 * Polls /api/admin/command-metrics every 30s. 75" always-on. Orange × deep navy.
 */

import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { Orbitron, IBM_Plex_Mono } from 'next/font/google'
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from 'recharts'

const GlobeScene = dynamic(() => import('./GlobeScene'), { ssr: false, loading: () => null })
import InquiryAlert from './inquiry-alert'
const Mascot = dynamic(() => import('./Mascot'), { ssr: false, loading: () => null })

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
  latestInquiry: { id: string; created_at: string; name: string | null; source: string } | null
  series: { days: string[]; posts: number[]; views: number[]; inquiries: number[] }
  totals7d: { posts: number; views: number; inquiries: number }
  generatedAt: string
}

const EMPTY_POSTS = { total: 0, x: 0, threads: 0, blog: 0, crosspost: 0 }

function Count({ value, dur = 1000 }: { value: number; dur?: number }) {
  const [n, setN] = useState(0)
  const prev = useRef(0)
  useEffect(() => {
    const from = prev.current, to = value, start = performance.now()
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur)
      setN(Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick); else prev.current = to
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, dur])
  return <>{n.toLocaleString()}</>
}

function Brackets({ c = ORANGE }: { c?: string }) {
  const base = 'absolute w-4 h-4'
  return (
    <>
      <span className={`${base} top-0 left-0 border-t border-l`} style={{ borderColor: `${c}66` }} />
      <span className={`${base} top-0 right-0 border-t border-r`} style={{ borderColor: `${c}66` }} />
      <span className={`${base} bottom-0 left-0 border-b border-l`} style={{ borderColor: `${c}66` }} />
      <span className={`${base} bottom-0 right-0 border-b border-r`} style={{ borderColor: `${c}66` }} />
    </>
  )
}

function Panel({ children, className = '', glow = ORANGE }: { children: React.ReactNode; className?: string; glow?: string }) {
  return (
    <div className={`relative rounded-xl border border-white/10 bg-[#070b16]/55 backdrop-blur-md ${className}`}
      style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 0 30px ${glow}14` }}>
      <Brackets c={glow} />
      {children}
    </div>
  )
}

function Kpi({ label, value, unit, accent, sub, delay }: {
  label: string; value: number; unit: string; accent: string; sub: string; delay: number
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.7, ease: 'easeOut' }} className="flex-1">
      <Panel glow={accent} className="px-7 py-6 overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: accent, boxShadow: `0 0 12px ${accent}` }} />
          <span className={`${mono.className} text-[12px] tracking-[0.28em] text-slate-300/80 uppercase`}>{label}</span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className={`${orbitron.className} font-black leading-none`}
            style={{ fontSize: 'clamp(46px,5.6vw,104px)', color: '#fff', textShadow: `0 0 34px ${accent}, 0 0 8px ${accent}aa` }}>
            <Count value={value} />
          </span>
          <span className={`${mono.className} text-lg`} style={{ color: accent }}>{unit}</span>
        </div>
        <div className={`${mono.className} mt-1 text-[13px] text-slate-400`}>{sub}</div>
      </Panel>
    </motion.div>
  )
}

function Trend({ title, days, data, color, kind }: {
  title: string; days: string[]; data: number[]; color: string; kind: 'area' | 'bar'
}) {
  const rows = days.map((d, i) => ({ d: d.slice(5), v: data[i] }))
  return (
    <Panel glow={color} className="p-4 flex-1">
      <div className={`${mono.className} text-[11px] tracking-[0.22em] text-slate-300/80 uppercase mb-1`}>{title}</div>
      <div className="h-[110px]">
        <ResponsiveContainer width="100%" height="100%">
          {kind === 'area' ? (
            <AreaChart data={rows} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id={`g-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity="0.55" />
                  <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
              </defs>
              <XAxis dataKey="d" tick={{ fill: '#6b7c98', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#070b16', border: `1px solid ${color}55`, borderRadius: 8, color: '#fff', fontSize: 12 }} />
              <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2.2} fill={`url(#g-${title})`} dot={{ r: 2, fill: color }} />
            </AreaChart>
          ) : (
            <BarChart data={rows} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
              <XAxis dataKey="d" tick={{ fill: '#6b7c98', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#070b16', border: `1px solid ${color}55`, borderRadius: 8, color: '#fff', fontSize: 12 }} />
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
  const [ago, setAgo] = useState(0)

  useEffect(() => {
    const load = async () => {
      try { const r = await fetch('/api/admin/command-metrics', { cache: 'no-store' }); if (r.ok) { setM(await r.json()); setAgo(0) } } catch { /* keep */ }
    }
    load()
    const poll = setInterval(load, 30_000)
    const a = setInterval(() => setAgo((s) => s + 1), 1000)
    return () => { clearInterval(poll); clearInterval(a) }
  }, [])
  useEffect(() => {
    const t = setInterval(() => setClock(new Date(Date.now() + 9 * 3600_000).toISOString().slice(11, 19)), 1000)
    return () => clearInterval(t)
  }, [])

  const days = m?.series.days ?? []
  return (
    <div className={`relative min-h-screen w-full overflow-hidden text-slate-200 ${mono.className}`} style={{ background: '#05070d' }}>
      {/* 3D globe background (arcs react to today's post volume) */}
      <div className="fixed inset-0 z-0"><GlobeScene posts={m?.postsToday ?? EMPTY_POSTS} /></div>

      {/* inquiry alert (ring + beep + toast on new arrival) */}
      <InquiryAlert latest={m?.latestInquiry ?? null} />
      {/* NANDS pixel mascot — ambient + reacts to live data (additive overlay) */}
      <Mascot metrics={m ?? null} />
      {/* vignette + grid */}
      <div className="pointer-events-none fixed inset-0 z-[1]"
        style={{ background: 'radial-gradient(120% 90% at 50% 35%, transparent 40%, rgba(5,7,13,0.78) 100%)' }} />
      <div className="pointer-events-none fixed inset-0 z-[1] opacity-40"
        style={{ backgroundImage: 'linear-gradient(rgba(56,225,216,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(56,225,216,0.04) 1px,transparent 1px)', backgroundSize: '52px 52px' }} />

      <div className="relative z-10 flex flex-col min-h-screen p-6 xl:p-9 max-w-[2300px] mx-auto">
        {/* header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 rounded-full" style={{ background: ORANGE, boxShadow: `0 0 18px ${ORANGE}` }} />
            <h1 className={`${orbitron.className} font-black tracking-[0.18em] text-white`} style={{ fontSize: 'clamp(22px,2.4vw,42px)', textShadow: `0 0 24px ${ORANGE}55` }}>
              CORTEX <span style={{ color: ORANGE }}>COMMAND</span>
            </h1>
            <span className="hidden md:inline text-[11px] tracking-[0.34em] text-slate-500">NANDS AUTONOMOUS SNS</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: GREEN, boxShadow: `0 0 12px ${GREEN}` }} />
              <span className="text-[12px] tracking-[0.25em]" style={{ color: GREEN }}>ALL SYSTEMS OPERATIONAL</span>
            </div>
            <div className={`${orbitron.className} text-2xl xl:text-3xl text-white tabular-nums`} style={{ textShadow: `0 0 18px ${CYAN}55` }}>{clock}<span className="text-sm text-slate-500 ml-1">JST</span></div>
          </div>
        </header>

        {/* KPI row */}
        <section className="flex flex-col md:flex-row gap-5 mt-6">
          <Kpi label="本日の自動投稿" value={m?.postsToday.total ?? 0} unit="件" accent={ORANGE} delay={0.05}
            sub={`X ${m?.postsToday.x ?? 0}・Threads ${m?.postsToday.threads ?? 0}・Blog ${m?.postsToday.blog ?? 0}・Cross ${m?.postsToday.crosspost ?? 0}`} />
          <Kpi label="閲覧 (7日)" value={m?.totals7d.views ?? 0} unit="views" accent={CYAN} delay={0.12}
            sub={`最新 ${m?.viewsLatest.date ?? '—'}: GA4 ${m?.viewsLatest.ga4Sessions ?? 0}・GSC ${m?.viewsLatest.gscImpressions ?? 0}`} />
          <Kpi label="本日の問い合わせ" value={m?.inquiriesToday ?? 0} unit="件" accent={GREEN} delay={0.19}
            sub={`7日累計 ${m?.totals7d.inquiries ?? 0} 件`} />
        </section>

        {/* spacer — globe shines through here */}
        <div className="flex-1 min-h-[120px] flex items-center justify-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }}
            className={`${mono.className} text-center text-[11px] tracking-[0.4em] text-slate-500/70`}>
            ＿＿＿ GLOBAL AUTONOMOUS POSTING GRID ＿＿＿
          </motion.div>
        </div>

        {/* trends */}
        <section className="flex flex-col lg:flex-row gap-5">
          <Trend title="投稿 / 日" days={days} data={m?.series.posts ?? []} color={ORANGE} kind="bar" />
          <Trend title="閲覧 / 日" days={days} data={m?.series.views ?? []} color={CYAN} kind="area" />
          <Trend title="問い合わせ / 日" days={days} data={m?.series.inquiries ?? []} color={GREEN} kind="bar" />
        </section>

        {/* status strip */}
        <section className="mt-5">
          <Panel glow={CYAN} className="px-6 py-3.5">
            <div className="flex flex-wrap items-center gap-x-7 gap-y-2">
              <span className="text-[11px] tracking-[0.3em] text-slate-500">SYSTEMS</span>
              {SYSTEMS.map((s) => (
                <span key={s} className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 rounded-full" style={{ background: GREEN, boxShadow: `0 0 8px ${GREEN}` }} />
                  <span className="text-slate-300">{s}</span>
                </span>
              ))}
              <span className="ml-auto text-[11px] text-slate-500">last sync {ago}s ago ・ poll 30s</span>
            </div>
          </Panel>
        </section>
      </div>
    </div>
  )
}
