import { ReactNode } from 'react'
import Image from 'next/image'

interface FeaturedCardProps {
  title: string
  description?: string
  imageUrl?: string
  link?: string
  badge?: string
  children?: ReactNode
  className?: string
}

export function FeaturedCard({ 
  title, 
  description, 
  imageUrl, 
  link,
  badge,
  children,
  className = ''
}: FeaturedCardProps) {
  const CardWrapper = link ? 'a' : 'div'
  const props = link ? { href: link } : {}

  return (
    <CardWrapper
      {...props}
      className={`group relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-gray-50 shadow-lg transition-all hover:shadow-xl dark:from-gray-900 dark:to-gray-800 ${className}`}
    >
      {badge && (
        <div className="absolute right-4 top-4 z-10 rounded-full bg-blue-600 px-4 py-1 text-sm font-semibold text-white">
          {badge}
        </div>
      )}
      {imageUrl && (
        <div className="relative h-64 w-full overflow-hidden">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}
      <div className="p-8">
        <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h3>
        {description && (
          <p className="mb-6 text-lg text-gray-600 dark:text-gray-300">
            {description}
          </p>
        )}
        {children}
      </div>
    </CardWrapper>
  )
} 