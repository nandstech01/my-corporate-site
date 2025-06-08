'use client';

import "./GradientText.css";

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
  animationSpeed?: number;
  showBorder?: boolean;
}

export default function GradientText({
  children,
  className = "",
  colors = ["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"], // Default colors
  animationSpeed = 8, // Default animation speed in seconds
  showBorder = false, // Default overlay visibility
}: GradientTextProps) {
  const gradientStyle = {
    backgroundImage: `linear-gradient(to right, ${colors.join(", ")})`,
    animationDuration: `${animationSpeed}s`,
    // Ensure background size is set for animation
    backgroundSize: '300% 100%',
  };

  return (
    <div className={`animated-gradient-text ${className}"`}>
      {showBorder && <div className="gradient-overlay" style={gradientStyle}></div>}
      {/* Apply gradient style directly to the text content span */}
      <span className="text-content" style={gradientStyle}>{children}</span>
    </div>
  );
} 