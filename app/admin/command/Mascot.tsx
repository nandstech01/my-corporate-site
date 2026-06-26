'use client'

/**
 * CORTEX 司令塔 ドットマスコット (NANDS pixel mascot).
 * A simple orange pixel-art creature that lives at the bottom of the command
 * center: it ambiently walks / idles / types / instructs, and REACTS to live
 * data — runs to center + "！" on a new inquiry, celebrates when today's post
 * count rises. Pure additive overlay: never touches the 3D globe / HUD / data.
 *
 * Design is intentionally logo-independent (logo TBD for the "new NANDS"
 * rebrand). The character is defined as a pixel matrix + a few animated limbs
 * in ONE file, so it can be re-skinned later by editing only the matrix/colors.
 */

import { useEffect, useRef, useState } from 'react'
import { motion, useAnimationControls } from 'framer-motion'

// ---- character pixel definition (re-skin here when the logo is ready) ----
const ORANGE = '#E8845C'
const DARK = '#C96A45'
const LIGHT = '#F2A07E'
const EYE = '#1b1410'
const P = 7 // px per pixel-cell
const COL: Record<string, string> = { O: ORANGE, D: DARK, L: LIGHT }

// body grid is 12 wide × 10 tall; rendered offset by +1 cell so arms sit at x=0/x=13
const BODY = [
  '.DDDDDDDDDD.',
  'DOLLLLLLLLOD',
  'DOOOOOOOOOOD',
  'DOOOOOOOOOOD',
  'DOOOOOOOOOOD',
  'DOOOOOOOOOOD',
  'DOOOOOOOOOOD',
  'DOOOOOOOOOOD',
  '.DOOOOOOOOD.',
  '..DDDDDDDD..',
]

type Action = 'idle' | 'walk' | 'type' | 'instruct' | 'celebrate' | 'alert'
type Reaction = { kind: 'alert' | 'celebrate' | 'hop'; text?: string }

interface MetricsLike {
  postsToday: { total: number }
  latestInquiry: { id: string } | null
}

const css = `
.cmasc-wrap { position: fixed; bottom: 16px; left: 0; z-index: 30; pointer-events: none; }
.cmasc { display:block; filter: drop-shadow(0 6px 10px rgba(0,0,0,0.5)) drop-shadow(0 0 14px rgba(232,132,92,0.45)); pointer-events:auto; cursor:pointer; }
.cmasc .body { transform-box: fill-box; transform-origin: center bottom; }
.cmasc.a-idle .body, .cmasc.a-instruct .body { animation: cmasc-bob 2.2s ease-in-out infinite; }
.cmasc.a-walk .body { animation: cmasc-bob .5s ease-in-out infinite; }
.cmasc.a-type .body { animation: cmasc-bob 1.5s ease-in-out infinite; }
@keyframes cmasc-bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-2px)} }

.cmasc-jump { transform-box: fill-box; transform-origin:center bottom; }
.cmasc.a-celebrate .cmasc-jump, .cmasc.a-alert .cmasc-jump { animation: cmasc-jump .56s cubic-bezier(.3,.7,.4,1) infinite; }
@keyframes cmasc-jump { 0%{transform:translateY(0)} 32%{transform:translateY(-15px)} 64%{transform:translateY(0)} 100%{transform:translateY(0)} }

.cmasc .leg { transform-box: fill-box; transform-origin: center top; }
.cmasc.a-walk .leg-l { animation: cmasc-step .5s ease-in-out infinite; }
.cmasc.a-walk .leg-r { animation: cmasc-step .5s ease-in-out infinite .25s; }
@keyframes cmasc-step { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }

.cmasc .arm { transform-box: fill-box; transform-origin: top center; transition: transform .18s ease; }
.cmasc.a-type .arm-l { animation: cmasc-tap .26s ease-in-out infinite; }
.cmasc.a-type .arm-r { animation: cmasc-tap .26s ease-in-out infinite .13s; }
@keyframes cmasc-tap { 0%,100%{transform:translateY(0)} 50%{transform:translateY(3px)} }
.cmasc.a-instruct .arm-r { transform: rotate(-62deg) translateY(-3px); }
.cmasc.a-celebrate .arm-l, .cmasc.a-alert .arm-l { transform: rotate(46deg) translateY(-4px); }
.cmasc.a-celebrate .arm-r, .cmasc.a-alert .arm-r { transform: rotate(-46deg) translateY(-4px); }

.cmasc-bubble { position:absolute; left:50%; transform:translateX(-50%); bottom:104px; white-space:nowrap;
  font-family: 'IBM Plex Mono', ui-monospace, monospace; font-weight:600; font-size:13px; letter-spacing:.06em;
  color:#fff; background:rgba(7,11,22,0.92); border:1px solid rgba(232,132,92,0.6); border-radius:9px;
  padding:5px 11px; box-shadow:0 0 22px rgba(232,132,92,0.4); }
.cmasc-bubble::after { content:''; position:absolute; top:100%; left:50%; transform:translateX(-50%);
  border:6px solid transparent; border-top-color:rgba(232,132,92,0.6); }
.cmasc-spark { position:absolute; bottom:96px; font-size:14px; color:#F2A07E; text-shadow:0 0 8px #E8845C;
  animation: cmasc-spark 1s ease-out infinite; }
@keyframes cmasc-spark { 0%{opacity:0; transform:translateY(6px) scale(.6)} 30%{opacity:1} 100%{opacity:0; transform:translateY(-22px) scale(1.1)} }

@media (prefers-reduced-motion: reduce) {
  .cmasc *, .cmasc { animation: none !important; }
}
`

