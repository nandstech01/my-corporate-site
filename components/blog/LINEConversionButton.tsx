'use client';

import React from 'react';
import { FileText, Sparkles } from 'lucide-react';

interface LINEConversionButtonProps {
  position?: 'after-3rd-h2' | 'before-faq';
}

/**
 * LINE友だち追加ボタン（豪華特典・裏資料ゲット）
 * 
 * 設置箇所:
 * 1. 3番目のh2セクションの直後
 * 2. FAQセクションの直前
 * 
 * 【重要】このコンポーネントはベクトルリンク化に影響しません
 * - Fragment IDのある見出しの「後」に挿入
 * - 独立したdiv要素として挿入
 * - 既存のDOM構造を一切変更しない
 */
export default function LINEConversionButton({ position = 'after-3rd-h2' }: LINEConversionButtonProps) {
  const isFAQPosition = position === 'before-faq';
  
  return (
    <div 
      className={`my-8 sm:my-12 scroll-mt-20 ${isFAQPosition ? 'mb-12' : ''}`}
      style={{ 
        // ベクトルリンク化に影響しないよう、独立したブロックとして配置
        display: 'block',
        isolation: 'isolate'
      }}
    >
      <div className="relative bg-gradient-to-br from-green-500 via-emerald-600 to-green-700 rounded-2xl p-6 sm:p-10 border-4 border-yellow-400 shadow-2xl transform hover:scale-[1.02] transition-all duration-500 overflow-hidden">
        {/* 背景アニメーション効果 */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
        
        {/* きらきらエフェクト */}
        <div className="absolute top-4 right-4 text-4xl animate-pulse">✨</div>
        <div className="absolute bottom-4 left-4 text-4xl animate-pulse delay-300">🎁</div>
        
        <div className="relative z-10">
          {/* ヘッダー部分 */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center shadow-xl transform hover:rotate-12 transition-transform duration-300">
              <svg className="w-10 h-10 sm:w-12 sm:h-12" viewBox="0 0 24 24" fill="none">
                {/* LINEロゴ（公式カラー） */}
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" fill="#00B900"/>
              </svg>
            </div>
            
            <div className="text-center sm:text-left">
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 leading-tight">
                🎁 豪華特典！裏資料ゲット
              </h3>
              <p className="text-yellow-100 text-sm sm:text-base font-bold">
                このブログだけでは公開していない限定コンテンツ
              </p>
            </div>
          </div>
          
          {/* 説明テキスト */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 mb-6">
            <ul className="space-y-3 text-white">
              <li className="flex items-start gap-3">
                <FileText className="flex-shrink-0 w-6 h-6 text-yellow-300" />
                <span className="text-sm sm:text-base leading-relaxed">
                  <strong className="text-yellow-300">設計資料</strong>：アーキテクチャ図・フローチャート
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="flex-shrink-0 w-6 h-6 text-yellow-300" />
                <span className="text-sm sm:text-base leading-relaxed">
                  <strong className="text-yellow-300">プロンプト集</strong>：レリバンスエンジニアリング-嘘のつかない
                </span>
              </li>
            </ul>
          </div>
          
          {/* CTAボタン */}
          <a 
            href="https://lin.ee/VYCK74F"
            target="_blank"
            rel="noopener noreferrer"
            className="group block w-full bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 hover:from-yellow-500 hover:via-yellow-400 hover:to-yellow-500 text-green-900 font-black text-lg sm:text-xl py-5 px-8 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 text-center relative overflow-hidden"
          >
            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-30 transition-opacity duration-300"></span>
            <span className="relative z-10 flex items-center justify-center gap-3">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
              <span>今すぐLINE友だち追加して特典をゲット！</span>
            </span>
          </a>
          
          {/* 補足テキスト */}
          <p className="mt-4 text-center text-white/90 text-xs sm:text-sm">
            ※ LINE友だち追加後、自動メッセージで特典をお届けします
          </p>
        </div>
      </div>
      
      {/* アニメーション用CSS */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
        .delay-300 {
          animation-delay: 300ms;
        }
      `}</style>
    </div>
  );
}

