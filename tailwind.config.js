/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'border-blue-500',
    'bg-blue-500',
    'text-blue-600',
    'border-cyan-500',
    'bg-cyan-500',
    'text-cyan-600',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // CLAVI Design System
        'sdlp': {
          primary: '#4389F9',
          'primary-hover': '#1D4ED8',
          accent: '#06B6D4',
          'accent-hover': '#0891B2',
          bg: '#FFFFFF',
          'bg-card': '#F8FAFC',
          text: '#0F172A',
          'text-secondary': '#475569',
          border: '#E2E8F0',
          'footer-bg': '#0F172A',
        },
        'clavi': {
          primary: '#2563EB',
          'primary-hover': '#1D4ED8',
          'primary-light': '#DBEAFE',
          secondary: '#06B6D4',
          'secondary-hover': '#0891B2',
          'secondary-light': '#CFFAFE',
          accent: '#1E3A8A',
          'accent-light': '#1E40AF',
          navy: '#0F172A',
          'bg-light': '#F8FAFC',
          'bg-card': '#FFFFFF',
          'bg-dark': '#0F172A',
          'bg-dark-card': '#1E293B',
          'text-primary': '#0F172A',
          'text-secondary': '#475569',
          'text-muted': '#94A3B8',
          'border-light': '#E2E8F0',
          'border-dark': '#334155',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#1E40AF',
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'SF Mono', 'Monaco', 'Consolas', 'monospace'],
        'sans': ['Inter', 'Noto Sans JP', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'blob': 'blob 7s infinite',
        'pulse': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'vector-rotate': 'vectorRotate 60s linear infinite',
        'node-pulse': 'nodePulse 3s ease-in-out infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
      },
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
        vectorRotate: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        nodePulse: {
          "0%, 100%": { 
            opacity: "0.5",
            transform: "scale(1)",
          },
          "50%": { 
            opacity: "1",
            transform: "scale(1.1)",
          },
        },
        gradientShift: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      animationDelay: {
        '2000': '2s',
        '4000': '4s',
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
        invert: {
          css: {
            '--tw-prose-body': '#d1d5db',
            '--tw-prose-headings': '#f9fafb',
            '--tw-prose-lead': '#9ca3af',
            '--tw-prose-links': '#60a5fa',
            '--tw-prose-bold': '#f9fafb',
            '--tw-prose-counters': '#d1d5db',
            '--tw-prose-bullets': '#d1d5db',
            '--tw-prose-hr': '#374151',
            '--tw-prose-quotes': '#f3f4f6',
            '--tw-prose-quote-borders': '#374151',
            '--tw-prose-captions': '#9ca3af',
            '--tw-prose-code': '#f9fafb',
            '--tw-prose-pre-code': '#d1d5db',
            '--tw-prose-pre-bg': '#1f2937',
            '--tw-prose-th-borders': '#374151',
            '--tw-prose-td-borders': '#4b5563',
            color: '#d1d5db',
            p: {
              color: 'var(--tw-prose-body)',
            },
            h1: {
              color: 'var(--tw-prose-headings)',
            },
            h2: {
              color: 'var(--tw-prose-headings)',
            },
            h3: {
              color: 'var(--tw-prose-headings)',
            },
            h4: {
              color: 'var(--tw-prose-headings)',
            },
            h5: {
              color: 'var(--tw-prose-headings)',
            },
            h6: {
              color: 'var(--tw-prose-headings)',
            },
            strong: {
              color: 'var(--tw-prose-bold)',
            },
            b: {
              color: 'var(--tw-prose-bold)',
            },
            em: {
              color: 'var(--tw-prose-body)',
            },
            a: {
              color: 'var(--tw-prose-links)',
              '&:hover': {
                color: '#3b82f6',
              },
            },
            code: {
              color: 'var(--tw-prose-code)',
            },
            'ol > li': {
              color: 'var(--tw-prose-body)',
            },
            'ul > li': {
              color: 'var(--tw-prose-body)',
            },
            'ol > li::marker': {
              color: 'var(--tw-prose-counters)',
            },
            'ul > li::marker': {
              color: 'var(--tw-prose-bullets)',
            },
            li: {
              color: 'var(--tw-prose-body)',
            },
            'li::marker': {
              color: 'var(--tw-prose-counters)',
            },
            blockquote: {
              color: 'var(--tw-prose-quotes)',
              borderLeftColor: 'var(--tw-prose-quote-borders)',
            },
            table: {
              color: 'var(--tw-prose-body)',
            },
            thead: {
              color: 'var(--tw-prose-headings)',
            },
            'thead th': {
              color: 'var(--tw-prose-headings)',
            },
            'tbody td': {
              color: 'var(--tw-prose-body)',
            },
            figcaption: {
              color: 'var(--tw-prose-captions)',
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
    require("tailwindcss-animate"),
  ],
  // Temporary comment to trigger rebuild
}