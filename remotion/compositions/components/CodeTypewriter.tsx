import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { SDLP_SCENE_COLORS } from '../../types/constants';

interface CodeTypewriterProps {
  startFrame: number;
  isDark?: boolean;
}

const CODE_LINES = [
  { text: 'const', color: SDLP_SCENE_COLORS.text.secondary },
  { text: ' aiSystem', color: SDLP_SCENE_COLORS.architecture.frontend },
  { text: ' = ', color: SDLP_SCENE_COLORS.text.secondary },
  { text: '{', color: SDLP_SCENE_COLORS.text.primary },
  { text: '\n  ai', color: SDLP_SCENE_COLORS.architecture.frontend },
  { text: ': ', color: SDLP_SCENE_COLORS.text.secondary },
  { text: '"GPT-4o"', color: '#F59E0B' },
  { text: ',', color: SDLP_SCENE_COLORS.text.secondary },
  { text: '\n  api', color: SDLP_SCENE_COLORS.architecture.api },
  { text: ': ', color: SDLP_SCENE_COLORS.text.secondary },
  { text: '"Next.js"', color: '#F59E0B' },
  { text: ',', color: SDLP_SCENE_COLORS.text.secondary },
  { text: '\n  vector', color: SDLP_SCENE_COLORS.architecture.database },
  { text: ': ', color: SDLP_SCENE_COLORS.text.secondary },
  { text: '"pgvector"', color: '#F59E0B' },
  { text: ',', color: SDLP_SCENE_COLORS.text.secondary },
  { text: '\n  rag', color: SDLP_SCENE_COLORS.architecture.auth },
  { text: ': ', color: SDLP_SCENE_COLORS.text.secondary },
  { text: '"LangChain"', color: '#F59E0B' },
  { text: '\n', color: SDLP_SCENE_COLORS.text.secondary },
  { text: '}', color: SDLP_SCENE_COLORS.text.primary },
];

const CHARS_PER_FRAME = 1.2;

export const CodeTypewriter: React.FC<CodeTypewriterProps> = ({ startFrame, isDark = true }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  if (localFrame < 0) return null;

  const opacity = interpolate(localFrame, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const totalCharsToShow = Math.floor(localFrame * CHARS_PER_FRAME);

  let charsShown = 0;
  const visibleSegments: Array<{ text: string; color: string }> = [];

  for (const segment of CODE_LINES) {
    if (charsShown >= totalCharsToShow) break;

    const remainingChars = totalCharsToShow - charsShown;
    const segmentText = segment.text.slice(0, remainingChars);
    visibleSegments.push({ text: segmentText, color: segment.color });
    charsShown += segment.text.length;
  }

  const cursorOpacity = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(localFrame * 0.2));

  // Build visible text and split into lines for highlighting
  const visibleText = visibleSegments.map((s) => s.text).join('');
  const lineCount = visibleText.split('\n').length;

  // Build line-aware rendering: group segments by line
  const lines: Array<Array<{ text: string; color: string }>> = [[]];
  for (const seg of visibleSegments) {
    const parts = seg.text.split('\n');
    parts.forEach((part, pi) => {
      if (pi > 0) lines.push([]);
      if (part) lines[lines.length - 1].push({ text: part, color: seg.color });
    });
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: 40,
        top: 40,
        opacity,
        fontFamily: 'JetBrains Mono, Fira Code, monospace',
        fontSize: 16,
        lineHeight: 1.6,
        whiteSpace: 'pre',
      }}
    >
      <div
        style={{
          background: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.95)',
          borderRadius: 12,
          border: isDark ? '1px solid rgba(51, 65, 85, 0.5)' : '1px solid rgba(226, 232, 240, 0.8)',
          padding: '16px 20px',
          minWidth: 280,
        }}
      >
        {/* Window dots */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} />
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }} />
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
        </div>

        {lines.map((lineSegs, lineIdx) => {
          const isCurrentLine = lineIdx === lineCount - 1;
          return (
            <div
              key={lineIdx}
              style={{
                background: isCurrentLine ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                margin: '0 -20px',
                padding: '0 20px',
              }}
            >
              {lineSegs.map((seg, i) => (
                <span key={i} style={{ color: seg.color }}>
                  {seg.text}
                </span>
              ))}
              {isCurrentLine && (
                <span
                  style={{
                    display: 'inline-block',
                    width: 2,
                    height: 18,
                    background: SDLP_SCENE_COLORS.glow.cyan,
                    opacity: cursorOpacity,
                    verticalAlign: 'middle',
                    marginLeft: 1,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
