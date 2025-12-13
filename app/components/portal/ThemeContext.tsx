'use client'

/**
 * ThemeContext - トップページ専用テーマ管理
 * 
 * light: Apple/デジライズ風の明るいデザイン
 * dark: 現在の深海ダークデザイン
 * 
 * スコープ: NewTopPageSectionsコンポーネント内のみ
 * 他ページへの影響: なし
 */

import { createContext, useState, useContext, ReactNode, useEffect } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// カスタムイベント名（ヘッダーとの同期用）
export const THEME_CHANGE_EVENT = 'nands-theme-change'

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // 初期値: システムテーマを検出（SSR対応）
  const [theme, setThemeState] = useState<Theme>('dark')

  // localStorageとシステムテーマから初期値を読み込み
  useEffect(() => {
    // 1. まずlocalStorageをチェック（ユーザーが明示的に設定している場合）
    const savedTheme = localStorage.getItem('nands-top-page-theme') as Theme
    if (savedTheme === 'light' || savedTheme === 'dark') {
      console.log('🎨 ThemeContext: Using saved theme =', savedTheme)
      setThemeState(savedTheme)
    } else {
      // 2. localStorageがない場合、システムテーマを検出
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const systemTheme = mediaQuery.matches ? 'dark' : 'light'
      console.log('🎨 ThemeContext: Using system theme =', systemTheme)
      console.log('🎨 ThemeContext: prefers-color-scheme:dark matches =', mediaQuery.matches)
      setThemeState(systemTheme)
    }

    // ヘッダーからのテーマ変更イベントを監視
    const handleThemeChange = (e: CustomEvent) => {
      const newTheme = e.detail.theme as Theme
      if (newTheme === 'light' || newTheme === 'dark') {
        setThemeState(newTheme)
      }
    }

    window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange as EventListener)
    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange as EventListener)
    }
  }, [])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('nands-top-page-theme', newTheme)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {/* data-theme属性でスコープを限定 */}
      <div data-theme={theme} className="theme-container">
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

/**
 * ヘッダーなどThemeProvider外から使用するためのヘルパー関数
 */
export const getStoredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark'
  
  // 1. localStorageをチェック
  const stored = localStorage.getItem('nands-top-page-theme')
  if (stored === 'light' || stored === 'dark') {
    return stored
  }
  
  // 2. システムテーマを検出
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  return mediaQuery.matches ? 'dark' : 'light'
}

export const setStoredTheme = (theme: Theme) => {
  if (typeof window === 'undefined') return
  localStorage.setItem('nands-top-page-theme', theme)
  // カスタムイベントを発火してThemeProviderに通知
  window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: { theme } }))
}

export const toggleStoredTheme = (): Theme => {
  const current = getStoredTheme()
  const next = current === 'dark' ? 'light' : 'dark'
  setStoredTheme(next)
  return next
}

