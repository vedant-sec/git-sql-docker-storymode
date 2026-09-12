/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          sidebarBg: 'var(--color-sidebar-bg)',
          sidebarSurface: 'var(--color-sidebar-surface)',
          sidebarBorder: 'var(--color-sidebar-border)',
          canvasBg: 'var(--color-canvas-bg)',
          cardBg: 'var(--color-card-bg)',
          cardBorder: 'var(--color-card-border)',
          cardCallout: 'var(--color-card-callout)',
          onyx: 'var(--color-onyx)',
          terminalInner: 'var(--color-terminal-inner)',
          terminalToolbar: 'var(--color-terminal-toolbar)',
          darkSurface: 'var(--color-dark-surface)',
          darkSurfaceHover: 'var(--color-dark-surface-hover)',
          darkBorder: 'var(--color-dark-border)',
          darkBorderSubtle: 'var(--color-dark-border-subtle)',
          bloodRed: 'var(--color-blood-red)',
          bloodRedHover: 'var(--color-blood-red-hover)',
          scarlet: 'var(--color-scarlet)',
          scarletHover: 'var(--color-scarlet-hover)',
          textDark: 'var(--color-text-dark)',
          textSubtle: 'var(--color-text-subtle)',
          textLight: 'var(--color-text-light)',
          textMuted: 'var(--color-text-muted)',
          textPlaceholder: 'var(--color-text-placeholder)',
          white: 'var(--color-white)',
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
