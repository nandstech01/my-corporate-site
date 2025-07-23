'use client';

import { useState } from 'react';
import { ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/react/24/outline';

interface VoiceAgentButtonProps {
  onActivate: () => void;
}

export default function VoiceAgentButton({ onActivate }: VoiceAgentButtonProps) {
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    setIsActive(true);
    onActivate();
    
    // アクティブ状態を短時間で解除（ボタンアニメーション用）
    setTimeout(() => setIsActive(false), 200);
  };

  return (
    <button
      onClick={handleClick}
      className={`
        group relative w-full flex items-center px-3 py-2 rounded-lg
        transition-all duration-200 ease-in-out
        bg-gradient-to-r from-blue-500 to-purple-600
        hover:from-blue-600 hover:to-purple-700
        shadow-lg hover:shadow-xl
        transform hover:scale-105
        ${isActive ? 'scale-95 opacity-80' : ''}
      `}
      title="音声AIエージェントを起動"
    >
      {/* アイコン */}
      <ChatBubbleOvalLeftEllipsisIcon 
        className="w-6 h-6 text-white mr-3 group-hover:animate-pulse" 
      />
      
      {/* テキスト */}
      <span className="text-white font-medium text-sm">
        音声AIエージェント
      </span>
      
      {/* 装飾用のグラデーション効果 */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-white/0 via-white/10 to-white/0 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* 脈動するドット（AI稼働中を表現） */}
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full 
                      animate-pulse shadow-lg" />
    </button>
  );
} 