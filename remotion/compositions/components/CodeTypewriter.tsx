import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { SDLP_SCENE_COLORS } from '../../types/constants';

interface CodeTypewriterProps {
  startFrame: number;
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

export const CodeTypewriter: React.FC<CodeTypewriterProps> = ({ startFrame }) => {
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

  const showCursor = localFrame % 30 < 20;

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
          background: 'rgba(15, 23, 42, 0.8)',
          borderRadius: 12,
          border: '1px solid rgba(51, 65, 85, 0.5)',
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

        {visibleSegments.map((seg, i) => (
          <span key={i} style={{ color: seg.color }}>
            {seg.text}
          </span>
        ))}
        {showCursor && (
          <span
            style={{
              display: 'inline-block',
              width: 2,
              height: 18,
              background: SDLP_SCENE_COLORS.glow.cyan,
              verticalAlign: 'middle',
              marginLeft: 1,
            }}
          />
        )}
      </div>
    </div>
  );
};
