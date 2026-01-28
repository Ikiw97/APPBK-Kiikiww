/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './styles/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        accent: '#ec4899',
        dark: '#1f2937',
        light: '#f9fafb',
      },
      animation: {
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'slide-right': 'slide-right 0.3s ease-out forwards',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-5deg)' },
          '50%': { transform: 'rotate(5deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'slide-right': {
          'from': { transform: 'translateX(0)' },
          'to': { transform: 'translateX(5px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.1)', filter: 'brightness(1.2)' },
        },
      },
    },
  },
  plugins: [],
}
