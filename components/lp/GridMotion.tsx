'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

interface GridMotionProps {
  items?: (string | React.ReactElement)[];
  gradientColor?: string;
}

const GridMotion: React.FC<GridMotionProps> = ({ 
  items = [], 
  gradientColor = 'rgba(59, 130, 246, 0.15)' 
}) => {
  const gridRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])
  const mouseXRef = useRef(typeof window !== 'undefined' ? window.innerWidth / 2 : 400)
  const [isClient, setIsClient] = useState(false)

  const totalItems = 28
  const defaultItems = Array.from({ length: totalItems }, (_, index) => `SNS${index + 1}`)
  const combinedItems = items.length > 0 ? items.slice(0, totalItems) : defaultItems

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    console.log('🎨 GridMotion: 3D効果初期化中...')
    console.log('📊 GridMotion Stats:', {
      totalItems,
      combinedItemsLength: combinedItems.length,
      isClientReady: isClient,
      gsapAvailable: !!gsap,
      windowWidth: typeof window !== 'undefined' ? window.innerWidth : 'unknown'
    })

    // 🚨 最適化：アニメーション即座に開始
    const initializeAnimation = () => {
      // グリッドアニメーションを即座に開始
      const rows = rowRefs.current.filter(Boolean)
      if (rows.length > 0) {
        console.log('🎬 GridMotion: アニメーション即座開始')
        
        rows.forEach((row, rowIndex) => {
          if (row) {
            gsap.to(row, {
              x: (rowIndex % 2 === 0 ? 50 : -50),
              duration: 10 + rowIndex * 2,
              repeat: -1,
              yoyo: true,
              ease: "none"
            })
          }
        })
      }
    }

    // DOM準備後に即座に開始
    const timer = setTimeout(() => {
      initializeAnimation()
    }, 100) // 100ms後に開始

    // 🚨 異常検知：2秒後にアニメーション確認（5秒から短縮）
    const startTime = performance.now()
    let renderCheckInterval: NodeJS.Timeout
    
    renderCheckInterval = setTimeout(() => {
      const currentTime = performance.now()
      const elapsedTime = currentTime - startTime
      
      if (elapsedTime > 2000) { // 2秒に短縮
        console.warn('⚠️ GridMotion: アニメーション開始遅延検出（2秒経過）')
        console.log('🔍 GridMotion: デバッグ情報:', {
          containerExists: !!gridRef.current,
          rowRefsCount: rowRefs.current.filter(Boolean).length,
          gsapLoaded: !!gsap,
          strictModeActive: true,
          performanceNow: performance.now(),
          windowDimensions: typeof window !== 'undefined' ? 
            { width: window.innerWidth, height: window.innerHeight } : 'unknown'
        })
        
        // 強制的にアニメーション開始
        initializeAnimation()
      }
    }, 2100) // 2.1秒後

    // マウス追跡（既存機能）
    const handleMouseMove = (e: MouseEvent) => {
      mouseXRef.current = e.clientX
      console.log('✅ GridMotion: マウス操作を検出、アニメーション開始')
      initializeAnimation()
    }

    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      clearTimeout(timer)
      clearTimeout(renderCheckInterval)
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [isClient, combinedItems.length])

  if (!isClient) {
    return <div className="h-full w-full" />
  }

  const rows = []
  const itemsPerRow = 7
  
  for (let i = 0; i < 4; i++) {
    const rowItems = []
    
    for (let j = 0; j < itemsPerRow; j++) {
      const itemIndex = i * itemsPerRow + j
      if (itemIndex < combinedItems.length) {
        const item = combinedItems[itemIndex]
        
        rowItems.push(
          <div key={j} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20 hover:bg-white/20 transition-colors">
            {typeof item === 'string' ? (
              <span className="text-white/70 text-sm">{item}</span>
            ) : (
              item
            )}
          </div>
        )
      }
    }
    
    rows.push(
      <div
        key={i}
        ref={(el) => { rowRefs.current[i] = el }}
        className="flex gap-4 justify-center mb-4"
        style={{
          transform: `translateX(${i % 2 === 0 ? '20px' : '-20px'})`
        }}
      >
        {rowItems}
      </div>
    )
  }

  return (
    <div 
      ref={gridRef} 
      className="relative h-full w-full overflow-hidden"
      style={{
        background: `radial-gradient(circle at 50% 50%, ${gradientColor}, transparent 70%)`
      }}
    >
      <div className="absolute inset-0 flex flex-col justify-center items-center p-8">
        {rows}
      </div>
    </div>
  )
}

export default GridMotion 