'use client'

import { motion } from 'framer-motion'
import { DURATION, EASE } from '@/lib/motion'

interface ButtonGridProps {
  options: string[]
  selected: string
  onSelect: (value: string) => void
}

export default function ButtonGrid({
  options,
  onSelect,
  selected,
}: ButtonGridProps) {
  const cols =
    options.length <= 3
      ? 'grid-cols-2 sm:grid-cols-3'
      : options.length <= 6
        ? 'grid-cols-2 sm:grid-cols-3'
        : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'

  return (
    <div className={`grid ${cols} gap-3`}>
      {options.map((option) => {
        const isSelected = selected === option
        return (
          <motion.button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            animate={isSelected ? { scale: [0.97, 1] } : {}}
            transition={{ duration: DURATION.fast, ease: EASE }}
            className={`rounded-xl px-4 py-3 text-sm font-medium border-2 transition-all duration-200 ${
              isSelected
                ? 'border-sdlp-primary bg-sdlp-primary/5 text-sdlp-primary shadow-sm shadow-sdlp-primary/10'
                : 'border-sdlp-border bg-white text-sdlp-text hover:border-sdlp-primary/40 hover:bg-sdlp-primary/5'
            }`}
          >
            {option}
          </motion.button>
        )
      })}
    </div>
  )
}
