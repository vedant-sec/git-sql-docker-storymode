import { themeColors } from './src/theme/colors.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: themeColors
      },
      fontFamily: {
        mono: ['"Fira Code"', '"JetBrains Mono"', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        typewriter: ['"Special Elite"', '"Courier Prime"', 'Courier', 'monospace'],
        report: ['"Courier Prime"', 'Courier', 'monospace'],
        handwriting: ['"Caveat"', 'cursive'],
      }
    },
  },
  plugins: [],
}
