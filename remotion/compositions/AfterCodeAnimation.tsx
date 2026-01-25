import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { BEFORE_AFTER_CONFIG } from '../types/constants';

interface AfterCodeAnimationProps {
  isDark: boolean;
}

const JSON_LINES = [
  { text: '"type": "Article",', color: '#A855F7', indent: 0 }, // purple
  { text: '"hasPart": [', color: '#3B82F6', indent: 0 }, // blue
  { text: '{"@type": "KeyInsight", "value": "..."}', color: '#10B981', indent: 1 }, // green
  { text: ']', color: '#3B82F6', indent: 0 }, // blue
];

export const AfterCodeAnimation: React.FC<AfterCodeAnimationProps> = ({ isDark }) => {
  const frame = useCurrentFrame();
  const { DURATION } = BEFORE_AFTER_CONFIG;

  const bgColor = isDark ? '#0F172A' : '#FFFFFF';
  const codeBgColor = isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)';

  // Typing animation: 0-110 frames
  const typingEndFrame = 110;
  const glowStartFrame = 130;
  const glowEndFrame = 150;
  const holdEndFrame = 155;

  // Calculate visible characters based on frame
  const charsPerFrame = 0.7;
  const totalChars = Math.min(frame, typingEndFrame) * charsPerFrame;

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
  const cursorVisible = Math.floor(frame / 15) % 2 === 0 && frame < typingEndFrame;

  // Fade in at start, fade out at end for loop
  const opacity = interpolate(
    frame,
    [0, 15, holdEndFrame, DURATION],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Glow effect after typing completes
  const glowIntensity = interpolate(
    frame,
    [glowStartFrame, glowEndFrame],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const glowColor = isDark
    ? `rgba(37, 99, 235, ${glowIntensity * 0.4})`
    : `rgba(37, 99, 235, ${glowIntensity * 0.2})`;

  return (
    <AbsoluteFill style={{ background: bgColor }}>
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
            background: codeBgColor,
            border: '1px solid rgba(37, 99, 235, 0.3)',
            borderRadius: 8,
            padding: 16,
            fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace',
            fontSize: 13,
            lineHeight: 1.6,
            boxShadow: frame >= glowStartFrame
              ? `0 0 20px ${glowColor}, 0 0 40px ${glowColor}`
              : 'none',
            transition: 'box-shadow 0.3s ease',
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
    </AbsoluteFill>
  );
};