function rectsFromMatrix() {
  const out: { x: number; y: number; c: string }[] = []
  BODY.forEach((row, r) => {
    for (let c = 0; c < row.length; c++) {
      const ch = row[c]
      if (ch !== '.') out.push({ x: (c + 1) * P, y: r * P, c: COL[ch] })
    }
  })
  return out
}
const BODY_RECTS = rectsFromMatrix()

export default function Mascot({ metrics }: { metrics: MetricsLike | null }) {
  const controls = useAnimationControls()
  const [action, setAction] = useState<Action>('idle')
  const [facing, setFacing] = useState<1 | -1>(1)
  const [blink, setBlink] = useState(false)
  const [bubble, setBubble] = useState<string | null>(null)
  const [sparkle, setSparkle] = useState(false)
  const [mounted, setMounted] = useState(false)

  const reaction = useRef<Reaction | null>(null)
  const petKick = useRef(false)

  useEffect(() => setMounted(true), [])

  // blink loop
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>
    const loop = () => {
      setBlink(true)
      setTimeout(() => setBlink(false), 140)
      t = setTimeout(loop, 2600 + Math.random() * 3200)
    }
    t = setTimeout(loop, 1800)
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
    const M = 70 // edge margin
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
        await moveTo(W() / 2 - 40, 260, 'easeOut') // sprint to center
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
        if (petKick.current) { petKick.current = false; await doReaction({ kind: 'hop' }); continue }
        if (reaction.current) { const r = reaction.current; reaction.current = null; await doReaction(r); continue }
        const roll = Math.random()
        if (roll < 0.5) {
          setAction('walk')
          const dir = Math.random() < 0.5 ? 1 : -1
          await moveTo(x + dir * (140 + Math.random() * 380), 72)
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

  if (!mounted) return null

  const W = 14 * P // viewBox width (12 body + 2 arm cols)
  const H = 13 * P // body 10 + legs ~3

  return (
    <motion.div className="cmasc-wrap" animate={controls} initial={{ x: 110 }}>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div style={{ position: 'relative', width: W, height: H + 110 }}>
        {bubble && <div className="cmasc-bubble">{bubble}</div>}
        {sparkle && (
          <>
            <span className="cmasc-spark" style={{ left: 6 }}>✦</span>
            <span className="cmasc-spark" style={{ left: W - 14, animationDelay: '.35s' }}>✧</span>
            <span className="cmasc-spark" style={{ left: W / 2 - 4, animationDelay: '.6s' }}>✦</span>
          </>
        )}
        <svg
          className={`cmasc a-${action}`}
          width={W * 1.5}
          height={(H + 6) * 1.5}
          viewBox={`0 0 ${W} ${H + 6}`}
          style={{ position: 'absolute', bottom: 0, left: '50%', transform: `translateX(-50%) scaleX(${facing})` }}
          onClick={() => { petKick.current = true }}
          shapeRendering="crispEdges"
        >
          <g className="cmasc-jump">
            {/* legs (animated feet) */}
            <g className="leg leg-l"><rect x={4 * P} y={10 * P} width={P * 1.7} height={P * 1.7} fill={DARK} /></g>
            <g className="leg leg-r"><rect x={7.3 * P} y={10 * P} width={P * 1.7} height={P * 1.7} fill={DARK} /></g>

            {/* arms */}
            <g className="arm arm-l"><rect x={0} y={4 * P} width={P} height={P * 2.6} rx={1.5} fill={DARK} /></g>
            <g className="arm arm-r"><rect x={13 * P} y={4 * P} width={P} height={P * 2.6} rx={1.5} fill={DARK} /></g>

            {/* laptop while typing */}
            {action === 'type' && (
              <g>
                <rect x={4.2 * P} y={8.3 * P} width={5.6 * P} height={2.4 * P} rx={1.5} fill="#0c1322" stroke={DARK} strokeWidth={1} />
                <rect x={4.6 * P} y={8.7 * P} width={4.8 * P} height={1.5 * P} fill="#1f3b4d" />
              </g>
            )}

            {/* body */}
            <g className="body">
              {BODY_RECTS.map((r, i) => (
                <rect key={i} x={r.x} y={r.y} width={P} height={P} fill={r.c} />
              ))}
              {/* eyes (blink shrinks height) */}
              {[3.2, 8.0].map((cx, i) => (
                <g key={i}>
                  <rect x={cx * P} y={(blink ? 4.9 : 4) * P} width={1.8 * P} height={(blink ? 0.5 : 2) * P} rx={1.5} fill={EYE} />
                  {!blink && <rect x={(cx + 0.2) * P} y={4.2 * P} width={0.6 * P} height={0.6 * P} fill="#fff" />}
                </g>
              ))}
            </g>
          </g>
        </svg>
      </div>
    </motion.div>
  )
}
