'use client'

/**
 * CORTEX 司令塔 ドットマスコット — "Obsidian Operator" (NANDS pixel mascot).
 * A sleek black/gunmetal pixel droid with a glowing cyan scanning visor + a
 * radar antenna, hovering at the bottom of the command center. It ambiently
 * glides / hovers / types (holo-keyboard) / instructs, and REACTS to live data
 * — sprints to center with 「！」 on a new inquiry, celebrates when today's post
 * count rises. Pure additive overlay: never touches the 3D globe / HUD / data.
 *
 * Deliberately distinct from Claude Code's orange square (steel-gray body, cyan
 * visor instead of dot-eyes, hover instead of feet; cyan × gray × black only).
 * Re-skin via the pixel matrix + COLORS below when the NANDS logo lands.
 */

import { useEffect, useRef, useState } from 'react'
import { motion, useAnimationControls } from 'framer-motion'

// ---- palette (re-skin here) — cyan × steel-gray × black, bright ----
const BODY = '#46586e' // steel gray (brightened from near-black)
const EDGE = '#28323f' // soft dark outline (not pure black)
const HI = '#8aa4ba'   // light steel highlight
const RIM = '#39E7DB'  // cyan rim-light
const CYAN = '#3df0e6'
const CYAN_HI = '#cffffb'
const P = 7 // px per pixel-cell
const TOP = 2 * P // headroom for antenna
const COL: Record<string, string> = { B: BODY, E: EDGE, H: HI, R: RIM }

// body grid 12 wide × 11 tall; rendered offset +1 cell (arms at x=0/x=13).
const BODY_MATRIX = [
  '...EEEEEE...',
  '..EBBBBBBE..',
  '.EBHHHHHHBE.',
  'EBBBBBBBBBBE',
  'EBBBBBBBBBBR',
  'EBBBBBBBBBBR',
  'EBBBBBBBBBBR',
  'EBBBBBBBBBBE',
  '.EBBBBBBBBE.',
  '..EBBBBBBE..',
  '...EEEEEE...',
]

type Action = 'idle' | 'walk' | 'type' | 'instruct' | 'celebrate' | 'alert' | 'speak'
type Reaction = { kind: 'alert' | 'celebrate' | 'hop'; text?: string }

interface MetricsLike {
  postsToday: { total: number }
  latestInquiry: { id: string } | null
}

interface NewsLike {
  version: string | null
  isNew: boolean
}

