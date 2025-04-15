'use client';

import { useEffect, useState, memo, useRef } from 'react';
import { useTransition, animated } from '@react-spring/web';
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
      const mobileWidth = dimensions.width <= 480 
        ? dimensions.width * 0.85
        : (dimensions.width * 0.9) / 2;
      
      return Math.min(columnWidth, mobileWidth - gap);
    }
    
    return columnWidth;
  };
  
  const actualColumnWidth = getActualColumnWidth();

  // コンテンツ幅を計算
  const contentWidth = (actualColumnWidth * cols) + (gap * (cols - 1));

  // カラムの高さ配列
  const columnHeights = Array(cols).fill(0);

  // 各アイテムの位置を計算
  const gridItems = items.map((item) => {
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
    };
  });

  // コンテナの高さを計算
  const containerHeight = columnHeights.length > 0 
    ? Math.max(...columnHeights) 
    : 0;

  // アニメーションの設定（SSR対応）
  const transitions = useTransition(gridItems, {
    key: (item: any) => item.id,
    from: { opacity: 0, scale: 0.8 },
    enter: { opacity: 1, scale: 1 },
    leave: { opacity: 0, scale: 0.8 },
    config: { mass: 1, tension: 200, friction: 20 },
    trail: 25,
    initial: null, // SSRとCSRの不一致対応
  });

  return (
    <div className="masonry-container">
      <div 
        ref={containerRef}
        className="masonry" 
        style={{
          height: `${containerHeight}px`,
          width: `${contentWidth}px`,
          maxWidth: '100%',
        }}
      >
        {transitions((style, item) => (
          <animated.a
            key={item.id}
            href={item.slug.startsWith('/') ? item.slug : `/categories/${item.slug}`}
            className="absolute block rounded-lg overflow-hidden shadow-lg hover:shadow-xl"
            style={{
              width: `${item.width}px`,
              height: `${item.height}px`,
              position: 'absolute',
              top: 0,
              left: 0,
              transform: style.scale.to(s => 
                `scale(${s}) translate3d(${item.x}px,${item.y}px,0)`
              ),
              opacity: style.opacity,
            }}
          >
            <img
              src={item.image}
              alt={item.text || item.slug}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {item.text && (
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="text-white text-lg font-bold">{item.text}</span>
              </div>
            )}
          </animated.a>
        ))}
      </div>
    </div>
  );
};

export default memo(Masonry); 