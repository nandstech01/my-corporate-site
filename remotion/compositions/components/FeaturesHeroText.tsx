import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

interface FeaturesHeroTextProps {
  isDark: boolean;
}

const LINE_1 = 'すべての機能は';
const LINE_2_GRADIENT = 'ひとつのURL';
const LINE_2_SUFFIX = 'から始まる';

export const FeaturesHeroText: React.FC<FeaturesHeroTextProps> = ({ isDark }) => {
  const frame = useCurrentFrame();

  // Timeline (180 frames = 6 seconds):
  // Phase 1: Line 1 types (0-50)
  // Phase 2: Line 1 holds (50-70)
  // Phase 3: Line 1 fades out (70-85)
  // Phase 4: Line 2 types (85-150)
  // Phase 5: Line 2 holds (150-165)
  // Phase 6: Line 2 fades out for loop (165-180)

  const textColor = isDark ? '#FFFFFF' : '#1E293B';

  // Line 1 animation
  const line1CharsPerFrame = 0.35;
  const line1VisibleChars = Math.min(LINE_1.length, Math.floor(frame * line1CharsPerFrame));
  const line1Text = LINE_1.slice(0, line1VisibleChars);

  const line1Opacity = interpolate(frame, [0, 5, 70, 85], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const line1CursorVisible = frame < 50 && Math.floor(frame / 8) % 2 === 0;

  // Line 2 animation (starts at frame 85)
  const line2StartFrame = 85;
  const line2Frame = Math.max(0, frame - line2StartFrame);
  const line2CharsPerFrame = 0.3;
  const line2TotalText = LINE_2_GRADIENT + LINE_2_SUFFIX;
  const line2VisibleChars = Math.min(line2TotalText.length, Math.floor(line2Frame * line2CharsPerFrame));

  // Split visible chars between gradient and suffix
  const gradientVisibleChars = Math.min(LINE_2_GRADIENT.length, line2VisibleChars);
  const suffixVisibleChars = Math.max(0, line2VisibleChars - LINE_2_GRADIENT.length);

  const line2GradientText = LINE_2_GRADIENT.slice(0, gradientVisibleChars);
  const line2SuffixText = LINE_2_SUFFIX.slice(0, suffixVisibleChars);

  const line2Opacity = interpolate(frame, [85, 90, 165, 180], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const line2CursorVisible = frame >= line2StartFrame && frame < 150 && Math.floor(frame / 8) % 2 === 0;

  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 40px',
      }}
    >
      {/* Both lines in same position - only one visible at a time */}
      <div style={{ position: 'relative', height: 90 }}>
        {/* Line 1: すべての機能は */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 72,
            fontWeight: 900,
            color: textColor,
            fontFamily: '"Noto Sans JP", sans-serif',
            opacity: line1Opacity,
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {line1Text}
          {line1CursorVisible && line1VisibleChars < LINE_1.length && (
            <span
              style={{
                display: 'inline-block',
                width: 4,
                height: 60,
                background: '#2563EB',
                marginLeft: 4,
              }}
            />
          )}
        </div>

        {/* Line 2: ひとつのURLから始まる */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 72,
            fontWeight: 900,
            fontFamily: '"Noto Sans JP", sans-serif',
            opacity: line2Opacity,
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              backgroundImage: 'linear-gradient(90deg, #2563EB, #06B6D4)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {line2GradientText}
          </span>
          <span style={{ color: textColor }}>
            {line2SuffixText}
          </span>
          {line2CursorVisible && line2VisibleChars < line2TotalText.length && (
            <span
              style={{
                display: 'inline-block',
                width: 4,
                height: 60,
                background: '#2563EB',
                marginLeft: 4,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
