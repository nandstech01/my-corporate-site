'use client';

import { useEffect, useState, memo, useRef, useMemo } from 'react';
import Image from 'next/image';
import './Masonry.css';

// Types
interface Item {
  id: string;
  width: number;
  height: number;
  image: string;
  slug: string;
  text?: string;
}

interface MasonryProps {
  items: Item[];
  columnWidth?: number;
  maxColumns?: number;
  gap?: number;
  maxContentWidth?: number;
}

// Constants
const DEFAULTS = {
  COLUMN_WIDTH: 280,  // Default column width
  MAX_COLUMNS: 4,     // Default maximum columns
  GAP: 20,            // Default gap between items
  MAX_CONTENT_WIDTH: 1200, // Maximum content width
};

const Masonry = ({
  items,
  columnWidth = DEFAULTS.COLUMN_WIDTH,
  maxColumns = DEFAULTS.MAX_COLUMNS,
  gap = DEFAULTS.GAP,
  maxContentWidth = DEFAULTS.MAX_CONTENT_WIDTH,
}: MasonryProps) => {
  // SSRとCSRの不一致を解消するためのフラグ
  const [isMounted, setIsMounted] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // マウント完了後にのみレンダリング
  useEffect(() => {
    setIsMounted(true);
    
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 以下のロジックをすべてuseMemoフックで囲んで、条件分岐によるフックの実行順序変更を防ぐ
  const { gridItems, containerHeight, contentWidth, isMobile } = useMemo(() => {
    // モバイル判定
    const isMobile = dimensions.width <= 768;
    
    // カラム数を計算
    const cols = isMobile 
      ? (dimensions.width <= 480 ? 1 : 2)
      : Math.max(
          1, 
          Math.min(
            maxColumns,
            Math.floor((Math.min(dimensions.width, maxContentWidth) - gap) / (columnWidth + gap))
          )
        );
    
    // カラム幅を調整
    const getActualColumnWidth = () => {
      if (isMobile) {
        if (dimensions.width <= 480) {
          // 1カラム：スマホは画面幅の70%
          return dimensions.width * 0.7;
        } else {
          // 2カラム：タブレットはやや小さめ
          return (dimensions.width * 0.75 - gap) / 2;
        }
      }
      
      return columnWidth;
    };
    
    const actualColumnWidth = getActualColumnWidth();

    // コンテンツ幅を計算
    const contentWidth = isMobile 
      ? dimensions.width * 0.95 // モバイルでは画面幅の95%
      : (actualColumnWidth * cols) + (gap * (cols - 1));

    // カラムの高さ配列
    const columnHeights = Array(cols).fill(0);

    // 各アイテムの位置を計算
    const gridItems = isMounted ? items.map((item, index) => {
      // 最も低いカラムを見つける
      const columnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      
      // 位置を計算
      const x = columnIndex * (actualColumnWidth + gap);
      const y = columnHeights[columnIndex];
      
      // 選択したカラムの高さを更新
      columnHeights[columnIndex] += item.height + gap;
      
      return {
        ...item,
        x,
        y,
        width: actualColumnWidth,
        animationDelay: index * 100, // アニメーション遅延を少し長くして重なりを防ぐ
      };
    }) : [];

    // コンテナの高さを計算
    const containerHeight = columnHeights.length > 0 
      ? Math.max(...columnHeights) 
      : 0;
    
    return { gridItems, containerHeight, contentWidth, isMobile };
  }, [items, columnWidth, maxColumns, gap, maxContentWidth, dimensions, isMounted]);

  // マウント前はプレースホルダーを表示
  if (!isMounted) {
    return (
      <div className="masonry-container">
        <div className="masonry" style={{ minHeight: '400px' }}>
          <div className="masonry-placeholder"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`masonry-container ${isMobile ? 'mobile' : ''}`}>
      <div 
        ref={containerRef}
        className="masonry" 
        style={{
          height: `${containerHeight}px`,
          width: `${contentWidth}px`,
          position: 'relative',
        }}
      >
        {gridItems.map((item, index) => (
          <a
            key={item.id}
            href={item.slug.startsWith('/') ? item.slug : `/categories/${item.slug}`}
            className="absolute block rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 animate-fade-in"
            style={{
              width: `${item.width}px`,
              height: `${item.height}px`,
              left: `${item.x}px`,
              top: `${item.y}px`,
              animationDelay: `${item.animationDelay}ms`,
              animationFillMode: 'forwards',
              zIndex: index + 1, // 各カードに異なるz-indexを設定
            }}
          >
            <Image
              src={item.image}
              alt={item.text || item.slug}
              fill
              className="object-cover"
              sizes="(max-width: 480px) 70vw, (max-width: 768px) 37vw, 280px"
              priority={false}
            />
            {item.text && (
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="text-white text-lg font-bold">{item.text}</span>
              </div>
            )}
          </a>
        ))}
      </div>
    </div>
  );
};

export default memo(Masonry);