'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from './ThemeContext'

/**
 * VectorLinkBackground
 * プレミアム・ミニマルな背景アニメーション
 * ダークモード: 極めて控えめな光の粒子とサブトルなコネクション
 * ライトモード: 非表示（白背景のみ）
 */

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  pulseSpeed: number
  pulseOffset: number
}

interface VectorLinkBackgroundProps {
  particleCount?: number
  connectionDistance?: number
}

export default function VectorLinkBackground({
  particleCount = 60,
  connectionDistance = 120
}: VectorLinkBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const particlesRef = useRef<Particle[]>([])
  const timeRef = useRef(0)
  
  let theme = 'dark'
  try {
    const themeContext = useTheme()
    theme = themeContext.theme
  } catch {
    // ThemeProviderの外で使用される場合
  }

  useEffect(() => {
    // ライトモードでは非表示
    if (theme === 'light') return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Canvas サイズ設定
    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    // パーティクル初期化
    if (particlesRef.current.length === 0) {
      particlesRef.current = Array.from({ length: particleCount }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.15, // 非常にゆっくり
        vy: (Math.random() - 0.5) * 0.15,
        size: Math.random() * 1.2 + 0.3, // 極めて小さい
        opacity: Math.random() * 0.4 + 0.1, // 控えめ
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseOffset: Math.random() * Math.PI * 2
      }))
    }

    const particles = particlesRef.current

    // アニメーションループ
    const animate = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      timeRef.current += 0.016 // 約60fps

      ctx.clearRect(0, 0, width, height)

      // パーティクル更新
      particles.forEach(particle => {
        particle.x += particle.vx
        particle.y += particle.vy

        // 境界で反射
        if (particle.x < 0 || particle.x > width) particle.vx *= -1
        if (particle.y < 0 || particle.y > height) particle.vy *= -1

        // 範囲内に収める
        particle.x = Math.max(0, Math.min(width, particle.x))
        particle.y = Math.max(0, Math.min(height, particle.y))
      })

      // コネクション描画（非常に控えめ）
      ctx.lineWidth = 0.3
      particles.forEach((particleA, i) => {
        particles.slice(i + 1).forEach(particleB => {
          const dx = particleA.x - particleB.x
          const dy = particleA.y - particleB.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          
          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.08 // 極めて薄い
            
            // モノクロームブルー（控えめ）
            ctx.beginPath()
            ctx.moveTo(particleA.x, particleA.y)
            ctx.lineTo(particleB.x, particleB.y)
            ctx.strokeStyle = `rgba(100, 150, 200, ${alpha})`
            ctx.stroke()
          }
        })
      })

      // パーティクル描画
      particles.forEach(particle => {
        // パルスアニメーション
        const pulse = Math.sin(timeRef.current * particle.pulseSpeed + particle.pulseOffset)
        const currentOpacity = particle.opacity * (0.7 + pulse * 0.3)
        const currentSize = particle.size * (0.9 + pulse * 0.1)

        // サブトルなグロー
        const glowRadius = currentSize * 6
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, glowRadius
        )
        gradient.addColorStop(0, `rgba(140, 180, 220, ${currentOpacity * 0.5})`)
        gradient.addColorStop(0.5, `rgba(100, 150, 200, ${currentOpacity * 0.15})`)
        gradient.addColorStop(1, 'transparent')
        
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, glowRadius, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // コアパーティクル（極めて小さく白っぽい）
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, currentSize, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200, 220, 240, ${currentOpacity})`
        ctx.fill()
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [particleCount, connectionDistance, theme])

  // ライトモードでは非表示
  if (theme === 'light') {
    return null
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ 
        opacity: 0.6,
        mixBlendMode: 'screen'
      }}
      aria-hidden="true"
    />
  )
}
