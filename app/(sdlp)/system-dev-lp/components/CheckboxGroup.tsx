'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { DURATION, EASE } from '@/lib/motion'

interface CheckboxGroupProps {
  options: string[]
  selected: string[]
  onToggle: (value: string) => void
}

export default function CheckboxGroup({
  options,
  selected,
  onToggle,
}: CheckboxGroupProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {options.map((option) => {
        const isChecked = selected.includes(option)
        return (
          <motion.button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: DURATION.fast, ease: EASE }}
            className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium border-2 transition-all duration-200 text-left ${
              isChecked
                ? 'border-sdlp-primary bg-sdlp-primary/5 text-sdlp-primary shadow-sm shadow-sdlp-primary/10'
                : 'border-sdlp-border bg-white text-sdlp-text hover:border-sdlp-primary/40'
            }`}
          >
            <div
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors duration-200 ${
                isChecked
                  ? 'border-sdlp-primary bg-sdlp-primary'
                  : 'border-sdlp-border'
              }`}
            >
              <AnimatePresence>
                {isChecked && (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="h-3 w-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </motion.svg>
                )}
              </AnimatePresence>
            </div>
            {option}
          </motion.button>
        )
      })}
    </div>
  )
}
