import { interpolate, useCurrentFrame } from 'remotion';
import { SCENE_COLORS } from '../../types/constants';

interface JsonCodeBlockProps {
  isDark: boolean;
  startFrame: number;
}

const JSON_LINES = [
  { text: '{', color: SCENE_COLORS.json.bracket, indent: 0 },
  { text: '"@context": "https://schema.org",', color: SCENE_COLORS.json.key, indent: 1 },
  { text: '"@type": "Article",', color: SCENE_COLORS.json.string, indent: 1 },
  { text: '"name": "AI最適化ガイド",', color: SCENE_COLORS.json.string, indent: 1 },
  { text: '"author": {', color: SCENE_COLORS.json.key, indent: 1 },
  { text: '"@type": "Organization"', color: SCENE_COLORS.json.string, indent: 2 },
  { text: '}', color: SCENE_COLORS.json.bracket, indent: 1 },
  { text: '}', color: SCENE_COLORS.json.bracket, indent: 0 },
];

export const JsonCodeBlock: React.FC<JsonCodeBlockProps> = ({
  isDark,
  startFrame,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  const bgColor = isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)';
  const borderColor = isDark ? '#334155' : '#E2E8F0';

  // Calculate visible characters based on frame
  const charsPerFrame = 1.5;
  const totalChars = localFrame * charsPerFrame;

  let charCount = 0;
  const visibleLines = JSON_LINES.map((line) => {
    const lineStart = charCount;
    charCount += line.text.length;
    const visibleChars = Math.max(0, Math.min(line.text.length, totalChars - lineStart));
    return {
      ...line,
      visibleText: line.text.slice(0, visibleChars),
    };
  });

  // Cursor blink
  const cursorVisible = Math.floor(localFrame / 15) % 2 === 0;

  // Overall opacity for entrance
  const opacity = interpolate(localFrame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: '10%',
        top: '50%',
        transform: 'translateY(-50%)',
        width: 420,
        opacity,
      }}
    >
      <div
        style={{
          background: bgColor,
          border: `2px solid ${borderColor}`,
          borderRadius: 16,
          padding: 24,
          fontFamily: 'JetBrains Mono, Monaco, monospace',
          fontSize: 14,
          lineHeight: 1.8,
          boxShadow: isDark
            ? '0 20px 40px rgba(0, 0, 0, 0.5)'
            : '0 20px 40px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Header bar */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            marginBottom: 16,
            paddingBottom: 12,
            borderBottom: `1px solid ${borderColor}`,
          }}
        >
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#EF4444' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#F59E0B' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10B981' }} />
          <span
            style={{
              marginLeft: 'auto',
              fontSize: 11,
              color: isDark ? '#64748B' : '#94A3B8',
            }}
          >
            schema.json
          </span>
        </div>

        {/* Code lines */}
        {visibleLines.map((line, index) => (
          <div
            key={index}
            style={{
              paddingLeft: line.indent * 20,
              color: line.color,
              minHeight: 22,
            }}
          >
            {line.visibleText}
            {/* Show cursor at the end of current typing line */}
            {line.visibleText.length > 0 &&
              line.visibleText.length < line.text.length &&
              cursorVisible && (
                <span
                  style={{
                    display: 'inline-block',
                    width: 8,
                    height: 16,
                    background: '#2563EB',
                    marginLeft: 2,
                    verticalAlign: 'text-bottom',
                  }}
                />
              )}
          </div>
        ))}
      </div>
    </div>
  );
};
