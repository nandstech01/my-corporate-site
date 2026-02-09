'use client'

import { motion } from 'framer-motion'
import { SERVICE_CONFIGS, SERVICE_TYPES } from '@/lib/services/config'
import type { ServiceType } from '@/lib/services/types'

interface ServiceTabsProps {
  selected: ServiceType
  onSelect: (service: ServiceType) => void
}

export default function ServiceTabs({ selected, onSelect }: ServiceTabsProps) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-2xl bg-white/10 backdrop-blur-sm p-1.5 border border-white/10">
      {SERVICE_TYPES.map((serviceType) => {
        const config = SERVICE_CONFIGS[serviceType]
        const Icon = config.icon
        const isActive = selected === serviceType

        return (
          <button
            key={serviceType}
            type="button"
            onClick={() => onSelect(serviceType)}
            className={`relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
              isActive
                ? 'bg-white text-sdlp-primary shadow-sm'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="service-tab-indicator"
                className="absolute inset-0 rounded-xl bg-white shadow-sm"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{config.nameJa}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
