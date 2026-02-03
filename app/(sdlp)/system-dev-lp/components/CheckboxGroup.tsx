'use client'

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
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium border-2 transition-all text-left ${
              isChecked
                ? 'border-sdlp-primary bg-sdlp-primary/5 text-sdlp-primary shadow-sm'
                : 'border-sdlp-border bg-white text-sdlp-text hover:border-sdlp-primary/40'
            }`}
          >
            <div
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                isChecked
                  ? 'border-sdlp-primary bg-sdlp-primary'
                  : 'border-gray-300'
              }`}
            >
              {isChecked && (
                <svg
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
                </svg>
              )}
            </div>
            {option}
          </button>
        )
      })}
    </div>
  )
}
