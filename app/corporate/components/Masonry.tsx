'use client';

import { Fragment, useEffect, useState, memo } from 'react';
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
  // State for storing calculated properties
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  // Update dimensions on window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // 初期化時と画面サイズ変更時に実行
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate number of columns based on screen width
  const cols = Math.max(
    1, 
    Math.min(
      maxColumns,
      Math.floor((Math.min(dimensions.width, maxContentWidth) - gap) / (columnWidth + gap))
    )
  );

  // Calculate actual column width based on container constraints
  const actualColumnWidth = columnWidth;

  // Calculate container width with proper spacing
  const contentWidth = (actualColumnWidth * cols) + (gap * (cols - 1));

  // Setup the column heights array once
  const columnHeights = Array(cols).fill(0);

  // Process items into grid layout - using a more reliable algorithm
  const gridItems = items.map((item, index) => {
    // Find the column with minimum height
    const columnIndex = columnHeights.indexOf(Math.min(...columnHeights));
    
    // Calculate position
    const x = columnIndex * (actualColumnWidth + gap);
    const y = columnHeights[columnIndex];
    
    // Update the height of the selected column
    columnHeights[columnIndex] += item.height + gap;
    
    return {
      ...item,
      x,
      y,
      width: actualColumnWidth,
    };
  });

  // Calculate container height
  const containerHeight = columnHeights.length > 0 
    ? Math.max(...columnHeights) 
    : 0;

  // Setup transitions for grid items
  const transitions = useTransition(gridItems, {
    key: (item: any) => item.id,
    from: { opacity: 0, transform: 'scale(0.8)' },
    enter: { opacity: 1, transform: 'scale(1)' },
    leave: { opacity: 0, transform: 'scale(0.8)' },
    config: { mass: 1, tension: 200, friction: 20 },
    trail: 25,
  });

  return (
    <div className="masonry-container">
      <div 
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
              ...style,
              width: `${item.width}px`,
              height: `${item.height}px`,
              transform: style.transform.to(t => `${t} translate3d(${item.x}px,${item.y}px,0)`),
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