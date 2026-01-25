import React from 'react';
import { AbsoluteFill } from 'remotion';
import { HtmlCodeBlock } from './components/HtmlCodeBlock';
import { BeforeAfterProps } from '../types/constants';

export const BeforeCodeAnimation: React.FC<BeforeAfterProps> = ({ isDark }) => {
  const bgColor = isDark ? '#0F172A' : '#FFFFFF';

  return (
    <AbsoluteFill
      style={{
        background: bgColor,
      }}
    >
      <HtmlCodeBlock isDark={isDark} />
    </AbsoluteFill>
  );
};
