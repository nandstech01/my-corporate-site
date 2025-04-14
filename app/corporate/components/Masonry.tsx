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
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 640) setColumns(1);
      else if (width < 768) setColumns(2);
      else if (width < 1024) setColumns(3);
      else if (width < 1280) setColumns(4);
      else setColumns(5);
    };

    updateColumns();
    setContainerWidth(window.innerWidth);

    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      
      resizeTimeoutRef.current = setTimeout(() => {
        updateColumns();
        setContainerWidth(window.innerWidth);
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
    if (containerWidth === 0) return [];
    
    const columnHeights = Array(columns).fill(0);
    const itemsWithPosition = data.map((item) => {
      const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));
      const x = (containerWidth / columns) * shortestColumn;
      const y = columnHeights[shortestColumn];
      
      columnHeights[shortestColumn] += item.height + 20; // 20px for gap
      
      return {
        ...item,
        x,
        y,
        width: containerWidth / columns - 20, // 20px for gap
      };
    });

    return itemsWithPosition;
  }, [data, columns, containerWidth]);

  const getItemKey = (item: any) => item.id;
  
  const transitions = useTransition(gridItems, {
    key: getItemKey,
    from: { opacity: 0, transform: 'scale(0.8)' },
    enter: { opacity: 1, transform: 'scale(1)' },
    leave: { opacity: 0, transform: 'scale(0.8)' },
    config: { tension: 200, friction: 20 },
    trail: 50,
  });

  const containerHeight = Math.max(...(gridItems.map(item => item.y + item.height) || [0])) + 20;

  return (
    <div className="relative w-full" style={{ height: containerHeight }}>
      {transitions((style, item) => (
        <animated.a
          href={item.link}
          key={item.id}
          className="absolute block overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
          style={{
            ...style,
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
  );
};

export default Masonry; 