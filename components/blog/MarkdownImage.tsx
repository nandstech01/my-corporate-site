'use client';

import type { SyntheticEvent } from 'react';

const FALLBACK_SRC = '/images/default-post.jpg';

interface MarkdownImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

function showFallback(event: SyntheticEvent<HTMLImageElement>) {
  const img = event.currentTarget;
  if (!img.src.endsWith(FALLBACK_SRC)) img.src = FALLBACK_SRC;
}

/**
 * 本文中の画像 (遅延読み込み・幅と高さ付き)。読み込みに失敗したら既定の画像に差し替える。
 * MarkdownContent はサーバー部品なので、onError だけをこの小さなクライアント部品に分けた。
 */
export default function MarkdownImage({ src, alt, width, height, className }: MarkdownImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- 本文の画像は next/image の最適化を通さない (Vercel の画像枠を使わない)
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      className={className}
      onError={showFallback}
    />
  );
}
