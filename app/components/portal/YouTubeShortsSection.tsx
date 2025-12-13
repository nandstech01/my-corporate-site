'use client'

/**
 * YouTubeShortsSection - トップページ用YouTubeショート動画セクション
 * 
 * ライト/ダークモード対応
 */

import { useEffect, useState } from 'react'
import YouTubeShortSlider, { YouTubeShortVideo } from '@/components/blog/YouTubeShortSlider'

interface YouTubeShortsSectionProps {
  videos: YouTubeShortVideo[]
}

export default function YouTubeShortsSection({ videos }: YouTubeShortsSectionProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    // localStorageからテーマを読み取り
    const savedTheme = localStorage.getItem('nands-theme') as 'light' | 'dark' | null
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      // システムのテーマを検出
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      setTheme(mediaQuery.matches ? 'dark' : 'light')
    }

    // テーマ変更イベントをリッスン
    const handleThemeChange = (e: CustomEvent) => {
      setTheme(e.detail.theme)
    }
    window.addEventListener('nands-theme-change', handleThemeChange as EventListener)
    
    return () => {
      window.removeEventListener('nands-theme-change', handleThemeChange as EventListener)
    }
  }, [])

  if (!videos || videos.length === 0) {
    return null
  }

  return (
    <section 
      id="youtube-shorts" 
      className="py-16 sm:py-20 scroll-mt-20 relative overflow-hidden"
      style={{
        background: theme === 'dark' 
          ? 'linear-gradient(180deg, #0A1628 0%, #0D1B2A 100%)' 
          : 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)'
      }}
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <YouTubeShortSlider 
            videos={videos} 
            currentArticleTitle="株式会社エヌアンドエス" 
          />
        </div>
      </div>
    </section>
  )
}

