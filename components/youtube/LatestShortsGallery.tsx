'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * YouTube最新ショート動画ギャラリー
 * 
 * 完全に独立したコンポーネント
 * 既存のブログ埋め込み機能やベクトルリンクには影響なし
 */

interface YouTubeShort {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
}

interface LatestShortsGalleryProps {
  maxResults?: number;
  title?: string;
  description?: string;
}

export default function LatestShortsGallery({
  maxResults = 6,
  title = '📱 最新のショート動画',
  description = 'AIアーキテクトが毎日配信する、今日のニュースをAIの視点で解説',
}: LatestShortsGalleryProps) {
  const [shorts, setShorts] = useState<YouTubeShort[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLatestShorts();
  }, [maxResults]);

  const fetchLatestShorts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/youtube/latest-shorts?maxResults=${maxResults}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch shorts');
      }

      const data = await response.json();
      setShorts(data.videos || []);
    } catch (err) {
      console.error('Error fetching shorts:', err);
      setError('ショート動画の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full py-20 bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-400">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-20 bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-400">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (shorts.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-20 bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* 背景エフェクト */}
      <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-5 bg-repeat" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* セクションヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-pink-400 to-purple-400">
              {title}
            </span>
          </h2>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            {description}
          </p>
        </motion.div>

        {/* ショート動画グリッド（縦型・統一サイズ） */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {shorts.map((short, index) => (
            <motion.div
              key={short.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative w-full"
            >
              {/* 縦型iframe（9:16のアスペクト比を厳密に統一） */}
              <div className="relative w-full bg-black rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105" style={{ aspectRatio: '9/16' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${short.id}`}
                  title={short.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                  className="absolute inset-0 w-full h-full border-0"
                />
              </div>

              {/* タイトルオーバーレイ */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-xl">
                <p className="text-white text-sm font-medium line-clamp-2">
                  {short.title}
                </p>
              </div>

              {/* YouTubeで見るボタン */}
              <a
                href={`https://youtube.com/shorts/${short.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-3 right-3 bg-red-600/90 hover:bg-red-700 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-1.5 shadow-lg"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span>YouTube</span>
              </a>
            </motion.div>
          ))}
        </div>

        {/* もっと見るボタン */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <a
            href="https://www.youtube.com/@NANDSTECH/shorts"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <span>もっと見る</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

