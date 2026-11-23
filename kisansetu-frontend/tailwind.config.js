/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#FBF7F0',
          100: '#F4EDE0',
          200: '#E8DCC6',
        },
        clay: {
          100: '#F6E1D6',
          500: '#B5532A',
          600: '#9A4422',
        },
        indigo: {
          100: '#E0E7FF',
          500: '#6366F1',
          700: '#3730A3',
          900: '#1E1B4B',
        },
        saffron: {
          100: '#FDF0D5',
          400: '#E9A23B',
        },
        sage: {
          100: '#E3EFE6',
          600: '#4D7A5A',
        },
        rust: {
          100: '#FBE4E1',
          600: '#B42318',
        },
        ochre: {
          100: '#FBEFD9',
          600: '#B7791F',
        },
        'ink-muted': '#6B6558',
        semantic: {
          success: '#4D7A5A',
          'success-bg': '#E3EFE6',
          warning: '#B7791F',
          'warning-bg': '#FBEFD9',
          danger: '#B42318',
          'danger-bg': '#FBE4E1',
          info: '#1E1B4B',
          'info-bg': '#E0E7FF',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        serif: ['var(--font-serif)', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
        fraunces: ['Fraunces', 'serif'],
        tiro: ['"Tiro Devanagari Hindi"', 'serif'],
        manrope: ['Manrope', 'sans-serif'],
        hind: ['Hind', 'sans-serif'],
      },
      fontSize: {
        caption: ['0.75rem', { lineHeight: '1rem' }],
        secondary: ['0.875rem', { lineHeight: '1.25rem' }],
        body: ['1rem', { lineHeight: '1.6' }],
        'body-hi': ['1.0625rem', { lineHeight: '1.7' }],
        title: ['1.75rem', { lineHeight: '2.25rem' }],
        'title-lg': ['2.25rem', { lineHeight: '2.5rem' }],
        kpi: ['2rem', { lineHeight: '2.25rem' }],
        'kpi-lg': ['2.5rem', { lineHeight: '2.75rem' }],
      },
      boxShadow: {
        hard: '4px 4px 0 0 #1E1B4B',
        'hard-sm': '2px 2px 0 0 #1E1B4B',
        'hard-lg': '6px 6px 0 0 #1E1B4B',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
      },
      spacing: {
        13: '3.25rem',
        'safe-b': 'env(safe-area-inset-bottom)',
        'safe-t': 'env(safe-area-inset-top)',
      },
      height: {
        13: '3.25rem',
      },
      minHeight: {
        touch: '44px',
        13: '3.25rem',
      },
      minWidth: {
        touch: '44px',
      },
      zIndex: {
        40: '40',
        50: '50',
        55: '55',
        60: '60',
        70: '70',
      },
      ringColor: {
        focus: '#E9A23B',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'none' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(24px)', opacity: '0' },
          '100%': { transform: 'none', opacity: '1' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-24px)', opacity: '0' },
          '100%': { transform: 'none', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-12px)', opacity: '0' },
          '100%': { transform: 'none', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.96)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'stamp-in': {
          '0%': { transform: 'scale(1.35) rotate(-6deg)', opacity: '0' },
          '60%': { transform: 'scale(0.96)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        wave: {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1)' },
        },
        'pulse-once': {
          '0%': { boxShadow: '0 0 0 0 rgba(180,35,24,0.35)' },
          '100%': { boxShadow: '0 0 0 10px rgba(180,35,24,0)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-4px)' },
          '40%, 80%': { transform: 'translateX(4px)' },
        },
        'draw-check': {
          '0%': { strokeDashoffset: '30' },
          '100%': { strokeDashoffset: '0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 400ms ease-out forwards',
        'fade-in': 'fade-in 250ms ease-out forwards',
        'slide-in-right': 'slide-in-right 300ms ease-out forwards',
        'slide-in-left': 'slide-in-left 300ms ease-out forwards',
        'slide-down': 'slide-down 300ms ease-out forwards',
        'scale-in': 'scale-in 220ms ease-out forwards',
        'stamp-in': 'stamp-in 380ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        shimmer: 'shimmer 1.6s linear infinite',
        wave: 'wave 0.9s ease-in-out infinite',
        'pulse-once': 'pulse-once 900ms ease-out 2',
        shake: 'shake 300ms ease-in-out 1',
        'draw-check': 'draw-check 500ms ease-out forwards',
      },
    },
  },
  plugins: [],
};