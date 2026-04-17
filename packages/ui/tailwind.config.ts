import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.vue',
  ],
  theme: {
    extend: {
      colors: {
        wompi: {
          pink: '#E6007E',
          dark: '#1A1A2E',
          success: '#00C853',
          warning: '#FFB300',
          error: '#FF1744',
          info: '#2979FF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
} satisfies Config
