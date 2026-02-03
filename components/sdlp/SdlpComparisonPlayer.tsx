'use client';

import dynamic from 'next/dynamic';
import { SDLP_COMPARISON_CONFIG } from '@/remotion/types/constants';

const PlayerInner = dynamic(
  () =>
    import('./SdlpComparisonPlayerInner').then(
      (mod) => mod.SdlpComparisonPlayerInner,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: '100%',
          aspectRatio: `${SDLP_COMPARISON_CONFIG.WIDTH}/${SDLP_COMPARISON_CONFIG.HEIGHT}`,
          borderRadius: '0.75rem',
          background:
            'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(6,182,212,0.1))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: '3px solid rgba(37,99,235,0.3)',
            borderTopColor: '#2563EB',
            animation: 'spin 1s linear infinite',
          }}
        />
      </div>
    ),
  },
);

export function SdlpComparisonPlayer() {
  return <PlayerInner />;
}
