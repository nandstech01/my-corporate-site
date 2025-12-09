'use client';

import React from 'react';

interface LINEConversionButtonProps {
  position?: 'after-3rd-h2' | 'before-faq';
}

/**
 * LINE友だち追加ボタン（薄いバー形式）
 * 
 * 設置箇所:
 * 1. 3番目のh2セクションの直後
 * 2. FAQセクションの直前
 * 
 * 【重要】このコンポーネントはベクトルリンク化に影響しません
 */
export default function LINEConversionButton({ position = 'after-3rd-h2' }: LINEConversionButtonProps) {
  return (
    <div 
      className="my-6 scroll-mt-20"
      style={{ 
        display: 'block',
        isolation: 'isolate'
      }}
    >
      <a 
        href="https://lin.ee/vQmAwMU"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-green-500/90 to-emerald-500/90 hover:from-green-600 hover:to-emerald-600 text-white font-medium text-xs sm:text-sm py-2 px-4 rounded-md shadow-sm hover:shadow-md transition-all duration-300"
      >
        {/* LINEアイコン */}
        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
        </svg>
        {/* PC版: 1行表示 / スマホ版: 2行表示 */}
        <span className="hidden sm:inline">AIキャリア相談＆実務AI活用はこちらから無料相談</span>
        <span className="sm:hidden text-center leading-tight">
          AIキャリア相談＆実務AI活用は<br />こちらから無料相談
        </span>
        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </a>
    </div>
  );
}