const css = `
.cmasc-wrap { position: fixed; bottom: 16px; left: 0; z-index: 30; pointer-events: none; }
.cmasc { display:block; filter: drop-shadow(0 5px 7px rgba(0,0,0,0.35)) drop-shadow(0 0 18px rgba(61,240,230,0.65)); pointer-events:auto; cursor:pointer; }

.cmasc .body { transform-box: fill-box; transform-origin: center bottom; }
.cmasc.a-idle .body, .cmasc.a-instruct .body { animation: cmasc-bob 2.6s ease-in-out infinite; }
.cmasc.a-walk .body { animation: cmasc-bob 1.1s ease-in-out infinite; }
.cmasc.a-type .body { animation: cmasc-bob 1.8s ease-in-out infinite; }
@keyframes cmasc-bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-2.5px)} }

.cmasc-jump { transform-box: fill-box; transform-origin:center bottom; }
.cmasc.a-celebrate .cmasc-jump, .cmasc.a-alert .cmasc-jump { animation: cmasc-jump .56s cubic-bezier(.3,.7,.4,1) infinite; }
@keyframes cmasc-jump { 0%{transform:translateY(0)} 32%{transform:translateY(-16px)} 64%{transform:translateY(0)} 100%{transform:translateY(0)} }

.cmasc .lean { transform-box: fill-box; transform-origin: center bottom; transition: transform .22s ease; }
.cmasc.a-walk .lean { transform: rotate(4.5deg); }

.cmasc .hover-ring { transform-box: fill-box; transform-origin: center; animation: cmasc-hover 2.6s ease-in-out infinite; }
.cmasc.a-walk .hover-ring { animation-duration: .9s; }
@keyframes cmasc-hover { 0%,100%{opacity:.3; transform:scaleX(1)} 50%{opacity:.65; transform:scaleX(1.3)} }

.cmasc .visor-scan { transform-box: fill-box; animation: cmasc-scan 2.4s ease-in-out infinite; }
@keyframes cmasc-scan { 0%{transform:translateX(0)} 50%{transform:translateX(38px)} 100%{transform:translateX(0)} }

/* talking: visor flickers fast + quicker bob, as if speaking */
.cmasc.a-speak .visor-scan { animation: cmasc-scan .5s ease-in-out infinite; }
.cmasc.a-speak .visor-mid { animation: cmasc-talk .22s ease-in-out infinite; }
.cmasc.a-speak .body { animation: cmasc-bob .42s ease-in-out infinite; }
@keyframes cmasc-talk { 0%,100%{opacity:.45} 50%{opacity:1} }

.cmasc .ant-tip { transform-box: fill-box; transform-origin: center; animation: cmasc-ant 1.7s ease-in-out infinite; }
@keyframes cmasc-ant { 0%,100%{opacity:.45; transform:scale(.85)} 50%{opacity:1; transform:scale(1.15)} }

.cmasc .arm { transform-box: fill-box; transform-origin: top center; transition: transform .18s ease; }
.cmasc.a-type .arm-l { animation: cmasc-tap .26s ease-in-out infinite; }
.cmasc.a-type .arm-r { animation: cmasc-tap .26s ease-in-out infinite .13s; }
@keyframes cmasc-tap { 0%,100%{transform:translateY(0)} 50%{transform:translateY(3px)} }
.cmasc.a-instruct .arm-r { transform: rotate(-62deg) translateY(-3px); }
.cmasc.a-celebrate .arm-l, .cmasc.a-alert .arm-l { transform: rotate(46deg) translateY(-4px); }
.cmasc.a-celebrate .arm-r, .cmasc.a-alert .arm-r { transform: rotate(-46deg) translateY(-4px); }

.cmasc-bubble { position:absolute; left:50%; transform:translateX(-50%); bottom:108px; white-space:nowrap;
  font-family:'IBM Plex Mono', ui-monospace, monospace; font-weight:600; font-size:13px; letter-spacing:.06em;
  color:#fff; background:rgba(7,11,22,0.92); border:1px solid rgba(56,225,216,0.6); border-radius:9px;
  padding:5px 11px; box-shadow:0 0 22px rgba(56,225,216,0.4); }
.cmasc-bubble::after { content:''; position:absolute; top:100%; left:50%; transform:translateX(-50%);
  border:6px solid transparent; border-top-color:rgba(56,225,216,0.6); }
.cmasc-spark { position:absolute; bottom:100px; font-size:14px; color:${CYAN_HI}; text-shadow:0 0 8px ${CYAN};
  animation: cmasc-spark 1s ease-out infinite; }
@keyframes cmasc-spark { 0%{opacity:0; transform:translateY(6px) scale(.6)} 30%{opacity:1} 100%{opacity:0; transform:translateY(-22px) scale(1.1)} }

@media (prefers-reduced-motion: reduce) { .cmasc *, .cmasc { animation: none !important; } }
`

function rectsFromMatrix() {
  const out: { x: number; y: number; c: string }[] = []
  BODY_MATRIX.forEach((row, r) => {
    for (let c = 0; c < row.length; c++) {
      const ch = row[c]
      if (ch !== '.') out.push({ x: (c + 1) * P, y: r * P, c: COL[ch] })
    }
  })
  return out
}
const BODY_RECTS = rectsFromMatrix()

