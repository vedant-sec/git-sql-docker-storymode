/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        palette: {
          dark: '#1C0228',
          darker: '#13011b',
          surface: '#240632',
          surfaceAlt: '#2d093e',
          border: '#45105b',
          borderLight: '#5c1779',
          wine: '#881E3F',
          crimson: '#BF2D42',
          coral: '#F0593F',
          coralHover: '#f67059',
          text: '#fdedea',
          textMuted: '#b98f9c'
        },
        cyber: {
          bg: '#1C0228',
          panel: '#240632',
          border: '#45105b',
          accent: '#F0593F',
          terminal: '#14011d',
          green: '#10b981',
          amber: '#F0593F',
          red: '#BF2D42',
          purple: '#881E3F',
          cyan: '#F0593F'
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Menlo', 'Monaco', 'Consolas', '"Courier New"', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
