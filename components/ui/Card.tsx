import { ReactNode } from 'react'
import Image from 'next/image'

interface CardProps {
  title: string
  description?: string
  imageUrl?: string
  link?: string
  children?: ReactNode
  className?: string
}

export function Card({ 
  title, 
  description, 
  imageUrl, 
  link, 
  children,
  className = ''
}: CardProps) {
  const CardWrapper = link ? 'a' : 'div'
  const props = link ? { href: link } : {}

  return (
    <CardWrapper
      {...props}
      className={`group rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900 ${className}`}
    >
      {imageUrl && (
        <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-6">
        <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        {description && (
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            {description}
          </p>
        )}
        {children}
      </div>
    </CardWrapper>
  )
} 