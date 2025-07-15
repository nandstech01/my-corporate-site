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

    // GSAPのパフォーマンス最適化
    gsap.ticker.lagSmoothing(0)

    const handleMouseMove = (e: MouseEvent) => {
      mouseXRef.current = e.clientX
    }

    const updateMotion = () => {
      const maxMoveAmount = 250 // 3D効果を向上
      const baseDuration = 1.0 // より滑らか
      const inertiaFactors = [0.9, 0.7, 0.5, 0.3]

      rowRefs.current.forEach((row, index) => {
        if (row) {
          const direction = index % 2 === 0 ? 1 : -1
          const moveAmount = ((mouseXRef.current / window.innerWidth) * maxMoveAmount - maxMoveAmount / 2) * direction

          gsap.to(row, {
            x: moveAmount,
            duration: baseDuration + inertiaFactors[index % inertiaFactors.length],
            ease: 'power2.out',
            overwrite: 'auto',
          })
        }
      })
    }

    // スロットリング付きでパフォーマンス向上
    let timeoutId: NodeJS.Timeout
    const throttledUpdateMotion = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(updateMotion, 16) // 60fps制限
    }

    const removeAnimationLoop = gsap.ticker.add(throttledUpdateMotion)

    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      removeAnimationLoop()
      clearTimeout(timeoutId)
    }
  }, [isClient])

  if (!isClient) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-teal-50 opacity-60" />
    )
  }

  return (
    <div className="absolute inset-0 overflow-hidden" ref={gridRef}>
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{
          background: `radial-gradient(circle at center, ${gradientColor} 0%, transparent 70%)`,
        }}
      >
        <div className="relative w-[130vw] h-[130vh] lg:w-[160vw] lg:h-[160vh] grid grid-rows-4 gap-3 lg:gap-5 -rotate-12 origin-center">
          {[...Array(4)].map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid grid-cols-7 gap-3 lg:gap-5 will-change-transform"
              ref={(el) => { rowRefs.current[rowIndex] = el }}
            >
              {[...Array(7)].map((_, itemIndex) => {
                const content = combinedItems[rowIndex * 7 + itemIndex]
                return (
                  <div key={itemIndex} className="relative">
                    <div className="relative w-full aspect-square overflow-hidden rounded-xl lg:rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white/90 text-xs lg:text-sm font-medium shadow-xl hover:shadow-2xl transition-all duration-300">
                      {typeof content === 'string' && content.startsWith('http') ? (
                        <>
                          <div
                            className="absolute inset-0 bg-cover bg-center opacity-80"
                            style={{
                              backgroundImage: `url(${content})`,
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-white/10" />
                        </>
                      ) : (
                        <div className="p-2 lg:p-4 text-center z-10 flex items-center justify-center h-full">{content}</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default GridMotion 