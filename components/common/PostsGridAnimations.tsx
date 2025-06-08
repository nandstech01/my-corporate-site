'use client'

import { useEffect } from 'react'

// 段階的エンハンスメント用アニメーション
export default function PostsGridAnimations() {
  useEffect(() => {
    // SSRで描画された記事カードにアニメーションを追加
    const articles = document.querySelectorAll('.posts-grid-ssr article')
    
    if (articles.length === 0) return

    // 初期状態を設定
    articles.forEach((article) => {
      const element = article as HTMLElement
      element.style.opacity = '0'
      element.style.transform = 'translateY(20px)'
    })

    // Intersection Observer でビューポートに入ったらアニメーション開始
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement
            
            // 段階的にアニメーション実行
            setTimeout(() => {
              element.style.transition = 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)'
              element.style.opacity = '1'
              element.style.transform = 'translateY(0)'
              
              // ホバーエフェクトを追加
              element.addEventListener('mouseenter', () => {
                element.style.transform = 'translateY(-5px)'
              })
              
              element.addEventListener('mouseleave', () => {
                element.style.transform = 'translateY(0)'
              })
            }, index * 100) // 100msずつ遅延
            
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    )

    // 各記事を監視対象に追加
    articles.forEach((article) => {
      observer.observe(article)
    })

    // クリーンアップ
    return () => {
      observer.disconnect()
    }
  }, [])

  return null // 何も描画しない（アニメーションのみ）
} 