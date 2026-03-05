/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        verde: {
          50: '#F0F9F4',
          100: '#D4EDDC',
          200: '#A3D9B6',
          300: '#6BBF8A',
          400: '#2D8B5A',
          500: '#0B4D2C',
          600: '#0A3622',
          700: '#082B1A',
          800: '#0A2416',
          900: '#061A0F',
        },
        cream: {
          50: '#FFFDF9',
          100: '#FAF6F0',
          200: '#F2ECDF',
          300: '#E8E1D0',
          400: '#D9CEB5',
        },
        gold: {
          300: '#E0C872',
          400: '#D4B84A',
          500: '#C9A84C',
          600: '#B8943D',
          700: '#9A7B2F',
        },
        terracotta: {
          300: '#D4886A',
          400: '#C47252',
          500: '#B85C3A',
          600: '#9E4A2E',
        },
        primary: '#0B4D2C',
        accent: '#C9A84C',
        background: '#FAF6F0',
        surface: '#FFFFFF',
        'text-primary': '#0A2416',
        'text-secondary': '#3A5A3F',
        'text-muted': '#6B8A72',
      },
      fontFamily: {
        heading: ['"Cormorant Garamond"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        data: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        organic: '2rem',
      },
      boxShadow: {
        tropical: '0 4px 30px rgba(10, 54, 34, 0.08)',
        card: '0 2px 20px rgba(10, 54, 34, 0.06)',
        elevated: '0 8px 40px rgba(10, 54, 34, 0.12)',
      },
    },
  },
  plugins: [],
}
