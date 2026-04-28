/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // RAY Brand Palette (extracted from wireframes)
        primary: {
          DEFAULT: '#E8390E',   // RAY orange-red
          dark: '#C42E08',      // hover/active
          light: '#FF5A33',     // lighter tint
        },
        surface: {
          DEFAULT: '#1A1A1A',   // dark card bg
          card: '#242424',      // listing card
          modal: '#2C2C2C',     // modals/sheets
        },
        background: {
          DEFAULT: '#111111',   // main page bg
          alt: '#F5F5F5',       // light mode bg
        },
        navy: {
          DEFAULT: '#1B2B5E',   // premium banner
          light: '#243578',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A0A0A0',
          muted: '#666666',
          dark: '#111111',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        border: {
          DEFAULT: '#2E2E2E',
          light: '#E5E7EB',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Syne', 'DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'card': '0 2px 12px rgba(0,0,0,0.3)',
        'card-hover': '0 8px 32px rgba(232,57,14,0.2)',
        'nav': '0 1px 0 rgba(255,255,255,0.05)',
        'primary': '0 4px 24px rgba(232,57,14,0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'skeleton': 'skeleton 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        skeleton: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      })
    },
  ],
}
