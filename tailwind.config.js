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
          black: '#170E0E',
          darkSurface: '#241616',
          border: '#3d1515',
          darkRed: '#8F0E0E',
          scarlet: '#D93E3E',
          scarletHover: '#c02e2e',
          light: '#EFEFEF',
          white: '#FFFFFF',
          textMuted: '#997777'
        },
        cyber: {
          bg: '#170E0E',
          panel: '#241616',
          border: '#3d1515',
          accent: '#D93E3E',
          terminal: '#100909',
          green: '#10b981',
          amber: '#D93E3E',
          red: '#8F0E0E',
          purple: '#8F0E0E',
          cyan: '#D93E3E'
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
