'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import './GridMotion.css'

interface GridMotionProps {
  items?: (string | React.ReactElement)[];
  gradientColor?: string;
}

const GridMotion: React.FC<GridMotionProps> = ({ 
  items = [], 
  gradientColor = 'rgba(0, 0, 0, 0.3)' 
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

    // GSAPのパフォーマンス最適化
    gsap.ticker.lagSmoothing(0)

    const handleMouseMove = (e: MouseEvent) => {
      mouseXRef.current = e.clientX
      console.log('✅ GridMotion: マウス操作を検出、アニメーション開始')
    }

    const updateMotion = () => {
      const maxMoveAmount = 300 // 3D効果を向上
      const baseDuration = 0.8 // より滑らか
      const inertiaFactors = [0.6, 0.4, 0.3, 0.2]

      rowRefs.current.forEach((row, index) => {
        if (row) {
          const direction = index % 2 === 0 ? 1 : -1
          const moveAmount = ((mouseXRef.current / window.innerWidth) * maxMoveAmount - maxMoveAmount / 2) * direction

          gsap.to(row, {
            x: moveAmount,
            duration: baseDuration + inertiaFactors[index % inertiaFactors.length],
            ease: 'power3.out',
            overwrite: 'auto',
          })
        }
      })
    }

    const removeAnimationLoop = gsap.ticker.add(updateMotion)

    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    console.log('🎬 GridMotion: アニメーション即座開始')

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      removeAnimationLoop()
    }
  }, [isClient, combinedItems.length])

  if (!isClient) {
    return <div className="h-full w-full" />
  }

  return (
    <div className="noscroll loading" ref={gridRef}>
      <section
        className="intro"
        style={{
          background: `radial-gradient(circle, ${gradientColor} 0%, transparent 100%)`,
        }}
      >
        <div className="gridMotion-container">
          {[...Array(4)].map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="row"
              ref={(el) => { rowRefs.current[rowIndex] = el }}
            >
              {[...Array(7)].map((_, itemIndex) => {
                const content = combinedItems[rowIndex * 7 + itemIndex]
                return (
                  <div key={itemIndex} className="row__item">
                    <div className="row__item-inner" style={{ backgroundColor: '#111' }}>
                      {typeof content === 'string' && content.startsWith('http') ? (
                        <div
                          className="row__item-img"
                          style={{
                            backgroundImage: `url(${content})`,
                          }}
                        />
                      ) : (
                        <div className="row__item-content">{content}</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
        <div className="fullview" />
      </section>
    </div>
  )
}

export default GridMotion 