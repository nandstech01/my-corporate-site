'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function SDLPStickyCTA() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past ~600px (hero section height)
      setVisible(window.scrollY > 600)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
        >
          <div className="bg-white/95 backdrop-blur-sm border-t border-sdlp-border px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
            <Link
              href="/system-dev-lp/questionnaire"
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-sdlp-primary px-6 py-3.5 text-sm font-bold text-white hover:bg-sdlp-primary-hover transition-colors shadow-md shadow-sdlp-primary/20"
            >
              無料シミュレーション
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
