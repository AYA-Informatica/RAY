/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#E8390E', dark: '#C42E08', light: '#FF5A33' },
        surface: { DEFAULT: '#1A1A1A', card: '#242424', modal: '#2C2C2C' },
        background: { DEFAULT: '#0E0E0E', alt: '#F5F5F5' },
        navy: { DEFAULT: '#1B2B5E', light: '#243578' },
        sidebar: { DEFAULT: '#141414', hover: '#1E1E1E', active: '#242424' },
        text: {
          primary: '#FFFFFF', secondary: '#A0A0A0',
          muted: '#666666', dark: '#111111',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        border: { DEFAULT: '#2E2E2E', light: '#E5E7EB' },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Syne', 'DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
