import type { CSSProperties } from 'react'
import type { DiagramBlock } from '@/app/posts/_lib/guide-blocks'
import {
  FLOW_VARIANTS,
  MAX_LR_LAYERS,
  describeFlow,
  flowLayerCount,
  layoutFlow,
  type FlowLayout,
  type Point,
} from './diagram-layout'
import { Phrases } from './phrases'

const pct = (value: number, total: number) => `${Math.round((value / total) * 1e5) / 1e3}%`

function pathD(points: readonly Point[]): string {
  return points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x} ${y}`).join(' ')
}

/** 終点の矢じり (最後の区間の向き) */
function arrowHead(points: readonly Point[]): string {
  const [ex, ey] = points[points.length - 1]
  const [px, py] = points[points.length - 2]
  const angle = Math.atan2(ey - py, ex - px)
  const length = 8
  const half = 4
  const bx = ex - Math.cos(angle) * length
  const by = ey - Math.sin(angle) * length
  const nx = -Math.sin(angle) * half
  const ny = Math.cos(angle) * half
  const r = (value: number) => Math.round(value * 100) / 100
  return `M${ex} ${ey} L${r(bx + nx)} ${r(by + ny)} L${r(bx - nx)} ${r(by - ny)} Z`
}

/**
 * 1 つの配置 (PC 用 / スマホ用) を描く。箱と文字は HTML (位置は図の座標に対する %)、線は同じ座標の SVG。
 * 文字の大きさは図の幅に比例 (cqw) させるので、表示倍率が変わっても箱と文字の比は配置のときのまま
 */
function FlowStage({ layout, variant, label }: { layout: FlowLayout; variant: 'wide' | 'narrow'; label: string }) {
  const { width: w, height: h, metrics: m } = layout
  const style = {
    aspectRatio: `${w} / ${h}`,
    '--dw': w,
    '--fl': m.label,
    '--fll': m.labelLine,
    '--fs': m.sub,
    '--fsl': m.subLine,
    '--px': m.padX,
    '--py': m.padY,
    '--fc': m.chip,
    '--fcl': Math.round(m.chip * 1.3),
  } as CSSProperties

  return (
    <div className="guide-flow" data-variant={variant} data-orient={layout.orientation} style={style} role="img" aria-label={label}>
      <svg className="guide-flow__lines" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
        {layout.edges.map((edge, index) => (
          <g key={index}>
            <path className="guide-flow__line" d={pathD(edge.points)} data-from={edge.from} data-to={edge.to} />
            <rect className="guide-flow__end" x={edge.points[0][0] - 2.5} y={edge.points[0][1] - 2.5} width={5} height={5} />
            <path className="guide-flow__end" d={arrowHead(edge.points)} />
          </g>
        ))}
      </svg>
      {layout.nodes.map((node) => (
        <div
          className="guide-flow__node"
          key={node.id}
          data-node={node.id}
          data-emphasis={node.emphasis ? '' : undefined}
          style={{ left: pct(node.x, w), top: pct(node.y, h), width: pct(node.w, w), height: pct(node.h, h) }}
        >
          <span className="guide-flow__label">
            {node.label.map((line, index) => (
              <span className="guide-flow__text" key={index}>
                {line}
              </span>
            ))}
          </span>
          {node.sub.length > 0 && (
            <span className="guide-flow__sub">
              {node.sub.map((line, index) => (
                <span className="guide-flow__text" key={index}>
                  {line}
                </span>
              ))}
            </span>
          )}
        </div>
      ))}
      {layout.edges.map((edge, index) =>
        edge.chip ? (
          <span
            className="guide-flow__chip"
            key={index}
            data-chip-for={`${edge.from}>${edge.to}`}
            style={{ left: pct(edge.chip.x, w), top: pct(edge.chip.y, h), width: pct(edge.chip.w, w), height: pct(edge.chip.h, h) }}
          >
            {edge.chip.lines.map((line, lineIndex) => (
              <span className="guide-flow__text" key={lineIndex}>
                {line}
              </span>
            ))}
          </span>
        ) : null
      )}
    </div>
  )
}

function FlowFigure({ block }: { block: DiagramBlock }) {
  const lr = flowLayerCount(block) <= MAX_LR_LAYERS && block.nodes.length > 1
  const wide = layoutFlow(block, lr ? FLOW_VARIANTS.wideLr : FLOW_VARIANTS.wideTb)
  const narrow = layoutFlow(block, FLOW_VARIANTS.narrow)
  const label = describeFlow(block)
  return (
    <figure className="guide-diagram" data-guide-block="diagram" data-kind="flow" data-orient={wide.orientation}>
      <div className="guide-diagram__panel">
        <FlowStage layout={wide} variant="wide" label={label} />
        <FlowStage layout={narrow} variant="narrow" label={label} />
      </div>
      <figcaption className="guide-caption guide-diagram__title">
        <Phrases text={block.title} />
      </figcaption>
    </figure>
  )
}

/** 時系列: 縦の罫線に沿った順序付きリスト (HTML だけ。どの幅でも文字は本文と同じ大きさ) */
function TimelineFigure({ block }: { block: DiagramBlock }) {
  return (
    <figure className="guide-diagram" data-guide-block="diagram" data-kind="timeline">
      <ol className="guide-timeline">
        {block.nodes.map((node) => (
          <li className="guide-timeline__item" key={node.id} data-node={node.id}>
            {node.sub && (
              <span className="guide-timeline__when">
                <Phrases text={node.sub} />
              </span>
            )}
            <span className="guide-timeline__what">
              <Phrases text={node.label} />
            </span>
          </li>
        ))}
      </ol>
      <figcaption className="guide-caption guide-diagram__title">
        <Phrases text={block.title} />
      </figcaption>
    </figure>
  )
}

/** 並列の項目: 罫線で区切った 2 列の格子 (スマホは 1 列) */
function CardsFigure({ block }: { block: DiagramBlock }) {
  return (
    <figure className="guide-diagram" data-guide-block="diagram" data-kind="cards">
      <ul className="guide-cells" data-count={block.nodes.length}>
        {block.nodes.map((node) => (
          <li className="guide-cells__item" key={node.id} data-node={node.id} data-emphasis={node.emphasis ? '' : undefined}>
            <span className="guide-cells__label">
              <Phrases text={node.label} />
            </span>
            {node.sub && (
              <span className="guide-cells__sub">
                <Phrases text={node.sub} />
              </span>
            )}
          </li>
        ))}
      </ul>
      <figcaption className="guide-caption guide-diagram__title">
        <Phrases text={block.title} />
      </figcaption>
    </figure>
  )
}

/**
 * 図解 (flow / timeline / cards)。flow の座標は diagram-layout が決める。
 * 見た目は components/guide/guide.css の .guide-diagram* / .guide-flow* / .guide-timeline* / .guide-cells*
 */
export default function FlowDiagram({ block }: { block: DiagramBlock }) {
  if (block.kind === 'timeline') return <TimelineFigure block={block} />
  if (block.kind === 'cards') return <CardsFigure block={block} />
  return <FlowFigure block={block} />
}
