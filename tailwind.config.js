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
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // フォーム要素のスタイリング
  ],
}