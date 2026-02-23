import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS } from '../../types/constants';

interface AiOrbitIconProps {
  isDark: boolean;
  aiType: 'chatgpt' | 'gemini' | 'perplexity';
  orbitRadius: number;
  startAngle: number;
  orbitSpeed: number;
  enterDelay: number;
}

export const AiOrbitIcon: React.FC<AiOrbitIconProps> = ({
  isDark,
  aiType,
  orbitRadius,
  startAngle,
  orbitSpeed,
  enterDelay,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Entrance animation with stagger
  const entranceProgress = spring({
    frame: frame - enterDelay,
    fps,
    config: {
      damping: 15,
      stiffness: 80,
      mass: 1,
    },
  });

  const opacity = interpolate(frame - enterDelay, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Fade out at the end for seamless loop
  const fadeOut = interpolate(frame, [160, 180], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Continuous orbit rotation
  const angle = startAngle + (frame * orbitSpeed);
  const angleRad = (angle * Math.PI) / 180;

  // Calculate position on orbit
  const x = Math.cos(angleRad) * orbitRadius * entranceProgress;
  const y = Math.sin(angleRad) * orbitRadius * entranceProgress * 0.5; // Elliptical orbit

  // Micro breathing oscillation
  const breathingOffset = Math.sin(frame * 0.05) * 3;

  // Get AI-specific styles
  const aiStyles = getAiStyles(aiType);

  const bgColor = isDark ? COLORS.dark.card : COLORS.light.card;
  const borderColor = isDark ? COLORS.dark.border : COLORS.light.border;

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y + breathingOffset}px))`,
        opacity: opacity * fadeOut,
        zIndex: y > 0 ? 10 : 5, // Depth sorting based on Y position
      }}
    >
      <div
        style={{
          width: 128,
          height: 128,
          borderRadius: 32,
          backgroundColor: bgColor,
          border: `3px solid ${borderColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isDark
            ? '0 8px 24px rgba(0, 0, 0, 0.4)'
            : '0 8px 24px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: 20,
            background: aiStyles.gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {aiStyles.icon}
        </div>
      </div>
    </div>
  );
};

function getAiStyles(aiType: 'chatgpt' | 'gemini' | 'perplexity') {
  switch (aiType) {
    case 'chatgpt':
      return {
        gradient: `linear-gradient(135deg, ${COLORS.ai.chatgpt}, #1A7F64)`,
        icon: (
          <svg width="56" height="56" viewBox="0 0 24 24" fill="white">
            <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062l-4.84 2.797a4.504 4.504 0 0 1-6.14-1.652zm-1.23-10.39a4.476 4.476 0 0 1 2.341-1.971V11.5a.79.79 0 0 0 .392.682l5.843 3.369-2.02 1.168a.071.071 0 0 1-.069.006l-4.84-2.792A4.504 4.504 0 0 1 2.37 7.914zm16.59 3.855l-5.843-3.369 2.02-1.168a.071.071 0 0 1 .069-.006l4.84 2.792a4.504 4.504 0 0 1-.696 8.129v-5.697a.79.79 0 0 0-.39-.681zm2.01-3.023l-.141-.085-4.78-2.759a.776.776 0 0 0-.785 0L9.422 9.27V6.938a.08.08 0 0 1 .033-.062l4.84-2.796a4.5 4.5 0 0 1 6.675 4.666zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.077a4.5 4.5 0 0 1 7.375-3.453l-.142.08-4.778 2.758a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.612-1.5z" />
          </svg>
        ),
      };
    case 'gemini':
      return {
        gradient: `linear-gradient(135deg, #4285F4, #9B72CB, #D96570)`,
        icon: (
          <svg width="56" height="56" viewBox="0 0 24 24" fill="white">
            {/* Google Gemini sparkle icon */}
            <path d="M12 2C12 2 12 8.5 12 12C8.5 12 2 12 2 12C2 12 8.5 12 12 12C12 15.5 12 22 12 22C12 22 12 15.5 12 12C15.5 12 22 12 22 12C22 12 15.5 12 12 12C12 8.5 12 2 12 2Z" fill="white"/>
            <ellipse cx="12" cy="12" rx="3" ry="10" fill="white" opacity="0.8"/>
            <ellipse cx="12" cy="12" rx="10" ry="3" fill="white" opacity="0.8"/>
          </svg>
        ),
      };
    case 'perplexity':
      return {
        gradient: `linear-gradient(135deg, #20808D, #1FBFBF)`,
        icon: (
          <svg width="56" height="56" viewBox="0 0 24 24" fill="white">
            {/* Perplexity AI distinctive icon */}
            <circle cx="12" cy="12" r="9" fill="none" stroke="white" strokeWidth="2.5"/>
            <circle cx="12" cy="12" r="4" fill="white"/>
            <path d="M12 3V8M12 16V21M3 12H8M16 12H21" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        ),
      };
  }
}
