import type { Config } from 'tailwindcss'

export default {
  theme: {
    extend: {
      colors: {
        // === Core Wompi Palette ===
        primary: {
          DEFAULT: '#2A2C29',
          text: '#2C2A29',
          light: '#e4ddff',
        },
        secondary: {
          DEFAULT: '#BDF4BC',
          light: '#DFFF61',
          hard: '#00825A',
          soft: '#E5FBE4',
          background: '#F2FDF1',
          text: '#38805B',
        },

        // === Background Colors ===
        surface: {
          primary: '#f9f9f9',
          secondary: '#fff',
          tertiary: '#f1f1f1',
          soft: '#E5E5E5',
        },

        // === Text Colors ===
        content: {
          DEFAULT: '#252525',
          dark: '#0a0a0a',
          light: '#555555',
          lighter: '#999',
          lightest: '#ccc',
        },

        // === Semantic Colors ===
        success: {
          DEFAULT: '#B0F2AE',
          light: '#e8f8ee',
          icon: '#40A940',
        },
        warning: {
          DEFAULT: '#ff9c1b',
          light: '#fff2df',
          icon: '#FFA41C',
        },
        danger: {
          DEFAULT: '#f64d79',
          light: '#FFEBEB',
          icon: '#F03232',
        },
        info: {
          DEFAULT: '#4376ff',
          dark: '#3662d9',
          light: '#d6e1ff',
        },
        voided: {
          DEFAULT: '#409eff',
          light: '#ebf4ff',
        },

        // === Border Colors ===
        border: {
          DEFAULT: '#eee',
          hover: '#B4C8FF',
          input: '#dcdfe6',
        },

        // === Badge Colors ===
        badge: {
          pending: { bg: '#EBF6FE', text: '#27587D', icon: '#44769D' },
          success: { bg: '#E5FBE4', text: '#1A624C', icon: '#40A940' },
          danger: { bg: '#FFEBEB', text: '#A01110', icon: '#F03232' },
          warning: { bg: 'rgba(246, 198, 67, 0.32)', text: '#ff9c1b', icon: '#FFA41C' },
        },

        // === Notification Colors ===
        notify: {
          success: { bg: '#cbe3dc', text: '#1A624C' },
          error: { bg: '#FFEBEB', text: '#A01110' },
          warning: { bg: '#FFF5E2', text: '#534B2C' },
          info: { bg: '#EBF6FE', text: '#27587D' },
        },

        // === Login Extended Palette ===
        'login-primary': {
          900: '#006600', 800: '#339933', 700: '#40A940',
          600: '#72C571', 500: '#B0F2AE', 400: '#BDF4BC',
          300: '#D8F9D7', 200: '#E5FBE4', 100: '#F2FDF1',
        },
        'login-secondaryA': {
          900: '#233C33', 800: '#1A4D3D', 700: '#125F46',
          600: '#097050', 500: '#00825A', 400: '#329A7A',
          300: '#64B29A', 200: '#96CABA', 100: '#C8E2DA',
        },
        'login-secondaryB': {
          900: '#27587D', 800: '#44769D', 700: '#6094BD',
          600: '#7CB3DC', 500: '#99D1FC', 400: '#ADDAFD',
          300: '#C2E3FD', 200: '#D6EDFE', 100: '#EBF6FE',
        },
        'login-tertiary': {
          500: '#DFFF61', 400: '#E5FF81', 300: '#ECFFA0',
          200: '#F2FFC0', 100: '#F9FFDF',
        },
        'login-success': { 500: '#0E8763' },
        'login-warning': { 500: '#F0CE3A' },
        'login-issue': { 500: '#ED0000', 700: '#A01110' },
        'login-gray': {
          700: '#464646', 600: '#616161', 500: '#969696',
          400: '#CACACA', 300: '#E4E4E4', 200: '#F2F2F2',
        },
      },

      fontFamily: {
        sans: ['"Source Sans Pro"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        'open-sans': ['"Open Sans"', 'sans-serif'],
        'cib-bold': ['"CIBFontSans Bold"', 'sans-serif'],
        mono: ['monospace'],
      },

      fontSize: {
        'xs': ['0.625rem', { lineHeight: 'calc(0.625rem + 4px)' }],
        'sm': ['0.75rem', { lineHeight: 'calc(0.75rem + 4px)' }],
        'md': ['0.875rem', { lineHeight: 'calc(0.875rem + 4px)' }],
        'lg': ['1rem', { lineHeight: 'calc(1rem + 4px)' }],
        'xl': ['1.25rem', { lineHeight: 'calc(1.25rem + 4px)' }],
      },

      spacing: {
        'sidebar': '16.3rem',
        'topbar': '6.25rem',
        'sandbox-bar': '3rem',
      },

      maxWidth: {
        'container': '74.25rem',
        'login': '1140px',
      },

      borderRadius: {
        'content': '20px',
        'button': '20px',
        'input': '4px',
        'tag': '4px',
        'modal': '16px',
        'card': '16px',
        'login-image': '32px',
        'login-button': '25px',
      },

      boxShadow: {
        'content': '0px 1px 4px rgba(0, 0, 0, 0.102751)',
        'sidebar': '-0.063rem 0rem 0.375rem 0rem rgba(0,0,0,0.1) inset',
        'login-hover': '0px 1px 3px rgba(0, 0, 0, 0.3), 0px 1px 6px rgba(0, 0, 0, 0.15)',
      },

      screens: {
        'sm': '30rem',
        'md': '48rem',
        'lg': '64rem',
        'xl': '85rem',
      },
    },
  },
} satisfies Partial<Config>
