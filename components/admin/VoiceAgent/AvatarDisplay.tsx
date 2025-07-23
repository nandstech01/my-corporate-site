'use client';

import { useEffect, useState } from 'react';

interface AvatarDisplayProps {
  isListening: boolean;
  isSpeaking: boolean;
}

export default function AvatarDisplay({ isListening, isSpeaking }: AvatarDisplayProps) {
  const [animationPhase, setAnimationPhase] = useState(0);

  // アニメーション制御
  useEffect(() => {
    if (isSpeaking || isListening) {
      const interval = setInterval(() => {
        setAnimationPhase(prev => (prev + 1) % 3);
      }, 300);
      return () => clearInterval(interval);
    } else {
      setAnimationPhase(0);
    }
  }, [isSpeaking, isListening]);

  // アバターの状態スタイル
  const getAvatarStyle = () => {
    if (isSpeaking) {
      return `
        bg-gradient-to-br from-green-400 to-emerald-600
        shadow-lg shadow-green-500/30
        animate-pulse
      `;
    } else if (isListening) {
      return `
        bg-gradient-to-br from-blue-400 to-blue-600
        shadow-lg shadow-blue-500/30
        animate-pulse
      `;
    } else {
      return `
        bg-gradient-to-br from-purple-400 to-purple-600
        shadow-lg shadow-purple-500/20
      `;
    }
  };

  // 音声波形バー
  const AudioWaveform = () => {
    const bars = Array.from({ length: 12 }, (_, i) => i);
    
    return (
      <div className="flex items-center justify-center space-x-1 h-16">
        {bars.map((_, index) => (
          <div
            key={index}
            className={`
              bg-white rounded-full transition-all duration-200
              ${(isSpeaking || isListening) 
                ? `w-1 animate-pulse opacity-70` 
                : 'w-1 h-2 opacity-30'
              }
            `}
            style={{
              height: (isSpeaking || isListening) 
                ? `${Math.random() * 40 + 10}px`
                : '8px',
              animationDelay: `${index * 100}ms`
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      {/* メインアバター */}
      <div className="relative mb-8">
        {/* アバター本体 */}
        <div 
          className={`
            w-48 h-48 rounded-full transition-all duration-500
            flex items-center justify-center
            ${getAvatarStyle()}
            ${isListening ? 'scale-110' : isSpeaking ? 'scale-105' : 'scale-100'}
          `}
        >
          {/* アバターの顔（シンプルな表情） */}
          <div className="text-white text-6xl">
            {isSpeaking ? '😊' : isListening ? '👂' : '🤖'}
          </div>
        </div>

        {/* 外側のリング（状態表示） */}
        <div 
          className={`
            absolute inset-0 rounded-full border-4 transition-all duration-300
            ${isSpeaking 
              ? 'border-green-300 animate-spin' 
              : isListening 
                ? 'border-blue-300 animate-ping' 
                : 'border-purple-300/50'
            }
          `}
          style={{
            transform: 'scale(1.1)'
          }}
        />
      </div>

      {/* 音声波形表示 */}
      <AudioWaveform />

      {/* 状態テキスト */}
      <div className="text-center mt-6">
        <p className="text-white text-lg font-medium mb-2">
          {isSpeaking 
            ? '話しています...' 
            : isListening 
              ? '聞いています...' 
              : 'どうしましたか？'
          }
        </p>
        <p className="text-gray-300 text-sm">
          {isSpeaking 
            ? 'AI エージェントが応答中' 
            : isListening 
              ? 'あなたの指示をお聞きしています' 
              : 'マイクボタンを押して話しかけてください'
          }
        </p>
      </div>

      {/* 背景エフェクト */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 粒子エフェクト */}
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className={`
              absolute w-2 h-2 bg-white rounded-full opacity-20
              ${(isSpeaking || isListening) ? 'animate-pulse' : ''}
            `}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${Math.random() * 3 + 2}s`
            }}
          />
        ))}
        
        {/* グラデーションオーバーレイ */}
        <div 
          className={`
            absolute inset-0 transition-opacity duration-1000
            ${isSpeaking 
              ? 'bg-gradient-to-t from-green-900/20 to-transparent opacity-100' 
              : isListening 
                ? 'bg-gradient-to-t from-blue-900/20 to-transparent opacity-100'
                : 'opacity-0'
            }
          `}
        />
      </div>
    </div>
  );
} 