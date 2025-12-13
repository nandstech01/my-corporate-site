'use client'

import { motion } from 'framer-motion'
import { useMode, Mode } from './ModeContext'

/**
 * THE GREAT SWITCH
 * iPhoneのDynamic Island風トグルスイッチ
 * 個人（Career Shift）⇔ 法人（Biz Transformation）を切り替え
 */
export default function TheGreatSwitch() {
  const { mode, setMode } = useMode()

  return (
    <div className="flex justify-center">
      <div 
        className="
          relative inline-flex p-0.5
          bg-white/5 
          rounded-full 
          backdrop-blur-md
        "
        style={{
          border: '1px solid rgba(6, 182, 212, 0.2)',
          boxShadow: '0 4px 16px rgba(6, 182, 212, 0.1)'
        }}
        role="tablist"
        aria-label="ターゲット切り替え"
      >
        {/* 背景スライダー（Dynamic Island風・極薄） */}
        <motion.div
          className="
            absolute top-0.5 bottom-0.5
            rounded-full
          "
          style={{
            background: 'linear-gradient(to right, #1e3a8a, #3b82f6, #06b6d4)',
            boxShadow: '0 2px 10px rgba(6, 182, 212, 0.3)'
          }}
          initial={false}
          animate={{
            left: mode === 'individual' ? '2px' : 'calc(50% + 1px)',
            right: mode === 'individual' ? 'calc(50% + 1px)' : '2px',
          }}
          transition={{ 
            type: 'spring', 
            stiffness: 500, 
            damping: 40,
            mass: 0.6
          }}
        />

        {/* 個人ボタン */}
        <button
          onClick={() => setMode('individual')}
          role="tab"
          aria-selected={mode === 'individual'}
          aria-controls="individual-content"
          className={`
            relative z-10 px-6 py-1 sm:px-10 sm:py-1.5 rounded-full
            text-sm sm:text-base
            transition-all duration-300
            whitespace-nowrap
            min-w-[100px] sm:min-w-[140px]
            ${mode === 'individual' 
              ? 'text-white font-extrabold' 
              : 'text-gray-400 hover:text-cyan-200 font-semibold'
            }
          `}
        >
          個人様
        </button>

        {/* 法人ボタン */}
        <button
          onClick={() => setMode('corporate')}
          role="tab"
          aria-selected={mode === 'corporate'}
          aria-controls="corporate-content"
          className={`
            relative z-10 px-6 py-1 sm:px-10 sm:py-1.5 rounded-full
            text-sm sm:text-base
            transition-all duration-300
            whitespace-nowrap
            min-w-[100px] sm:min-w-[140px]
            ${mode === 'corporate' 
              ? 'text-white font-extrabold' 
              : 'text-gray-400 hover:text-cyan-200 font-semibold'
            }
          `}
        >
          法人様
        </button>
      </div>
    </div>
  )
}

/**
 * スイッチ状態表示コンポーネント（デバッグ・表示用）
 */
export function SwitchIndicator() {
  const { mode, isIndividual, isCorporate } = useMode()
  
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <span className={isIndividual ? 'text-purple-400' : ''}>個人</span>
      <span>/</span>
      <span className={isCorporate ? 'text-cyan-400' : ''}>法人</span>
    </div>
  )
}