export default function Mascot({ metrics, news, speaking, caption, working }: { metrics: MetricsLike | null; news?: NewsLike | null; speaking?: boolean; caption?: string | null; working?: boolean }) {
  const controls = useAnimationControls()
  const [action, setAction] = useState<Action>('idle')
  const [facing, setFacing] = useState<1 | -1>(1)
  const [blink, setBlink] = useState(false)
  const [bubble, setBubble] = useState<string | null>(null)
  const [sparkle, setSparkle] = useState(false)
  const [mounted, setMounted] = useState(false)

  const reaction = useRef<Reaction | null>(null)
  const petKick = useRef(false)
  const speakingRef = useRef(false)
  useEffect(() => { speakingRef.current = !!speaking }, [speaking])
  const workingRef = useRef(false)
  useEffect(() => { workingRef.current = !!working }, [working])

  useEffect(() => setMounted(true), [])

  // visor "blink" (brief dim)
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>
    const loop = () => {
      setBlink(true)
      setTimeout(() => setBlink(false), 130)
      t = setTimeout(loop, 2800 + Math.random() * 3400)
    }
    t = setTimeout(loop, 2000)
    return () => clearTimeout(t)
  }, [])

  // ---- the "brain": ambient behaviour + reaction queue ----
  useEffect(() => {
    if (!mounted) return
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setAction('idle')
      return
    }
    let alive = true
    const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
    const W = () => window.innerWidth
    const M = 70
    let x = Math.min(W() - M, 110)
    controls.set({ x })

    const moveTo = async (target: number, speed: number, ease: 'linear' | 'easeOut' = 'linear') => {
      target = Math.max(M, Math.min(W() - M, target))
      setFacing(target >= x ? 1 : -1)
      const dur = Math.max(0.25, Math.abs(target - x) / speed)
      await controls.start({ x: target }, { duration: dur, ease }).catch(() => {})
      x = target
    }

    const doReaction = async (r: Reaction) => {
      if (r.kind === 'alert') {
        await moveTo(W() / 2 - 40, 260, 'easeOut')
        setAction('alert'); setBubble('！'); setSparkle(true)
        await wait(3000)
        setBubble(null); setSparkle(false)
      } else if (r.kind === 'celebrate') {
        setAction('celebrate'); setSparkle(true); setBubble(r.text ?? '投稿完了！')
        await wait(2800)
        setSparkle(false); setBubble(null)
      } else {
        setAction('celebrate'); await wait(900)
      }
    }

    const run = async () => {
      while (alive) {
        if (speakingRef.current) { setAction('speak'); await wait(160); continue }
        if (workingRef.current) { setAction('type'); await wait(200); continue } // Claude Code working
        if (petKick.current) { petKick.current = false; await doReaction({ kind: 'hop' }); continue }
        if (reaction.current) { const r = reaction.current; reaction.current = null; await doReaction(r); continue }
        const roll = Math.random()
        if (roll < 0.5) {
          setAction('walk')
          const dir = Math.random() < 0.5 ? 1 : -1
          await moveTo(x + dir * (140 + Math.random() * 380), 80)
        } else if (roll < 0.68) {
          setAction('type'); await wait(2600)
        } else if (roll < 0.84) {
          setAction('instruct'); setBubble('指示'); await wait(2200); setBubble(null)
        } else {
          setAction('idle'); await wait(1800)
        }
        if (alive) { setAction('idle'); await wait(280) }
      }
    }
    run()
    return () => { alive = false; controls.stop() }
  }, [mounted, controls])

  // ---- event detection from live metrics (delta vs previous, baseline-safe) ----
  const seen = useRef(false)
  const prevInq = useRef<string | null>(null)
  const prevPosts = useRef<number | null>(null)
  useEffect(() => {
    if (!metrics) return
    if (!seen.current) {
      seen.current = true
      prevInq.current = metrics.latestInquiry?.id ?? null
      prevPosts.current = metrics.postsToday.total
      return
    }
    const inq = metrics.latestInquiry?.id ?? null
    if (inq && inq !== prevInq.current) { prevInq.current = inq; reaction.current = { kind: 'alert' } }
    const posts = metrics.postsToday.total
    if (prevPosts.current != null && posts > prevPosts.current) reaction.current = { kind: 'celebrate', text: '投稿完了！' }
    prevPosts.current = posts
  }, [metrics])

  // ---- official Claude Code news: excited reaction when a new version appears ----
  const seenNews = useRef(false)
  const prevVer = useRef<string | null>(null)
  useEffect(() => {
    if (!news) return
    if (!seenNews.current) { seenNews.current = true; prevVer.current = news.version; return }
    if (news.isNew && news.version && news.version !== prevVer.current) {
      prevVer.current = news.version
      reaction.current = { kind: 'celebrate', text: '公式新着！' }
    }
  }, [news])

  if (!mounted) return null

  const VBW = 14 * P
  const VBH = TOP + 13 * P
  const cx = 6.5 * P // body horizontal center
  const bodyBottom = TOP + 11 * P

  return (
    <motion.div className="cmasc-wrap" animate={controls} initial={{ x: 110 }}>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div style={{ position: 'relative', width: VBW, height: VBH + 100 }}>
        {(() => {
          const sp = speaking && caption ? (caption.length > 24 ? `${caption.slice(0, 24)}…` : caption) : null
          const shown = sp ?? bubble
          return shown ? <div className="cmasc-bubble">{shown}</div> : null
        })()}
        {sparkle && (
          <>
            <span className="cmasc-spark" style={{ left: 6 }}>✦</span>
            <span className="cmasc-spark" style={{ left: VBW - 14, animationDelay: '.35s' }}>✧</span>
            <span className="cmasc-spark" style={{ left: VBW / 2 - 4, animationDelay: '.6s' }}>✦</span>
          </>
        )}
        <svg
          className={`cmasc a-${action}`}
          width={VBW * 1.5}
          height={VBH * 1.5}
          viewBox={`0 0 ${VBW} ${VBH}`}
          style={{ position: 'absolute', bottom: 0, left: '50%', transform: `translateX(-50%) scaleX(${facing})` }}
          onClick={() => { petKick.current = true }}
          shapeRendering="crispEdges"
        >
          <defs>
            <radialGradient id="cmasc-hoverg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={CYAN} stopOpacity="0.9" />
              <stop offset="100%" stopColor={CYAN} stopOpacity="0" />
            </radialGradient>
          </defs>

          <g className="cmasc-jump">
            <g className="lean">
              {/* hover glow under the droid (replaces feet) */}
              <ellipse className="hover-ring" cx={cx} cy={bodyBottom + 5} rx={4.5 * P} ry={1.1 * P} fill="url(#cmasc-hoverg)" />

              {/* arms */}
              <g className="arm arm-l"><rect x={0} y={TOP + 4 * P} width={P} height={P * 2.6} rx={2} fill={EDGE} /><rect x={0} y={TOP + 6.2 * P} width={P} height={P * 0.5} fill={CYAN} /></g>
              <g className="arm arm-r"><rect x={13 * P} y={TOP + 4 * P} width={P} height={P * 2.6} rx={2} fill={EDGE} /><rect x={13 * P} y={TOP + 6.2 * P} width={P} height={P * 0.5} fill={CYAN} /></g>

              {/* holo-keyboard while typing */}
              {action === 'type' && (
                <g opacity={0.9}>
                  <rect x={4.0 * P} y={TOP + 9.0 * P} width={6 * P} height={1.5 * P} rx={2} fill="none" stroke={CYAN} strokeWidth={1} />
                  {[0, 1, 2, 3, 4].map((i) => (
                    <rect key={i} x={(4.5 + i) * P} y={TOP + 9.4 * P} width={0.7 * P} height={0.7 * P} fill={CYAN} opacity={0.8} />
                  ))}
                </g>
              )}

              {/* antenna (radar beacon) */}
              <rect x={cx - 1} y={TOP - 1.3 * P} width={2} height={1.3 * P} fill={HI} />
              <circle className="ant-tip" cx={cx} cy={TOP - 1.5 * P} r={2.6} fill={CYAN_HI} />

              {/* body */}
              <g className="body">
                <g transform={`translate(0 ${TOP})`}>
                  {BODY_RECTS.map((r, i) => (
                    <rect key={i} x={r.x} y={r.y} width={P} height={P} fill={r.c} />
                  ))}
                  {/* cyan scanning visor (replaces dot-eyes) */}
                  <g opacity={blink ? 0.2 : 1}>
                    <rect x={2.5 * P} y={4.3 * P} width={8 * P} height={1.5 * P} rx={3} fill="#0c3a44" />
                    <rect className="visor-mid" x={2.7 * P} y={4.5 * P} width={7.6 * P} height={1.1 * P} rx={3} fill={CYAN} opacity={0.72} />
                    <rect className="visor-scan" x={2.9 * P} y={4.5 * P} width={1.6 * P} height={1.1 * P} rx={2} fill={CYAN_HI} />
                  </g>
                </g>
              </g>
            </g>
          </g>
        </svg>
      </div>
    </motion.div>
  )
}
