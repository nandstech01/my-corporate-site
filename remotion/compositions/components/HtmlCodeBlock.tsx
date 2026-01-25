import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { BEFORE_AFTER_CONFIG } from '../../types/constants';

interface HtmlCodeBlockProps {
  isDark: boolean;
}

const HTML_LINES = [
  { text: '<div class="content">', color: '#94A3B8', indent: 0 },
  { text: 'AIが関連性を解析しにくい、', color: '', indent: 1 },
  { text: '巨大なテキストブロック...', color: '', indent: 1 },
  { text: '</div>', color: '#94A3B8', indent: 0 },
];

export const HtmlCodeBlock: React.FC<HtmlCodeBlockProps> = ({ isDark }) => {
  const frame = useCurrentFrame();
  const { DURATION } = BEFORE_AFTER_CONFIG;

  const bgColor = isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  const borderColor = isDark ? '#334155' : '#E2E8F0';
  const textColor = isDark ? '#E2E8F0' : '#374151';

  // Typing animation: 0-100 frames
  const typingEndFrame = 100;
  const holdEndFrame = 150;

  // Calculate visible characters based on frame
  const charsPerFrame = 0.8;
  const totalChars = Math.min(frame, typingEndFrame) * charsPerFrame;

  let charCount = 0;
  const visibleLines = HTML_LINES.map((line) => {
    const lineStart = charCount;
    charCount += line.text.length;
    const visibleChars = Math.max(0, Math.min(line.text.length, totalChars - lineStart));
    return {
      ...line,
      visibleText: line.text.slice(0, visibleChars),
      color: line.color || textColor,
    };
  });

  // Cursor blink
  const cursorVisible = Math.floor(frame / 15) % 2 === 0 && frame < typingEndFrame;

  // Fade in at start, fade out at end for loop
  const opacity = interpolate(
    frame,
    [0, 15, holdEndFrame, DURATION],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        opacity,
      }}
    >
      <div
        style={{
          width: '100%',
          background: bgColor,
          border: `1px dashed ${borderColor}`,
          borderRadius: 8,
          padding: 16,
          fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace',
          fontSize: 13,
          lineHeight: 1.6,
        }}
      >
        {visibleLines.map((line, index) => (
          <div
            key={index}
            style={{
              paddingLeft: line.indent * 16,
              color: line.color,
              minHeight: 21,
              whiteSpace: 'nowrap',
            }}
          >
            {line.visibleText}
            {line.visibleText.length > 0 &&
              line.visibleText.length < line.text.length &&
              cursorVisible && (
                <span
                  style={{
                    display: 'inline-block',
                    width: 6,
                    height: 14,
                    background: '#94A3B8',
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
