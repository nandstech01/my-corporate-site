import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { SDLP_VP_COLORS } from '../../types/constants';

interface TextSegment {
  text: string;
  color?: string;
  bold?: boolean;
}

interface ChatBubbleProps {
  segments: TextSegment[];
  side: 'left' | 'right';
  avatarColor: string;
  avatarLabel: string;
  enterFrame: number;
  typewriter?: boolean;
  charsPerFrame?: number;
}

const TYPEWRITER_SPEED = 1.5;

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  segments,
  side,
  avatarColor,
  avatarLabel,
  enterFrame,
  typewriter = false,
  charsPerFrame = TYPEWRITER_SPEED,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - enterFrame;

  if (localFrame < 0) return null;

  const slideIn = interpolate(localFrame, [0, 12], [side === 'right' ? 30 : -30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const opacity = interpolate(localFrame, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const isRight = side === 'right';

  const totalCharsToShow = typewriter
    ? Math.floor(localFrame * charsPerFrame)
    : Infinity;

  let charsShown = 0;
  const visibleSegments: Array<{ text: string; color: string; bold: boolean }> = [];

  for (const segment of segments) {
    if (charsShown >= totalCharsToShow) break;
    const remaining = totalCharsToShow - charsShown;
    const segText = segment.text.slice(0, remaining);
    visibleSegments.push({
      text: segText,
      color: segment.color ?? SDLP_VP_COLORS.text.primary,
      bold: segment.bold ?? false,
    });
    charsShown += segment.text.length;
  }

  const showCursor = typewriter && charsShown < segments.reduce((a, s) => a + s.text.length, 0)
    ? localFrame % 20 < 14
    : false;

  const bubbleRadius = isRight
    ? '16px 16px 4px 16px'
    : '16px 16px 16px 4px';

  const bubbleBg = isRight
    ? `linear-gradient(135deg, ${SDLP_VP_COLORS.chat.userBubble}, ${SDLP_VP_COLORS.chat.userBubble}dd)`
    : 'rgba(30, 41, 59, 0.9)';

  const bubbleBorder = isRight
    ? `1px solid ${SDLP_VP_COLORS.chat.userBubble}80`
    : '1px solid rgba(51, 65, 85, 0.5)';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isRight ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        gap: 10,
        opacity,
        transform: `translateX(${slideIn}px)`,
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: avatarColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          fontWeight: 700,
          color: '#FFF',
          fontFamily: 'Inter, system-ui, sans-serif',
          flexShrink: 0,
        }}
      >
        {avatarLabel}
      </div>

      {/* Bubble */}
      <div
        style={{
          maxWidth: 340,
          padding: '12px 16px',
          borderRadius: bubbleRadius,
          background: bubbleBg,
          border: bubbleBorder,
          fontSize: 13,
          lineHeight: 1.6,
          fontFamily: 'Inter, system-ui, sans-serif',
          whiteSpace: 'pre-wrap',
        }}
      >
        {visibleSegments.map((seg, i) => (
          <span
            key={i}
            style={{
              color: seg.color,
              fontWeight: seg.bold ? 700 : 400,
            }}
          >
            {seg.text}
          </span>
        ))}
        {showCursor && (
          <span
            style={{
              display: 'inline-block',
              width: 2,
              height: 14,
              background: SDLP_VP_COLORS.text.primary,
              verticalAlign: 'middle',
              marginLeft: 1,
            }}
          />
        )}
      </div>
    </div>
  );
};
