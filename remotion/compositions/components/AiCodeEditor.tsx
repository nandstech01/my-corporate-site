import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { SDLP_VP_COLORS } from '../../types/constants';

interface CodeSegment {
  text: string;
  color: string;
}

interface AiCodeEditorProps {
  startFrame: number;
  fileName: string;
}

const CODE_SEGMENTS: CodeSegment[] = [
  { text: 'export default', color: SDLP_VP_COLORS.code.keyword },
  { text: '\n  function ', color: SDLP_VP_COLORS.code.keyword },
  { text: 'App', color: SDLP_VP_COLORS.code.nextjs },
  { text: '() {\n', color: SDLP_VP_COLORS.text.primary },
  { text: '  const ', color: SDLP_VP_COLORS.code.keyword },
  { text: '[data]', color: SDLP_VP_COLORS.text.primary },
  { text: ' =\n', color: SDLP_VP_COLORS.text.secondary },
  { text: '    useAI', color: SDLP_VP_COLORS.code.ai },
  { text: '({\n', color: SDLP_VP_COLORS.text.primary },
  { text: '      model', color: SDLP_VP_COLORS.code.supabase },
  { text: ': ', color: SDLP_VP_COLORS.text.secondary },
  { text: '"gpt-4o"', color: SDLP_VP_COLORS.code.string },
  { text: ',\n', color: SDLP_VP_COLORS.text.secondary },
  { text: '      db', color: SDLP_VP_COLORS.code.supabase },
  { text: ': ', color: SDLP_VP_COLORS.text.secondary },
  { text: '"supabase"', color: SDLP_VP_COLORS.code.string },
  { text: ',\n', color: SDLP_VP_COLORS.text.secondary },
  { text: '      auth', color: SDLP_VP_COLORS.code.supabase },
  { text: ': ', color: SDLP_VP_COLORS.text.secondary },
  { text: 'true', color: SDLP_VP_COLORS.code.ai },
  { text: '\n    })\n', color: SDLP_VP_COLORS.text.primary },
  { text: '  return ', color: SDLP_VP_COLORS.code.keyword },
  { text: '<Dashboard />', color: SDLP_VP_COLORS.code.nextjs },
  { text: '\n}', color: SDLP_VP_COLORS.text.primary },
];

const CHARS_PER_FRAME = 1.4;

export const AiCodeEditor: React.FC<AiCodeEditorProps> = ({
  startFrame,
  fileName,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  if (localFrame < 0) return null;

  const opacity = interpolate(localFrame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const totalCharsToShow = Math.floor(Math.max(0, localFrame - 10) * CHARS_PER_FRAME);
  const totalChars = CODE_SEGMENTS.reduce((a, s) => a + s.text.length, 0);

  let charsShown = 0;
  const visibleSegments: Array<{ text: string; color: string }> = [];

  for (const segment of CODE_SEGMENTS) {
    if (charsShown >= totalCharsToShow) break;
    const remaining = totalCharsToShow - charsShown;
    const segText = segment.text.slice(0, remaining);
    visibleSegments.push({ text: segText, color: segment.color });
    charsShown += segment.text.length;
  }

  const showCursor = charsShown < totalChars && localFrame % 24 < 16;

  // Build progress (starts after code is mostly typed)
  const buildStart = startFrame + 50;
  const buildProgress = interpolate(frame, [buildStart, buildStart + 15], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const checkOpacity = interpolate(frame, [buildStart + 15, buildStart + 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: 20,
        top: 20,
        width: 340,
        height: 410,
        opacity,
        fontFamily: 'JetBrains Mono, Fira Code, monospace',
        fontSize: 12,
        lineHeight: 1.6,
      }}
    >
      <div
        style={{
          height: '100%',
          background: 'rgba(15, 23, 42, 0.9)',
          borderRadius: 12,
          border: '1px solid rgba(51, 65, 85, 0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* File tab header */}
        <div
          style={{
            padding: '8px 14px',
            borderBottom: '1px solid rgba(51, 65, 85, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#EF4444' }} />
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#F59E0B' }} />
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981' }} />
          </div>
          <span
            style={{
              fontSize: 11,
              color: SDLP_VP_COLORS.text.secondary,
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            {fileName}
          </span>
        </div>

        {/* Code area */}
        <div style={{ flex: 1, padding: '12px 14px', whiteSpace: 'pre', overflow: 'hidden' }}>
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
                height: 14,
                background: SDLP_VP_COLORS.code.ai,
                verticalAlign: 'middle',
                marginLeft: 1,
              }}
            />
          )}
        </div>

        {/* Build progress bar */}
        <div
          style={{
            padding: '8px 14px',
            borderTop: '1px solid rgba(51, 65, 85, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div
            style={{
              flex: 1,
              height: 6,
              borderRadius: 3,
              background: 'rgba(51, 65, 85, 0.4)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${buildProgress}%`,
                height: '100%',
                borderRadius: 3,
                background: `linear-gradient(90deg, ${SDLP_VP_COLORS.code.nextjs}, ${SDLP_VP_COLORS.code.supabase})`,
              }}
            />
          </div>
          <span
            style={{
              fontSize: 10,
              color: buildProgress >= 100 ? SDLP_VP_COLORS.code.supabase : SDLP_VP_COLORS.text.secondary,
              fontFamily: 'Inter, system-ui, sans-serif',
              minWidth: 36,
              textAlign: 'right',
            }}
          >
            {buildProgress >= 100 ? (
              <span style={{ opacity: checkOpacity }}>✓</span>
            ) : (
              `${Math.round(buildProgress)}%`
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
