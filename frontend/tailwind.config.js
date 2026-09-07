/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: {
          darkest: 'var(--bg-base, #0A0A0B)',
          surface: 'var(--bg-surface, #101111)',
          card: 'var(--bg-card, #121314)',
          hover: 'var(--bg-hover, #17181A)'
        },
        brand: {
          DEFAULT: 'var(--accent-primary, #22E06B)',
          secondary: '#2ECC71',
          dim: 'rgba(34, 224, 107, 0.12)',
          border: 'rgba(34, 224, 107, 0.4)'
        },
        text: {
          primary: 'var(--text-primary, #F5F5F5)',
          secondary: 'var(--text-secondary, #8B8F8C)',
          muted: '#9CA3AF'
        },
        border: {
          hairline: 'var(--border-hairline, rgba(255, 255, 255, 0.08))',
          subtle: 'rgba(255, 255, 255, 0.12)'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      letterSpacing: {
        'widest-plus': '0.22em'
      }
    },
  },
  plugins: [],
}
