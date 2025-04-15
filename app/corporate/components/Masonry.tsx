'use client';

import { useEffect, useState, memo, useRef, useMemo } from 'react';
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
    const gridItems = isMounted ? items.map((item) => {
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
    }) : [];

    // コンテナの高さを計算
    const containerHeight = columnHeights.length > 0 
      ? Math.max(...columnHeights) 
      : 0;
    
    return { gridItems, containerHeight, contentWidth, isMobile };
  }, [items, columnWidth, maxColumns, gap, maxContentWidth, dimensions, isMounted]);

  // アニメーションの設定（無限再帰エラー回避）
  const transitions = useTransition(gridItems, {
    key: (item: any) => item.id,
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: { mass: 1, tension: 170, friction: 26 },
    trail: 25,
    initial: null,
  });

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

  // デバッグ用コンソール出力
  console.log('Masonry rendering with:', { 
    isMobile, 
    gridItems: gridItems.length,
    contentWidth,
    containerHeight
  });

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
        {transitions((style, item) => (
          <animated.a
            key={item.id}
            href={item.slug.startsWith('/') ? item.slug : `/categories/${item.slug}`}
            className="absolute block rounded-lg overflow-hidden shadow-lg hover:shadow-xl"
            style={{
              ...style,
              width: `${item.width}px`,
              height: `${item.height}px`,
              position: 'absolute',
              top: 0,
              left: 0,
              transform: `translate3d(${item.x}px,${item.y}px,0)`,
              willChange: 'transform, opacity',
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