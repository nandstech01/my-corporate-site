'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface CalendlyBookingProps {
  url: string
  prefill?: { name?: string; email?: string }
  onClose: () => void
}

export default function CalendlyBooking({
  url,
  prefill,
  onClose,
}: CalendlyBookingProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const calendlyUrl = new URL(url)
  if (prefill?.name) calendlyUrl.searchParams.set('name', prefill.name)
  if (prefill?.email) calendlyUrl.searchParams.set('email', prefill.email)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-sdlp-border">
            <h3 className="text-lg font-bold text-sdlp-text">無料相談を予約</h3>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Calendly iframe */}
          <div className="h-[600px]">
            <iframe
              src={calendlyUrl.toString()}
              title="Calendly Booking"
              className="w-full h-full border-0"
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
