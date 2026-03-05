/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#FFFFFF',
        'text-secondary': '#6d9480',
        'text-muted': '#9db8ab',
        verde: {
          50: '#e7edea',
          100: '#cedbd5',
          200: '#9db8ab',
          300: '#6d9480',
          400: '#3c7156',
          500: '#0B4D2C',
          600: '#082B1A',
          700: '#082B1A',
          800: '#0A2416',
          900: '#081d12',
        },
        cream: {
          50: '#FDFBF7',
          100: '#FAF6F0',
          200: '#F2ECDF',
          300: '#E8E1D0',
        },
        gold: {
          50: '#FDF8EC',
          100: '#FAF0D4',
          200: '#F5E5B3',
          400: '#d4b970',
          500: '#C9A84C',
          600: '#B8943D',
          700: '#9A7A2E',
        },
        terracotta: {
          500: '#C75B39',
        },
        background: '#FAF6F0',
      },
      fontFamily: {
        heading: ['Cormorant Garamond', 'Georgia', 'Times New Roman', 'serif'],
        body: ['DM Sans', 'Helvetica Neue', 'Arial', 'sans-serif'],
        data: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        tropical: '0 4px 24px rgba(0, 0, 0, 0.06)',
        card: '0 1px 8px rgba(0, 0, 0, 0.04)',
        elevated: '0 8px 40px rgba(0, 0, 0, 0.08)',
      },
      borderRadius: {
        organic: '2rem',
      },
    },
  },
  plugins: [],
};
