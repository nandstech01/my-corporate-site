'use client'

interface ButtonGridProps {
  options: string[]
  selected: string
  onSelect: (value: string) => void
}

export default function ButtonGrid({
  options,
  selected,
  onSelect,
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
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={`rounded-xl px-4 py-3 text-sm font-medium border-2 transition-all ${
              isSelected
                ? 'border-sdlp-primary bg-sdlp-primary/5 text-sdlp-primary shadow-sm'
                : 'border-sdlp-border bg-white text-sdlp-text hover:border-sdlp-primary/40 hover:bg-sdlp-primary/5'
            }`}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}
