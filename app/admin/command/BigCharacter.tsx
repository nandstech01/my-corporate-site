'use client'

/**
 * Enlarged CORTEX character for the chat dock. Same visor-robot art as the
 * roaming mascot, big and front-facing; the visor flickers while speaking.
 */

const BODY = '#46586e'
const EDGE = '#28323f'
const HI = '#8aa4ba'
const RIM = '#39E7DB'
const CYAN = '#3df0e6'
const CYAN_HI = '#cffffb'
const P = 12
const TOP = 2 * P
const COL: Record<string, string> = { B: BODY, E: EDGE, H: HI, R: RIM }

const MATRIX = [
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

const css = `
.bigc { filter: drop-shadow(0 10px 18px rgba(0,0,0,0.45)) drop-shadow(0 0 30px rgba(61,240,230,0.5)); }
.bigc .body { transform-box: fill-box; transform-origin: center bottom; animation: bigc-bob 3.2s ease-in-out infinite; }
@keyframes bigc-bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
.bigc .hov { transform-box: fill-box; transform-origin:center; animation: bigc-hov 3s ease-in-out infinite; }
@keyframes bigc-hov { 0%,100%{opacity:.3;transform:scaleX(1)} 50%{opacity:.6;transform:scaleX(1.18)} }
.bigc .vscan { transform-box: fill-box; animation: bigc-scan 2.6s ease-in-out infinite; }
@keyframes bigc-scan { 0%{transform:translateX(0)} 50%{transform:translateX(64px)} 100%{transform:translateX(0)} }
.bigc .anttip { transform-box: fill-box; transform-origin:center; animation: bigc-ant 1.7s ease-in-out infinite; }
@keyframes bigc-ant { 0%,100%{opacity:.5;transform:scale(.85)} 50%{opacity:1;transform:scale(1.15)} }
.bigc.talk .vscan { animation: bigc-scan .5s ease-in-out infinite; }
.bigc.talk .vmid { animation: bigc-talk .22s ease-in-out infinite; }
.bigc.talk .body { animation: bigc-bob .5s ease-in-out infinite; }
@keyframes bigc-talk { 0%,100%{opacity:.4} 50%{opacity:1} }
`

export default function BigCharacter({ speaking, size = 280 }: { speaking?: boolean; size?: number }) {
  const VBW = 14 * P
  const VBH = TOP + 13 * P
  const cx = 7 * P
  const rects: { x: number; y: number; c: string }[] = []
  MATRIX.forEach((row, r) => {
    for (let c = 0; c < row.length; c++) {
      const ch = row[c]
      if (ch !== '.') rects.push({ x: (c + 1) * P, y: TOP + r * P, c: COL[ch] })
    }
  })

  return (
    <svg className={`bigc ${speaking ? 'talk' : ''}`} width={size} height={size * (VBH / VBW)} viewBox={`0 0 ${VBW} ${VBH}`} shapeRendering="crispEdges">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <defs>
        <radialGradient id="bigc-hg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={CYAN} stopOpacity="0.9" />
          <stop offset="100%" stopColor={CYAN} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse className="hov" cx={cx} cy={TOP + 11 * P + 6} rx={4.6 * P} ry={1.1 * P} fill="url(#bigc-hg)" />
      <rect x={cx - 1.5} y={TOP - 1.3 * P} width={3} height={1.3 * P} fill={HI} />
      <circle className="anttip" cx={cx} cy={TOP - 1.5 * P} r={4} fill={CYAN_HI} />
      <g className="body">
        {rects.map((r, i) => <rect key={i} x={r.x} y={r.y} width={P} height={P} fill={r.c} />)}
        <rect x={2.5 * P} y={TOP + 4.3 * P} width={8 * P} height={1.5 * P} rx={4} fill="#0c3a44" />
        <rect className="vmid" x={2.7 * P} y={TOP + 4.5 * P} width={7.6 * P} height={1.1 * P} rx={4} fill={CYAN} opacity={0.72} />
        <rect className="vscan" x={2.9 * P} y={TOP + 4.5 * P} width={1.6 * P} height={1.1 * P} rx={3} fill={CYAN_HI} />
      </g>
    </svg>
  )
}
