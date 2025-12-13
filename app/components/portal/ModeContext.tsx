'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

/**
 * モードコンテキスト
 * トップページ全体で「個人/法人」モードを共有
 */
export type Mode = 'individual' | 'corporate'

interface ModeContextType {
  mode: Mode
  setMode: (mode: Mode) => void
  isIndividual: boolean
  isCorporate: boolean
}

const ModeContext = createContext<ModeContextType>({
  mode: 'individual',
  setMode: () => {},
  isIndividual: true,
  isCorporate: false,
})

export const useMode = () => useContext(ModeContext)

interface ModeProviderProps {
  children: ReactNode
  defaultMode?: Mode
}

// localStorageから初期モードを取得
function getInitialMode(): Mode {
  if (typeof window === 'undefined') return 'individual'
  const stored = localStorage.getItem('nands-selected-mode')
  return (stored as Mode) || 'individual'
}

export function ModeProvider({ children, defaultMode }: ModeProviderProps) {
  const [mode, setMode] = useState<Mode>(() => defaultMode || getInitialMode())

  // localStorageとの同期
  useEffect(() => {
    const handleModeChange = (e: CustomEvent) => {
      console.log('🔄 ModeProvider: Received mode change event:', e.detail.mode)
      setMode(e.detail.mode)
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'nands-selected-mode' && e.newValue) {
        console.log('🔄 ModeProvider: Storage changed to:', e.newValue)
        setMode(e.newValue as Mode)
      }
    }

    window.addEventListener('nands-mode-change', handleModeChange as EventListener)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('nands-mode-change', handleModeChange as EventListener)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // モードが変わったらlocalStorageに保存＆イベント発行
  const handleSetMode = (newMode: Mode) => {
    console.log('🔄 ModeProvider: Setting mode to:', newMode)
    setMode(newMode)
    if (typeof window !== 'undefined') {
      localStorage.setItem('nands-selected-mode', newMode)
      window.dispatchEvent(new CustomEvent('nands-mode-change', { detail: { mode: newMode } }))
    }
  }

  const value: ModeContextType = {
    mode,
    setMode: handleSetMode,
    isIndividual: mode === 'individual',
    isCorporate: mode === 'corporate',
  }

  return (
    <ModeContext.Provider value={value}>
      {children}
    </ModeContext.Provider>
  )
}

