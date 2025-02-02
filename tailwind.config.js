/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e3f2f9',
          100: '#c5e4f3',
          // ... 他のカラーも必要に応じて
        }
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            p: {
              color: '#374151',
            },
            h1: {
              color: '#111827',
            },
            h2: {
              color: '#111827',
            },
            h3: {
              color: '#111827',
            },
            a: {
              color: '#2563eb',
              '&:hover': {
                color: '#1d4ed8',
              },
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // フォーム要素のスタイリング
    require('@tailwindcss/typography'), // プロースタイリング
    require('@tailwindcss/aspect-ratio'), // アスペクト比の制御
  ],
}