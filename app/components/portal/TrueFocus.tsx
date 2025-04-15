import React, { useEffect, useRef, useState } from 'react';

// Define the props type
interface TrueFocusProps {
  sentence: string;
  manualMode?: boolean; // Assuming these might be optional or have defaults
  blurAmount?: number;
  borderColor?: string;
  glowColor?: string;
  animationDuration?: number;
  pauseBetweenAnimations?: number; // Added this based on the second error
}

// Define the component using the props type and ensure it returns JSX
export default function TrueFocus({
  sentence,
  manualMode = false,
  blurAmount = 5,
  borderColor = 'blue',
  glowColor = 'lightblue',
  animationDuration = 1,
  pauseBetweenAnimations = 0.5, // Added default
}: TrueFocusProps): JSX.Element { // Explicitly set return type
  const words = sentence.split(' ');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0.1 } // Trigger when 10% of the element is visible
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);


  useEffect(() => {
    if (!manualMode && isIntersecting) {
      intervalRef.current = setInterval(() => {
        setHighlightedIndex((prevIndex) => (prevIndex + 1) % words.length);
      }, (animationDuration + pauseBetweenAnimations) * 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      if (!manualMode) {
         setHighlightedIndex(-1); // Reset when not manual and not intersecting
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [manualMode, animationDuration, pauseBetweenAnimations, words.length, isIntersecting]);

  const handleWordClick = (index: number) => {
    if (manualMode) {
      setHighlightedIndex(index);
    }
  };

  // Ensure the component returns a JSX element
  return (
    <div ref={containerRef} className="flex flex-wrap justify-center items-center gap-2">
      {words.map((word, index) => (
        <span
          key={index}
          onClick={() => handleWordClick(index)}
          className={`transition-all duration-${Math.round(animationDuration * 1000)} ease-in-out ${manualMode ? 'cursor-pointer' : ''}`}
          style={{
            filter: highlightedIndex !== -1 && highlightedIndex !== index ? `blur(${blurAmount}px)` : 'none',
            textShadow: highlightedIndex === index ? `0 0 10px ${glowColor}, 0 0 5px ${borderColor}` : 'none',
            color: highlightedIndex !== index ? 'rgba(255, 255, 255, 0.5)' : 'white', // Dim non-highlighted words
            opacity: highlightedIndex !== index && highlightedIndex !== -1 ? 0.5 : 1, // Make non-highlighted words less opaque
          }}
        >
          {word}
        </span>
      ))}
    </div>
  );
}
