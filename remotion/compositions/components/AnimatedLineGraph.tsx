import { interpolate, useCurrentFrame } from 'remotion';
import { SCENE_COLORS } from '../../types/constants';

interface AnimatedLineGraphProps {
  isDark: boolean;
  startFrame: number;
}

// Graph data points (normalized 0-1)
const DATA_POINTS = [0.2, 0.35, 0.25, 0.45, 0.4, 0.6, 0.55, 0.75, 0.7, 0.85];

export const AnimatedLineGraph: React.FC<AnimatedLineGraphProps> = ({
  isDark,
  startFrame,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  if (localFrame < 0) return null;

  const graphWidth = 320;
  const graphHeight = 180;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const innerWidth = graphWidth - padding.left - padding.right;
  const innerHeight = graphHeight - padding.top - padding.bottom;

  // Grid lines fade in
  const gridOpacity = interpolate(localFrame, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Line draw progress
  const lineProgress = interpolate(localFrame, [30, 100], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Calculate path
  const points = DATA_POINTS.map((value, index) => ({
    x: padding.left + (index / (DATA_POINTS.length - 1)) * innerWidth,
    y: padding.top + innerHeight - value * innerHeight,
  }));

  // Create SVG path
  const linePath = points
    .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  // Create area path for fill
  const areaPath =
    linePath +
    ` L ${points[points.length - 1].x} ${padding.top + innerHeight}` +
    ` L ${points[0].x} ${padding.top + innerHeight} Z`;

  // Calculate total path length (approximate)
  const pathLength = points.reduce((acc, point, i) => {
    if (i === 0) return 0;
    const prev = points[i - 1];
    return acc + Math.sqrt(Math.pow(point.x - prev.x, 2) + Math.pow(point.y - prev.y, 2));
  }, 0);

  const bgColor = isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)';
  const borderColor = isDark ? '#334155' : '#E2E8F0';
  const textColor = isDark ? '#64748B' : '#94A3B8';

  return (
    <div
      style={{
        position: 'absolute',
        left: '8%',
        top: '50%',
        transform: 'translateY(-50%)',
      }}
    >
      <div
        style={{
          background: bgColor,
          border: `2px solid ${borderColor}`,
          borderRadius: 16,
          padding: 16,
          boxShadow: isDark
            ? '0 20px 40px rgba(0, 0, 0, 0.5)'
            : '0 20px 40px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: textColor,
            marginBottom: 12,
          }}
        >
          AI Citation Growth
        </div>
        <svg width={graphWidth} height={graphHeight}>
          {/* Grid lines */}
          <g opacity={gridOpacity}>
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
              <line
                key={ratio}
                x1={padding.left}
                y1={padding.top + innerHeight * (1 - ratio)}
                x2={padding.left + innerWidth}
                y2={padding.top + innerHeight * (1 - ratio)}
                stroke={SCENE_COLORS.graph.grid}
                strokeDasharray="4 4"
              />
            ))}
            {/* Y-axis labels */}
            {[0, 50, 100].map((label, i) => (
              <text
                key={label}
                x={padding.left - 8}
                y={padding.top + innerHeight * (1 - i / 2)}
                fill={textColor}
                fontSize={10}
                textAnchor="end"
                alignmentBaseline="middle"
              >
                {label}%
              </text>
            ))}
          </g>

          {/* Fill area (gradient) */}
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={SCENE_COLORS.graph.line} stopOpacity={0.4} />
              <stop offset="100%" stopColor={SCENE_COLORS.graph.line} stopOpacity={0.05} />
            </linearGradient>
            <clipPath id="lineClip">
              <rect
                x={padding.left}
                y={padding.top}
                width={innerWidth * lineProgress}
                height={innerHeight + padding.bottom}
              />
            </clipPath>
          </defs>

          <g clipPath="url(#lineClip)">
            {/* Area fill */}
            <path d={areaPath} fill="url(#lineGradient)" />

            {/* Line */}
            <path
              d={linePath}
              fill="none"
              stroke={SCENE_COLORS.graph.line}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {points.map((point, i) => {
              const pointProgress = lineProgress * DATA_POINTS.length;
              const pointOpacity = interpolate(
                pointProgress - i,
                [0, 0.5],
                [0, 1],
                {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }
              );
              return (
                <circle
                  key={i}
                  cx={point.x}
                  cy={point.y}
                  r={4}
                  fill={SCENE_COLORS.graph.line}
                  opacity={pointOpacity}
                />
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
};
