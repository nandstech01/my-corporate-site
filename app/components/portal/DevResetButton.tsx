'use client'

/**
 * DevResetButton
 * 開発用：ゲートウェイをリセットするボタン
 * 本番では削除すること
 */

import { useState } from 'react'

export default function DevResetButton() {
  const [showConfirm, setShowConfirm] = useState(false)

  const handleReset = () => {
    localStorage.removeItem('nands-gateway-completed')
    localStorage.removeItem('nands-selected-mode')
    window.location.reload()
  }

  return (
    <div className="fixed top-4 right-4 z-[200]">
      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all duration-300 hover:scale-105"
          style={{
            background: 'rgba(239, 68, 68, 0.9)',
            color: '#ffffff',
            boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
          }}
        >
          🔧 DEV: Reset
        </button>
      ) : (
        <div 
          className="flex gap-2 p-2 rounded-xl"
          style={{
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: '#ef4444',
              color: '#ffffff'
            }}
          >
            リセット実行
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff'
            }}
          >
            キャンセル
          </button>
        </div>
      )}
    </div>
  )
}

