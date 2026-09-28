import type { DiagramBlock } from '@/app/posts/_lib/guide-blocks'
import { DIAGRAM_TEXT, layoutDiagram, type LaidOutNode } from './diagram-layout'
import { stableId } from './format'

const { LABEL_SIZE, LABEL_LINE, SUB_SIZE, SUB_LINE, PAD, EDGE_LABEL_SIZE } = DIAGRAM_TEXT

/** 図の中身を 1 文にする (SVG の desc。読み上げと検索向け) */
function describe(block: DiagramBlock): string {
  const names = new Map(block.nodes.map((node) => [node.id, node.label]))
  const nodes = block.nodes.map((node, index) => `${index + 1}. ${node.label}${node.sub ? ` (${node.sub})` : ''}`)
  const edges = block.edges.map(
    (edge) => `${names.get(edge.from)} → ${names.get(edge.to)}${edge.label ? ` (${edge.label})` : ''}`
  )
  return [...nodes, ...edges].join(' / ')
}

function NodeText({ node, kind }: { node: LaidOutNode; kind: DiagramBlock['kind'] }) {
  const boxed = kind !== 'timeline'
  const x = boxed ? node.x + PAD : node.x
  const labelTop = boxed ? node.y + PAD : node.y + (node.sub.length > 0 ? node.sub.length * SUB_LINE + 2 : 0)
  const subTop = boxed ? node.y + PAD + node.label.length * LABEL_LINE + 4 : node.y

  return (
    <>
      <text className="guide-diagram__label" x={x} y={labelTop} fontSize={LABEL_SIZE} fill="currentColor">
        {node.label.map((line, index) => (
          <tspan key={index} x={x} dy={index === 0 ? LABEL_LINE - 5 : LABEL_LINE}>
            {line}
          </tspan>
        ))}
      </text>
      {node.sub.length > 0 && (
        <text className="guide-diagram__sub" x={x} y={subTop} fontSize={SUB_SIZE} fill="currentColor">
          {node.sub.map((line, index) => (
            <tspan key={index} x={x} dy={index === 0 ? SUB_LINE - 5 : SUB_LINE}>
              {line}
            </tspan>
          ))}
        </text>
      )}
    </>
  )
}

/**
 * 図解 (flow / timeline / cards) をサーバーで SVG にする。座標は diagram-layout が決める。
 * 見た目は components/guide/guide.css の .guide-diagram* で決める (ここは構造だけ)。
 */
export default function FlowDiagram({ block }: { block: DiagramBlock }) {
  const layout = layoutDiagram(block)
  const id = stableId('guide-diagram', JSON.stringify(block))

  return (
    <figure className="guide-diagram" data-guide-block="diagram" data-kind={block.kind}>
      <figcaption className="guide-diagram__title">{block.title}</figcaption>
      <svg
        className="guide-diagram__svg"
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        width="100%"
        role="img"
        aria-labelledby={`${id}-title ${id}-desc`}
        preserveAspectRatio="xMinYMin meet"
      >
        <title id={`${id}-title`}>{block.title}</title>
        <desc id={`${id}-desc`}>{describe(block)}</desc>
        {layout.edges.length > 0 && (
          <defs>
            <marker id={`${id}-arrow`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" fill="currentColor" />
            </marker>
          </defs>
        )}
        {layout.axis && (
          <line
            className="guide-diagram__axis"
            x1={layout.axis.x}
            y1={layout.axis.y1}
            x2={layout.axis.x}
            y2={layout.axis.y2}
            stroke="currentColor"
          />
        )}
        {layout.edges.map((edge) => (
          <g className="guide-diagram__edge" key={`${edge.from}-${edge.to}`} data-from={edge.from} data-to={edge.to}>
            <path d={edge.path} fill="none" stroke="currentColor" markerEnd={`url(#${id}-arrow)`} />
            {edge.label && (
              <text
                className="guide-diagram__edge-label"
                x={edge.label.x}
                y={edge.label.y}
                fontSize={EDGE_LABEL_SIZE}
                textAnchor={edge.label.anchor}
                fill="currentColor"
              >
                {edge.label.text}
              </text>
            )}
          </g>
        ))}
        {layout.nodes.map((node) => (
          <g className="guide-diagram__node" key={node.id} data-node={node.id}>
            {block.kind === 'timeline' ? (
              <circle className="guide-diagram__marker" cx={layout.axis?.x ?? 12} cy={node.y + 9} r={5} fill="currentColor" />
            ) : (
              <rect
                className="guide-diagram__box"
                x={node.x}
                y={node.y}
                width={node.w}
                height={node.h}
                fill="none"
                stroke="currentColor"
              />
            )}
            <NodeText node={node} kind={block.kind} />
          </g>
        ))}
      </svg>
    </figure>
  )
}
