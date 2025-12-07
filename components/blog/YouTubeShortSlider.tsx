'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * YouTubeショート動画データ型
 * 
 * @description
 * company_youtube_shortsテーブルから取得したショート動画情報
 */
export interface YouTubeShortVideo {
  id: number;
  videoId: string;
  url: string;
  embedUrl: string;
  title: string;
  hookText?: string;
  fragmentId: string;
  completeUri?: string;
}

/**
 * YouTubeShortSliderコンポーネントのProps
 */
interface YouTubeShortSliderProps {
  videos: YouTubeShortVideo[];
  currentArticleTitle: string;
}

/**
 * YouTubeショート動画スライダー
 * 
 * @description
 * ブログ記事詳細ページの記事本文の後、著者セクションの前に表示される
 * YouTubeショート動画スライダー（最大3件）
 * 
 * **パフォーマンス最適化:**
 * - Intersection Observer（遅延読み込み）
 * - CSS Scroll Snap（JavaScript最小限）
 * - aspect-ratio: 9/16（CLS防止）
 * - loading="lazy"（iframe遅延読み込み）
 * - 最大3件表示（ページ重量最小化）
 * 
 * **Core Web Vitals:**
 * - LCP: Intersection Observer + lazy loadingで影響なし
 * - FID: JavaScript最小限で影響なし
 * - CLS: aspect-ratioで影響なし
 * 
 * **構造化データ:**
 * - Fragment ID付きでスニペット対応
 * - hasPart配列に統合済み
 * 
 * @param videos - 表示するYouTubeショート動画配列（最大3件）
 * @param currentArticleTitle - 現在の記事タイトル
 */
const YouTubeShortSlider: React.FC<YouTubeShortSliderProps> = ({ 
  videos, 
  currentArticleTitle 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // ✅ 最大3件表示（ページ重量最小化）
  const displayVideos = videos.slice(0, 3);

  // ✅ Intersection Observer（遅延読み込み）
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect(); // ✅ 一度表示されたら監視終了（パフォーマンス最適化）
          }
        });
      },
      {
        rootMargin: '100px', // ✅ ビューポートの100px手前から読み込み開始
        threshold: 0.1
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  // 動画がない場合は何も表示しない
  if (!displayVideos || displayVideos.length === 0) {
    return null;
  }

  return (
    <section 
      ref={containerRef}
      id="youtube-short-slider"
      className="mt-12 mb-8 scroll-mt-20"
      aria-label="関連YouTubeショート動画"
    >
      {/* セクションタイトル */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
          <svg 
            className="w-6 h-6 text-red-600" 
            fill="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"/>
          </svg>
          📱 関連ショート動画
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          この記事の内容をショート動画で解説
        </p>
      </div>

      {/* スライダーコンテナ */}
      <div 
        className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e0 #f7fafc',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {!isVisible ? (
          // ✅ Skeleton Loader（ローディング中）
          <>
            {displayVideos.map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="flex-none snap-center"
                style={{ width: 'min(280px, 75vw)' }}
              >
                <div 
                  className="relative bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"
                  style={{ aspectRatio: '9/16' }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg 
                      className="w-12 h-12 text-gray-400 dark:text-gray-500" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"/>
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          // ✅ 動画コンテンツ（遅延読み込み後）
          displayVideos.map((video, index) => (
            <article
              key={video.videoId}
              id={video.fragmentId}
              className="flex-none snap-center scroll-mt-20"
              style={{ width: 'min(280px, 75vw)' }}
            >
              {/* 動画埋め込み */}
              <div 
                className="relative bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                style={{ aspectRatio: '9/16' }}
              >
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${video.videoId}?modestbranding=1&rel=0`}
                  title={video.title || `ショート動画 ${index + 1}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                  className="absolute inset-0 w-full h-full border-0"
                />
              </div>

              {/* 動画情報 */}
              <div className="mt-3">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-2">
                  {video.title}
                </h3>
                {video.hookText && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {video.hookText}
                  </p>
                )}
              </div>

              {/* YouTubeで見るリンク */}
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-xs text-red-600 dark:text-red-400 hover:underline"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"/>
                </svg>
                YouTubeで見る
              </a>
            </article>
          ))
        )}
      </div>

      {/* スライダー操作ヒント（複数動画時のみ） */}
      {displayVideos.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <span>横にスクロールできます</span>
        </div>
      )}
    </section>
  );
};

export default YouTubeShortSlider;

