'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useTransition, animated } from '@react-spring/web';

import './Masonry.css';

interface MasonryItem {
  id: string;
  image: string;
  link: string;
  alt: string;
  height: number;
}

interface MasonryProps {
  data: MasonryItem[];
}

const Masonry = ({ data }: MasonryProps) => {
  const [columns, setColumns] = useState(3);
  const [containerWidth, setContainerWidth] = useState(0);
  const [availableWidth, setAvailableWidth] = useState(0);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      
      // 適切なマージンと最大幅を設定
      const pageMargin = Math.max(40, width * 0.08); // マージンを増やす
      const maxContentWidth = 1200; // 最大コンテンツ幅を調整
      
      // 利用可能な幅を計算
      const availWidth = Math.min(width - (pageMargin * 2), maxContentWidth);
      setAvailableWidth(availWidth);
      
      // 適切なカラム数を設定
      if (width < 640) setColumns(1);
      else if (width < 768) setColumns(2);
      else if (width < 1024) setColumns(3);
      else if (width < 1280) setColumns(4);
      else setColumns(4); // 最大4カラムに制限
      
      setContainerWidth(availWidth);
    };

    updateDimensions();

    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      
      resizeTimeoutRef.current = setTimeout(() => {
        updateDimensions();
      }, 200);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  const gridItems = useMemo(() => {
    if (containerWidth === 0 || data.length === 0 || columns === 0) return [];
    
    // カラム幅を計算
    const columnWidth = containerWidth / columns;
    const columnHeights = Array(columns).fill(0);
    
    const itemsWithPosition = data.map((item) => {
      const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));
      const x = columnWidth * shortestColumn;
      const y = columnHeights[shortestColumn];
      
      columnHeights[shortestColumn] += item.height + 20; // 20px for gap
      
      return {
        ...item,
        x,
        y,
        width: columnWidth - 20, // 20px for gap
      };
    });

    return itemsWithPosition;
  }, [data, columns, containerWidth]);

  // 安全なコンテナの高さ計算
  const heightValues = gridItems.map(item => item.y + item.height) || [];
  const containerHeight = heightValues.length > 0 ? Math.max(...heightValues) + 20 : 0;

  // シンプル化したuseTransition設定
  const transitions = useTransition(gridItems, {
    keys: (item) => item.id,
    from: { opacity: 0, scale: 0.8 },
    enter: { opacity: 1, scale: 1 },
    leave: { opacity: 0, scale: 0.8 },
    config: { tension: 170, friction: 26 },
    trail: 25
  });

  return (
    <div className="flex justify-center">
      <div 
        ref={containerRef}
        className="relative mx-auto" 
        style={{ 
          height: containerHeight || 'auto',
          width: `${availableWidth}px`,
          maxWidth: '100%'
        }}
      >
        {transitions((style, item) => (
          <animated.a
            href={item.link}
            key={item.id}
            className="absolute block overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            style={{
              opacity: style.opacity,
              transform: style.scale.to(s => `scale(${s})`),
              width: item.width,
              height: item.height,
              left: item.x,
              top: item.y,
            }}
          >
            <div className="relative w-full h-full group">
              <img
                src={item.image}
                alt={item.alt}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="text-white text-lg font-bold">{item.alt}</span>
              </div>
            </div>
          </animated.a>
        ))}
      </div>
    </div>
  );
};

export default Masonry; 